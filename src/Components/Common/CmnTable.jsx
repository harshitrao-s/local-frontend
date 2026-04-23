import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./CommonTable.css";
import { SbAdminSvg } from "./Svgs/ActionsSvg";
import SearchBar from "./ui/SearchBar";
import Pagination from "./Pagination";
import apiFetch from "../../Utils/apiFetch";

const CommonTable = ({
  title = "",
  subtitle = "",
  icon = "fas fa-table",
  config = [],
  data = [],
  isSearchable = true,
  searchFromApi = false,
  debounceTime = 300,
  isSortable = true,
  defaultSort = null,
  isPaginated = false,
  MainContainerCssClases,
  searchAPi = "",
  SearchPlaceHolder = "Search...",
  bodyHeight = "calc(100vh - 350px)", // ✅ NEW PROP
  onPageChange,
  currentPage = 1,
  totalPages = 1,
  searchParamKey = "q",
}) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tableData, setTableData] = useState(data || []);
  const [columnWidths, setColumnWidths] = useState({});
  const [sortConfig, setSortConfig] = useState(defaultSort);
  const [expandedRows, setExpandedRows] = useState({});

  // ✅ Sync data
  useEffect(() => {
    setTableData(data || []);
  }, [data]);

  // ✅ Column widths
  useEffect(() => {
    if (!config.length) return;

    const widths = {};
    config.forEach((col, i) => {
      widths[i] = col.width || 150;
    });
    setColumnWidths(widths);
  }, [config]);

  // ✅ Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [search, debounceTime]);

  // ✅ API Search
  useEffect(() => {
    if (!searchFromApi) return;

    let ignore = false;

    (async () => {
      try {
        const q = new URLSearchParams({ [searchParamKey]: debouncedSearch }).toString();
        const result = await apiFetch(`${searchAPi}${q}`);

        if (!ignore) {
          const newData = result.data || [];
          setTableData((prev) =>
            JSON.stringify(prev) === JSON.stringify(newData)
              ? prev
              : newData
          );
        }
      } catch (e) {
        console.error("Search API error:", e);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, searchFromApi, searchAPi]);

  // ✅ Filter
  const filteredData = useMemo(() => {
    if (searchFromApi) return tableData;
    if (!debouncedSearch) return tableData;

    const lower = debouncedSearch.toLowerCase();

    return tableData.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? "").toLowerCase().includes(lower)
      )
    );
  }, [tableData, debouncedSearch, searchFromApi]);

  // ✅ Sort
  const processedData = useMemo(() => {
    if (!isSortable || !sortConfig?.field) return filteredData;

    const sorted = [...filteredData];

    sorted.sort((a, b) => {
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

    return sorted;
  }, [filteredData, sortConfig, isSortable]);

  // ✅ Sort handler
  const handleSort = useCallback(
    (col) => {
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
    },
    [isSortable]
  );

  // ✅ Resize
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

  // ✅ Mobile toggle
  const toggleRow = useCallback((index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  return (
    <div className={`mainTable ${MainContainerCssClases}`}>

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
            placeholder={SearchPlaceHolder}
          />
        </div>
      )}

      {/* ✅ SCROLLABLE BODY */}
      <div className="mainTable__container">
        <div
          style={{
            maxHeight: bodyHeight,
            overflowY: "auto",
            scrollBehavior: "smooth",
          }}
          className="thin-scroll mainTable__container"
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {config.map((col, i) => (
                  <th
                    key={i}
                    onClick={() => handleSort(col)}
                    style={{
                      width: columnWidths[i],
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                    }}
                  >
                    <span className="mainTable__thContent">
                      {col.title}
                      {isSortable && col.field && (
                        <span className="mainTable__sortIcon">
                          {SbAdminSvg.sortingIcon}
                        </span>
                      )}
                    </span>

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
                      {/* Desktop */}
                      <tr className="desktopRow">
                        {config.map((col, j) => (
                          <td key={j} style={{ width: columnWidths[j] }}>
                            {col.type === "actions"
                              ? col.render?.(row, i)
                              : col.render
                                ? col.render(row[col.field], row)
                                : row[col.field] ?? "—"}
                          </td>
                        ))}
                      </tr>

                      {/* Mobile */}
                      <tr className="mobileRow">
                        <td colSpan={config.length}>
                          <div
                            className="mainTable__mobileHeader"
                            onClick={() => toggleRow(i)}
                          >
                            <span className="title">
                              {row[config[0]?.field]}
                            </span>

                            <div className="arrow-style">
                              {isOpen
                                ? SbAdminSvg.arrowDownIconSvg
                                : SbAdminSvg.arrowUpIconSvg}
                            </div>
                          </div>

                          <div
                            className={`mobileContentWrapper ${isOpen ? "open" : ""
                              }`}
                          >
                            <div className="mainTable__mobileContent">
                              {config.slice(1).map((col, j) => (
                                <div
                                  key={j}
                                  className="mainTable__mobileItem"
                                >
                                  <span className="label">{col.title}</span>
                                  <span className="value">
                                    {col.type === "actions"
                                      ? col.render?.(row, i)
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
      </div>

      {isPaginated && (
        <div style={{ marginTop: "16px" }}>
          <Pagination onPageChange={onPageChange} currentPage={currentPage} totalPages={totalPages} currentPageSize={tableData.length} />
        </div>
      )}
    </div>
  );
};

export default React.memo(CommonTable);