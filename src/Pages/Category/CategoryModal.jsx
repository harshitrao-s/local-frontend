import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../../Config/api";
import { apiFetch, getCookie } from "../../Utils/apiFetch";
import { Button } from "../../Components/Common/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/Common/ui/select";
import { Input } from "../../Components/Common/ui/input";

const CategoryModal = ({ mode, initialData, main_categories, onClose, onRefresh }) => {
    const [name, setName] = useState("");
    const [isSubcategory, setIsSubcategory] = useState(false);
    const [parentId, setParentId] = useState("");
    const [status, setStatus] = useState("1");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setName(initialData.name || "");

            // FIX: If is_primary is 1 (True), isSubcategory should be false.
            // If is_primary is 0 (False), isSubcategory should be true.
            const subCheck = initialData.is_primary === 1 ? false : true;
            setIsSubcategory(subCheck);

            setParentId(initialData.parent_id ? String(initialData.parent_id) : "");

            // Normalize status to string "1" or "0" for the select element
            const statusVal = (initialData.status === 1 || initialData.status === "1") ? "1" : "0";
            setStatus(statusVal);
        } else {
            // Reset for Add mode
            setName("");
            setIsSubcategory(false);
            setParentId("");
            setStatus("1");
        }
    }, [mode, initialData]);

    const handleSave = async () => {
        if (!name.trim()) {
            Swal.fire("Validation", "Please enter a category name.", "info");
            return;
        }

        if (isSubcategory && !parentId) {
            Swal.fire("Validation", "Please select a parent category.", "info");
            return;
        }

        setLoading(true);

        const baseUrl = `${API_BASE}api/product_api/product_categories`;
        // Use category_id or id based on your backend response
        const id = initialData?.category_id;
        const url = mode === 'add' ? `${baseUrl}/create` : `${baseUrl}/update/${id}`;

        const payload = {
            name: name,
            status: parseInt(status), // Send as Integer
            is_primary: isSubcategory ? 0 : 1, // 1 for Primary, 0 for Sub
            parent_id: isSubcategory ? parentId : null
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

            if (resData.status) {
                Swal.fire({
                    icon: 'success',
                    title: `Category ${mode === 'add' ? 'Created' : 'Updated'}`,
                    timer: 1500,
                    showConfirmButton: false
                });
                onRefresh();
                onClose();
            } else {
                throw new Error(resData.message || "Operation failed");
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
                <div className="flex items-center justify-between  px-2 py-1">
                    <h6 className="text-sm font-bold">
                        {mode === "edit" ? "Edit Category" : "Add New Category"}
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
                    {/* Category Name */}
                    <div className="space-y-2">
                        <label className="text-[12px] text-[#737373] font-semibold">
                            Category Name
                        </label>

                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            placeholder="Enter category name..."
                        />
                    </div>

                    {/* Subcategory Toggle */}
                    <div className="rounded-lg border bg-gray-50 p-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="subCheck"
                                checked={isSubcategory}
                                onChange={(e) => setIsSubcategory(e.target.checked)}
                                disabled={loading}
                                className="h-4 w-4 rounded border-gray-300"
                            />

                            <label
                                htmlFor="subCheck"
                                className="text-[12px] text-[#737373] font-semibold"
                            >
                                Define as Subcategory
                            </label>
                        </div>
                    </div>

                    {/* Parent Category */}
                    {isSubcategory && (
                        <div className="space-y-2">
                            <label className="text-[12px] text-[#737373] font-semibold">
                                Parent Category
                            </label>

                            <Select
                                value={parentId || undefined}
                                onValueChange={setParentId}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Parent" />
                                </SelectTrigger>

                                <SelectContent className="z-[1100] w-[470px] bg-white p-1" position="popper" >

                                    {main_categories?.map((d) => (
                                        <SelectItem className="hover:bg-gray-100"s key={d.id} value={String(d.id)}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-[12px] text-[#737373] semibold">
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

                            <SelectContent className="z-[1100] w-[470px] bg-white" position="popper" >
                                <SelectItem className="hover:bg-gray-100" value="1">Active</SelectItem>
                                <SelectItem className="hover:bg-gray-100" value="0">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-3 py-2">
                    <Button
                        variant="ghost"
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
                        {loading ? "Processing..." : mode === "add" ? "Create Category" : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;