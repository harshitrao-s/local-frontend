import React from "react";
import { SbAdminSvg } from "./Svgs/ActionsSvg";

const Pagination = ({
  totalPages = 13,
  currentPage = 1,
  onPageChange = () => { },
  pageSize = 10,
  currentPageSize = 10
}) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };


  return (
    <div className="flex items-center justify-between w-full text-[13px] text-gray-500">

      {/* Left */}
      <div className="flex items-center">
        <span className="text-[#1A71F6] font-medium">{((currentPage - 1 )* 10) + 1}</span>
        <span className="mx-1">-</span>
        <span>{(currentPage  - 1 )* 10 + currentPageSize}</span>
        <span className="mx-1">of</span>
        <span>{totalPages} Pages</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500">The page on</span>

        {/* Select */}
        <select
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          className="h-8 px-2 border border-gray-300 rounded-md bg-white text-[13px] focus:outline-none"
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
          className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {SbAdminSvg.leftIconSvg}
        </button>

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {SbAdminSvg.rightIconSvg}
        </button>
      </div>
    </div>
  );
};

export default Pagination;