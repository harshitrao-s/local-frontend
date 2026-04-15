import React, { useEffect, useRef, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { API_BASE } from "../../../Config/api";
import PaymentTermModals from "./PaymentTermModals";
import Swal from "sweetalert2";
import { apiFetch } from "../../../Utils/apiFetch";
import { useMasterData } from "../../../Context/MasterDataProvider";

const CSS = `
  /* ── header ── */
  .ptl-header {
    display:flex;align-items:center;justify-content:space-between;
    margin-bottom:24px;
  }
  .ptl-title-wrap { display:flex;align-items:center;gap:14px; }
  .ptl-icon {
    width:38px;height:38px;border-radius:12px;
    background:#f5f3ff;
    display:flex;align-items:center;justify-content:center;
    font-size:16px;
    box-shadow:0 4px 16px rgba(0,0,0,.2);
    flex-shrink:0;
    color:#111827;
  }
  .ptl-title { font-size:22px;font-weight:800;color:#0f0f1a;letter-spacing:-.5px;margin:0; }
  .ptl-subtitle { font-size:12px;color:#9ca3af;font-weight:400;margin:0;letter-spacing:.3px; }

  .ptl-add-btn {
    display:inline-flex;align-items:center;gap:8px;
    padding:10px 20px;border-radius:10px;
    background:#0f0f1a;color:#fff;
    border:none;font-size:13px;font-weight:700;
    cursor:pointer;transition:all .18s;
    box-shadow:0 4px 14px rgba(0,0,0,.15);
    letter-spacing:.2px;
  }
  .ptl-add-btn:hover { background:#1f1f35;transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,.2); }
  .ptl-add-btn:active { transform:scale(.97); }

  /* ── search bar ── */
  .ptl-search-wrap {
    background:#fff;border-radius:12px;padding:14px 16px;
    border:1px solid #f0f0f5;margin-bottom:16px;
    display:flex;align-items:center;gap:10px;
  }
  .ptl-search-input {
    flex:1;border:1px solid #e5e7eb;border-radius:8px;
    padding:8px 12px 8px 36px;font-size:13px;
    outline:none;transition:border-color .15s;color:#111827;
  }
  .ptl-search-input:focus { border-color:#0f0f1a;box-shadow:0 0 0 3px rgba(15,15,26,.08); }
  .ptl-search-icon { position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:12px;pointer-events:none; }
  .ptl-search-btn {
    padding:8px 16px;border-radius:8px;background:#0f0f1a;color:#fff;
    border:none;font-size:12px;font-weight:700;cursor:pointer;
    transition:all .15s;white-space:nowrap;
  }
  .ptl-search-btn:hover { background:#1f1f35; }
  .ptl-clear-btn {
    padding:8px 16px;border-radius:8px;background:#f3f4f6;color:#374151;
    border:none;font-size:12px;font-weight:600;cursor:pointer;
    transition:all .15s;white-space:nowrap;
  }
  .ptl-clear-btn:hover { background:#e5e7eb; }

  /* ── table card ── */
  .ptl-table-card {
    background:#fff;border-radius:14px;
    border:1px solid #f0f0f5;
    box-shadow:0 1px 4px rgba(0,0,0,.04);
    overflow:hidden;
  }

  /* ── tabulator overrides ── */
  .ptl-table-card .tabulator {
    border:none!important;border-radius:0!important;font-size:13px!important;
  }
  .ptl-table-card .tabulator-header {
    background:#fafafa!important;border-bottom:1.5px solid #f0f0f5!important;
  }
  .ptl-table-card .tabulator-col { border-right:none!important; }
  .ptl-table-card .tabulator-col-title {
    font-size:10px!important;font-weight:700!important;color:#9ca3af!important;
    text-transform:uppercase!important;letter-spacing:.7px!important;
  }
  .ptl-table-card .tabulator-row {
    border-bottom:1px solid #f8f8fb!important;transition:background .1s!important;
  }
  .ptl-table-card .tabulator-row:hover { background:#fafaff!important; }
  .ptl-table-card .tabulator-row .tabulator-cell {
    padding:11px 14px!important;border-right:none!important;
  }
  .ptl-table-card .tabulator-footer {
    background:#fff!important;border-top:1px solid #f0f0f5!important;
  }
  .ptl-table-card .tabulator-page {
    border-radius:7px!important;font-size:12px!important;font-weight:600!important;
  }
  .ptl-table-card .tabulator-page.active {
    background:#0f0f1a!important;color:#fff!important;border-color:#0f0f1a!important;
  }

  /* ── action btns ── */
  .ptl-edit-btn {
    padding:4px 10px;border-radius:6px;border:1px solid #e5e7eb;
    background:#f8f8fb;cursor:pointer;font-size:11px;color:#374151;
    transition:all .12s;margin-right:4px;
  }
  .ptl-edit-btn:hover { background:#0f0f1a;color:#fff;border-color:#0f0f1a; }
  .ptl-del-btn {
    padding:4px 10px;border-radius:6px;border:1px solid #fee2e2;
    background:#fff5f5;cursor:pointer;font-size:11px;color:#b91c1c;
    transition:all .12s;
  }
  .ptl-del-btn:hover { background:#b91c1c;color:#fff;border-color:#b91c1c; }

  /* ── empty state ── */
  .ptl-empty {
    text-align:center;padding:56px 0;color:#9ca3af;font-size:13px;
  }
  .ptl-empty-icon { font-size:36px;margin-bottom:12px;opacity:.25; }
`;

const PaymentTermsList = () => {
  const { refreshMasterData } = useMasterData();
  const tableRef     = useRef(null);
  const tabulatorRef = useRef(null);
  const [modalConfig, setModalConfig] = useState({ type: null, data: null });
  const [search, setSearch]           = useState("");
  const [totalCount, setTotalCount]   = useState(0);
  const termOptionLabels = {
    frequency: "Frequency",
    nextMonth14: "14th of Next Month",
    nextMonthLastDay: "Last day of Next Month",
    nextNextMonthLastDay: "Last day of Next to Next Month",
  };

  const refreshTable = () => tabulatorRef.current?.setData();

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete Payment Term?",
      text: "Are you sure you want to remove this term?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f0f1a",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiFetch(`${API_BASE}api/payment-terms/delete/${id}`, { method: "DELETE" });
          if (res.status) {
            Swal.fire("Deleted!", "Term removed successfully.", "success");
            await refreshMasterData();
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
    const val = document.getElementById("ptl_search")?.value || "";
    tabulatorRef.current.setFilter([
      [
        { field: "name",      type: "like", value: val },
        { field: "type_label", type: "like", value: val },
      ]
    ]);
  };

  const clearSearch = () => {
    setSearch("");
    tabulatorRef.current?.clearFilter();
  };

  useEffect(() => {
    tabulatorRef.current = new Tabulator(tableRef.current, {
      ajaxURL: `${API_BASE}api/payment-terms`,
      layout:  "fitColumns",
      height:  "700px",
      placeholder: `<div class="ptl-empty"><div class="ptl-empty-icon"><i class="fas fa-file-invoice-dollar"></i></div>No payment terms found</div>`,
      ajaxResponse: (url, params, response) => {
        const rows = response.data || [];
        setTotalCount(response.total_record || rows.length || 0);
        return rows;
      },
      ajaxRequestFunc: async function (url, config, params) {
        const query = new URLSearchParams({
          ...params,
          page: params.page || 1,
          size: params.size || 20,
        }).toString();
        const res = await fetch(`${url}?${query}`, { credentials: "include" });
        return await res.json();
      },
      columns: [
        {
          title: "Name", field: "name", minWidth: 200, headerSort: false,
          formatter: (cell) =>
            `<span style="font-weight:700;color:#0f0f1a;">${cell.getValue() || "—"}</span>`
        },
        {
          title: "Type", field: "type", hozAlign: "center",headerHozAlign: "center", width: 110, headerSort: false,
          formatter: (cell) => {
            const val = cell.getValue();
            if (val === "" || val === null || val === undefined) return "—";
            const isPrepaid = Number(val) === 1;
            return `<span style="
              padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;
              background:${isPrepaid ? "#dbeafe" : "#fef9c3"};
              color:${isPrepaid ? "#1d4ed8" : "#854d0e"};
              border:1px solid ${isPrepaid ? "#bfdbfe" : "#fde68a"};
            ">${isPrepaid ? "Prepaid" : "Postpaid"}</span>`;
          }
        },
        {
          title: "Frequency (Days)", field: "frequency", hozAlign: "center", width: 160, headerSort: false,
          formatter: (cell) => {
            const val = cell.getValue();
            const termOption = cell.getRow().getData()?.term_option;
            if (!val) return `<span style="color:#d1d5db;">—</span>`;
            if (termOption && termOption !== "frequency") {
              return `<span style="
                background:#fff7ed;color:#9a3412;
                padding:3px 10px;border-radius:6px;
                font-size:12px;font-weight:600;
              ">${termOptionLabels[termOption] || "Custom Term"}</span>`;
            }
            return `<span style="
              background:#f1f5f9;color:#475569;
              padding:3px 10px;border-radius:6px;
              font-size:12px;font-weight:600;
            ">${val} days</span>`;
          }
        },
        {
          title: "Status", field: "status", headerHozAlign: "center", hozAlign: "center", width: 120, headerSort: false,
          formatter: (cell) => {
            const raw = cell.getValue();
            const active = String(raw).toLowerCase() === "active" || String(raw) === "1";
            return active
              ? `<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:#dcfce7;color:#15803d;">ACTIVE</span>`
              : `<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:#fee2e2;color:#b91c1c;">INACTIVE</span>`;
          }
        },
        {
          title: "Actions", width: 130, hozAlign: "center", headerSort: false,
          formatter: () => `
            <button class="ptl-edit-btn" title="Edit"><i class="fas fa-pen"></i> Edit</button>
            <button class="ptl-del-btn" title="Delete"><i class="fas fa-trash"></i></button>
          `,
          cellClick: (e, cell) => {
            const rowData = cell.getData();
            if (e.target.closest(".ptl-edit-btn")) setModalConfig({ type: "edit", data: rowData });
            else if (e.target.closest(".ptl-del-btn")) handleDelete(rowData.id);
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
      <div className="ptl-header">
        <div className="ptl-title-wrap">
          <div className="ptl-icon">
            <i className="fas fa-file-invoice-dollar" />
          </div>
          <div>
            <h3 className="ptl-title">Payment Terms</h3>
            <p className="ptl-subtitle">
              {totalCount > 0 ? `${totalCount} terms configured` : "Manage vendor payment terms"}
            </p>
          </div>
        </div>
        <button className="ptl-add-btn" onClick={() => setModalConfig({ type: "add", data: null })}>
          <i className="fas fa-plus" style={{ fontSize: 11 }} /> Add Term
        </button>
      </div>

      {/* ── Search ── */}
      <div className="ptl-search-wrap">
        <div style={{ position: "relative", flex: 1 }}>
          <i className="fas fa-search ptl-search-icon" />
          <input
            id="ptl_search"
            type="text"
            className="ptl-search-input"
            placeholder="Search by name or type…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doSearch()}
          />
        </div>
        <button className="ptl-search-btn" onClick={doSearch}>
          <i className="fas fa-search" style={{ marginRight: 6 }} /> Search
        </button>
        {search && (
          <button className="ptl-clear-btn" onClick={clearSearch}>Clear</button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="ptl-table-card">
        <div ref={tableRef} />
      </div>

      {modalConfig.type && (
        <PaymentTermModals
          config={modalConfig}
          onClose={() => setModalConfig({ type: null, data: null })}
          onRefresh={refreshTable}
        />
      )}
    </div>
  );
};

export default PaymentTermsList;