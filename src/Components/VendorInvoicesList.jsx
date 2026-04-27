import React, { useEffect, useRef } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListUl } from "@fortawesome/free-solid-svg-icons";
import formatCurrency, { formattedDate } from "../Utils/utilFunctions";
import { API_BASE } from "../Config/api";
import { apiFetch } from "../Utils/apiFetch"
import DateRangeInput from "./Common/DateRangeInput";
import { useMasterData } from "../Context/MasterDataProvider";
import { Navigate, useNavigate } from "react-router-dom";

const VendorInvoices = ({ vendorCode, isTabMode = true }) => {
  const [invoice_status, setInvoiceStatus] = React.useState("");
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState("");
  const [summary, setSummary] = React.useState(null);
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
          if (del_resp.status)
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
      fixed: true, formatter: (cell) => {
        const id = cell.getRow().getData().po_id;
        return `
          <a target="_blank" href=${`/purchaseorder/details/${id}`} class=" link" title="Edit">
              ${cell.getValue()}
        </a>`;
      }
    },
    {
      title: "Vendor PO",
      field: "",
      width: 140,
      fixed: true, headerSort: false
    },
    {
      title: "VENDOR NAME",
      field: "vendor_name",
      minWidth: 160,
      formatter: (cell) => {
        return cell.getValue();
      }
    },
    {
      title: "INVOICE NO",
      field: "invoice_number",
      width: 140,
      fixed: true, headerSort: true,
      formatter: (cell) => {
        const id = cell.getRow().getData().po_invoice_id;
        return `
          <a target="_blank" href="/po/purchaseorder/invoicedetails/${id}" class=" link" title="View">${cell.getValue()}</a>`;
      }
    },
    {
      title: "INVOICE DATE",
      field: "invoice_date",
      width: 140,
      fixed: true,
      headerSort: false,
      formatter: (cell) => {
        return formattedDate(cell.getValue());
      }
    },
    {
      title: "INVOICE DUE DATE",
      field: "due_date",
      width: 160,
      headerSort: false,
      formatter: (cell) => {
        return formattedDate(cell.getValue());
      }
    },
    {
      title: "INVOICE AMOUNT",
      field: "po_amount", width: 180, headerSort: false,
      formatter: (cell) => {
        return formatCurrency(cell.getValue());
      }
    },
    {
      title: " STATUS",
      field: "status_display",
      width: 140, headerSort: false, hozAlign: "center",
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
      width: 160, headerSort: false,
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
      ajaxURL: `${API_BASE}api/purchaseorder/api/purchase-order/invoices/listing?vendor_search=${vendorCode}`,

      ajaxParams: function () {
        return {
          status: invoice_status || "",
          due_date_from: filters.due_date_from || "",
          due_date_to: filters.due_date_to || "",
          invoice_date_from: invoiceDateFilters.invoice_date_from || "",
          invoice_date_to: invoiceDateFilters.invoice_date_to || "",
          payment_term_id: paymentTerm || ""
        };
      },

      ajaxRequestFunc: async (url, config, params) => {
        const sorter = params.sort && params.sort.length > 0 ? params.sort[0] : null;

        const requestParams = {
          page: params.page || 1,
          size: params.size || 20,
          status: params.status || "",
          due_date_from: params.due_date_from || "",
          due_date_to: params.due_date_to || "",
          invoice_date_from: params.invoice_date_from || "",
          invoice_date_to: params.invoice_date_to || "",
          payment_term_id: params.payment_term_id || "",
          sort_by: sorter ? sorter.field : "",
          sort_dir: sorter ? sorter.dir : ""
        };

        const query = new URLSearchParams(requestParams).toString();

        const response = await apiFetch(`${url}&${query}`);
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
    setFilters({ due_date_from: "", due_date_to: "" });
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
      <div className="card mb-4">
        <div className="card-body">
          <div className="">
            <div className="row mb-3">
              {/* Order Number */}

              <div className="col-md-3">
                <label className="fw-bold small">Invoice Status</label>
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
                <label className="fw-bold small">Invoice Due Date</label>
                <DateRangeInput isRange={true}
                  value={dateRangeDisplay}
                  onChange={handleDateChange} onCancel={clearDateRange}
                  placeholder="Select date range" className="bg-white"
                />
              </div>
              <div className="col-md-3">
                <label className="fw-bold small">Payment Term</label>
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
              <div className="col-sm-3">
                <div className="mt-4 d-flex gap-2">
                  <button type="button" className="btn btn-primary" onClick={applyFilter}>
                    <i className="fas fa-search" style={{ fontSize: "13px", marginRight: "5px" }}></i>
                    Filter
                  </button>

                  <button type="button" className="btn btn-light" onClick={clearFilter}>
                    Clear
                  </button>
                </div>
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

          </div>
        </div></div>
      <div className="card ">
        <div className="card-body d-flex p-1 pt-0 pb-0 mt-0 mb-0 ">
          <div ref={tableRef} />
        </div>
      </div>
    </>
  );
};

export default VendorInvoices;