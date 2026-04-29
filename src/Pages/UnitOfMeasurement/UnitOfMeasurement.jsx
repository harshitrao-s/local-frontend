import React, { useEffect, useState, useRef } from "react";
import { API_BASE } from "../../Config/api";
import UOMModal from "./UOMModal";
import Swal from "sweetalert2";
import { apiFetch } from "../../Utils/apiFetch";
import CmnHeader from "../../Components/Common/CmnHeader";
import { Ruler, Plus } from 'lucide-react'
import CmnTable from "../../Components/Common/CmnTable";
import { SbAdminSvg } from "../../Components/Common/Svgs/ActionsSvg";

const UnitOfMeasurement = () => {
  const tabulatorRef = useRef(null);
  const [modalConfig, setModalConfig] = useState({
    show: false,
    mode: 'add',
    initialData: null
  });
  const [tableData, setTableData] = useState([]);
  const [invoice_status, setInvoiceStatus] = useState("");

  const openModal = (mode, data = null) => {
    setModalConfig({ show: true, mode, initialData: data });
  };

  const closeModal = () => {
    setModalConfig({ show: false, mode: 'add', initialData: null });
  };

  const refreshTable = () => {
    fetchInvoices()
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete Unit?",
      text: "This may affect products using this unit.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiFetch(`${API_BASE}api/product_api/product_uom/delete/${id}`, {
            method: "DELETE",
          });

          if (response.status) {
            Swal.fire("Deleted!", "Unit has been removed.", "success");
            refreshTable();
          } else {
            Swal.fire("Error!", response.message || "Deletion failed.", "error");
          }
        } catch (error) {
          Swal.fire("Error!", "Failed to delete.", "error");
        }
      }
    });
  };

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams({
        status: invoice_status,
      });

      const result = await apiFetch(
        `${API_BASE}api/product_api/api/uom?${params}`
      );

      setTableData(result?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [
    invoice_status,
  ]);

  const tableConfig = [
    {
      title: "Unit Name",
      field: "name",

    },

    {
      title: "Short Code",
      field: "short_name",

    },
    {
      title: "STATUS",
      field: "status",
      render: (val) => {
        const status = Number(val);

        return (
          <span
            className={`new_badge w-[80px] text-center text-[12px] font-medium text-white inline-block ${status === 1 ? "bg-green-500" : "bg-red-500"
              }`}
          >
            {status === 1 ? "Active" : "Inactive"}
          </span>
        );
      }
    },
    {
      title: "Actions",
      field: "actions",
      render: (val, row) => (
        <div className="flex  gap-2">
          {/* EDIT */}
          <div
            onClick={() => openModal('edit', row)}
            className="cursor-pointer"
          >
            {SbAdminSvg.edit}
          </div>

          {/* DELETE */}
          <div
            onClick={() => handleDelete(row.uom_id)}
            className="cursor-pointer"
          >
            {SbAdminSvg.delete}
          </div>

        </div>
      ),
    }
  ];

  return (


    <div className="p-0">

      <CmnHeader
        title="Unit of Measurement" IconLucide={Ruler}
        actions={[
          { icon: <Plus size={16} />, name: "Add Unit", onClick: () => openModal('add') }
        ]}
      />

      <CmnTable
        config={tableConfig}
        data={tableData}
        isSearchable={true}
      />

      {modalConfig.show && (
        <UOMModal
          mode={modalConfig.mode}
          initialData={modalConfig.initialData}
          onClose={closeModal}
          onRefresh={refreshTable}
        />
      )}
    </div>
  );
};

export default UnitOfMeasurement;