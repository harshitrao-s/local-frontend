import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Label
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart, faBoxOpen, faUsers, faDollarSign,
  faPlus, faEye, faChevronDown, faArrowTrendUp,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";
import apiFetch from "../Utils/apiFetch";
import { API_BASE } from "../Config/api";
import { useNavigate } from "react-router-dom";

// ── Inter font (add this in index.html <head> if not already)
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

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

const poStatusData = [
  { name: "Placed", value: 720, color: "#4e9af1" },
  { name: "Receipted", value: 310, color: "#f5a623" },
  { name: "Completed", value: 185, color: "#4caf8a" },
  { name: "Cancelled", value: 43, color: "#e05c5c" },
];

const recentOrders = [
  { id: "PO0319", vendor: "GreenLeaf Supplies", date: "16 Apr 2024", status: "Partially Received", statusColor: "warning", total: "7,260.00 AUD", poTotal: "12,750.00 AUD" },
  { id: "PO0318", vendor: "HealthFirst Ltd.", date: "16 Apr 2024", status: "Placed", statusColor: "primary", total: "7,220.00 AUD", poTotal: "8,400.00 AUD" },
  { id: "PO0317", vendor: "GreenLeaf Supplies", date: "16 Apr 2024", status: "Completed", statusColor: "success", total: "1,250.00 AUD", poTotal: "9,200.00 AUD" },
  { id: "PO0316", vendor: "GreenLeaf Supplies", date: "15 Apr 2024", status: "Cancelled", statusColor: "danger", total: "2,220.00 AUD", poTotal: "2,200.00 AUD" },
];

const topProducts = [
  { name: "Vitamin C 500mg", count: 1200 },
  { name: "Organic Protein Power", count: 850 },
  { name: "Herbal Sleep Aid", count: 760 },
  { name: "Fish Oil 1000mg", count: 640 },
];

const topVendors = [
  { name: "PharmaSource Inc.", count: 354 },
  { name: "GreenLeaf Supplies", count: 287 },
  { name: "HealthFirst Ltd.", count: 243 },
  { name: "Wellness International", count: 198 },
];

const invoiceStatusData = [
  { name: "Paid", value: 145, color: "#4caf8a" },
  { name: "Unpaid", value: 89, color: "#e05c5c" },
  { name: "Cancelled", value: 23, color: "#9e9e9e" },
  { name: "On Hold", value: 34, color: "#f5a623" },
];

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, change, gradient, bgIcon }) => (
  <div className="col-12 col-sm-6 col-xl-3">
    <div
      className="card border-0 h-100 text-white overflow-hidden position-relative"
      style={{ background: gradient, borderRadius: 12, fontFamily: FONT }}
    >
      <div
        className="position-absolute opacity-25"
        style={{ right: -10, bottom: -10, fontSize: 80, lineHeight: 1 }}
      >
        <FontAwesomeIcon icon={bgIcon || icon} />
      </div>
      <div className="card-body p-3 position-relative">
        <div className="d-flex align-items-center mb-2">
          <div
            className="me-2 p-2 rounded-2"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <FontAwesomeIcon icon={icon} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.9 }}>{label}</span>
        </div>
        <div style={{ fontSize: "1.75rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
          {value}
        </div>
        <div style={{ fontSize: 12, marginTop: 6, opacity: 0.85 }}>
          <FontAwesomeIcon icon={faArrowTrendUp} className="me-1" />
          {change} this month
        </div>
      </div>
    </div>
  </div>
);

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

// ── Dashboard ──────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [salesPeriod, setSalesPeriod] = useState("Monthly");
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const handleAddNew = async (e) => {
    if (e) e.preventDefault();
    if (creating) return;

    try {
      setCreating(true);
      const res = await apiFetch(`${API_BASE}api/purchaseorder/api/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-type": "application/json" },
      });

      if (res?.data?.po_id) {
        navigate(`/purchaseorder/create/${res.data.po_id}/AddNew`);
      }
    } catch (err) {
      console.error("Failed to create PO", err);
    } finally {
      // setCreating(false);
    }
  };
  return (
    <div style={{ fontFamily: FONT, marginLeft: -5, marginRight: -5 }}>

      {/* Top bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 style={{ fontWeight: 600, fontSize: 20, margin: 0 }}>Dashboard</h3>
          <small style={{ color: "#e05c5c", fontSize: 12 }}></small>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => handleAddNew()}
            className={`nav-link ${creating ? "disabled" : ""} btn btn-primary btn-sm px-3`}
            style={{ fontFamily: FONT, fontWeight: 500, borderRadius: 8, cursor: creating ? "default" : "pointer", pointerEvents: creating ? "none" : "auto", color: "white" }}
          >
            {!creating ? (<><FontAwesomeIcon icon={faPlus} className="me-1" />Add Purchase Order</>) : <><FontAwesomeIcon icon={faSpinner} className="me-1" />  Creating...</>}
          </button>
          <button onClick={() => navigate("/purchaseorder/listing")}
            className="btn btn-outline-secondary btn-sm px-3"
            style={{ fontFamily: FONT, fontWeight: 500, borderRadius: 8 }}
          >
            <FontAwesomeIcon icon={faEye} className="me-1" /> View
          </button>
        </div>
      </div>

      <div className="border shadow-sm p-2" style={{ borderRadius: 10, background: "#f9fafb" }}>

        {/* ── Stat Cards ── */}
        <div className="row g-2 mb-3">
          <StatCard icon={faDollarSign} label="Total Sales" value="$25,450.00" change="+5.2%" gradient="linear-gradient(135deg,#11998e,#38ef7d)" />
          <StatCard icon={faShoppingCart} label="Purchase Orders" value="1,258" change="+10.4%" gradient="linear-gradient(135deg,#4776e6,#8e54e9)" />
          <StatCard icon={faBoxOpen} label="Products" value="320" change="+2.7%" gradient="linear-gradient(135deg,#f7971e,#ffd200)" />
          <StatCard icon={faUsers} label="Vendors" value="75" change="+3.1%" gradient="linear-gradient(135deg,#f46b45,#eea849)" />
        </div>

        {/* ── Charts Row ── */}
        <div className="row g-3 mb-3 align-items-stretch">

          {/* Sales Overview */}
          <div className="col-12 col-lg-5">
            <div className="card border shadow-sm h-100" style={{ borderRadius: 10, fontFamily: FONT }}>
              <div className="card-header d-flex justify-content-between align-items-center" style={{ background: "#fff", borderBottom: "0.5px solid #e5e7eb" }}>
                <h6 style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Sales Overview</h6>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  style={{ fontFamily: FONT, fontSize: 11, borderRadius: 6 }}
                  onClick={() => setSalesPeriod(salesPeriod === "Monthly" ? "Yearly" : "Monthly")}
                >
                  {salesPeriod} <FontAwesomeIcon icon={faChevronDown} className="ms-1" />
                </button>
              </div>
              <div className="card-body pb-0 px-2">
                <div className="d-flex align-items-center gap-3 mb-2" style={{ fontSize: 11, color: "#6b7280" }}>
                  <span>Total Sales ($ USD)</span>
                  <span><span style={{ color: "#4e9af1" }}>●</span> This Year</span>
                  <span><span style={{ color: "#ccc" }}>●</span> Last Year</span>
                </div>
                <ResponsiveContainer width="100%" height={290}>
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

          {/* PO Status Donut */}
          <div className="col-12 col-lg-4">
            <div className="card border shadow-sm h-100" style={{ borderRadius: 10, fontFamily: FONT }}>
              <div className="card-header" style={{ background: "#fff", borderBottom: "0.5px solid #e5e7eb" }}>
                <h6 style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Purchase Order Status</h6>
              </div>
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <div style={{ position: "relative", width: 220, height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={poStatusData}
                        cx="50%" cy="50%"
                        innerRadius={65} outerRadius={95}
                        dataKey="value"
                        startAngle={90} endAngle={-270}
                      >
                        {poStatusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                        <Label
                          content={() => (
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                              <tspan x="50%" dy="-8" fontSize="26" fontWeight="600" fill="#111827" fontFamily={FONT}>720</tspan>
                              <tspan x="50%" dy="22" fontSize="12" fill="#6b7280" fontFamily={FONT}>POs</tspan>
                            </text>
                          )}
                        />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="d-flex flex-wrap justify-content-center gap-3 mt-2">
                  {poStatusData.map((item, i) => (
                    <div key={i} className="d-flex align-items-center gap-2">
                      <div style={{ width: 9, height: 9, borderRadius: "50%", background: item.color }} />
                      <span style={{ fontSize: 12, color: "#374151" }}>{item.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Products + Top Vendors */}
          <div className="col-lg-3 d-flex flex-column gap-3 h-100">
            {[
              { title: "Top Products", data: topProducts, keyName: "name", keyVal: "count" },
              { title: "Top Vendors", data: topVendors, keyName: "name", keyVal: "count" },
            ].map(({ title, data, keyName, keyVal }) => (

              <div
                key={title}
                className="card  margin_none border shadow-sm d-flex flex-column"
                style={{
                  borderRadius: 10,
                  fontFamily: FONT,
                  flex: 1,                // 🔥 important (equal height)
                  minHeight: 0,            // 🔥 prevents overflow issues
                  marginBottom: "0px !important"
                }}
              >

                <div
                  className="card-header"
                  style={{
                    background: "#fff",
                    borderBottom: "0.5px solid #e5e7eb"
                  }}
                >
                  <h6 style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>
                    {title}
                  </h6>
                </div>

                <div className="card-body overflow-auto">
                  {data.map((item, i) => (
                    <div key={i} className="d-flex justify-content-between align-items-center mb-2">
                      <span style={{ fontSize: 12, color: "#374151" }}>
                        {item[keyName]}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>
                        {item[keyVal].toLocaleString()}
                      </span>
                    </div>
                  ))}

                  {title === "Top Vendors" && (
                    <div className="text-end mt-1">
                      <span style={{
                        fontSize: 12,
                        color: "#4e9af1",
                        cursor: "pointer",
                        fontWeight: 500
                      }}>
                        View All ›
                      </span>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="row g-3">

          {/* Recent Purchase Orders */}
          <div className="col-12 col-lg-6">
            <div className="card  border shadow-sm" style={{ borderRadius: 10, fontFamily: FONT, height: "-webkit-fill-available" }}>
              <div className="card-header" style={{ background: "#fff", borderBottom: "0.5px solid #e5e7eb" }}>
                <h6 style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Recent Purchase Orders</h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ fontFamily: FONT, fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        {["Order #", "Vendor", "Order Date", "Status", "Total", "PO Total"].map(h => (
                          <th key={h} style={{ fontSize: 11, fontWeight: 500, color: "#6b7280", padding: "8px 12px", borderBottom: "0.5px solid #e5e7eb" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((o) => (
                        <tr key={o.id}>
                          <td style={{ padding: "9px 12px", fontWeight: 500 }}>{o.id}</td>
                          <td style={{ padding: "9px 12px", color: "#374151" }}>{o.vendor}</td>
                          <td style={{ padding: "9px 12px", color: "#6b7280" }}>{o.date}</td>
                          <td style={{ padding: "9px 12px" }}>
                            <span className={`badge bg-${o.statusColor} rounded-pill px-2`} style={{ fontFamily: FONT, fontSize: 11 }}>
                              {o.status}
                            </span>
                          </td>
                          <td style={{ padding: "9px 12px", fontWeight: 500 }}>{o.total}</td>
                          <td style={{ padding: "9px 12px", color: "#6b7280" }}>{o.poTotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Total Invoices Pie */}
          <div className="col-12 col-lg-6">
            <div className="card border shadow-sm" style={{ borderRadius: 10, fontFamily: FONT }}>
              <div className="card-header" style={{ background: "#fff", borderBottom: "0.5px solid #e5e7eb" }}>
                <h6 style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Total Invoices</h6>
              </div>
              <div className="card-body d-flex flex-column align-items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={invoiceStatusData}
                      cx="50%" cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      startAngle={90} endAngle={-270}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={true}
                    >
                      {invoiceStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, name) => [v, name]}
                      contentStyle={{ fontFamily: FONT, fontSize: 12, borderRadius: 8, border: "0.5px solid #e5e7eb" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="d-flex flex-wrap justify-content-center gap-3 mt-1">
                  {invoiceStatusData.map((item, i) => (
                    <div key={i} className="d-flex align-items-center gap-2">
                      <div style={{ width: 9, height: 9, borderRadius: "50%", background: item.color }} />
                      <span style={{ fontSize: 12, color: "#374151" }}>{item.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;