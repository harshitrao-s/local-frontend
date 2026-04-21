import React, { useEffect, useState } from "react";
import { API_BASE } from "../../../Config/api";
import UserModals from "./UserModals";
import { apiFetch } from "../../../Utils/apiFetch";
import CmnHeader from "../../../Components/Common/CmnHeader";
import CommonTable from "../../../Components/Common/CmnTable";

const UserManagement = () => {
    const [modalConfig, setModalConfig] = useState({ type: null, data: null });
    const [availableRoles, setAvailableRoles] = useState([]);
    const [tableData, setTableData] = useState([]);

    const fetchUsers = async (search = "") => {
        try {
            const res = await apiFetch(`${API_BASE}api/users?search=${search}`);
            if (res?.roles) setAvailableRoles(res.roles);
            setTableData(res?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const tableConfig = [
        {
            title: "Name",
            field: "name",
        },
        {
            title: "Email",
            field: "email",
        },
        {
            title: "Roles",
            field: "role",
            render: (val) => (
                <span className="new_badge new_badge-pending">
                    {val || "No Role"}
                </span>
            ),
        },
        {
            title: "Status",
            field: "status",
            render: (val) => {
                const isActive = val === "Active" || val === 1;
                return (
                    <span
                        className={`new_badge ${isActive ? "new_badge-success" : "new_badge_inactive"
                            }`}
                    >
                        {isActive ? "Active" : "Inactive"}
                    </span>
                );
            },
        },
        {
            title: "System User",
            field: "is_system",
            render: (val) => (
                <span
                    className={`new_badge ${val
                        ? "new_badge-success"
                        : "new_badge_inactive"
                        }`}
                >
                    {val ? "Yes" : "No"}
                </span>
            ),
        },
        {
            title: "Actions",
            field: "actions",
            render: (_, row) => (
                <div className="flex gap-2 ">
                    <button
                        className="px-2 py-1 text-sm border rounded text-yellow-600 border-yellow-400"
                        onClick={() =>
                            setModalConfig({ type: "password", data: row })
                        }
                    >
                        <i className="fas fa-key"></i>
                    </button>

                    <button
                        className="px-2 py-1 text-sm border rounded text-green-600 border-green-400"
                        onClick={() =>
                            setModalConfig({ type: "edit", data: row })
                        }
                    >
                        <i className="fas fa-user-edit"></i>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-0">
            <CmnHeader
                title="User Management"
                subtitle="Manage system users, roles & access"
                icon1="fas fa-users-cog"   // ✅ Better icon
                actionBtn={() => setModalConfig({ type: "add", data: null })}
                actionName="Add User"     // ✅ Fixed naming
            />

            <div className="card shadow-sm border-0 rounded-3 p-3">
                <CommonTable
                    config={tableConfig}
                    data={tableData}
                    isSearchable={true}
                // searchFromApi={true}
                // onSearch={fetchUsers}
                />
            </div>

            {modalConfig.type && (
                <UserModals
                    config={modalConfig}
                    availableRoles={availableRoles}
                    onClose={() =>
                        setModalConfig({ type: null, data: null })
                    }
                    onRefresh={fetchUsers}
                />
            )}
        </div>
    );
};

export default UserManagement;