import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "../../../Config/api";
import { apiFetch } from "../../../Utils/apiFetch";
import formatCurrency, { formattedDate } from "../../../Utils/utilFunctions";
import DateRangeInput from "../../../Components/Common/DateRangeInput";
import { SHIPPING_STATUS } from "../../../Constants/shippingStatus";
import { Truck, Package, PackageCheck, CheckCircle, RotateCcw } from "lucide-react";
import CmnHeader from "../../../Components/Common/CmnHeader";
import { Ship } from "lucide-react";
import CmnTable from "../../../Components/Common/CmnTable";



const StatCard = ({
  title,
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
        <h4 className="font-bold text-lg truncate">{count}</h4>

        <span
          className={`px-2 py-1 text-xs rounded-full border whitespace-nowrap
          ${isFirst
              ? "bg-white/20 text-white border-white/30"
              : "bg-gray-100 text-gray-700 border-gray-200"
            }`}
        >
          Items
        </span>
      </div>
    </div>
  );
};
const DashboardOverview = ({ summary }) => {
  const stats = [
    {
      title: 'Total ',
      count: summary?.total?.count, icon: 'fas fa-shipping-fast',
      colorClass: 'text-primary', iconBg: 'bg-primary-light', "lucid": <Truck size={22} strokeWidth={2} />
    },
    { title: 'Pending', amount: formatCurrency(summary?.pending?.amount), count: summary?.pending?.count, icon: 'fas fa-hourglass-start', colorClass: 'text-success', iconBg: 'bg-success-light', "lucid": <Package size={22} strokeWidth={2} /> },
    { title: 'Shipped', amount: formatCurrency(summary?.shipped?.amount), count: summary?.shipped?.count, icon: 'fas fa-box-open', colorClass: 'text-danger', iconBg: 'bg-danger-light', "lucid": <PackageCheck size={22} strokeWidth={2} /> },
    { title: 'Delivered', amount: formatCurrency(summary?.delivered?.amount), count: summary?.delivered?.count, icon: 'fas fa-check-circle', colorClass: 'text-warning', iconBg: 'bg-warning-light', "lucid": <CheckCircle size={22} strokeWidth={2} /> },
    { title: 'Returned', amount: formatCurrency(summary?.returned?.amount), count: summary?.returned?.count, icon: 'fas fa-undo', colorClass: 'text-secondary', iconBg: 'bg-light', "lucid": <RotateCcw size={22} strokeWidth={2} /> },

    //{ title: 'Cancelled', amount: formatCurrency(summary?.cancelled?.amount), count: summary?.cancelled?.count, icon: 'fas fa-times-circle', colorClass: 'text-secondary', iconBg: 'bg-light' },
  ];

  return (

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
const ShipmentsList = () => {
  const [invoice_status, setInvoiceStatus] = React.useState("");
  const [searchValue, setSearchValue] = React.useState("");
  const [vendors, setVendors] = React.useState([]);
  const [summary, setSummary] = React.useState(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  // const [dueDate, setDueDate] = React.useState("");
  const debounceRef = useRef(null);
  // const { paymentTerms } = useMasterData();
  // const [deliveryDateDisplay, setDeliveryDateDisplay] = React.useState("");
  const [shippingDateDisplay, setShippingDateDisplay] = React.useState("");
  // const [deliveryFilters, setDeliveryFilters] = React.useState({
  // delivery_date_from: "",
  // delivery_date_to: ""
  // });

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
  const [tableData, setTableData] = useState([]);

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
  // const handleInvoiceDateChange = (start, end) => {
  //   const fromStr = start.format("YYYY-MM-DD");
  //   const toStr = end.format("YYYY-MM-DD");

  //   setInvoiceDateDisplay(
  //     `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`
  //   );

  //   setInvoiceDateFilters({
  //     invoice_date_from: fromStr,
  //     invoice_date_to: toStr
  //   });

  //   if (tabulatorRef.current) {
  //     tabulatorRef.current.setPage(1);
  //   }
  // };
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


  const tableConfig = [
    {
      title: "Vendor PO",
      field: "vendor_po",
    },
    {
      title: "Vendor PO Order No.",
      field: "vendor_po_order_no",
    },
    {
      title: "Vendor PO Order Date",
      field: "vendor_po_order_date",
      // columnWidths: "250px",
    },
    {
      title: "Tracking Ref",
      field: "tracking_link",
      render: (val, row) => (
        <a
          target="_blank"
          href={row.tracking_link}
          className="link"
        >
          {row.tracking_number}
        </a>
      )
    },
    {
      title: "Shipping Company",
      field: "carrier_name",
    },

    {
      title: "Status",
      field: "status",
      width: 140,
      render: (val, row) => {
        const statusObj = SHIPPING_STATUS.find(
          (item) => String(item.id) === String(val)
        );

        if (!statusObj) return null;

        const statusClass = statusObj.value.replace(/\s+/g, "");

        return (
          <span
            className={`shipment-status ${statusClass}`}
            style={{ minWidth: "80px" }}
          >
            {statusObj.value}
          </span>
        );
      }
    },
    {
      title: "Shipping Date",
      field: "shipping_date",
    },
    {
      title: "Delivery Date",
      field: "delivery_date",
    },
    {
      title: "Delivery Days Avg",
      field: "delivery_date_avg",
    },
  ];

  const fetchShipments = async () => {
    try {
      const params = new URLSearchParams({
        search: searchValue,
        shipping_status: invoice_status,
        shipping_date_from: shippingFilters.shipping_date_from,
        shipping_date_to: shippingFilters.shipping_date_to,
        payment_term: paymentTerm,
      });

      const url = `${API_BASE}api/purchaseorder/api/purchase-order/shipments/listing?${params}`;
      const result = await apiFetch(url);
      setTableData(result?.data || []);

      if (result?.summary) {
        setSummary(result.summary);
      }

    } catch (err) {
      console.error("❌ API ERROR:", err);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [
    searchValue,
    invoice_status,
    shippingFilters.shipping_date_from,
    shippingFilters.shipping_date_to,
    paymentTerm
  ]);


  const applyFilter = () => {
    fetchShipments();
  };

  const clearDateRange = () => {
    setShippingDateDisplay("");
    setShippingFilters({
      shipping_date_from: "",
      shipping_date_to: "",
    });

    // optional: auto reload
    fetchShipments();
  };

  const clearFilter = () => {
    setSearchValue("");
    setInvoiceStatus("");
    setPaymentTerm("");

    setShippingDateDisplay("");
    setShippingFilters({
      shipping_date_from: "",
      shipping_date_to: "",
    });

    setDateRangeDisplay("");
    setFilters({
      due_date_from: "",
      due_date_to: "",
    });

    setInvoiceDateDisplay("");
    setInvoiceDateFilters({
      invoice_date_from: "",
      invoice_date_to: "",
    });

    setVendors([]);
    setShowDropdown(false);

    // ❌ ye hata do
    // tabulatorRef.current.setData();

    // ✅ ye lagao
    fetchShipments();
  };

  return (
    <>
      <CmnHeader title="All Shipments" IconLucide={Ship} />
      <DashboardOverview summary={summary} />
      <div className="card mt-3 mb-3">
        <div className="p-3">
          <div
            className="
        grid gap-3 items-end
        grid-cols-1
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-5
      "
          >
            {/* Search */}
            <div>
              <label className="form-label">Search</label>
              <div className="position-relative">
                <input
                  id="filter_vendor"
                  name="vendor_search"
                  type="text"
                  autoComplete="off"
                  className="form-control"
                  placeholder="Vendor PO or Order# or Shipping Company"
                  value={searchValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchValue(value);
                    handleVendorSearch(value);
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

            {/* Shipping Status */}
            <div>
              <label className="form-label">Shipping Status</label>
              <select
                name="status"
                className="form-control form-select"
                value={invoice_status}
                onChange={(e) => {
                  setInvoiceStatus(e.target.value);
                  tabulatorRef.current?.setPage(1);
                }}
              >
                <option value="">All</option>
                {SHIPPING_STATUS?.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.value}
                  </option>
                ))}
              </select>
            </div>

            {/* Shipping Date */}
            <div>
              <label className="form-label">Shipping Date</label>
              <DateRangeInput
                isRange
                value={shippingDateDisplay}
                onChange={handleShippingDateChange}
                onCancel={clearDateRange}
                placeholder="Select date range"
                className="bg-white"
              />
            </div>

            {/* Delivery Date */}
            <div>
              <label className="form-label text-muted">Delivery Date</label>
              <DateRangeInput
                disabled
                isRange
                value={dateRangeDisplay}
                onChange={handleDateChange}
                onCancel={clearDateRange}
                placeholder="Select date range"
                className="bg-white"
              />
            </div>

            {/* Buttons (same column) */}
            <div className="flex items-end gap-2">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={applyFilter}
              >
                <i className="fas fa-search me-2"></i>
                Search
              </button>

              <button
                type="button"
                className="btn btn-light w-100"
                onClick={clearFilter}
              >
                Clear
              </button>
            </div>
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

export default ShipmentsList;