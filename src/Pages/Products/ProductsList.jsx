import React, { useEffect, useState } from "react";
import { API_BASE } from "../../Config/api";
import apiFetch from "../../Utils/apiFetch";
import { Link, useNavigate } from "react-router-dom";
import CmnHeader from "../../Components/Common/CmnHeader";
import CommonTable from "../../Components/Common/CmnTable";
import { SbAdminSvg } from "../../Components/Common/Svgs/ActionsSvg";

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
      title: "Actions",
      field: "created_at",
      render: (val, row) => (
        <div className="d-flex gap-2">
          <div onClick={() => {
            navigate(`/product/edit/${row.product_id}`)
          }} className="cursor-pointer" >{SbAdminSvg.edit}</div>
          <div className="cursor-pointer" onClick={() => {
            handleDelete(row.product_id)
          }}>{SbAdminSvg.delete}</div>
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



      {/* TABLE */}
      <CommonTable
        config={tableConfig}
        data={data}
        isSearchable={true}
        searchFromApi={true}
        searchAPi={`${API_BASE}api/product/api/allproducts?page=${page}&size=${size}&`}
        isPaginated={true}
        onPageChange={(newPage) => {
          setPage(newPage);
        }}
        currentPage={page}
        totalPages={totalPages}
      />

   
    </div>
  );
};

export default ProductsList;