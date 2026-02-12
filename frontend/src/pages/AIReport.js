import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


const AIReport = () => {
    const [report, setReport] = useState("");
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [lastGenerated, setLastGenerated] = useState(null);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
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

            const res = await axios.get(
                `http://localhost:5050/api/ai/monthly-report?portfolioId=${portfolioId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setReport(res.data.report);
            setMetrics(res.data.metrics);
            setLastGenerated(new Date());
            setLoading(false);
        } catch (err) {
            setError("Failed to load AI report.");
            setLoading(false);
        }
    };

    const reportRef = useRef();

    const handleExportPDF = async () => {
        const input = reportRef.current;

        const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true
        });

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("AI_Monthly_Trader_Report.pdf");
    };


    const score = extractScore(report);
    const badge = getTraderBadge(score);

    if (error) return <div style={{ padding: 60, color: "red" }}>{error}</div>;

    return (
        <div style={{
            padding: "60px 120px",
            background: "#f4f6fb",
            minHeight: "100vh"
        }}>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>
                🧠 AI Monthly Trader Personality Report
            </h1>

            {/* 🔄 Generate Button */}
            <div style={{ marginTop: 20, marginBottom: 40 }}>
                <button
                    onClick={fetchReport}
                    disabled={loading}
                    style={{
                        padding: "12px 22px",
                        borderRadius: 10,
                        border: "none",
                        background: loading ? "#9ca3af" : "#111827",
                        color: "white",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: 600
                    }}
                >
                    {loading ? "Generating..." : "🔄 Generate Latest Report"}
                </button>

                {lastGenerated && (
                    <div style={{ marginTop: 10, fontSize: 13, color: "#6b7280" }}>
                        Last generated: {lastGenerated.toLocaleString()}
                    </div>
                )}
            </div>

            {metrics && (
                <>
                    {/* KPI Cards */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: 20,
                        marginBottom: 40
                    }}>
                        <MetricCard title="Total Trades" value={metrics.totalTrades} />
                        <MetricCard title="Win Rate" value={`${metrics.winRate.toFixed(2)}%`} />
                        <MetricCard title="Biggest Win" value={`₹${metrics.biggestWin.toFixed(2)}`} green />
                        <MetricCard title="Biggest Loss" value={`₹${metrics.biggestLoss.toFixed(2)}`} red />
                        <MetricCard title="Avg Profit" value={`₹${metrics.avgProfit.toFixed(2)}`} />
                    </div>

                    {/* Personality Summary Card */}
                    <div style={{
                        background: "#ffffff",
                        padding: 40,
                        borderRadius: 20,
                        boxShadow: "0 30px 60px rgba(0,0,0,0.07)",
                        marginBottom: 40
                    }}>
                        <h2>🎯 Personality Overview</h2>
                        <div style={{ marginTop: 15 }}>
                            <strong>Trader Level:</strong> {badge.label}
                        </div>
                        <div style={{ marginTop: 10 }}>
                            <strong>Emotional Discipline Score:</strong> {score}/10
                        </div>
                        <ProgressBar score={score} />
                    </div>
                    <div style={{ textAlign: "right", marginBottom: 20 }}>
                        <button
                            onClick={handleExportPDF}
                            style={{
                                padding: "10px 20px",
                                background: "#111827",
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 500
                            }}
                        >
                            📄 Export as PDF
                        </button>
                    </div>

                    {/* Full Report Section */}
                    <div
                        ref={reportRef}
                        style={{
                            background: "#ffffff",
                            padding: 40,
                            borderRadius: 20,
                            boxShadow: "0 30px 60px rgba(0,0,0,0.07)"
                        }}
                    >

                        <ReactMarkdown
                            components={{
                                h1: ({ node, ...props }) => (
                                    <h1 style={{ fontSize: 24, marginBottom: 20 }} {...props} />
                                ),
                                h2: ({ node, ...props }) => (
                                    <h2 style={{ fontSize: 20, marginTop: 30, marginBottom: 15 }} {...props} />
                                ),
                                h3: ({ node, ...props }) => (
                                    <h3 style={{ fontSize: 18, marginTop: 25, marginBottom: 12 }} {...props} />
                                ),
                                p: ({ node, ...props }) => (
                                    <p style={{ marginBottom: 14, lineHeight: 1.7 }} {...props} />
                                ),
                                ul: ({ node, ...props }) => (
                                    <ul style={{ paddingLeft: 20, marginBottom: 16 }} {...props} />
                                ),
                                li: ({ node, ...props }) => (
                                    <li style={{ marginBottom: 8 }} {...props} />
                                ),
                                strong: ({ node, ...props }) => (
                                    <strong style={{ fontWeight: 600 }} {...props} />
                                )
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

/* ================= COMPONENTS ================= */

const MetricCard = ({ title, value, green, red }) => (
    <div style={{
        background: "#fff",
        padding: 25,
        borderRadius: 15,
        textAlign: "center",
        boxShadow: "0 15px 35px rgba(0,0,0,0.05)"
    }}>
        <div style={{ fontSize: 14, color: "#777" }}>{title}</div>
        <div style={{
            fontSize: 22,
            fontWeight: 600,
            marginTop: 10,
            color: green ? "#16a34a" : red ? "#dc2626" : "#111"
        }}>
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
        <div style={{
            height: 16,
            background: "#e5e7eb",
            borderRadius: 10,
            overflow: "hidden",
            marginTop: 10
        }}>
            <div style={{
                width: `${width}%`,
                height: "100%",
                background: color,
                transition: "0.4s"
            }} />
        </div>
    );
};

/* ================= HELPERS ================= */

const extractScore = (text) => {
    const match = text.match(/(\d+)\/10/);
    return match ? parseInt(match[1]) : 3;
};

const getTraderBadge = (score) => {
    if (score >= 9) return { label: "🏆 Elite Trader" };
    if (score >= 7) return { label: "🟢 Disciplined Trader" };
    if (score >= 4) return { label: "🟡 Developing Trader" };
    return { label: "🔴 Beginner Risky Trader" };
};

export default AIReport;
