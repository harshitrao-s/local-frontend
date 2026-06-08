import React, { useEffect, useRef, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_bootstrap5.min.css"; // Use Bootstrap 5 theme
import useMasterData from "../Context/MasterDataProvider";
import { API_ENDPOINTS } from "../Config/api";
import { apiFetch } from "../Utils/apiFetch";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';




//asdasdasd
import { formattedDate } from "../Utils/utilFunctions";
import CmnTable from "./Common/CmnTable";


const VendorPOList = ({ vendorId, isTabMode = true }) => {
    const tabulatorRef = useRef(null);
    const { warehouses } = useMasterData();
    const [tableData, setTableData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [poStatus, setPoStatus] = useState("");

    const fetchPOs = async () => {
        try {
            const params = new URLSearchParams();

            params.append("vendor_id", vendorId);

            if (searchValue) {
                params.append("order_no", searchValue);
            }

            if (poStatus) {
                params.append("status", poStatus);
            }

            const res = await apiFetch(
                `${API_ENDPOINTS.PO_LISTING}?${params.toString()}`
            );

            setTableData(
                res?.data ||
                res?.results ||
                []
            );
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!vendorId) return;

        const timer = setTimeout(() => {
            fetchPOs();
        }, 300); // debounce

        return () => clearTimeout(timer);
    }, [searchValue, poStatus, vendorId]);

    useEffect(() => {
        const deletePO = async (po_id) => {
            const result = await Swal.fire({
                title: "Delete Purchase Order?",
                text: "This action cannot be undone.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
            });

            if (result.isConfirmed) {
                const response = await apiFetch(`${API_ENDPOINTS.DELETE_PURCHASE_ORDER}${po_id}/`, { method: "DELETE" });
                if (response.status) {
                    tabulatorRef.current.setData(); // Refresh table
                    Swal.fire("Deleted!", "PO has been removed.", "success");
                }
            }
        };

        // const ALL_COLUMNS = [
        //     {
        //         title: "PO#", field: "po_number", width: 140, hozAlign: "left", headerSort: false,
        //         formatter: (cell) => `<a href="/purchaseorder/details/${cell.getRow().getData().po_id}" class="fw-bold text-primary">${cell.getValue()}</a>`
        //     },
        //     { title: "Order Date", headerSort: false, field: "order_date", width: 160, formatter: (cell) => formattedDate(cell.getValue()) },
        //     {
        //         title: "PO Status", field: "status_id", headerSort: false, width: 150, formatter: (cell) => {
        //             const status = cell.getValue();
        //             const statuses = {
        //                 [-1]: ["Draft", "badge-secondary"],
        //                 [0]: ["Parked", "badge-warning"],
        //                 [1]: ["Placed", "badge-primary"],
        //                 [4]: ["Partially Delivered", "badge-info"],
        //                 [5]: ["Delivered", "badge-success"],
        //                 [7]: ["Cancelled", "badge-danger"]
        //             };
        //             const [text, badge] = statuses[status] || ["Unknown", "badge-dark"];
        //             return `<span class="badge rounded-pill ${badge}">${text.toUpperCase()}</span>`;
        //         }
        //     },
        //     { title: "Vendor Name", headerSort: false, field: "vendor_name", minWidth: 160 },
        //     { title: "Expected Delivery", headerSort: false, field: "expected_delivery_date", minWidth: 160 },
        //     { title: "Currency", headerSort: false, field: "currency_code", width: 120 },
        //     { title: "Ordered QTY", headerSort: false, field: "total_order_qty", width: 150 },
        //     { title: "Received QTY", headerSort: false, field: "total_received_qty", width: 150 },
        //     { title: "Amount", headerSort: false, field: "summary_total", width: 120 },
        // ];


        // tabulatorRef.current = new Tabulator(tableRef.current, {
        //     placeholder: "No purchases found for this vendor",
        //     layout: "fitColumns",
        //     height: "450px",
        //     pagination: true,
        //     paginationMode: "remote",
        //     paginationSize: 10,
        //     ajaxURL: API_ENDPOINTS.PO_LISTING,
        //     ajaxParams: { vendor_id: vendorId }, // Filter by this vendor
        //     ajaxRequestFunc: async (url, config, params) => {
        //         const query = new URLSearchParams({
        //             ...params,
        //             vendor_id: vendorId, // Ensure vendor ID is sent
        //             status: document.getElementById("tab_filter_status")?.value || "",
        //             order_no: document.getElementById("tab_filter_order_no")?.value || "",
        //         }).toString();
        //         return await apiFetch(`${url}?${query}`);
        //     },
        //     columns: ALL_COLUMNS,
        // });

        return () => tabulatorRef.current?.destroy();
    }, [vendorId]);

    const applyFilter = () => {
        fetchPOs();
    };

    const clearFilter = () => {
        setSearchValue("");
        setPoStatus("");
        fetchPOs();
    };

    const tableConfig = [
        {
            title: "PO Number",
            field: "po_number",
            render: (val, row) => (
                <a
                    href={`/purchaseorder/details/${row.po_id}`}
                    className="fw-bold text-primary"
                >
                    {val}
                </a>
            ),
        },

        {
            title: "PO Date",
            field: "order_date",
            render: (val) => formattedDate(val),
        },

        {
            title: "PO Status",
            field: "status_id",
            render: (val) => {
                const statuses = {
                    [-1]: { text: "Draft", color: "secondary" },
                    [0]: { text: "Parked", color: "warning" },
                    [1]: { text: "Placed", color: "primary" },
                    [4]: { text: "Partially Delivered", color: "info" },
                    [5]: { text: "Delivered", color: "success" },
                    [7]: { text: "Cancelled", color: "danger" },
                };

                const status = statuses[val];

                if (!status) return null;

                return (
                    <span
                        className={`badge rounded-pill bg-${status.color}`}
                    >
                        {status.text.toUpperCase()}
                    </span>
                );
            },
        },

        {
            title: "Vendor Name",
            field: "vendor_name",
        },

        {
            title: "Expected Delivery",
            field: "expected_delivery_date",
        },

        {
            title: "Currency",
            field: "currency_code",
        },

        {
            title: "Ordered QTY",
            field: "total_order_qty",
        },

        {
            title: "Received QTY",
            field: "total_received_qty",
        },

        {
            title: "Amount",
            field: "summary_total",
        },
    ];

    return (
        <div className="vendor-purchase-list">
            {/* Minimalist Filter Bar for Tab View */}
            <div className="row g-2 mb-4 align-items-end">
                <div className="col-md-3">
                    <label className="small fw-bold">PO Status</label>
                    <select id="tab_filter_status" value={poStatus}
                        onChange={(e) => setPoStatus(e.target.value)} className="form-select form-select-sm">
                        <option value="">All Statuses</option>
                        <option value="1">Placed</option>
                        <option value="5">Delivered</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <label className="small fw-bold">Search PO</label>
                    <input id="tab_filter_order_no" value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)} className="form-control form-control-sm" placeholder="Enter PO number..." />
                </div>
                <div className="col-md-5 d-flex gap-2">
                    <button type="button" className="btn btn-sm btn-primary" onClick={applyFilter}>
                        <FontAwesomeIcon icon={faSearch} className="me-1" /> Filter
                    </button>

                    <button type="button" className="btn btn-light" onClick={clearFilter}>
                        Clear
                    </button>
                    <button type="button" className="btn d-none btn-sm btn-outline-dark" onClick={() => window.location.href = `/purchaseorder/create?vendor=${vendorId}`}>
                        <FontAwesomeIcon icon={faPlus} className="me-1" /> New PO
                    </button>
                </div>
            </div>

            <CmnTable
                config={tableConfig}
                data={tableData}
                isSearchable={false}
            />
        </div>
    );
};

export default VendorPOList;