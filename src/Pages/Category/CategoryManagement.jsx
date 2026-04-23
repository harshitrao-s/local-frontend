import React, { useEffect, useState } from "react";
import { API_BASE } from "../../Config/api";
import CategoryModal from "./CategoryModal";
import Swal from "sweetalert2";
import { apiFetch } from "../../Utils/apiFetch";
import CmnHeader from "../../Components/Common/CmnHeader";
import CommonTable from "../../Components/Common/CmnTable";
import { SbAdminSvg } from "../../Components/Common/Svgs/ActionsSvg";

const CategoryManagement = () => {
  const [modalConfig, setModalConfig] = useState({
    show: false,
    mode: "add",
    initialData: null,
  });

  const [main_categories, setMain_categories] = useState([]);
  const [category_mangement_data, setCategory_mangement_data] = useState({});

  // --- Modal handlers ---
  const openModal = (mode, data = null) => {
    setModalConfig({ show: true, mode, initialData: data });
  };

  const closeModal = () => {
    setModalConfig({ show: false, mode: "add", initialData: null });
  };

  // --- Delete ---
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
            `${API_BASE}api/product_api/product_categories/delete/${id}`,
            { method: "DELETE" }
          );

          if (response.status) {
            Swal.fire("Deleted!", "Category deleted.", "success");
            fetchCategories();
          } else {
            Swal.fire("Error!", "Delete failed.", "error");
          }
        } catch (error) {
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  // --- Fetch ---
  const fetchCategories = async (page = 1) => {
    try {
      const result = await apiFetch(
        `${API_BASE}api/product_api/api/categories?page=${page}&size=20`
      );
      setCategory_mangement_data(result);
      setMain_categories(result.main_categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- Table Config ---
  const tableConfig = [
    {
      title: "Name",
      field: "name",
    },
    {
      title: "Type",
      field: "is_primary",
      render: (val) => (
        <span
          className={`new_badge ${
            val === 1 ? "badge-success" : "badge-secondary"
          }`}
        >
          {val === 1 ? "Primary" : "Secondary"}
        </span>
      ),
    },
    {
      title: "Status",
      field: "status",
      render: (val) => (
        <span
          className={`new_badge ${
            val === 1 ? "badge-success" : "badge-secondary"
          }`}
        >
          {val === 1 ? "Active" : "In-active"}
        </span>
      ),
    },
    {
      title: "Actions",
      field: "actions",
      render: (val, row) => (
        <div className="d-flex gap-2">
          <div
            className="cursor-pointer"
            onClick={() => openModal("edit", row)}
          >
            {SbAdminSvg.edit}
          </div>
          <div
            className="cursor-pointer"
            onClick={() => handleDelete(row.category_id)}
          >
            {SbAdminSvg.delete}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-0">
      <CmnHeader
        title={"Category Management"}
        subtitle={"Manage categories"}
        icon1={"fas fa-layer-group"}
        actionName={"Add Category"}
        actionBtn={() => openModal("add")}
      />

      {/* TABLE */}
      <CommonTable
        config={tableConfig}
        data={category_mangement_data?.data || []}
        isSearchable={true}
        searchFromApi={true}
        searchAPi={`${API_BASE}api/product_api/api/categories?page=${category_mangement_data?.current_page || 1}&size=20&`}
        searchParamKey={"brand_name"}
        isPaginated={true}
        onPageChange={(newPage) => {
          fetchCategories(newPage);
        }}
        currentPage={category_mangement_data?.current_page || 1}
        totalPages={category_mangement_data?.last_page || 1}
      />

      {modalConfig.show && (
        <CategoryModal
          mode={modalConfig.mode}
          main_categories={main_categories}
          initialData={modalConfig.initialData}
          onClose={closeModal}
          onRefresh={() =>
            fetchCategories(category_mangement_data?.current_page || 1)
          }
        />
      )}
    </div>
  );
};

export default CategoryManagement;