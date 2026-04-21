import React, { useEffect, useState, useCallback } from "react";
import { API_BASE } from "../../../Config/api";
import PaymentTermModals from "./PaymentTermModals";
import Swal from "sweetalert2";
import { apiFetch } from "../../../Utils/apiFetch";
import { useMasterData } from "../../../Context/MasterDataProvider";
import CmnHeader from "../../../Components/Common/CmnHeader";
import CommonTable from "../../../Components/Common/CmnTable";

const PaymentTermsList = () => {
  const { refreshMasterData } = useMasterData();

  const [modalConfig, setModalConfig] = useState({ type: null, data: null });
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const termOptionLabels = {
    frequency: "Frequency",
    nextMonth14: "14th of Next Month",
    nextMonthLastDay: "Last day of Next Month",
    nextNextMonthLastDay: "Last day of Next to Next Month",
  };

  // ✅ FETCH DATA
  const fetchData = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}api/payment-terms?search=${search}`
      );
      const data = await res.json();
      setTableData(data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ DELETE
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete Payment Term?",
      text: "Are you sure you want to remove this term?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f0f1a",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiFetch(
            `${API_BASE}api/payment-terms/delete/${id}`,
            { method: "DELETE" }
          );

          if (res.status) {
            Swal.fire("Deleted!", "Term removed successfully.", "success");
            await refreshMasterData();
            fetchData();
          }
        } catch (e) {
          Swal.fire("Error", e.message || "Failed to delete", "error");
        }
      }
    });
  };

  // ✅ TABLE CONFIG (IMPORTANT)
  const tableConfig = [
    {
      title: "Name",
      field: "name",
      render: (val) => (
        <span className="font-bold text-[#0f0f1a]">
          {val || "—"}
        </span>
      ),
    },
    {
      title: "Type",
      field: "type",
      render: (val) => {
        if (val === "" || val === null || val === undefined) return "—";

        const isPrepaid = Number(val) === 1;

        return (
          <span
            className={`px-2 py-1 rounded-full text-[11px] font-bold border
              ${
                isPrepaid
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
              }`}
          >
            {isPrepaid ? "Prepaid" : "Postpaid"}
          </span>
        );
      },
    },
    {
      title: "Frequency (Days)",
      field: "frequency",
      render: (val, row) => {
        const termOption = row?.term_option;

        if (!val)
          return <span className="text-gray-300">—</span>;

        if (termOption && termOption !== "frequency") {
          return (
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-semibold">
              {termOptionLabels[termOption] || "Custom Term"}
            </span>
          );
        }

        return (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
            {val} days
          </span>
        );
      },
    },
    {
      title: "Status",
      field: "status",
      render: (val) => {
        const active =
          String(val).toLowerCase() === "active" || String(val) === "1";

        return active ? (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[11px] font-bold">
            ACTIVE
          </span>
        ) : (
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-[11px] font-bold">
            INACTIVE
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
          onClick: (row) =>
            setModalConfig({ type: "edit", data: row }),
        },
        {
          label: "Delete",
          icon: "fas fa-trash",
          type: "delete",
          onClick: (row) => handleDelete(row.id),
        },
      ],
    },
  ];

  return (
    <div>
      {/* HEADER */}
      <CmnHeader
        title="Payment Terms"
        subtitle="Manage vendor payment terms"
        icon1={"fas fa-file-invoice-dollar"}
        // icon="ptl-add-btn"
        actionBtn={() =>
          setModalConfig({ type: "add", data: null })
        }
        actionName="Add Term"
      />

      {/* TABLE */}
      <CommonTable
        title=""
        config={tableConfig}
        data={tableData}
        isSearchable={true}
        searchFromApi={true}
        onSearch={(val) => fetchData(val)}
        isSortable={true}
      />

      {/* MODAL */}
      {modalConfig.type && (
        <PaymentTermModals
          config={modalConfig}
          onClose={() =>
            setModalConfig({ type: null, data: null })
          }
          onRefresh={fetchData}
        />
      )}
    </div>
  );
};

export default PaymentTermsList;