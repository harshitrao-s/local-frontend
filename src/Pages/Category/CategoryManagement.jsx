import React, { useEffect, useState, useRef } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { API_BASE } from "../../Config/api";
import CategoryModal from "./CategoryModal";
import Swal from "sweetalert2";
import { apiFetch } from "../../Utils/apiFetch";
import CmnHeader from "../../Components/Common/CmnHeader";
const CategoryManagement = () => {
  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);
  const [modalConfig, setModalConfig] = useState({
    show: false,
    mode: 'add',
    initialData: null
  });
  const [categoriesmanagementdata, setCategoriesmanagementdata] = useState([])
  const [main_categories, setMain_categories] = useState([]);
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
          const response = await apiFetch(`${API_BASE}api/product_api/product_categories/delete/${id}`, {
            method: "DELETE",
          });

          if (response.status) {
            Swal.fire("Deleted!", "The Category has been deleted.", "success");
            refreshTable();
          } else {
            Swal.fire("Error!", "Failed to delete the Category.", "error");
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
      title: "Name",
      field: "name",

      hozAlign: "left", headerSort: false,
      formatter: (cell) => `<span class="fw-bold text-dark">${cell.getValue()}</span>`
    },
    {
      title: "Type",
      field: "is_primary", headerSort: false,
      minWidth: 100,
      formatter: (cell) => {
        const val = cell.getValue();

        if (val === 1) {
          return `<span class="new_badge badge-success fw-bold" style="min-width: 70px; text-align: center; display: inline-block;">Primary</span>`;
        } else {
          return `<span class="new_badge badge-secondary fw-bold" style="min-width: 70px; text-align: center; display: inline-block;">Secondary</span>`;
        }
      }
    },
    {
      title: "Status",
      field: "status", headerSort: false,
      width: 120,
      formatter: (cell) => {
        const val = cell.getValue();
        if (val === 1)
          return `<span class="new_badge badge-success fw-bold">Active</span>`;
        else
          return `<span class="new_badge badge-secondary fw-bold">In-active</span>`;
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
        editBtn.innerHTML = `<i class="fas fa-pen"></i>`;
        editBtn.onclick = () => openModal('edit', d);

        // Delete Button Trigger
        const delBtn = document.createElement("button");
        delBtn.className = "btn btn-sm btn-outline-danger";
        delBtn.innerHTML = `<i class="fas fa-trash"></i>`;
        delBtn.onclick = () => handleDelete(d.category_id);

        container.appendChild(editBtn);
        container.appendChild(delBtn);
        return container;
      }
    }
  ];

  const tableConfig = [
    {
      title: "Name",
      field: "name",
      render: (row) => (
        <span className="fw-bold text-dark">{row.name}</span>
      ),
    },
    {
      title: "Type",
      field: "is_primary",
      render: (row) => {
        const isPrimary = row.is_primary === 1;

        return (
          <span
            className={`new_badge fw-bold ${isPrimary ? "badge-success" : "badge-secondary"
              }`}
            style={{
              minWidth: "70px",
              textAlign: "center",
              display: "inline-block",
            }}
          >
            {isPrimary ? "Primary" : "Secondary"}
          </span>
        );
      },
    },
    {
      title: "Status",
      field: "status",
      render: (row) => {
        const isActive = row.status === 1;

        return (
          <span
            className={`new_badge fw-bold ${isActive ? "badge-success" : "badge-secondary"
              }`}
          >
            {isActive ? "Active" : "In-active"}
          </span>
        );
      },
    },
    {
      title: "Actions",
      type: "actions",
      actions: [
        {
          label: "Edit",
          icon: "fas fa-pen",
          onClick: (row) => openModal("edit", row),
        },
        {
          label: "Delete",
          icon: "fas fa-trash",
          onClick: (row) => handleDelete(row.category_id),
        },
      ],
    },
  ];

  useEffect(() => {
    tabulatorRef.current = new Tabulator(tableRef.current, {
      layout: "fitColumns",
      height: "600px",
      pagination: true,
      paginationMode: "remote",
      paginationSize: 20,
      ajaxURL: `${API_BASE}api/product_api/api/categories`,

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
        setMain_categories(response.main_categories || [])
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


      <CmnHeader
        title={"Category Management"}
        subtitle={"Manage categories"}
        icon1={"fas fa-layer-group"}
        actionName={"Add Category"}
        actionBtn={() => {
          openModal('add')
        }}
      />

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-bold"> Name</label>
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
        <CategoryModal
          mode={modalConfig.mode}
          main_categories={main_categories}
          initialData={modalConfig.initialData}
          onClose={closeModal}
          onRefresh={refreshTable}
        />
      )}
    </div>
  );
};

export default CategoryManagement;