import React from "react";
import './fieldsmodule.css';

const Input = ({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder = "",
    required = false,
    disabled = false,
    error = "",
    helperText = "",
    className = "",
    inputClassName = "",
    labelClassName = "",
    icon: Icon = null, // Lucide icon
    onIconClick = null, // optional (useful for password toggle)
}) => {
    return (
        <div className={`mb-4 w-full ${className}`}>
            {/* Label */}
            {label && (
                <label
                    htmlFor={name}
                    className={`block mb-1 text-sm font-medium text-gray-700 ${labelClassName}`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input Wrapper */}
            <div className="relative">
                {/* Input */}
                <input
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
           sb-form-field-input
            ${Icon ? "pr-10" : ""}
            ${error
                            ? "border-red-500 focus:ring-red-400"
                            : ""
                        }
            ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
            ${inputClassName}
          `}
                />

                {/* Right Icon */}
                {Icon && (
                    <div
                        className={`absolute inset-y-0 right-0 flex items-center  text-gray-400 ${onIconClick ? "cursor-pointer" : ""
                            }`}
                        onClick={onIconClick}
                    >
                        <Icon size={18} />
                    </div>
                )}
            </div>

            {/* Messages */}
            {error ? (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            ) : helperText ? (
                <p className="mt-1 text-xs text-gray-500">{helperText}</p>
            ) : null}
        </div>
    );
};

export default Input;