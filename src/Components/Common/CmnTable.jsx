import React, { useState, useEffect, useMemo } from "react";
import "./CommonTable.css";
import { SbAdminSvg } from "./Svgs/ActionsSvg";
import SearchBar from "./ui/SearchBar";
import Pagination from "./Pagination";

const CommonTable = ({
  title = "",
  subtitle = "",
  icon = "fas fa-table",
  config = [],
  data = [],
  isSearchable = true,
  searchFromApi = false,
  onSearch = () => { },
  debounceTime = 300,
  isSortable = true,
  defaultSort = null,
  isPaginated = true,
}) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [columnWidths, setColumnWidths] = useState({});
  const [sortConfig, setSortConfig] = useState(defaultSort);

  // INIT COLUMN WIDTHS
  useEffect(() => {
    const widths = {};
    config.forEach((col, i) => {
      widths[i] = col.width || 150;
    });
    setColumnWidths(widths);
  }, [config]);

  // DEBOUNCE SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [search, debounceTime]);

  // API SEARCH
  useEffect(() => {
    if (searchFromApi) onSearch(debouncedSearch);
  }, [debouncedSearch, searchFromApi, onSearch]);

  // FILTER DATA
  const filteredData = useMemo(() => {
    if (searchFromApi) return data;
    if (!debouncedSearch) return data;

    const lower = debouncedSearch.toLowerCase();

    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? "").toLowerCase().includes(lower)
      )
    );
  }, [data, debouncedSearch, searchFromApi]);

  // SORT DATA
  const processedData = useMemo(() => {
    let result = [...filteredData];

    if (isSortable && sortConfig?.field) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.field];
        const bVal = b[sortConfig.field];

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.dir === "asc"
            ? aVal - bVal
            : bVal - aVal;
        }

        return sortConfig.dir === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return result;
  }, [filteredData, sortConfig, isSortable]);

  // COLUMN RESIZE
  const startResizing = (index, e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[index];

    const onMouseMove = (moveEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);

      setColumnWidths((prev) => ({
        ...prev,
        [index]: Math.max(newWidth, 80),
      }));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // SORT HANDLER
  const handleSort = (col) => {
    if (!isSortable || col.type === "actions" || !col.field) return;

    setSortConfig((prev) => {
      if (prev?.field !== col.field) {
        return { field: col.field, dir: "asc" };
      }

      return {
        field: col.field,
        dir: prev.dir === "asc" ? "desc" : "asc",
      };
    });
  };

  // SEARCH HANDLER
  const handleSearch = () => {
    if (searchFromApi) onSearch(search);
    else setDebouncedSearch(search);
  };

  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    if (searchFromApi) onSearch("");
  };

  return (
    <div className="mainTable">

      {/* HEADER */}
      {(title || subtitle) && (
        <div className="mainTable__header">
          <div className="mainTable__titleBox">
            <div className="mainTable__icon">
              <i className={icon} />
            </div>

            <div>
              <h3 className="mainTable__title">{title}</h3>
              <p className="mainTable__subtitle">{subtitle}</p>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH */}
      {isSearchable && (
        <div className="mb-[24px]">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
          />
        </div>
      )}

      {/* TABLE */}
      <div className="mainTable__container">
        <table>
          <thead>
            <tr>
              {config.map((col, i) => (
                <th
                  key={i}
                  onClick={() => handleSort(col)}
                  style={{ width: columnWidths[i] }}
                >
                  <div className="mainTable__thContent">
                    {col.title}

                    {isSortable && col.field && (
                      <span className="mainTable__sortIcon single">
                        {sortConfig?.field === col.field ? (
                          <span>{SbAdminSvg.sortingIcon}</span>
                        ) : (
                          <span className="inactive">
                            {SbAdminSvg.sortingIcon}
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <div
                    className="mainTable__resizer"
                    onMouseDown={(e) => startResizing(i, e)}
                  />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {processedData.length > 0 ? (
              processedData.map((row, i) => (
                <tr key={i}>
                  {config.map((col, j) => (
                    <td key={j} style={{ width: columnWidths[j] }}>

                      {/* ✅ ACTIONS COLUMN */}
                      {col.type === "actions" ? (
                        col.render ? (
                          col.render(row, i)
                        ) : (
                          <div className="mainTable__actions">
                            {col.actions?.map((action, idx) => (
                              <button
                                key={idx}
                                onClick={() => action.onClick(row)}
                                className={`mainTable__actionBtn ${action.type === "delete" ? "delete" : ""}`}
                              >
                                {action.icon && <i className={action.icon} />}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )
                      ) : col.render ? (
                        col.render(row[col.field], row)
                      ) : (
                        row[col.field] ?? "—"
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={config.length} className="mainTable__empty">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>


      </div>
      {isPaginated && <div className="mt-[24px]">
        <Pagination />

      </div>}
    </div>
  );
};

export default React.memo(CommonTable);