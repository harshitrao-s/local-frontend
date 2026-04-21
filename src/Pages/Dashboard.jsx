import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart, faBoxOpen, faUsers, faDollarSign,
  faPlus, faEye, faArrowTrendUp,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";
import apiFetch from "../Utils/apiFetch";
import { API_BASE } from "../Config/api";
import { Link, useNavigate } from "react-router-dom";
import SalesChart from "../Components/DashboardCharts/SalesChart";
import { POStatusPieChart } from "../Components/DashboardCharts/POStatusPieChart";
import RecentPurchaseOrders from "../Components/DashboardCharts/RecentPurchaseOrders";
import TotalInvoice from "../Components/DashboardCharts/TotalInvoice";
import TopProductList from "../Components/DashboardCharts/TopProductList";

// ── Inter font (add this in index.html <head> if not already)
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

const FONT = "'Inter', system-ui, sans-serif";



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
      <div className="card-body p-3 position-relative d-flex flex-column gap-1">
        <div className="d-flex align-items-center ">
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
        <div style={{ fontSize: 12,  opacity: 0.85 }}>
          <FontAwesomeIcon icon={faArrowTrendUp} className="me-1" />
          {change} this month
        </div>
      </div>
    </div>
  </div>
);

// // ── Custom Tooltip ─────────────────────────────────────────────────────────────
// const CustomTooltip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div style={{
//       background: "#fff", border: "0.5px solid #e5e7eb",
//       borderRadius: 8, padding: "8px 12px",
//       fontFamily: FONT, fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
//     }}>
//       <div style={{ fontWeight: 500, marginBottom: 4, color: "#374151" }}>{label}</div>
//       {payload.map((p, i) => (
//         <div key={i} style={{ color: p.color }}>
//           {p.name === "thisYear" ? "This Year" : "Last Year"}: ${p.value.toLocaleString()}
//         </div>
//       ))}
//     </div>
//   );
// };

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
    <div style={{ fontFamily: FONT, marginLeft: -5, marginRight: -5  }}>

      {/* Top bar */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div>
          <h3 className="text-black">Dashboard</h3>
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
          <Link to="/purchaseorder/listing"
            className="btn btn-outline-secondary btn-sm px-3"
            style={{ fontFamily: FONT, fontWeight: 500, borderRadius: 8 }}
          >
            <FontAwesomeIcon icon={faEye} className="me-1" /> View
          </Link>
        </div>
      </div>


        {/* ── Stat Cards ── */}
        <div className="row g-2 mb-2">
          <StatCard icon={faDollarSign} label="Total Sales" value="$25,450.00" change="+5.2%" gradient="linear-gradient(135deg,#11998e,#38ef7d)" />
          <StatCard icon={faShoppingCart} label="Purchase Orders" value="1,258" change="+10.4%" gradient="linear-gradient(135deg,#4776e6,#8e54e9)" />
          <StatCard icon={faBoxOpen} label="Products" value="320" change="+2.7%" gradient="linear-gradient(135deg,#f7971e,#ffd200)" />
          <StatCard icon={faUsers} label="Vendors" value="75" change="+3.1%" gradient="linear-gradient(135deg,#f46b45,#eea849)" />
        </div>

        {/* ── Charts Row ── */}
        <div className="row g-3 mb-2 align-items-stretch">

          {/* Sales Overview */}
          <div className="col-12 col-lg-5">
           <SalesChart/>
          </div>

          {/* PO Status Donut */}
          <div className="col-12 col-lg-4">
            <POStatusPieChart/>
          </div>

          {/* Top Products + Top Vendors */}
          <div className="col-lg-3 d-flex flex-column gap-3 h-100">
           <TopProductList/>
          </div>

        </div>

        {/* ── Bottom Row ── */}
        <div className="row g-3 align-items-stretch">

          {/* Recent Purchase Orders */}
          <div className="col-12 col-lg-6">
           <RecentPurchaseOrders/>
          </div>

          {/* Total Invoices Pie */}
          <div className="col-12 col-lg-6">
           <TotalInvoice/>
          </div>

        </div>
    </div>
  );
};

export default Dashboard;