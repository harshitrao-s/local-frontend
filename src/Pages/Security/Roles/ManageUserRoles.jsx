import React, { useEffect, useRef, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { API_BASE } from "../../../Config/api";
import RoleModals from "./RoleModals"; 
import Swal from "sweetalert2";
import { apiFetch } from "../../../Utils/apiFetch";

const ManageUserRoles = () => {
    const tableRef = useRef(null);
    const tabulatorRef = useRef(null);
    const [modalConfig, setModalConfig] = useState({ show: false, mode: 'add', data: null });

    const openModal = (mode, data = null) => {
        setModalConfig({ show: true, mode, data });
    };

    const refreshTable = () => {
        if (tabulatorRef.current) tabulatorRef.current.setData();
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Successful 200 response
                    const response = await apiFetch(`${API_BASE}api/roles/delete/${id}`, { method: "DELETE" });
                    Swal.fire("Deleted!", response.message, "success");
                    refreshTable();
                } catch (error) {
                    // This block now catches 400, 500, etc.
                    // 'error' is the JSON object: { status: false, message: "Cannot delete..." }
                    Swal.fire({
                        title: "Deletion Blocked",
                        text: error.message || "An unexpected error occurred",
                        icon: "error"
                    });
                }
            }
        });
    };

    useEffect(() => {
        tabulatorRef.current = new Tabulator(tableRef.current, {
            ajaxURL: `${API_BASE}api/roles`,
            layout: "fitColumns",
            height: "400px",
            // Mapping your JSON response
            ajaxResponse: (url, params, response) => {
                return response.data; // Since your JSON has "data": [...]
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
                { title: "ID", field: "id", width: 100, headerSort: false, hozAlign: "center" ,headerHozAlign: "center",  },
                { title: "Role Name", field: "name", headerSort: false, midth: 200 },
                { 
                    title: "Users Assigned", 
                    field: "user_count", 
                    width: 200, 
                    hozAlign: "center",
                    headerHozAlign: "center", 
                    formatter: (cell) => `<span class="badge bg-light text-dark border">${cell.getValue()} Users</span>`
                },
                {
                    title: "Actions",
                    width: 200,
                    headerSort: false,
                    hozAlign: "center",
                    headerHozAlign: "center",
                    formatter: function (cell) {
                        const d = cell.getData();
                        const container = document.createElement("div");
                        container.className = "d-flex gap-2 justify-content-center align-items-center";

                        const editBtn = document.createElement("button");
                        editBtn.className = "btn btn-sm btn-outline-primary";
                        editBtn.innerHTML = `<i class="fas fa-edit"></i>`;
                        editBtn.onclick = () => openModal('edit', d);

                        const delBtn = document.createElement("button");
                        delBtn.className = "btn btn-sm btn-outline-danger";
                        delBtn.innerHTML = `<i class="fas fa-trash"></i>`;
                        delBtn.onclick = () => handleDelete(d.id);

                        container.appendChild(editBtn);
                        container.appendChild(delBtn);
                        return container;
                    }
                }
            ],
        });
        return () => tabulatorRef.current?.destroy();
    }, []);

    return (
        <div className="p-0 ">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fw-bold mb-0">User Roles</h3>
                <button className="btn btn-dark shadow-sm" onClick={() => openModal('add')}>
                    <i className="fas fa-plus me-2"></i>New Role
                </button>
            </div>

            <div className="card shadow-sm border-0 ps-2 pe-2">
                <div ref={tableRef}></div>
            </div>

            {modalConfig.show && (
                <RoleModals 
                    mode={modalConfig.mode} 
                    initialData={modalConfig.data} 
                    onClose={() => setModalConfig({ ...modalConfig, show: false })}
                    onRefresh={refreshTable}
                />
            )}
        </div>
    );
};

export default ManageUserRoles;