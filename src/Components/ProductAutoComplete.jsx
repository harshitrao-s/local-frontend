import React, { useEffect, useRef, useState } from "react";
import { API_ENDPOINTS } from "../Config/api";
import apiFetch from "../Utils/apiFetch";
import { Input } from "./Common/ui/input";

const ProductAutoComplete = ({ value, onChange, onSelect }) => {
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [show, setShow]         = useState(false);
  const containerRef            = useRef(null);
  const inputRef                = useRef(null);

  useEffect(() => {
    if (!value || value.length < 2 || value.length > 10) {
      setResults([]);
      return;
    }
    const delay = setTimeout(() => fetchProducts(value), 300);
    return () => clearTimeout(delay);
  }, [value]);

  const fetchProducts = async (q) => {
    setLoading(true);
    try {
      const res = await apiFetch(
        `${API_ENDPOINTS.PRODUCT_SEARCH}?q=${encodeURIComponent(q)}`,
        { credentials: "include" }
      );
      setResults(res?.data || []);
      setShow(true);
    } catch (err) {
      console.error("Product search failed", err);
      setResults([]);
      setShow(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultProducts = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(
        `${API_ENDPOINTS.PRODUCT_SEARCH}?limit=20`,
        { credentials: "include" }
      );
      setResults(res?.data || []);
      setShow(true);
    } catch (err) {
      console.error("Default product fetch failed", err);
      setResults([]);
      setShow(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (product) => {
    onSelect(product);
    setShow(false);
    setResults([]);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange("");
    setResults([]);
    setShow(false);
    inputRef.current?.focus();
  };

  return (
    <div className="position-relative" ref={containerRef}>
      <Input
        type="text"
        ref={inputRef}
        // className="form-control pe-5"
        placeholder="Search product..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (!value) fetchDefaultProducts();
          else setShow(true);
        }}
      />

      {/* ✅ Clear button */}
      {value && !loading && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            position: "absolute", right: "10px", top: "50%",
            transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: "#9ca3af", fontSize: "13px", padding: "0", lineHeight: 1,
            zIndex: 10,
          }}
        >
          <i className="fas fa-times" />
        </button>
      )}

      {/* Loader inside input */}
      {loading && (
        <div className="position-absolute top-50 end-0 translate-middle-y me-3">
          <div className="spinner-border spinner-border-sm text-secondary" />
        </div>
      )}

      {show && (
        <div
          className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
          style={{ zIndex: 1000, maxHeight: 300, overflowY: "auto" }}
        >
          {loading && (
            <div className="p-2 text-muted">Searching...</div>
          )}

          {!loading && results.length === 0 && (
            <div className="p-2 text-muted">No product found</div>
          )}

          {!loading && results.map((p) => (
            <div
              key={p.id}
              className="p-2 border-bottom d-flex gap-2 autocomplete-item"
              style={{ cursor: "pointer" }}
              onClick={() => handleSelect(p)}
            >
              <img
                src={p.image}
                alt={p.title}
                style={{
                  width: 48, height: 48, objectFit: "contain",
                  border: "1px solid #eee", borderRadius: 4,
                }}
                onError={(e) => (e.target.style.display = "none")}
              />
              <div>
                <div className="fw-bold">{p.title}</div>
                <div className="small text-muted">SKU: <b>{p.sku}</b></div>
                <div className="small text-muted">Price: <b>{p.price}</b></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductAutoComplete;