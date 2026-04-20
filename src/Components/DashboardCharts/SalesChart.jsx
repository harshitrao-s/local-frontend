import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const FONT = "'Inter', system-ui, sans-serif";

const salesData = [
  { month: "Jan", thisYear: 3800, lastYear: 3200 },
  { month: "Feb", thisYear: 4200, lastYear: 3500 },
  { month: "Mar", thisYear: 3900, lastYear: 3800 },
  { month: "Apr", thisYear: 5200, lastYear: 4100 },
  { month: "May", thisYear: 4800, lastYear: 4400 },
  { month: "Jun", thisYear: 5500, lastYear: 4600 },
  { month: "Jul", thisYear: 5100, lastYear: 4900 },
  { month: "Aug", thisYear: 6200, lastYear: 5100 },
  { month: "Sep", thisYear: 5800, lastYear: 5400 },
  { month: "Oct", thisYear: 6500, lastYear: 5600 },
  { month: "Nov", thisYear: 6800, lastYear: 5900 },
  { month: "Dec", thisYear: 7200, lastYear: 6100 },
];

const SalesChart = ({ data }) => {
  const [salesPeriod, setSalesPeriod] = useState("Monthly");
  // ── Custom Tooltip ─────────────────────────────────────────────────────────────
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "#fff", border: "0.5px solid #e5e7eb",
        borderRadius: 8, padding: "8px 12px",
        fontFamily: FONT, fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      }}>
        <div style={{ fontWeight: 500, marginBottom: 4, color: "#374151" }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color }}>
            {p.name === "thisYear" ? "This Year" : "Last Year"}: ${p.value.toLocaleString()}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card border  shadow-sm h-100 d-flex flex-column" style={{ borderRadius: 10, fontFamily: FONT }}>
      <div className="p-2 d-flex justify-content-between top_border_design align-items-center" style={{ background: "#fff", borderBottom: "0.5px solid #e5e7eb", borderRadius: "10px 10px 0 0" }}>
        <h6 style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Sales Overview</h6>
        <button
          className="btn btn-sm btn-outline-secondary"
          style={{ fontFamily: FONT, fontSize: 11, borderRadius: 6 }}
          onClick={() => setSalesPeriod(salesPeriod === "Monthly" ? "Yearly" : "Monthly")}
        >
          {salesPeriod} <FontAwesomeIcon icon={faChevronDown} className="ms-1" />
        </button>
      </div>
      <div className="card-body p-2 d-flex flex-column ustify-content-between">
        <div className="d-flex align-items-center gap-3 mb-2" style={{ fontSize: 11, color: "#6b7280" }}>
          <span>Total Sales ($ USD)</span>
          <span><span style={{ color: "#4e9af1" }}>●</span> This Year</span>
          <span><span style={{ color: "#ccc" }}>●</span> Last Year</span>
        </div>
        <div style={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="thisYearGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4e9af1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4e9af1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lastYearGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#bbb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#bbb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8e8e8" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fontFamily: FONT }}
                height={18}
                axisLine={{ stroke: "#e8e8e8" }}
                tickLine={false}
              />
              <YAxis
                width={28}
                tick={{ fontSize: 11, fontFamily: FONT }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v / 1000}k`}
                domain={[2500, 8000]}
                ticks={[4000, 5500, 7500]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="lastYear" stroke="#bbb" strokeWidth={2} fill="url(#lastYearGrad)" dot={{ r: 3, fill: "#bbb" }} />
              <Area type="monotone" dataKey="thisYear" stroke="#4e9af1" strokeWidth={2} fill="url(#thisYearGrad)" dot={{ r: 3, fill: "#4e9af1" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;