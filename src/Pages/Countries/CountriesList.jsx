import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import Swal from "sweetalert2";
import { API_BASE } from "../../Config/api";
import { apiFetch } from "../../Utils/apiFetch";

const CSS = `
  .cl-header {
    display:flex;align-items:center;justify-content:space-between;
    margin-bottom:16px;
  }

  .cl-title-wrap { display:flex;align-items:center;gap:14px; }

  .cl-icon {
    width:38px;height:38px;border-radius:12px;
    background:#f5f3ff;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 16px rgba(0,0,0,.2);
    color:#111827;
  }

  .cl-title { font-size:22px;font-weight:800;margin:0; }
  .cl-subtitle { font-size:12px;color:#9ca3af;margin:0; }

  .cl-search-wrap {
    background:#fff;border-radius:12px;padding:12px;
    border:1px solid #f0f0f5;margin-bottom:12px;
    display:flex;gap:10px;
  }

  .cl-search-inner { position:relative; flex:1; }

  .cl-search-input {
    width:100%;
    border:1px solid #e5e7eb;border-radius:8px;
    padding:8px 12px 8px 36px;font-size:13px;
  }

  .cl-search-icon {
    position:absolute;left:10px;top:50%;
    transform:translateY(-50%);
    color:#9ca3af;font-size:12px;
  }

  .cl-search-btn {
    padding:8px 16px;border-radius:8px;
    background:#0f0f1a;color:#fff;
    border:none;font-size:12px;font-weight:700;
  }

  .cl-clear-btn {
    padding:8px 12px;border-radius:8px;
    border:1px solid #e5e7eb;background:#fff;
    font-size:12px;
  }

  .cl-card.tbl-purple {
    width:100%;
    height:100%;
  }

  .cl-card.tbl-purple .tabulator {
    width:100%!important;
    height:100%!important;
  }

  .tabulator-cell {
    text-align: left !important;
  }

  .tabulator-col-title {
    text-align: left !important;
  }

  .cl-edit-btn {
    padding:4px 10px;border-radius:6px;
    border:1px solid #e5e7eb;
    background:#f8f8fb;font-size:11px;
    margin-right:4px;cursor:pointer;
  }

  .cl-del-btn {
    padding:4px 10px;border-radius:6px;
    border:1px solid #fee2e2;
    background:#fff5f5;font-size:11px;
    color:#b91c1c;cursor:pointer;
  }
`;

const CountriesList = () => {
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);
  const searchRef = useRef("");
  const debounceTimer = useRef(null);
  const [search, setSearch] = useState("");

  const refreshTable = () => tabulatorRef.current?.replaceData();

  const handleDelete = useCallback(async (id) => {
    Swal.fire({
      title: "Delete Country?",
      text: "This will remove the country and its states.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f0f1a",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiFetch(`${API_BASE}api/countries/delete/${id}`, {
            method: "DELETE",
          });
          if (res.status) {
            Swal.fire("Deleted!", "Country removed.", "success");
            refreshTable();
          }
        } catch (e) {
          Swal.fire("Error", e.message || "Failed", "error");
        }
      }
    });
  }, []);

  const doSearch = () => {
    searchRef.current = search;
    tabulatorRef.current?.replaceData();
  };

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      searchRef.current = search;
      tabulatorRef.current?.replaceData();
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  useEffect(() => {
    tabulatorRef.current = new Tabulator(tableRef.current, {
      ajaxURL: `${API_BASE}api/countries`,
      ajaxRequestFunc: async (url) => {
        const query = new URLSearchParams({
          q: searchRef.current || "",
        }).toString();
        return await apiFetch(`${url}?${query}`);
      },
      ajaxResponse: (url, params, res) => res.data || [],

      layout: "fitColumns",
      height: "100%", // full inside parent

      pagination: "remote",
      paginationSize: 10,

      columns: [
        { title: "Name", field: "name", widthGrow: 1 },
        { title: "ISO2", field: "iso2", widthGrow: 1 },
        { title: "ISO3", field: "iso3", widthGrow: 1 },
        { title: "# States", field: "num_states", widthGrow: 1 },
        {
          title: "Actions",
          widthGrow: 1,
          formatter: () => `
            <button class="cl-edit-btn">Edit</button>
            <button class="cl-del-btn">Delete</button>
          `,
          cellClick: (e, cell) => {
            const row = cell.getData();
            if (e.target.closest(".cl-edit-btn")) {
              navigate(`/settings/countries/${row.id}/edit`);
            } else if (e.target.closest(".cl-del-btn")) {
              handleDelete(row.id);
            }
          },
        },
      ],
    });

    return () => tabulatorRef.current?.destroy();
  }, [handleDelete, navigate]);

  return (
    <div
      style={{
        height: "stretch", // ✅ 95% of available space
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{CSS}</style>

      <div className="cl-header">
        <div className="cl-title-wrap">
          <div className="cl-icon">
            <i className="fas fa-globe" />
          </div>
          <div>
            <h3 className="cl-title">Countries</h3>
            <p className="cl-subtitle">Manage countries</p>
          </div>
        </div>
      </div>

      <div className="cl-search-wrap">
        <div className="cl-search-inner">
          <i className="fas fa-search cl-search-icon" />
          <input
            className="cl-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
          />
        </div>

        <button className="cl-search-btn" onClick={doSearch}>
          Search
        </button>

        {search && (
          <button className="cl-clear-btn" onClick={() => setSearch("")}>
            Clear
          </button>
        )}
      </div>

      {/* TABLE */}
      <div
        className="cl-card tbl-purple"
        style={{ flex: 1, minHeight: 0 }}
      >
        <div ref={tableRef} style={{ height: "100%" }} />
      </div>
    </div>
  );
};

export default CountriesList;