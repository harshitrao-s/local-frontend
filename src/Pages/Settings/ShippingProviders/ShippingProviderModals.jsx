import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../../../Config/api";
import { getCookie, apiFetch } from "../../../Utils/apiFetch";
import { Button } from "../../../Components/Common/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Components/Common/ui/select";
import { Input } from "../../../Components/Common/ui/input";

const ShippingProviderModals = ({ config, onClose, onRefresh }) => {
    const { type, data } = config;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        carrier_name: "",
        carrier_code: "",
        class_code: "",
        tracking_url: ""
    });

    useEffect(() => {
        if ((type === 'edit' || type === 'status') && data) {
            setFormData({
                carrier_name: data.carrier_name || "",
                carrier_code: data.carrier_code || "",
                class_code: data.class_code || "",
                tracking_url: data.tracking_url || ""
            });
        }
    }, [type, data]);

    const handleSave = async () => {
        if (!formData.carrier_name || !formData.tracking_url) {
            return Swal.fire("Required", "Carrier name and Tracking URL are required.", "info");
        }

        setLoading(true);
        const url = type === 'add' ? `${API_BASE}api/shipping-providers/create` : `${API_BASE}api/shipping-providers/update/${data.carrier_id}`;

        try {
            const res = await apiFetch(url, {
                method: type === 'add' ? "POST" : "PUT",
                body: JSON.stringify(formData)
            });

            if (res.status) {
                Swal.fire("Success", res.message || "Carrier saved", "success");
                onRefresh();
                onClose();
            } else
                Swal.fire("Error", res.message || "Error in create", "error");
        } catch (e) {
            Swal.fire("Error", e.message || "Operation failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async () => {
        setLoading(true);
        try {
            const res = await apiFetch(`${API_BASE}api/shipping-providers/toggle-status/${data.carrier_id}`, { method: "POST" });
            if (res.status) {
                Swal.fire("Updated", res.message, "success");
                onRefresh();
                onClose();
            }
        } catch (e) {
            Swal.fire("Error", e.message, "error");
        } finally {
            setLoading(false);
        }
    };

    // --- Status Modal View ---
    if (type === 'status') {
        const isActive = data.status === 'Active' || data.status === 1;
        return (
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg p-3">
                        <div className="modal-header border-0 justify-content-center">
                            <h4 className="modal-title fw-bold text-dark">
                                {isActive ? 'Deactivate Carrier?' : 'Activate Carrier?'}
                            </h4>
                        </div>
                        <div className="modal-body text-center py-4">
                            <p className="text-muted h5">Are you sure you want to change the status of <strong>{data.name}</strong>?</p>
                        </div>
                        <div className="modal-footer border-0 justify-content-center gap-2">
                            <button className={`btn ${isActive ? 'btn-warning' : 'btn-success'} px-4 py-2`} onClick={handleStatusToggle} disabled={loading}>
                                {loading ? 'Processing...' : `Yes, ${isActive ? 'Deactivate' : 'Activate'}`}
                            </button>
                            <button className="btn btn-secondary px-4 py-2" onClick={onClose} disabled={loading}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Add/Edit Modal View ---
    return (
        <div className="fixed inset-0 z-[1050] bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-[500px] rounded-2xl bg-white overflow-visible">

                {/* Header */}
                <div className="flex items-center justify-between px-3 py-3">
                    <h5 className="flex items-center gap-2 text-[16px] font-semibold text-[#323130]">
                        {type === "add" ? "Add New Shipping Carrier" : "Edit Shipping Carrier"}
                    </h5>

                    <button
                        onClick={onClose}
                        className="rounded-md p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                    <div className="px-3 bg-white space-y-4">

                        {/* Carrier Name */}
                        <div className="grid grid-cols-12 items-center gap-4">
                            <label className="col-span-4 text-[14px] font-semibold text-[#323130]">
                                Carrier Name <span className="text-red-500">*</span>
                            </label>

                            <div className="col-span-8">
                                <Input
                                    type="text"
                                    placeholder="e.g. DHL Express"
                                    value={formData.carrier_name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            carrier_name: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        {/* Carrier Code */}
                        <div className="grid grid-cols-12 items-center gap-4">
                            <label className="col-span-4 text-[14px] font-semibold text-[#323130]">
                                Carrier Code
                            </label>

                            <div className="col-span-8">
                                <Input
                                    type="text"
                                    placeholder="e.g. DHL"
                                    value={formData.carrier_code}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            carrier_code: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        {/* Class Code */}
                        <div className="grid grid-cols-12 items-center gap-4">
                            <label className="col-span-4 text-[14px] font-semibold text-[#323130]">
                                Class Code <span className="text-red-500">*</span>
                            </label>

                            <div className="col-span-8">
                                <Select
                                    value={formData.class_code || undefined}
                                    onValueChange={(val) =>
                                        setFormData({
                                            ...formData,
                                            class_code: val,
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full rounded-[16px]">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>

                                    <SelectContent   className="z-[1100] w-full min-w-[300px] p-1 bg-white" position="popper">
                                        <SelectItem className="hover:bg-gray-100" value="Ground">Ground</SelectItem>
                                        <SelectItem className="hover:bg-gray-100" value="Standard">Standard</SelectItem>
                                        <SelectItem className="hover:bg-gray-100" value="Expedited">Expedited</SelectItem>
                                        <SelectItem className="hover:bg-gray-100" value="Priority">Priority</SelectItem>
                                        <SelectItem className="hover:bg-gray-100" value="Overnight">Overnight</SelectItem>
                                        <SelectItem className="hover:bg-gray-100" value="Freight Class">Freight Class</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Tracking URL */}
                        <div className="grid grid-cols-12 items-start gap-4">
                            <label className="col-span-4 text-[14px] font-semibold text-[#323130] flex">
                                Tracking URL Format <span className="text-red-500">*</span>
                            </label>

                            <div className="col-span-8 space-y-2">
                                <Input
                                    type="text"
                                    placeholder="https://tracking.link/{0}"
                                    value={formData.tracking_url}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            tracking_url: e.target.value,
                                        })
                                    }
                                />

                                <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                                    <i className="fas fa-lightbulb mr-2" />
                                    Use <strong>{"{0}"}</strong> as a placeholder for the tracking number.
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 py-2 px-3">
                        <Button
                            onClick={onClose}
                            disabled={loading}
                            className="bg-[#FF141F]  text-white hover:bg-[#e3121b]"
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-[#1A71F6]  text-white hover:bg-[#155fd1]"
                        >
                            {loading ? "Processing..." : type === "add" ? "Save" : "Update"}
                        </Button>
                    </div>
            </div>
        </div>
    );
};

export default ShippingProviderModals;