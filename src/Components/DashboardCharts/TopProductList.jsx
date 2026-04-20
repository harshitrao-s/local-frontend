import React from 'react'
const FONT = "'Inter', system-ui, sans-serif";
const TopProductList = () => {

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

    return (
        <div>
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
                            borderBottom: "0.5px solid #e5e7eb",
                            borderRadius: "10px 10px 0px 0px"
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
    )
}

export default TopProductList