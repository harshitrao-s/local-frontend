import React, { useEffect, useState } from "react";
import { API_BASE } from "../../../Config/api";
import ShippingProviderModals from "./ShippingProviderModals";
import Swal from "sweetalert2";
import { apiFetch } from "../../../Utils/apiFetch";
import useMasterData from "../../../Context/MasterDataProvider";
import CmnHeader from "../../../Components/Common/CmnHeader";
import CommonTable from "../../../Components/Common/CmnTable";

const ShippingProvidersList = () => {
  const { refreshMasterData } = useMasterData();

  const [searchValue, setSearchValue] = useState("");
  const [modalConfig, setModalConfig] = useState({ type: null, data: null });
  const [shippingProvidersData, setShippingProvidersData] = useState([]);

  const fetchData = async () => {
    try {
      const query = new URLSearchParams({
        search: searchValue || "",
      }).toString();

      const res = await apiFetch(
        `${API_BASE}api/shipping-providers?${query}`
      );

      setShippingProvidersData(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete Provider?",
      text: "This carrier will be removed from your shipping options.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiFetch(
            `${API_BASE}api/shipping-providers/delete/${id}`,
            { method: "DELETE" }
          );

          if (res.status) {
            Swal.fire("Deleted!", "Carrier removed successfully.", "success");
            fetchData(); // 🔥 refresh table
          }
        } catch (e) {
          Swal.fire("Error", e.message || "Failed to delete", "error");
        }
      }
    });
  };

  useEffect(() => {
    refreshMasterData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [searchValue]);

  // ✅ Table Config
  const tableConfig = [
    {
      title: "Carrier Name",
      field: "carrier_name",

    },
    {
      title: "Carrier Code",
      field: "carrier_code",
      render: (val) => (
        <span

        >
          {val || "—"}
        </span>
      ),
    },
    {
      title: "Class Code",
      field: "class_code",
      render: (val) => (
        <span
          
        >
          {val || "—"}
        </span>
      ),
    },
    {
      title: "Tracking URL",
      field: "tracking_url",
      render: (val) => (
        <span >
          {val || "—"}
        </span>
      ),
    },
    {
      title: "Status",
      render: (val, row) =>
        row.status === "Active" || row.status === 1 ? (
          <span className="new_badge new_badge-success">ACTIVE</span>
        ) : (
          <span className="new_badge new_badge_inactive">INACTIVE</span>
        ),
    },
    {
      title: "Actions",
      type: "actions",
      actions: [
        {
          icon: (row) =>
            row.status === "Active" || row.status === 1
              ? "fas fa-eye-slash"
              : "fas fa-eye",
          className: "cl-edit-btn",
          onClick: (row) =>
            setModalConfig({ type: "status", data: row }),
        },
        {
          label: "Edit",
          icon: "fas fa-pen",
          className: "cl-edit-btn",
          onClick: (row) =>
            setModalConfig({ type: "edit", data: row }),
        },
        {
          icon: "fas fa-trash",
          className: "cl-del-btn",
          onClick: (row) => handleDelete(row.carrier_id),
        },
      ],
    },
  ];

  return (
    <div className="cl-wrap">
      <CmnHeader
        title="Shipping Providers"
        subtitle="Manage carriers and shipping options"
        icon1={"fas fa-truck"}
        icon="iwl-add-btn"
        actionBtn={() => setModalConfig({ type: "add", data: null })}
        actionName="Add Provider"
      />

      {/* 🔍 Search */}
      <div className="cl-search-wrap">
        <div className="cl-search-inner">
          <i className="fas fa-search cl-search-icon" />
          <input
            type="text"
            className="cl-search-input"
            placeholder="Search carriers…"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <button className="cl-search-btn" onClick={fetchData}>
          <i className="fas fa-search" /> Search
        </button>

        {searchValue && (
          <button
            className="cl-clear-btn"
            onClick={() => setSearchValue("")}
          >
            Clear
          </button>
        )}
      </div>

      {/* ✅ Only CommonTable */}
      <CommonTable
        config={tableConfig}
        data={shippingProvidersData}
        isSearchable={false}
      />

      {modalConfig.type && (
        <ShippingProviderModals
          config={modalConfig}
          onClose={() => setModalConfig({ type: null, data: null })}
          onRefresh={fetchData} // 🔥 important change
        />
      )}
    </div>
  );
};

export default ShippingProvidersList;