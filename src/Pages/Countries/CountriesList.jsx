import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import Swal from "sweetalert2";
import { API_BASE } from "../../Config/api";
import { apiFetch } from "../../Utils/apiFetch";

const CSS = `
  /* ── header ── */
  .cl-header {
    display:flex;align-items:center;justify-content:space-between;
    margin-bottom:24px;
  }
  .cl-title-wrap { display:flex;align-items:center;gap:14px; }
  .cl-icon {
    width:38px;height:38px;border-radius:12px;
    background:#f5f3ff;
    display:flex;align-items:center;justify-content:center;
    font-size:16px;color:#fff;
    box-shadow:0 4px 16px rgba(0,0,0,.2);
    flex-shrink:0;
    color:#111827;
  }
  .cl-title { font-size:22px;font-weight:800;color:#0f0f1a;letter-spacing:-.5px;margin:0; }
  .cl-subtitle { font-size:12px;color:#9ca3af;font-weight:400;margin:0;letter-spacing:.3px; }

  /* ── search bar ── */
  .cl-search-wrap {
    background:#fff;border-radius:12px;padding:14px 16px;
    border:1px solid #f0f0f5;margin-bottom:16px;
    display:flex;align-items:center;gap:10px;
  }
  .cl-search-input {
    flex:1;border:1px solid #e5e7eb;border-radius:8px;
    padding:8px 12px 8px 36px;font-size:13px;
    outline:none;transition:border-color .15s;color:#111827;
  }
  .cl-search-input:focus { border-color:#0f0f1a;box-shadow:0 0 0 3px rgba(15,15,26,.08); }
  .cl-search-icon { position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:12px;pointer-events:none; }
  .cl-search-btn {
    padding:8px 16px;border-radius:8px;background:#0f0f1a;color:#fff;
    border:none;font-size:12px;font-weight:700;cursor:pointer;
    transition:all .15s;white-space:nowrap;
  }
  .cl-search-btn:hover { background:#1f1f35; }

  /* ── table card ── */
  .cl-table-card {
    width:100%;
    background:#fff;border-radius:14px;
    border:1px solid #f0f0f5;
    box-shadow:0 1px 4px rgba(0,0,0,.04);
    display:flex;
    flex-direction:column;
    flex:1;
    min-height:0;
    overflow:hidden;
  }

  .cl-table-wrap {
    width:100%;
    flex:1;
    min-height:0;
  }

  .cl-wrap {
    display:flex;
    flex-direction:column;
    min-height:100vh;
  }

  .cl-card.tbl-purple {
    width:100%;
    flex:1;
    min-height:0;
    display:flex;
    flex-direction:column;
  }

  .cl-card.tbl-purple .tabulator,
  .cl-card.tbl-purple .tabulator-tableHolder,
  .cl-card.tbl-purple .tabulator-table {
    width:100%!important;
    height:100%!important;
    min-width:0;
    min-height:0;
    box-sizing:border-box;
  }

  .cl-search-wrap {
    width:100%;
  }

  /* ── tabulator overrides ── */
  .cl-table-card .tabulator {
    border:none!important;border-radius:0!important;font-size:13px!important;
  }
  .cl-table-card .tabulator-header {
    background:#fafafa!important;border-bottom:1.5px solid #f0f0f5!important;
  }
  .cl-table-card .tabulator-col { border-right:none!important; }
  .cl-table-card .tabulator-col-title {
    font-size:10px!important;font-weight:700!important;color:#9ca3af!important;
    text-transform:uppercase!important;letter-spacing:.7px!important;
  }
  .cl-table-card .tabulator-row {
    border-bottom:1px solid #f8f8fb!important;transition:background .1s!important;
  }
  .cl-table-card .tabulator-row:hover { background:#fafaff!important; }
  .cl-table-card .tabulator-row .tabulator-cell {
    padding:11px 14px!important;border-right:none!important;
  }
  .cl-table-card .tabulator-footer {
    background:#fff!important;border-top:1px solid #f0f0f5!important;
  }
  .cl-table-card .tabulator-page {
    border-radius:7px!important;font-size:12px!important;font-weight:600!important;
  }
  .cl-table-card .tabulator-page.active {
    background:#0f0f1a!important;color:#fff!important;border-color:#0f0f1a!important;
  }

  /* ── action btns ── */
  .cl-edit-btn {
    padding:4px 10px;border-radius:6px;border:1px solid #e5e7eb;
    background:#f8f8fb;cursor:pointer;font-size:11px;color:#374151;
    transition:all .12s;margin-right:4px;
  }
  .cl-edit-btn:hover { background:#0f0f1a;color:#fff;border-color:#0f0f1a; }
  .cl-del-btn {
    padding:4px 10px;border-radius:6px;border:1px solid #fee2e2;
    background:#fff5f5;cursor:pointer;font-size:11px;color:#b91c1c;
    transition:all .12s;
  }
  .cl-del-btn:hover { background:#b91c1c;color:#fff;border-color:#b91c1c; }

  /* ── empty state ── */
  .cl-empty {
    text-align:center;padding:56px 0;color:#9ca3af;font-size:13px;
  }
  .cl-empty-icon { font-size:36px;margin-bottom:12px;opacity:.25; }
`;

const CountriesList = () => {
  const navigate = useNavigate();
  const tableRef     = useRef(null);
  const tabulatorRef = useRef(null);
  const searchRef    = useRef("");
  const debounceTimer = useRef(null);
  const [search, setSearch] = useState("");

  const refreshTable = () => tabulatorRef.current?.replaceData();

  const handleDelete = useCallback(async (id) => {
    Swal.fire({
      title: "Delete Country?",
      text: "This will remove the country and its associated states.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f0f1a",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiFetch(`${API_BASE}api/countries/delete/${id}`, { method: "DELETE" });
          if (res.status) {
            Swal.fire("Deleted!", "Country removed.", "success");
            refreshTable();
          }
        } catch (e) {
          Swal.fire("Error", e.message || "Failed to delete", "error");
        }
      }
    });
  }, []);

  const doSearch = () => {
    searchRef.current = search;
    if (!tabulatorRef.current) return;
    tabulatorRef.current.replaceData();
  };

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      searchRef.current = search;
      tabulatorRef.current?.replaceData();
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  useEffect(() => {
    tabulatorRef.current = new Tabulator(tableRef.current, {
      ajaxURL: `${API_BASE}api/countries`,
      ajaxRequestFunc: async (url, config, params) => {
        const query = new URLSearchParams({ q: searchRef.current || "" }).toString();
        return await apiFetch(`${url}?${query}`);
      },
      ajaxResponse: (url, params, response) => response.data || [],
      layout: "fitDataStretch",
      height: "100%",
      pagination: "remote",
      paginationSize: 10,
      placeholder: `<div class="cl-state-cell"><div class="cl-state-icon"><i class="fas fa-globe"></i></div>No countries found</div>`,
      ajaxConfig: {
        method: "GET",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        credentials: "include",
      },
      columns: [
        {
          title: "Name", field: "name", width: 300, headerSort: false,
          headerHozAlign: "center",
          hozAlign: "center",
          formatter: (cell) =>
            `<span style="font-weight:700;color:#0f0f1a;">${cell.getValue()}</span>`
        },
        {
          title: "ISO2", field: "iso2", width: 150, headerSort: false, 
          headerHozAlign: "center",
          hozAlign: "center",
          formatter: (cell) =>
            `<span style="font-size:13px;color:#374151;font-weight:600;font-family:monospace;">${cell.getValue()}</span>`
        },
        {
          title: "ISO3", field: "iso3", width: 150, headerSort: false, headerHozAlign: "center",
          hozAlign: "center",
          formatter: (cell) =>
            `<span style="font-size:13px;color:#374151;font-weight:600;font-family:monospace;">${cell.getValue()}</span>`
        },
        {
          title: "# of States", field: "num_states", width: 150, headerSort: false, headerHozAlign: "center",
          hozAlign: "center",
          formatter: (cell) =>
            `<span style="font-size:13px;color:#374151;">${cell.getValue()}</span>`
        },
        {
          title: "Actions", width: 150, hozAlign: "center", headerSort: false, headerHozAlign: "center",
          formatter: () => `
            <button class="cl-edit-btn" title="Edit"><i class="fas fa-pen"></i> Edit</button>
            <button class="cl-del-btn" title="Delete"><i class="fas fa-trash"></i></button>
          `,
          cellClick: (e, cell) => {
            const rowData = cell.getData();
            if (e.target.closest(".cl-edit-btn")) navigate(`/settings/countries/${rowData.id}/edit`);
            else if (e.target.closest(".cl-del-btn")) handleDelete(rowData.id);
          }
        }
      ],
    });
    return () => tabulatorRef.current?.destroy();
  }, [handleDelete, navigate]);

  return (
    <div className="cl-wrap">
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div className="cl-header">
        <div className="cl-title-wrap">
          <div className="cl-icon">
            <i className="fas fa-globe" />
          </div>
          <div>
            <h3 className="cl-title">Countries</h3>
            <p className="cl-subtitle">Manage countries and their states</p>
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="cl-search-wrap">
        <div className="cl-search-inner">
          <i className="fas fa-search cl-search-icon" />
          <input
            type="text"
            className="cl-search-input"
            placeholder="Search by name or ISO…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doSearch()}
          />
        </div>
        <button className="cl-search-btn" onClick={doSearch}>
          <i className="fas fa-search" /> Search
        </button>
        {search && (
          <button className="cl-clear-btn" onClick={() => setSearch("")}>Clear</button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="cl-card tbl-purple" style={{ height: "70vh", maxHeight: "72vh" }}>
        <div ref={tableRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};

export default CountriesList;