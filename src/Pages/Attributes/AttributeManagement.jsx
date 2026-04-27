import React, { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../Config/api";
import AttributeModal from "./AttributeModal";
import Swal from "sweetalert2";
import { apiFetch } from "../../Utils/apiFetch";
import CmnTable from "../../Components/Common/CmnTable";
import CmnHeader from "../../Components/Common/CmnHeader";
import { SbAdminSvg } from "../../Components/Common/Svgs/ActionsSvg";
import { SlidersHorizontal } from "lucide-react"; // good icon for attributes

const AttributeManagement = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [modalConfig, setModalConfig] = useState({
    show: false,
    mode: "add",
    initialData: null,
  });

  const openModal = (mode, data = null) => {
    setModalConfig({ show: true, mode, initialData: data });
  };

  const closeModal = () => {
    setModalConfig({ show: false, mode: "add", initialData: null });
  };

  /* ---------------- FETCH ---------------- */
  const fetchData = async (search = "") => {
    try {
      const res = await apiFetch(
        `${API_ENDPOINTS.LIST_PRODUCT_ATTRIBUTES}?page=${page}&size=${size}&q=${search}`
      );
      setData(res.data || []);
      setTotalPages(res.last_page || 1);
    } catch (err) {}
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const refreshTable = () => {
    fetchData();
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Attribute?",
      text: "Products using this attribute may be affected.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      const response = await apiFetch(
        `${API_ENDPOINTS.DELETE_PRODUCT_ATTRIBUTE}${id}`,
        { method: "DELETE" }
      );

      if (response.status) {
        Swal.fire("Deleted!", "Attribute has been removed.", "success");
        refreshTable();
      }
    }
  };

  /* ---------------- TABLE CONFIG ---------------- */
  const tableConfig = [
    {
      title: "Name",
      field: "attribute_name",
      render: (val) => <span className="fw-bold">{val}</span>,
    },
    {
      title: "Type",
      field: "attribute_type",
    },
    {
      title: "Default Value",
      field: "default_value",
    },
    {
      title: "Created",
      field: "created_at",
    },
    {
      title: "Actions",
      render: (_, row) => (
        <div className="d-flex gap-2 ">
          <div onClick={() => openModal("edit", row)} className="cursor-pointer">
            {SbAdminSvg.edit}
          </div>
          <div
            onClick={() => handleDelete(row.attribute_id)}
            className="cursor-pointer"
          >
            {SbAdminSvg.delete}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>

      {/* ✅ COMMON HEADER */}
      <CmnHeader
        title="Attributes"
        IconLucide={SlidersHorizontal}
        actionBtn={() => openModal("add")}
        actionName="Add New"
      />

      {/* TABLE */}
      <CmnTable
        config={tableConfig}
        data={data}
        isSearchable={true}
        searchFromApi={true}
        searchAPi={`${API_ENDPOINTS.LIST_PRODUCT_ATTRIBUTES}?page=${page}&size=${size}&`}
        searchParamKey="q"
        isPaginated={true}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />

      {/* MODAL */}
      {modalConfig.show && (
        <AttributeModal
          mode={modalConfig.mode}
          initialData={modalConfig.initialData}
          onClose={closeModal}
          onRefresh={refreshTable}
        />
      )}
    </div>
  );
};

export default AttributeManagement;