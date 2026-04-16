import React, { useEffect, useRef } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import Swal from "sweetalert2";
import { API_BASE } from "../../../Config/api";
import { apiFetch } from "../../../Utils/apiFetch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListUl } from "@fortawesome/free-solid-svg-icons";
import formatCurrency, { formattedDate } from "../../../Utils/utilFunctions";
import DateRangeInput from "../../../Components/Common/DateRangeInput";
import { useMasterData } from "../../../Context/MasterDataProvider";
import { getVendorStatusName } from "../../../Constants/vendorStatus";
import { SHIPPING_STATUS } from "../../../Constants/shippingStatus";
import { Truck, Package, PackageCheck, CheckCircle, RotateCcw } from "lucide-react";
import { Search,X } from "lucide-react"; 

const StatCard = ({ title, amount, count, icon, colorClass, iconBg, lucid }) => {
  
  return (
    <div className="col-xl col-lg-4 col-md-6 col-sm-12 mb-3">
      <div className="card stat-card border-0 h-100" style={{ borderRadius: '20px' }}>
        <div className="card-body ps-3 pt-3 pe-3 pb-1">
          <div className="d-flex justify-content-between align-items-start">
            <div style={{ minWidth: '0' }}>
              <p className="text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                {title}
              </p>
              {/* Reduced h2 to h4 for better fitting of 5 cards */}
              <h2 className="fw-bold mb-2 stat-count">{count}</h2>
              <span className="badge rounded-pill bg-light text-dark border small px-3 py-1">
                 Items
              </span>
            </div>
            <div 
              className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${iconBg}`} 
              style={{ width: '40px', height: '40px' }}
            >
               <i className={`${colorClass}`} style={{ fontSize: '14px' }}>{lucid}</i>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardOverview = ({ summary }) => {
  const stats = [
    { title: 'Total ', 
      amount: formatCurrency(summary?.total?.amount), 
      count: summary?.total?.count, icon: 'fas fa-shipping-fast', 
      colorClass: 'text-primary', iconBg: 'bg-primary-light', "lucid":<Truck size={22} strokeWidth={2} /> },
    { title: 'Pending', amount: formatCurrency(summary?.pending?.amount), count: summary?.pending?.count, icon: 'fas fa-hourglass-start', colorClass: 'text-success', iconBg: 'bg-success-light',  "lucid":<Package size={22} strokeWidth={2} /> },
    { title: 'Shipped', amount: formatCurrency(summary?.shipped?.amount), count: summary?.shipped?.count, icon: 'fas fa-box-open', colorClass: 'text-danger', iconBg: 'bg-danger-light',  "lucid":<PackageCheck size={22} strokeWidth={2} /> },
    { title: 'Delivered', amount: formatCurrency(summary?.delivered?.amount), count: summary?.delivered?.count, icon: 'fas fa-check-circle', colorClass: 'text-warning', iconBg: 'bg-warning-light', "lucid":<CheckCircle size={22} strokeWidth={2} /> },
    { title: 'Returned', amount: formatCurrency(summary?.returned?.amount), count: summary?.returned?.count, icon: 'fas fa-undo', colorClass: 'text-secondary', iconBg: 'bg-light',  "lucid":<RotateCcw size={22} strokeWidth={2} /> },

    //{ title: 'Cancelled', amount: formatCurrency(summary?.cancelled?.amount), count: summary?.cancelled?.count, icon: 'fas fa-times-circle', colorClass: 'text-secondary', iconBg: 'bg-light' },
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
          .stat-card {
            border-radius: 18px;
            background: #ffffff;
            box-shadow: 0 6px 18px rgba(0,0,0,0.04);
            transition: all 0.25s ease;
          }

          .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 28px rgba(0,0,0,0.08);
          }

          .stat-count {
            font-size: 28px;
            letter-spacing: 0.5px;
          }

          .stat-icon {
            width: 52px;
            height: 52px;
            font-size: 18px;
          }

          .bg-primary-light { background: linear-gradient(135deg,#e3f2fd,#bbdefb); }
          .bg-success-light { background: linear-gradient(135deg,#e8f5e9,#c8e6c9); }
          .bg-danger-light { background: linear-gradient(135deg,#ffebee,#ffcdd2); }
          .bg-warning-light { background: linear-gradient(135deg,#fff3e0,#ffe0b2); }
          .bg-light { background: linear-gradient(135deg,#f5f5f5,#e0e0e0); }

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
const ShipmentsList = () => {
  const [invoice_status, setInvoiceStatus] = React.useState("");
  const [searchValue, setSearchValue] = React.useState("");
  const [vendors, setVendors] = React.useState([]);
  const [summary, setSummary] = React.useState(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [dueDate, setDueDate] = React.useState("");
  const debounceRef = useRef(null);
  const {paymentTerms } = useMasterData();
  const [deliveryDateDisplay, setDeliveryDateDisplay] = React.useState("");
  const [shippingDateDisplay, setShippingDateDisplay] = React.useState("");
  const [deliveryFilters, setDeliveryFilters] = React.useState({
    delivery_date_from: "",
    delivery_date_to: ""
  });

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
  const [shippingFilters, setShippingFilters] = React.useState({
    shipping_date_from: "",
    shipping_date_to: ""
  });

  const handleShippingDateChange = (start, end) => {
    const fromStr = start.format("YYYY-MM-DD");
    const toStr = end.format("YYYY-MM-DD");

    setShippingDateDisplay(
      `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`
    );

    setShippingFilters({
      shipping_date_from: fromStr,
      shipping_date_to: toStr
    });

    if (tabulatorRef.current) {
      tabulatorRef.current.setPage(1);
    }
  };
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
    {
      title: "Vendor PO",
      field: "vendor_po",
      width: 140,
      fixed: true, headerSort:false
    },
    {
      title: "Vendor PO Order No.",
      field: "vendor_po_order_no",
      width: 190,
      fixed: true, headerSort:false
    },
    {
      title: "Vendor PO Order Date",
      field: "vendor_po_order_date",
      minWidth: 180, headerSort:false , formatter: (cell) => formattedDate(cell.getValue()) 
    },
    {
      title: "Shipping Company",
      field: "carrier_name", headerHozAlign  :"left", vertAlign :"left", 
      minWidth: 230, headerSort:false
    },
      {
      title: "Tracking Ref",
      field: "tracking_link",
      width: 140,
      fixed: true, headerSort:false,
      formatter: (cell) => {
        const link = cell.getRow().getData().tracking_link;
        const tracking_number = cell.getRow().getData().tracking_number;
        return `<a href="${link}" target="_blank" class="link">${tracking_number}</a>`;
      } 
    },
    {
      title: "Status",
      field: "status",
      width: 140,
      fixed: true, headerSort:false,
      formatter: (cell) =>{ 
          const statsId =  cell.getData().status;
          const statusObj = SHIPPING_STATUS.find(
            (item) => String(item.id) === String(statsId)
          );
         
          if (!statusObj) return null;
 
          // Remove spaces from class name safely
          const statusClass = statusObj.value.replace(/\s+/g, '');
         
          return `<span class="shipment-status ${statusClass}">
            ${statusObj.value}
          </span>`
       } 
    },
    {
      title: "Shipping Date",
      field: "shipping_date",
      width: 140,
      fixed: true, headerSort:false,
      formatter: (cell) => formattedDate(cell.getValue()) 
    },
    {     
      title: "Delivery Date",
      field: "delivery_date",
      minWidth:160, headerSort:false,formatter: (cell) => formattedDate(cell.getValue())
    },
    {
      title: "Delivery Days Avg",
      field: "delivery_date_avg",
      width: 190,
      fixed: true,headerSort:false,formatter: (cell) => formattedDate(cell.getValue())
    },
  ];
  
  useEffect(() => {
    tabulatorRef.current = new Tabulator(tableRef.current, {
      layout: "fitColumns",
      height: "calc(100vh - 350px)",
      placeholder: "No records found",
      pagination: true,
      paginationMode: "remote",
      paginationSize: 20,
      paginationSizeSelector: [20, 30, 40, 50],
      sortMode: "remote",
      ajaxURL: `${API_BASE}api/purchaseorder/api/purchase-order/shipments/listing`,

      ajaxParams: function () {
        return {
          search: searchValue || "",
          shipping_status: invoice_status || "",
          shipping_date_from: shippingFilters.shipping_date_from  || "",
          shipping_date_to: shippingFilters.shipping_date_to  || "",
        };
      },

      ajaxRequestFunc:  async (url, config, params) => {
        const sorter = params.sort && params.sort.length > 0 ? params.sort[0] : null;

        const requestParams = {
          page: params.page || 1,
          size: params.size || 20,
          search: params.search || "",
          shipping_status: params.shipping_status || "",
          shipping_date_from: params.shipping_date_from || "",
          shipping_date_to: params.shipping_date_to || "",
          //delivery_date_from: params.delivery_date_from || "",
          //delivery_date_to: params.delivery_date_to || "",
          sort_by: sorter ? sorter.field : "",
          sort_dir: sorter ? sorter.dir : ""
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
  }, [searchValue, invoice_status, filters, invoiceDateFilters,shippingFilters, paymentTerm]);

  const applyFilter = () => {
    if (tabulatorRef.current) {
      tabulatorRef.current.replaceData();
    }
  };
  const clearDateRange = () => {
    // Only reset date-related states
    setDateRangeDisplay(""); 

    setShippingDateDisplay(""); 
    setFilters({ due_date_from: "", due_date_to: "" });
    setShippingFilters({shipping_date_from:"", shipping_date_to:""});
    

  };
  const clearFilter = () => {
    setSearchValue("");setShippingDateDisplay(""); 
    setFilters({ due_date_from: "", due_date_to: "" });
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
      <div className="d-flex justify-content-between ps-1 mb-2">
          <h5 className="mt-2 pb-1 fw-bold"><FontAwesomeIcon icon={faListUl} className="me-2 text-primary" />All Shipments</h5>
          <div className="d-flex gap-2 align-items-center">
              <div className="d-flex gap-2">
            </div>
          </div>
      </div>
      <DashboardOverview summary={summary} />
      <div className="card mb-3">
        <div className="p-3">
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
                placeholder="Vendor PO or Order# or Shipping Company"
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
            <label className="form-label">Shipping Status</label>
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
            {SHIPPING_STATUS?.map(pt => (
                <option key={pt.id} value={pt.id}>{pt.value}</option>
            ))}
        </select>
        </div>
        <div className="col-md-3">
            <label className="form-label">Shipping Date</label>
            <DateRangeInput isRange={true}
              value={shippingDateDisplay}
  onChange={handleShippingDateChange} onCancel={clearDateRange} 
              placeholder="Select date range" className="bg-white" 
            />
        </div>
        <div className="col-md-3">
            <label className="form-label text-muted">Delivery Date</label>
            <DateRangeInput disabled={true} isRange={true}
              value={dateRangeDisplay}
              onChange={handleDateChange} onCancel={clearDateRange} 
              placeholder="Select date range" className="bg-white" 
            />
        </div>
      </div>
    
      {/* FILTER ACTIONS */}
      <div className="mt-3 d-flex gap-2">
        <button type="button" className="btn btn-primary" onClick={applyFilter}>
            <i className="fas fa-search me-2"></i>
            Search
        </button>

        <button
          type="button"
          className="btn btn-light"
          onClick={clearFilter}
        >
          Clear
        </button>
        </div>
    </div>
    </div></div>





    <div className="card ">
        <div className="card-body  p-1 pt-0 pb-0 mt-0 mb-0 ">
          <div ref={tableRef} />
        </div>
      </div>
    </>
  );
};

export default ShipmentsList;