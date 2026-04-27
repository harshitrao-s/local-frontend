// // import { useState } from "react";
// // import {
// //   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
// // } from "recharts";
// // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

// // const FONT = "'Inter', system-ui, sans-serif";

// // const salesData = [
// //   { month: "Jan", thisYear: 3800, lastYear: 3200 },
// //   { month: "Feb", thisYear: 4200, lastYear: 3500 },
// //   { month: "Mar", thisYear: 3900, lastYear: 3800 },
// //   { month: "Apr", thisYear: 5200, lastYear: 4100 },
// //   { month: "May", thisYear: 4800, lastYear: 4400 },
// //   { month: "Jun", thisYear: 5500, lastYear: 4600 },
// //   { month: "Jul", thisYear: 5100, lastYear: 4900 },
// //   { month: "Aug", thisYear: 6200, lastYear: 5100 },
// //   { month: "Sep", thisYear: 5800, lastYear: 5400 },
// //   { month: "Oct", thisYear: 6500, lastYear: 5600 },
// //   { month: "Nov", thisYear: 6800, lastYear: 5900 },
// //   { month: "Dec", thisYear: 7200, lastYear: 6100 },
// // ];

// // const SalesChart = ({ data }) => {
// //   const [salesPeriod, setSalesPeriod] = useState("Monthly");
// //   // ── Custom Tooltip ─────────────────────────────────────────────────────────────
// //   const CustomTooltip = ({ active, payload, label }) => {
// //     if (!active || !payload?.length) return null;
// //     return (
// //       <div style={{
// //         background: "#fff", border: "0.5px solid #e5e7eb",
// //         borderRadius: 8, padding: "8px 12px",
// //         fontFamily: FONT, fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
// //       }}>
// //         <div style={{ fontWeight: 500, marginBottom: 4, color: "#374151" }}>{label}</div>
// //         {payload.map((p, i) => (
// //           <div key={i} style={{ color: p.color }}>
// //             {p.name === "thisYear" ? "This Year" : "Last Year"}: ${p.value.toLocaleString()}
// //           </div>
// //         ))}
// //       </div>
// //     );
// //   };

// //   return (
// //     <div className="card border  shadow-sm h-100 d-flex flex-column" style={{ borderRadius: 10, fontFamily: FONT }}>
// //       <div className="p-2 d-flex justify-content-between top_border_design align-items-center" style={{ background: "#fff", borderBottom: "0.5px solid #e5e7eb", borderRadius: "10px 10px 0 0" }}>
// //         <h6 style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Sales Overview</h6>
// //         <button
// //           className="btn btn-sm btn-outline-secondary"
// //           style={{ fontFamily: FONT, fontSize: 11, borderRadius: 6 }}
// //           onClick={() => setSalesPeriod(salesPeriod === "Monthly" ? "Yearly" : "Monthly")}
// //         >
// //           {salesPeriod} <FontAwesomeIcon icon={faChevronDown} className="ms-1" />
// //         </button>
// //       </div>
// //       <div className="card-body p-2 d-flex flex-column ustify-content-between">
// //         <div className="d-flex align-items-center gap-3 mb-2" style={{ fontSize: 11, color: "#6b7280" }}>
// //           <span>Total Sales ($ USD)</span>
// //           <span><span style={{ color: "#4e9af1" }}>●</span> This Year</span>
// //           <span><span style={{ color: "#ccc" }}>●</span> Last Year</span>
// //         </div>
// //         <div style={{ flex: 1 }}>
// //           <ResponsiveContainer width="100%" height="100%">
// //             <AreaChart data={salesData}>
// //               <defs>
// //                 <linearGradient id="thisYearGrad" x1="0" y1="0" x2="0" y2="1">
// //                   <stop offset="5%" stopColor="#4e9af1" stopOpacity={0.2} />
// //                   <stop offset="95%" stopColor="#4e9af1" stopOpacity={0} />
// //                 </linearGradient>
// //                 <linearGradient id="lastYearGrad" x1="0" y1="0" x2="0" y2="1">
// //                   <stop offset="5%" stopColor="#bbb" stopOpacity={0.2} />
// //                   <stop offset="95%" stopColor="#bbb" stopOpacity={0} />
// //                 </linearGradient>
// //               </defs>
// //               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8e8e8" />
// //               <XAxis
// //                 dataKey="month"
// //                 tick={{ fontSize: 11, fontFamily: FONT }}
// //                 height={18}
// //                 axisLine={{ stroke: "#e8e8e8" }}
// //                 tickLine={false}
// //               />
// //               <YAxis
// //                 width={28}
// //                 tick={{ fontSize: 11, fontFamily: FONT }}
// //                 axisLine={false}
// //                 tickLine={false}
// //                 tickFormatter={(v) => `${v / 1000}k`}
// //                 domain={[2500, 8000]}
// //                 ticks={[4000, 5500, 7500]}
// //               />
// //               <Tooltip content={<CustomTooltip />} />
// //               <Area type="monotone" dataKey="lastYear" stroke="#bbb" strokeWidth={2} fill="url(#lastYearGrad)" dot={{ r: 3, fill: "#bbb" }} />
// //               <Area type="monotone" dataKey="thisYear" stroke="#4e9af1" strokeWidth={2} fill="url(#thisYearGrad)" dot={{ r: 3, fill: "#4e9af1" }} />
// //             </AreaChart>
// //           </ResponsiveContainer>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default SalesChart;


// import React from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
// } from "recharts";

// const salesData = [
//   { month: "Jan", avgSale: 3200, avgItem: 2800 },
//   { month: "Feb", avgSale: 2800, avgItem: 3100 },
//   { month: "Mar", avgSale: 2900, avgItem: 3500 },
//   { month: "Apr", avgSale: 3800, avgItem: 3300 },
//   { month: "Jun", avgSale: 4000, avgItem: 3500 },
//   { month: "Jul", avgSale: 3200, avgItem: 3800 },
//   { month: "Aug", avgSale: 2800, avgItem: 3400 },
//   { month: "Sep", avgSale: 3900, avgItem: 3800 },
//   { month: "Oct", avgSale: 4200, avgItem: 3700 },
//   { month: "Nov", avgSale: 4500, avgItem: 4500 },
//   { month: "Des", avgSale: 5200, avgItem: 4300 },
// ];

// const SalesChart = () => {
//   return (
//     /* Main Card - Height/Width original rakhi hai */
//     <div className="w-full h-full bg-white border rounded-[20px] p-6 flex flex-col font-sans">

//       {/* Header Section */}
//       <div className="flex justify-between items-start mb-6">
//         <div>
//           <h2 className="text-[16px] font-semibold text-[#454545] mb-3">Sales Overview</h2>
//           <div className="flex gap-6">
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-[#ff1a1a] rounded-sm"></div>
//               <span className="text-sm text-gray-500">Average Sale Value</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-[#001f5c] rounded-sm"></div>
//               <span className="text-sm text-gray-500">Average item per sale</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Chart Area */}
//       {/* Chart Area */}
//       {/* Chart Area */}
//       <div className="relative flex-1 min-h-0">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart
//             data={salesData}
//             /* Margin bottom ko 0 kiya taaki lines neeche tak aayein */
//             margin={{ top: 10, right: 10, left: -60, bottom: 0 }}
//           >
//             {/* Grid lines automatically poori height le lengi */}
//             <CartesianGrid vertical={true} horizontal={false} stroke="#f3f4f6" />

//             <XAxis
//               dataKey="month"
//               axisLine={false}
//               tickLine={false}
//               tick={{ fill: '#9ca3af', fontSize: 13 }}
//               /* Height fix karne se grid lines yahan tak stretch hongi */
//               height={40}
//               dy={10}
//             />

//             <YAxis
//               hide={true}
//               domain={['dataMin - 500', 'dataMax + 500']}
//             />

//             <Tooltip
//               contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
//             />

//             <Line
//               type="monotone"
//               dataKey="Avg Item"
//               stroke="#001f5c"
//               strokeWidth={3}
//               strokeDasharray="8 8"
//               dot={false}
//             />

//             <Line
//               type="monotone"
//               dataKey="Avg Sale"
//               stroke="#ff1a1a"
//               strokeWidth={3}
//               dot={false}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default SalesChart;


import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const salesData = [
  { month: "Jan", avgSale: 3200, avgItem: 2800 },
  { month: "Feb", avgSale: 2800, avgItem: 3100 },
  { month: "Mar", avgSale: 2900, avgItem: 3500 },
  { month: "Apr", avgSale: 3800, avgItem: 3300 },
  { month: "Jun", avgSale: 4000, avgItem: 3500 },
  { month: "Jul", avgSale: 3200, avgItem: 3800 },
  { month: "Aug", avgSale: 2800, avgItem: 3400 },
  { month: "Sep", avgSale: 3900, avgItem: 3800 },
  { month: "Oct", avgSale: 4200, avgItem: 3700 },
  { month: "Nov", avgSale: 4500, avgItem: 4500 },
  { month: "Des", avgSale: 5200, avgItem: 4300 },
];

const SalesChart = () => {
  return (
    <div className="w-full h-full bg-white border rounded-[20px] p-6 flex flex-col font-sans">

      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[16px] font-semibold text-[#454545] mb-3 font-roboto">Sales Overview</h2>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#ff1a1a] rounded-sm"></div>
              <span className="text-[12px] text-[#737373]">Average Sale Value</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#001f5c] rounded-sm"></div>
              <span className="text-[12px] text-[#737373]">Average item per sale</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area Container */}
      <div className="relative flex-1 min-h-0">

        {/* --- NEW OVERLAY BOXES --- */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 flex gap-3 w-full justify-center px-4 pointer-events-none">
          {/* Average Item Box (Dashed Border) - Reduced Size */}
          <div className="bg-white border-[1.5px] border-dashed border-[#001f5c] rounded-xl py-1 px-2  min-w-[120px] text-center">
            <p className="text-[10px]  text-[#888888] font-medium leading-tight">Average item per sale</p>
            <p className="text-[12px] font-bold text-[##888888]">$ 211,411,223</p>
          </div>

          {/* Average Year Value Box (Solid Red) - Reduced Size */}
          <div className="bg-[#ff1a1a] rounded-xl py-1 px-2  min-w-[120px]  text-center">
            <p className="text-[10px]  text-[#F6F6F6] font-medium leading-tight">Average year value</p>
            <p className="text-[12px] font-bold text-[#F6F6F6]">$ 339,091,888</p>
          </div>
        </div>
        {/* --- END OVERLAY BOXES --- */}

        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={salesData}
            margin={{ top: 60, right: 10, left: -60, bottom: 0 }} // Increased top margin to give boxes space
          >
            <CartesianGrid vertical={true} horizontal={false} stroke="#f3f4f6" />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 13 }}
              height={40}
              dy={10}
            />

            <YAxis
              hide={true}
              domain={['dataMin - 500', 'dataMax + 500']}
            />

            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />

            <Line
              type="monotone"
              dataKey="avgItem"
              stroke="#001f5c"
              strokeWidth={3}
              strokeDasharray="8 8"
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="avgSale"
              stroke="#ff1a1a"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;