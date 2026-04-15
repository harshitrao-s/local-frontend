import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Row, Col, FormGroup, Form } from 'react-bootstrap';
import { motion, AnimatePresence } from "framer-motion";
import DiaryInput from "../../../../Components/Common/DiaryInput";
import SearchableSelect from "../../../../Components/Common/SearchableSelect";
import { API_BASE } from "../../../../Config/api";
import { apiFetch } from "../../../../Utils/apiFetch";

const VendorPaymentForm = ({ data, onChange, paymentTerms, countries = [] }) => {
    const [activeView, setActiveView] = useState("bank_transfer");
    const [activePaymentTerms, setActivePaymentTerms] = useState([]);

    // ✅ Local state for bank fields — lag fix
    const [bankLocal, setBankLocal] = useState({
        bank_name: "",
        bank_account_holder_name: "",
        bank_ifsc: "",
        bank_account_number: "",
        bank_account_number_confirm: "",
        bank_country: "",
    });

    // Sync local state whenever parent data changes (e.g., after edit API fetch).
    useEffect(() => {
        setBankLocal({
            bank_name: data.bank_name || "",
            bank_account_holder_name: data.bank_account_holder_name || "",
            bank_ifsc: data.bank_ifsc || "",
            bank_account_number: data.bank_account_number || "",
            bank_account_number_confirm: data.bank_account_number_confirm || "",
            bank_country: data.bank_country || "",
        });
    }, [
        data.bank_name,
        data.bank_account_holder_name,
        data.bank_ifsc,
        data.bank_account_number,
        data.bank_account_number_confirm,
        data.bank_country,
    ]);

    // Push local → parent only on blur (no lag while typing)
    const flushBankField = useCallback((field, value) => {
        onChange((prev) => ({ ...prev, [field]: value }));
    }, [onChange]);

    const updateField = useCallback((field, value) => {
        onChange((prev) => ({ ...prev, [field]: value }));
    }, [onChange]);

    useEffect(() => {
        if (Array.isArray(data.mode_of_payment)) {
            const needsCleaning = data.mode_of_payment.some(item => item.includes("'") || item.includes("["));
            if (needsCleaning) {
                const cleanedArray = data.mode_of_payment
                    .join(",")
                    .replace(/[[\]']/g, "")
                    .split(",")
                    .map(s => s.trim())
                    .filter(Boolean);
                updateField('mode_of_payment', cleanedArray);
            }
        }
    }, [data.mode_of_payment, updateField]);

    // Default selection should be Bank Transfer when no payment method is set.
    useEffect(() => {
        if (!Array.isArray(data.mode_of_payment) || data.mode_of_payment.length === 0) {
            updateField("mode_of_payment", ["bank_transfer"]);
        }
    }, [data.mode_of_payment, updateField]);

    useEffect(() => {
        if (data.wallet_type && typeof data.wallet_type === "string") {
            const cleanWallets = data.wallet_type.replace(/[[\]']/g, "").split(",").map(s => s.trim()).filter(Boolean);
            updateField('wallet_type', cleanWallets);
        }
    }, [data.wallet_type, updateField]);

    const paymentModes = [
        { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
        { id: 'paypal', label: 'PayPal', icon: '🅿️' },
        { id: 'credit_card', label: 'Credit Card', icon: '💳' },
        { id: 'wallet', label: 'Wallet', icon: '👜' }
    ];

    const toggleMode = (modeId) => {
        let current = [...(data.mode_of_payment || [])]; 
        let updatedData = { ...data };

        if (current.includes(modeId)) {
            current = current.filter(m => m !== modeId);
            if (modeId === 'paypal') {
                updatedData.paypal_notes = "";
            } else if (modeId === 'bank_transfer') {
                const cleared = { bank_name: "", bank_account_holder_name: "", bank_ifsc: "", bank_account_number: "", bank_account_number_confirm: "", bank_country: "" };
                updatedData = { ...updatedData, ...cleared };
                setBankLocal(cleared);
            } else if (modeId === 'credit_card') {
                updatedData.credit_card_notes = "";
            } else if (modeId === 'wallet') {
                updatedData.wallet_notes = "";
            }
        } else {
            current.push(modeId);
        }
        
        onChange({ ...updatedData, mode_of_payment: current });
    };

    const isEnabled = (modeId) => {
        return Array.isArray(data.mode_of_payment) && data.mode_of_payment.includes(modeId);
    };

    const countryOptions = useMemo(
        () => (countries || []).map((c) => c?.text).filter(Boolean),
        [countries]
    );

    useEffect(() => {
        let mounted = true;
        const loadActiveTerms = async () => {
            try {
                const res = await apiFetch(`${API_BASE}api/payment-terms?page=1&size=500`);
                const rows = Array.isArray(res?.data) ? res.data : [];
                const activeOnly = rows.filter((row) => {
                    const normalized = String(row?.status ?? "").trim().toLowerCase();
                    return normalized === "active" || normalized === "1";
                });
                if (mounted) setActivePaymentTerms(activeOnly);
            } catch (_) {
                if (mounted) setActivePaymentTerms([]);
            }
        };
        loadActiveTerms();
        return () => { mounted = false; };
    }, []);

    return (
        <Row className="g-0 pb-3 rounded m-2 shadow-sm border">
            {/* LEFT SIDEBAR */}
            <Col md={3} className="bg-light border-end p-2" style={{ minHeight: '550px' }}>
                <div className="p-2 mb-3 border-bottom">
                    <FormGroup>
                        <Form.Label className="small fw-bold text-uppercase text-muted">Payment Term</Form.Label>
                        <Form.Select
                            size="sm"
                            value={data.payment_term || ""}
                            onChange={(e) => updateField('payment_term', e.target.value)}
                        >
                            <option value="">Select Term</option>
                            {activePaymentTerms?.map(pt => (
                                <option key={pt.id} value={pt.id}>{pt.name}</option>
                            ))}
                        </Form.Select>
                    </FormGroup>
                </div>

                <h6 className="small fw-bold text-muted ps-2 text-uppercase mb-3">PAYMENT Methods</h6>
                <div className="d-flex flex-column gap-1">
                    {paymentModes.map((mode) => (
                        <div 
                            key={mode.id}
                            className={`d-flex align-items-center px-2 py-1 rounded border transition-all ${
                                activeView === mode.id ? 'bg-white border-primary shadow-sm' : 'bg-transparent border-light'
                            }`}
                            onClick={() => setActiveView(mode.id)}
                            style={{ cursor: 'pointer', fontSize: '13px' }}
                        > 
                            <div className="icheck-primary d-inline me-2" onClick={(e) => e.stopPropagation()}>
                                <input 
                                    type="checkbox" 
                                    id={`check_${mode.id}`} 
                                    checked={isEnabled(mode.id)}
                                    onChange={() => toggleMode(mode.id)}
                                    style={{ transform: 'scale(0.8)' }}
                                />
                                <label htmlFor={`check_${mode.id}`}></label>
                            </div>
                            <div className="d-flex align-items-center justify-content-between w-100">
                                <span className={activeView === mode.id ? 'fw-bold text-primary' : 'text-secondary'}>
                                    {mode.label}
                                </span>
                                {isEnabled(mode.id) && (
                                    <i className="fa fa-check-circle text-success ms-1" style={{ fontSize: '11px' }}></i>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Col>

            {/* RIGHT SIDE */}
            <Col md={9} className="p-4 bg-white">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeView}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{ opacity: isEnabled(activeView) ? 1 : 0.4, pointerEvents: isEnabled(activeView) ? 'all' : 'none' }}
                    >
                        <h6 className="fw-bold mb-4 text-primary text-uppercase border-bottom pb-2">
                            Configuring {activeView.replace('_', ' ')}
                        </h6>

                        {/* 1. BANK TRANSFER */}
                        {activeView === 'bank_transfer' && (
                            <Row>
                                <Col md={6}>
                                    <FormGroup className="mb-3">
                                        <Form.Label className="small fw-bold">Bank Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            size="sm"
                                            // ✅ value → local state, onBlur → parent sync
                                            value={bankLocal.bank_name}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setBankLocal(p => ({ ...p, bank_name: val }));
                                                flushBankField('bank_name', val);
                                            }}
                                            onBlur={(e) => flushBankField('bank_name', e.target.value)}
                                        />
                                    </FormGroup>
                                    <FormGroup className="mb-3">
                                        <Form.Label className="small fw-bold">Bank Account Holder Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            size="sm"
                                            value={bankLocal.bank_account_holder_name}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setBankLocal(p => ({ ...p, bank_account_holder_name: val }));
                                                flushBankField('bank_account_holder_name', val);
                                            }}
                                            onBlur={(e) => flushBankField('bank_account_holder_name', e.target.value)}
                                        />
                                    </FormGroup>
                                    <FormGroup className="mb-3">
                                        <Form.Label className="small fw-bold">Bank Account Number <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            size="sm"
                                            maxLength={23}
                                            value={bankLocal.bank_account_number}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (/^[a-zA-Z0-9]*$/.test(val)) {
                                                    setBankLocal(p => ({ ...p, bank_account_number: val }));
                                                    flushBankField('bank_account_number', val);
                                                }
                                            }}
                                            onBlur={(e) => flushBankField('bank_account_number', e.target.value)}
                                        />
                                        <Form.Text className="text-muted">Max 23 characters. Letters and numbers only.</Form.Text>
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup className="mb-3">
                                        <Form.Label className="small fw-bold">BSB / IFSC / SWIFT Code <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            size="sm"
                                            value={bankLocal.bank_ifsc}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setBankLocal(p => ({ ...p, bank_ifsc: val }));
                                                flushBankField('bank_ifsc', val);
                                            }}
                                            onBlur={(e) => flushBankField('bank_ifsc', e.target.value)}
                                        />
                                    </FormGroup>
                                    <FormGroup className="mb-3">
                                        <Form.Label className="small fw-bold">Bank Country</Form.Label>
                                          <SearchableSelect
                                            name="bank_country"
                                            options={countryOptions.map((c) => ({ country: c }))}
                                            value={bankLocal.bank_country}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setBankLocal((p) => ({ ...p, bank_country: val }));
                                                updateField('bank_country', val);
                                            }}
                                            onBlur={(e) => flushBankField('bank_country', e.target.value)}
                                            labelKey="country"
                                            valueKey="country"
                                            unique={true}
                                            placeholder="Search country..."
                                            renderLabel={(v) => (
                                                <div className="w-100">
                                                    <span className="fw-bold">{v.country}</span>
                                                </div>
                                            )}
                                        />
                                    </FormGroup>
                                    <FormGroup className="mb-3">
                                        <Form.Label className="small fw-bold">Re-enter Account Number <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            size="sm"
                                            maxLength={23}
                                            value={bankLocal.bank_account_number_confirm}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (/^[a-zA-Z0-9]*$/.test(val)) {
                                                    setBankLocal(p => ({ ...p, bank_account_number_confirm: val }));
                                                    flushBankField('bank_account_number_confirm', val);
                                                }
                                            }}
                                            onBlur={(e) => flushBankField('bank_account_number_confirm', e.target.value)}
                                            isInvalid={!!bankLocal.bank_account_number_confirm && bankLocal.bank_account_number_confirm !== bankLocal.bank_account_number}
                                        />
                                        <Form.Control.Feedback type="invalid">Account numbers do not match.</Form.Control.Feedback>
                                    </FormGroup>
                                    <FormGroup className="mb-3 d-none">
                                        <Form.Label className="small fw-bold">Verification Doc</Form.Label>
                                        <div className="d-flex flex-column gap-2">
                                            <Form.Control 
                                                key={data.bank_verification_doc ? 'has-data' : 'empty'}
                                                size="sm" 
                                                type="file" 
                                                onChange={(e) => updateField('bank_verification_doc', e.target.files[0])} 
                                            />
                                            {data.bank_verification_doc && (
                                                <div className="d-flex align-items-center bg-light border rounded px-2 py-1" style={{ width: 'fit-content' }}>
                                                    {typeof data.bank_verification_doc === 'string' ? (
                                                        <a href={data.bank_verification_doc} target="_blank" rel="noopener noreferrer" className="small text-decoration-none me-2">
                                                            <i className="bi bi-file-earmark-pdf me-1"></i>View Current
                                                        </a>
                                                    ) : (
                                                        <span className="small text-success me-2">
                                                            <i className="bi bi-file-earmark-plus me-1"></i>
                                                            {data.bank_verification_doc.name.substring(0, 15)}...
                                                        </span>
                                                    )}
                                                    <span 
                                                        onClick={() => updateField('bank_verification_doc', "")}
                                                        className="text-danger fw-bold"
                                                        style={{ cursor: 'pointer', fontSize: '1.1rem', lineHeight: '1' }}
                                                        title="Remove document"
                                                    >
                                                        &times;
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </FormGroup>
                                </Col>
                            </Row>
                        )}

                        {/* 2. PAYPAL */}
                        {activeView === 'paypal' && (
                            <Row>
                                <DiaryInput value={data.paypal_notes} onChange={(value) => updateField('paypal_notes', value)}/>
                            </Row>
                        )}

                        {/* 3. CREDIT CARD */}
                        {activeView === 'credit_card' && (
                            <Row>
                                <DiaryInput value={data.credit_card_notes} onChange={(value) => updateField('credit_card_notes', value)}/>
                            </Row>
                        )}

                        {/* 4. WALLET */}
                        {activeView === 'wallet' && (
                            <Row>
                                <DiaryInput value={data.wallet_notes} onChange={(value) => updateField('wallet_notes', value)}/>
                            </Row>
                        )}
                    </motion.div>
                </AnimatePresence>
            </Col>
        </Row>
    );
};

export default VendorPaymentForm;