import React, { useEffect, useRef, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { API_BASE } from "../../../Config/api";
import ShippingProviderModals from "./ShippingProviderModals";
import Swal from "sweetalert2";
import { apiFetch } from "../../../Utils/apiFetch";
import useMasterData from "../../../Context/MasterDataProvider";

const ShippingProvidersList = () => {
  const tableRef     = useRef(null);
  const tabulatorRef = useRef(null);
  const { refreshMasterData } = useMasterData();
  const [searchValue, setSearchValue] = useState("");
  const [modalConfig, setModalConfig] = useState({ type: null, data: null });

  const refreshTable = () => tabulatorRef.current?.setData();


  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete Provider?",
      text: "This carrier will be removed from your shipping options.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiFetch(`${API_BASE}api/shipping-providers/delete/${id}`, { method: "DELETE" });
          if (res.status) {
            Swal.fire("Deleted!", "Carrier removed successfully.", "success");
            refreshTable();
          }
        } catch (e) {
          Swal.fire("Error", e.message || "Failed to delete", "error");
        }
      }
    });
  };

  useEffect(() => { refreshMasterData(); }, []);

  useEffect(() => {
    if (tabulatorRef.current) {
        tabulatorRef.current.destroy();
        tabulatorRef.current = null;
    }
    tabulatorRef.current = new Tabulator(tableRef.current, {
      layout:   "fitColumns",
      height:   "stretch",
      placeholder: `<div class="cl-state-cell"><div class="cl-state-icon"><i class="fas fa-truck"></i></div>No shipping providers found</div>`,
      ajaxURL:  `${API_BASE}api/shipping-providers`,
      ajaxRequestFunc: async (url, config, params) => {
        const query = new URLSearchParams({ search: searchValue || "" }).toString();
        return await apiFetch(`${url}?${query}`);
      },
      ajaxResponse: (url, params, response) => response.data || [],
      columns: [
        {
          title: "Carrier Name", field: "carrier_name", maxWidth: 300, headerSort: false,
          formatter: (cell) =>
            `<span style="font-weight:700;color:#111827;font-size:14px;">${cell.getValue()}</span>`
        },
        {
          title: "Carrier Code", field: "carrier_code", width: 250, headerSort: false,
          formatter: (cell) =>
            `<span style="font-size:13px;color:#374151;font-weight:600;font-family:monospace;">${cell.getValue() || "—"}</span>`
        },
        {
          title: "Class Code", field: "class_code", width: 250, headerSort: false,
          formatter: (cell) =>
            `<span style="font-size:13px;color:#374151;font-weight:600;font-family:monospace;">${cell.getValue() || "—"}</span>`
        },
        {
          title: "Tracking URL", field: "tracking_url", Width: 200, headerSort: false,
          formatter: (cell) =>
            `<span style="font-size:12px;color:#6b7280;">${cell.getValue() || "—"}</span>`
        },
        {
          title: "Status", field: "status", width: 250, headerSort: false,
          formatter: (cell) => {
            const active = cell.getValue() === "Active" || cell.getValue() === 1;
            return active
              ? `<span  class="new_badge new_badge-success">ACTIVE</span>`
              : `<span class="new_badge new_badge_inactive">INACTIVE</span>`;
          }
        },
        {
            title: "Actions", width: 180, headerSort: false,
            formatter: function(cell) {
                const d = cell.getData();
                const statusIcon = (d.status === "Active" || d.status === 1) ? "fa-eye-slash" : "fa-eye";
                
                const wrap = document.createElement("div");
                wrap.style.cssText = "display:flex;gap:5px;justify-content:center;align-items:center;";

                const statusBtn = document.createElement("button");
                statusBtn.className = "cl-edit-btn status-btn";
                statusBtn.innerHTML = `<i class="fas ${statusIcon}"></i>`;

                const editBtn = document.createElement("button");
                editBtn.className = "cl-edit-btn edit-btn";
                editBtn.innerHTML = `<i class="fas fa-pen"></i> Edit`;

                const delBtn = document.createElement("button");
                delBtn.className = "cl-del-btn delete-btn";
                delBtn.innerHTML = `<i class="fas fa-trash"></i>`;

                wrap.appendChild(statusBtn);
                wrap.appendChild(editBtn);
                wrap.appendChild(delBtn);

                return wrap;
            },
            cellClick: (e, cell) => {
                const btn = e.target.closest("button");
                if (!btn) return;
                const rowData = cell.getData();
                if (btn.classList.contains("status-btn"))      setModalConfig({ type: "status", data: rowData });
                else if (btn.classList.contains("edit-btn"))   setModalConfig({ type: "edit",   data: rowData });
                else if (btn.classList.contains("delete-btn")) handleDelete(rowData.carrier_id);
            }
            }
      ],
    });
    return () => tabulatorRef.current?.destroy();
  }, [searchValue]);

  return (
    <div className="cl-wrap">

      <div className="cl-header">
        <div className="cl-title-wrap">
          <div className="cl-icon">
            <i className="fas fa-truck" />
          </div>
          <div>
            <h3 className="cl-title">Shipping Providers</h3>
            <p className="cl-subtitle">Manage carriers and shipping options</p>
          </div>
        </div>
        <button className="cl-search-btn" onClick={() => setModalConfig({ type: "add", data: null })}>
          <i className="fas fa-plus" /> New Provider
        </button>
      </div>

      <div className="cl-search-wrap">
        <div className="cl-search-inner">
          <i className="fas fa-search cl-search-icon" />
          <input
            type="text"
            className="cl-search-input"
            placeholder="Search carriers…"
            value={searchValue}
            onChange={e => {
              setSearchValue(e.target.value);
              tabulatorRef.current?.replaceData();
            }}
          />
        </div>
        <button className="cl-search-btn" onClick={() => tabulatorRef.current?.replaceData()}>
          <i className="fas fa-search" /> Search
        </button>
        {searchValue && (
          <button className="cl-clear-btn" onClick={() => { setSearchValue(""); tabulatorRef.current?.replaceData(); }}>
            Clear
          </button>
        )}
      </div>

      <div className="cl-card tbl-purple" style={{ height: "calc(100vh - 270px)" }}>
        <div ref={tableRef} style={{ height: "100%" }} />
      </div>

      {modalConfig.type && (
        <ShippingProviderModals
          config={modalConfig}
          onClose={() => setModalConfig({ type: null, data: null })}
          onRefresh={refreshTable}
        />
      )}
    </div>
  );
};

export default ShippingProvidersList;