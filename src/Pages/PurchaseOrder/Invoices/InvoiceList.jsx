import React, { useEffect, useRef } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import Swal from "sweetalert2";
import { API_BASE } from "../../../Config/api";
import { apiFetch } from "../../../Utils/apiFetch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListUl, faTableColumns, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import formatCurrency, { formattedDate } from "../../../Utils/utilFunctions";
import DateRangeInput from "../../../Components/Common/DateRangeInput";
import { useMasterData } from "../../../Context/MasterDataProvider";
import { getVendorStatusName } from "../../../Constants/vendorStatus";

const StatCard = ({ title, amount, count, icon, colorClass, iconBg }) => {
  return (
    /* 1. Changed col-xl-3 to col-xl (auto-layout for 5 cards).
       2. col-lg-4 (3 per row), col-md-6 (2 per row) for smaller screens.
    */
    <div className="col-xl col-lg-4 col-md-6 col-sm-12 mb-3">
      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '20px' }}>
        <div className="card-body ps-3 pt-3 pe-3 pb-1">
          <div className="d-flex justify-content-between align-items-start">
            <div style={{ minWidth: '0' }}>
              <p className="text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                {title}
              </p>
              {/* Reduced h2 to h4 for better fitting of 5 cards */}
              <h4 className="fw-bold mb-2 text-truncate">{amount}</h4>
              <span className="badge rounded-pill bg-light text-dark px-2 py-1 border small">
                {count} Invoices
              </span>
            </div>
            <div 
              className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${iconBg}`} 
              style={{ width: '40px', height: '40px' }}
            >
              <i className={`${icon} ${colorClass}`} style={{ fontSize: '14px' }}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardOverview = ({ summary }) => {
  const stats = [
    { title: 'All Invoices', amount: formatCurrency(summary?.total?.amount), count: summary?.total?.count, icon: 'fas fa-file-invoice', colorClass: 'text-primary', iconBg: 'bg-primary-light' },
    { title: 'Paid', amount: formatCurrency(summary?.paid?.amount), count: summary?.paid?.count, icon: 'fas fa-dollar-sign', colorClass: 'text-success', iconBg: 'bg-success-light' },
    { title: 'Unpaid', amount: formatCurrency(summary?.unpaid?.amount), count: summary?.unpaid?.count, icon: 'fas fa-copy', colorClass: 'text-danger', iconBg: 'bg-danger-light' },
    { title: 'Pending', amount: formatCurrency(summary?.pending?.amount), count: summary?.pending?.count, icon: 'fas fa-spinner', colorClass: 'text-warning', iconBg: 'bg-warning-light' },
    { title: 'Overdue', amount: formatCurrency(summary?.overdue?.amount), count: summary?.overdue?.count, icon: 'fas fa-exclamation-circle', colorClass: 'text-secondary', iconBg: 'bg-light' },
  ];

  return (
    /* Limit the stretch on high-res screens by using a wrapper with max-width */
    <div className="w-100 px-1 mx-auto" style={{ maxWidth: '1600px' }}>
      <div className="row g-2 justify-content-center"> 
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      <style>
        {`
          .bg-primary-light { background-color: #e3f2fd; }
          .bg-success-light { background-color: #e8f5e9; }
          .bg-danger-light { background-color: #ffebee; }
          .bg-warning-light { background-color: #fff3e0; }
          
          /* Force exactly 20% width for 5 cards on screens wider than 1200px */
          @media (min-width: 1200px) {
            .col-xl {
              flex: 0 0 20% !important;
              max-width: 20% !important;
            }
          }
        `}
      </style>
    </div>
  );
};
/* ----------------------------------------
   MAIN COMPONENT
---------------------------------------- */
const InvoiceList = () => {
  const [invoice_status, setInvoiceStatus] = React.useState("");
  const [searchValue, setSearchValue] = React.useState("");
  const [vendors, setVendors] = React.useState([]);
  const [summary, setSummary] = React.useState(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [dueDate, setDueDate] = React.useState("");
  const debounceRef = useRef(null);
  const {paymentTerms } = useMasterData();

  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);
  const [dateRangeDisplay, setDateRangeDisplay] = React.useState("");
  const [filters, setFilters] = React.useState({ due_date_from: "", due_date_to: "" });
  const [invoiceDateDisplay, setInvoiceDateDisplay] = React.useState("");
  const [invoiceDateFilters, setInvoiceDateFilters] = React.useState({
    invoice_date_from: "",
    invoice_date_to: ""
  });

  const [paymentTerm, setPaymentTerm] = React.useState("");

  const handleInvoiceDateChange = (start, end) => {
    const fromStr = start.format("YYYY-MM-DD");
    const toStr = end.format("YYYY-MM-DD");

    setInvoiceDateDisplay(
      `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`
    );

    setInvoiceDateFilters({
      invoice_date_from: fromStr,
      invoice_date_to: toStr
    });

    if (tabulatorRef.current) {
      tabulatorRef.current.setPage(1);
    }
  };
  const handleDateChange = (start, end) => {
    // Format dates to ISO strings for the backend
    const fromStr = start.format('YYYY-MM-DD');
    const toStr = end.format('YYYY-MM-DD');
    
    // Update the visual input field
    setDateRangeDisplay(`${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`);
    
    // Store specifically as from/to for the API request
    setFilters({ due_date_from: fromStr, due_date_to: toStr });

    if (tabulatorRef.current) {
      tabulatorRef.current.setPage(1);
    }
  };


  const handleVendorSearch = (value) => {
    setSearchValue(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setVendors([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await apiFetch(
          `${API_BASE}api/vendor_api/lists?search=${value}`
        );

        if (res?.data) {
          setVendors(res.data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Vendor search error:", err);
      }
    }, 300);
  };
  const handleSelectVendor = (vendor) => {
    setSearchValue(vendor.vendor_code); // Only set vendor code
    setShowDropdown(false);
    setVendors([]);

    // trigger tabulator refresh
    if (tabulatorRef.current) {
      tabulatorRef.current.setPage(1);
    }
  };

  const handleDeleteInvoice = async (rowData) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete vendor. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000', // ShopperBeats Black
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Show loading state
          Swal.fire({
            title: 'Deleting...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
          });

          // Backend Call
          const del_resp = await apiFetch(`${API_BASE}api/vendor/api/delete/${rowData.id}`, {
            method: 'DELETE',
          });

          // Success: Refresh Tabulator data instead of page reload
          if(del_resp.status)
            Swal.fire({
              title: 'Deleted!',
              text: 'The vendor has been removed.',
              icon: 'success',
              confirmButtonColor: '#000000'
            });
          else
            Swal.fire({
              title: 'Not Deleted!',
              text: del_resp.message || 'Failed in delete.',
              icon: 'failure',
              confirmButtonColor: '#000000'
            });

          // Trigger Tabulator refresh
          if (tabulatorRef.current) {
              tabulatorRef.current.setData(); 
            }

        } catch (error) {
          console.error("Delete failed:", error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete vendor. Please try again.',
            icon: 'error',
            confirmButtonColor: '#000000'
          });
        }
      }
    });
  };
  const ALL_COLUMNS = [
    // FIXED COLUMNS (cannot be hidden)
    {
      title: "SB PO",
      field: "sb_po_number",
      width: 140,
      fixed: true,formatter: (cell) => {
        const id = cell.getRow().getData().po_id;
        return `
          <a target="_blank" href="/purchaseorder/details/${id}" class=" link" title="Edit">
              ${cell.getValue()}
        </a>`;
      } 
    },
    {
      title: "Vendor PO",
      field: "vendor_po_number",
      width: 100,
      fixed: true, headerSort:false
    },
{
      title: "VENDOR NAME",
      field: "vendor_name",
       headerHozAlign: "center", 
       hozAlign: "center",
      Width:80,
      formatter: (cell) => {
        const id = cell.getRow().getData().vendor_id;
        return `
          <a target="_blank" href="/vendor/editvendor/${id}" class=" link" title="Edit">
              ${cell.getValue()}
        </a>`;
      } 
    },
    {
      title: "INVOICE NO",
      field: "invoice_number",
      width: 200,
       headerHozAlign: "center", 
       hozAlign: "center",
      fixed: true,headerSort:true,
      formatter: (cell) => {
        const id = cell.getRow().getData().po_invoice_id;
        return `
          <a  href="purchaseorder/invoicedetails/${id}" class=" link" title="View">${cell.getValue()}</a>`;
      }
    },
    {
      title: "INVOICE DATE",
      field: "invoice_date",
      width: 170,
      fixed: true,
      headerSort: false,
      formatter: (cell) => {
        return formattedDate(cell.getValue());
      } 
    },
    {
      title: " DUE DATE",
      field: "due_date",
      width: 170,
      headerSort: false,
      formatter: (cell) => {
        return formattedDate(cell.getValue());
      } 
    },
    {
      title: "INVOICE AMOUNT",
      field: "invoice_total", width:170,headerSort:false,
      headerHozAlign: "center", 
       hozAlign: "center",
      formatter: (cell) => {
        return formatCurrency(cell.getValue());
      } 
    },
    {
      title: " STATUS",
      field: "status_display",
      width: 160,headerSort:false, hozAlign:"center", 
      headerHozAlign: "center",
      fixed: true,
      formatter: (cell) => {
        const status = cell.getValue();
        let color = "secondary";
        if (status === "Paid") color = "success";
        if (status === "Unpaid") color = "danger";
        if (status === "On Hold") color = "warning";
        
        return `<span class="badge bg-${color}">${status}</span>`;
      }
    },

    {
      title: "PAYMENT TERM",
      field: "payment_term_name",
       headerHozAlign: "center", 
       hozAlign: "center",
      width: 160,headerSort:false,
      fixed: true
    },
    
    
  ];
  
  useEffect(() => {

    tabulatorRef.current = new Tabulator(tableRef.current, {
      layout: "fitColumns",
      height: "600px",
      placeholder: "No records found",
      pagination: true,
      paginationMode: "remote",
      paginationSize: 20,
      paginationSizeSelector: [20, 30, 40, 50],
      sortMode: "remote",
      ajaxURL: `${API_BASE}api/purchaseorder/api/purchase-order/invoices/listing`,

      ajaxParams: function () {
        return {
          status: invoice_status || "",
          vendor_search: searchValue || "",
          due_date_from: filters.due_date_from || "", 
          due_date_to: filters.due_date_to || "",
          invoice_date_from: invoiceDateFilters.invoice_date_from || "",
          invoice_date_to: invoiceDateFilters.invoice_date_to || "",
          payment_term_id: paymentTerm || ""
        };
      },

      ajaxRequestFunc:  async (url, config, params) => {
        const sorter = params.sort && params.sort.length > 0 ? params.sort[0] : null;

        const requestParams = {
          page: params.page || 1,
          size: params.size || 20,
          status: params.status || "",
          vendor_search: params.vendor_search || "",
          due_date_from: params.due_date_from || "", 
          due_date_to: params.due_date_to || "",
          invoice_date_from: params.invoice_date_from || "",
          invoice_date_to: params.invoice_date_to || "",
          payment_term_id: params.payment_term_id || "",
          sort_by: sorter ? sorter.field : "", // Extracts the field name
          sort_dir: sorter ? sorter.dir : ""    // Extracts 'asc' or 'desc'
        };

        const query = new URLSearchParams(requestParams).toString();
        // ---------------------------------------
        const response = await apiFetch(`${url}?${query}`);
        return response;
      },

      ajaxResponse: function (url, params, response) {
        if (response.summary) {
          setSummary(response.summary || []);
        }
        return {
          data: response.data || [],
          last_page: response.last_page || 1,
        };
      },

      columns: ALL_COLUMNS.map((col) => {
        return col;
      }),
    });

    return () => tabulatorRef.current?.destroy();
  }, [searchValue, invoice_status, filters, invoiceDateFilters, paymentTerm]);

  const applyFilter = () => {
    if (tabulatorRef.current) {
      tabulatorRef.current.replaceData();
    }
  };
  const clearDateRange = () => {
    // Only reset date-related states
    setDateRangeDisplay(""); 
    setFilters({ due_date_from: "", due_date_to: "" });
  };
  const clearFilter = () => {
    setSearchValue("");
    setInvoiceStatus("");
    setDateRangeDisplay("");
    setVendors([]);
    setFilters({ due_date_from: "", due_date_to: "" });
    setShowDropdown(false);
    setInvoiceDateDisplay("");
    setInvoiceDateFilters({
      invoice_date_from: "",
      invoice_date_to: ""
    });
    setPaymentTerm("");
    if (tabulatorRef.current) {
      tabulatorRef.current.replaceData();
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 ps-1">
          <h5 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color:"#111827" }}>
            <span style={{ width:32,height:32,borderRadius:10,background:"#ede9fe",display:"inline-flex",alignItems:"center",justifyContent:"center" }}>
              <FontAwesomeIcon icon={faListUl} style={{ fontSize:13,color:"#7c3aed" }} />
            </span>
            All Invoices
          </h5>
          <button
            onClick={() => { window.location.href="/purchaseorder/invoicedue"; }}
            style={{
              background:"#fef3c7",
              color:"#d97706",
              border:"1.5px solid #d97706",
              fontWeight:700,
              fontSize:12,
              padding:"7px 14px",
              borderRadius:9,
              cursor:"pointer",
              display:"flex",
              alignItems:"center",
              gap:6,
              transition:"all .2s ease",
              boxShadow:"0 2px 8px rgba(217,119,6,.15)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#d97706";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(217,119,6,.35)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#fef3c7";
              e.currentTarget.style.color = "#d97706";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(217,119,6,.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Due Payments
          </button>
      </div>
      <DashboardOverview summary={summary} />
      <div className="card mb-3">
        <div className="card-body">
          <div className="">
        <div className="row mb-3">
        {/* Order Number */}
        <div className="col-md-3">
            <label className="form-label">Search</label>
            <div className="position-relative">
              <input
                id="filter_vendor"
                name="vendor_search"          // important
                type="text"
                autoComplete="off"            // disable browser autocomplete
                className="form-control"
                placeholder="Vendor Name or Vendor Code"
                value={searchValue}
                onChange={(e) => {
                  handleVendorSearch(e.target.value);
                  if (tabulatorRef.current) {
                    tabulatorRef.current.setPage(1);
                  }
                }}
                onFocus={() => vendors.length && setShowDropdown(true)}
              />

              {showDropdown && vendors.length > 0 && (
                <ul
                  className="list-group position-absolute w-100 shadow"
                  style={{ zIndex: 1000, maxHeight: "250px", overflowY: "auto" }}
                >
                  {vendors.map((vendor) => (
                    <li
                      key={vendor.id}
                      className="list-group-item list-group-item-action"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSelectVendor(vendor)}
                    >
                      <strong>{vendor.vendor_code}</strong> - {vendor.vendor_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
        </div>
        <div className="col-md-3">
            <label className="form-label">Invoice Status</label>
        <select
            name="status"
            className="form-control form-select"
            value={invoice_status}
            onChange={(e) => {
              setInvoiceStatus(e.target.value);
              if (tabulatorRef.current) {
                tabulatorRef.current.setPage(1);
              }
            }}
        >
            <option value="">All</option>
            {[{"id":1, "name":"Paid"},{"id":2, "name":"Unpaid"},{"id":3, "name":"Cancelled"},{"id":4, "name":"On Hold"}]?.map(pt => (
                <option key={pt.id} value={pt.id}>{pt.name}</option>
            ))}
        </select>
        </div>
        <div className="col-md-3">
            <label className="form-label"> Due Date</label>
            <DateRangeInput isRange={true}
              value={dateRangeDisplay}
              onChange={handleDateChange} onCancel={clearDateRange} 
              placeholder="Select date range" className="bg-white" 
            />
        </div>
        <div className="col-md-3">
            <label className="form-label">Payment Term</label>
            <select
                className="form-control form-select"
                value={paymentTerm}
                onChange={(e) => {
                  setPaymentTerm(e.target.value);
                  if (tabulatorRef.current) {
                    tabulatorRef.current.setPage(1);
                  }
                }}
            >
            <option value="">All</option>
             {paymentTerms?.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row d-none">
        <div className="col-md-3">
            <label className="form-label">Invoice Date</label>
            <DateRangeInput isRange={true}
              value={invoiceDateDisplay}
              onChange={handleInvoiceDateChange}
              onCancel={() => {
                setInvoiceDateDisplay("");
                setInvoiceDateFilters({
                  invoice_date_from: "",
                  invoice_date_to: ""
                });
              }}
              placeholder="Select invoice date range"
              className="bg-white"
            />
        </div>
        
      </div>
        {/* FILTER ACTIONS */}
        <div className="mt-4 d-flex gap-2">
        <button type="button" className="btn btn-primary" onClick={applyFilter}>
            <i className="fas fa-search" style={{fontSize:"13px", marginRight:"5px"}}></i>
            Search
        </button>

        <button type="button"  className="btn btn-light" onClick={clearFilter}>
            Clear
        </button>
        </div>
    </div>
    </div></div>
    <div className="card ">
        <div className="card-body p-1 pt-0 pb-0 mt-0 mb-0 ">
          <div ref={tableRef} />
        </div>
      </div>
    </>
  );
};

export default InvoiceList;