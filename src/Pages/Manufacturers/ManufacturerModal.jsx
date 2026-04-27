import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../../Config/api";
import { apiFetch, getCookie } from "../../Utils/apiFetch";
import { Button } from "../../Components/Common/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/Common/ui/select";
import { Input } from "../../Components/Common/ui/input";


const ManufacturerModal = ({ mode, initialData, onClose, onRefresh }) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("1");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name || "");
      setStatus(initialData.status?.toString() || "1");
    }
  }, [mode, initialData]);

  const handleSave = async () => {
    if (!name.trim()) {
      Swal.fire("Required", "Manufacturer name cannot be empty.", "info");
      return;
    }

    setLoading(true);
    const id = initialData?.manufacturer_id;
    const url = mode === 'add'
      ? `${API_BASE}api/product_api/api/manufacturers/create`
      : `${API_BASE}api/product_api/api/manufacturers/update/${id}`;

    try {
      const response = await apiFetch(url, {
        method: mode === 'add' ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, status: parseInt(status) }),
        credentials: "include"
      });

      const resData = await response;

      if (resData.status) {
        Swal.fire({ icon: 'success', title: 'Saved Successfully', timer: 1500, showConfirmButton: false });
        onRefresh();
        onClose();
      } else {
        throw new Error(resData.message || "Failed to save.");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="fixed inset-0 z-[1050] bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200 overflow-visible">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-2 py-1">
          <h6 className="text-sm font-bold">
            {mode === "edit" ? "Edit Manufacturer" : "New Manufacturer"}
          </h6>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-3 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              Manufacturer Name
            </label>

            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              placeholder="Enter company name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">
              Status
            </label>

            <Select
              value={status || undefined}
              onValueChange={setStatus}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>

              <SelectContent
                className="z-[1100] w-[470px] bg-white"
                position="popper"
              >
                <SelectItem className="hover:bg-gray-100" value="1">
                  Active
                </SelectItem>

                <SelectItem className="hover:bg-gray-100" value="0">
                  Inactive
                </SelectItem>
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
              : mode === "add"
                ? "Save"
                : "Update"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerModal;