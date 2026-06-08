import React, { useState } from "react";
import CommonTable from "../../Components/Common/CmnTable";

const AuditLog = () => {
    const [tableData] = useState([
        {
            timestamp: "08/06/2026 09:23:15",
            user: "emily.chen",
            role: "Procurement Officer",
            action: "UPDATE",
            module: "Vendor",
            field: "payment_terms",
            old_value: "Net 30",
            new_value: "Net 15",
            ip_address: "203.0.113.45",
            session_id: "sess_9f2d1b"
        },
        {
            timestamp: "08/06/2026 10:05:42",
            user: "james.wilson",
            role: "Finance Manager",
            action: "CREATE",
            module: "Payment",
            field: "approval_limit",
            old_value: "$5,000",
            new_value: "$12,500",
            ip_address: "192.168.12.77",
            session_id: "sess_a7bc4d"
        },
        {
            timestamp: "08/06/2026 10:17:03",
            user: "admin",
            role: "System Admin",
            action: "EXPORT",
            module: "Vendor",
            field: "master_list_export",
            old_value: "N/A",
            new_value: "CSV_export",
            ip_address: "10.10.5.22",
            session_id: "sess_2c3d4e"
        }
    ]);

    const tableConfig = [
        {
            title: "Timestamp",
            field: "timestamp",
        },
        {
            title: "User",
            field: "user",
            render: (val) => (
                <span className="fw-semibold">{val}</span>
            ),
        },
        {
            title: "Role",
            field: "role",
        },
        {
            title: "Action",
            field: "action",
            render: (val) => {
                let cls = "new_badge-info";

                if (val === "CREATE") cls = "new_badge-success";
                else if (val === "UPDATE") cls = "new_badge-pending";
                else if (val === "DELETE") cls = "new_badge-danger";
                else if (val === "EXPORT") cls = "new_badge_inactive";

                return (
                    <span className={`new_badge ${cls}`}>
                        {val}
                    </span>
                );
            },
        },
        {
            title: "Module",
            field: "module",
        },
        {
            title: "Field",
            field: "field",
        },
        {
            title: "Old Value",
            field: "old_value",
        },
        {
            title: "New Value",
            field: "new_value",
        },
        {
            title: "IP Address",
            field: "ip_address",
        },
        {
            title: "Session ID",
            field: "session_id",
        },
    ];

    return (
        <div className="card border-0 shadow-sm">
            <CommonTable
                config={tableConfig}
                data={tableData}
                isSearchable={true}
            />
        </div>
    );
};

export default AuditLog;