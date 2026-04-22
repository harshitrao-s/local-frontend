// import React from 'react'
// import {
//   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer, PieChart, Pie, Cell, Label
// } from "recharts";
// export const POStatusPieChart = () => {
//     const FONT = "'Inter', system-ui, sans-serif";
//     const poStatusData = [
//         { name: "Placed", value: 720, color: "#4e9af1" },
//         { name: "Receipted", value: 310, color: "#f5a623" },
//         { name: "Completed", value: 185, color: "#4caf8a" },
//         { name: "Cancelled", value: 43, color: "#e05c5c" },
//     ];
//     return (
//         <div className="card border shadow-sm h-100" style={{ borderRadius: 10, fontFamily: FONT }}>
//               <div className="card-header" style={{ background: "#fff", borderBottom: "0.5px solid #e5e7eb", borderRadius: "10px 10px 0 0" }}>
//                 <h6 style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Purchase Order Status</h6>
//               </div>
//               <div className="card-body d-flex flex-column align-items-center justify-content-center">
//                 <div style={{ position: "relative", width: 220, height: 200 }}>
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={poStatusData}
//                         cx="50%" cy="50%"
//                         innerRadius={65} outerRadius={95}
//                         dataKey="value"
//                         startAngle={90} endAngle={-270}
//                       >
//                         {poStatusData.map((entry, i) => (
//                           <Cell key={i} fill={entry.color} />
//                         ))}
//                         <Label
//                           content={() => (
//                             <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
//                               <tspan x="50%" dy="-8" fontSize="26" fontWeight="600" fill="#111827" fontFamily={FONT}>720</tspan>
//                               <tspan x="50%" dy="22" fontSize="12" fill="#6b7280" fontFamily={FONT}>POs</tspan>
//                             </text>
//                           )}
//                         />
//                       </Pie>
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//                 <div className="d-flex flex-wrap justify-content-center gap-3 mt-2">
//                   {poStatusData.map((item, i) => (
//                     <div key={i} className="d-flex align-items-center gap-2">
//                       <div style={{ width: 9, height: 9, borderRadius: "50%", background: item.color }} />
//                       <span style={{ fontSize: 12, color: "#374151" }}>{item.name}</span>
//                       <span style={{ fontSize: 12, fontWeight: 500 }}>{item.value}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//     )
// }


import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export const POStatusPieChart = () => {
  const poStatusData = [
    { name: "Placed", value: 720, color: "#0B3B70" },
    { name: "Receipted", value: 310, color: "#F4B400" },
    { name: "Completed", value: 300, color: "#5B8A0A" },
    { name: "Cancelled", value: 85, color: "#E10600" },
  ];

  const total = poStatusData.reduce((acc, item) => acc + item.value, 0);

  return (
  
//     <div className="w-full h-[100%] rounded-[20px] bg-white border p-4 flex flex-col justify-between">
  
//   {/* Title */}
//   <h3 className="text-[16px] font-semibold text-[#454545] ">
//     Purchase Order Status
//   </h3>

//   {/* Main Section: Responsive alignment */}
//   <div className="flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between 2xl:gap-4">

//     {/* LEFT LIST: Grid of data */}
//     <div className="grid grid-cols-2 gap-x-6 gap-y-3">
//       {poStatusData.map((item, i) => (
//         <div key={i} className="flex items-center justify-between gap-4 min-w-[120px]">
//           <div className="flex items-center gap-2">
//             <div
//               className="w-3 h-3 rounded-full"
//               style={{ background: item.color }}
//             />
//             <span className="text-[12px] text-[#6b7280]">
//               {item.name}
//             </span>
//           </div>
//           <span className="text-[13px] font-semibold text-[#111827]">
//             {item.value}
//           </span>
//         </div>
//       ))}
//     </div>

//     {/* RIGHT DONUT CHART */}
//     {/* Removed mt-4 and self-center on 2xl to align with the list */}
//     <div className="w-[120px] h-[120px] mt-6 self-center 2xl:mt-0 2xl:self-auto">
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart>
//           <Pie
//             data={poStatusData}
//             dataKey="value"
//             innerRadius={35}
//             outerRadius={50}
//             paddingAngle={2}
//           >
//             {poStatusData.map((entry, i) => (
//               <Cell key={i} fill={entry.color} />
//             ))}
//           </Pie>
//         </PieChart>
//       </ResponsiveContainer>
//     </div>

//   </div>
// </div>

<div className="w-full h-[100%] rounded-[20px] bg-white border p-4 flex flex-col">
  
  {/* Title */}
  <h3 className="text-[16px] font-semibold text-[#454545] mb-4">
    Purchase Order Status
  </h3>

  {/* Wrapper for Chart and Data */}
  {/* Yahan 'justify-center' se dono elements center mein aa jayenge aur 'gap-12' se unke beech ka space control hoga */}
  <div className="flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-center 2xl:gap-12 h-full">

    {/* LEFT LIST */}
    <div className="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-1 2xl:grid-cols-2 gap-x-6 gap-y-3">
      {poStatusData.map((item, i) => (
        <div key={i} className="flex items-center justify-between gap-4 min-w-[120px]">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-[12px] text-[#6b7280]">
              {item.name}
            </span>
          </div>
          <span className="text-[13px] font-semibold text-[#111827]">
            {item.value}
          </span>
        </div>
      ))}
    </div>

    {/* RIGHT DONUT */}
    <div className="w-[120px] h-[120px] mt-6 self-center 2xl:mt-0 2xl:self-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={poStatusData}
            dataKey="value"
            innerRadius={35}
            outerRadius={50}
            paddingAngle={2}
          >
            {poStatusData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>

  </div>
</div>
  );
};