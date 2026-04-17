import React, { useEffect, useRef, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { API_BASE } from "../../../Config/api";
import InventoryWarehouseModals from "./InventoryWarehouseModals";
import Swal from "sweetalert2";
import { apiFetch } from "../../../Utils/apiFetch";

const CSS = `
  /* ── header ── */
  .iwl-header {
    display:flex;align-items:center;justify-content:space-between;
    margin-bottom:24px;
  }
  .iwl-title-wrap { display:flex;align-items:center;gap:14px; }
  .iwl-icon {
    width:38px;height:38px;border-radius:12px;
    background:#f5f3ff;
    display:flex;align-items:center;justify-content:center;
    font-size:16px;color:#fff;
    box-shadow:0 4px 16px rgba(0,0,0,.2);
    flex-shrink:0;
    color:#111827;
  }
  .iwl-title { font-size:22px;font-weight:800;color:#0f0f1a;letter-spacing:-.5px;margin:0; }
  .iwl-subtitle { font-size:12px;color:#9ca3af;font-weight:400;margin:0;letter-spacing:.3px; }

  .iwl-add-btn {
    display:inline-flex;align-items:center;gap:8px;
    padding:10px 20px;border-radius:10px;
    background:#0f0f1a;color:#fff;
    border:none;font-size:13px;font-weight:700;
    cursor:pointer;transition:all .18s;
    box-shadow:0 4px 14px rgba(0,0,0,.15);
    letter-spacing:.2px;
  }
  .iwl-add-btn:hover { background:#1f1f35;transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,.2); }
  .iwl-add-btn:active { transform:scale(.97); }

  /* ── search bar ── */
  .iwl-search-wrap {
    background:#fff;border-radius:12px;padding:14px 16px;
    border:1px solid #f0f0f5;margin-bottom:16px;
    display:flex;align-items:center;gap:10px;
  }
  .iwl-search-input {
    flex:1;border:1px solid #e5e7eb;border-radius:8px;
    padding:8px 12px 8px 36px;font-size:13px;
    outline:none;transition:border-color .15s;color:#111827;
  }
  .iwl-search-input:focus { border-color:#0f0f1a;box-shadow:0 0 0 3px rgba(15,15,26,.08); }
  .iwl-search-icon { position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:12px;pointer-events:none; }
  .iwl-search-btn {
    padding:8px 16px;border-radius:8px;background:#0f0f1a;color:#fff;
    border:none;font-size:12px;font-weight:700;cursor:pointer;
    transition:all .15s;white-space:nowrap;
  }
  .iwl-search-btn:hover { background:#1f1f35; }
  .iwl-clear-btn {
    padding:8px 16px;border-radius:8px;background:#f3f4f6;color:#374151;
    border:none;font-size:12px;font-weight:600;cursor:pointer;
    transition:all .15s;white-space:nowrap;
  }
  .iwl-clear-btn:hover { background:#e5e7eb; }

  /* ── table card ── */
  .iwl-table-card {
    background:#fff;border-radius:14px;
    border:1px solid #f0f0f5;
    box-shadow:0 1px 4px rgba(0,0,0,.04);
    overflow:hidden;
  }

  /* ── tabulator overrides ── */
  .iwl-table-card .tabulator {
    border:none!important;border-radius:0!important;font-size:13px!important;
  }
  .iwl-table-card .tabulator-header {
    background:#fafafa!important;border-bottom:1.5px solid #f0f0f5!important;
  }
  .iwl-table-card .tabulator-col { border-right:none!important; }
  .iwl-table-card .tabulator-col-title {
    font-size:10px!important;font-weight:700!important;color:#9ca3af!important;
    text-transform:uppercase!important;letter-spacing:.7px!important;
  }
  .iwl-table-card .tabulator-row {
    border-bottom:1px solid #f8f8fb!important;transition:background .1s!important;
  }
  .iwl-table-card .tabulator-row:hover { background:#fafaff!important; }
  .iwl-table-card .tabulator-row .tabulator-cell {
    padding:11px 14px!important;border-right:none!important;
  }
  .iwl-table-card .tabulator-footer {
    background:#fff!important;border-top:1px solid #f0f0f5!important;
  }
  .iwl-table-card .tabulator-page {
    border-radius:7px!important;font-size:12px!important;font-weight:600!important;
  }
  .iwl-table-card .tabulator-page.active {
    background:#0f0f1a!important;color:#fff!important;border-color:#0f0f1a!important;
  }

  /* ── action btns ── */
  .iwl-edit-btn {
    padding:4px 10px;border-radius:6px;border:1px solid #e5e7eb;
    background:#f8f8fb;cursor:pointer;font-size:11px;color:#374151;
    transition:all .12s;margin-right:4px;
  }
  .iwl-edit-btn:hover { background:#0f0f1a;color:#fff;border-color:#0f0f1a; }
  .iwl-del-btn {
    padding:4px 10px;border-radius:6px;border:1px solid #fee2e2;
    background:#fff5f5;cursor:pointer;font-size:11px;color:#b91c1c;
    transition:all .12s;
  }
  .iwl-del-btn:hover { background:#b91c1c;color:#fff;border-color:#b91c1c; }

  /* ── empty state ── */
  .iwl-empty {
    text-align:center;padding:56px 0;color:#9ca3af;font-size:13px;
  }
  .iwl-empty-icon { font-size:36px;margin-bottom:12px;opacity:.25; }
`;

const InventoryWarehouseList = () => {
  const tableRef     = useRef(null);
  const tabulatorRef = useRef(null);
  const [modalConfig, setModalConfig]               = useState({ type: null, data: null });
  const [warehouseLocations, setWarehouseLocations] = useState([]);
  const [search, setSearch]                         = useState("");

  const refreshTable = () => tabulatorRef.current?.setData();

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
          const res = await apiFetch(`${API_BASE}api/inventory-locations/delete/${id}`, { method: "DELETE" });
          if (res.status) {
            Swal.fire("Deleted!", res.message || "Inventory removed successfully.", "success");
            refreshTable();
          }
        } catch (e) {
          Swal.fire("Error", e.message || "Failed to delete", "error");
        }
      }
    });
  };

  const doSearch = () => {
    if (!tabulatorRef.current) return;
    const val = document.getElementById("iwl_search")?.value || "";
    tabulatorRef.current.setFilter([
      [
        { field: "warehouse_name", type: "like", value: val },
        { field: "location_name",  type: "like", value: val },
      ]
    ]);
  };

  const clearSearch = () => {
    setSearch("");
    tabulatorRef.current?.clearFilter();
  };

  useEffect(() => {
    tabulatorRef.current = new Tabulator(tableRef.current, {
      ajaxURL:  `${API_BASE}api/inventory-locations`,
      layout:   "fitColumns",
      height:   "stretch",
      placeholder: `<div class="iwl-empty"><div class="iwl-empty-icon"><i class="fas fa-warehouse"></i></div>No inventory locations found</div>`,
      ajaxResponse: (url, params, response) => {
        setWarehouseLocations(response.warehouse_locations || []);
        return response.data || [];
      },
      ajaxConfig: {
        method: "GET",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        credentials: "include",
      },
      columns: [
        {
          title: "Warehouse Name", field: "warehouse_name", Width: 200, headerSort: false, 
          formatter: (cell) =>
            `<span style="font-weight:700;color:#0f0f1a;">${cell.getValue()}</span>`
        },
        {
          title: "Location", field: "location_name", width: 200, headerSort: false,
          formatter: (cell) =>
            `<span style="font-size:12px;color:#6b7280;">${cell.getValue() || "—"}</span>`
        },
        {
          title: "Status", field: "status", hozAlign: "center", width: 200, headerSort: false, headerHozAlign: "center", 
          formatter: (cell) => {
            const active = cell.getValue() === 1 || cell.getValue() === "Active";
            return active
              ? `<span  class="new_badge new_badge-success">ACTIVE</span>`
              : `<span class="new_badge new_badge_inactive">INACTIVE</span>`;
          }
        },
        {
          title: "Default", field: "is_default", hozAlign: "center", width: 200, headerSort: false, headerHozAlign: "center",
          formatter: (cell) =>
            cell.getValue() === 1
              ? `<span class="new_badge new_badge-default">DEFAULT</span>`
              : `<span style="font-size:12px;color:#d1d5db;">—</span>`
        },
        {
          title: "Created", field: "created_at", width: 200, headerSort: false, headerHozAlign: "center",
          formatter: (cell) =>
            `<span style="font-size:12px;color:#9ca3af;">${cell.getValue() || "—"}</span>`
        },
        {
          title: "Actions", width: 200, hozAlign: "center", headerSort: false, headerHozAlign: "center",
          formatter: () => `
            <button class="iwl-edit-btn" title="Edit"><i class="fas fa-pen"></i> Edit</button>
            <button class="iwl-del-btn" title="Delete"><i class="fas fa-trash"></i></button>
          `,
          cellClick: (e, cell) => {
            const rowData = cell.getData();
            if (e.target.closest(".iwl-edit-btn")) setModalConfig({ type: "edit", data: rowData });
            else if (e.target.closest(".iwl-del-btn")) handleDelete(rowData.warehouse_id);
          }
        }
      ],
    });
    return () => tabulatorRef.current?.destroy();
  }, []);

  return (
    <div>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div className="iwl-header">
        <div className="iwl-title-wrap">
          <div className="iwl-icon">
            <i className="fas fa-warehouse" />
          </div>
          <div>
            <h3 className="iwl-title">Inventory Warehouse</h3>
            <p className="iwl-subtitle">Manage warehouse locations &amp; inventory slots</p>
          </div>
        </div>
        <button className="iwl-add-btn" onClick={() => setModalConfig({ type: "add", data: null })}>
          <i className="fas fa-plus" style={{ fontSize:11 }} /> Add Location
        </button>
      </div>

      {/* ── Search ── */}
      <div className="iwl-search-wrap">
        <div style={{ position:"relative", flex:1 }}>
          <i className="fas fa-search iwl-search-icon" />
          <input
            id="iwl_search"
            type="text"
            className="iwl-search-input"
            placeholder="Search by warehouse name or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doSearch()}
          />
        </div>
        <button className="iwl-search-btn" onClick={doSearch}>
          <i className="fas fa-search" style={{ marginRight:6 }} /> Search
        </button>
        {search && (
          <button className="iwl-clear-btn" onClick={clearSearch}>
            Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="iwl-table-card">
        <div ref={tableRef} />
      </div>

      {modalConfig.type && (
        <InventoryWarehouseModals
          config={modalConfig}
          warehouseLocations={warehouseLocations}
          onClose={() => setModalConfig({ type: null, data: null })}
          onRefresh={refreshTable}
        />
      )}
    </div>
  );
};

export default InventoryWarehouseList;