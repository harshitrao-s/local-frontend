import React, { useEffect, useRef, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { API_BASE } from "../../../Config/api";
import UserModals from "./UserModals";
import { apiFetch } from "../../../Utils/apiFetch";

const UserManagement = () => {
    const tableRef = useRef(null);
    const tabulatorRef = useRef(null);

    // Config for Modals
    const [modalConfig, setModalConfig] = useState({ type: null, data: null });
    // Dynamic roles fetched from the list API
    const [availableRoles, setAvailableRoles] = useState([]);

    const refreshTable = () => {
        if (tabulatorRef.current) tabulatorRef.current.setData();
    };

    useEffect(() => {
        tabulatorRef.current = new Tabulator(tableRef.current, {
            ajaxURL: `${API_BASE}api/users`,
            layout: "fitColumns",
            height: "600px",
            pagination: true,
            paginationMode: "remote",
            paginationSize: 20,

            // Intercept response to get both Users and the Roles list
            ajaxResponse: (url, params, response) => {
                if (response.roles) setAvailableRoles(response.roles);
                return {
                    data: response.data || [],
                    last_page: response.last_page || 1
                };
            },
            ajaxRequestFunc: async function (url, config, params) {
                const query = new URLSearchParams({
                    ...params,
                    page: params.page || 1,
                    size: params.size || 20,
                }).toString();

                return await apiFetch(`${url}?${query}`);
            },
            columns: [
                {
                    title: "Name", field: "name", minWidth: 150, headerSort: false, headerHozAlign: "center",
                    hozAlign: "center",
                },
                {
                    title: "Email", field: "email", minWidth: 200, headerSort: false, headerHozAlign: "center",
                    hozAlign: "center",
                },
                {
                    title: "Roles",
                    field: "role", headerSort: false,
                    headerHozAlign: "center",
                    hozAlign: "center",
                    formatter: (cell) => `<span class="badge bg-info text-white rounded-pill px-3">${cell.getValue() || 'No Role'}</span>`
                },
                {
                    title: "Status",
                    field: "status",
                    hozAlign: "center", headerSort: false,
                    headerHozAlign: "center",
                    hozAlign: "center",
                    formatter: (cell) => {
                        const val = cell.getValue();
                        const color = (val === "Active" || val === 1) ? "bg-success" : "bg-secondary";
                        return `<span class="badge ${color} rounded-pill px-3">${val === 1 ? 'Active' : 'Inactive'}</span>`;
                    }
                },
                {
                    title: "System User",
                    field: "is_system",
                    hozAlign: "center", headerSort: false,
                    headerHozAlign: "center",
                    hozAlign: "center",
                    formatter: (cell) => {
                        const val = cell.getValue();
                        const color = val ? "bg-warning text-dark" : "bg-light text-muted border";
                        return `<span class="badge ${color} rounded-pill px-3">${val ? 'Yes' : 'No'}</span>`;
                    }
                },
                {
                    title: "Actions",
                    width: 150,
                    hozAlign: "center",
                    headerHozAlign: "center",
                    hozAlign: "center",
                    headerSort: false,
                    formatter: function (cell) {
                        const d = cell.getData();
                        const container = document.createElement("div");
                        container.className = "d-flex gap-2 justify-content-center";

                        const pwdBtn = document.createElement("button");
                        pwdBtn.className = "btn btn-sm btn-outline-warning";
                        pwdBtn.title = "Reset Password";
                        pwdBtn.innerHTML = `<i class="fas fa-key"></i>`;
                        pwdBtn.onclick = () => setModalConfig({ type: 'password', data: d });

                        const editBtn = document.createElement("button");
                        editBtn.className = "btn btn-sm btn-outline-success";
                        editBtn.title = "Edit User";
                        editBtn.innerHTML = `<i class="fas fa-pen"></i>`;
                        editBtn.onclick = () => setModalConfig({ type: 'edit', data: d });

                        container.appendChild(pwdBtn);
                        container.appendChild(editBtn);
                        return container;
                    }
                }
            ],
        });
        return () => tabulatorRef.current?.destroy();
    }, []);

    return (
        <div className="p-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0 fw-bold">User Management</h3>
                <button
                    className="btn btn-dark shadow-sm px-4"
                    onClick={() => setModalConfig({ type: 'add', data: null })}
                >
                    <i className="fas fa-plus-circle me-2"></i> Add User
                </button>
            </div>

            <div className="card shadow-sm border-0 rounded-3">
                <div ref={tableRef}></div>
            </div>

            {modalConfig.type && (
                <UserModals
                    config={modalConfig}
                    availableRoles={availableRoles}
                    onClose={() => setModalConfig({ type: null, data: null })}
                    onRefresh={refreshTable}
                />
            )}
        </div>
    );
};

export default UserManagement;