import { useEffect, useRef, useState } from "react";
import useMasterData from "../../Context/MasterDataProvider";
import { API_BASE, API_ENDPOINTS } from "../../Config/api";
import { apiFetch } from "../../Utils/apiFetch";
import Swal from "sweetalert2";
import { formatAUD, formattedDate } from "../../Utils/utilFunctions";
import { PO_STATUS } from "../../Constants/PO_Status";
import { INVOICE_STATUS } from "../../Constants/InvoiceStatus";
import { CreditCard } from 'lucide-react'
import CmnHeader from "../../Components/Common/CmnHeader";
import CmnTable from "../../Components/Common/CmnTable";
import { SbAdminSvg } from "../../Components/Common/Svgs/ActionsSvg";
/* ----------------------------------------
   CONSTANTS & HELPERS
---------------------------------------- */
const STORAGE_KEY = "purchase_order_columns";

const deletePO = async (po_id, e) => {
  e.stopPropagation();
  const result = await Swal.fire({
    title: "Delete Purchase Order?",
    text: "This purchase order will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  });

  if (result.isConfirmed) {
    const response = await apiFetch(`${API_ENDPOINTS.DELETE_PURCHASE_ORDER}${po_id}/`, { method: "DELETE" });
    if (response.status) {
      Swal.fire("Deleted!", "PO Details has been removed.", "success");
    }
  }
};

const tableConfig = [
  {
    title: "SB PO",
    field: "po_number",
    render: (val, row) => (
      <a
        target="_blank"
        href={`/purchaseorder/details/${row.po_id}`}
        className="link"
      >
        {val}
      </a>
    )
  },
  {
    title: "Vendor PO",
    field: "master_vendor_po_number",
  },
  {
    title: "Order Date",
    field: "order_date",
    render: (val) => {
      if (!val) return "-";

      try {
        return formattedDate(val);
      } catch (e) {
        return val;
      }
    }
  },
  {
    title: "Vendor Name",
    field: "vendor_name",
    // render: (val,row) => {
    //   if (det === "0") return "Local";
    //   else if (det === "1") return "International";
    //   else return "";
    // },
  },
  {
    title: "PO Status",
    field: "status_id",
    render: (val) => {
      let text = "Unknown";
      let badge = "badge-info";

      if (val === -1) { text = "Draft"; badge = "badge-secondary"; }
      else if (val === 0) { text = "Parked"; badge = "badge-warning"; }
      else if ([1].includes(val)) { text = "Placed"; badge = "badge-primary"; }
      else if (val === 2) { text = "Costed"; badge = "badge-info"; }
      else if (val === 3) { text = "Receipted"; badge = "badge-success"; }
      else if (val === 4) { text = "Completed"; badge = "badge-warning"; }
      else if (val === 5) { text = "Partially Delivered"; badge = "badge-danger"; }
      else if (val === 6) { text = "Delivered"; badge = "badge-danger"; }
      else if (val === 7) { text = "Closed"; badge = "badge-danger"; }
      else if (val === 8) { text = "Cancelled"; badge = "badge-danger"; }

      return (
        <span
          className={`new_badge ${badge} text-center`}
        // style={{ minWidth: "80px", display: "inline-block", textAlign: "center" }}
        >
          {text.toUpperCase()}
        </span>
      );
    }
  },
  {
    title: "Currency",
    field: "currency_code",
  },
  {
    title: "Total Amount",
    field: "summary_total",
  },

  {
    title: "ACTION",
    field: "actions",
    render: (val, row) => {
      if (!row) return null;

      const isDeleteDisabled = ![0, -1].includes(row?.status_id);

      return (
        <div className="flex items-center justify-center gap-2">

          {/* ✏️ EDIT */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              window.open(`/purchaseorder/create/${row.po_id}`, "_blank");
            }}
            className="cursor-pointer text-blue-600 hover:scale-110 transition"
            title="Edit Purchase Order"
          >
            {SbAdminSvg.edit}
          </div>

          {/* 🗑️ DELETE */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (!isDeleteDisabled) {
                deletePO(row.po_id, e);
              }
            }}
            className={`cursor-pointer transition ${isDeleteDisabled
              ? "opacity-50 cursor-not-allowed"
              : "text-red-600 hover:scale-110"
              }`}
            title="Delete Purchase Order"
          >
            {SbAdminSvg.delete}
          </div>

        </div>
      );
    },
  },

]

/* ----------------------------------------
   localStorage helpers
---------------------------------------- */
// const getSavedColumns = () => {
//   const saved = localStorage.getItem(STORAGE_KEY);
//   if (!saved) {
//     return ALL_COLUMNS
//       .filter((c) => c.optional)
//       .map((c) => c.field);
//   }
//   return JSON.parse(saved);
// };

// const saveColumns = (fields) => {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
// };

/* ----------------------------------------
   MAIN COMPONENT
---------------------------------------- */
const PurchaseOrderList = () => {
  const tableRef = useRef(null);
  const { vendors, warehouses } = useMasterData();
  const [tableData, setTableData] = useState([]);
  const [poTotalValue, setPOTotalValue] = useState(0);
  const [filters, setFilters] = useState({
    status: "",
    order_no: "",
    vendor_id: "",
    delivery_ref: "",
    warehouse: "",
    vendor_payment_status: "",
  });

  const fetchPOs = async () => {
    try {
      const params = new URLSearchParams({
        status: filters.status || "",
        order_no: filters.order_no || "",
        vendor_id: filters.vendor_id || "",
        delivery_ref: filters.delivery_ref || "",
        warehouse: filters.warehouse || "",
        vendor_payment_status: filters.vendor_payment_status || "",
      });

      const url = `${API_ENDPOINTS.PO_LISTING}?${params}`;

      const res = await apiFetch(url);

      setTableData(res?.data || []);

      if (res?.grand_total !== undefined) {
        setPOTotalValue(res.grand_total);
      }

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, [filters]);

  const handleAddNew = async () => {
    try {
      const res = await apiFetch(`${API_BASE}api/purchaseorder/api/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-type": "application/json",
        },
      });

      if (res?.data?.po_id) {
        window.location.href = `/purchaseorder/create/${res.data.po_id}/AddNew`;
      }

    } catch (err) {
      console.error("Failed to create PO", err);
    }
  };

  const applyFilter = () => {
    fetchPOs();
  };

  const clearFilter = () => {
    setFilters({
      status: "",
      order_no: "",
      vendor_id: "",
      delivery_ref: "",
      warehouse: "",
      vendor_payment_status: "",
    });

    fetchPOs();
  };
  return (
    <>
      {/* HEADER */}

      <CmnHeader
        title="All Purchases" IconLucide={CreditCard} Icon="iwl-add-btn" actionName="Kanban View" actionLink="/purchaseorder/kanbanlisting" actions={[
          { name: "In-transit", link: "/purchaseorder/intransit/listing" },
          { name: "Add New ", onClick: handleAddNew }
        ]}
      />


      {/* FILTERS */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">

            {/* Search */}
            <div className="col-md-2">
              <label className="form-label">Search</label>
              <input
                className="form-control cmn_searchbar_featured_design"
                placeholder="Vendor Order# or PO#"
                value={filters.order_no}
                onChange={(e) =>
                  setFilters({ ...filters, order_no: e.target.value })
                }
              />
            </div>

            {/* Purchase Status */}
            <div className="col-md-2">
              <label className="form-label">Purchase Status</label>
              <select
                className="form-control form-select cmn_searchbar_featured_design"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All</option>
                {PO_STATUS.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vendor */}
            <div className="col-md-2">
              <label className="form-label">Vendor</label>
              <select
                className="form-control form-select cmn_searchbar_featured_design"
                value={filters.vendor_id}
                onChange={(e) =>
                  setFilters({ ...filters, vendor_id: e.target.value })
                }
              >
                <option value="">All</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.vendor_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Warehouse */}
            <div className="col-md-2">
              <label className="form-label">Warehouse</label>
              <select
                className="form-control form-select cmn_searchbar_featured_design"
                value={filters.warehouse}
                onChange={(e) =>
                  setFilters({ ...filters, warehouse: e.target.value })
                }
              >
                <option value="">All</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Status */}
            <div className="col-md-2">
              <label className="form-label">Vendor Invoice Status</label>
              <select
                className="form-control form-select cmn_searchbar_featured_design"
                value={filters.vendor_payment_status}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    vendor_payment_status: e.target.value,
                  })
                }
              >
                <option value="">All</option>
                {INVOICE_STATUS.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.value}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons (same row) */}
            <div className="col-md-2 d-flex gap-2">
              <button className="btn btn-primary w-100" onClick={applyFilter}>
                Search
              </button>
              <button className="btn btn-light w-100" onClick={clearFilter}>
                Clear
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* TABLE */}



      <CmnTable
        config={tableConfig}
        data={tableData}
        isSearchable={false}
        bodyHeight={"calc(100vh - 400px)"}
        BottomContent={<div className="d-flex justify-content-end mt-2">
          <div className="text-end flex items-center">
            <p className="text-uppercase mb-0">
              <span className="text-uppercase text-muted mb-0">Purchase Orders Total</span>
            </p> -
            <div className="d-block h5 mt-1 fw-bold">{formatAUD(poTotalValue)}</div>
            
          </div>
        </div>}
      />



      {/* <ColumnModal /> */}
    </>
  );
};

/* ----------------------------------------
   COLUMN CUSTOMIZE MODAL
---------------------------------------- */
// const ColumnModal = () => {
//   const saved = getSavedColumns();

//   const toggleColumn = (field) => {
//     const set = new Set(getSavedColumns());
//     set.has(field) ? set.delete(field) : set.add(field);
//     saveColumns([...set]);
//   };

//   return (
//     <div className="modal fade" id="columnModal">
//       <div className="modal-dialog modal-sm">
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title">Show / Hide Columns</h5>
//             <button className="btn-close" data-bs-dismiss="modal" />
//           </div>

//           <div className="modal-body">
//             {ALL_COLUMNS.filter((c) => c.optional).map((col) => (
//               <div className="form-check" key={col.field}>
//                 <input
//                   type="checkbox"
//                   className="form-check-input"
//                   defaultChecked={saved.includes(col.field)}
//                   onChange={() => toggleColumn(col.field)}
//                 />
//                 <label className="form-check-label">{col.title}</label>
//               </div>
//             ))}
//           </div>

//           <div className="modal-footer">
//             <button
//               className="btn btn-primary"
//               data-bs-dismiss="modal"
//               onClick={() => window.location.reload()}
//             >
//               Apply
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

export default PurchaseOrderList;
