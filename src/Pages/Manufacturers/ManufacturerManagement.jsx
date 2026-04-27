import React, { useEffect, useState } from "react";
import { API_BASE } from "../../Config/api";
import ManufacturerModal from "./ManufacturerModal";
import Swal from "sweetalert2";
import { apiFetch } from "../../Utils/apiFetch";
import CmnHeader from "../../Components/Common/CmnHeader";
import { Factory } from "lucide-react";
import CmnTable from "../../Components/Common/CmnTable";
import { SbAdminSvg } from "../../Components/Common/Svgs/ActionsSvg";

const ManufacturerManagement = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
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

  const fetchData = async (search = "") => {
    try {
      const res = await apiFetch(
        `${API_BASE}api/product_api/api/manufacturers?page=${page}&size=${size}&q=${search}`
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

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete Manufacturer?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiFetch(
            `${API_BASE}api/product_api/api/manufacturers/delete/${id}`,
            { method: "DELETE" }
          );

          if (response.status) {
            Swal.fire("Deleted!", "Manufacturer removed.", "success");
            refreshTable();
          } else {
            Swal.fire("Error!", response.message, "error");
          }
        } catch {
          Swal.fire("Error!", "Server error", "error");
        }
      }
    });
  };

  const tableConfig = [
    {
      title: "ID",
      field: "manufacturer_id",
    },
    {
      title: "Manufacturer Name",
      field: "name",
    },
    {
      title: "Status",
      field: "status",
      render: (val) =>
        val === 1 ? (
          <span className="new_badge badge-success">Active</span>
        ) : (
          <span className="new_badge bg-red-500">Inactive</span>
        ),
    },
    {
      title: "Actions",
      render: (_, row) => (
        <div className="d-flex gap-2">
          <div onClick={() => openModal("edit", row)}>
            {SbAdminSvg.edit}
          </div>
          <div onClick={() => handleDelete(row.manufacturer_id)}>
            {SbAdminSvg.delete}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>

      <CmnHeader
        title="Manufacturers"
        IconLucide={Factory}
        actionBtn={() => openModal("add")}
        actionName="Add New"
      />

      <CmnTable
        config={tableConfig}
        data={data}
        isSearchable={true}
        searchFromApi={true}
        searchAPi={`${API_BASE}api/product_api/api/manufacturers?page=${page}&size=${size}&`}
        searchParamKey="q"
        isPaginated={true}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />

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