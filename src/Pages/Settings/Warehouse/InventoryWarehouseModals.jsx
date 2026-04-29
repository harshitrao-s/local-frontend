import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../../../Config/api";
import { apiFetch } from "../../../Utils/apiFetch";
import { Button } from "../../../Components/Common/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Components/Common/ui/select";
import { Input } from "../../../Components/Common/ui/input";

const InventoryWarehouseModals = ({ config, onClose, warehouseLocations, onRefresh }) => {
    const { type, data } = config;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        warehouse_name: "",
        location: "",
        status: 1,
        is_default: 0
    });

    useEffect(() => {
        if (type === 'edit' && data) {
            setFormData({
                warehouse_id: data.warehouse_id,
                warehouse_name: data.warehouse_name,
                location: data.location,
                status: data.status,
                is_default: data.is_default
            });
        }
    }, [type, data]);

    const handleSave = async () => {
        if (!formData.warehouse_name || !formData.location) {
            return Swal.fire("Required", "Inventory Name and Location are required.", "info");
        }

        setLoading(true);
        const url = type === 'add'
            ? `${API_BASE}api/inventory-locations/create`
            : `${API_BASE}api/inventory-locations/update/${data.warehouse_id}`;

        try {
            const res = await apiFetch(url, {
                method: type === 'add' ? "POST" : "PUT",
                body: JSON.stringify(formData)
            });

            if (res.status) {
                Swal.fire("Success", res.message || "Inventory saved", "success");
                onRefresh();
                onClose();
            } else {
                Swal.fire("Error", res.message || "Error saving Inventory", "error");
            }
        } catch (e) {
            Swal.fire("Error", e.message || "Operation failed", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1050] bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-[450px] rounded-2xl bg-white  overflow-visible">

                {/* Header */}
                <div className="flex items-center justify-between px-2 py-2">
                    <h5 className="text-[16px] text-[#323130] font-semibold">
                        {type === "add" ? "Add New Inventory" : "Edit Warehouse"}
                    </h5>

                    <button
                        onClick={onClose}
                        className="rounded-md p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-3 space-y-4">

                    {/* Warehouse Name */}
                    <div className="space-y-2">
                        <label className="text-[14px] font-semibold text-[#323130]">
                            Warehouse Name
                        </label>

                        <Input
                            type="text"
                            placeholder="Warehouse name"
                            value={formData.warehouse_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    warehouse_name: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <label className="text-[14px] font-semibold text-[#323130]">
                            Location
                        </label>

                        <Select
                            value={formData.location?.toString() || undefined}
                            onValueChange={(val) =>
                                setFormData({
                                    ...formData,
                                    location: val,
                                })
                            }
                        >
                            <SelectTrigger className="w-full rounded-[16px]">
                                <SelectValue placeholder="Select Location" />
                            </SelectTrigger>

                            <SelectContent className="z-[1100] w-full min-w-[420px] bg-white p-1"  position="popper">
                                {warehouseLocations?.map((d) => (
                                    <SelectItem className="hover:bg-gray-100 p-1" key={d.id} value={String(d.id)}>
                                        {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Radio Groups */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Active Status */}
                        <div className="space-y-2">
                            <label className="text-[14px] font-semibold text-[#323130]">
                                Active Status
                            </label>

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-[12px] font-semibold text-[#323130]">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={formData.status === 1}
                                        onChange={() =>
                                            setFormData({
                                                ...formData,
                                                status: 1,
                                            })
                                        }
                                    />
                                    Enabled
                                </label>

                                <label className="flex items-center gap-2 text-[12px] font-semibold text-[#323130]">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={formData.status === 0}
                                        onChange={() =>
                                            setFormData({
                                                ...formData,
                                                status: 0,
                                            })
                                        }
                                    />
                                    Disabled
                                </label>
                            </div>
                        </div>

                        {/* Is Primary */}
                        <div className="space-y-2">
                            <label className="text-[14px] font-semibold text-[#323130]">
                                Is Primary
                            </label>

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-[12px] font-semibold text-[#323130]">
                                    <input
                                        type="radio"
                                        name="is_default"
                                        checked={formData.is_default === 1}
                                        onChange={() =>
                                            setFormData({
                                                ...formData,
                                                is_default: 1,
                                            })
                                        }
                                    />
                                    Enabled
                                </label>

                                <label className="flex items-center gap-2 text-[12px] font-semibold text-[#323130]">
                                    <input
                                        type="radio"
                                        name="is_default"
                                        checked={formData.is_default === 0}
                                        onChange={() =>
                                            setFormData({
                                                ...formData,
                                                is_default: 0,
                                            })
                                        }
                                    />
                                    Disabled
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-3 py-2">
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-[#1A71F6]  text-white"
                    >
                        {loading
                            ? "Processing..."
                            : type === "add"
                                ? "Create"
                                : "Save"}
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                        className="bg-[#FF141F]  text-white"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InventoryWarehouseModals;