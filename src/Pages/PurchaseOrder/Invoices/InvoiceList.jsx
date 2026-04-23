import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "../../../Config/api";
import { apiFetch } from "../../../Utils/apiFetch";
import formatCurrency, { formattedDate } from "../../../Utils/utilFunctions";
import DateRangeInput from "../../../Components/Common/DateRangeInput";
import { useMasterData } from "../../../Context/MasterDataProvider";
import CmnHeader from "../../../Components/Common/CmnHeader";
import { FileSpreadsheet } from "lucide-react";
import CmnTable from "../../../Components/Common/CmnTable";

const StatCard = ({
  title,
  amount,
  count,
  icon,
  colorClass,
  iconBg,
  isFirst = false,
}) => {
  return (
    <div
      className={`rounded-[20px]  p-3 h-full
      ${isFirst ? "bg-[#002B5B] text-white" : "bg-white"}`}
    >
      {/* TOP ROW (Title + Icon) */}
      <div className="flex justify-between items-center mb-2">
        <p
          className={`text-[10px] uppercase font-bold tracking-wider
          ${isFirst ? "text-white/70" : "text-gray-400"}`}
        >
          {title}
        </p>

        <div
          className={`w-[34px] h-[34px] flex items-center justify-center rounded-full
          ${isFirst ? "bg-white/20" : iconBg}`}
        >
          <i
            className={`${icon} text-[14px] ${isFirst ? "text-white" : colorClass
              }`}
          ></i>
        </div>
      </div>

      {/* AMOUNT + INVOICE (same row) */}
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-lg truncate">{amount}</h4>

        <span
          className={`px-2 py-1 text-xs rounded-full border whitespace-nowrap
          ${isFirst
              ? "bg-white/20 text-white border-white/30"
              : "bg-gray-100 text-gray-700 border-gray-200"
            }`}
        >
          {count} Invoices
        </span>
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
    <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} isFirst={index === 0} />
      ))}
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
  const { paymentTerms } = useMasterData();

  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);
  const [dateRangeDisplay, setDateRangeDisplay] = React.useState("");
  const [filters, setFilters] = React.useState({ due_date_from: "", due_date_to: "" });
  const [invoiceDateDisplay, setInvoiceDateDisplay] = React.useState("");
  const [invoiceDateFilters, setInvoiceDateFilters] = React.useState({
    invoice_date_from: "",
    invoice_date_to: ""
  });
  const [tableData, setTableData] = useState([]);

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
  };

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams({
        status: invoice_status,
        vendor: searchValue,
        payment_term: paymentTerm,
        due_date_from: filters.due_date_from,
        due_date_to: filters.due_date_to,
        invoice_date_from: invoiceDateFilters.invoice_date_from,
        invoice_date_to: invoiceDateFilters.invoice_date_to,
      });
  
      const result = await apiFetch(
        `${API_BASE}api/purchaseorder/api/purchase-order/invoices/listing?${params}`
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
    paymentTerm,
    filters.due_date_from,
    filters.due_date_to,
    invoiceDateFilters.invoice_date_from,
    invoiceDateFilters.invoice_date_to,
    searchValue
  ]);

  const applyFilter = () => {
    fetchInvoices();   // 👈 actual API call
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
    setFilters({ due_date_from: "", due_date_to: "" });
    setInvoiceDateDisplay("");
    setInvoiceDateFilters({
      invoice_date_from: "",
      invoice_date_to: ""
    });
    setPaymentTerm("");
  
    fetchInvoices(); 
  };

  const tableConfig = [
    {
      title: "SB PO",
      field: "sb_po_number",
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
      field: "vendor_po_number",
    },
    {
      title: "VENDOR NAME",
      field: "vendor_name",
      columnWidths: "250px",
      render: (val, row) => (
        <a
          target="_blank"
          href={`/vendor/editvendor/${row.vendor_id}`}
          className="link"
          title="Edit"
        >
          {val}
        </a>
      )
    },
    {
      title: "INVOICE NO",
      field: "invoice_number",
      render: (val, row) => (
        <a
          target="_blank"
          href={`purchaseorder/invoicedetails/${row.invoice_number}`}
          className="link"
        >
          {val}
        </a>
      )
    },
    {
      title: "INVOICE DATE",
      field: "invoice_date",
      formatter: (cell) => {
        return formattedDate(cell.getValue());
      }
    },
    {
      title: " DUE DATE",
      field: "due_date",
      formatter: (cell) => {
        return formattedDate(cell.getValue());
      }
    },
    {
      title: "INVOICE AMOUNT",
      field: "invoice_total",
      formatter: (cell) => {
        return formatCurrency(cell.getValue());
      }
    },
    {
      title: " STATUS",
      field: "status_display",
      render: (val) => {
        let color = "bg-gray-400";
        if (val === "Paid") color = "bg-green-500";
        if (val === "Unpaid") color = "bg-red-500";
        if (val === "On Hold") color = "bg-yellow-500";
        return (
          <span
            className={`new_badge ${color} w-[80px] text-center text-[12px] font-medium text-white inline-block`}
          >
            {val}
          </span>
        );
      }
    },

    {
      title: "PAYMENT TERM",
      field: "payment_term_name",
    },

  ];

  return (
    <>
      <CmnHeader
        title="All Invoices" icon1={FileSpreadsheet} Icon="iwl-add-btn" actionName="Due Payments" actionLink="/purchaseorder/invoicedue"
      >
      </CmnHeader>

      <DashboardOverview summary={summary} />
      <div className="mt-3 mb-3 p-3 bg-white rounded-[20px]">
        <div className="">
          <div className="row mb-3">
            <div className="col-md-3">
              <label className="form-label">Search</label>
              <div className="position-relative">
                <input
                  id="filter_vendor"
                  name="vendor_search"
                  type="text"
                  autoComplete="off"
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
                {[{ "id": 1, "name": "Paid" }, { "id": 2, "name": "Unpaid" }, { "id": 3, "name": "Cancelled" }, { "id": 4, "name": "On Hold" }]?.map(pt => (
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
          <div className="mt-3 d-flex gap-2">
            <button type="button" className="btn btn-primary" onClick={applyFilter}>
              <i className="fas fa-search" style={{ fontSize: "13px", marginRight: "5px" }}></i>
              Search
            </button>

            <button type="button" className="btn btn-light" onClick={clearFilter}>
              Clear
            </button>
          </div>
        </div>
      </div>

      <CmnTable
        config={tableConfig}
        data={tableData}
        isSearchable={false}
      />
    </>
  );
};

export default InvoiceList;