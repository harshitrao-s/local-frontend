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


const StatCard = ({ title, value, change, icon: Icon, titleColor, dark = false }) => {
  return (
    <div
      className={`rounded-[20px] border-1 h-[170px] w-full p-[16px] flex flex-col justify-between ${dark ? "bg-[#002B5B] text-white" : "bg-white border"
        }`}
    >
      {/* Top Content */}
      <div className="flex items-start justify-between">
        <p className={`text-[14px] font-medium ${titleColor ? titleColor : dark ? "text-white" : "text-gray-500"}`}>
          {title}
        </p>
        {Icon && <Icon className={`w-5 h-5 ${dark ? "text-white/80" : "text-gray-400"}`} />}
      </div>

      {/* Bottom Content */}
      <div className="flex items-end justify-between w-full lg:flex-col lg:items-start lg:gap-2 xl:flex-row xl:items-end">
        <h2 className="text-[20px] xl:text-[30px] font-bold leading-none">{value}</h2>
        {change && (
         <div className="flex flex-col items-end lg:items-start xl:items-end">
            <div className="flex items-center gap-1 text-[#04910C] font-semibold leading-none text-[14px]">
              <span>↗</span> {change}
            </div>
            <p className={`text-[11px] mt-1 ${dark ? "text-white/70" : "text-gray-400"}`}>This month</p>
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
    <div className="w-full font-roboto bg-[#f5f6f8]">

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
            <div className="rounded-[20px] w-full md:flex-1 h-[357px]">
              <SalesChart />
            </div>
            <div className="rounded-[20px] w-full md:flex-1 h-[357px]">
              <TopProductList />
            </div>
          </div>

          {/* Recent Orders */}
          <div className="">
            <RecentPurchaseOrders />
            
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:h-[357px] content-between">
            <StatCard title="Total Sales" value="$8100" change="+10.6%" icon={DollarSign} dark />
            <StatCard title="Purchase Orders" value="1258" change="+10.6%" icon={ShoppingCart} />
            <StatCard title="Products" value="2654" change="+10.6%" icon={Package} />
            <StatCard title="Vendors" value="125" change="+10.6%" icon={Users} />
          </div>

          
          <div className="flex flex-col gap-4">
          <POStatusPieChart change="3.6%" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;