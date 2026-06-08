import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Row, Col, Button, Tabs, Tab, FormGroup, Table } from 'react-bootstrap';
import { toast } from "react-hot-toast";
import { apiFetch } from "../../Utils/apiFetch";
import { API_BASE } from "../../Config/api";
import useMasterData from "../../Context/MasterDataProvider";
import Swal from "sweetalert2";
import SearchableSelect from "../../Components/Common/SearchableSelect";
import { formatToISODate } from "../../Utils/utilFunctions";
import DateInput from "../../Components/Common/DateInput";
import ABNInput from "../../Components/Common/ABNInput";
import ACNInput from "../../Components/Common/ACNInput";
import { AddressForm } from "./AddressForm";
import VendorPOList from "../../Components/VendorPOList";
import VendorPaymentForm from "./Edit/tabs/VendorPaymentForm";
import CmnHeader from "../../Components/Common/CmnHeader";
import { FileSpreadsheetIcon, Undo2, UserPlus } from "lucide-react";
import VendorPortalCredentials from "./PortalLogin";

// ─── Flush Registry Context ──────────────────────────────────────
const FlushRegistryContext = createContext(null);

const useFlushRegistry = () => {
    const registryRef = useRef(new Set());

    const register = useCallback((flushFn) => {
        registryRef.current.add(flushFn);
        return () => registryRef.current.delete(flushFn);
    }, []);

    const flushAll = useCallback(() => {
        registryRef.current.forEach(fn => fn());
    }, []);

    return { register, flushAll };
};

// ─── Optimized uncontrolled text input ───────────────────────────
const DeferredInput = React.memo(({ value, name, onChange, onValidate, helpText, component: Component = Form.Control, ...rest }) => {
    const [localValue, setLocalValue] = useState(value ?? "");
    const [isFocused, setIsFocused] = useState(false);
    const prevValueRef = useRef(value);
    const localValueRef = useRef(localValue);
    const registry = useContext(FlushRegistryContext);

    useEffect(() => { localValueRef.current = localValue; }, [localValue]);

    useEffect(() => {
        if (value !== prevValueRef.current) {
            setLocalValue(value ?? "");
            localValueRef.current = value ?? "";
            prevValueRef.current = value;
        }
    }, [value]);

    const flush = useCallback(() => {
        const current = localValueRef.current;
        if (current !== value) {
            onChange({ target: { name, value: current, type: "text" } });
        }
    }, [value, name, onChange]);

    useEffect(() => {
        if (registry) return registry(flush);
    }, [registry, flush]);

    const handleLocalChange = useCallback((e) => {
        const val = e.target.value;
        if (onValidate && !onValidate(val)) return;
        setLocalValue(val);
        localValueRef.current = val;
    }, [onValidate]);

    const handleBlur = useCallback(() => {
        flush();
        setIsFocused(false);
    }, [flush]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') flush();
    }, [flush]);

    return (
        <>
            <Component
                {...rest}
                name={name}
                value={localValue}
                onChange={handleLocalChange}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
            {helpText && isFocused && (
                <Form.Text className="text-muted">{helpText}</Form.Text>
            )}
        </>
    );
});
DeferredInput.displayName = "DeferredInput";

// ─── Optimized uncontrolled number input ─────────────────────────
const DeferredNumberInput = React.memo(({ value, name, onChange, min, max, step, onValidate, helpText, ...rest }) => {
    const [localValue, setLocalValue] = useState(value ?? "");
    const [isFocused, setIsFocused] = useState(false);
    const prevValueRef = useRef(value);
    const localValueRef = useRef(localValue);
    const registry = useContext(FlushRegistryContext);

    useEffect(() => { localValueRef.current = localValue; }, [localValue]);

    useEffect(() => {
        if (value !== prevValueRef.current) {
            setLocalValue(value ?? "");
            localValueRef.current = value ?? "";
            prevValueRef.current = value;
        }
    }, [value]);

    const flush = useCallback(() => {
        const current = localValueRef.current;
        if (current !== value) {
            onChange({ target: { name, value: current, type: "number" } });
        }
    }, [value, name, onChange]);

    useEffect(() => {
        if (registry) return registry(flush);
    }, [registry, flush]);

    const handleLocalChange = useCallback((e) => {
        const val = e.target.value;
        if (onValidate && !onValidate(val)) return;
        setLocalValue(val);
        localValueRef.current = val;
    }, [onValidate]);

    const handleBlur = useCallback(() => {
        flush();
        setIsFocused(false);
    }, [flush]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') flush();
    }, [flush]);

    return (
        <>
            <Form.Control
                {...rest}
                type="number"
                name={name}
                value={localValue}
                min={min}
                max={max}
                step={step}
                onChange={handleLocalChange}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
            {helpText && isFocused && (
                <Form.Text className="text-muted">{helpText}</Form.Text>
            )}
        </>
    );
});

DeferredNumberInput.displayName = "DeferredNumberInput";

// ─── Optimized textarea ──────────────────────────────────────────
const DeferredTextarea = React.memo(({ value, name, onChange, maxLength, rows, ...rest }) => {
    const [localValue, setLocalValue] = useState(value ?? "");
    const [isFocused, setIsFocused] = useState(false);
    const prevValueRef = useRef(value);
    const localValueRef = useRef(localValue);
    const registry = useContext(FlushRegistryContext);

    useEffect(() => { localValueRef.current = localValue; }, [localValue]);

    useEffect(() => {
        if (value !== prevValueRef.current) {
            setLocalValue(value ?? "");
            localValueRef.current = value ?? "";
            prevValueRef.current = value;
        }
    }, [value]);

    const flush = useCallback(() => {
        const current = localValueRef.current;
        if (current !== value) {
            onChange({ target: { name, value: current, type: "text" } });
        }
    }, [value, name, onChange]);

    useEffect(() => {
        if (registry) return registry(flush);
    }, [registry, flush]);

    const handleBlur = useCallback(() => {
        flush();
        setIsFocused(false);
    }, [flush]);

    return (
        <>
            <Form.Control
                {...rest}
                as="textarea"
                name={name}
                rows={rows}
                maxLength={maxLength}
                value={localValue}
                onChange={(e) => {
                    setLocalValue(e.target.value);
                    localValueRef.current = e.target.value;
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
            />
            {maxLength && isFocused && (
                <Form.Text className="text-muted">{localValue.length}/{maxLength}</Form.Text>
            )}
        </>
    );
});

DeferredTextarea.displayName = "DeferredTextarea";


const AddNewVendor = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("primary");
    const { paymentTerms, warehouses, countries } = useMasterData();
    const [activePaymentView, setActivePaymentView] = useState("bank_transfer");
    const { register, flushAll } = useFlushRegistry();
    const [isUploading, setIsUploading] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [formData, setFormData] = useState({
        vendor_code: "",
        vendor_name: "",
        vendor_company_name: "",
        trading_name: "",
        display_name: "",
        vendor_type: "",
        communication_channel: "",
        parent_company_name: "",
        industry: "",
        currency: "",
        min_order_value: "",
        vendor_account_number: "",
        status: "",
        is_taxable: false,
        tax_percent: "",
        company_abn: "",
        company_acn: "",
        company_website: "",
        company_locality: "",

        payment_term: "",
        mode_of_payment: ["bank_transfer"],
        paypal_notes: "",
        wallet_notes: "",
        credit_card_notes: "",
        bank_name: "",
        bank_account_holder_name: "",
        bank_ifsc: "",
        bank_country: "",
        bank_account_number: "",
        bank_account_number_confirm: "",
        first_contact_date: "",
        first_contact_via: "",
        onboard_date: "",
        onboard_by: "",
        account_manager: "",
        onboard_comments: "",
        medium_of_contact: "",
    });

    const formDataRef = useRef(formData);
    useEffect(() => { formDataRef.current = formData; }, [formData]);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === "is_taxable" && checked ? { tax_percent: "0" } : {})
        }));
    }, []);

    const validateVendorCode = useCallback((val) => /^[a-zA-Z0-9_-]*$/.test(val), []);
    const validateAlphanumeric = useCallback((val) => /^[a-zA-Z0-9]*$/.test(val), []);
    const validateMinOrder = useCallback((val) => {
        return val === "" || (/^\d*\.?\d{0,2}$/.test(val) && Number(val) <= 10000000);
    }, []);

    const validateRequiredFields = useCallback((data) => {
        const fd = data || formDataRef.current;
        const missing = [];

        if (!fd.vendor_code?.trim()) missing.push("Vendor Code");
        if (!fd.vendor_company_name?.trim()) missing.push("Vendor Company Name");
        if (!fd.vendor_name?.trim()) missing.push("Vendor Display Name");

        const paymentMethods = Array.isArray(fd.mode_of_payment)
            ? fd.mode_of_payment
            : (fd.mode_of_payment || "").split(",").filter(Boolean);

        const hasBankTransfer = paymentMethods.some(
            m => m.toLowerCase().includes("bank") || m.toLowerCase() === "bank_transfer" || m.toLowerCase() === "bank transfer"
        );

        if (hasBankTransfer) {
            if (!fd.bank_name?.trim()) missing.push("Bank Name");
            if (!fd.bank_account_holder_name?.trim()) missing.push("Bank Account Holder Name");
            if (!fd.bank_ifsc?.trim()) missing.push("BSB / IFSC / SWIFT Code");
            if (!fd.bank_account_number?.trim()) missing.push("Bank Account Number");
            if (!fd.bank_account_number_confirm?.trim()) missing.push("Re-enter Account Number");
            if (
                fd.bank_account_number?.trim() &&
                fd.bank_account_number_confirm?.trim() &&
                fd.bank_account_number.trim() !== fd.bank_account_number_confirm.trim()
            ) {
                missing.push("Bank Account Number mismatch");
            }
        }

        return missing;
    }, []);

    const flushAndRun = useCallback((callback) => {
        flushAll();
        requestAnimationFrame(() => {
            setTimeout(() => {
                callback(formDataRef.current);
            }, 0);
        });
    }, [flushAll]);

    const showValidationError = useCallback((missing) => {
        Swal.fire({
            icon: 'error',
            title: 'Required Fields Missing',
            html: `<p class="mb-2" style="color: #555;">Please fill in the following required fields:</p>
                   <div class="text-start" style="font-size: 14px; padding: 0 20px;">
                       ${missing.map(f => `<div style="color: #dc3545; font-weight: 600; padding: 4px 0; border-bottom: 1px solid #f0f0f0;">✗ &nbsp;${f}</div>`).join("")}
                   </div>`,
        });
    }, []);

    // ✅ FIX: Removed console.log + return (debug code) — API call now actually runs
    const performSave = useCallback(async (fd, targetTab) => {
        setSaving(true);
        try {
            const res = await apiFetch(`${API_BASE}api/vendor/api/addvendor/`, {
                method: "POST",
                body: JSON.stringify({
                    ...fd,
                    mode_of_payment: Array.isArray(fd.mode_of_payment)
                        ? fd.mode_of_payment.join(",")
                        : fd.mode_of_payment,
                    tax_percent: fd.is_taxable ? parseFloat(fd.tax_percent || 0) : 0,
                    first_contact_date: formatToISODate(fd.first_contact_date),
                    onboard_date: formatToISODate(fd.onboard_date),
                }),
            });

            if (res.status && res.vendor_id) {

                for (const doc of documents) {
                    const uploadForm = new FormData();

                    uploadForm.append("file", doc.file);
                    uploadForm.append("vendor_id", res.vendor_id);

                    const uploadRes = await apiFetch(
                        `${API_BASE}api/vendor/api/upload-document/`,
                        {
                            method: "POST",
                            body: uploadForm,
                            isFormData: true
                        }
                    );

                    console.log("uploadRes", uploadRes);
                }

                toast.success("Vendor registered successfully!");

                navigate(`/vendor/editvendor/${res.vendor_id}`);
            }
        } catch (err) {
            toast.error(err?.message || "Registration failed");
        } finally {
            setSaving(false);
        }
    }, [navigate]);

    const handleTabSelect = useCallback((key) => {
        setActiveTab(key);
    }, []);

    const handleCreate = useCallback(async (e) => {
        if (e) e.preventDefault();

        flushAndRun((latestData) => {
            const missing = validateRequiredFields(latestData);
            if (missing.length > 0) {
                showValidationError(missing);
                return;
            }
            performSave(latestData, null);
        });
    }, [flushAndRun, validateRequiredFields, showValidationError, performSave]);

    const handleDeleteFile = async (fileId, index) => {

        // Local file (vendor save hone se pehle)
        if (!fileId) {
            setDocuments(prev => prev.filter((_, i) => i !== index));
            toast.success("Document removed");
            return;
        }

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete it!"
        });

        if (!result.isConfirmed) return;

        try {
            const res = await apiFetch(
                `${API_BASE}api/vendor/api/delete-document/${fileId}/`,
                {
                    method: "DELETE"
                }
            );

            if (res.status) {
                setDocuments(prev =>
                    prev.filter(doc => doc.id !== fileId)
                );

                toast.success("Document deleted successfully");
            } else {
                toast.error(res.message || "Failed to delete document");
            }
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setDocuments(prev => [
            ...prev,
            {
                file,
                file_name: file.name,
                file_size: `${(file.size / 1024).toFixed(2)} KB`,
                created_at: new Date().toISOString(),
                created_by: "Current User"
            }
        ]);

        e.target.value = "";
    };

    return (
        <FlushRegistryContext.Provider value={register}>
            <div className="mt-0">
                <CmnHeader
                    title={"Vendor Registration"}
                    IconLucide={UserPlus}
                    actionVariant="ghost" actionName="Listing"
                    actionLink="/vendor/vendors"
                    actions={[
                        { icon: <FileSpreadsheetIcon size={16} />, name: "Create", onClick: () => document.getElementById("vendor-form")?.requestSubmit(), variant: "primary", },
                        { icon: <Undo2 size={16} />, name: "Cancel", onClick: () => navigate(-1), variant: "danger", }
                    ]}
                />

                <div className="bg-white  mt-4 h-100 rounded-3">
                    <Form id="vendor-form" onSubmit={handleCreate}>
                        <Tabs activeKey={activeTab} onSelect={handleTabSelect} className=" custom-tabs  mb-4 mt-2">

                            {/* Onboard Details Tab */}
                            <Tab eventKey="onboard_details" title="Onboard Details">
                                <Row className="py-3 px-3">
                                    <Col md="4" className="px-3 float-start">
                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">First Contact Date</Form.Label>
                                            <DateInput
                                                value={formData.first_contact_date || null}
                                                onChange={date =>
                                                    setFormData(prev => ({ ...prev, first_contact_date: date }))
                                                }
                                            />

                                        </FormGroup>
                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold" >First Contact Via</Form.Label>
                                            <Form.Select name="first_contact_via" value={formData.first_contact_via} onChange={handleChange}>
                                                <option value="" disabled hidden>Select communication channel</option>
                                                <option value="email">Email</option>
                                                <option value="phone">Phone</option>
                                                <option value="web_form">Trade Show</option>
                                                <option value="web_form">Referral</option>
                                                <option value="web_form">Cold Outreach</option>
                                                <option value="web_form">Website</option>
                                                <option value="web_form">Other</option>
                                            </Form.Select>
                                        </FormGroup>

                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">Assigned Account Manager</Form.Label>
                                            <DeferredInput
                                                name="account_manager" maxLength={50}
                                                value={formData.account_manager} onChange={handleChange}
                                                placeholder="Enter account manager name"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" className="px-3 float-start">
                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">Onboard Date</Form.Label>
                                            <DateInput
                                                value={formData.onboard_date || null}
                                                onChange={date =>
                                                    setFormData(prev => ({ ...prev, onboard_date: date }))
                                                }
                                            />

                                        </FormGroup>
                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">Onboard By</Form.Label>
                                            <DeferredInput
                                                name="onboard_by" maxLength={50}
                                                value={formData.onboard_by} onChange={handleChange}
                                                placeholder="Enter Staff Name"
                                            />
                                        </FormGroup>

                                    </Col>
                                    <Col md="4" className="px-3 float-start">
                                        {/* ✅ FIX: name → medium_of_contact (was mode_of_contact) */}
                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">How We Found</Form.Label>
                                            <Form.Select name="medium_of_contact" value={formData.medium_of_contact} onChange={handleChange}>
                                                <option value="" disabled hidden>Select lead source</option>
                                                <option value="google">Google Search</option>
                                                <option value="trade_show">Referral</option>
                                                <option value="trade_show">Trade Show</option>
                                                <option value="trade_show">LinkedIn</option>
                                                <option value="trade_show">Industry Directory</option>
                                                <option value="trade_show">Cold Outreach</option>
                                                <option value="network">Other</option>
                                            </Form.Select>
                                        </FormGroup>
                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">Internal Remarks</Form.Label>
                                            <DeferredTextarea
                                                name="onboard_comments" rows={4} maxLength={500}
                                                value={formData.onboard_comments} onChange={handleChange}
                                                placeholder="Special terms, flags, notes"
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Tab>

                            {/* Primary Details Tab */}
                            <Tab eventKey="primary" title="PRIMARY DETAILS">
                                <div className="py-3 px-3">
                                    <Row className="mb-3">
                                        <Col md={4} className="px-3">
                                            <FormGroup className="mb-3">
                                                <Form.Label className="small fw-bold">Vendor ID <span className="text-danger">*</span></Form.Label>
                                                <DeferredInput
                                                    name="vendor_code" placeholder="VEND001" maxLength={20}
                                                    value={formData.vendor_code} onChange={handleChange}
                                                    onValidate={validateVendorCode}
                                                    helpText="Max 20 characters. Letters, numbers, hyphens, underscores only."
                                                    required
                                                />
                                            </FormGroup>

                                            <FormGroup className="mb-3">
                                                <Form.Label className="small fw-bold">Legal Company Name <span className="text-danger">*</span></Form.Label>
                                                <DeferredInput
                                                    name="vendor_company_name" maxLength={255} placeholder="Full legal registered name"
                                                    value={formData.vendor_company_name} onChange={handleChange} required
                                                />
                                            </FormGroup>

                                            <FormGroup className="mb-3">
                                                <Form.Label className="small fw-bold">Trading Name <span className="text-danger">*</span></Form.Label>
                                                <DeferredInput
                                                    name="trading_name" maxLength={255} placeholder="Business trading name"
                                                    value={formData.trading_name} onChange={handleChange}
                                                />
                                            </FormGroup>
                                            <FormGroup className="mb-3">
                                                <Form.Label className="small fw-bold">Display Name <span className="text-danger">*</span></Form.Label>
                                                <DeferredInput
                                                    name="display_name" maxLength={120} placeholder="Display name"
                                                    value={formData.display_name} onChange={handleChange} required
                                                />
                                            </FormGroup>
                                            <FormGroup className="mb-3">
                                                <Form.Label className="small fw-bold">Vendor Type</Form.Label>
                                                <Form.Select name="vendor_type" value={formData.vendor_type} required onChange={handleChange}>
                                                    <option value="" disabled hidden >Type of vendor</option>
                                                    {[{ id: "Distributor", name: "Distributor" }, { id: "Manufacturer", name: "Manufacturer" }, { id: "Importer", name: "Importer" }, { id: "Local Supplier", name: "Local Supplier" }, { id: "Service Provider", name: "Service Provider" }].map(pt => (
                                                        <option key={pt.id} value={pt.id}>{pt.name}</option>
                                                    ))}
                                                </Form.Select>
                                            </FormGroup>

                                            <FormGroup className="mb-3">
                                                <Form.Label className="small fw-bold">Preferred Communication</Form.Label>
                                                <Form.Select name="communication_channel" value={formData.communication_channel} required onChange={handleChange}>
                                                    <option value="" disabled hidden >Industry sector</option>
                                                    {[{ id: "Email", name: "Email" }, { id: "Phone", name: "Phone" }, { id: "Portal", name: "Portal" }, { id: "EDI", name: "EDI" }, { id: "API", name: "API" }].map(pt => (
                                                        <option key={pt.id} value={pt.id}>{pt.name}</option>
                                                    ))}
                                                </Form.Select>
                                            </FormGroup>
                                        </Col>

                                        <Col md={4} className="px-3">
                                            <FormGroup className="mb-3">
                                                <Form.Label className="small fw-bold">Currency</Form.Label>
                                                <SearchableSelect
                                                    name="currency" options={countries} value={formData.currency}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                                                    labelKey="currency" valueKey="currency" required unique={true} placeholder="Select transaction currency"
                                                    renderLabel={(v) => (
                                                        <div className="w-100">
                                                            <span className="fw-bold">{v.currency}</span>
                                                            {v.name && <span className="ms-2 text-muted small">- {v.name}</span>}
                                                        </div>
                                                    )}
                                                />
                                            </FormGroup>
                                            <FormGroup className="mb-3">
                                                <Form.Label className="small fw-bold">Minimum Order Value</Form.Label>
                                                <DeferredNumberInput
                                                    name="min_order_value" placeholder="$0.00"
                                                    value={formData.min_order_value} min="0" max="10000000" step="0.01"
                                                    onChange={handleChange} onValidate={validateMinOrder} helpText="Max: 10,000,000"
                                                />
                                            </FormGroup>
                                            <FormGroup className="mb-3">
                                                <Form.Label className="small fw-bold">Vendor Account No.</Form.Label>
                                                <DeferredInput
                                                    name="vendor_account_number" placeholder="Account number from vendor" maxLength={50}
                                                    value={formData.vendor_account_number} onChange={handleChange}
                                                    onValidate={validateAlphanumeric} required
                                                    helpText="Letters and numbers only. Max 50 characters."
                                                />
                                            </FormGroup>
                                            <FormGroup className="mb-3">
                                                <Form.Label className="small fw-bold">Parent Company <span className="text-danger">*</span></Form.Label>
                                                <DeferredInput
                                                    name="parent_company_name" maxLength={255} placeholder="Ultimate parent entity"
                                                    value={formData.parent_company_name} onChange={handleChange}
                                                />
                                            </FormGroup>

                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                <FormGroup className="mb-0">
                                                    <Form.Label className="small fw-bold">Vendor Status</Form.Label>
                                                    <Form.Select name="status" value={formData.status} onChange={handleChange} required>
                                                        <option value="" disabled hidden>Current operational status</option>
                                                        {[{ id: 0, name: "Active" }, { id: 1, name: "Inactive" }, { id: 2, name: "Pending" }, { id: 3, name: "InProcess" }, { id: 4, name: "Reject" }, { id: 5, name: "On Hold" }].map(pt => (
                                                            <option key={pt.id} value={pt.id}>{pt.name}</option>
                                                        ))}
                                                    </Form.Select>
                                                </FormGroup>

                                                <div className="d-flex align-items-center justify-content-around" style={{ minWidth: "68px", minHeight: "64px" }}>
                                                    <Form.Label className="small fw-bold me-2 mb-0" style={{ marginTop: "22px" }}>Taxable</Form.Label>
                                                    <Form.Check
                                                        type="switch" id="tax-free-switch" name="is_taxable" required

                                                        className="fw-bold fs-7 " checked={formData.is_taxable} onChange={handleChange}
                                                    />
                                                </div>

                                                {formData.is_taxable ? (
                                                    <div>
                                                        <Form.Label className="small fw-bold mb-1">Tax %</Form.Label>
                                                        <Form.Control
                                                            type="number" name="tax_percent" placeholder="0" size="sm"
                                                            value={formData.tax_percent} min="0" max="100" step="0.01"
                                                            style={{ width: "80px" }}

                                                            onChange={(e) => {
                                                                let val = e.target.value;
                                                                if (val === "") { setFormData(prev => ({ ...prev, tax_percent: "" })); return; }
                                                                const numericVal = parseFloat(val);
                                                                if (isNaN(numericVal)) return;
                                                                if (numericVal < 0) setFormData(prev => ({ ...prev, tax_percent: 0 }));
                                                                else if (numericVal > 100) setFormData(prev => ({ ...prev, tax_percent: 100 }));
                                                                else setFormData(prev => ({ ...prev, tax_percent: numericVal }));
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div style={{ width: "80px" }} />
                                                )}
                                            </div>
                                        </Col>

                                        <Col md={4} className="px-3">
                                            <FormGroup className="mb-3">
                                                <Form.Label className="small fw-bold">Company ABN</Form.Label>
                                                <ABNInput value={formData.company_abn} onChange={handleChange} name="company_abn" />
                                            </FormGroup>
                                            <FormGroup className="mb-3">
                                                <Form.Label className="small fw-bold">Company ACN</Form.Label>
                                                <ACNInput value={formData.company_acn} onChange={handleChange} name="company_acn" />
                                            </FormGroup>
                                            <FormGroup className="mb-3">
                                                <Form.Label className="small fw-bold">Company Website</Form.Label>
                                                <DeferredInput
                                                    type="url" name="company_website" placeholder="https://example.com"
                                                    maxLength={255} value={formData.company_website} onChange={handleChange}
                                                    helpText="Max 255 characters."
                                                />
                                            </FormGroup>
                                            <FormGroup className="mb-3">
                                                <Form.Label className="small fw-bold">Company Locality</Form.Label>
                                                <Form.Select name="company_locality" value={formData.company_locality} required onChange={handleChange}>
                                                    <option value="" disabled hidden >Domestic or overseas</option>
                                                    {[{ id: 0, name: "Local" }, { id: 1, name: "International" }].map(pt => (
                                                        <option key={pt.id} value={pt.id}>{pt.name}</option>
                                                    ))}
                                                </Form.Select>
                                            </FormGroup>

                                            <FormGroup className="mb-3">
                                                <Form.Label className="small fw-bold">Industry</Form.Label>
                                                <Form.Select name="industry" value={formData.industry} required onChange={handleChange}>
                                                    <option value="" disabled hidden >Industry sector</option>
                                                    {[{ id: "Electronics", name: "Electronics" }, { id: "Office Supplies", name: "Office Supplies" }, { id: "Logistics", name: "Logistics" }, { id: "IT Services", name: "IT Services" }, { id: "Construction", name: "Construction" }, { id: "Healthcare", name: "Healthcare" }].map(pt => (
                                                        <option key={pt.id} value={pt.id}>{pt.name}</option>
                                                    ))}
                                                </Form.Select>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </div>
                            </Tab>


                            {/* Payment Details Tab */}
                            <Tab eventKey="payment" title="PAYMENT DETAILS">
                                <VendorPaymentForm data={formData} onChange={setFormData} paymentTerms={paymentTerms} countries={countries} />
                            </Tab>

                            {/* Vendor Details Tab - Disabled */}
                            <Tab eventKey="vendor_warehouse" title="VENDOR" tabClassName="vendor-tab">
                                <div className="py-0 px-2 pb-1">
                                    <Button variant="link" disabled={true} className="p-0 text-decoration-none mb-3 float-right small">
                                        <i className="fas fa-plus-circle me-1"></i> Add Location
                                    </Button>
                                    <Table size="sm" bordered hover className="text-center align-middle" style={{ fontSize: '13px' }}>
                                        <thead className="table-light text-muted">
                                            <tr>
                                                <th style={{ width: "40%" }}>LOCATION</th>
                                                <th style={{ width: "30%" }}>CITY</th>
                                                <th style={{ width: "15%" }}>ZIP</th>
                                                <th style={{ width: '5%' }}>ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr><td colSpan="4" className="py-4 text-muted">No locations found</td></tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </Tab>

                            {/* Shopperbeats Address Details Tab - Disabled */}
                            <Tab eventKey="address" title="ADDRESS DETAILS" tabClassName="vendor-tab">
                                <div className="text-end mb-2">
                                    <Button variant="link" size="sm" className="text-decoration-none">
                                        <i className="fas fa-copy me-1"></i>Copy Billing to Shipping
                                    </Button>
                                </div>
                                <Row className="py-3">
                                    <AddressForm type="billing" data={[]} countries={countries} onChange={() => { return null; }} states={[]} />
                                    <AddressForm type="shipping" data={[]} countries={countries} onChange={() => { return null; }} states={[]} />
                                </Row>
                            </Tab>

                            {/* Contact Details Tab - Disabled */}
                            <Tab eventKey="contact" title="CONTACT DETAILS" tabClassName="vendor-tab">
                                <div className="py-2 px-2 pb-1">
                                    <div className="d-flex justify-content-end mb-2">
                                        <Button
                                            variant="link"
                                            className="p-0 text-decoration-none small text-muted"
                                            disabled
                                        >
                                            <i className="fas fa-plus-circle me-1"></i>
                                            Add Contact
                                        </Button>
                                    </div>

                                    <div className="border rounded bg-white p-4">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <div className="text-muted small">First Name</div>
                                                    <div className="fw-medium">-</div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="text-muted small">Designation</div>
                                                    <div>-</div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="text-muted small">Email</div>
                                                    <div>-</div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="text-muted small">Phone</div>
                                                    <div>-</div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="text-muted small">WhatsApp</div>
                                                    <div>-</div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="text-muted small">Mobile</div>
                                                    <div>-</div>
                                                </div>

                                                <div>
                                                    <div className="text-muted small">Timezone</div>
                                                    <div>-</div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <div className="text-muted small">Last Name</div>
                                                    <div className="fw-medium">-</div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="text-muted small">Department</div>
                                                    <div>-</div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="text-muted small">Email Type</div>
                                                    <div>-</div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="text-muted small">Phone Type</div>
                                                    <div>-</div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="text-muted small">LinkedIn</div>
                                                    <div>-</div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="text-muted small">Preferred Time</div>
                                                    <div>-</div>
                                                </div>

                                                <div>
                                                    <div className="text-muted small">Status</div>
                                                    <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                                                        Secondary
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <hr />

                                        <div className="mb-4">
                                            <div className="text-muted small mb-1">Description</div>
                                            <div>-</div>
                                        </div>

                                        <hr />

                                        <div className="d-flex align-items-center gap-3">
                                            <span className="fw-semibold">Action</span>

                                            <button className="btn btn-link p-0 text-success">
                                                <i className="fas fa-pen"></i>
                                            </button>

                                            <button className="btn btn-link p-0 text-danger">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Tab>

                            {/* Inventory Section Tab */}
                            <Tab eventKey="inventory" title="INVENTORY SECTION" tabClassName="vendor-tab">
                                <div className="p-4 text-center text-muted">
                                    <i className="fas fa-boxes fa-3x mb-3 opacity-50"></i>
                                    <h6 className="fw-bold">Inventory Section</h6>
                                    <p className="mb-0">Create vendor first to add inventory configuration.</p>
                                </div>
                            </Tab>

                            {/* Documents Tab */}
                            <Tab eventKey="documents" title="DOCUMENTS DETAILS" tabClassName="vendor-tab">
                                <div className="ps-3 pe-3 pb-2">
                                    <Row className="mb-4 align-items-end">
                                        <Col md={12}>
                                            <Form.Label className="small fw-bold mb-2">
                                                Upload New Document
                                            </Form.Label>

                                            <div
                                                className="position-relative border-[#cbd5e1] border-dashed border-2 rounded-3 bg-light min-h-[120px]">
                                                <Form.Control
                                                    type="file"
                                                    onChange={handleFileUpload}
                                                    disabled={isUploading}
                                                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0 w-full"
                                                    style={{ cursor: "pointer", zIndex: 2 }}
                                                />

                                                <div
                                                    className="d-flex flex-column justify-content-center align-items-center h-100 text-center py-4"
                                                >
                                                    <i
                                                        className="fas fa-paperclip mb-2"
                                                        style={{ color: "#6b7280", fontSize: "14px" }}
                                                    ></i>

                                                    <span
                                                        style={{
                                                            color: "#374151",
                                                            fontSize: "15px",
                                                        }}
                                                    >
                                                        Click to upload documents
                                                        <span className="text-muted">
                                                            {" "}
                                                            (PDF, JPG, PNG, DOCX, XLSX)
                                                        </span>
                                                    </span>
                                                </div>

                                                {isUploading && (
                                                    <div className="px-4 pb-3">
                                                        <div className="d-flex justify-content-between small mb-1">
                                                            <span>Uploading...</span>
                                                            <span>{uploadProgress}%</span>
                                                        </div>

                                                        <div
                                                            className="progress"
                                                            style={{ height: "8px" }}
                                                        >
                                                            <div
                                                                className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                                                                style={{ width: `${uploadProgress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Col>
                                        {/* <Col md={7}><p className="text-muted small mb-2"><i className="fas fa-info-circle me-1"></i>Supported formats: PDF, JPG, PNG. Max size: 5MB.</p></Col> */}
                                    </Row>
                                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-100 text-slate-500 text-xs font-semibold uppercase h-12 text-center">
                                                    <th className="px-4 ">Document Name</th>
                                                    <th className="px-4 ">File Size</th>
                                                    <th className="px-4 ">Uploaded By</th>
                                                    <th className="px-4 ">Uploaded Date/Time</th>
                                                    <th className="px-4 ">Download</th>
                                                    <th className="px-4  ">Delete</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {documents.length > 0 ? documents.map((file, idx) => (
                                                    <tr key={idx} className="text-center">
                                                        <td className="ps-3"><div className="d-flex align-items-center">
                                                            <i className="far fa-file-alt text-primary me-2 fs-5"></i>
                                                            <span className="fw-bold">{file.file_name}</span>
                                                        </div>
                                                        </td>
                                                        <td>{file.file_size || 'Undefined'}</td>
                                                        <td>{file.created_by || 'System User'}</td>
                                                        <td>{new Date(file.created_at).toLocaleString()}</td>
                                                        {/* <td className="text-end pe-3"> */}
                                                        <td>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const url = URL.createObjectURL(file.file);
                                                                    window.open(url, "_blank");
                                                                }}
                                                            >
                                                                <i className="fas fa-download"></i>
                                                            </Button>
                                                        </td>

                                                        <td>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => handleDeleteFile(file.id, idx)}
                                                            >
                                                                <i className="fas fa-trash-alt"></i>
                                                            </Button>
                                                        </td>
                                                        {/* </td> */}
                                                    </tr>
                                                )) : (<tr><td colSpan="5" className="text-center py-4 text-muted">No documents attached yet.</td></tr>)}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </Tab>

                            {/* Purchases Tab */}
                            <Tab eventKey="purchases" title="PURCHASES" tabClassName="vendor-tab">
                                <div className="ps-3 pe-3 pb-2">
                                    <VendorPOList vendorId={1} />
                                </div>
                            </Tab>

                            {/* Invoices Tab */}
                            <Tab eventKey="invoices" title="INVOICES" tabClassName="vendor-tab">
                                <div className="p-4 text-center text-muted">
                                    <i className="fas fa-dollar-sign fa-3x mb-3 opacity-50"></i>
                                    <h6 className="fw-bold">Invoices</h6>
                                    <p className="mb-0">Create vendor first to view invoice history.</p>
                                </div>
                            </Tab>

                            {/* Returns Tab */}
                            <Tab eventKey="returns" title="RETURNS" tabClassName="vendor-tab">
                                <div className="p-4 text-center text-muted">
                                    <i className="fas fa-undo-alt fa-3x mb-3 opacity-50"></i>
                                    <h6 className="fw-bold">Vendor Returns Locked</h6>
                                </div>
                            </Tab>

                            {/* Portal Login Tab */}
                            <Tab eventKey="portal" title="PORTAL LOGIN" tabClassName="vendor-tab">
                                <VendorPortalCredentials />
                            </Tab> 

                        </Tabs>
                    </Form>
                </div>
                <style jsx>{`
                    .vendor-disabled-tab { opacity: 0.5; cursor: not-allowed !important; pointer-events: all !important; }
                    .vendor-disabled-tab:hover { opacity: 0.6; }
                `}</style>
            </div>
        </FlushRegistryContext.Provider>
    );
};

export default AddNewVendor;