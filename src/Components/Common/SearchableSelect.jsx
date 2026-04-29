import { useState, useRef, useEffect, useMemo } from "react";

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select",
  labelKey = "label",
  valueKey = "value",
  name,
  renderLabel,
  unique = false,
  displayKey = null,
  disabled = false,
  loadOptions = null,
  clearable = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [asyncLoading, setAsyncLoading] = useState(false);
  const ref = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (displayKey === null) {
    displayKey = valueKey;
  }

  const processedOptions = useMemo(() => {
    if (loadOptions) return asyncOptions;

    let list = options;

    if (unique) {
      const seen = new Set();
      list = list.filter(item => {
        const val = item[valueKey];
        if (seen.has(val)) return false;
        seen.add(val);
        return true;
      });
    }

    const searchStr = search.toLowerCase();
    return list.filter(o => {
      const nameMatch = String(o?.[labelKey] || "").toLowerCase().includes(searchStr);
      const codeMatch = String(o?.vendor_code || "").toLowerCase().includes(searchStr);
      return nameMatch || codeMatch;
    });
  }, [options, asyncOptions, loadOptions, search, unique, labelKey, valueKey]);

  const selected = options.find(o => String(o?.[valueKey]) === String(value))
    || asyncOptions.find(o => String(o?.[valueKey]) === String(value));

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") setOpen(true);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlight(h => Math.min(h + 1, processedOptions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlight(h => Math.max(h - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (processedOptions[highlight]) {
          selectItem(processedOptions[highlight]);
        }
        break;
      case "Escape":
        setOpen(false);
        setSearch("");
        break;
    }
  };

  const selectItem = (item) => {
    onChange({
      target: {
        name: name,
        value: item[valueKey]
      }
    });
    setOpen(false);
    setSearch("");
  };

  const handleSearchChange = (e) => {
    if (disabled) return;
    const val = e.target.value;
    setSearch(val);
    setHighlight(0);

    if (!open) setOpen(true);

    if (loadOptions) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setAsyncLoading(true);
        try {
          const results = await loadOptions(val);
          setAsyncOptions(results || []);
        } catch (err) {
          console.error("SearchableSelect loadOptions error:", err);
          setAsyncOptions([]);
        } finally {
          setAsyncLoading(false);
        }
      }, 300);
    }

    if (val === "") {
      onChange({ target: { name, value: "" } });
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setOpen(true);
      if (loadOptions && search === "") {
        setAsyncLoading(true);
        loadOptions("").then(results => {
          setAsyncOptions(results || []);
        }).catch(() => {
          setAsyncOptions([]);
        }).finally(() => {
          setAsyncLoading(false);
        });
      }
    }
  };

  return (
    <div className={`position-relative form-control-select w-100 ${disabled ? "pe-none opacity-75" : ""}`} ref={ref}>
      <div className="input-group form-control-select">
        <input
          disabled={disabled}
          type="text"
          className="form-control form-control-border-desing"
          placeholder={placeholder}
          autoComplete="off"
          value={
            open
              ? (search || selected?.[displayKey] || "")
              : (selected?.[displayKey] || selected?.[labelKey] || "")
          }
          onFocus={handleFocus}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
        />
        {clearable && selected && !disabled && (
          <span
            className="input-group-text bg-white text-danger"
            style={{ cursor: "pointer" }}
            onClick={() => {
              onChange({ target: { name, value: "" } });
              setSearch("");
              setAsyncOptions([]);
              setOpen(false);
            }}
          >
            <small>✕</small>
          </span>
        )}

        <span
          style={{ cursor: disabled ? "not-allowed" : "pointer" }}
          className="input-group-text bg-white form-control-border-design"
          onClick={() => !disabled && setOpen(!open)}
        >
          <small>{open ? "▲" : "▼"}</small>
        </span>
      </div>

      {open && (
        <div
          className="dropdown-menu show w-100 shadow-sm border mt-1"
          style={{ maxHeight: "250px", overflowY: "auto", zIndex: 1060, display: "block" }}
        >
          {asyncLoading ? (
            <div className="dropdown-item text-muted small py-2">Loading...</div>
          ) : processedOptions.length > 0 ? (
            processedOptions.map((o, idx) => {
              const isHighlighted = idx === highlight;
              return (
                <button
                  key={`${o[valueKey]}-${idx}`}
                  type="button"
                  className={`dropdown-item ${isHighlighted ? "active bg-primary text-white" : "text-dark"}`}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => selectItem(o)}
                  style={{ borderBottom: "1px solid #f8f9fa" }}
                >
                  <div style={{ color: isHighlighted ? "white" : "inherit" }}>
                    {renderLabel ? renderLabel(o) : o[labelKey]}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="dropdown-item text-muted small py-2">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
/***SAMPLE USAGE
 * <SearchableSelect
    value={selectedProduct}
    onChange={e => setSelectedProduct(e.target.value)}
    labelKey="title"
    valueKey="product_id"
    placeholder="Search Product..."
    loadOptions={async (search) => {
        const res = await apiFetch(`${API_BASE}api/products/search/?q=${search}`);
        return res.data || [];
    }}
/>
 */