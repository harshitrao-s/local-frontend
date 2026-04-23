import React from 'react'
const FONT = "'Inter', system-ui, sans-serif";
const RecentPurchaseOrders = () => {
    const recentOrders = [
        { id: "PO0319", vendor: "GreenLeaf Supplies", date: "16 Apr 2024", status: "Partially Received", statusColor: "warning", total: "7,260.00 AUD", poTotal: "12,750.00 AUD" },
        { id: "PO0318", vendor: "HealthFirst Ltd.", date: "16 Apr 2024", status: "Placed", statusColor: "primary", total: "7,220.00 AUD", poTotal: "8,400.00 AUD" },
        { id: "PO0317", vendor: "GreenLeaf Supplies", date: "16 Apr 2024", status: "Completed", statusColor: "success", total: "1,250.00 AUD", poTotal: "9,200.00 AUD" },
        { id: "PO0316", vendor: "GreenLeaf Supplies", date: "15 Apr 2024", status: "Cancelled", statusColor: "danger", total: "2,220.00 AUD", poTotal: "2,200.00 AUD" },
        { id: "PO0316", vendor: "GreenLeaf Supplies", date: "15 Apr 2024", status: "Cancelled", statusColor: "danger", total: "2,220.00 AUD", poTotal: "2,200.00 AUD" },
    ];
    return (
        <div>
            <div className="card border shadow-sm h-full d-flex flex-column" style={{ borderRadius: 10, fontFamily: FONT, height: 284 }}>
                <div className="card-header" style={{ background: "#fff", borderBottom: "0.5px solid #e5e7eb", borderRadius: "10px 10px 0px 0px" }}>
                    <h6 style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Recent Purchase Orders</h6>
                </div>
                <div className="card-body p-0 d-flex flex-column" style={{ minHeight: 0 }}>
                    <div className="table-responsive" style={{ flex: 1, overflowY: "auto" }}>
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
                                            <span className={`new_badge bg-${o.statusColor} `} style={{ fontFamily: FONT, fontSize: 11, minWidth: '120px', textAlign: "center" }}>
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
    )
}


export default RecentPurchaseOrders