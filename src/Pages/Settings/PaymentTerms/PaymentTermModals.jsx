import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../../../Config/api";
import { apiFetch } from "../../../Utils/apiFetch";
import { useMasterData } from "../../../Context/MasterDataProvider";
import { Button } from "../../../Components/Common/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Components/Common/ui/select";
import { Input } from "../../../Components/Common/ui/input";

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
            type="button"
            onClick={onClose}
            className="rounded-md p-1"
          >
            ✕
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
                  <SelectContent className="z-[1100] w-full min-w-[200px] bg-white" position="popper">
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

                  <SelectContent className="z-[1100] w-full min-w-[10px] bg-white" position="popper">
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

                <SelectContent className="z-[1100] w-full min-w-[420px] bg-white" position="popper">
                  <SelectItem className="hover:bg-gray-100 border-gray-100" value="Active">Active</SelectItem>
                  <SelectItem className="hover:bg-gray-100 border-gray-100" value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-3 py-2">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
               className="bg-[#FF141F] rounded-[12px] text-white"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-[#1A71F6] rounded-[12px] text-white"
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