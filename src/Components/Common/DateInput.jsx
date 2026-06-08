import { Calendar } from "lucide-react";
import React, { useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateInput = ({
  label,
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  required = false,
  showMonthDropdown = false,
  showYearDropdown = false,
  dateFormat = "dd/MM/yyyy",
  className,
  disabled = false,  // ← ADD
}) => {
  const datePickerRef = useRef(null);

  const lockedStyle = disabled
    ? { background: "#f9fafb", color: "#6b7280", cursor: "not-allowed", pointerEvents: "none" }
    : {};

  return (
    <div className={`${className}`}>
      {label && (
        <label className="form-label fw-semibold">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="position-relative" style={lockedStyle}>
        <DatePicker
          ref={datePickerRef}
          selected={value}
          onChange={onChange}
          placeholderText={placeholder}
          dateFormat={dateFormat}
          showMonthDropdown={showMonthDropdown}
          showYearDropdown={showYearDropdown}
          dropdownMode="select"
          disabled={disabled}  // ← ADD
          className={`form-control my-date-picker pe-5 ${className}`}
          wrapperClassName="w-100"
          popperProps={{ strategy: "fixed" }}
        />

        <span
          className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
          style={{ cursor: disabled ? "not-allowed" : "pointer", zIndex: 0 }}
          onClick={() => !disabled && datePickerRef.current?.setOpen(true)}  // ← ADD check
        >
         <Calendar size={14} />
        </span>
      </div>
    </div>
  );
};

export default DateInput;