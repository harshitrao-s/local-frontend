import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API_BASE, API_ENDPOINTS } from "../../Config/api";
import { apiFetch, getCookie } from "../../Utils/apiFetch";
import { Button } from "../../Components/Common/ui/button";
import { Input } from "../../Components/Common/ui/input";


const AttributeModal = ({ mode, initialData, onClose, onRefresh }) => {
    const [name, setName] = useState("");
    const [type, setType] = useState("TEXT");
    const [defaultValue, setDefaultValue] = useState("");
    const [optionList, setOptionList] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setName(initialData.attribute_name || "");
            setType(initialData.attribute_type || "TEXT");
            setDefaultValue(initialData.default_value || "");
            setOptionList(initialData.option_list || "");
        }
    }, [mode, initialData]);

    const handleSave = async () => {
        if (!name.trim()) {
            Swal.fire("Error", "Attribute name is required", "error");
            return;
        }
        if (type === "DROPDOWN" && !optionList.trim()) {
            Swal.fire("Error", "Option list is required for Dropdown type", "error");
            return;
        }

        setLoading(true);
        const url = mode === 'add'
            ? `${API_ENDPOINTS.CREATE_PRODUCT_ATTRIBUTE}`
            : `${API_ENDPOINTS.UPDATE_PRODUCT_ATTRIBUTE}${initialData.attribute_id}`;

        const payload = {
            attribute_name: name,
            attribute_type: type,
            default_value: defaultValue,
            option_list: type === "DROPDOWN" ? optionList : ""
        };

        try {
            const response = await apiFetch(url, {
                method: mode === 'add' ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include"
            });

            const data = await response;
            if (data.status) {
                Swal.fire({ icon: 'success', title: 'Saved!', timer: 1000, showConfirmButton: false });
                onRefresh();
                onClose();
            } else {
                Swal.fire("Error", data.message || "Failed to save", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Connection error", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        // <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
        //     <div className="modal-dialog modal-dialog-centered">
        //         <div className="modal-content border-0 shadow">
        //             <div className={`modal-header border-bottom ${mode === 'add' ? '' : ''}`}>
        //                 <h6 className="modal-title">{mode === 'add' ? 'Create Attribute' : 'Edit Attribute'}</h6>
        //                 <button type="button" className="btn-close btn-close" onClick={onClose}></button>
        //             </div>
        //             <div className="modal-body p-4">
        //                 <div className="mb-3">
        //                     <label className="form-label small fw-bold">Attribute Name</label>
        //                     <input className="form-control" value={name} onChange={(e)=>setName(e.target.value)} disabled={loading} />
        //                 </div>

        //                 <div className="mb-3">
        //                     <label className="form-label small fw-bold">Attribute Type</label>
        //                     <div className="d-flex gap-3">
        //                         <div className="form-check">
        //                             <input className="form-check-input" type="radio" name="attrType" id="typeText" 
        //                                    checked={type === "TEXT"} onChange={() => setType("TEXT")} />
        //                             <label className="form-check-label small" htmlFor="typeText">Text Input</label>
        //                         </div>
        //                         <div className="form-check">
        //                             <input className="form-check-input" type="radio" name="attrType" id="typeDrop" 
        //                                    checked={type === "DROPDOWN"} onChange={() => setType("DROPDOWN")} />
        //                             <label className="form-check-label small" htmlFor="typeDrop">Dropdown</label>
        //                         </div>
        //                     </div>
        //                 </div>

        //                 <div className="mb-3">
        //                     <label className="form-label small fw-bold">Default Value</label>
        //                     <input className="form-control" value={defaultValue} onChange={(e)=>setDefaultValue(e.target.value)} disabled={loading} />
        //                 </div>

        //                 {type === "DROPDOWN" && (
        //                     <div className="mb-3">
        //                         <label className="form-label small fw-bold text-danger">Option List (separated by ||)</label>
        //                         <textarea className="form-control" rows="2" value={optionList} 
        //                                   onChange={(e)=>setOptionList(e.target.value)} 
        //                                   placeholder="Red||Blue||Green" disabled={loading} />
        //                     </div>
        //                 )}
        //             </div>
        //             <div className="modal-footer border-0 bg-light">
        //                 <button className="btn btn-secondary px-4" onClick={onClose} disabled={loading}>Cancel</button>
        //                 <button className={`btn ${mode === 'add' ? 'btn-success' : 'btn-primary'} px-4`} 
        //                         onClick={handleSave} disabled={loading}>
        //                     {loading ? 'Saving...' : mode === 'add' ? 'Create' : 'Save'}
        //                 </button>
        //             </div>
        //         </div>
        //     </div>
        // </div>

        <div className="fixed inset-0 z-[1050] bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200 overflow-visible">

                {/* Header */}
                <div className="flex items-center justify-between px-2 py-1">
                    <h6 className="text-sm font-bold">
                        {mode === "add" ? "Create Attribute" : "Edit Attribute"}
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

                    {/* Attribute Name */}
                    <div className="space-y-2">
                        <label className="text-[12px] text-[#737373] font-semibold">
                            Attribute Name
                        </label>

                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* Attribute Type */}
                    <div className="space-y-2">
                        <label className="text-[12px] text-[#737373] font-semibold">
                            Attribute Type
                        </label>

                        <div className="text-[12px]  font-semibold flex gap-6">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="attrType"
                                    checked={type === "TEXT"}
                                    onChange={() => setType("TEXT")}
                                />
                                Text Input
                            </label>

                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="attrType"
                                    checked={type === "DROPDOWN"}
                                    onChange={() => setType("DROPDOWN")}
                                />
                                Dropdown
                            </label>
                        </div>
                    </div>

                    {/* Default Value */}
                    <div className="space-y-2">
                        <label className="text-[12px] text-[#737373] font-semibold">
                            Default Value
                        </label>

                        <Input
                            value={defaultValue}
                            onChange={(e) => setDefaultValue(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* Option List */}
                    {type === "DROPDOWN" && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-red-500">
                                Option List (separated by ||)
                            </label>

                            <textarea
                                rows={2}
                                value={optionList}
                                onChange={(e) => setOptionList(e.target.value)}
                                placeholder="Red||Blue||Green"
                                disabled={loading}
                                className="w-full rounded-[16px] border border-input px-4 py-2 text-sm outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
                            />
                        </div>
                    )}
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
                            ? "Saving..."
                            : mode === "add"
                                ? "Create"
                                : "Save"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AttributeModal;