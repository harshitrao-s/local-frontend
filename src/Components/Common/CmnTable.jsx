import React, { useState, useEffect, useMemo } from "react";

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
}) => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [columnWidths, setColumnWidths] = useState({});

    // ================= INIT COLUMN WIDTH =================
    useEffect(() => {
        const widths = {};
        config.forEach((col, i) => {
            widths[i] = col.width || 150;
        });
        setColumnWidths(widths);
    }, [config]);

    // ================= DEBOUNCE =================
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, debounceTime);

        return () => clearTimeout(timer);
    }, [search, debounceTime]);

    // ================= API SEARCH =================
    useEffect(() => {
        if (searchFromApi) {
            onSearch(debouncedSearch);
        }
    }, [debouncedSearch, searchFromApi, onSearch]);

    // ================= LOCAL FILTER =================
    const filteredData = useMemo(() => {
        if (searchFromApi) return data;
        if (!debouncedSearch) return data;

        const lower = debouncedSearch.toLowerCase();

        return data.filter((row) =>
            Object.values(row).some((val) =>
                String(val ?? "")
                    .toLowerCase()
                    .includes(lower)
            )
        );
    }, [data, debouncedSearch, searchFromApi]);

    // ================= RESIZE =================
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

    return (
        <div
            style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                width: "100%",
            }}
        >
            {/* ================= HEADER ================= */}
            {(title || subtitle) && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "16px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div
                            style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "12px",
                                background: "#f5f3ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 16px rgba(0,0,0,.2)",
                            }}
                        >
                            <i className={icon} />
                        </div>

                        <div>
                            <h3 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>
                                {title}
                            </h3>
                            <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
                                {subtitle}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= SEARCH ================= */}
            {isSearchable && (
                <div
                    style={{
                        background: "#fff",
                        borderRadius: "12px",
                        padding: "12px",
                        border: "1px solid #f0f0f5",
                        marginBottom: "12px",
                        display: "flex",
                        gap: "10px",
                    }}
                >
                    <div style={{ position: "relative", flex: 1 }}>
                        <i
                            className="fas fa-search"
                            style={{
                                position: "absolute",
                                left: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#9ca3af",
                                fontSize: "12px",
                            }}
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            style={{
                                width: "100%",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                padding: "8px 12px 8px 36px",
                                fontSize: "13px",
                                outline: "none",
                            }}
                        />
                    </div>

                    <button
                        onClick={handleSearch}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            background: "#0f0f1a",
                            color: "#fff",
                            border: "none",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                        }}
                    >
                        Search
                    </button>

                    {search && (
                        <button
                            onClick={clearSearch}
                            style={{
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb",
                                background: "#fff",
                                fontSize: "12px",
                                cursor: "pointer",
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            )}

            {/* ================= TABLE ================= */}
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #f0f0f5",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div style={{ flex: 1, overflow: "auto" }}>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "13px",
                            tableLayout: "fixed", // 🔥 required for resizing
                        }}
                    >
                        <thead style={{ background: "#fafafa" }}>
                            <tr>
                                {config.map((col, i) => (
                                    <th
                                        key={i}
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            padding: "10px 12px",
                                            textAlign: col.align || "left",
                                            borderBottom: "1px solid #e5e7eb",
                                            whiteSpace: "nowrap",
                                            width: columnWidths[i],
                                            position: "relative",
                                        }}
                                    >
                                        {col.title}

                                        {/* RESIZER */}
                                        <div
                                            onMouseDown={(e) => startResizing(i, e)}
                                            style={{
                                                position: "absolute",
                                                right: 0,
                                                top: 0,
                                                height: "100%",
                                                width: "6px",
                                                cursor: "col-resize",
                                                zIndex: 10,
                                            }}
                                        />
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((row, i) => (
                                    <tr
                                        key={i}
                                        style={{
                                            height: "44px",
                                            background: i % 2 === 0 ? "#ffffff" : "#f9fafb",
                                        }}
                                    >
                                        {config.map((col, j) => (
                                            <td
                                                key={j}
                                                style={{
                                                    padding: "10px 12px",
                                                    borderBottom: "1px solid #f1f5f9",
                                                    verticalAlign: "middle",
                                                    whiteSpace: "nowrap",
                                                    textAlign: col.align || "left",
                                                    width: columnWidths[j],
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {col.type === "actions" ? (
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        {col.actions?.map((action, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => action.onClick(row)}
                                                                style={{
                                                                    padding: "3px 10px",
                                                                    borderRadius: "6px",
                                                                    fontSize: "11px",
                                                                    marginRight: "6px",
                                                                    cursor: "pointer",
                                                                    border:
                                                                        action.type === "delete"
                                                                            ? "1px solid #fee2e2"
                                                                            : "1px solid #e5e7eb",
                                                                    background:
                                                                        action.type === "delete"
                                                                            ? "#fff5f5"
                                                                            : "#f8f8fb",
                                                                    color:
                                                                        action.type === "delete"
                                                                            ? "#b91c1c"
                                                                            : "#111827",
                                                                }}
                                                            >
                                                                {action.label}
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
                                        style={{
                                            textAlign: "center",
                                            padding: "40px",
                                            color: "#9ca3af",
                                        }}
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