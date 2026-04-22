import React, { useEffect, useState } from "react";
import { API_BASE } from "../../../Config/api";
import RoleModals from "./RoleModals";
import Swal from "sweetalert2";
import { apiFetch } from "../../../Utils/apiFetch";
import CmnHeader from "../../../Components/Common/CmnHeader";
import CommonTable from "../../../Components/Common/CmnTable";

const ManageUserRoles = () => {
  const [data, setData] = useState([]);
  const [modalConfig, setModalConfig] = useState({
    show: false,
    mode: "add",
    data: null,
  });

  const openModal = (mode, data = null) => {
    setModalConfig({ show: true, mode, data });
  };

  const fetchRoles = async () => {
    try {
      const res = await apiFetch(`${API_BASE}api/roles?page=1&size=50`);
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const refreshTable = () => {
    fetchRoles();
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete Role?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiFetch(
            `${API_BASE}api/roles/delete/${id}`,
            { method: "DELETE" }
          );

          Swal.fire("Deleted!", response.message, "success");
          refreshTable();
        } catch (error) {
          Swal.fire({
            title: "Deletion Blocked",
            text: error.message || "An unexpected error occurred",
            icon: "error",
          });
        }
      }
    });
  };

  const tableConfig = [
    {
      title: "ID",
      field: "id",
      render: (val) => <div className="fw-semibold">{val}</div>,
    },
    {
      title: "Role Name",
      field: "name",
      render: (val) => (
        <div className="fw-medium text-dark">
          <i className="fas fa-user-shield me-2 text-primary"></i>
          {val}
        </div>
      ),
    },
    {
      title: "Users Assigned",
      field: "user_count",
      render: (val) => (
        <div>
          <span className="new_badge bg-light text-dark border">
            <i className="fas fa-users me-1"></i>
            {val} Users
          </span>
        </div>
      ),
    },
    {
      title: "Actions",
      field: "actions",
      render: (_, row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => openModal("edit", row)}
          >
            <i className="fas fa-pen"></i>
          </button>

          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(row.id)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* ✅ Common Header with Icon + Subheader */}
      <CmnHeader
        title="User Roles"
        subtitle="Manage roles, permissions, and user assignments"
        icon1="fas fa-user-cog"
        rightContent={
          <button
            className="btn btn-dark d-flex align-items-center"
            onClick={() => openModal("add")}
          >
            <i className="fas fa-plus me-2"></i>
            New Role
          </button>
        }
      />

      {/* ✅ Table Card */}
      <CommonTable
        config={tableConfig}
        data={data}
        isSearchable={true}
      />


      {/* ✅ Modal */}
      {modalConfig.show && (
        <RoleModals
          mode={modalConfig.mode}
          initialData={modalConfig.data}
          onClose={() =>
            setModalConfig({ ...modalConfig, show: false })
          }
          onRefresh={refreshTable}
        />
      )}
    </div>
  );
};

export default ManageUserRoles;