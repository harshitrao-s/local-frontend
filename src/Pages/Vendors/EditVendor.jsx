import React, { useState, useEffect, useCallback, useRef, useContext, createContext, } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, Tab, Form, Row, Col, Badge, Button, Modal, FormGroup, Table, Spinner } from 'react-bootstrap';
import { toast } from "react-hot-toast";
import { apiFetch } from "../../Utils/apiFetch";
import { useMasterData } from "../../Context/MasterDataProvider";
import { API_BASE, API_ENDPOINTS } from "../../Config/api";
import Swal from "sweetalert2";
import SearchableSelect from "../../Components/Common/SearchableSelect";
import formatCurrency, { formatAUD, formatToISODate, showErrorToast } from "../../Utils/utilFunctions";
import DateInput from "../../Components/Common/DateInput";
import ABNInput from "../../Components/Common/ABNInput";
import ACNInput from "../../Components/Common/ACNInput";
import VendorPOList from "../../Components/VendorPOList";
import { AddressForm } from "./AddressForm";
import VendorInvoicesList from "../../Components/VendorInvoicesList";
import VendorPaymentForm from "./Edit/tabs/VendorPaymentForm";
import { FileSpreadsheetIcon, Undo2, UserPlus } from "lucide-react";
import CmnHeader from "../../Components/Common/CmnHeader";
import VendorPortalCredentials from "./PortalLogin";


const EditVendor = () => {
    const { vendorId } = useParams();
    const navigate = useNavigate();
    const { countries, paymentTerms, warehouses } = useMasterData();

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("primary");
    const [selectedFile, setSelectedFile] = useState(null);
    const [activePaymentView, setActivePaymentView] = useState("paypal");

    // ✅ Focus state for help text
    const [focusedField, setFocusedField] = useState(null);

    const [primary, setPrimary] = useState({
        vendor_code: "",
        vendor_company_name: "",
        vendor_name: "",
        vendor_display_name: "",
        vendor_type: "",
        currency: "",
        min_order_value: "",
        vendor_account_number: "",
        status: "",
        is_taxable: 0,      // ✅ FIX: integer default, not ""
        tax_percent: "",
        company_abn: "",
        company_acn: "",
        company_website: "",
        company_locality: "",
        payment_term: "",
        mode_of_payment: [],
        paypal_notes: "",
        wallet_notes: "",
        credit_card_notes: "",
        bank_name: "",
        bank_branch: "",
        bank_account_holder_name: "",
        bank_ifsc: "",
        bank_country: "",
        bank_account_number: "",
        bank_account_number_confirm: "",
        communication_channel: "",
        account_manager: "",
        parent_company_name: "",
    });

    const [vendorWarehouses, setVendorWarehouses] = useState([]);

    const [onboard_details, setOnboardDetails] = useState({
        first_contact_date: "",
        account_manager: "",
        first_contact_via: "",
        onboard_date: "",
        onboard_by: "",
        medium_of_contact: "",
        onboard_comments: ""
    });

    const [billingAddress, setBillingAddress] = useState({ attention: "", country: "", street1: "", street2: "", city: "", state: "", zip: "", phone: "", fax: "" });
    const [shippingAddress, setShippingAddress] = useState({ attention: "", country: "", street1: "", street2: "", city: "", state: "", zip: "", phone: "", fax: "" });
    const [tempContact, setTempContact] = useState({
        first_name: "",
        last_name: "",
        email: "",
        email_type: "",
        phone: "",
        phone_type: "",
        mobile_number: "",
        whatsapp: "",
        linkedin_in: "",
        contact_time: "",
        timezone: "",
        designation: "",
        department: "",
        description: "",
        is_primary: false
    });
    const [tempWarehouse, setTempWarehouse] = useState({ name: "", delivery_name: "", address_line1: "", address_line2: "", city: "", state_id: "", zip: "", country_id: "" });

    const [documents, setDocuments] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const [billingStates, setBillingStates] = useState([]);
    const [shippingStates, setShippingStates] = useState([]);

    const [contacts, setContacts] = useState([]);
    const [showContactModal, setShowContactModal] = useState(false);
    const [inventoryRows, setInventoryRows] = useState([]);
    const [inventoryMaster, setInventoryMaster] = useState({});
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [tempInventory, setTempInventory] = useState({
        id: null,
        inventory_frequency_id: "",
        inventory_source_id: "",
        product_inventory_sync_id: "",
        invoice_received_on_id: "",
        tracking_received_on_id: "",
        po_integration_type_id: "",
        integration_weblink: "",
    });
    const [showWarehouseModal, setShowWarehouseModal] = useState(false);
    const [warehouseStates, setWarehouseStates] = useState([]);
    const zipRegex = /^[A-Za-z0-9\-\s]{3,12}$/;

    const handleDeleteFile = async (fileId) => {
        const result = await Swal.fire({
            title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!', cancelButtonText: 'Cancel'
        });
        if (result.isConfirmed) {
            try {
                const res = await apiFetch(`${API_BASE}api/vendor/api/delete-document/${fileId}/`, { method: "DELETE" });
                if (res.status) { await loadVendor(); toast.success("Document deleted successfully"); }
                else toast.error(res.message || "Failed to delete document");
            } catch (err) { toast.error("An error occurred while deleting the file"); }
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("vendor_id", vendorId);
        setIsUploading(true);
        setUploadProgress(0);
        try {
            const interval = setInterval(() => {
                setUploadProgress(prev => { if (prev >= 95) { clearInterval(interval); return prev; } return prev + 5; });
            }, 100);
            const res = await apiFetch(`${API_BASE}api/vendor/api/upload-document/`, { method: "POST", body: formData, isFormData: true });
            clearInterval(interval);
            setUploadProgress(100);
            if (res.status) { toast.success("File uploaded successfully"); await loadVendor(); e.target.value = ""; }
        } catch (err) { toast.error("Upload failed"); }
        finally { setTimeout(() => { setIsUploading(false); setUploadProgress(0); }, 1000); }
    };

    const fetchStates = useCallback(async (countryId, type) => {
        if (!countryId) return;
        try {
            const response = await apiFetch(`${API_BASE}api/common/list_states/?country_id=${countryId}`, { method: "GET" });
            if (response?.results) { type === 'billing' ? setBillingStates(response.results) : setShippingStates(response.results); }
        } catch (err) { console.error("State fetch error", err); }
    }, []);

    const loadVendor = useCallback(async () => {
        if (!vendorId) return;
        setLoading(true);
        try {
            const res = await apiFetch(`${API_ENDPOINTS.GET_VENDOR_DETAILS}?vendor_id=${vendorId}`);
            if (res.status && res.data) {
                const d = res.data;
                console.log("FULL RESPONSE =>", d);
                // console.log("DOCUMENTS =>", d.details?.documents);
                const modeOfPaymentRaw = d.primary?.mode_of_payment;
                const paymentArray = Array.isArray(modeOfPaymentRaw)
                    ? modeOfPaymentRaw
                    : typeof modeOfPaymentRaw === "string"
                        ? modeOfPaymentRaw.split(",").map((m) => m.trim()).filter(Boolean)
                        : [];
                if (paymentArray.length > 0) setActivePaymentView(paymentArray[0]);
                else setActivePaymentView("");

                // ✅ FIX: Parse is_taxable as integer on load
                const primaryData = {
                    ...d.primary,
                    vendor_display_name: d.primary?.vendor_display_name || d.primary?.vendor_name || "",
                    mode_of_payment: paymentArray,
                    is_taxable: parseInt(d.primary?.is_taxable) || 0,
                };
                // console.log("GET_VENDOR_DETAILS RESPONSE =>", res);
                setPrimary(prev => ({ ...prev, ...primaryData }));
                setOnboardDetails(prev => ({ ...prev, ...d.onboard_details }));
                setDocuments(
                    (d.details?.documents || []).map(doc => ({
                        ...doc,
                        file_size:
                            doc.file_size ||
                            doc.size ||
                            doc.document_size ||
                            null
                    }))
                );
                setBillingAddress(prev => ({ ...prev, ...d.details?.billing_address }));
                setShippingAddress(prev => ({ ...prev, ...d.details?.shipping_address }));
                if (d.details?.billing_address?.country) fetchStates(d.details.billing_address.country, 'billing');
                if (d.details?.shipping_address?.country) fetchStates(d.details.shipping_address.country, 'shipping');
            }
        } catch (err) { toast.error("Data fetch failed"); }
        finally { setLoading(false); }
    }, [vendorId, fetchStates]);

    useEffect(() => { loadVendor(); }, [loadVendor]);

    const handleAddressChange = useCallback((type, field, value) => {
        const setter = type === 'billing' ? setBillingAddress : setShippingAddress;
        setter(prev => ({ ...prev, [field]: value }));
        if (field === 'country') { setter(prev => ({ ...prev, state: "" })); fetchStates(value, type); }
    }, [fetchStates]);

    const copyBillingAddress = () => { setShippingAddress({ ...billingAddress }); setShippingStates([...billingStates]); };

    const fetchContacts = useCallback(async () => {
        try {
            const res = await apiFetch(`${API_BASE}api/vendor/contact/getall/${vendorId}`);
            if (res.status) setContacts(res.data || []);
        } catch (err) { console.error("Failed to fetch contacts", err); }
    }, [vendorId]);

    useEffect(() => { if (vendorId) fetchContacts(); }, [vendorId, fetchContacts]);

    const fetchInventoryMaster = useCallback(async () => {
        try {
            const res = await apiFetch(`${API_BASE}api/vendor/inventory/master-options`);
            if (res.status) setInventoryMaster(res.data || {});
        } catch (err) { console.error("inventory master fetch", err); }
    }, []);

    const fetchInventoryRows = useCallback(async () => {
        if (!vendorId) return;
        try {
            const res = await apiFetch(`${API_BASE}api/vendor/inventory/getall/${vendorId}`);
            if (res.status) setInventoryRows(res.data || []);
        } catch (err) { console.error("inventory rows fetch", err); }
    }, [vendorId]);

    useEffect(() => { fetchInventoryMaster(); }, [fetchInventoryMaster]);
    useEffect(() => { if (vendorId) fetchInventoryRows(); }, [vendorId, fetchInventoryRows]);

    const handleSaveInventory = async () => {
        const link = String(tempInventory.integration_weblink || "").trim();
        if (link) {
            try {
                const u = new URL(link);
                if (u.protocol !== "http:" && u.protocol !== "https:") {
                    toast.error("Weblink must use http or https only");
                    return;
                }
            } catch {
                toast.error("Enter a valid weblink (for example https://example.com/feed)");
                return;
            }
        }
        const numOrNull = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
        const payload = {
            inventory_frequency_id: numOrNull(tempInventory.inventory_frequency_id),
            inventory_source_id: numOrNull(tempInventory.inventory_source_id),
            product_inventory_sync_id: numOrNull(tempInventory.product_inventory_sync_id),
            invoice_received_on_id: numOrNull(tempInventory.invoice_received_on_id),
            tracking_received_on_id: numOrNull(tempInventory.tracking_received_on_id),
            po_integration_type_id: numOrNull(tempInventory.po_integration_type_id),
            integration_weblink: link || null,
        };
        const isEdit = !!tempInventory.id;
        const url = isEdit
            ? `${API_BASE}api/vendor/inventory/update/${tempInventory.id}`
            : `${API_BASE}api/vendor/inventory/addNew/${vendorId}`;
        try {
            const res = await apiFetch(url, { method: "POST", body: JSON.stringify(payload) });
            if (res.status) {
                toast.success(isEdit ? "Inventory row updated" : "Inventory row added");
                setShowInventoryModal(false);
                fetchInventoryRows();
                return;
            }
            toast.error(res?.message || "Save failed");
        } catch (err) {
            const d = err?.data;
            const flat = d?.errors && Object.values(d.errors).flat();
            const first = flat && flat.length ? (typeof flat[0] === "string" ? flat[0] : String(flat[0])) : null;
            toast.error(first || d?.message || err?.message || "Save failed");
        }
    };

    const handleDeleteInventory = async (rowId) => {
        const result = await Swal.fire({
            title: "Delete this row?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Delete",
        });
        if (!result.isConfirmed) return;
        try {
            const res = await apiFetch(`${API_BASE}api/vendor/inventory/delete/${rowId}/${vendorId}`, { method: "POST", body: JSON.stringify({}) });
            if (res.status) {
                toast.success("Removed");
                fetchInventoryRows();
            } else toast.error(res?.message || "Delete failed");
        } catch (err) { toast.error("Delete failed"); }
    };

    const renderInventorySelect = (fieldKey, listType, label) => (
        <Form.Group className="mb-3" key={fieldKey}>
            <Form.Label className="small fw-bold">{label}</Form.Label>
            <Form.Select
                size="sm"
                value={tempInventory[fieldKey] === null || tempInventory[fieldKey] === undefined ? "" : String(tempInventory[fieldKey])}
                onChange={(e) => setTempInventory({ ...tempInventory, [fieldKey]: e.target.value })}
            >
                <option value="">Select</option>
                {(inventoryMaster[listType] || []).map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                ))}
            </Form.Select>
        </Form.Group>
    );

    const handleSaveContact = async () => {
        console.log("tempContact", tempContact);
        const isEdit = !!tempContact.id;
        const url = isEdit ? `${API_BASE}api/vendor/contact/update/${tempContact.id}` : `${API_BASE}api/vendor/contact/addNew/${vendorId}`;
        if (!String(tempContact.first_name || "").trim() && !String(tempContact.last_name || "").trim()) {
            toast.error("First Name or Last Name is required");
            return;
        }
        try {
            const res = await apiFetch(url, { method: "POST", body: JSON.stringify(tempContact) });
            if (res.status) {
                toast.success(isEdit ? "Contact updated" : "Contact added");
                setShowContactModal(false);
                fetchContacts();
                return;
            }
            toast.error(res?.message || "Failed to save contact");
        } catch (err) { toast.error("Operation failed"); }
    };

    const handleDeleteContact = async (contactId) => {
        const result = await Swal.fire({
            title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!', cancelButtonText: 'No, cancel',
        });
        if (result.isConfirmed) {
            try {
                let res = await apiFetch(`${API_BASE}api/vendor/contact/delete/${contactId}/${vendorId}`, { method: "POST" });
                if (!res?.status && res?.error === "primary_reassignment_required" && Array.isArray(res?.candidates) && res.candidates.length) {
                    const options = {};
                    res.candidates.forEach((c) => {
                        const label = `${(c.first_name || "").trim()} ${(c.last_name || "").trim()}`.trim() || c.email || `Contact #${c.id}`;
                        options[c.id] = label;
                    });
                    const pick = await Swal.fire({
                        title: "Reassign Primary Contact",
                        text: "Select a new primary contact before deletion.",
                        input: "select",
                        inputOptions: options,
                        inputPlaceholder: "Select contact",
                        showCancelButton: true,
                        confirmButtonText: "Reassign & Delete",
                        cancelButtonText: "Cancel",
                        inputValidator: (value) => (!value ? "Please select a contact" : undefined)
                    });
                    if (!pick.isConfirmed || !pick.value) return;
                    res = await apiFetch(`${API_BASE}api/vendor/contact/delete/${contactId}/${vendorId}`, {
                        method: "POST",
                        body: JSON.stringify({ reassignment_contact_id: pick.value })
                    });
                }
                if (res.status) {
                    Swal.fire({ title: 'Deleted!', text: 'Contact has been removed.', icon: 'success', timer: 1500, showConfirmButton: false });
                    fetchContacts();
                } else toast.error(res?.message || "Delete failed");
            } catch (err) { toast.error("Error: Could not reach the server"); }
        }
    };

    const handleUpdate = async () => {
        const modeList = Array.isArray(primary.mode_of_payment) ? primary.mode_of_payment : [];
        if (modeList.includes("bank_transfer")) {
            const acc = String(primary.bank_account_number || primary.account_number || "").trim();
            const accConfirm = String(primary.bank_account_number_confirm || "").trim();
            if (acc && accConfirm && acc !== accConfirm) {
                toast.error("Bank account numbers do not match");
                return;
            }
        }

        const formData = new FormData();
        if (selectedFile) formData.append("document", selectedFile);
        formData.append("vendor_id", vendorId);
        formData.append("primary", JSON.stringify(primary));
        if (primary.bank_verification_doc instanceof File) formData.append('bank_verification_doc', primary.bank_verification_doc);
        const { state_list: bList, ...restBilling } = billingAddress;
        const { state_list: sList, ...restShipping } = shippingAddress;
        formData.append("details", JSON.stringify({ billing_address: restBilling, shipping_address: restShipping }));
        formData.append("onboard_details", JSON.stringify({
            ...onboard_details,
            first_contact_date: formatToISODate(onboard_details.first_contact_date),
            onboard_date: formatToISODate(onboard_details.onboard_date),
        }));
        try {
            const res = await apiFetch(API_ENDPOINTS.save_vendor_details, { method: "POST", body: formData });
            if (res?.status) toast.success("Vendor updated!");
            else toast.error("Update failed, " + (res.message || "Please try again"));
        } catch (err) { showErrorToast(err); }
    };

    const fetchWarehouses = useCallback(async () => {
        try {
            const res = await apiFetch(`${API_BASE}api/vendor/api/vendor_warehouse/get_all/${vendorId}`);
            if (res.status) setVendorWarehouses(res.data || []);
        } catch (err) { console.error("Failed to fetch warehouses", err); }
    }, [vendorId]);

    useEffect(() => { if (vendorId) fetchWarehouses(); }, [vendorId, fetchWarehouses]);

    const handleSaveWarehouse = async () => {
        const isEdit = !!tempWarehouse.warehouse_id;
        const url = isEdit ? `${API_BASE}api/vendor/api/vendor_warehouse/update/${tempWarehouse.warehouse_id}` : `${API_BASE}api/vendor/api/vendor_warehouse/addNew/${vendorId}`;

        const validationErrors = [];
        if (!String(tempWarehouse.address_line1 || "").trim()) validationErrors.push("Address Line 1 is required.");
        if (!String(tempWarehouse.city || "").trim()) validationErrors.push("City is required.");
        if (!String(tempWarehouse.country_id || "").trim()) validationErrors.push("Country is required.");
        if (!String(tempWarehouse.state_id || "").trim()) validationErrors.push("State is required.");
        if (!String(tempWarehouse.zip || "").trim()) validationErrors.push("ZIP Code is required.");
        else if (!zipRegex.test(String(tempWarehouse.zip).trim())) validationErrors.push("Enter a valid ZIP Code.");

        if (validationErrors.length) {
            toast.error(validationErrors[0]);
            return;
        }

        try {
            const res = await apiFetch(url, { method: isEdit ? "PUT" : "POST", body: JSON.stringify(tempWarehouse) });
            if (res.status) {
                toast.success(isEdit ? "Vendor details updated" : "Vendor details added");
                setShowWarehouseModal(false);
                fetchWarehouses();
                return;
            }
            if (res?.errors) {
                const firstError = Object.values(res.errors)[0];
                toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
                return;
            }
            toast.error(res?.message || "Failed to save vendor details");
        } catch (err) { toast.error("Operation failed"); }
    };

    const handleDeleteWarehouse = async (warehouseId) => {
        const result = await Swal.fire({ title: 'Delete Location?', text: "Are you sure?", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' });
        if (result.isConfirmed) {
            try {
                const res = await apiFetch(
                    `${API_BASE}api/vendor/vendor_warehouse/delete/${vendorId}/${warehouseId}`,
                    { method: "DELETE" }
                );
                if (res.status) {
                    toast.success("Vendor detail removed");
                    fetchWarehouses();
                    return;
                }
                toast.error(res?.message || "Unable to delete vendor detail");
            } catch (err) { toast.error("Error deleting location"); }
        }
    };

    const handleWarehouseCountryChange = useCallback(async (countryId) => {
        setTempWarehouse(prev => ({ ...prev, country_id: countryId, state_id: "" }));
        if (!countryId) { setWarehouseStates([]); return; }
        try {
            const response = await apiFetch(`${API_BASE}api/common/list_states/?country_id=${countryId}`, { method: "GET" });
            if (response?.results) setWarehouseStates(response.results);
        } catch (err) { console.error("Warehouse State fetch error", err); }
    }, []);

    const FlushRegistryContext = createContext(null);

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
    DeferredInput.displayName = "DeferredInput"

    if (loading) return <div className="p-5 text-center"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Loading vendor details...</p></div>;
    if (!vendorId || !primary.vendor_code) {
        return (
            <div className="d-flex align-items-center justify-content-center bg-light" style={{ minHeight: '80vh' }}>
                <div className="text-center p-5 shadow-sm bg-white rounded-4" style={{ maxWidth: '450px' }}>
                    <div className="mb-4"><i className="fas fa-exclamation-circle text-danger" style={{ fontSize: '4rem' }}></i></div>
                    <h3 className="fw-bold text-dark">Vendor Not Found</h3>
                    <p className="text-muted mb-4">We couldn't find the vendor you're looking for.</p>
                    <div className="d-grid gap-2">
                        <Button variant="dark" className="py-2 fw-bold shadow-sm" onClick={() => navigate('/vendor/vendors')}><i className="fas fa-arrow-left me-2"></i>Back to Vendors</Button>
                        <Button variant="outline-secondary" size="sm" onClick={() => window.location.reload()}><i className="fas fa-sync-alt me-2"></i>Retry Connection</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-0">
            <CmnHeader
                title={"Update Vendor"}
                IconLucide={UserPlus}
                actionVariant="ghost" actionName="Listing"
                actionLink="/vendor/vendors"
                actions={[
                    { icon: <FileSpreadsheetIcon size={16} />, name: "Update", onClick: () => handleUpdate(), variant: "primary", },
                ]}
            />

            <div className="bg-white shadow-sm mt-4 rounded-3">
                <Form>
                    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4 custom-tabs mt-2">

                        {/* ONBOARD DETAILS */}
                        <Tab eventKey="onboard_details" title="ONBOARD DETAILS">
                            <Row className="py-3 px-3">
                                <Col md="4" className="px-3 float-start">
                                    <FormGroup className="mb-3">
                                        <Form.Label className="small fw-bold">First Contact Date</Form.Label>
                                        <DateInput
                                            value={onboard_details.first_contact_date || null}
                                            onChange={date =>
                                                setOnboardDetails(prev => ({ ...prev, first_contact_date: date }))
                                            }
                                        />
                                    </FormGroup>
                                    <FormGroup className="mb-3">
                                        <Form.Label className="small fw-bold">First Contact Via</Form.Label>
                                        <Form.Select name="first_contact_via" value={onboard_details.first_contact_via}
                                            onChange={(e) => setOnboardDetails(prev => ({ ...prev, first_contact_via: e.target.value }))}>
                                            <option value="">Select</option>
                                            <option value="email">Email</option>
                                            <option value="phone">Phone</option>
                                            <option value="web_form">Web Form</option>
                                        </Form.Select>
                                    </FormGroup>

                                    <FormGroup className="mb-3">
                                        <Form.Label className="small fw-bold">Assigned Account Manager</Form.Label>
                                        <DeferredInput
                                            type="text"
                                            name="account_manager"
                                            placeholder="Enter Account Manager Name"
                                            value={onboard_details.account_manager || ""}
                                            onChange={(e) =>
                                                setOnboardDetails(prev => ({
                                                    ...prev,
                                                    account_manager: e.target.value
                                                }))
                                            }
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md="4" className="px-3 float-start">
                                    <FormGroup className="mb-3">
                                        <Form.Label className="small fw-bold">Onboard Date</Form.Label>
                                        <DateInput
                                            value={onboard_details.onboard_date || null}
                                            onChange={(e) =>
                                                setOnboardDetails(prev => ({
                                                    ...prev,
                                                    account_manager: e.target.value
                                                }))
                                            }
                                        />
                                    </FormGroup>
                                    <FormGroup className="mb-3">
                                        <Form.Label className="small fw-bold">Onboard By</Form.Label>
                                        <Form.Control type="text" name="onboard_by"
                                            value={onboard_details.onboard_by}
                                            onChange={(e) => setOnboardDetails(prev => ({ ...prev, onboard_by: e.target.value }))}
                                            onFocus={() => setFocusedField('onboard_by')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                        {focusedField === 'onboard_by' && <Form.Text className="text-muted">Name of the person who onboarded this vendor.</Form.Text>}
                                    </FormGroup>
                                </Col>
                                <Col md="4" className="px-3 float-start">
                                    <FormGroup className="mb-3">
                                        <Form.Label className="small fw-bold">How We Found </Form.Label>
                                        <Form.Select name="medium_of_contact" value={onboard_details.medium_of_contact}
                                            onChange={(e) => setOnboardDetails(prev => ({ ...prev, medium_of_contact: e.target.value }))}>
                                            <option value="">Select</option>
                                            <option value="google">Google</option>
                                            <option value="trade_show">Trade Show</option>
                                            <option value="network">Network</option>
                                        </Form.Select>
                                    </FormGroup>
                                    <FormGroup className="mb-3">
                                        <Form.Label className="small fw-bold">Internal Remarks</Form.Label>
                                        <Form.Control as="textarea" name="onboard_comments" rows={4}
                                            value={onboard_details.onboard_comments}
                                            onChange={(e) => setOnboardDetails(prev => ({ ...prev, onboard_comments: e.target.value }))}
                                            onFocus={() => setFocusedField('onboard_comments')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                        {focusedField === 'onboard_comments' && <Form.Text className="text-muted">Notes about how or why this vendor was onboarded.</Form.Text>}
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Tab>

                        <Tab eventKey="primary" title="PRIMARY DETAILS">
                            <div className="py-3 px-3">
                                <Row className="mb-3">
                                    {/* COL 1 */}
                                    <Col md={4} className="px-3">
                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">Vendor ID <span className="text-danger">*</span></Form.Label>
                                            <Form.Control name="vendor_code" placeholder="VEND001" maxLength={50}
                                                value={primary.vendor_code}
                                                onChange={(e) => setPrimary({ ...primary, vendor_code: e.target.value })}
                                                onFocus={() => setFocusedField('vendor_code')}
                                                onBlur={() => setFocusedField(null)}
                                            />
                                            {focusedField === 'vendor_code' && <Form.Text className="text-muted">Unique identifier for this vendor. Max 50 characters.</Form.Text>}
                                        </FormGroup>
                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">Legal Company Name <span className="text-danger">*</span></Form.Label>
                                            <Form.Control name="vendor_company_name" maxLength={120} placeholder="Full legal registered name"
                                                value={primary.vendor_company_name}
                                                onChange={(e) => setPrimary({ ...primary, vendor_company_name: e.target.value })}
                                                onFocus={() => setFocusedField('vendor_company_name')}
                                                onBlur={() => setFocusedField(null)}
                                            />
                                            {focusedField === 'vendor_company_name' && <Form.Text className="text-muted">Legal registered company name. Max 120 characters.</Form.Text>}
                                        </FormGroup>

                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold"> Trading Name <span className="text-danger">*</span></Form.Label>
                                            <Form.Control name="trading_name" maxLength={120} placeholder="Business trading name"
                                                value={primary.trading_name}
                                                onChange={(e) => setPrimary({ ...primary, trading_name: e.target.value })}
                                                onFocus={() => setFocusedField('trading_name')}
                                                onBlur={() => setFocusedField(null)}
                                            />
                                            {focusedField === 'vendor_display_name' && <Form.Text className="text-muted">Name shown in listings and reports.</Form.Text>}
                                        </FormGroup>

                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold"> Display Name <span className="text-danger">*</span></Form.Label>
                                            <Form.Control name="display_name" maxLength={120} placeholder="Display name"
                                                value={primary.display_name}
                                                onChange={(e) => setPrimary({ ...primary, display_name: e.target.value })}
                                                onFocus={() => setFocusedField('display_name')}
                                                onBlur={() => setFocusedField(null)}
                                            />
                                            {focusedField === 'vendor_display_name' && <Form.Text className="text-muted">Name shown in listings and reports.</Form.Text>}
                                        </FormGroup>
                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">Vendor Type</Form.Label>
                                            <Form.Select name="vendor_type" value={primary.vendor_type} onChange={(e) => setPrimary({ ...primary, vendor_type: e.target.value })}>
                                                <option value="">Select</option>
                                                {[{ id: "Distributor", name: "Distributor" }, { id: "Manufacturer", name: "Manufacturer" }, { id: "Importer", name: "Importer" }, { id: "Local Supplier", name: "Local Supplier" }, { id: "Service Provider", name: "Service Provider" }].map(pt => (
                                                    <option key={pt.id} value={pt.id}>{pt.name}</option>
                                                ))}
                                            </Form.Select>
                                        </FormGroup>

                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">Preferred Communication</Form.Label>
                                            <Form.Select name="communication_channel" value={primary.communication_channel} onChange={(e) => setPrimary({ ...primary, communication_channel: e.target.value })}>
                                                <option value="">Select</option>
                                                {[{ id: "Email", name: "Email" }, { id: "Phone", name: "Phone" }, { id: "Portal", name: "Portal" }, { id: "EDI", name: "EDI" }, { id: "API", name: "API" }].map(pt => (
                                                    <option key={pt.id} value={pt.id}>{pt.name}</option>
                                                ))}
                                            </Form.Select>
                                        </FormGroup>
                                    </Col>

                                    {/* COL 2 */}
                                    <Col md={4} className="px-3">
                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">Currency</Form.Label>
                                            <SearchableSelect name="currency" options={countries} value={primary.currency}
                                                onChange={(e) => setPrimary({ ...primary, currency: e.target.value })}
                                                labelKey="currency" valueKey="currency" unique={true} placeholder="Search currency..."
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
                                            <Form.Control
                                                type="number"
                                                name="min_order_value"
                                                min="0"
                                                max="10000000"
                                                step="0.01"
                                                value={primary.min_order_value}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "" || (/^\d*\.?\d{0,2}$/.test(val) && Number(val) <= 10000000)) {
                                                        setPrimary({ ...primary, min_order_value: val });
                                                    }
                                                }}
                                                onFocus={() => setFocusedField('min_order_value')}
                                                onBlur={() => setFocusedField(null)}
                                            />
                                            {focusedField === 'min_order_value' && <Form.Text className="text-muted">Minimum purchase amount required per order.</Form.Text>}
                                        </FormGroup>
                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">Vendor Account No.</Form.Label>
                                            <Form.Control type="text" name="vendor_account_number" maxLength={25}
                                                placeholder="Account number from vendor"
                                                value={primary.vendor_account_number}
                                                onChange={(e) => { const val = e.target.value; if (/^[a-zA-Z0-9]*$/.test(val)) setPrimary({ ...primary, vendor_account_number: val }); }}
                                                onFocus={() => setFocusedField('vendor_account_number')}
                                                onBlur={() => setFocusedField(null)}
                                            />
                                            {focusedField === 'vendor_account_number' && <Form.Text className="text-muted">Letters and numbers only. Max 25 characters.</Form.Text>}
                                        </FormGroup>

                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">Parent Company</Form.Label>
                                            <Form.Control type="text" name="parent_company_name" maxLength={255}
                                                placeholder="Ultimate parent entity"
                                                value={primary.parent_company_name}
                                                onChange={(e) => { const val = e.target.value; if (/^[a-zA-Z0-9]*$/.test(val)) setPrimary({ ...primary, parent_company_name: val }); }}
                                                onFocus={() => setFocusedField('parent_company_name')}
                                                onBlur={() => setFocusedField(null)}
                                            />
                                            {focusedField === 'vendor_account_number' && <Form.Text className="text-muted">Letters and numbers only. Max 25 characters.</Form.Text>}
                                        </FormGroup>

                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <FormGroup className="mb-0">
                                                <Form.Label className="small fw-bold">Vendor Status</Form.Label>
                                                <Form.Select name="status" value={primary.status} onChange={(e) => setPrimary({ ...primary, status: e.target.value })}>
                                                    <option value="">Select</option>
                                                    {[{ "id": 0, "name": "Pending" }, { "id": 1, "name": "In Process" }, { "id": 2, "name": "Active" }, { "id": 3, "name": "Reject" }, { "id": 4, "name": "On Hold" }].map(pt => (
                                                        <option key={pt.id} value={pt.id}>{pt.name}</option>
                                                    ))}
                                                </Form.Select>
                                            </FormGroup>

                                            <div className="d-flex align-items-center justify-content-around" style={{ minWidth: "68px", minHeight: "64px" }}>
                                                <Form.Label className="small fw-bold me-2 mb-0" style={{ marginTop: "22px" }}>Taxable</Form.Label>
                                                {/* ✅ FIX: Number() compare → no more always-active bug */}
                                                <Form.Check
                                                    type="switch"
                                                    id="tax-free-switch"
                                                    name="is_taxable"
                                                    className="fw-bold fs-7"
                                                    checked={Number(primary.is_taxable) === 1}
                                                    onChange={(e) => setPrimary({
                                                        ...primary,
                                                        is_taxable: e.target.checked ? 1 : 0,
                                                        tax_percent: e.target.checked ? primary.tax_percent : 0
                                                    })}
                                                />
                                            </div>

                                            {Number(primary.is_taxable) === 1 ? (
                                                <div>
                                                    <Form.Label className="small fw-bold mb-1">Tax %</Form.Label>
                                                    <Form.Control type="number" name="tax_percent" placeholder="0" size="sm"
                                                        value={primary.tax_percent} min="0" max="100"
                                                        onChange={(e) => {
                                                            let val = e.target.value;
                                                            if (val === "") { setPrimary({ ...primary, tax_percent: "" }); return; }
                                                            const n = parseFloat(val);
                                                            if (n < 0) setPrimary({ ...primary, tax_percent: 0 });
                                                            else if (n > 100) setPrimary({ ...primary, tax_percent: 100 });
                                                            else setPrimary({ ...primary, tax_percent: n });
                                                        }}
                                                    />

                                                </div>
                                            ) : (
                                                <div style={{ width: "80px" }} />
                                            )}
                                        </div>
                                    </Col>

                                    {/* COL 3 */}
                                    <Col md={4} className="px-3">
                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">Company ABN</Form.Label>
                                            <ABNInput name="company_abn" value={primary.company_abn}
                                                onChange={(e) => setPrimary({ ...primary, company_abn: e.target.value })}
                                                onFocus={() => setFocusedField('company_abn')}
                                                onBlur={() => setFocusedField(null)}
                                            />
                                            {focusedField === 'company_abn' && <Form.Text className="text-muted">Australian Business Number — 11 digits.</Form.Text>}
                                        </FormGroup>
                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">Company ACN</Form.Label>
                                            <ACNInput name="company_acn" value={primary.company_acn}
                                                onChange={(e) => setPrimary({ ...primary, company_acn: e.target.value })}
                                                onFocus={() => setFocusedField('company_acn')}
                                                onBlur={() => setFocusedField(null)}
                                            />
                                            {focusedField === 'company_acn' && <Form.Text className="text-muted">Australian Company Number — 9 digits.</Form.Text>}
                                        </FormGroup>
                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">Company Website</Form.Label>
                                            <Form.Control type="text" name="company_website"
                                                value={primary.company_website}
                                                onChange={(e) => setPrimary({ ...primary, company_website: e.target.value })}
                                                onFocus={() => setFocusedField('company_website')}
                                                onBlur={() => setFocusedField(null)}
                                            />
                                            {focusedField === 'company_website' && <Form.Text className="text-muted">e.g. https://www.example.com</Form.Text>}
                                        </FormGroup>
                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">Company Locality</Form.Label>
                                            <Form.Select name="company_locality" value={primary.company_locality} onChange={(e) => setPrimary({ ...primary, company_locality: e.target.value })}>
                                                <option value="" disabled hidden >Domestic or overseas</option>
                                                {[{ "id": 0, "name": "Local" }, { "id": 1, "name": "International" }].map(pt => (
                                                    <option key={pt.id} value={pt.id}>{pt.name}</option>
                                                ))}
                                            </Form.Select>
                                        </FormGroup>

                                        <FormGroup className="mb-3">
                                            <Form.Label className="small fw-bold">Industry</Form.Label>
                                            <Form.Select
                                                name="industry"
                                                value={primary.industry || ""}
                                                onChange={(e) =>
                                                    setPrimary({ ...primary, industry: e.target.value })}>
                                                <option value="" disabled>
                                                    Industry sector
                                                </option>
                                                {[
                                                    { id: "Electronics", name: "Electronics" },
                                                    { id: "Office Supplies", name: "Office Supplies" },
                                                    { id: "Logistics", name: "Logistics" },
                                                    { id: "IT Services", name: "IT Services" },
                                                    { id: "Construction", name: "Construction" },
                                                    { id: "Healthcare", name: "Healthcare" }
                                                ].map((pt) => (
                                                    <option key={pt.id} value={pt.id}>
                                                        {pt.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </div>
                        </Tab>

                        <Tab eventKey="payment" title="PAYMENT DETAILS">
                            <VendorPaymentForm data={primary} onChange={setPrimary} paymentTerms={paymentTerms} countries={countries} />
                        </Tab>

                        <Tab eventKey="vendor_warehouse" title="VENDOR">
                            <div className="py-0 px-2 pb-1">
                                <Button variant="link" className="p-0 text-decoration-none mb-3 float-right small"
                                    onClick={() => { setTempWarehouse({ address_line1: "", city: "", state_id: "", zip: "", country_id: "" }); setShowWarehouseModal(true); }}>
                                    <i className="fas fa-plus-circle me-1"></i> Add Location
                                </Button>
                                <Table size="sm" bordered hover className="text-center align-middle" style={{ fontSize: '13px' }}>
                                    <thead className="table-light text-muted">
                                        <tr>
                                            <th>LOCATION TYPE</th>
                                            <th>ADDRESS</th>
                                            <th>SUBURB</th>
                                            <th>CITY</th>
                                            <th>STATE</th>
                                            <th>POSTCODE</th>
                                            <th>COUNTRY</th>
                                            <th>CONTACT PERSON</th>
                                            <th>PHONE</th>
                                            <th>PRIMARY</th>
                                            <th>STATUS</th>
                                            <th style={{ width: "100px" }}>ACTION</th>
                                        </tr>
                                    </thead>
                                    {/* {vendorWarehouses.length > 0 ? vendorWarehouses.map((w) => (
                                            <tr key={w.id}>
                                                <td className="fw-bold">{w.address_line1}</td><td>{w.city}</td><td>{w.zip}</td>
                                                <td>
                                                    <div className="btn-group">
                                                        <Button variant="link" size="sm" className="text-success p-0 me-2"
                                                            onClick={() => { setTempWarehouse(w); if (w.country_id) { handleWarehouseCountryChange(w.country_id); setTimeout(() => setTempWarehouse(prev => ({ ...prev, state_id: w.state_id })), 100); } setShowWarehouseModal(true); }}>
                                                            <i className="fas fa-pen"></i>
                                                        </Button>
                                                        <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleDeleteWarehouse(w.warehouse_id)}><i className="fas fa-trash"></i></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (<tr><td colSpan="4" className="py-4 text-muted">No locations found</td></tr>)} */}

                                    <tbody>
                                        {vendorWarehouses.length > 0 ? (
                                            vendorWarehouses.map((w) => (
                                                <tr key={w.id}>
                                                    <td>{w.location_type || "-"}</td>
                                                    <td>{w.address_line1 || "-"}</td>
                                                    <td>{w.suburb || "-"}</td>
                                                    <td>{w.city || "-"}</td>
                                                    <td>{w.state_name || "-"}</td>
                                                    <td>{w.postcode || "-"}</td>
                                                    <td>{w.country_name || "-"}</td>
                                                    <td>{w.contact_person || "-"}</td>
                                                    <td>{w.phone || "-"}</td>
                                                    <td>
                                                        {w.is_primary ? (
                                                            <span className="badge bg-success">Yes</span>
                                                        ) : (
                                                            <span className="badge bg-secondary">No</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {w.is_active ? (
                                                            <span className="badge bg-success">Active</span>
                                                        ) : (
                                                            <span className="badge bg-danger">Inactive</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="btn-group">
                                                            <Button variant="link" size="sm" className="text-success p-0 me-2"
                                                                onClick={() => { setTempWarehouse(w); if (w.country_id) { handleWarehouseCountryChange(w.country_id); setTimeout(() => setTempWarehouse(prev => ({ ...prev, state_id: w.state_id })), 100); } setShowWarehouseModal(true); }}>
                                                                <i className="fas fa-pen"></i>
                                                            </Button>

                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                className="text-danger p-0"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="12" className="py-4 text-muted text-center">
                                                    No locations found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Tab>

                        <Tab eventKey="address" title="ADDRESS DETAILS">
                            <div className="text-end mb-2">
                                <Button variant="link" size="sm" className="text-decoration-none" onClick={copyBillingAddress}><i className="fas fa-copy me-1"></i>Copy Billing to Shipping</Button>
                            </div>
                            <Row className="py-3">
                                <AddressForm type="billing" data={billingAddress} countries={countries} states={billingStates} onChange={handleAddressChange} />
                                <AddressForm type="shipping" data={shippingAddress} countries={countries} states={shippingStates} onChange={handleAddressChange} />
                            </Row>
                        </Tab>

                        <Tab eventKey="contact" title="CONTACT DETAILS">
                            <div className="p-4 overflow-hidden">

                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <Button variant="link" className="p-0 text-decoration-none small"
                                        onClick={() => { setTempWarehouse({ address_line1: "", city: "", state_id: "", zip: "", country_id: "" }); setShowWarehouseModal(true); }}>
                                        <i className="fas fa-plus-circle me-1"></i> Add Location
                                    </Button>
                                </div>

                                {/* Table Wrapper */}
                                <div className="grid grid-cols-1  gap-4">
                                    {contacts.length > 0 ? (
                                        contacts.map((c) => (
                                            <div
                                                key={c.id}
                                                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                                            >
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500">First Name</p>
                                                        <p className="font-medium">{c.first_name || "-"}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">Last Name</p>
                                                        <p>{c.last_name || "-"}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">Designation</p>
                                                        <p>{c.role || "-"}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">Department</p>
                                                        <p>{c.department || "-"}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">Email</p>
                                                        <p className="text-blue-600 break-all">{c.email || "-"}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">Email Type</p>
                                                        <p>{c.email_type || "-"}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">Phone</p>
                                                        <p>{c.phone || "-"}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">Phone Type</p>
                                                        <p>{c.phone_type || "-"}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">WhatsApp</p>
                                                        <p>{c.whatsapp || "-"}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">LinkedIn</p>
                                                        {c.linkedin_in ? (
                                                            <a
                                                                href={c.linkedin_in}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                View Profile
                                                            </a>
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">Mobile</p>
                                                        <p>{c.mobile_number || "-"}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">Preferred Time</p>
                                                        <p>{c.contact_time || "-"}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">Timezone</p>
                                                        <p>{c.timezone || "-"}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">Status</p>
                                                        {c.is_primary ? (
                                                            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                                                Primary
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                                                Secondary
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 border-t pt-4">
                                                    <p className="text-xs text-gray-500 mb-1">Description</p>
                                                    <p className="text-sm text-gray-700">
                                                        {c.description || "-"}
                                                    </p>
                                                </div>

                                                <div className="mt-4 flex items-center justify-start gap-4 border-t pt-4">
                                                    <p>
                                                        Action
                                                    </p>
                                                    <button
                                                        className="text-green-600 hover:text-green-700"
                                                        onClick={() => {
                                                            setTempContact(c);
                                                            setShowContactModal(true);
                                                        }}
                                                    >
                                                        <i className="fas fa-pen"></i>
                                                    </button>

                                                    <button
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleDeleteContact(c.id)}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-10 text-center text-gray-500">
                                            No contacts found
                                        </div>
                                    )}
                                </div>

                            </div>
                        </Tab>

                        {/* INVENTORY SECTION */}
                        <Tab eventKey="inventory" title="INVENTORY">
                            <div className="py-0 px-3 pb-1">
                                <Button
                                    variant="link"
                                    className="p-0 text-decoration-none mb-3 float-right small"
                                    onClick={() => {
                                        setTempInventory({
                                            id: null,
                                            inventory_frequency_id: "",
                                            inventory_source_id: "",
                                            product_inventory_sync_id: "",
                                            invoice_received_on_id: "",
                                            tracking_received_on_id: "",
                                            po_integration_type_id: "",
                                            integration_weblink: "",
                                        });
                                        setShowInventoryModal(true);
                                    }}
                                >
                                    <i className="fas fa-plus-circle me-1"></i> Add Inventory Row
                                </Button>
                                <Table size="sm" bordered hover className="text-center align-middle" style={{ fontSize: "13px" }}>
                                    <thead className="table-light text-muted">
                                        <tr>
                                            <th>FREQUENCY</th>
                                            <th>SOURCE</th>
                                            <th>PRODUCT SYNC</th>
                                            <th>INVOICE ON</th>
                                            <th>TRACKING ON</th>
                                            <th>PO INTEGRATION</th>
                                            <th>WEBLINK</th>
                                            <th style={{ width: "100px" }}>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventoryRows.length > 0 ? inventoryRows.map((r) => (
                                            <tr key={r.id}>
                                                <td>{r.inventory_frequency?.label || "—"}</td>
                                                <td>{r.inventory_source?.label || "—"}</td>
                                                <td>{r.product_inventory_sync?.label || "—"}</td>
                                                <td>{r.invoice_received_on?.label || "—"}</td>
                                                <td>{r.tracking_received_on?.label || "—"}</td>
                                                <td>{r.po_integration_type?.label || "—"}</td>
                                                <td className="text-start">
                                                    {r.integration_weblink ? (
                                                        <a
                                                            href={r.integration_weblink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary text-truncate d-inline-block"
                                                            style={{ maxWidth: "140px" }}
                                                            title={r.integration_weblink}
                                                        >
                                                            Open link
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted">—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="btn-group">
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="text-success p-0 me-2"
                                                            onClick={() => {
                                                                setTempInventory({
                                                                    id: r.id,
                                                                    inventory_frequency_id: r.inventory_frequency?.id ?? "",
                                                                    inventory_source_id: r.inventory_source?.id ?? "",
                                                                    product_inventory_sync_id: r.product_inventory_sync?.id ?? "",
                                                                    invoice_received_on_id: r.invoice_received_on?.id ?? "",
                                                                    tracking_received_on_id: r.tracking_received_on?.id ?? "",
                                                                    po_integration_type_id: r.po_integration_type?.id ?? "",
                                                                    integration_weblink: r.integration_weblink || "",
                                                                });
                                                                setShowInventoryModal(true);
                                                            }}
                                                        >
                                                            <i className="fas fa-pen"></i>
                                                        </Button>
                                                        <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleDeleteInventory(r.id)}>
                                                            <i className="fas fa-trash"></i>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="8" className="py-4 text-muted">No inventory rows yet</td></tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>

                        </Tab>

                        {/* DOCUMENTS SECTION */}
                        <Tab eventKey="other" title="DOCUMENTS ">
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
                                                    <td>
                                                        {file.file_size
                                                            ? `${(Number(file.file_size) / 1024).toFixed(2)} KB`
                                                            : "N/A"}
                                                    </td>
                                                    <td>{file.created_by || 'System User'}</td>
                                                    <td>{new Date(file.created_at).toLocaleString()}</td>
                                                    {/* <td className="text-end pe-3"> */}
                                                    <td>
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => {
                                                                // console.log("FILE =>", file);
                                                                // console.log("PATH =>", file.file_path);
                                                                // window.open(file.file_path, "_blank");
                                                            }}
                                                        >
                                                            <i className="fas fa-download"></i>
                                                        </Button>
                                                    </td>

                                                    <td>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteFile(file.id)}
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

                        <Tab eventKey="purchases" title="PURCHASES">
                            <div className="ps-3 pe-3 pb-2"><VendorPOList vendorId={vendorId} /></div>
                        </Tab>

                        <Tab eventKey="invoices" title="INVOICES">
                            <div className="ps-3 pe-3 pb-2">{primary?.vendor_code && <VendorInvoicesList vendorCode={primary?.vendor_code} />}</div>
                        </Tab>

                        <Tab eventKey="returns" title="RETURNS" tabClassName="vendor-disabled-tab">
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
                <style jsx>{`
                    .vendor-disabled-tab { opacity: 0.5; cursor: not-allowed !important; pointer-events: all !important; }
                    .vendor-disabled-tab:hover { opacity: 0.6; }
                `}</style>

                {/* Inventory Section Modal */}
                <Modal show={showInventoryModal} onHide={() => setShowInventoryModal(false)} centered size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title className="h6 fw-bold">{tempInventory.id ? "Edit Inventory Row" : "Add Inventory Row"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-4">
                        <Row className="mb-1">
                            <Col md={6}>
                                {renderInventorySelect("inventory_frequency_id", "inventory_frequency", "Inventory Frequency")}
                                {renderInventorySelect("inventory_source_id", "inventory_source", "Inventory Source")}
                                {renderInventorySelect("product_inventory_sync_id", "product_inventory_sync", "Product Inventory Sync")}
                            </Col>
                            <Col md={6}>
                                {renderInventorySelect("invoice_received_on_id", "invoice_received_on", "Invoice Received On")}
                                {renderInventorySelect("tracking_received_on_id", "tracking_received_on", "Tracking Received On")}
                                {renderInventorySelect("po_integration_type_id", "po_integration_type", "PO Integration Type")}
                            </Col>
                        </Row>
                        <Form.Group className="mb-0">
                            <Form.Label className="small fw-bold">Integration weblink</Form.Label>
                            <Form.Control
                                size="sm"
                                type="url"
                                inputMode="url"
                                autoComplete="off"
                                placeholder="https://"
                                value={tempInventory.integration_weblink}
                                onChange={(e) => setTempInventory({ ...tempInventory, integration_weblink: e.target.value })}
                            />
                            <Form.Text className="text-muted">
                                Optional portal or feed URL (http or https only). The table opens links in a new tab with noopener and noreferrer.
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" size="sm" onClick={() => setShowInventoryModal(false)}>Cancel</Button>
                        <Button variant="primary" size="sm" onClick={handleSaveInventory}>Save</Button>
                    </Modal.Footer>
                </Modal>

                {/* Contact Modal */}
                <Modal show={showContactModal} onHide={() => setShowContactModal(false)} centered size="lg">
                    <Modal.Header closeButton><Modal.Title className="h6 fw-bold">Vendor Contact Details</Modal.Title></Modal.Header>
                    <Modal.Body className="px-4">
                        <Row className="mb-3">
                            <Col md={4}><Form.Label className="small fw-bold">First Name</Form.Label><Form.Control size="sm" value={tempContact.first_name} onChange={e => setTempContact({ ...tempContact, first_name: e.target.value })} /></Col>
                            <Col md={4}><Form.Label className="small fw-bold">Last Name</Form.Label><Form.Control size="sm" value={tempContact.last_name} onChange={e => setTempContact({ ...tempContact, last_name: e.target.value })} /></Col>
                            <Col md={4}>
                                <Form.Label className="small fw-bold">Department</Form.Label>
                                <Form.Select size="sm" value={tempContact.department} onChange={e => setTempContact({ ...tempContact, department: e.target.value })}>
                                    <option value="Select">Select</option>
                                    <option value="Customer Service">Customer Service</option>
                                    <option value="Account Manager">Account Manager</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Account (Finance)">Account (Finance)</option>
                                </Form.Select>
                            </Col>

                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Label className="small fw-bold">Designation</Form.Label>
                                    <Form.Control
                                        size="sm"
                                        value={tempContact.role || ""}
                                        onChange={e => setTempContact({ ...tempContact, role: e.target.value })}
                                    />
                                </Col>

                                <Col md={4}>
                                    <Form.Label className="small fw-bold">Email Type</Form.Label>
                                    <Form.Control
                                        size="sm"
                                        value={tempContact.email_type || ""}
                                        onChange={(e) =>
                                            setTempContact({
                                                ...tempContact,
                                                email_type: e.target.value,
                                            })
                                        }
                                    />
                                </Col>

                                <Col md={4}>
                                    <Form.Label className="small fw-bold">Phone Type</Form.Label>
                                    <Form.Control
                                        size="sm"
                                        value={tempContact.phone_type || ""}
                                        onChange={(e) =>
                                            setTempContact({
                                                ...tempContact,
                                                phone_type: e.target.value,
                                            })
                                        }
                                    />
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Label className="small fw-bold">WhatsApp</Form.Label>
                                    <Form.Control
                                        size="sm"
                                        value={tempContact.whatsapp || ""}
                                        onChange={(e) =>
                                            setTempContact({
                                                ...tempContact,
                                                whatsapp: e.target.value,
                                            })
                                        }
                                    />
                                </Col>

                                <Col md={4}>
                                    <Form.Label className="small fw-bold">LinkedIn</Form.Label>
                                    <Form.Control
                                        size="sm"
                                        value={tempContact.linkedin_in || ""}
                                        onChange={(e) =>
                                            setTempContact({
                                                ...tempContact,
                                                linkedin_in: e.target.value,
                                            })
                                        }
                                    />
                                </Col>


                                <Col md={4}>
                                    <Form.Label className="small fw-bold">Preferred Contact Time</Form.Label>
                                    <Form.Control
                                        size="sm"
                                        value={tempContact.contact_time || ""}
                                        onChange={(e) =>
                                            setTempContact({
                                                ...tempContact,
                                                contact_time: e.target.value,
                                            })
                                        }
                                    />
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Label className="small fw-bold">Timezone</Form.Label>
                                    <Form.Control
                                        size="sm"
                                        value={tempContact.timezone || ""}
                                        onChange={(e) =>
                                            setTempContact({
                                                ...tempContact,
                                                timezone: e.target.value,
                                            })
                                        }
                                    />
                                </Col>

                                <Col md={6}>
                                    <Form.Label className="small fw-bold">Is Primary Contact</Form.Label>
                                    <Form.Select
                                        size="sm"
                                        value={tempContact.is_primary ? "primary" : "secondary"}
                                        onChange={e =>
                                            setTempContact({
                                                ...tempContact,
                                                is_primary: e.target.value === "primary",
                                            })
                                        }
                                    >
                                        <option value="primary">Primary</option>
                                        <option value="secondary">Secondary</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                        </Row>
                        <Row className="mb-3">
                            <Col md={4}><Form.Label className="small fw-bold">Email</Form.Label><Form.Control size="sm" value={tempContact.email} onChange={e => setTempContact({ ...tempContact, email: e.target.value })} /></Col>
                            <Col md={4}><Form.Label className="small fw-bold">Phone No.</Form.Label><Form.Control size="sm" value={tempContact.phone} onChange={e => setTempContact({ ...tempContact, phone: e.target.value })} /></Col>
                            <Col md={4}><Form.Label className="small fw-bold">Mobile No.</Form.Label><Form.Control size="sm" value={tempContact.mobile_no || ""} onChange={e => setTempContact({ ...tempContact, mobile_no: e.target.value })} /></Col>
                        </Row>
                        <Form.Group>
                            <Form.Label className="small fw-bold">Description</Form.Label>
                            <Form.Control as="textarea" rows={2} value={tempContact.description} onChange={e => setTempContact({ ...tempContact, description: e.target.value })} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Form.Check
                            type="switch"
                            id="contact-make-primary"
                            label="Make Primary"
                            checked={!!tempContact.is_primary}
                            onChange={(e) => setTempContact({ ...tempContact, is_primary: e.target.checked })}
                            className="me-auto"
                        />
                        <Button variant="secondary" size="sm" onClick={() => setShowContactModal(false)}>Cancel</Button>
                        <Button variant="primary" size="sm" onClick={handleSaveContact}>Save</Button>
                    </Modal.Footer>
                </Modal>

                {/* Warehouse Modal */}
                <Modal show={showWarehouseModal} onHide={() => setShowWarehouseModal(false)} centered size="lg">
                    <Modal.Header closeButton><Modal.Title className="h6 fw-bold">Vendor Details</Modal.Title></Modal.Header>
                    <Modal.Body className="px-4">
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Address Line 1</Form.Label>
                            <Form.Control size="sm" value={tempWarehouse.address_line1} onChange={e => setTempWarehouse({ ...tempWarehouse, address_line1: e.target.value })} />
                        </Form.Group>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Label className="small fw-bold">City</Form.Label>
                                <Form.Control size="sm" value={tempWarehouse.city} onChange={e => setTempWarehouse({ ...tempWarehouse, city: e.target.value })} />
                            </Col>
                            <Col md={6}>
                                <Form.Label className="small fw-bold">State</Form.Label>
                                <Form.Select size="sm" value={tempWarehouse.state_id} onChange={e => setTempWarehouse({ ...tempWarehouse, state_id: e.target.value })} disabled={!tempWarehouse.country_id}>
                                    <option value="">Select State</option>
                                    {warehouseStates.map(s => <option key={s.id} value={s.id}>{s.text}</option>)}
                                </Form.Select>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Label className="small fw-bold">Country</Form.Label>
                                <Form.Select size="sm" value={tempWarehouse.country_id} onChange={e => handleWarehouseCountryChange(e.target.value)}>
                                    <option value="">Select</option>
                                    {countries?.map(c => <option key={c.id} value={c.id}>{c.text}</option>)}
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                <Form.Label className="small fw-bold">ZIP Code</Form.Label>
                                <Form.Control size="sm" value={tempWarehouse.zip} onChange={e => setTempWarehouse({ ...tempWarehouse, zip: e.target.value })} />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" size="sm" onClick={() => setShowWarehouseModal(false)}>Cancel</Button>
                        <Button variant="primary" size="sm" onClick={handleSaveWarehouse}>Save Details</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default EditVendor;