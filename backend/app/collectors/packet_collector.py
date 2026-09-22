# Optional lab packet collector adapter.
# The core demo uses normalized events and does not require live sniffing.
from scapy.all import sniff, IP, TCP, UDP

class PacketFeatureCollector:
    def handle_packet(self, packet):
        if IP not in packet:
            return None
        protocol = "TCP" if TCP in packet else "UDP" if UDP in packet else "IP"
        dport = packet.dport if (TCP in packet or UDP in packet) else None
        return {"source_ip":packet[IP].src,"destination_ip":packet[IP].dst,
                "destination_port":dport,"protocol":protocol,"packet_count":1,
                "byte_count":len(packet),"metadata":{}}

    def capture(self, count=20, timeout=10):
        return sniff(prn=self.handle_packet, count=count, timeout=timeout)
