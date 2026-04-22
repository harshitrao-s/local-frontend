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
  isPaginated = false,
}) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [columnWidths, setColumnWidths] = useState({});
  const [sortConfig, setSortConfig] = useState(defaultSort);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const widths = {};
    config.forEach((col, i) => {
      widths[i] = col.width || 150;
    });
    setColumnWidths(widths);
  }, [config]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceTime);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (searchFromApi) onSearch(debouncedSearch);
  }, [debouncedSearch]);

  const filteredData = useMemo(() => {
    if (searchFromApi) return data;
    if (!debouncedSearch) return data;

    const lower = debouncedSearch.toLowerCase();

    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? "").toLowerCase().includes(lower)
      )
    );
  }, [data, debouncedSearch]);

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
          ? String(aVal).localeCompare(String(aVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return result;
  }, [filteredData, sortConfig]);

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

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="mainTable">

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

      {isSearchable && (
        <div style={{ marginBottom: "16px" }}>
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

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
                      <span className="mainTable__sortIcon">
                        {SbAdminSvg.sortingIcon}
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
              processedData.map((row, i) => {
                const isOpen = expandedRows[i];

                return (
                  <React.Fragment key={i}>

                    <tr className="desktopRow">
                      {config.map((col, j) => (
                        <td key={j} style={{ width: columnWidths[j] }}>
                          {col.type === "actions"
                            ? col.render
                              ? col.render(row, i)
                              : null
                            : col.render
                              ? col.render(row[col.field], row)
                              : row[col.field] ?? "—"}
                        </td>
                      ))}
                    </tr>

                    <tr className="mobileRow">
                      <td colSpan={config.length}>

                        <div
                          className="mainTable__mobileHeader"
                          onClick={() => toggleRow(i)}
                        >
                          <div className="left">
                            <span className="title">
                              {row[config[0]?.field]}
                            </span>
                          </div>

                          <div className="arrow-style">
                            {isOpen ? SbAdminSvg.arrowDownIconSvg : SbAdminSvg.arrowUpIconSvg}
                          </div>
                        </div>

                        {/* ✅ ANIMATED CONTENT */}
                        <div className={`mobileContentWrapper ${isOpen ? "open" : ""}`}>
                          <div className="mainTable__mobileContent grid gap-[12px] mb-[12px]">
                            {config.slice(1).map((col, j) => (
                              <div key={j} className="mainTable__mobileItem">
                                <span className="label">{col.title}</span>

                                <span className="value">
                                  {col.type === "actions"
                                    ? col.render
                                      ? col.render(row, i)
                                      : null
                                    : col.render
                                      ? col.render(row[col.field], row)
                                      : row[col.field] ?? "—"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </td>
                    </tr>

                  </React.Fragment>
                );
              })
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

      {isPaginated && (
        <div style={{ marginTop: "16px" }}>
          <Pagination />
        </div>
      )}
    </div>
  );
};

export default React.memo(CommonTable);