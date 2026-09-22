import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Server,
  Radio,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  X,
  Search,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/* =========================================================
   INDIA STANDARD TIME FORMATTER
========================================================= */

function formatIST(value, options = {}) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    ...options,
  });
}

/* =========================================================
   STAT CARD
========================================================= */

function Stat({ icon: Icon, label, value, cls = "" }) {
  return (
    <div className="card stat">
      <div className={"stat-icon " + cls}>
        <Icon size={20} />
      </div>

      <div>
        <div className="muted">{label}</div>
        <div className="value">{value}</div>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const normalized = String(status || "OPEN").toLowerCase();

  return (
    <span className={"status-badge " + normalized}>
      {status || "OPEN"}
    </span>
  );
}

/* =========================================================
   SEVERITY BADGE
========================================================= */

function SeverityBadge({ severity }) {
  const normalized = String(severity || "LOW").toLowerCase();

  return (
    <span className={"badge " + normalized}>
      {severity || "LOW"}
    </span>
  );
}

/* =========================================================
   FORMAT VALUES
========================================================= */

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

/* =========================================================
   FORMAT LABELS
========================================================= */

function formatLabel(key) {
  return String(key)
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/* =========================================================
   ALERT DETAIL FIELD
========================================================= */

function DetailField({ label, value, mono = false }) {
  return (
    <div className="detail-field">
      <span className="detail-label">{label}</span>

      <span className={"detail-value " + (mono ? "mono" : "")}>
        {formatValue(value)}
      </span>
    </div>
  );
}

/* =========================================================
   ALERT INVESTIGATION MODAL
========================================================= */

function AlertDetails({ alert, onClose }) {
  if (!alert) return null;

  const preferredFields = [
    "id",
    "event_id",
    "threat_type",
    "severity",
    "risk_score",
    "risk_level",
    "status",
    "rule_id",
    "source_ip",
    "destination_ip",
    "source_port",
    "destination_port",
    "protocol",
    "created_at",
    "timestamp",
    "description",
    "message",
    "signature_detection",
    "anomaly_detection",
    "is_anomaly",
    "anomaly_score",
    "decision_score",
  ];

  const displayedKeys = new Set();

  const availablePreferredFields = preferredFields.filter((key) => {
    if (
      Object.prototype.hasOwnProperty.call(alert, key) &&
      alert[key] !== undefined &&
      alert[key] !== null
    ) {
      displayedKeys.add(key);
      return true;
    }

    return false;
  });

  const additionalFields = Object.keys(alert).filter(
    (key) => !displayedKeys.has(key)
  );

  return (
    <div
      className="details-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="details-modal">
        {/* HEADER */}

        <div className="details-header">
          <div>
            <div className="eyebrow">SECURITY INVESTIGATION</div>

            <h2>
              Alert #{alert.id ?? "—"}
            </h2>

            <p>
              Detailed information returned by the hybrid detection engine
            </p>
          </div>

          <button
            className="details-close"
            onClick={onClose}
            title="Close details"
          >
            <X size={20} />
          </button>
        </div>

        {/* SUMMARY */}

        <div className="details-summary">
          <div className="details-summary-card">
            <span>Threat</span>
            <strong>{alert.threat_type || "—"}</strong>
          </div>

          <div className="details-summary-card">
            <span>Severity</span>
            <SeverityBadge severity={alert.severity} />
          </div>

          <div className="details-summary-card">
            <span>Risk</span>
            <strong>
              {alert.risk_score !== undefined
                ? `${alert.risk_score}/100`
                : "—"}
            </strong>
          </div>

          <div className="details-summary-card">
            <span>Status</span>
            <StatusBadge status={alert.status} />
          </div>
        </div>

        {/* DETECTION INFORMATION */}

        <section className="details-section">
          <div className="details-section-title">
            <ShieldCheck size={17} />
            Detection Information
          </div>

          <div className="details-grid">
            {availablePreferredFields
              .filter((key) =>
                [
                  "id",
                  "event_id",
                  "threat_type",
                  "severity",
                  "risk_score",
                  "risk_level",
                  "status",
                  "rule_id",
                  "description",
                  "message",
                ].includes(key)
              )
              .map((key) => (
                <DetailField
                  key={key}
                  label={formatLabel(key)}
                  value={alert[key]}
                  mono={key === "rule_id"}
                />
              ))}
          </div>
        </section>

        {/* NETWORK INFORMATION */}

        <section className="details-section">
          <div className="details-section-title">
            <Server size={17} />
            Network Information
          </div>

          <div className="details-grid">
            {availablePreferredFields
              .filter((key) =>
                [
                  "source_ip",
                  "destination_ip",
                  "source_port",
                  "destination_port",
                  "protocol",
                ].includes(key)
              )
              .map((key) => (
                <DetailField
                  key={key}
                  label={formatLabel(key)}
                  value={alert[key]}
                  mono={
                    key.includes("ip") ||
                    key.includes("port") ||
                    key === "protocol"
                  }
                />
              ))}
          </div>

          {!availablePreferredFields.some((key) =>
            [
              "source_ip",
              "destination_ip",
              "source_port",
              "destination_port",
              "protocol",
            ].includes(key)
          ) && (
            <div className="details-empty">
              Network-specific fields were not returned for this alert.
            </div>
          )}
        </section>

        {/* ML INFORMATION */}

        <section className="details-section">
          <div className="details-section-title">
            <Activity size={17} />
            Machine Learning Detection
          </div>

          <div className="details-grid">
            {availablePreferredFields
              .filter((key) =>
                [
                  "signature_detection",
                  "anomaly_detection",
                  "is_anomaly",
                  "anomaly_score",
                  "decision_score",
                ].includes(key)
              )
              .map((key) => (
                <DetailField
                  key={key}
                  label={formatLabel(key)}
                  value={alert[key]}
                />
              ))}
          </div>

          {!availablePreferredFields.some((key) =>
            [
              "signature_detection",
              "anomaly_detection",
              "is_anomaly",
              "anomaly_score",
              "decision_score",
            ].includes(key)
          ) && (
            <div className="details-empty">
              ML-specific fields were not returned for this alert.
            </div>
          )}
        </section>

        {/* TIMESTAMP */}

        {(alert.created_at || alert.timestamp) && (
          <section className="details-section">
            <div className="details-section-title">
              <Radio size={17} />
              Event Timing
            </div>

            <div className="details-grid">
              {alert.created_at && (
                <DetailField
                  label="Alert Created"
                  value={formatIST(alert.created_at)}
                />
              )}

              {alert.timestamp && (
                <DetailField
                  label="Event Timestamp"
                  value={formatIST(alert.timestamp)}
                />
              )}
            </div>
          </section>
        )}

        {/* ADDITIONAL BACKEND FIELDS */}

        {additionalFields.length > 0 && (
          <section className="details-section">
            <div className="details-section-title">
              <Search size={17} />
              Additional Event Data
            </div>

            <div className="details-grid">
              {additionalFields.map((key) => (
                <DetailField
                  key={key}
                  label={formatLabel(key)}
                  value={alert[key]}
                />
              ))}
            </div>
          </section>
        )}

        {/* FOOTER */}

        <div className="details-footer">
          <span>
            Alert data shown directly from the IDS API response.
          </span>

          <button
            className="details-close-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN APPLICATION
========================================================= */

export default function App() {
  const [s, setS] = useState(null);
  const [a, setA] = useState([]);
  const [e, setE] = useState([]);

  const [live, setLive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [updatingAlert, setUpdatingAlert] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const [error, setError] = useState("");

  /* =======================================================
     REFRESH DASHBOARD
  ======================================================= */

  async function refresh(showLoading = false) {
    try {
      if (showLoading) {
        setRefreshing(true);
      }

      setError("");

      const [
        summaryResponse,
        alertsResponse,
        eventsResponse,
      ] = await Promise.all([
        fetch(API + "/api/dashboard/summary"),
        fetch(API + "/api/alerts?limit=20"),
        fetch(API + "/api/dashboard/events?limit=30"),
      ]);

      if (
        !summaryResponse.ok ||
        !alertsResponse.ok ||
        !eventsResponse.ok
      ) {
        throw new Error("Failed to load dashboard data");
      }

      const [
        summary,
        alerts,
        events,
      ] = await Promise.all([
        summaryResponse.json(),
        alertsResponse.json(),
        eventsResponse.json(),
      ]);

      setS(summary);
      setA(alerts);
      setE(events);
    } catch (err) {
      console.error("Dashboard refresh error:", err);

      setError(
        "Unable to connect to the backend API."
      );
    } finally {
      setRefreshing(false);
    }
  }

  /* =======================================================
     UPDATE ALERT STATUS
  ======================================================= */

  async function updateAlertStatus(alertId, status) {
    try {
      setUpdatingAlert(alertId);
      setError("");

      const response = await fetch(
        `${API}/api/alerts/${alertId}/status?status=${status}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update alert ${alertId}`
        );
      }

      await refresh(false);

      /*
       * Keep investigation panel synchronized if
       * the user changes the status while viewing it.
       */
      setSelectedAlert((current) => {
        if (!current || current.id !== alertId) {
          return current;
        }

        return {
          ...current,
          status,
        };
      });
    } catch (err) {
      console.error(
        "Alert status update error:",
        err
      );

      setError(
        `Unable to update alert #${alertId}. Please try again.`
      );
    } finally {
      setUpdatingAlert(null);
    }
  }

  /* =======================================================
     WEBSOCKET
  ======================================================= */

  useEffect(() => {
    refresh();

    const wsUrl =
      API.replace(/^http/, "ws") +
      "/ws/alerts";

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setLive(true);
    };

    ws.onclose = () => {
      setLive(false);
    };

    ws.onerror = () => {
      setLive(false);
    };

    ws.onmessage = () => {
      refresh(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  /* =======================================================
     CHART
  ======================================================= */

  const chart = useMemo(() => {
    const grouped = {};

    [...e]
      .reverse()
      .forEach((event) => {
        const key = formatIST(event.timestamp, {
          hour: "2-digit",
          minute: "2-digit",
        });

        grouped[key] =
          (grouped[key] || 0) + 1;
      });

    return Object.entries(grouped).map(
      ([time, count]) => ({
        time,
        count,
      })
    );
  }, [e]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="app">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header>
        <div>
          <div className="eyebrow">
            SECURITY OPERATIONS
          </div>

          <h1>
            Hybrid IDS{" "}
            <span>
              & Security Monitoring
            </span>
          </h1>
        </div>

        <div className="live">
          <i className={live ? "on" : ""}></i>

          {live
            ? "SYSTEM LIVE"
            : "OFFLINE"}
        </div>
      </header>

      <main>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="error-banner">
            <XCircle size={18} />

            <span>{error}</span>

            <button
              onClick={() => refresh(true)}
              disabled={refreshing}
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="stats">

          <Stat
            icon={Activity}
            label="Events Analyzed"
            value={
              s?.total_events ?? 0
            }
          />

          <Stat
            icon={AlertTriangle}
            label="Total Alerts"
            value={
              s?.total_alerts ?? 0
            }
            cls="red"
          />

          <Stat
            icon={AlertTriangle}
            label="Critical Alerts"
            value={
              s?.critical_alerts ?? 0
            }
            cls="orange"
          />

          <Stat
            icon={Server}
            label="Open Alerts"
            value={
              s?.open_alerts ?? 0
            }
            cls="purple"
          />

        </section>

        {/* =================================================
            CHART + TOP IPS
        ================================================= */}

        <section className="twocol">

          {/* Threat Activity */}

          <div className="card panel">

            <div className="head">

              <div>
                <h2>
                  Threat Activity
                </h2>

                <p>
                  Recent event volume
                </p>
              </div>

              <button
                onClick={() =>
                  refresh(true)
                }
                disabled={refreshing}
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "spin"
                      : ""
                  }
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

            </div>

            <div className="chart">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={chart}
                >

                  <defs>
                    <linearGradient
                      id="g"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#22d3ee"
                        stopOpacity=".35"
                      />

                      <stop
                        offset="95%"
                        stopColor="#22d3ee"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#1e293b"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                  />

                  <YAxis
                    stroke="#64748b"
                  />

                  <Tooltip
                    contentStyle={{
                      background:
                        "#0f172a",
                      border:
                        "1px solid #334155",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#22d3ee"
                    fill="url(#g)"
                  />

                </AreaChart>
              </ResponsiveContainer>

            </div>

          </div>

          {/* Top Source IPs */}

          <div className="card panel">

            <div className="head">

              <div>
                <h2>
                  Top Source IPs
                </h2>

                <p>
                  Sources generating alerts
                </p>
              </div>

            </div>

            {(s?.top_sources || [])
              .map((x, i) => (
                <div
                  className="source"
                  key={x.source_ip}
                >
                  <b>{i + 1}</b>

                  <code>
                    {x.source_ip}
                  </code>

                  <strong>
                    {x.count}
                  </strong>
                </div>
              ))}

            {!s?.top_sources?.length && (
              <div className="empty">
                No alerts yet.
              </div>
            )}

          </div>

        </section>

        {/* =================================================
            ALERT TABLE
        ================================================= */}

        <section className="card panel">

          <div className="head">

            <div>
              <h2>
                Recent Security Alerts
              </h2>

              <p>
                Detections from the
                hybrid engine
              </p>
            </div>

            <Radio size={18} />

          </div>

          <div className="table">

            <table>

              <thead>
                <tr>
                  <th>Time</th>
                  <th>Source</th>
                  <th>Threat</th>
                  <th>Severity</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {a.map((x) => {

                  const isUpdating =
                    updatingAlert === x.id;

                  return (
                    <tr key={x.id}>

                      {/* Time */}

                      <td>
                        {formatIST(x.created_at, {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      {/* Source */}

                      <td>
                        <code>
                          {x.source_ip}
                        </code>
                      </td>

                      {/* Threat */}

                      <td>
                        {x.threat_type}
                      </td>

                      {/* Severity */}

                      <td>
                        <SeverityBadge
                          severity={
                            x.severity
                          }
                        />
                      </td>

                      {/* Risk */}

                      <td>
                        <strong>
                          {x.risk_score}/100
                        </strong>
                      </td>

                      {/* Status */}

                      <td>
                        <StatusBadge
                          status={x.status}
                        />
                      </td>

                      {/* Actions */}

                      <td>

                        <div className="alert-actions">

                          {/* VIEW */}

                          <button
                            className="action-btn view"
                            onClick={() =>
                              setSelectedAlert(
                                x
                              )
                            }
                            title="View alert details"
                          >
                            <Eye
                              size={14}
                            />

                            View
                          </button>

                          {/* ACKNOWLEDGE */}

                          {x.status ===
                            "OPEN" && (
                            <button
                              className="action-btn acknowledge"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                updateAlertStatus(
                                  x.id,
                                  "ACKNOWLEDGED"
                                )
                              }
                              title="Acknowledge alert"
                            >
                              {isUpdating ? (
                                <RefreshCw
                                  size={14}
                                  className="spin"
                                />
                              ) : (
                                <CheckCircle
                                  size={14}
                                />
                              )}

                              Acknowledge
                            </button>
                          )}

                          {/* RESOLVE */}

                          {x.status ===
                            "ACKNOWLEDGED" && (
                            <button
                              className="action-btn resolve"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                updateAlertStatus(
                                  x.id,
                                  "RESOLVED"
                                )
                              }
                              title="Resolve alert"
                            >
                              {isUpdating ? (
                                <RefreshCw
                                  size={14}
                                  className="spin"
                                />
                              ) : (
                                <CheckCircle
                                  size={14}
                                />
                              )}

                              Resolve
                            </button>
                          )}

                          {/* RESOLVED */}

                          {x.status ===
                            "RESOLVED" && (
                            <span className="resolved-label">
                              <CheckCircle
                                size={14}
                              />

                              Resolved
                            </span>
                          )}

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

          {!a.length && (
            <div className="empty">
              No alerts yet. Run the
              simulator.
            </div>
          )}

        </section>

        {/* =================================================
            SYSTEM STATUS
        ================================================= */}

        <section className="card panel">

          <div className="head">

            <div>
              <h2>
                System Status
              </h2>

              <p>
                Prototype component health
              </p>
            </div>

          </div>

          <div className="health">

            <div>
              <ShieldCheck />

              <span>
                Signature Engine
              </span>

              <b>READY</b>
            </div>

            <div>
              <Activity />

              <span>
                ML Engine
              </span>

              <b>READY</b>
            </div>

            <div>
              <Server />

              <span>
                Database
              </span>

              <b>READY</b>
            </div>

            <div>
              <Radio />

              <span>
                WebSocket
              </span>

              <b>
                {live
                  ? "CONNECTED"
                  : "DISCONNECTED"}
              </b>
            </div>

          </div>

        </section>

      </main>

      {/* ===================================================
          ALERT DETAILS MODAL
      =================================================== */}

      {selectedAlert && (
        <AlertDetails
          alert={selectedAlert}
          onClose={() =>
            setSelectedAlert(null)
          }
        />
      )}

      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer>
        Hybrid IDS • Educational
        defensive security prototype
      </footer>

    </div>
  );
}