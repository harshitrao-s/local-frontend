import React, { useState, useEffect, useMemo } from "react";

const CommonTable = ({
  title = "",
  subtitle = "",
  icon = "fas fa-table",
  config = [],
  data = [],
  isSearchable = true,
  searchFromApi = false,
  onSearch = () => {},
  debounceTime = 300,
  isSortable = true,
  defaultSort = null, // { field: "name", dir: "asc" }
}) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [columnWidths, setColumnWidths] = useState({});
  const [sortConfig, setSortConfig] = useState(defaultSort);

  // INIT WIDTH
  useEffect(() => {
    const widths = {};
    config.forEach((col, i) => {
      widths[i] = col.width || 150;
    });
    setColumnWidths(widths);
  }, [config]);

  // DEBOUNCE
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

  // LOCAL FILTER
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

  // SORTING
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

  // RESIZE
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
      if (prev?.field === col.field) {
        if (prev.dir === "asc") return { field: col.field, dir: "desc" };
        if (prev.dir === "desc") return null;
      }
      return { field: col.field, dir: "asc" };
    });
  };

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
    <div className="h-full flex flex-col w-full">
      {/* HEADER */}
      {(title || subtitle) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-[38px] h-[38px] rounded-xl bg-purple-50 flex items-center justify-center shadow-md">
              <i className={icon} />
            </div>

            <div>
              <h3 className="text-[22px] font-extrabold m-0">{title}</h3>
              <p className="text-xs text-gray-400 m-0">{subtitle}</p>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH */}
      {isSearchable && (
        <div className="bg-white rounded-xl p-3 border border-gray-100 mb-3 flex gap-2.5">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none"
            />
          </div>

          <button
            onClick={handleSearch}
            className="px-4 py-2 rounded-lg bg-[#0f0f1a] text-white text-xs font-bold"
          >
            Search
          </button>

          {search && (
            <button
              onClick={clearSearch}
              className="px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* TABLE */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm table-fixed border-collapse">
            {/* HEADER */}
            <thead className="bg-gray-50">
              <tr>
                {config.map((col, i) => (
                  <th
                    key={i}
                    onClick={() => handleSort(col)}
                    className="text-xs font-semibold text-gray-500 px-3 py-2 border-b border-gray-200 text-left relative cursor-pointer select-none"
                    style={{ width: columnWidths[i] }}
                  >
                    <div className="flex items-center gap-1">
                      {col.title}

                      {isSortable && col.field && (
                        <span className="text-[10px]">
                          {sortConfig?.field === col.field
                            ? sortConfig.dir === "asc"
                              ? "▲"
                              : sortConfig.dir === "desc"
                              ? "▼"
                              : ""
                            : ""}
                        </span>
                      )}
                    </div>

                    {/* RESIZER */}
                    <div
                      onMouseDown={(e) => startResizing(i, e)}
                      className="absolute right-0 top-0 h-full w-[6px] cursor-col-resize z-10"
                    />
                  </th>
                ))}
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {processedData.length > 0 ? (
                processedData.map((row, i) => (
                  <tr
                    key={i}
                    className={`h-[44px] transition ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-indigo-50`}
                  >
                    {config.map((col, j) => (
                      <td
                        key={j}
                        className="px-3 py-2 border-b border-gray-100 truncate"
                        style={{ width: columnWidths[j] }}
                      >
                        {col.type === "actions" ? (
                          <div className="flex items-center gap-1">
                            {col.actions?.map((action, idx) => {
                              const iconClass =
                                typeof action.icon === "function"
                                  ? action.icon(row)
                                  : action.icon;

                              return (
                                <button
                                  key={idx}
                                  onClick={() => action.onClick(row)}
                                  className={`px-2 py-1 text-[11px] rounded-md border flex items-center gap-1 cursor-pointer
                                    ${
                                      action.type === "delete"
                                        ? "border-red-200 bg-red-50 text-red-700"
                                        : "border-gray-200 bg-gray-50 text-gray-900"
                                    }
                                    ${action.className || ""}
                                  `}
                                >
                                  {iconClass && <i className={iconClass} />}
                                  {action.label && <span>{action.label}</span>}
                                </button>
                              );
                            })}
                          </div>
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
                  <td
                    colSpan={config.length}
                    className="text-center py-10 text-gray-400"
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CommonTable);