import React from 'react'
const FONT = "'Inter', system-ui, sans-serif";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Label
} from "recharts";
const TotalInvoice = () => {
    const invoiceStatusData = [
        { name: "Paid", value: 145, color: "#4caf8a" },
        { name: "Unpaid", value: 89, color: "#e05c5c" },
        { name: "Cancelled", value: 23, color: "#9e9e9e" },
        { name: "On Hold", value: 34, color: "#f5a623" },
    ];
    return (
        <div>
            <div className="card border shadow-sm h-100 d-flex flex-column" style={{ borderRadius: 10, fontFamily: FONT, height: 320 }}>
                <div className="card-header" style={{ background: "#fff", borderBottom: "0.5px solid #e5e7eb", borderRadius: "10px 10px 0px 0px" }}>
                    <h6 style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Total Invoices</h6>
                </div>
                <div className="card-body d-flex flex-column align-items-center justify-content-between p-2" style={{ minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height={205}>
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
                    <div className="d-flex flex-wrap justify-content-center gap-2 mt-1">
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
    )
}

export default TotalInvoice