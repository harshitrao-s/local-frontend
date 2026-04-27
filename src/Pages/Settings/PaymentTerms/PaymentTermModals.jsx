import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../../../Config/api";
import { apiFetch } from "../../../Utils/apiFetch";
import { useMasterData } from "../../../Context/MasterDataProvider";
import { Button } from "../../../Components/Common/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Components/Common/ui/select";
import { Input } from "../../../Components/Common/ui/input";

const CSS = `
  .ptm-overlay {
    position:fixed;inset:0;background:rgba(0,0,0,.45);
    display:flex;align-items:center;justify-content:center;
    z-index:1050;backdrop-filter:blur(2px);
  }
  .ptm-modal {
    background:#fff;border-radius:16px;
    box-shadow:0 24px 60px rgba(0,0,0,.18);
    width:100%;max-width:460px;overflow:hidden;
    animation:ptm-in .18s ease;
  }
  @keyframes ptm-in {
    from { opacity:0;transform:translateY(-12px) scale(.98); }
    to   { opacity:1;transform:translateY(0) scale(1); }
  }
  .ptm-header {
    color:#0f0f1a;padding:18px 22px;
    display:flex;align-items:center;justify-content:space-between;
  }
  .ptm-header-left { display:flex;align-items:center;gap:12px; }
  .ptm-header-icon {
    width:34px;height:34px;border-radius:9px;
    color:#0f0f1a,
    display:flex;align-items:center;justify-content:center;
    font-size:14px;color:#e2e8f0;
  }
  .ptm-header-title { font-size:15px;font-weight:700;color:#0f0f1a;margin:0; }
  .ptm-header-sub   { font-size:11px;color:#64748b;margin:0; }
  .ptm-close-btn {
    background:rgba(255,255,255,.08);border:none;
    width:30px;height:30px;border-radius:8px;
    color:#94a3b8;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    transition:all .15s;font-size:13px;
  }

  .ptm-body { padding:22px; }

  .ptm-field { margin-bottom:16px; }
  .ptm-label {
    display:block;font-size:11px;font-weight:700;
    color:#6b7280;text-transform:uppercase;letter-spacing:.5px;
    margin-bottom:6px;
  }
  .ptm-input, .ptm-select {
    width:100%;padding:9px 12px;border-radius:8px;
    border:1px solid #e5e7eb;font-size:13px;color:#0f0f1a;
    outline:none;transition:border-color .15s,box-shadow .15s;
    background:#fff;
  }
  .ptm-input:focus, .ptm-select:focus {
    border-color:#0f0f1a;
    box-shadow:0 0 0 3px rgba(15,15,26,.08);
  }
  .ptm-hint { font-size:11px;color:#9ca3af;margin-top:5px; }

  .ptm-row { display:grid;grid-template-columns:1fr 1fr;gap:14px; }

  .ptm-footer {
    padding:16px 22px;
    border-top:1px solid #f0f0f5;
    display:flex;justify-content:flex-end;gap:10px;
    background:#fafafa;
  }
  .ptm-btn-cancel {
    padding:9px 20px;border-radius:8px;border:1px solid #e5e7eb;
    background:#fff;color:#374151;font-size:13px;font-weight:600;
    cursor:pointer;transition:all .15s;
  }
  .ptm-btn-cancel:hover { background:#f3f4f6; }
  .ptm-btn-save {
    padding:9px 24px;border-radius:8px;border:none;
    background:#0f0f1a;color:#fff;font-size:13px;font-weight:700;
    cursor:pointer;transition:all .15s;
    display:flex;align-items:center;gap:8px;
  }
  .ptm-btn-save:hover { background:#1f1f35; }
  .ptm-btn-save:disabled { opacity:.5;cursor:not-allowed; }
`;

const PaymentTermModals = ({ config, onClose, onRefresh }) => {
  const { type, data } = config;
  const isEdit = type === "edit";
  const { refreshMasterData } = useMasterData();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "", name: "", termOption: "", frequency: "", status: "Active",
  });

  const termOptionLabels = {
    frequency: "Frequency (Days)",
    nextMonth14: "14th of Next Month",
    nextMonthLastDay: "Last day of Next Month",
    nextNextMonthLastDay: "Last day of Next to Next Month",
  };

  const normalizeStatus = (raw) => {
    const s = String(raw ?? "").trim().toLowerCase();
    if (s === "1" || s === "active") return "Active";
    if (s === "0" || s === "inactive") return "Inactive";
    return "Active";
  };

  useEffect(() => {
    if (isEdit && data) {
      const normalized = data.frequency?.toString().trim().toLowerCase();
      const option = data.term_option
        || (normalized === "14th of next month"
          ? "nextMonth14"
          : normalized === "last day of next month"
            ? "nextMonthLastDay"
            : normalized === "last day of next to next month"
              ? "nextNextMonthLastDay"
              : "frequency");

      setFormData({
        type: data.type,
        name: data.name,
        termOption: option,
        frequency: option === "frequency" ? data.frequency : "",
        status: normalizeStatus(data.status),
      });
    }
  }, [type, data]);

  useEffect(() => {
    // Business rule: Prepaid is always Frequency with 0 days.
    if (String(formData.type) === "1") {
      if (formData.termOption !== "frequency" || String(formData.frequency) !== "0") {
        setFormData(prev => ({ ...prev, termOption: "frequency", frequency: "0" }));
      }
    }
  }, [formData.type, formData.termOption, formData.frequency]);

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!formData.name || !formData.termOption || (formData.termOption === "frequency" && !formData.frequency)) {
      return Swal.fire("Required", "Please fill in all mandatory fields.", "info");
    }

    const payload = {
      ...formData,
      term_option: formData.termOption,
      frequency: String(formData.type) === "1"
        ? 0
        : (formData.termOption === "frequency"
          ? formData.frequency
          : termOptionLabels[formData.termOption]),
    };

    setLoading(true);
    const url = isEdit
      ? `${API_BASE}api/payment-terms/update/${data.id}`
      : `${API_BASE}api/payment-terms/create`;
    try {
      const res = await apiFetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      if (res.status) {
        Swal.fire("Success", res.message || "Term saved", "success");
        await refreshMasterData();
        onRefresh();
        onClose();
      } else {
        Swal.fire("Error", res.message, "error");
      }
    } catch (e) {
      Swal.fire("Error", "Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      {/* <div className="ptm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="ptm-modal">

          <div className="ptm-header">
            <div className="ptm-header-left">
              <div className="ptm-header-icon">
                <i className={`fas ${isEdit ? "fa-pen" : "fa-plus"}`} />
              </div>
              <div>
                <p className="ptm-header-title">{isEdit ? "Edit Payment Term" : "Add Payment Term"}</p>
                <p className="ptm-header-sub">{isEdit ? `Editing: ${data?.name}` : "Configure a new payment term"}</p>
              </div>
            </div>
            <button className="ptm-close-btn" onClick={onClose}>
              <i className="fas fa-times" />
            </button>
          </div>

          <div className="ptm-body">

            <div className="ptm-field">
              <label className="ptm-label">Name <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                type="text"
                className="ptm-input"
                placeholder="e.g., NET 30"
                value={formData.name}
                onChange={e => set("name", e.target.value)}
              />
            </div>

            <div className="ptm-row">
              <div className="ptm-field mb-2">
                <label className="ptm-label">Type</label>
                <select className="ptm-select" value={formData.type} onChange={e => set("type", e.target.value)}>
                  <option value="">Select</option>
                  <option value="1">Prepaid</option>
                  <option value="2">Postpaid</option>
                </select>
              </div>

              <div className="ptm-field mb-0">
                <label className="ptm-label">Frequency (Days) <span style={{ color: "#ef4444" }}>*</span></label>
                <select
                  className="ptm-select"
                  value={formData.termOption}
                  onChange={e => set("termOption", e.target.value)}
                  disabled={String(formData.type) === "1"}
                >
                  <option value="" disabled hidden>Select payment term</option>
                  <option value="frequency">Frequency</option>
                  <option value="nextMonth14">14th of Next Month</option>
                  <option value="nextMonthLastDay">Last day of Next Month</option>
                  <option value="nextNextMonthLastDay">Last day of Next to Next Month</option>
                </select>
              </div>
            </div>

            {formData.termOption === "frequency" && (
              <div className="ptm-field">
                <label className="ptm-label">Days <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  type="number"
                  className="ptm-input"
                  placeholder="Enter day count, e.g. 30"
                  min="0"
                  value={formData.frequency}
                  onChange={e => set("frequency", e.target.value)}
                  onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                  disabled={String(formData.type) === "1"}
                />
                <p className="ptm-hint">
                  {String(formData.type) === "1"
                    ? "For Prepaid, days are fixed to 0."
                    : "Enter the number of days for the frequency term."}
                </p>
              </div>
            )}

            <div className="ptm-field">
              <label className="ptm-label">Status</label>
              <select className="ptm-select" value={formData.status} onChange={e => set("status", e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

          </div>

          <div className="ptm-footer">
            <button className="ptm-btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className="ptm-btn-save" onClick={handleSave} disabled={loading}>
              {loading
                ? <><i className="fas fa-spinner fa-spin" /> Processing…</>
                : <><i className={`fas ${isEdit ? "fa-save" : "fa-plus"}`} /> {isEdit ? "Save Changes" : "Create Term"}</>
              }
            </button>
          </div>

        </div>
      </div> */}

      <div
        className="fixed inset-0 z-[1050] bg-black/50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="w-full max-w-[450px] rounded-[20px] bg-white shadow-xl border border-gray-200 overflow-visible">

          {/* Header */}
          <div className="flex items-center justify-between  px-2 py-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <i className={`fas ${isEdit ? "fa-pen" : "fa-plus"}`} />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  {isEdit ? "Edit Payment Term" : "Add Payment Term"}
                </p>
                <p className="text-xs text-gray-500">
                  {isEdit
                    ? `Editing: ${data?.name}`
                    : "Configure a new payment term"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-md p-2 hover:bg-gray-100"
            >
              <i className="fas fa-times" />
            </button>
          </div>

          {/* Body */}
          <div className="p-3 space-y-4">

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g., NET 30"
                value={formData.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            {/* Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Type */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Type</label>
                <Select
                  value={formData.type || undefined}
                  onValueChange={(val) => set("type", val)}
                >
                  <SelectTrigger className="w-full rounded-[16px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="z-[1100] w-full min-w-[220px] bg-white" position="popper">
                    <SelectItem className="hover:bg-gray-100 border-gray-100" value="1">Prepaid</SelectItem>
                    <SelectItem className="hover:bg-gray-100 border-gray-100" value="2">Postpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Term Option */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Frequency (Days) <span className="text-red-500">*</span>
                </label>

                <Select
                  value={formData.termOption || undefined}
                  onValueChange={(val) => set("termOption", val)}
                  disabled={String(formData.type) === "1"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment term" />
                  </SelectTrigger>

                  <SelectContent className="z-[1100] w-full min-w-[50px] bg-white" position="popper">
                    <SelectItem className="hover:bg-gray-100 border-gray-100" value="frequency">Frequency</SelectItem>
                    <SelectItem className="hover:bg-gray-100 border-gray-100" value="nextMonth14">
                      14th of Next Month
                    </SelectItem>
                    <SelectItem className="hover:bg-gray-100 border-gray-100" value="nextMonthLastDay">
                      Last day of Next Month
                    </SelectItem>
                    <SelectItem className="hover:bg-gray-100 border-gray-100" value="nextNextMonthLastDay">
                      Last day of Next to Next Month
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Frequency Input */}
            {formData.termOption === "frequency" && (
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Days <span className="text-red-500">*</span>
                </label>

                <Input
                  type="number"
                  placeholder="Enter day count, e.g. 30"
                  min="0"
                  value={formData.frequency}
                  onChange={(e) => set("frequency", e.target.value)}
                  onKeyDown={(e) =>
                    ["e", "E", "+", "-"].includes(e.key) &&
                    e.preventDefault()
                  }
                  disabled={String(formData.type) === "1"}
                />

                <p className="text-xs text-gray-500">
                  {String(formData.type) === "1"
                    ? "For Prepaid, days are fixed to 0."
                    : "Enter the number of days for the frequency term."}
                </p>
              </div>
            )}

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Status</label>

              <Select
                value={formData.status || undefined}
                onValueChange={(val) => set("status", val)}
              >
                <SelectTrigger>
                  <SelectValue  placeholder="Select Status" />
                </SelectTrigger>

                <SelectContent className="z-[1100] w-full min-w-[460px] bg-white" position="popper">
                  <SelectItem className="hover:bg-gray-100 border-gray-100" value="Active">Active</SelectItem>
                  <SelectItem className="hover:bg-gray-100 border-gray-100" value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-3 py-2">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
               className="bg-[#6c757d] text-white"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-black"
            >
              {loading
                ? "Processing..."
                : isEdit
                  ? "Save Changes"
                  : "Create Term"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentTermModals;