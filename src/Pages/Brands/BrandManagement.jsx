import React, { useEffect, useState } from "react";
import { API_BASE } from "../../Config/api";
import BrandModal from "./BrandModal";
import Swal from "sweetalert2";
import { apiFetch } from "../../Utils/apiFetch";
import CmnHeader from "../../Components/Common/CmnHeader";
import CommonTable from "../../Components/Common/CmnTable";
import { SbAdminSvg } from "../../Components/Common/Svgs/ActionsSvg";

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
          <span className="new_badge badge-success ">Active</span>
        ) : (
          <span className="new_badge badge-secondary ">In-active</span>
        ),
    },

    {
      title: "Actions",
      field: "created_at",
      render: (val, row) => (
        <div className="d-flex gap-2">
          <div onClick={() => {
            openModal("edit", row)
          }} className="cursor-pointer" >{SbAdminSvg.edit}</div>
          <div className="cursor-pointer" onClick={() => {
            handleDelete(row.brand_id)
          }}>{SbAdminSvg.delete}</div>
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



      {/* TABLE */}
      <CommonTable
        config={tableConfig}
        data={data}
        isSearchable={true}
        searchFromApi={true}
        searchAPi={`${API_BASE}api/product_api/api/brands?page=${page}&size=${size}&`}
        //${API_BASE}api/product_api/api/brands?page=${page}&size=${size}&brand_name=${brand_name}
        searchParamKey={'brand_name'}
        isPaginated={true}
        onPageChange={(newPage) => {
          setPage(newPage);
        }}
        currentPage={page}
        totalPages={totalPages}
      />



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