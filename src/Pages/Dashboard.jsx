import { useState } from "react";
import apiFetch from "../Utils/apiFetch";
import { API_BASE } from "../Config/api";
import { Link, useNavigate } from "react-router-dom";
import SalesChart from "../Components/DashboardCharts/SalesChart";
import { POStatusPieChart } from "../Components/DashboardCharts/POStatusPieChart";
import RecentPurchaseOrders from "../Components/DashboardCharts/RecentPurchaseOrders";
import TopProductList from "../Components/DashboardCharts/TopProductList";
import { DollarSign, ShoppingCart, Package, Users, } from "lucide-react";
import { Button } from "../Components/Common/ui/button";

// ── Inter font (add this in index.html <head> if not already)
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

const FONT = "'Inter', system-ui, sans-serif";



// ── Stat Card ──────────────────────────────────────────────────────────────────
// const StatCard = ({ icon, label, value, change, gradient, bgIcon }) => (
//   <div className="grid grid-cols-2 gap-4">
//     <div
//       className="card border-0 h-100 text-white overflow-hidden position-relative"
//       style={{ background: gradient, borderRadius: 12, fontFamily: FONT }}
//     >
//       <div
//         className="position-absolute opacity-25"
//         style={{ right: -10, bottom: -10, fontSize: 80, lineHeight: 1 }}
//       >
//         <FontAwesomeIcon icon={bgIcon || icon} />
//       </div>
//       <div className="card-body p-3 position-relative d-flex flex-column gap-1">
//         <div className="d-flex align-items-center ">
//           <div
//             className="me-2 p-2 rounded-2"
//             style={{ background: "rgba(255,255,255,0.2)" }}
//           >
//             <FontAwesomeIcon icon={icon} />
//           </div>
//           <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.9 }}>{label}</span>
//         </div>
//         <div style={{ fontSize: "1.75rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
//           {value}
//         </div>
//         <div style={{ fontSize: 12, opacity: 0.85 }}>
//           <FontAwesomeIcon icon={faArrowTrendUp} className="me-1" />
//           {change} this month
//         </div>
//       </div>
//     </div>
//   </div>
// );

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  titleColor,
  dark = false,
}) => {
  return (
    <div
      className={`rounded-[20px] border-1 h-[151px] w-full xl:max-w-[250px] p-[12px] 2xl:p-[16px] flex flex-col justify-between ${dark ? "bg-[#002B5B] text-white" : "bg-white border shadow-sm"
        }`}
    >
      {/* Top Row: Title & Icon */}
      <div className="flex items-start justify-between">
        <p className={`text-[12px] 2xl:text-[16px] font-normal ${titleColor ? titleColor : dark ? "text-white" : "dark:text-gray-300"}`}>
          {title}
        </p>

        {Icon && (
          <div className={`${dark ? "text-white/80" : "text-gray-400"}`}>
            <Icon className="w-5 h-5 " />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between lg:flex-col lg:items-start lg:justify-center xl:flex-row xl:items-end xl:justify-between w-full">
        <h2 className="text-[24px] lg:text-[20px] 2xl:text-[30px] font-semibold  leading-none w-auto h-[39px] lg:text-center">
          {value}
        </h2>

        {change && (
          /* Removed fixed height to let content breathe */
          <div className="flex flex-col items-end lg:items-start w-auto mt-0 lg:mt-2">
            <div className="flex items-center gap-1 text-[#04910C] font-medium leading-none">
              <span className="text-[14px]">↗</span>
              <span className="text-[16px] lg:text-[12px] 2xl:text-[16px]">{change}</span>
            </div>

            {/* Percentage ke thik niche perfectly align hoga */}
            <p className={`text-[12px] mt-1 ${dark ? "text-white/70" : "text-gray-400"} leading-none`}>
              This month
            </p>
          </div>
        )}
      </div>
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
    // <div style={{ fontFamily: FONT, marginLeft: -5, marginRight: -5  }}>

    //   {/* Top bar */}
    //   <div className="d-flex justify-content-between align-items-center mb-1">
    //     <div>
    //       <h3 className="text-black">Dashboard</h3>
    //       <small style={{ color: "#e05c5c", fontSize: 12 }}></small>
    //     </div>

    //     <div className="d-flex gap-2">
    //       <button
    //         onClick={() => handleAddNew()}
    //         className={`nav-link ${creating ? "disabled" : ""} btn btn-primary btn-sm px-3`}
    //         style={{ fontFamily: FONT, fontWeight: 500, borderRadius: 8, cursor: creating ? "default" : "pointer", pointerEvents: creating ? "none" : "auto", color: "white" }}
    //       >
    //         {!creating ? (<><FontAwesomeIcon icon={faPlus} className="me-1" />Add Purchase Order</>) : <><FontAwesomeIcon icon={faSpinner} className="me-1" />  Creating...</>}
    //       </button>
    //       <Link to="/purchaseorder/listing"
    //         className="btn btn-outline-secondary btn-sm px-3"
    //         style={{ fontFamily: FONT, fontWeight: 500, borderRadius: 8 }}
    //       >
    //         <FontAwesomeIcon icon={faEye} className="me-1" /> View
    //       </Link>
    //     </div>
    //   </div>


    //     {/* ── Stat Cards ── */}
    //     <div className="row g-2 mb-2">
    //       <StatCard icon={faDollarSign} label="Total Sales" value="$25,450.00" change="+5.2%" gradient="linear-gradient(135deg,#11998e,#38ef7d)" />
    //       <StatCard icon={faShoppingCart} label="Purchase Orders" value="1,258" change="+10.4%" gradient="linear-gradient(135deg,#4776e6,#8e54e9)" />
    //       <StatCard icon={faBoxOpen} label="Products" value="320" change="+2.7%" gradient="linear-gradient(135deg,#f7971e,#ffd200)" />
    //       <StatCard icon={faUsers} label="Vendors" value="75" change="+3.1%" gradient="linear-gradient(135deg,#f46b45,#eea849)" />
    //     </div>

    //     {/* ── Charts Row ── */}
    //     <div className="row g-3 mb-2 align-items-stretch">

    //       {/* Sales Overview */}
    //       <div className="col-12 col-lg-5">
    //        <SalesChart/>
    //       </div>

    //       {/* PO Status Donut */}
    //       <div className="col-12 col-lg-4">
    //         <POStatusPieChart/>
    //       </div>

    //       {/* Top Products + Top Vendors */}
    //       <div className="col-lg-3 d-flex flex-column gap-3 h-100">
    //        <TopProductList/>
    //       </div>

    //     </div>

    //     {/* ── Bottom Row ── */}
    //     <div className="row g-3 align-items-stretch">

    //       {/* Recent Purchase Orders */}
    //       <div className="col-12 col-lg-6">
    //        <RecentPurchaseOrders/>
    //       </div>

    //       {/* Total Invoices Pie */}
    //       <div className="col-12 col-lg-6">
    //        <TotalInvoice/>
    //       </div>

    //     </div>
    // </div>



    // <div className="w-fit font-roboto bg-[#f5f6f8]">

    //   {/* Header */}
    //   <div className="flex justify-between items-center mb-4">
    //     <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>

    //     <div className="flex gap-2">
    //       <button
    //         onClick={handleAddNew}
    //         className="text-sm px-4 py-2 rounded-lg flex items-center gap-1"
    //       >
    //         + Add Purchase Order
    //       </button>

    //       <Link
    //         to="/purchaseorder/listing"
    //         className="border px-4 py-2 text-sm rounded-lg flex items-center gap-1"
    //       >
    //         View
    //       </Link>
    //     </div>
    //   </div>

    //   {/* Top Grid */}
    //   <div className="grid grid-cols-12 gap-4 ">
    //     {/* LEFT SIDE (Main Content) */}
    //     <div className="col-span-8 flex flex-col gap-4">

    //       {/* Charts Row: Sales Overview & PO Status side-by-side */}
    //       <div className="flex gap-4 items-start">
    //         {/* Sales Overview - Height/Width Locked */}
    //         <div className="rounded-[20px] p-0 h-[357px] w-[558px] flex-shrink-0">
    //           <SalesChart />
    //         </div>

    //         {/* PO Status - Locked to same height as Sales Chart */}
    //         <div className="rounded-[20px] h-[357px] flex-grow">
    //           <POStatusPieChart />
    //         </div>
    //       </div>

    //       {/* Recent Orders */}
    //       <div className="rounded-[20px]">
    //         <RecentPurchaseOrders />
    //       </div>
    //     </div>

    //     {/* RIGHT SIDE (Stats & Lists) */}
    //     <div className="col-span-4 flex flex-col gap-4">
    //       {/* Top Cards */}
    //       <div className="grid grid-cols-2 gap-[16px]">
    //         <StatCard
    //           title="Total Sales"
    //           value="$81,000"
    //           change="+10.6%"
    //           icon={DollarSign}
    //           dark
    //         />

    //         <StatCard
    //           title="Purchase Orders"
    //           value="1258"
    //           change="+10.6%"
    //           icon={ShoppingCart}
    //           titleColor="black"
    //         />

    //         <StatCard
    //           title="Products"
    //           value="2654"
    //           change="+10.6%"
    //           icon={Package}
    //           titleColor="black"
    //         />

    //         <StatCard
    //           title="Vendors"
    //           value="125"
    //           change="+10.6%"
    //           titleColor="black"
    //           icon={Users}
    //         />
    //       </div>

    //       {/* Top Products */}
    //       <div className="rounded-xl">
    //         <TopProductList />
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="w-full font-roboto bg-[#f5f6f8]  sm:px-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>

        <div className="flex gap-2">
          <Button
            onClick={handleAddNew}
            className="text-[14px] bg-white/90 px-3 py-3 rounded-[12px] flex items-center gap-1"
          >
            + Add Purchase Order
          </Button>

          <Link
            to="/purchaseorder/listing"
            className="no-underline bg-white/80 focus:outline-none hover:ring-1 hover:ring-blue-800 hover:ring-offset-2 transition px-3 py-1 text-[14px] rounded-[12px] flex items-center gap-1"
          >
            View
          </Link>
        </div>
      </div>

      {/* Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* LEFT SIDE */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Charts */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="rounded-[20px] w-full md:w-[50%] lg:w-[558px] h-[357px]">
              <SalesChart />
            </div>
            <div className="rounded-[20px] w-full md:w-[50%] h-[357px]">
              <POStatusPieChart />
            </div>
          </div>

          {/* Recent Orders - Iska top alignment ab Right side ki tables ke sath match karega */}
          <div className="rounded-[20px]">
            <RecentPurchaseOrders />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Cards Section - Iski total height Left side ke charts ke barabar honi chahiye */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] h-full lg:h-[357px] content-start">
            <StatCard title="Total Sales" value="$81,000" change="+10.6%" icon={DollarSign} dark />
            <StatCard title="Purchase Orders" value="1258" change="+10.6%" icon={ShoppingCart} />
            <StatCard title="Products" value="2654" change="+10.6%" icon={Package} />
            <StatCard title="Vendors" value="125" change="+10.6%" icon={Users} />
          </div>

          {/* Top Products/Vendors - Ye ab Recent Orders ke bilkul bagal mein align hoga */}
          <div className="flex flex-col gap-4">
            <TopProductList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;