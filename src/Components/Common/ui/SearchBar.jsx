import React from "react";
import { SbAdminSvg } from "../Svgs/ActionsSvg";

const SearchBar = ({
    searchType = "input",
    value,
    onChange,
    placeholder = "Search...",
}) => {
    return searchType === "input" ? (
        <div className="d-flex relative w-fit search-wrapper">
            <input
                type="text"
                className="cmn_searchbar"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />

            <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={
                    value?.length > 0
                        ? () => onChange({ target: { value: "" } })
                        : undefined
                }
            >
                {value?.length > 0
                    ? SbAdminSvg.crossIcon
                    : SbAdminSvg.searchIcon}
            </span>
        </div>
    ) : (
        <div className="col-md-3">
            <label className="form-label">Vendor Status</label>
            <select
                name="status"
                className="form-control form-select"
                value={value}
                onChange={(e) => {
                    onChange(e);
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
            </select>
        </div>
    );
};

export default SearchBar;