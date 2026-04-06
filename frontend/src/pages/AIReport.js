import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const AIReport = () => {
  const [report, setReport] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastGenerated, setLastGenerated] = useState(null);

  const reportRef = useRef();

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      const portfolioRes = await axios.get(
        "http://localhost:5050/api/portfolio",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const portfolioId = portfolioRes.data.portfolios[0]?._id;
      if (!portfolioId) {
        setError("No portfolio found.");
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `http://localhost:5050/api/ai/monthly-report?portfolioId=${portfolioId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReport(res.data.report);
      setMetrics(res.data.metrics);
      setPatterns(res.data.patterns || []);
      setLastGenerated(new Date());
      setLoading(false);
    } catch (err) {
      setError("Failed to load AI report.");
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("AI_Monthly_Trader_Report.pdf");
  };

  const score = extractScore(report);
  const badge = getTraderBadge(score);

  if (error)
    return <div style={{ padding: 60, color: "red" }}>{error}</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>🧠 AI Monthly Trader Personality Report</h1>

        <button
          onClick={fetchReport}
          disabled={loading}
          style={{
            ...styles.generateButton,
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "Generating..." : "🔄 Generate Latest Report"}
        </button>

        {lastGenerated && (
          <div style={styles.timestamp}>
            Last generated: {lastGenerated.toLocaleString()}
          </div>
        )}
      </div>

      {metrics && (
        <>
          {/* KPI GRID */}
          <div style={styles.kpiGrid}>
            <MetricCard title="Total Trades" value={metrics.totalTrades} />
            <MetricCard
              title="Win Rate"
              value={`${metrics.winRate.toFixed(2)}%`}
            />
            <MetricCard
              title="Biggest Win"
              value={`₹${Number(metrics.biggestWin).toFixed(2)}`}
              green
            />
            <MetricCard
              title="Biggest Loss"
              value={`₹${Number(metrics.biggestLoss).toFixed(2)}`}
              red
            />
            <MetricCard
              title="Avg Profit"
              value={`₹${Number(metrics.avgProfit).toFixed(2)}`}
            />
          </div>

          {/* BADGE + SCORE */}
          <div style={styles.personalityCard}>
            <div style={styles.badge}>{badge.label}</div>
            <div style={styles.scoreLabel}>
              Emotional Discipline Score: {score}/10
            </div>
            <ProgressBar score={score} />
          </div>

          {/* PATTERN DETECTION */}
          {patterns.length > 0 && (
            <div style={styles.patternCard}>
              <h2>📊 Trade Pattern Detection</h2>
              {patterns.map((p, i) => (
                <div key={i} style={styles.patternItem}>
                  ⚠️ {p}
                </div>
              ))}
            </div>
          )}

          {/* EXPORT BUTTON */}
          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <button onClick={handleExportPDF} style={styles.exportButton}>
              📄 Export as PDF
            </button>
          </div>

          {/* FULL REPORT */}
          <div ref={reportRef} style={styles.reportCard}>
            <ReactMarkdown
              components={{
                h1: props => <h1 style={styles.h1} {...props} />,
                h2: props => <h2 style={styles.h2} {...props} />,
                h3: props => <h3 style={styles.h3} {...props} />,
                p: props => <p style={styles.p} {...props} />,
                ul: props => <ul style={styles.ul} {...props} />,
                li: props => <li style={styles.li} {...props} />,
                strong: props => <strong style={{ fontWeight: 600 }} {...props} />
              }}
            >
              {report}
            </ReactMarkdown>
          </div>
        </>
      )}
    </div>
  );
};

/* ================= STYLES ================= */

const styles = {
  page: {
    padding: "60px 100px",
    background: "#f4f6fb",
    minHeight: "100vh"
  },
  header: {
    marginBottom: 40
  },
  title: {
    fontSize: 28,
    fontWeight: 700
  },
  generateButton: {
    marginTop: 20,
    padding: "12px 24px",
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600
  },
  timestamp: {
    marginTop: 10,
    fontSize: 13,
    color: "#6b7280"
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 20,
    marginBottom: 40
  },
  personalityCard: {
    background: "#ffffff",
    padding: 30,
    borderRadius: 20,
    marginBottom: 40,
    boxShadow: "0 20px 40px rgba(0,0,0,0.05)"
  },
  badge: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 10
  },
  scoreLabel: {
    marginBottom: 10,
    fontWeight: 500
  },
  patternCard: {
    background: "#fff",
    padding: 30,
    borderRadius: 20,
    marginBottom: 40,
    boxShadow: "0 20px 40px rgba(0,0,0,0.05)"
  },
  patternItem: {
    marginTop: 10
  },
  exportButton: {
    padding: "10px 20px",
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
  },
  reportCard: {
    background: "#ffffff",
    padding: 40,
    borderRadius: 20,
    boxShadow: "0 30px 60px rgba(0,0,0,0.07)"
  },
  h1: { fontSize: 24, marginBottom: 20 },
  h2: { fontSize: 20, marginTop: 30, marginBottom: 15 },
  h3: { fontSize: 18, marginTop: 25, marginBottom: 12 },
  p: { marginBottom: 14, lineHeight: 1.7 },
  ul: { paddingLeft: 20, marginBottom: 16 },
  li: { marginBottom: 8 }
};

const MetricCard = ({ title, value, green, red }) => (
  <div
    style={{
      background: "#fff",
      padding: 25,
      borderRadius: 15,
      textAlign: "center",
      boxShadow: "0 15px 35px rgba(0,0,0,0.05)"
    }}
  >
    <div style={{ fontSize: 14, color: "#777" }}>{title}</div>
    <div
      style={{
        fontSize: 22,
        fontWeight: 600,
        marginTop: 10,
        color: green ? "#16a34a" : red ? "#dc2626" : "#111"
      }}
    >
      {value}
    </div>
  </div>
);

const ProgressBar = ({ score }) => {
  const width = score * 10;
  const color =
    score >= 7 ? "#16a34a" :
    score >= 4 ? "#f59e0b" :
    "#dc2626";

  return (
    <div
      style={{
        height: 14,
        background: "#e5e7eb",
        borderRadius: 10,
        overflow: "hidden"
      }}
    >
      <div
        style={{
          width: `${width}%`,
          height: "100%",
          background: color,
          transition: "0.4s"
        }}
      />
    </div>
  );
};

const extractScore = text => {
  const match = text?.match(/(\d+)\/10/);
  return match ? parseInt(match[1]) : 3;
};

const getTraderBadge = score => {
  if (score >= 9) return { label: "🏆 Elite Trader" };
  if (score >= 7) return { label: "🟢 Disciplined Trader" };
  if (score >= 4) return { label: "🟡 Developing Trader" };
  return { label: "🔴 Beginner Risky Trader" };
};

export default AIReport;
