import React from "react";
import { SbAdminSvg } from "../Svgs/ActionsSvg";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
    return (
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
                onClick={value?.length > 0 ? () => onChange({ target: { value: "" } }) : undefined}
            >
                {value?.length > 0
                    ? SbAdminSvg.crossIcon
                    : SbAdminSvg.searchIcon}
            </span>
        </div>
    );
};

export default SearchBar;