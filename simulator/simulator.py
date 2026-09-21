import time
import random
import requests

API = "http://127.0.0.1:8000/api/events"


def send(event):
    try:
        response = requests.post(
            API,
            json=event,
            timeout=5
        )

        print(response.status_code, response.json())

    except requests.RequestException as exc:
        print(f"Simulator error: {exc}")


def base(ip):
    return {
        "source_ip": ip,
        "destination_ip": "192.168.56.20",
        "source_port": random.randint(40000, 60000),
        "destination_port": 443,
        "protocol": "TCP",
        "packet_count": 40,
        "byte_count": 24000,
        "event_type": "NETWORK",
        "failed_logins": 0,
        "metadata": {
            "unique_ports": 2,
            "request_rate": 7
        }
    }


def normal():
    send(
        base("192.168.56.10")
    )


def port_scan():
    event = base("192.168.56.25")

    event.update(
        event_type="PORT_SCAN",
        packet_count=100,
        metadata={
            "unique_ports": 30,
            "request_rate": 25
        }
    )

    send(event)


def brute_force():
    event = base("192.168.56.30")

    event.update(
        event_type="BRUTE_FORCE",
        failed_logins=25,
        destination_port=22,
        metadata={
            "unique_ports": 1,
            "request_rate": 20
        }
    )

    send(event)


def anomaly():
    """
    ML-only anomaly scenario.

    Important:
    unique_ports must stay below the PORT_SCAN
    signature threshold while the traffic volume,
    packet count, byte count and request rate remain
    highly anomalous.
    """

    event = base("192.168.56.40")

    event.update(
        packet_count=2500,
        byte_count=3500000,
        metadata={
            "unique_ports": 5,
            "request_rate": 600
        }
    )

    send(event)


def suspicious_http():
    event = base("192.168.56.50")

    event.update(
        event_type="SUSPICIOUS_HTTP",
        destination_port=80,
        metadata={
            "unique_ports": 1,
            "request_rate": 15
        }
    )

    send(event)


if __name__ == "__main__":

    print(
        "1 Normal  "
        "2 Port Scan  "
        "3 Brute Force  "
        "4 Anomaly  "
        "5 Suspicious HTTP  "
        "6 Demo Sequence"
    )

    choice = input("Select: ").strip()

    actions = {
        "1": normal,
        "2": port_scan,
        "3": brute_force,
        "4": anomaly,
        "5": suspicious_http
    }

    if choice in actions:

        actions[choice]()

    elif choice == "6":

        for function in [
            normal,
            normal,
            port_scan,
            brute_force,
            anomaly,
            suspicious_http
        ]:
            function()
            time.sleep(0.5)

    else:

        print("Invalid selection")