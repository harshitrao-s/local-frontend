import React, { useState, useEffect } from "react";
import { API_BASE } from "../../Config/api";
import Swal from "sweetalert2";
import { apiFetch } from "../../Utils/apiFetch";
import { Button } from "../../Components/Common/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/Common/ui/select";
import { Input } from "../../Components/Common/ui/input";

const BrandModal = ({ mode, initialData, onClose, onRefresh }) => {

    const [name, setName] = useState("");
    const [status, setStatus] = useState(""); // Default
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mode === "edit" && initialData) {
            setName(initialData.name || "");

            const normalizedStatus =
                initialData.status === 1 ||
                    initialData.status === "1" ||
                    initialData.status === "Active"
                    ? "1"
                    : "0";

            setStatus(normalizedStatus);
        }
    }, [mode, initialData]);

    const handleSave = async () => {
        if (!name.trim()) {
            Swal.fire("Validation", "Please enter a brand name.", "info");
            return;
        }

        setLoading(true);
        const isAdd = mode === 'add';

        // Use brand_id for the URL if editing
        const url = isAdd
            ? `${API_BASE}api/product_api/api/brands/create`
            : `${API_BASE}api/product_api/api/brands/update/${initialData.brand_id}`;

        try {
            const response = await apiFetch(url, {
                method: isAdd ? "POST" : "PUT",
                body: JSON.stringify({ name, status }), // Sending name and status to BE
                credentials: "include"
            });

            if (response.status) {
                Swal.fire({
                    icon: "success",
                    title: `Successfully ${isAdd ? 'Created' : 'Updated'}`,
                    timer: 1500,
                    showConfirmButton: false
                });
                onRefresh();
                onClose();
            } else {
                const errData = await response;
                throw new Error(errData.message || "Failed to save");
            }
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1050] bg-black/50 flex items-center justify-center p-4">
            <div className="w-full  max-w-lg rounded-[16px] bg-white shadow-xl border border-gray-200 overflow-visible">

                {/* Header */}
                <div className="flex items-center justify-between px-2 py-1">
                    <h5 className="text-[16px] text-[#454545] font-semibold">
                        {mode === "add" ? "Add New Brand" : "Edit Brand"}
                    </h5>

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
                        <label className="text-[12px] text-[#737373] font-semibold">Brand Name</label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            placeholder="Enter brand name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[12px] text-[#737373] font-semibold">Status</label>

                        <Select
                            value={status || undefined}
                            onValueChange={setStatus}
                            disabled={loading}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>

                            <SelectContent className="z-[1100] w-[470px] bg-white " position="popper" >
                                <SelectItem className="hover:bg-gray-100 border-gray-100" value="1">Active</SelectItem>
                                <SelectItem className="hover:bg-gray-100" value="0">Inactive</SelectItem>
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
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-black text-white"
                    >
                        {loading ? "Processing..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BrandModal;