import { useEffect, useRef, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
//import "tabulator-tables/dist/css/tabulator_bootstrap5.min.css"; 
import useMasterData from "../../Context/MasterDataProvider";
import { API_BASE, API_ENDPOINTS } from "../../Config/api";
import { apiFetch } from "../../Utils/apiFetch";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableColumns, faListUl } from '@fortawesome/free-solid-svg-icons';
import { formatAUD, formattedDate } from "../../Utils/utilFunctions";
import { PO_STATUS } from "../../Constants/PO_Status";
import { INVOICE_STATUS } from "../../Constants/InvoiceStatus";
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

const ALL_COLUMNS = [
  // FIXED COLUMNS (cannot be hidden)
  {
    title: "SB PO",field: "po_number", width: 170,headerHozAlign: "center",headerHozAlign: "left",
                hozAlign: "left",
    
    formatter: (cell) =>
      `<a href="/purchaseorder/details/${cell.getRow().getData().po_id}"
         className="fw-bold text-primary">${cell.getValue()}</a>`,
  },
  {
    title: "Vendor PO",  hozAlign: "center", field: "master_vendor_po_number", width: 170, headerHozAlign: "left",
    hozAlign: "left", headerSort: false,
  },
  {
    title: "Order Date",
    field: "order_date",width: 170,
                headerSort: false, 
    fixed: true,formatter: function(cell) {
        const dateValue = cell.getValue(); 
        if (!dateValue) return "-"; 
        try {
          return formattedDate(dateValue);
        }catch (e) {
          return dateValue; 
        }
    }
  },
  { title: "Vendor Name",Width:220,   field: "vendor_name",headerSort: false, optional: true },
  {
    title: "PO Status",
    headerSort: false,
    headerHozAlign: "center",
    hozAlign: "center",
    field: "status_id",
    width:150,
    fixed: true,
    formatter: function (cell) {
      const status = cell.getValue();
      let text = "Unknown";
      let badge = "badge-info";

      if (status === -1) { text = "Draft"; badge = "badge-secondary"; }
      else if (status === 0) { text = "Parked"; badge = "badge-warning"; }
      else if ([1].includes(status)) { text = "Placed"; badge = "badge-primary"; }
      else if (status === 2) { text = "Costed"; badge = "badge-info"; }
      else if (status === 3) { text = "Receipted"; badge = "badge-success"; }
      else if (status === 4) { text = "Completed"; badge = "badge-warning"; }
      else if (status === 5) { text = "Partially Delivered"; badge = "badge-danger"; }
      else if (status === 6) { text = "Delivered"; badge = "badge-danger"; }
      else if (status === 7) { text = "Closed"; badge = "badge-danger"; }
      else if (status === 8) { text = "Cancelled"; badge = "badge-danger"; }

      return `<span class="px-3 py-2 fs-7 badge badge-pill ${badge}">${text.toUpperCase()}</span>`;
    },
  },
 /* {
    title: "Shipping Status",
    field: "",
    //shipping_status
    fixed: true,headerSort: false, width:150,
    formatter: function (cell) {
      return <></>
        const status = cell.getValue();
        let text = "Unknown";
        let badge = "badge-info";
        return `<span class="px-3 py-2 fs-7 badge badge-pill ${badge}">${status.toUpperCase()}</span>`;
    },
  },*/
  { title: "Currency", field: "currency_code", width: 170, hozAlign: "center", headerHozAlign: "center", headerSort: false },
  //  OPTIONAL COLUMNS (hide / show)
    {
    title: "Total Amount",
    field: "summary_total",
    //optional: true,
    hozAlign: "center",width: 150,
                headerSort: false
  },
  {
    title: "Ordered QTY",
    field: "product_total_qty",
    optional: true,
    hozAlign: "center",width: 170,
                headerSort: false
  },
  /*{
    title: "Received QTY",
    field: "product_total_received_qty",
    //optional: true,
    hozAlign: "right",minWidth: 120,
                headerSort: false
  },*/
  {
    title: "ACTION",
    width: 170,
    hozAlign: "center",
    headerSort: false,
    formatter: function (cell) {
      const d = cell.getRow().getData();

      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.gap = "6px";

      // ✏️ EDIT BUTTON (always visible)
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn btn-sm btn-outline-primary";
      editBtn.title = "Edit Purchase Order";
      editBtn.innerHTML = `<i class="fas fa-pen"></i>`;

      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.open(`/purchaseorder/create/${d.po_id}`, "_blank");
      });

      // 🗑️ DELETE BUTTON
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn-sm btn-outline-danger";
      deleteBtn.title = "Delete Purchase Order";
      deleteBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;

      // Disable delete for other statuses
      if (![0, -1].includes(d.status_id)) {
        deleteBtn.disabled = true;
        deleteBtn.style.opacity = "0.5";
        deleteBtn.style.cursor = "not-allowed";
      } else {
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          deletePO(d.po_id, e);
        });
      }

      wrapper.appendChild(editBtn);
      wrapper.appendChild(deleteBtn);

      return wrapper;
    },
    // cellClick here acts as a backup safety to stop propagation
    cellClick: (e) => e.stopPropagation()
  }

];

/* ----------------------------------------
   localStorage helpers
---------------------------------------- */
const getSavedColumns = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return ALL_COLUMNS
      .filter((c) => c.optional)
      .map((c) => c.field);
  }
  return JSON.parse(saved);
};

const saveColumns = (fields) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
};

/* ----------------------------------------
   MAIN COMPONENT
---------------------------------------- */
const PurchaseOrderList = () => {
  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);
  const { vendors, warehouses } = useMasterData();
  const [ poTotalValue, setPOTotalValue ] = useState(0);
  useEffect(() => {
    const visibleOptionalCols = getSavedColumns();
    tabulatorRef.current = new Tabulator(tableRef.current, {
    placeholder: "No records found",
  
    layout: "fitColumns",
    height: "auto-fit",

    pagination: true,
    paginationMode: "remote",
    paginationSize: 20,
    paginationSizeSelector: [20, 30, 40, 50],
    sortMode: "remote",
    ajaxURL: API_ENDPOINTS.PO_LISTING,

    ajaxParams: function () {
      return {
        status: document.getElementById("filter_status")?.value || "",
        order_no: document.getElementById("filter_order_no")?.value || "",
        vendor_id: document.getElementById("filter_vendor")?.value || "",
        delivery_ref: document.getElementById("filter_delivery_ref")?.value || "",
        warehouse: document.getElementById("filter_warehouse")?.value || "",
        vendor_payment_status:
          document.getElementById("filter_vendor_payment_status")?.value || "",
      };
    },

    ajaxRequestFunc: async function (url, config, params) {
        // Extract sorting if you decide to add it later
        const sorter = params.sort && params.sort.length > 0 ? params.sort[0] : null;
        const requestParams = {
            page: params.page || 1,
            size: params.size || 20,
            // Ensure filters are pulled from the DOM or the params object
            status: document.getElementById("filter_status")?.value || "",
            order_no: document.getElementById("filter_order_no")?.value || "",
            vendor_id: document.getElementById("filter_vendor")?.value || "",
            delivery_ref: document.getElementById("filter_delivery_ref")?.value || "",
            warehouse: document.getElementById("filter_warehouse")?.value || "",
            vendor_payment_status: document.getElementById("filter_vendor_payment_status")?.value || "",
        };

        if (sorter) {
            requestParams.sort_by = sorter.field;
            requestParams.sort_dir = sorter.dir;
        }

        const query = new URLSearchParams(requestParams).toString();
        const res = await apiFetch(`${url}?${query}`);
        return res;
    },

    ajaxResponse: function (url, params, response) {
      if(response?.grand_total !== undefined){
        setPOTotalValue(response.grand_total);
      }
      return {
        data: response.data || [],
        last_page: response.last_page || 1,
      };
    },

    columns: ALL_COLUMNS.map((col) => {
        if (col.fixed) {
          return { ...col, visible: true };
        }
        if (col.optional) {
          return {
            ...col,
            visible: visibleOptionalCols.includes(col.field),
          };
        }
        return col;
      }),
    });

    return () => tabulatorRef.current?.destroy();
  }, []);

  const handleAddNew = async () => {
    try {
      const res = await apiFetch(`${API_BASE}api/purchaseorder/api/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          },
      });
      
      const data = res;

      if (data?.data?.po_id) {
        // redirect to SAME create page with po_id
        window.location.href = `/purchaseorder/create/${data?.data?.po_id}/AddNew`;
      }
    } catch (err) {
        console.error("Failed to create PO", err);
    }
  };

  const applyFilter = () => {
    if (!tabulatorRef.current) return;
      tabulatorRef.current.setPage(1); // triggers ajax reload
  };

  const clearFilter = () => {
    [
      "filter_status",
      "filter_order_no",
      "filter_vendor",
      "filter_delivery_ref",
      "filter_warehouse",
      "filter_vendor_payment_status",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    tabulatorRef.current.setPage(1);
  };

  return (
    <>
      {/* HEADER */}
      <div className="d-flex justify-content-between ps-1 mb-2">
        <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
        <span className="header-left-badge"><FontAwesomeIcon icon={faListUl} style={{ fontSize:13,color:"#7c3aed" }}  /></span>
        All Purchases</h5>
        <div className="d-flex gap-1">
            {/* In-transit */}
             <button
            className="btn btn-outline-primary"
            onClick={() => {
                window.location.href = "/purchaseorder/kanbanlisting";
            }}
            >
            <FontAwesomeIcon className="me-1 ps-0" icon={faTableColumns} />
            Kanban View
            </button>

            <button disabled={true}
            className="btn btn-outline-primary"
            onClick={() => {
                window.location.href = "/purchaseorder/intransit/listing";
            }}
            >
            <i className="fas fa-truck me-2"></i>
            In-transit
            </button>

            {/* Actions dropdown */}
            <div className="btn-group">
            <button className="btn btn-outline-dark" data-bs-toggle="dropdown" // Add this
                aria-expanded="false" style={{height:"42px"}}>
                <i className="fas fa-bars me-2"></i>
                Action
            </button>
            <button
                className="btn btn-dark dropdown-toggle dropdown-toggle-split"
                data-bs-toggle="dropdown"  style={{height:"42px"}}
            ></button>

            <ul className="dropdown-menu dropdown-menu-end">
                <li>
                <button
                    className="dropdown-item"
                    onClick={handleAddNew}
                >
                    <i className="fas fa-plus me-2"></i>
                    Add New
                </button>
                </li>
                {/* <li>
                <button disabled={true} 
                    className="dropdown-item"
                    onClick={() => window.location.href = "/purchaseorder/import"}
                >
                    <i className="fas fa-upload me-2"></i>
                    Import
                </button>
                </li>

                <li>
                <button disabled={true} 
                    className="dropdown-item"
                    onClick={() => window.location.href = "/purchaseorder/export"}
                >
                    <i className="fas fa-download me-2"></i>
                    Export
                </button>
                </li>*/}
            </ul>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card mb-3">
        <div className="card-body">
        <div className="row g-3">
        {/* Order Number */}
        <div className="col-md-4">
            <label className="form-label">Search</label>
            <input
            id="filter_order_no"
            className="form-control"
            placeholder="Vendor Order# or PO#"
            />
        </div>
        {/* Purchase Status */}
        <div className="col-md-2">
            <label className="form-label">Purchase Status</label>
            <select  id="filter_status" className="form-control form-select">
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
            <select id="filter_vendor" className="form-control form-select">
            <option value="">All</option>
              {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.vendor_name}
                  </option>
              ))}
            </select>
        </div>

        <div className="col-md-2">
          <label className="form-label">Warehouse</label>
          <select id="filter_warehouse" className="form-control form-select">
            <option value="">All</option>
              {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                  {wh.name}
                  </option>
              ))}
          </select>
        </div>

        {/* Vendor Invoice Status */}
        <div className="col-md-2">
            <label className="form-label">Vendor Invoice Status</label>
            <select id="filter_vendor_payment_status" className="form-control form-select"
            >
              <option value="">All</option> 
              {INVOICE_STATUS.map((status) => (
                    <option key={status.id} disabled value={status.id}>
                        {status.value}
                    </option>
                ))}
            </select>
        </div>

        {/* Delivery Ref */}
        <div className="col-md-4 d-none">
          <label className="form-label">Delivery Ref</label>
          <input
          id="filter_delivery_ref"
          className="form-control"
          placeholder="Delivery Ref"
          />
       </div>
      {/* Warehouse */}
      </div>
      {/* FILTER ACTIONS */}
      <div className="mt-3 d-flex gap-2">
        <button className="btn btn-primary" onClick={applyFilter}>
            <i className="fas fa-search me-2"></i>
            Search
        </button>
        <button className="btn btn-light" onClick={clearFilter}>
            Clear
        </button>
      </div>
    </div>
    </div>

    {/* TABLE */}
    <div className="card">
      <div className="p-0 mt-0">
        <div ref={tableRef} />
      </div>
      <div className="row clearfix">
        <div className="d-flex justify-content-end">
          <div className="mt-5 pt-3 mb-5 pe-3 text-end">
              <p className="text-uppercase mb-0">
                <span className="text-uppercase text-muted mb-0">Purchase Orders Total</span>
                <div className="d-block h5 mt-1 fw-bold">{formatAUD(poTotalValue)}</div>
              </p>
          </div>
        </div>
      </div>
    </div>
    <ColumnModal />
    </>
  );
};

/* ----------------------------------------
   COLUMN CUSTOMIZE MODAL
---------------------------------------- */
const ColumnModal = () => {
  const saved = getSavedColumns();

  const toggleColumn = (field) => {
    const set = new Set(getSavedColumns());
    set.has(field) ? set.delete(field) : set.add(field);
    saveColumns([...set]);
  };

  return (
    <div className="modal fade" id="columnModal">
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Show / Hide Columns</h5>
            <button className="btn-close" data-bs-dismiss="modal" />
          </div>

          <div className="modal-body">
            {ALL_COLUMNS.filter((c) => c.optional).map((col) => (
              <div className="form-check" key={col.field}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  defaultChecked={saved.includes(col.field)}
                  onChange={() => toggleColumn(col.field)}
                />
                <label className="form-check-label">{col.title}</label>
              </div>
            ))}
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-primary"
              data-bs-dismiss="modal"
              onClick={() => window.location.reload()}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderList;
