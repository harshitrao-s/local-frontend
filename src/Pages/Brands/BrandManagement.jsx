import React, { useEffect, useState } from "react";
import { API_BASE } from "../../Config/api";
import BrandModal from "./BrandModal";
import Swal from "sweetalert2";
import { apiFetch } from "../../Utils/apiFetch";
import CmnHeader from "../../Components/Common/CmnHeader";
import CommonTable from "../../Components/Common/CmnTable";

const BrandManagement = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10); // ✅ default 10
  const [totalPages, setTotalPages] = useState(1);

  const [modalConfig, setModalConfig] = useState({
    show: false,
    mode: "add",
    initialData: null,
  });

  /* ---------------- FETCH ---------------- */
  const fetchBrands = async () => {
    try {
      const brand_name =
        document.getElementById("filter_brand_name")?.value || "";

      const res = await apiFetch(
        `${API_BASE}api/product_api/api/brands?page=${page}&size=${size}&brand_name=${brand_name}`
      );

      setData(res.data || []);
      setTotalPages(res.last_page || 1);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [page, size]);

  /* ---------------- MODAL ---------------- */
  const openModal = (mode, data = null) => {
    setModalConfig({ show: true, mode, initialData: data });
  };

  const closeModal = () => {
    setModalConfig({ show: false, mode: "add", initialData: null });
  };

  const refreshTable = () => {
    fetchBrands();
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiFetch(
            `${API_BASE}api/product_api/api/brands/delete/${id}`,
            { method: "DELETE" }
          );

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

  /* ---------------- TABLE CONFIG ---------------- */
  const tableConfig = [
    {
      title: "ID",
      field: "brand_id",
      render: (val) => (
        <span>{val}</span>
      ),
    },
    {
      title: "Name",
      field: "name",
    },
    {
      title: "Status",
      field: "status",
      render: (val) =>
        val === 1 ? (
          <span className="new_badge badge-success fw-bold">Active</span>
        ) : (
          <span className="new_badge badge-secondary fw-bold">In-active</span>
        ),
    },
    {
      title: "Actions",
      field: "actions",
      render: (_, row) => (
        <div className="d-flex gap-2 justify-content-center">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => openModal("edit", row)}
          >
            <i className="fas fa-edit"></i>
          </button>

          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(row.brand_id)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  /* ---------------- FILTER ---------------- */
  const applyFilter = () => {
    setPage(1);
    fetchBrands();
  };

  const clearFilter = () => {
    const input = document.getElementById("filter_brand_name");
    if (input) input.value = "";
    setPage(1);
    fetchBrands();
  };

  return (
    <div className="pt-0">
      {/* HEADER */}
      <CmnHeader
        title="Brand Management"
        subtitle="Manage product brands"
        icon1="fas fa-tags"
        actionName="Add Brand"
        actionBtn={() => openModal("add")}
      />

      {/* FILTER */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-bold">Brand Name</label>
              <input
                id="filter_brand_name"
                className="form-control"
                placeholder="Search..."
                onKeyDown={(e) => e.key === "Enter" && applyFilter()}
              />
            </div>
            <div className="col-md-4 d-flex gap-2">
              <button className="btn btn-primary" onClick={applyFilter}>
                Filter
              </button>
              <button className="btn btn-light" onClick={clearFilter}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <CommonTable
        config={tableConfig}
        data={data}
        isSearchable={false}
      />

      {/* PAGINATION */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <span>
          Page {page} of {totalPages}
        </span>

        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <i className="fas fa-chevron-left"></i>
          </button>

          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <select
          className="form-select form-select-sm"
          style={{ width: "100px" }}
          value={size}
          onChange={(e) => {
            setSize(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* MODAL */}
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