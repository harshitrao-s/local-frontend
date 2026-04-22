import React, { useEffect, useState } from "react";
import { API_BASE } from "../../Config/api";
import apiFetch from "../../Utils/apiFetch";
import { Link, useNavigate } from "react-router-dom";
import CmnHeader from "../../Components/Common/CmnHeader";
import CommonTable from "../../Components/Common/CmnTable";

const ProductsList = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10); // ✅ default 10
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  /* ---------------- FETCH ---------------- */
  const fetchProducts = async () => {
    try {
      const q = document.getElementById("filter_q")?.value || "";

      const res = await apiFetch(
        `${API_BASE}api/product/api/allproducts?q=${q}&page=${page}&size=${size}`
      );

      setData(res.data || []);
      setTotalPages(res.last_page || 1);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, size]);

  /* ---------------- ACTIONS ---------------- */
  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) {
      console.log("Deleting product:", id);
    }
  };

  /* ---------------- TABLE CONFIG ---------------- */
  const tableConfig = [
    { title: "Title", field: "title" },
    { title: "SKU", field: "sku" },
    { title: "Brand", field: "brand_name_val" },
    { title: "Type", field: "product_type_name" },
    {
      title: "QTY",
      field: "total_stock_qty",
      render: (val) => (
        <span className="new_badge bg-primary">
          {val || 0}
        </span>
      ),
    },
    {
      title: "ACTIONS",
      field: "actions",
      render: (_, row) => (
        <div className="d-flex gap-2 items-center ">
          <Link
            to={`/product/edit/${row.product_id}`}
            className="btn btn-outline-primary btn-sm"
          >
            <i className="fas fa-pen"></i>
          </Link>

          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(row.product_id)}
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
    fetchProducts();
  };

  const clearFilter = () => {
    const input = document.getElementById("filter_q");
    if (input) input.value = "";
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="pt-0">
      {/* HEADER */}
      <CmnHeader
        title="Product Inventory"
        subtitle="Manage your products"
        icon1="fas fa-boxes"
        actionName={"Add Product"}
        actionBtn={() => {
          navigate("/product/create");
        }}
      />

      {/* FILTER SECTION */}
      <div className="card mb-3 ">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-6">
              <label className="form-label fw-bold">Search Products</label>
              <input
                id="filter_q"
                className="form-control"
                placeholder="Search by Title, SKU, or Brand..."
                onKeyDown={(e) => e.key === "Enter" && applyFilter()}
              />
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary me-2" onClick={applyFilter}>
                <i className="fas fa-search me-1"></i> Search
              </button>
              <button className="btn btn-light" onClick={clearFilter}>
                Reset
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
    </div>
  );
};

export default ProductsList;