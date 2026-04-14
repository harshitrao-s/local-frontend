import React, { useEffect, useRef } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { API_BASE } from "../../Config/api";
import apiFetch from "../../Utils/apiFetch";

const STORAGE_KEY = "product_list_columns";

/* ----------------------------------------
   COLUMN DEFINITIONS
---------------------------------------- */
const ALL_COLUMNS = [
  { title: "Title", field: "title", fixed: true, width: 500 },
  { title: "SKU", field: "sku", fixed: true, width: 250 },
  { title: "Brand", field: "brand_name_val", fixed: true, width: 250 },
  { title: "Type", field: "product_type_name", fixed: true, width: 200 },
  {
    title: "QTY",
    field: "total_stock_qty",
    hozAlign: "center",
    headerHozAlign: "center",
    fixed: true,
    width: 160,
    formatter: (cell) => `<span class="badge bg-primary">${cell.getValue() || 0}</span>`
  },
  {
    title: "ACTIONS",
    field: "actions",
    fixed: true,
    headerHozAlign: "center",
    headerSort: false,
    width: 220,
    formatter: (cell) => {
      const id = cell.getData().product_id;
      return `
        <div class="d-flex gap-2 items-center justify-content-center">
            <a href="/product/edit/${id}" class="btn btn-outline-primary btn-sm" title="Edit">
                <i class="fas fa-pen"></i> 
            </a>
            <button type="button" class="btn btn-sm btn-outline-danger btn-delete" data-id="${id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>`;
    },
    cellClick: (e, cell) => {
      if (e.target.closest('.btn-delete')) {
        handleDeleteProduct(cell.getData().id);
      }
    }
  }
];

const handleDeleteProduct = (id) => {
  if (window.confirm("Delete this product?")) {
    console.log("Deleting product:", id);
    // Add your delete logic here
  }
};

/* ----------------------------------------
   MAIN COMPONENT
---------------------------------------- */
const ProductsList = () => {
  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);

  // Helper for saved columns
  const getSavedColumns = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : ALL_COLUMNS.filter(c => c.optional).map(c => c.field);
  };

  useEffect(() => {
    const visibleOptionalCols = getSavedColumns();

    tabulatorRef.current = new Tabulator(tableRef.current, {
      layout: "fitColumns",
      height: "auto-fit",
      pagination: true,
      paginationMode: "remote",
      paginationSize: 20,
      paginationSizeSelector: [20, 50, 100],

      // API Integration
      ajaxURL: `${API_BASE}api/product/api/allproducts`,

      ajaxRequestFunc: async function (url, config, params) {
        // Construct the URL with query parameters matching your request: q, page, size
        const urlObj = new URL(url);
        urlObj.searchParams.set("q", document.getElementById("filter_q")?.value || "");
        urlObj.searchParams.set("page", params.page || 1);
        urlObj.searchParams.set("size", params.size || 20);
        const res = await apiFetch(urlObj.toString(), {
          credentials: "include",
        });
        return res;
      },

      ajaxResponse: function (url, params, response) {
        // Standardizing response for Tabulator
        return {
          data: response.data || [],
          last_page: response.last_page || 1,
        };
      },

      columns: ALL_COLUMNS.map((col) => ({
        ...col,
        visible: col.fixed || visibleOptionalCols.includes(col.field)
      })),
    });

    return () => tabulatorRef.current?.destroy();
  }, []);

  const applyFilter = () => tabulatorRef.current?.setPage(1);

  const clearFilter = () => {
    const input = document.getElementById("filter_q");
    if (input) input.value = "";
    tabulatorRef.current?.setPage(1);
  };

  return (
    <div className=" pt-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0 fw-bold">Product Inventory</h3>
        <button className="btn btn-dark" onClick={() => window.location.href = "/product/create"}>
          <i className="fas fa-plus me-2"></i> Add Product
        </button>
      </div>

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
                onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
              />
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary me-2" onClick={applyFilter}>
                <i className="fas fa-search me-1"></i> Search
              </button>
              <button className="btn btn-light" onClick={clearFilter}>Reset</button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="card p-2">
        <div className="card-body p-0">
          <div ref={tableRef} />
        </div>
      </div>
    </div>
  );
};

export default ProductsList;