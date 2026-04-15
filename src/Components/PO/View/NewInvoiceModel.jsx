import React, { useEffect, useState, useRef } from "react";
import { useMasterData } from "../../../Context/MasterDataProvider";
import { toast } from "react-hot-toast";
import { apiFetch } from "../../../Utils/apiFetch";
import { API_BASE, API_ENDPOINTS } from "../../../Config/api";
import DateInput from "../../Common/DateInput";
import formatCurrency, { formatToISODate } from "../../../Utils/utilFunctions";

const toDateOnly = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const formatLocalDate = (dateObj) => {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const addMonths = (dateValue, months) => {
  const d = new Date(dateValue);
  return new Date(d.getFullYear(), d.getMonth() + months, 1);
};

const lastDayOfMonth = (dateValue) => {
  const d = new Date(dateValue);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

const calculateDueDate = (invoiceDate, selectedTerm) => {
  const date = toDateOnly(invoiceDate);
  if (!date || !selectedTerm) return "";

  const termOption = String(selectedTerm.term_option || "frequency").trim();
  const key = String(selectedTerm.name || "").trim().toLowerCase();
  let result = null;

  if (termOption === "nextNextMonthLastDay" || key.includes("last day of next to next month") || key.includes("last date of next to next month") || key.includes("last day of next to next months")) {
    result = lastDayOfMonth(addMonths(date, 2));
  } else if (termOption === "nextMonthLastDay" || key.includes("last day of next month") || key.includes("last date of next month")) {
    result = lastDayOfMonth(addMonths(date, 1));
  } else if (termOption === "nextMonth14" || key.includes("14th of next month")) {
    const nextMonth = addMonths(date, 1);
    result = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 14);
  } else {
    const byFrequency = new Date(date);
    byFrequency.setDate(byFrequency.getDate() + Number(selectedTerm.frequency || 0));
    result = byFrequency;
  }

  return formatLocalDate(result);
};

const InvoiceModel = ({ poId, setShowModal, preferredPaymentId, onSuccess, maxInvoice, editData = null }) => {
  const isEdit = !!editData;
  const today = new Date().toLocaleDateString("en-CA");

  const invoiceNumberRef  = useRef(null);
  const invoiceDateRef    = useRef(null);
  const paymentStatusRef  = useRef(null);
  const { paymentTerms }  = useMasterData();

  const [formData, setFormData] = useState({
    invoice_number:    "",
    payment_status_id: "",
    invoice_date:      today,
    due_date:          "",
    payment_term_id:   "",
    invoice_amount:    null,
  });

  // Edit mode — pre-fill
  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        invoice_number:    editData.invoice_number    || "",
        invoice_date:      editData.invoice_date      || today,
        due_date:          editData.due_date          || "",
        payment_status_id: editData.payment_status_id || "",
        payment_term_id:   editData.payment_term_id   || "",
        invoice_amount:    editData.invoice_amount    || null,
      });
    }
  }, [poId, editData]);

  // Auto-set preferred payment term on create
  useEffect(() => {
    if (!isEdit && preferredPaymentId && paymentTerms?.length) {
      const selectedTerm = paymentTerms.find((t) => String(t.id) === String(preferredPaymentId));
      const newDueDate   = selectedTerm ? calculateDueDate(formData.invoice_date, selectedTerm) : "";
      //  type based auto status
      const autoStatus   = selectedTerm?.type === 1 ? "1"
                         : selectedTerm?.type === 2 ? "2"
                         : "";
      setFormData((prev) => ({
        ...prev,
        payment_term_id:   preferredPaymentId,
        due_date:          newDueDate,
        payment_status_id: autoStatus,
      }));
    }
  }, [preferredPaymentId, paymentTerms]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSaveInvoice = async () => {
    if (!formData.invoice_number.trim()) { toast.error("Invoice No required"); invoiceNumberRef.current?.focus(); return; }
    if (!formData.payment_term_id)       { toast.error("Payment term required"); return; }
    if (!formData.invoice_date)          { toast.error("Invoice date required"); invoiceDateRef.current?.focus?.(); return; }
    if (!formData.due_date)              { toast.error("Due date required"); return; }
    if (!formData.payment_status_id)     { toast.error("Payment status required"); paymentStatusRef.current?.focus(); return; }
    const selectedTerm = paymentTerms?.find((t) => String(t.id) === String(formData.payment_term_id));
    const expectedDueDate = selectedTerm ? calculateDueDate(formData.invoice_date, selectedTerm) : "";
    if (expectedDueDate && expectedDueDate !== formData.due_date) {
      toast.error(`Due date must be ${expectedDueDate} as per selected payment term`);
      return;
    }

    const payload = {
      po_id: poId,
      ...formData,
      invoice_date: formatToISODate(formData.invoice_date),
      due_date:     formatToISODate(formData.due_date),
    };

    try {
      const endpoint = isEdit
        ? `${API_ENDPOINTS.save_purchase_invocies}/${editData.po_invoice_id}`
        : API_ENDPOINTS.save_purchase_invocies;

      const response = await apiFetch(endpoint, {
        method: isEdit ? "PUT" : "POST",
        body:   JSON.stringify(payload),
      });

      if (response?.status) {
        toast.success(isEdit ? "Invoice updated" : "Invoice added successfully!");
        onSuccess?.();
      } else {
        toast.error(response?.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Error processing invoice");
    }
  };

  return (
    <React.Fragment>
      <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">

            <div className="modal-header">
              <h5 className="modal-title fw-bold">{isEdit ? "Edit " : "Add New "}Invoice</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>

            <div className="modal-body">

              {/* Row 1 — Invoice No, Payment Term, Payment Status */}
              <div className="row">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Invoice No <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    ref={invoiceNumberRef}
                    className="form-control"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Payment Term <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={formData.payment_term_id}
                    onChange={(e) => {
                      const termId       = e.target.value;
                      const selectedTerm = paymentTerms.find((t) => String(t.id) === String(termId));
                      const newDueDate   = selectedTerm
                        ? calculateDueDate(formData.invoice_date, selectedTerm)
                        : "";
                      //  Prepaid → Paid, Postpaid → Unpaid
                      const autoStatus   = selectedTerm?.type === 1 ? "1"
                                         : selectedTerm?.type === 2 ? "2"
                                         : formData.payment_status_id;
                      setFormData({
                        ...formData,
                        payment_term_id:   termId,
                        due_date:          newDueDate,
                        payment_status_id: autoStatus,
                      });
                    }}
                  >
                    <option value="">Select</option>
                    {paymentTerms?.map((term) => (
                      <option key={term.id} value={term.id}>{term.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">
                    Payment Status <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    ref={paymentStatusRef}
                    value={formData.payment_status_id}
                    onChange={(e) => setFormData({ ...formData, payment_status_id: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="1">Paid</option>
                    <option value="2">Unpaid</option>
                    <option value="4">On Hold</option>
                    <option value="3">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Row 2 — Invoice Date, Due Date, Invoice Total */}
              <div className="row mt-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Invoice Date</label>
                  <DateInput
                    value={formData.invoice_date}
                    ref={invoiceDateRef}
                    onChange={(value) => {
                      const selectedTerm = paymentTerms?.find((t) => String(t.id) === String(formData.payment_term_id));
                      //  frequency=0 ஆனாலும் same date return
                      const newDueDate   = selectedTerm
                        ? calculateDueDate(value, selectedTerm)
                        : formData.due_date;
                      setFormData({ ...formData, invoice_date: value, due_date: newDueDate });
                    }}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Due Date</label>
                  <DateInput
                    value={formData.due_date}
                    onChange={() => {}}
                    disabled
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Invoice Total Amount<span className="text-danger">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.invoice_amount}
                    min="0"
                    max={Number(maxInvoice)}
                    step="0.01"
                    onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (isNaN(val) || val < 0) { setFormData({ ...formData, invoice_amount: "" }); return; }
                      if (val > Number(maxInvoice)) { toast.error("Maximum amount is "+maxInvoice); return; }
                      setFormData({ ...formData, invoice_amount: val });
                    }}
                  />
                </div>
              </div>

            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-success px-3 me-3" onClick={handleSaveInvoice}>
                {isEdit ? "Update" : "Save"}
              </button>
            </div>

          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </React.Fragment>
  );
};

export default InvoiceModel;