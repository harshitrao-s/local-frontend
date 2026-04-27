import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../../Config/api";
import { apiFetch } from "../../Utils/apiFetch";
import { Button } from "../../Components/Common/ui/button";
import { Input } from "../../Components/Common/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/Common/ui/select";

const UOMModal = ({ mode, initialData, onClose, onRefresh }) => {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [status, setStatus] = useState("1");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name || "");
      setShortName(initialData.short_name || "");
      setStatus(initialData.status?.toString() || "1");
    }
  }, [mode, initialData]);

  const handleSave = async () => {
    if (!name.trim() || !shortName.trim()) {
      Swal.fire("Validation", "Both Name and Short Code are required.", "info");
      return;
    }

    setLoading(true);
    const id = initialData?.uom_id;
    const baseUrl = `${API_BASE}api/product_api/product_uom`;
    const url = mode === 'add' ? `${baseUrl}/create` : `${baseUrl}/update/${id}`;

    const payload = {
      name: name,
      short_name: shortName,
      status: parseInt(status)
    };

    try {
      const response = await apiFetch(url, {
        method: mode === 'add' ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      const resData = await response;
      console.log(resData);
      if (resData.status) {
        Swal.fire({ icon: 'success', title: 'Unit Saved', timer: 1500, showConfirmButton: false });
        onRefresh();
        onClose();
      } else {
        throw new Error(resData.message || "Failed to save unit.");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="fixed inset-0 z-[1050] bg-black/50 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl bg-white overflow-visible border border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between  px-2 py-1">
          <h6 className="text-sm font-bold">
            {mode === "edit" ? "Edit Unit" : "Add New Unit"}
          </h6>

          <Button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 bg-white border-0 hover:bg-gray-100 transition"
          >
            ✕
          </Button>
        </div>

        {/* Body */}
        <div className="p-3 space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Unit Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kilogram"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Short Code</label>
            <Input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value.toUpperCase())}
              placeholder="e.g. KG"
              disabled={loading}
              className="uppercase"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Status</label>

            <Select
              value={status}
              onValueChange={(value) => setStatus(value)}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>

              <SelectContent className="z-[1100] w-[470px] bg-white p-1"  position="popper" >
                <SelectItem className="hover:bg-gray-100" value="1">Active</SelectItem>
                <SelectItem className="hover:bg-gray-100" value="0">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-3 py-1">
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
              variant={mode === "add" ? "default" : "default"}
              className="bg-black"
            >
              {loading ? "Saving..." : "Save Unit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
};

      export default UOMModal;