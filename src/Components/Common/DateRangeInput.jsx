import React from 'react';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from 'moment';
import { Calendar } from 'lucide-react';

const DateRangeInput = ({
  value,
  onChange,
  isRange = false,
  disabled = false,
  placeholder = "Select date...",
  className = "",
  onCancel,
  size = "md",        // "sm" | "md" — default sm to match other filter inputs
  inputStyle = {},    // extra inline styles for the input
}) => {

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  const handleApply = (event, picker) => {
    if (isRange) {
      onChange(picker.startDate, picker.endDate);
    } else {
      onChange(picker.startDate);
    }
  };

  const ranges = {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [
      moment().subtract(1, 'month').startOf('month'),
      moment().subtract(1, 'month').endOf('month'),
    ],
  };

  const sizeClass = size === "sm" ? "form-control-sm" : "";
  const fontSize = size === "sm" ? 13 : undefined;

  return (
    <DateRangePicker
      initialSettings={{
        singleDatePicker: !isRange,
        ranges: isRange ? ranges : undefined,
        alwaysShowCalendars: isRange,
        showDropdowns: true,
        autoUpdateInput: true,
        locale: { format: 'DD/MM/YYYY', cancelLabel: 'Clear' },
      }}
      onApply={handleApply}
      onCancel={handleCancel}
    >
      <div className={`position-relative ${className}`}>
        <input
          disabled={disabled}
          type="text"
          className="
          block
          w-full
          h-[calc(2.25rem+2px)]
          px-3
          py-1.5
          text-[16px]
          font-normal
          leading-6
          text-[#454545]
          bg-white
          bg-clip-padding
          border
          border-[#ced4da]
          shadow-[inset_0_0_0_rgba(0,0,0,0)]
          transition-all
          duration-150
          ease-in-out
          rounded-[30px]
          focus:outline-none
          focus:ring-0
          focus:shadow-none
          focus:border-[#ced4da]
        "
        
          placeholder={placeholder}
          value={value || ""}
          readOnly
        />
        <span
          className="position-absolute top-50 end-0 translate-middle-y me-2 text-muted cursor-pointer"
          style={{ cursor: "pointer", fontSize: size === "sm" ? 12 : 14, pointerEvents: "none" }}
        >
          <Calendar size={14}/>
        </span>
      </div>
    </DateRangePicker>
  );
};

export default DateRangeInput;
