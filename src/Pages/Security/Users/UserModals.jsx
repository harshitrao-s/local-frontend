import React, { useState, useEffect } from "react";
import Select from "react-select"; // Import react-select for modern role management
import Swal from "sweetalert2";
import { API_BASE } from "../../../Config/api";
import { apiFetch } from "../../../Utils/apiFetch";
import { Button } from "../../../Components/Common/ui/button";
import { Input } from "../../../Components/Common/ui/input";
import { FileSpreadsheetIcon, X } from "lucide-react";

const UserModals = ({ config, availableRoles, onClose, onRefresh }) => {
    const { type, data } = config;
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        roles: [], // Array of Role IDs
        status: 1,
        is_system: 0
    });

    // Transform availableRoles into the format required by react-select: { value, label }
    const roleOptions = availableRoles.map(role => ({
        value: role.id,
        label: role.name
    }));

    useEffect(() => {
        if (type === 'edit' && data) {
            setFormData({
                name: data.name || "",
                email: data.email || "",
                status: (data.status === "Active" || data.status === 1) ? 1 : 0,
                is_system: data.is_system ? 1 : 0,
                roles: data.role_ids || [] // IDs array from backend
            });
        } else {
            setFormData({ name: "", email: "", password: "", roles: [], status: 1, is_system: 0 });
        }
    }, [type, data]);

    const handleSave = async () => {
        if (!formData.name || !formData.email) {
            return Swal.fire("Validation", "Name and Email are required", "info");
        }

        setLoading(true);
        const url = type === 'add' ? `${API_BASE}api/users/create` : `${API_BASE}api/users/update/${data.id}`;

        try {
            const response = await apiFetch(url, {
                method: type === 'add' ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include"
            });

            if (response.status) {
                Swal.fire("Success", response.message || "User data saved", "success");
                onRefresh();
                onClose();
            } else {
                Swal.fire("Error", response.message || "Operation failed", "error");
            }
        } catch (e) {
            Swal.fire("Error", "Network Error", "error");
        } finally {
            setLoading(false);
        }
    };

    if (type === 'password') return <ResetPasswordModal data={data} onClose={onClose} />;

    return (
        // <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
        //     <div className="modal-dialog modal-lg modal-dialog-centered">
        //         <div className="modal-content border-0 shadow-lg ">
        //             <div className=" border-bottom p-3 d-flex justify-content-between align-items-center rounded-top-4">
        //                 <h6 className="mb-0 ">
        //                     <i className="fas fa-user-circle me-2"></i> 
        //                     {type === 'add' ? 'Add New User' : `Edit User: ${data?.name}`}
        //                 </h6>
        //                 <button className="btn-close btn-close shadow-none" onClick={onClose}></button>
        //             </div>

        //             <div className="modal-body p-4">
        //                 <div className="row g-4">
        //                     {/* Full Name */}
        //                     <div className="col-md-6">
        //                         <label className="form-label small fw-bold text-uppercase text-muted">Full Name</label>
        //                         <div className="input-group shadow-sm">
        //                             <span className="input-group-text bg-white border-end-0"><i className="fas fa-user text-muted"></i></span>
        //                             <input 
        //                                 type="text" className="form-control border-start-0 ps-0 shadow-none" 
        //                                 value={formData.name} 
        //                                 onChange={(e) => setFormData({...formData, name: e.target.value})} 
        //                             />
        //                         </div>
        //                     </div>

        //                     {/* Email Address */}
        //                     <div className="col-md-6">
        //                         <label className="form-label small fw-bold text-uppercase text-muted">Email Address</label>
        //                         <div className="input-group shadow-sm">
        //                             <span className="input-group-text bg-white border-end-0"><i className="fas fa-envelope text-muted"></i></span>
        //                             <input 
        //                                 type="email" className="form-control border-start-0 ps-0 shadow-none" 
        //                                 value={formData.email} 
        //                                 onChange={(e) => setFormData({...formData, email: e.target.value})} 
        //                             />
        //                         </div>
        //                     </div>

        //                     {/* Initial Password (Add Mode) */}
        //                     {type === 'add' && (
        //                         <div className="col-md-6">
        //                             <label className="form-label small fw-bold text-uppercase text-muted">Initial Password</label>
        //                             <div className="input-group shadow-sm">
        //                                 <span className="input-group-text bg-white border-end-0"><i className="fas fa-lock text-muted"></i></span>
        //                                 <input 
        //                                     type="password" className="form-control border-start-0 ps-0 shadow-none" 
        //                                     onChange={(e) => setFormData({...formData, password: e.target.value})} 
        //                                 />
        //                             </div>
        //                         </div>
        //                     )}

        //                     {/* MODERN SEARCHABLE ROLE SELECTION */}
        //                     <div className="col-md-6">
        //                         <label className="form-label small fw-bold text-uppercase text-muted">Assign Roles</label>
        //                         <Select
        //                             isMulti
        //                             options={roleOptions}
        //                             className="react-select-container"
        //                             classNamePrefix="react-select"
        //                             placeholder="Search and select roles..."
        //                             // Filter options to find the ones currently in formData.roles
        //                             value={roleOptions.filter(opt => formData.roles.includes(opt.value))}
        //                             onChange={(selected) => setFormData({
        //                                 ...formData, 
        //                                 roles: selected ? selected.map(opt => opt.value) : []
        //                             })}
        //                             styles={{
        //                                 control: (base) => ({ ...base, minHeight: '38px', borderRadius: '6px' })
        //                             }}
        //                         />
        //                     </div>
        //                 </div>

        //                 {/* Settings Section with Switches */}
        //                 <div className="mt-4 p-3 rounded-3 bg-light border border-dashed">
        //                     <div className="d-flex gap-5">
        //                         <div className="form-check form-switch">
        //                             <input 
        //                                 className="form-check-input cursor-pointer" type="checkbox" role="switch" id="activeSwitch" 
        //                                 checked={formData.status === 1} 
        //                                 onChange={(e) => setFormData({...formData, status: e.target.checked ? 1 : 0})} 
        //                             />
        //                             <label className="form-check-label fw-bold cursor-pointer" htmlFor="activeSwitch">Account Active</label>
        //                         </div>

        //                         <div className="form-check form-switch">
        //                             <input 
        //                                 className="form-check-input cursor-pointer" type="checkbox" role="switch" id="systemSwitch" 
        //                                 checked={formData.is_system === 1} 
        //                                 onChange={(e) => setFormData({...formData, is_system: e.target.checked ? 1 : 0})} 
        //                             />
        //                             <label className="form-check-label fw-bold cursor-pointer" htmlFor="systemSwitch">System Staff</label>
        //                         </div>
        //                     </div>
        //                 </div>
        //             </div>

        //             <div className="modal-footer bg-light border-0 rounded-bottom-4">
        //                 <button className="btn btn-outline-secondary fw-bold px-4" onClick={onClose} disabled={loading}>Cancel</button>
        //                 <button className="btn btn-primary px-4 shadow-sm" onClick={handleSave} disabled={loading}>
        //                     {loading ? <i className="fas fa-spinner fa-spin me-2"></i> : <i className="fas fa-save me-2"></i>}
        //                     {type === 'add' ? 'Create User' : 'Save Changes'}
        //                 </button>
        //             </div>
        //         </div>
        //     </div>
        // </div>

        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/60">
            <div className="w-full max-w-[550px] rounded-2xl bg-white">

                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2">
                    <h6 className="flex items-center text-base font-semibold">
                        {type === "add" ? "Add New User" : `Edit User: ${data?.name}`}
                    </h6>

                    <Button
                        onClick={onClose}
                        className="border-0 p-1 bg-transparent "
                    >
                        <X size={18} />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-3">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        {/* Full Name */}
                        <div>
                            <label className="">
                                Full Name
                            </label>
                            <Input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="">
                                Email Address
                            </label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />
                        </div>

                        {/* Password */}
                        {type === "add" && (
                            <div>
                                <label className="">
                                    Initial Password
                                </label>
                                <Input
                                    type="password"
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                />
                            </div>
                        )}

                        {/* Roles */}
                        <div>
                            <label className="">
                                Assign Roles
                            </label>

                            <Select
                                isMulti
                                options={roleOptions}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Search and select roles..."
                                value={roleOptions.filter((opt) =>
                                    formData.roles.includes(opt.value)
                                )}
                                onChange={(selected) =>
                                    setFormData({
                                        ...formData,
                                        roles: selected ? selected.map((opt) => opt.value) : [],
                                    })
                                }
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: "40px",
                                        borderRadius: "12px",
                                    }),
                                }}
                            />
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="mt-3 rounded-xl border border-dashed  p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:gap-8">

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={formData.status === 1}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            status: e.target.checked ? 1 : 0,
                                        })
                                    }
                                    className="h-4 w-4"
                                />
                                <label className="font-medium">Account Active</label>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={formData.is_system === 1}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            is_system: e.target.checked ? 1 : 0,
                                        })
                                    }
                                    className="h-4 w-4"
                                />
                                <label className="font-medium">System Staff</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-3 pb-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="px-3 text-white text-[14px] font-semibold h-10 w-full max-w-[120px] bg-[#FF141F] "
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-3 text-white text-[14px] font-semibold h-10 w-full max-w-[120px] bg-[#1a71f6]  "
                    >
                        {loading ? (
                            <i className="fas fa-spinner fa-spin mr-2" />
                        ) : (
                            <FileSpreadsheetIcon size={14} />
                        )}
                        {type === "add" ? "Create User" : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

/* -----------------------------------------------------------
   RESET PASSWORD MODAL COMPONENT (Defined in the same file)
----------------------------------------------------------- */
const ResetPasswordModal = ({ data, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [pass, setPass] = useState({ p1: "", p2: "" });

    const handleReset = async () => {
        if (!pass.p1 || pass.p1 !== pass.p2) return Swal.fire("Error", "Passwords must match", "warning");
        setLoading(true);
        try {
            const res = await apiFetch(`${API_BASE}api/users/reset-password/${data.id}`, {
                method: "POST",
                body: JSON.stringify({ password: pass.p1 })
            });
            if (res.status) {
                Swal.fire("Success", "Password Updated Successfully", "success");
                onClose();
            }
        } catch (e) {
            Swal.fire("Error", e.message || "Failed to update", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    <div className="border-bottom p-3 d-flex justify-content-between align-items-center rounded-top-4">
                        <h6 className="mb-0 "><i className="fas fa-key me-2"></i> Reset Password: {data?.name}</h6>
                        <button className="btn-close shadow-none" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">NEW PASSWORD</label>
                            <input type="password" underline="false" className="form-control shadow-none" onChange={(e) => setPass({ ...pass, p1: e.target.value })} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">CONFIRM PASSWORD</label>
                            <input type="password" underline="false" className="form-control shadow-none" onChange={(e) => setPass({ ...pass, p2: e.target.value })} />
                        </div>
                    </div>
                    <div className="modal-footer border-0 bg-light rounded-bottom-4">
                        <button className="btn btn-outline-secondary fw-bold  px-4" onClick={onClose}>Cancel</button>
                        <button className="btn btn-warning text-black px-4 fw-bold shadow-sm" onClick={handleReset} disabled={loading}>
                            {loading ? <i className="fas fa-spinner fa-spin me-2"></i> : <i className="fas fa-shield-alt me-2"></i>}
                            Update Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserModals;