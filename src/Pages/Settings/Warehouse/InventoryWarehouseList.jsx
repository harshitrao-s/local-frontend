import React, { useEffect, useState } from "react";
import { API_BASE } from "../../../Config/api";
import InventoryWarehouseModals from "./InventoryWarehouseModals";
import Swal from "sweetalert2";
import { apiFetch } from "../../../Utils/apiFetch";
import CommonTable from "../../../Components/Common/CmnTable";
import CmnHeader from "../../../Components/Common/CmnHeader";
import { SbAdminSvg } from "../../../Components/Common/Svgs/ActionsSvg";

const InventoryWarehouseList = () => {
  const [modalConfig, setModalConfig] = useState({ type: null, data: null });
  const [warehouseLocations, setWarehouseLocations] = useState([]);
  const [warehousedata, setWarehousedata] = useState([]);
  const [search, setSearch] = useState("");

  // ✅ Fetch Data
  const fetchData = async () => {
    try {
      const res = await apiFetch(`${API_BASE}api/inventory-locations`);

      if (res?.status) {
        setWarehouseLocations(res.warehouse_locations || []);
        setWarehousedata(res.data || []);
      }
    } catch (err) {
      Swal.fire("Error", "Failed to fetch data", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshTable = () => fetchData();

  // ✅ Delete
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete Inventory Location?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f0f1a",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiFetch(
            `${API_BASE}api/inventory-locations/delete/${id}`,
            { method: "DELETE" }
          );

          if (res.status) {
            Swal.fire("Deleted!", "Inventory removed successfully.", "success");
            refreshTable();
          }
        } catch (e) {
          Swal.fire("Error", "Failed to delete", "error");
        }
      }
    });
  };

  // ✅ Search Filter
  const filteredData = warehousedata.filter((item) =>
    item.warehouse_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.location_name?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Table Config (UPDATED)
  const tableConfig = [
    {
      title: "Warehouse Name",
      field: "warehouse_name",
    },
    {
      title: "Location",
      field: "location_name",
      render: (val) => (
        <span style={{ color: "#6b7280" }}>{val || "—"}</span>
      ),
    },
    {
      title: "Status",
      // align: "center",
      render: (val, row) =>
        row.status === 1 || row.status === "Active" ? (
          <span className="new_badge new_badge-success">ACTIVE</span>
        ) : (
          <span className="new_badge new_badge_inactive">INACTIVE</span>
        ),
    },
    {
      title: "Default",
      // align: "center",
      render: (val, row) =>
        row.is_default === 1 ? (
          <span className="new_badge new_badge-default">DEFAULT</span>
        ) : (
          <span style={{ color: "#d1d5db" }}>—</span>
        ),
    },
    {
      title: "Created",
      field: "created_at",
      render: (val) => (
        <span style={{ fontSize: "12px", color: "#9ca3af" }}>
          {val || "—"}
        </span>
      ),
    },
    {
      title: "Actions",
      field: "created_at",
      render: (val, row) => (
        <div className="d-flex gap-2">
          <div onClick={() => {
            setModalConfig({ type: "edit", data: row })
          }} className="cursor-pointer" >{SbAdminSvg.edit}</div>
          <div className="cursor-pointer" onClick={() => {
            handleDelete(row.warehouse_id)
          }}>{SbAdminSvg.delete}</div>
        </div>
      ),
    },

  ];

  return (
    <div>

      {/* Header */}
      <CmnHeader title="Inventory Warehouse" subtitle="Manage warehouse locations & inventory slots" icon1={"fas fa-warehouse"} icon="iwl-add-btn" actionBtn={() => setModalConfig({ type: "add", data: null })} actionName="Add Location" />

      {/* ✅ Common Table */}
      <CommonTable config={tableConfig} data={filteredData} isSearchable={true} showSearchButton={true}
        showClearButton={true} />

      {/* Modal */}
      {modalConfig.type && (
        <InventoryWarehouseModals
          config={modalConfig}
          warehouseLocations={warehouseLocations}
          onClose={() =>
            setModalConfig({ type: null, data: null })
          }
          onRefresh={refreshTable}
        />
      )}
    </div>
  );
};

export default InventoryWarehouseList;