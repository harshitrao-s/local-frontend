import React, { useState, useEffect, useRef, } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../../Config/api";
import { apiFetch } from "../../Utils/apiFetch";
import { getVendorStatus } from "../../Constants/vendorStatus";
import CmnHeader from "../../Components/Common/CmnHeader";
import { FileSpreadsheet, Search } from "lucide-react";
import CmnTable from "../../Components/Common/CmnTable";
import { Link } from "react-router-dom";
import { SbAdminSvg } from "../../Components/Common/Svgs/ActionsSvg";
import { Select } from "../../Components/Common/ui/select";
const STORAGE_KEY = "purchase_order_columns";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../Components/Common/ui/select";
import { Input } from "../../Components/Common/ui/input";
import { Button } from "../../Components/Common/ui/button";



/* ----------------------------------------
   localStorage helpers (outside component — stable reference)
---------------------------------------- */
// const getSavedColumns = () => {
//   const saved = localStorage.getItem(STORAGE_KEY);
//   if (!saved) {
//     return ALL_COLUMNS.filter((c) => c.optional).map((c) => c.field);
//   }
//   return JSON.parse(saved);
// };

// const saveColumns = (fields) => {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
// };


/* ----------------------------------------
   MAIN COMPONENT
---------------------------------------- */
const AllVendors = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const initialSearch = queryParams.get("vendor_search") || "";

  const [vendor_status, setVendorStatus] = React.useState("");
  const [vendor_locality, setVendorLocality] = React.useState("");
  const [searchValue, setSearchValue] = React.useState(initialSearch);
  const [vendors, setVendors] = React.useState([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const debounceRef = useRef(null);

  const [tableData, setTableData] = useState([]);

  const fetchVendors = async () => {
    try {
      const params = new URLSearchParams({
        status: vendor_status || "",
        vendor_search: searchValue || "",
        vendor_locality: vendor_locality || "",
        page: 1,
        size: 20,
      });

      const url = `${API_BASE}api/vendor/vendors_list?${params}`;

      const response = await apiFetch(url);
      setTableData(response?.data || []);

    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    fetchVendors();
  }, [searchValue, vendor_status, vendor_locality]);

  const handleDeleteVendor = async (rowData) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete vendor.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const res = await apiFetch(
          `${API_BASE}api/vendor/api/delete/${rowData.id}`,
          { method: "DELETE" }
        );

        if (res.status) {
          Swal.fire("Deleted!", "Vendor removed", "success");

          // ✅ refresh table
          fetchVendors();
        } else {
          Swal.fire("Error", res.message, "error");
        }
      } catch (err) {
        Swal.fire("Error", "Something went wrong", "error");
      }
    });
  };

  const applyFilter = () => {
    fetchVendors();
  };


  const clearFilter = () => {
    setSearchValue("");
    setVendorStatus("");
    setVendorLocality("");
    setVendors([]);
    setShowDropdown(false);

    fetchVendors();
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
    setSearchValue(vendor.vendor_code);
    setShowDropdown(false);
    setVendors([]);
  };


  const tableConfig = [
    {
      title: "VENDOR CODE",
      field: "vendor_code",
      render: (val, row) => (
        <a
          target="_blank"
          href={`/vendor/editVendor/${row.id}`}
          className="link"
        >
          {val}
        </a>
      )
    },
    {
      title: "VENDOR NAME",
      field: "vendor_name",
    },
    {
      title: "VENDOR TYPE",
      field: "vendor_model",
    },
    {
      title: "Company Locality",
      field: "vendor_locality",
      // render: (val,row) => {
      //   if (det === "0") return "Local";
      //   else if (det === "1") return "International";
      //   else return "";
      // },
    },
    {
      title: "CITY",
      field: "billing_city",
    },
    {
      title: "COUNTRY",
      field: "billing_country",
    },
    {
      title: "CURRENCY",
      field: "currency",
    },
    {
      title: "TAX %",
      field: "tax_percent",
    },
    {
      title: "STATUS",
      field: "status",
      render: (val) => {
        const status = getVendorStatus(val);

        if (!status) return null;

        return (
          <span
            className={`new_badge bg-${status.color} w-[80px] text-center text-[12px] font-medium text-white inline-block`}
          >
            {status.name}
          </span>
        );
      }
    },
    {
      title: "Actions",
      field: "actions",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          {console.log(row)}
          {/* EDIT */}
          <Link
            to={`/vendor/editvendor/${row?.id}`}
            className="cursor-pointer"
          >
            {SbAdminSvg.edit}
          </Link>

          {/* DELETE */}
          <div
            onClick={() => handleDeleteVendor(row)}
            className="cursor-pointer"
          >
            {SbAdminSvg.delete}
          </div>

        </div>
      ),
    }
  ]

  return (
    <>
      <CmnHeader
        title="All Vendors" IconLucide={FileSpreadsheet} actionVariant="primary" actionName="Add New" actionLink="/vendor/addnewvendor"
      />
      {/* FILTERS */}
      <div className="card p-2">
        <div className="row p-2">
          {/* Vendor Search */}
          <div className="col-md-3 flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-[#323130]">Search</label>
            <div className="">
              <Input
                id="filter_vendor"
                name="vendor_search"
                type="text"
                autoComplete="off"
                placeholder="Vendor Name or Vendor Code"
                value={searchValue}
                onChange={(e) => {
                  handleVendorSearch(e.target.value);
                }}
                onFocus={() => vendors.length && setShowDropdown(true)}
              />

              {showDropdown && vendors.length > 0 && (
                <ul
                  className="list-group position-absolute w-100 shadow"
                  style={{
                    zIndex: 1000,
                    maxHeight: "250px",
                    overflowY: "auto",
                  }}
                >
                  {vendors.map((vendor) => (
                    <li
                      key={vendor.id}
                      className="list-group-item list-group-item-action"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSelectVendor(vendor)}
                    >
                      <strong>{vendor.vendor_code}</strong> -{" "}
                      {vendor.vendor_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Vendor Status */}
          <div className="col-md-3 flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-[#323130]">Vendor Status</label>
            {/* <select
              name="status"
              className="form-control form-select cmn_searchbar_featured_design"
              value={vendor_status}
              onChange={(e) => {
                setVendorStatus(e.target.value);
              }}
            >
              <option value="">All</option>
              {[
                { id: 0, name: "Pending" },
                { id: 1, name: "In Process" },
                { id: 2, name: "Active" },
                { id: 3, name: "Reject" },
                { id: 4, name: "On Hold" },
              ]?.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </select> */}

            <Select
              value={vendor_status === "" ? "all" : String(vendor_status)}
              onValueChange={(value) => {
                setVendorStatus(value === "all" ? "" : value);
              }}
            >
              <SelectTrigger className="w-full rounded-[30px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>

              <SelectContent className="z-[9999] bg-white w-full min-w-[370px] p-1" position="popper">
                <SelectItem className="hover:bg-gray-200" value="all">All</SelectItem>

                {[
                  { id: 0, name: "Pending" },
                  { id: 1, name: "In Process" },
                  { id: 2, name: "Active" },
                  { id: 3, name: "Reject" },
                  { id: 4, name: "On Hold" },
                ].map((pt) => (
                  <SelectItem className="hover:bg-gray-200" key={pt.id} value={String(pt.id)}>
                    {pt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Company Locality */}
          <div className="col-md-3 flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-[#323130]">Company Locality</label>
            <Select
              value={vendor_locality === "" ? "all" : String(vendor_locality)}
              onValueChange={(value) => {
                setVendorLocality(value === "all" ? "" : value);
              }}
            >
              <SelectTrigger className="w-full rounded-[30px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>

              <SelectContent className="z-[9999] bg-white w-full min-w-[370px] p-1" position="popper">
                <SelectItem className="hover:bg-gray-200" value="all">All</SelectItem>

                {[
                  { id: 0, name: "Local" },
                  { id: 1, name: "International" },
                ].map((pt) => (
                  <SelectItem className="hover:bg-gray-200" key={pt.id} value={String(pt.id)}>
                    {pt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* FILTER ACTIONS */}
          <div className="col-md-3 d-flex align-items-end justify-center gap-2">

            <Button className="px-3 text-white text-[14px] font-semibold h-10 w-full max-w-[100px] bg-[#1a71f6] w-100 rounded-[30px]" onClick={applyFilter}>
            <Search size={14}/>
              Filter
            </Button>

            <Button className="px-3 text-[#454545] bg-[] text-[14px] font-semibold h-10 w-full max-w-[100px] bg-gray-200 w-100 rounded-[30px]" onClick={clearFilter}>
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <CmnTable
        config={tableConfig}
        data={tableData}
        isSearchable={false}
      />

      {/* <ColumnModal /> */}
    </>
  );
};

export default AllVendors;