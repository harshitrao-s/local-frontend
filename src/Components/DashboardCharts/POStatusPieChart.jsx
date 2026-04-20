import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Label
} from "recharts";
export const POStatusPieChart = () => {
    const FONT = "'Inter', system-ui, sans-serif";
    const poStatusData = [
        { name: "Placed", value: 720, color: "#4e9af1" },
        { name: "Receipted", value: 310, color: "#f5a623" },
        { name: "Completed", value: 185, color: "#4caf8a" },
        { name: "Cancelled", value: 43, color: "#e05c5c" },
    ];
    return (
        <div className="card border shadow-sm h-100" style={{ borderRadius: 10, fontFamily: FONT }}>
              <div className="card-header" style={{ background: "#fff", borderBottom: "0.5px solid #e5e7eb", borderRadius: "10px 10px 0 0" }}>
                <h6 style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Purchase Order Status</h6>
              </div>
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <div style={{ position: "relative", width: 220, height: 200 }}>
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
    )
}
