import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../Common/ui/select ";

const CustomSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  disabled = false,
}) => {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="text-sm font-medium">{label}</label>
      )}

      <Select
        value={value ? String(value) : ""}
        onValueChange={(val) => onChange(val)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.length > 0 ? (
            options.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.name}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-sm text-gray-400">
              No options found
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CustomSelect;