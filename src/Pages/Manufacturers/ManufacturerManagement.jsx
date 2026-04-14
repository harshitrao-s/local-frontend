import React, { useEffect, useState, useRef } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { API_BASE } from "../../Config/api";
import ManufacturerModal from "./ManufacturerModal"; // We will create this next
import Swal from "sweetalert2";
import { apiFetch } from "../../Utils/apiFetch";

const ManufacturerManagement = () => {
  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);
  const [modalConfig, setModalConfig] = useState({ 
    show: false, 
    mode: 'add', 
    initialData: null 
  });

  const openModal = (mode, data = null) => {
    setModalConfig({ show: true, mode, initialData: data });
  };

  const closeModal = () => {
    setModalConfig({ show: false, mode: 'add', initialData: null });
  };

  const refreshTable = () => {
    if (tabulatorRef.current) {
      tabulatorRef.current.setData(); 
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete Manufacturer?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiFetch(`${API_BASE}api/product_api/api/manufacturers/delete/${id}`, { 
            method: "DELETE",
          });

          if (response.status) {
            Swal.fire("Deleted!", "Manufacturer removed.", "success");
            refreshTable();
          } else {
            Swal.fire("Error!", response.message || "Deletion failed.", "error");
          }
        } catch (error) {
          Swal.fire("Error!", "Server communication failed.", "error");
        }
      }
    });
  };

  const columns = [
    { title: "ID", field: "manufacturer_id", width: 100, hozAlign: "center", 
    headerHozAlign: "center", headerSort: false },
    { 
      title: "Manufacturer Name", 
      field: "name", 
      hozAlign: "CENTER",
        headerHozAlign: "center",
      headerSort: false,
      formatter: (cell) => `<span class="fw-bold">${cell.getValue()}</span>`
    },
    { 
      title: "Status", 
      field: "status", 
      hozAlign: "center", 
      headerHozAlign: "center",
      width: 150, 
      headerSort: false,
      formatter: (cell) => {
        const val = cell.getValue();
        return val === 1 
          ? `<span class="badge badge-success">Active</span>` 
          : `<span class="badge badge-secondary">Inactive</span>`;
      }
    },
    {
      title: "Actions",
      width: 150,
      headerSort: false,
      hozAlign: "center",
      formatter: function (cell) {
        const d = cell.getRow().getData();
        const container = document.createElement("div");
        container.className = "d-flex gap-2";

        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-primary";
        editBtn.innerHTML = `<i class="fas fa-pen"></i>`;
        editBtn.onclick = () => openModal('edit', d);

        const delBtn = document.createElement("button");
        delBtn.className = "btn btn-sm btn-outline-danger";
        delBtn.innerHTML = `<i class="fas fa-trash"></i>`;
        delBtn.onclick = () => handleDelete(d.manufacturer_id);

        container.appendChild(editBtn);
        container.appendChild(delBtn);
        return container;
      }
    }
  ];

  useEffect(() => {
    tabulatorRef.current = new Tabulator(tableRef.current, {
      layout: "fitColumns",
      height: "500px",
      pagination: true,
      paginationMode: "remote",
      paginationSize: 15,
      ajaxURL: `${API_BASE}api/product_api/api/manufacturers`,
      ajaxRequestFunc: async function (url, config, params) {
        const query = new URLSearchParams({
          ...params,
          q: document.getElementById("filter_mfg_name")?.value || "",
        }).toString();
        return await apiFetch(`${url}?${query}`, { credentials: "include" });
      },
      ajaxResponse: function (url, params, response) {
        return {
          data: response.data || [],
          last_page: response.last_page || 1,
        };
      },
      columns: columns,
    });
    return () => tabulatorRef.current?.destroy();
  }, []);

  return (
    <div className="p-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0 fw-bold">Manufacturers</h3>
        <button className="btn btn-dark shadow-sm" onClick={() => openModal('add')}>
          <i className="fas fa-plus me-2"></i>Add New
        </button>
      </div>

      <div className="card mb-3 border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label small fw-bold">Manufacturer Name</label>
              <input id="filter_mfg_name" className="form-control" placeholder="Search manufacturers..." />
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary px-4 me-2" onClick={() => tabulatorRef.current.setPage(1)}>Filter</button>
              <button className="btn btn-light px-4" onClick={() => { document.getElementById("filter_mfg_name").value = ""; tabulatorRef.current.setPage(1); }}>Clear</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div ref={tableRef} />
      </div>

      {modalConfig.show && (
        <ManufacturerModal 
          mode={modalConfig.mode} 
          initialData={modalConfig.initialData}
          onClose={closeModal}
          onRefresh={refreshTable}
        />
      )}
    </div>
  );
};

export default ManufacturerManagement;