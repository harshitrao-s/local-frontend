import React, { useEffect, useState, useRef } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { API_BASE } from "../../Config/api";
import BrandModal from "./BrandModal";
import Swal from "sweetalert2";
import { apiFetch } from "../../Utils/apiFetch";
const BrandManagement = () => {
  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);
  const [modalConfig, setModalConfig] = useState({
    show: false,
    mode: 'add',
    initialData: null
  });

  // --- Handlers ---
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
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiFetch(`${API_BASE}api/product_api/api/brands/delete/${id}`, {
            method: "DELETE",
          });

          if (response.status) {
            Swal.fire("Deleted!", "The brand has been deleted.", "success");
            refreshTable();
          } else {
            Swal.fire("Error!", "Failed to delete the brand.", "error");
          }
        } catch (error) {
          Swal.fire("Error!", "Failed to delete.", "error");
        }
      }
    });
  };

  // --- Define Columns INSIDE the component ---
  const columns = [
    {
      title: "ID",
      field: "brand_id",
      width: 100,
      hozAlign: "center", headerSort: false,
      headerHozAlign: "center",
      formatter: (cell) => `<span class="fw-bold text-dark">${cell.getValue()}</span>`
    },
    {
      title: "Name",
      field: "name", headerSort: false,
      hozAlign: "center",
      headerHozAlign: "center",
      Width: 200,
    },
    {
      title: "Status",
      field: "status", headerSort: false,
      width: 120,
      formatter: (cell) => {
        const val = cell.getValue();
        if (val === 1)
          return `<span class="badge badge-success fw-bold">Active</span>`;
        else
          return `<span class="badge badge-secondary fw-bold">In-active</span>`;
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

        // Edit Button Trigger
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-primary";
        editBtn.innerHTML = `<i class="fas fa-edit"></i>`;
        editBtn.onclick = () => openModal('edit', d);

        // Delete Button Trigger
        const delBtn = document.createElement("button");
        delBtn.className = "btn btn-sm btn-outline-danger";
        delBtn.innerHTML = `<i class="fas fa-trash"></i>`;
        delBtn.onclick = () => handleDelete(d.brand_id);

        container.appendChild(editBtn);
        container.appendChild(delBtn);
        return container;
      }
    }
  ];

  useEffect(() => {
    tabulatorRef.current = new Tabulator(tableRef.current, {
      layout: "fitColumns",
      height: "600px",
      pagination: true,
      paginationMode: "remote",
      paginationSize: 20,
      ajaxURL: `${API_BASE}api/product_api/api/brands`,

      ajaxRequestFunc: async function (url, config, params) {
        const query = new URLSearchParams({
          ...params,
          page: params.page || 1,
          size: params.size || 20,
          brand_name: document.getElementById("filter_brand_name")?.value || "",
        }).toString();

        return await apiFetch(`${url}?${query}`, { credentials: "include" });
      },

      ajaxResponse: function (url, params, response) {
        return {
          data: response.data || [],
          last_page: response.last_page || 1,
        };
      },
      columns: columns, // Use the columns defined above
    });

    return () => tabulatorRef.current?.destroy();
  }, []);

  const applyFilter = () => tabulatorRef.current.setPage(1);

  const clearFilter = () => {
    const input = document.getElementById("filter_brand_name");
    if (input) input.value = "";
    tabulatorRef.current.setPage(1);
  };

  return (
    <div className="p-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0 fw-bold">Brand Management</h3>
        <button className="btn btn-dark" onClick={() => openModal('add')}>
          <i className="fas fa-plus me-2"></i>Add Brand
        </button>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-bold">Brand Name</label>
              <input id="filter_brand_name" className="form-control" placeholder="Search..." />
            </div>
            <div className="col-md-4 d-flex gap-2">
              <button className="btn btn-primary" onClick={applyFilter}>Filter</button>
              <button className="btn btn-light" onClick={clearFilter}>Clear</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div ref={tableRef} />
      </div>

      {modalConfig.show && (
        <BrandModal
          mode={modalConfig.mode}
          initialData={modalConfig.initialData}
          onClose={closeModal}
          onRefresh={refreshTable}
        />
      )}
    </div>
  );
};

export default BrandManagement;