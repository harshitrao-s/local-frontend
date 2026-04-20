import React, { useState, useEffect } from "react";

const CommonTable = ({
  config = [],
  data = [],
  isSearchable = false,
  searchFromApi = false,
  onSearch = () => {},
  debounceTime = 500,
  showSearchButton = true,
  showClearButton = true,
}) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  // ================= DEBOUNCE =================
  useEffect(() => {
    if (searchFromApi) {
      const timer = setTimeout(() => {
        setDebouncedSearch(search);
      }, debounceTime);

      return () => clearTimeout(timer);
    } else {
      setDebouncedSearch(search);
    }
  }, [search, debounceTime, searchFromApi]);

  // ================= SEARCH =================
  useEffect(() => {
    if (searchFromApi) {
      onSearch(debouncedSearch);
    } else {
      const filtered = data.filter((row) =>
        Object.values(row).some((val) =>
          String(val || "")
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  }, [debouncedSearch, data, searchFromApi, onSearch]);

  // ================= SEARCH HANDLERS =================
  const handleSearch = () => {
    if (searchFromApi) {
      onSearch(search);
    } else {
      setDebouncedSearch(search);
    }
  };

  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    if (searchFromApi) onSearch("");
  };

  const tableData = searchFromApi ? data : filteredData;

  return (
    <div>
      {/* ================= SEARCH ================= */}
      {isSearchable && (
        <div
          style={{
            background: "#f9fafb",
            borderRadius: "14px",
            padding: "10px",
            border: "1px solid #e5e7eb",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ position: "relative", width: "260px" }}>
            <i
              className="fas fa-search"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                fontSize: "12px",
              }}
            />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 34px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                background: "#fff",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {showSearchButton && (
              <button
                onClick={handleSearch}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  background: "#0f0f1a",
                  color: "#fff",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Search
              </button>
            )}

            {showClearButton && (
              <button
                onClick={clearSearch}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  background: "#ffffff",
                  color: "#374151",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div
        style={{
          width: "100%",
          background: "#fff",
          borderRadius: "14px",
          border: "1px solid #f0f0f5",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              tableLayout: "auto", // 🔥 changed from fixed
              borderCollapse: "separate",
              borderSpacing: 0,
            }}
          >
            <thead style={{ background: "#fafafa" }}>
              <tr>
                {config.map((col, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "14px 16px",
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "#9ca3af",
                      textAlign: col.align || "left",
                      borderBottom: "1px solid #f0f0f5",
                    }}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {tableData.length > 0 ? (
                tableData.map((row, i) => (
                  <tr key={i}>
                    {config.map((col, j) => (
                      <td
                        key={j}
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid #f1f5f9",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: col.align || "left",
                        }}
                      >
                        {col.type === "actions" ? (
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              justifyContent:
                                col.align === "center"
                                  ? "center"
                                  : "flex-start",
                            }}
                          >
                            {col.actions?.map((action, idx) => (
                              <button
                                key={idx}
                                onClick={() => action.onClick(row)}
                                title={action.label}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  cursor: "pointer",
                                  color: "#374151",
                                  fontSize: "13px",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.color = "#111827")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.color = "#374151")
                                }
                              >
                                <i className={action.icon} />
                              </button>
                            ))}
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
                    style={{ padding: "50px", textAlign: "center" }}
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

export default CommonTable;