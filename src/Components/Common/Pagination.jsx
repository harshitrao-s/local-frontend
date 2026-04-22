import React, { useState } from "react";
import { SbAdminSvg } from "./Svgs/ActionsSvg";

const Pagination = ({
  totalPages = 13,
  currentPage = 1,
  onPageChange = () => {}
}) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="flex items-center justify-between w-full text-sm text-gray-600">
      {/* Left text */}
      <div className="pagination-text ">
        <span className="text-[#1A71F6]">{currentPage}</span> - 10 of {totalPages} Pages
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <span className="pagination-text">The page on</span>

        <select
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          className="pagination-select"
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>

        {/* Prev */}
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="pagination-select p-[8px]"
        >
          {SbAdminSvg.leftIconSvg}
        </button>

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="pagination-select p-[8px]"
        >
          {SbAdminSvg.rightIconSvg}
        </button>
      </div>
    </div>
  );
};
export default Pagination;