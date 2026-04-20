import React, { useEffect, useState, useRef, useCallback } from "react";
import { API_BASE } from "../../../Config/api";
import { apiFetch } from "../../../Utils/apiFetch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListUl, faCircleExclamation, faChevronRight, faChevronDown,
  faBuilding, faFileInvoiceDollar, faBoxOpen, faSearch, faTimes,
  faCreditCard, faMoneyBillWave, faXmark, faCalendarAlt, faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import formatCurrency, { formattedDate } from "../../../Utils/utilFunctions";
import DateRangeInput from "../../../Components/Common/DateRangeInput";
import { useMasterData } from "../../../Context/MasterDataProvider";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════ */
const CSS = `
  .pil { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }

  /* stat cards */
  .pil-stat { border-radius:16px!important;border:none!important;transition:transform .15s,box-shadow .15s; }
  .pil-icon-box { width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:15px; }
  .pil-card { border-radius:16px;border:1px solid #e8eaf0;overflow:visible;box-shadow:0 1px 4px rgba(0,0,0,.06); }

  /* ─── table ─── */
  .pil-tbl { width:100%;border-collapse:collapse;font-size:13px; }
  .pil-tbl thead th {
    background:#f8f9fb;color:#6b7280;font-weight:700;font-size:11px;
    text-transform:uppercase;letter-spacing:.7px;padding:10px 14px;
    border-bottom:1px solid #e8eaf0;white-space:nowrap;
    cursor:pointer;user-select:none;
  }
  .pil-tbl thead th:hover { background:#f1f3f7;color:#374151; }
  .pil-tbl thead th.th-on { color:#4f46e5; }

  /* ─── L0 vendor row ─── */
  .rv { border-bottom:1px solid #e8eaf0; }
  .rv-inner {
    display:grid;
    grid-template-columns:26px 32px 1fr auto;
    align-items:center;gap:0;padding:13px 16px;
    cursor:pointer;transition:background .12s;
  }
  .rv-inner:hover { background:#f5f6ff; }
  .rv.rv-open .rv-inner { background:#eff0ff; border-bottom:1px solid #ddd8ff; }

  /* ─── L1 invoice section (inside vendor) ─── */
  .inv-section {
    background:#fafbff;border-bottom:2px solid #e8eaf0;
    padding:0;
  }

  /* invoice list table inside vendor */
  .inv-tbl { width:100%;border-collapse:collapse; }
  .inv-tbl-head {
    display:grid;
    grid-template-columns:36px 16px 1fr 90px 90px 90px 110px 90px 50px;
    padding:7px 16px 7px 52px;
    background:#f0f1ff;border-bottom:1px solid #e0e0f0;
    font-size:10px;font-weight:700;
    letter-spacing:.7px;text-transform:uppercase;color:#818cf8;
  }

  .inv-row {
    display:grid;
    grid-template-columns:36px 16px 1fr 90px 90px 90px 110px 90px 50px;
    align-items:center;padding:9px 16px 9px 52px;
    border-bottom:1px solid #f0f0f8;
    transition:background .1s;cursor:pointer;
  }
  .inv-row:last-child { border-bottom:none; }
  .inv-row:hover { background:#ede9ff22; }
  .inv-row.inv-sel { background:#f3f0ff; }
  .inv-row.inv-paid { opacity:.65;cursor:default; }

  /* ─── L2 line-items ─── */
  .li-section { background:#f4f5ff;border-top:1px dashed #ddd8f8; }
  .li-head {
    display:grid;grid-template-columns:1fr 70px 110px 110px;
    padding:5px 16px 5px 72px;
    font-size:10px;font-weight:700;letter-spacing:.6px;
    text-transform:uppercase;color:#a5b4fc;
    border-bottom:1px solid #e4e0f8;
  }
  .li-row {
    display:grid;grid-template-columns:1fr 70px 110px 110px;
    padding:7px 16px 7px 72px;
    font-size:12px;border-bottom:1px solid #eceaf8;
    align-items:center;
  }
  .li-row:last-child { border-bottom:none; }

  /* ─── Pay summary footer inside vendor ─── */
  .pay-footer {
    display:flex;align-items:center;justify-content:space-between;
    padding:12px 16px 12px 52px;
    background:linear-gradient(90deg,#faf9ff 0%,#f3f0ff 100%);
    border-top:1.5px solid #ddd8ff;
    gap:12px;
  }
  .pay-footer-invoices { display:flex;gap:6px;flex-wrap:wrap;flex:1; }
  .pay-chip {
    display:inline-flex;align-items:center;gap:4px;
    padding:3px 9px;background:#ede9fe;color:#6d28d9;
    border-radius:20px;font-size:11px;font-weight:600;
  }
  .pay-chip-x { background:none;border:none;padding:0;cursor:pointer;color:#a78bfa;line-height:1;display:flex; }
  .pay-chip-x:hover { color:#b91c1c; }
  .pay-footer-right { display:flex;align-items:center;gap:16px;flex-shrink:0; }
  .pay-total-lbl { font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px; }
  .pay-total-amt { font-size:20px;font-weight:800;color:#4f46e5;font-variant-numeric:tabular-nums;letter-spacing:-.5px;white-space:nowrap; }
  .btn-pay {
    background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);
    color:#fff;border:none;border-radius:10px;
    padding:10px 22px;font-size:13px;font-weight:700;
    cursor:pointer;display:flex;align-items:center;gap:7px;
    box-shadow:0 4px 14px rgba(109,40,217,.35);
    transition:opacity .15s,transform .1s;white-space:nowrap;
  }
  .btn-pay:hover { opacity:.9;transform:translateY(-1px); }
  .btn-pay:active { transform:scale(.97); }
  .pay-footer-anim { animation:pf-in .2s ease; }
  @keyframes pf-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  /* ─── chevron ─── */
  .chev {
    width:20px;height:20px;border-radius:5px;
    display:flex;align-items:center;justify-content:center;
    color:#9ca3af;font-size:11px;flex-shrink:0;transition:background .12s;
  }
  .chev:hover { background:#e5e7eb; }
  .chev.chev-on { color:#4f46e5;background:#ede9ff; }

  /* ─── custom checkbox ─── */
  .pcb {
    width:16px;height:16px;border-radius:4px;
    border:2px solid #d1d5db;background:#fff;
    display:flex;align-items:center;justify-content:center;
    flex-shrink:0;transition:border-color .12s,background .12s;cursor:pointer;
  }
  .pcb.pcb-on { border-color:#7c3aed;background:#7c3aed; }
  .pcb.pcb-dis { opacity:.3;cursor:not-allowed; }

  /* ─── badges ─── */
  .bst { display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.3px; }
  .b-paid    { background:#dcfce7;color:#15803d; }
  .b-unpaid  { background:#fee2e2;color:#b91c1c; }
  .b-pending { background:#fef9c3;color:#92400e; }
  .b-overdue { background:#f3f4f6;color:#6b7280; }
  .b-hold    { background:#fef3c7;color:#d97706; }

  .vchip { display:inline-block;padding:1px 7px;background:#f0f0f5;color:#6b7280;border-radius:6px;font-size:11px;margin-left:6px; }

  /* ─── skeleton ─── */
  .skel { background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);background-size:200% 100%;animation:sk 1.4s infinite;border-radius:4px; }
  @keyframes sk { to { background-position:-200% 0; } }

  /* ─── pagination ─── */
  .pager { display:flex;align-items:center;gap:4px; }
  .ppage { width:30px;height:30px;border:none;background:none;border-radius:7px;font-size:12px;cursor:pointer;color:#6b7280;transition:background .1s; }
  .ppage:hover { background:#f0f0f5;color:#111; }
  .ppage.pp-on { background:#4f46e5;color:#fff;font-weight:700; }
  .ppage:disabled { opacity:.35;cursor:default; }

  .pil-empty { text-align:center;padding:48px 0;color:#9ca3af;font-size:13px; }

  /* ─── DateRangePicker input size fix ─── */
  .pil .daterangepicker-input input,
  .pil .form-control.form-control-sm {
    height:31px !important;
    padding-top:4px !important;
    padding-bottom:4px !important;
    font-size:13px !important;
    line-height:1.4 !important;
  }

  /* ─── modal ─── */
  .pil-overlay {
    position:fixed;inset:0;background:rgba(17,24,39,.45);
    z-index:9999;animation:ov-in .2s;
  }
  @keyframes ov-in { from{opacity:0} to{opacity:1} }
  .pil-modal {
    position:fixed;top:0;right:0;bottom:0;
    width:100%;max-width:460px;
    background:#fff;
    box-shadow:-8px 0 40px rgba(0,0,0,.15);
    display:flex;flex-direction:column;
    animation:drawer-in .26s cubic-bezier(.4,0,.2,1);
    z-index:10000;
  }
  @keyframes drawer-in { from{transform:translateX(100%)} to{transform:translateX(0)} }
  .mo-hd {
    padding:20px 24px 16px;
    display:flex;align-items:flex-start;justify-content:space-between;
    border-bottom:1px solid #f0f0f5;flex-shrink:0;
  }
  .mo-close { background:none;border:none;cursor:pointer;color:#9ca3af;padding:4px;border-radius:7px;line-height:1;font-size:16px; }
  .mo-close:hover { background:#f3f4f6;color:#374151; }
  .mo-body { padding:20px 24px;overflow-y:auto;flex:1; }

  .mo-inv-list { max-height:160px;overflow-y:auto;border:1px solid #e8eaf0;border-radius:10px;margin-bottom:18px; }
  .mo-inv-row {
    display:flex;align-items:center;justify-content:space-between;
    padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;
  }
  .mo-inv-row:last-child { border-bottom:none; }
  .mo-inv-row:hover { background:#fafbff; }

  .mo-total-band {
    background:linear-gradient(135deg,#f3f0ff,#e8eaff);
    border-radius:12px;padding:12px 16px;
    display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;
  }
  .mo-total-band .lbl { font-size:11px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:.5px; }
  .mo-total-band .amt { font-size:22px;font-weight:800;color:#4f46e5;font-variant-numeric:tabular-nums; }

  .pil-lbl { font-size:11px;font-weight:700;color:#9ca3af;letter-spacing:.5px;text-transform:uppercase;margin-bottom:5px;display:block; }
  .pil-inp { width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:8px 11px;font-size:13px;outline:none;box-sizing:border-box;transition:border-color .15s; }
  .pil-inp:focus { border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.1); }
  select.pil-inp { appearance:none;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239ca3af'/%3E%3C/svg%3E") no-repeat right 10px center;padding-right:28px; }

  .btn-confirm { background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border:none;border-radius:9px;padding:9px 22px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:7px;transition:opacity .15s; }
  .btn-confirm:hover { opacity:.9; }
  .btn-secondary { background:#f3f4f6;color:#374151;border:none;border-radius:9px;padding:9px 16px;font-size:13px;font-weight:600;cursor:pointer; }
  .btn-secondary:hover { background:#e5e7eb; }
`;


/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const BADGE_MAP = { 1: "paid", 2: "unpaid", 3: "pending", 4: "Cancelled", 4: "On Hold" };
const STATUS_LABEL = {
  1: "Paid",
  2: "Unpaid",
  3: "Pending",
  4: "On Hold",
};
const StatusBadge = ({ s }) => (
  <span className={`bst b-${BADGE_MAP[s] ?? "overdue"}`}>
    {STATUS_LABEL[s] ?? s}
  </span>
);
const SortArrow = ({ field, sortBy, sortDir }) => {
  const on = sortBy === field;
  return <span style={{ opacity: on ? 1 : .3, marginLeft: 3, fontSize: 9, color: on ? "#4f46e5" : "inherit" }}>{on ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</span>;
};

/* ═══════════════════════════════════════════════════════════
   STAT CARDS
═══════════════════════════════════════════════════════════ */
const STAT_CFG = [
  { key: "total_vendors", label: "Vendors Due Today", icon: "fas fa-store", bg: "#ede9fe", col: "#7c3aed", isCurrency: false, showSub: false },
  { key: "total_due", label: "Total Due Amount", icon: "fas fa-money-bill-wave", bg: "#dcfce7", col: "#15803d", isCurrency: true, showSub: true },
  { key: "total_invoices", label: "Total Invoices", icon: "fas fa-file-invoice-dollar", bg: "#fee2e2", col: "#b91c1c", isCurrency: false, showSub: false },
  { key: "overdue", label: "Overdue", icon: "fas fa-clock", bg: "#fef9c3", col: "#a16207", isCurrency: false, showSub: true },
];
function StatCard({ cfg, summary }) {
  const val = summary?.[cfg.key];
  return (
    <div className="card pil-stat shadow-sm h-100" style={{ padding: "16px 18px" }}>
      <div className="d-flex justify-content-between align-items-start">
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#9ca3af", marginBottom: 6 }}>{cfg.label}</p>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 4, fontVariantNumeric: "tabular-nums" }}>
            {cfg.isCurrency ? formatCurrency(val?.amount ?? 0) : (val?.count ?? val ?? 0)}
          </div>
          {cfg.showSub && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {cfg.isCurrency && (
                <span style={{ fontSize: 11, background: "#f3f4f6", color: "#6b7280", padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>
                  {val?.count ?? 0} invoices
                </span>
              )}
              {!cfg.isCurrency && val?.amount != null && (
                <span style={{ fontSize: 11, background: "#f3f4f6", color: "#6b7280", padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>
                  {formatCurrency(val.amount)}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="pil-icon-box" style={{ background: cfg.bg }}>
          <i className={cfg.icon} style={{ color: cfg.col }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAYMENT MODAL
═══════════════════════════════════════════════════════════ */
function PaymentModal({ invoices, vendorName, vendorData, onClose, onConfirm }) {
  const total = invoices.reduce((s, inv) => s + inv.invoice_amount, 0);
  const availableMethods = vendorData?.mode_of_payment?.length
    ? vendorData.mode_of_payment
    : ["Bank Transfer"];

  const [form, setForm] = useState({
    payment_date: new Date().toISOString().split("T")[0],
    payment_mode: availableMethods[0],
    surcharge: "",
    conversion_charge: "",
    notes: "",
    // Bank Transfer
    bank_name: "",
    account_number: "",
    reference_number: "",
    transaction_date: "",
    // Credit Card
    card_holder: "",
    card_number: "",
    expiry: "",
    cvv: "",
    // Wallet / Paypal
    wallet_confirmation: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const isBank = form.payment_mode === "Bank Transfer";
  const isCard = form.payment_mode === "Credit Card";
  const isWallet = ["Wallet", "Paypal"].includes(form.payment_mode);

  return (
    <>
      <div className="pil-overlay" onClick={onClose} />
      <div className="pil-modal">

        {/* header */}
        <div className="mo-hd">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#ede9fe,#e0e7ff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FontAwesomeIcon icon={faCreditCard} style={{ fontSize: 16, color: "#7c3aed" }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Record Payment</div>
              {vendorName && <div style={{ fontSize: 11, color: "#9ca3af" }}>{vendorName}</div>}
            </div>
          </div>
          <button className="mo-close" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* body */}
        <div className="mo-body">

          {/* invoice list */}
          <div className="mo-inv-list">
            {invoices.map(inv => (
              <div key={inv.po_invoice_id} className="mo-inv-row">
                <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <FontAwesomeIcon icon={faFileInvoiceDollar} style={{ fontSize: 11, color: "#818cf8" }} />
                  <span style={{ fontWeight: 600, color: "#4f46e5" }}>{inv.invoice_number}</span>
                  <StatusBadge s={inv.invoice_payment_status} />
                </span>
                <span style={{ fontWeight: 700, color: "#111827", fontVariantNumeric: "tabular-nums" }}>
                  {formatCurrency(inv.invoice_amount)}
                </span>
              </div>
            ))}
          </div>

          {/* total band */}
          <div className="mo-total-band">
            <span className="lbl">Total Payable</span>
            <span className="amt">{formatCurrency(total + (parseFloat(form.surcharge) || 0))}</span>
          </div>

          {/* date + surcharge */}
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="pil-lbl">
                <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: 4 }} />
                Payment Date
              </label>
              <input type="date" className="pil-inp" value={form.payment_date}
                onChange={e => set("payment_date", e.target.value)} />
            </div>
            <div className="col-6">
              <label className="pil-lbl">Surcharge</label>
              <input type="number" className="pil-inp" placeholder="0.00"
                value={form.surcharge} onChange={e => set("surcharge", e.target.value)} />
            </div>
            <div className="col-12">
              <label className="pil-lbl">Currency Conversion Charge</label>
              <input type="number" className="pil-inp" placeholder="0.00"
                value={form.conversion_charge} onChange={e => set("conversion_charge", e.target.value)} />
            </div>
          </div>

          {/* payment mode tabs */}
          <div className="mb-3">
            <label className="pil-lbl">Payment Mode</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {availableMethods.map(m => (
                <button key={m} type="button"
                  onClick={() => set("payment_mode", m)}
                  style={{
                    padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", transition: "all .15s",
                    border: form.payment_mode === m ? "2px solid #7c3aed" : "1.5px solid #e5e7eb",
                    background: form.payment_mode === m ? "#ede9fe" : "#fff",
                    color: form.payment_mode === m ? "#7c3aed" : "#6b7280",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* ── Bank Transfer ── */}
          {isBank && (
            <>
              <div className="mb-3">
                <label className="pil-lbl">Bank Name</label>
                <input type="text" className="pil-inp" placeholder="e.g. ANZ Bank"
                  value={form.bank_name} onChange={e => set("bank_name", e.target.value)} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="pil-lbl">Account Number</label>
                  <input type="text" className="pil-inp" placeholder="Account No."
                    value={form.account_number} onChange={e => set("account_number", e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="pil-lbl">Reference Number</label>
                  <input type="text" className="pil-inp" placeholder="TXN-001"
                    value={form.reference_number} onChange={e => set("reference_number", e.target.value)} />
                </div>
              </div>
              <div className="mb-3">
                <label className="pil-lbl">Transaction Date</label>
                <input type="date" className="pil-inp"
                  value={form.transaction_date} onChange={e => set("transaction_date", e.target.value)} />
              </div>
            </>
          )}

          {/* ── Credit Card ── */}
          {isCard && (
            <>
              <div className="mb-3">
                <label className="pil-lbl">Card Holder Name</label>
                <input type="text" className="pil-inp" placeholder="John Smith"
                  value={form.card_holder} onChange={e => set("card_holder", e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="pil-lbl">Card Number</label>
                <input type="text" className="pil-inp" placeholder="•••• •••• •••• ••••"
                  maxLength={19} value={form.card_number}
                  onChange={e => set("card_number", e.target.value)} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="pil-lbl">Expiry Date</label>
                  <input type="text" className="pil-inp" placeholder="MM/YY"
                    maxLength={5} value={form.expiry}
                    onChange={e => set("expiry", e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="pil-lbl">CVV</label>
                  <input type="password" className="pil-inp" placeholder="•••"
                    maxLength={4} value={form.cvv}
                    onChange={e => set("cvv", e.target.value)} />
                </div>
              </div>
            </>
          )}

          {/* ── Wallet / Paypal ── */}
          {isWallet && (
            <div className="mb-3">
              <label className="pil-lbl">Confirmation ID</label>
              <input type="text" className="pil-inp" placeholder="Wallet / Paypal Confirmation"
                value={form.wallet_confirmation}
                onChange={e => set("wallet_confirmation", e.target.value)} />
            </div>
          )}

          {/* notes */}
          <div>
            <label className="pil-lbl">
              <FontAwesomeIcon icon={faStickyNote} style={{ marginRight: 4 }} />
              Notes
            </label>
            <textarea className="pil-inp" rows={3} placeholder="Optional remarks…"
              style={{ resize: "none" }} value={form.notes}
              onChange={e => set("notes", e.target.value)} />
          </div>
        </div>

        {/* footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f5", display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0, background: "#fff" }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-confirm"
            onClick={() => onConfirm({ ...form, invoices, total })}>
            <FontAwesomeIcon icon={faMoneyBillWave} />
            Confirm · {formatCurrency(
              total +
              (parseFloat(form.surcharge) || 0) +
              (parseFloat(form.conversion_charge) || 0)
            )}
          </button>
        </div>
      </div>
    </>
  );
}
/* ═══════════════════════════════════════════════════════════
   L2 — LINE ITEMS  (inside invoice expand)
═══════════════════════════════════════════════════════════ */
function LineItems({ lines }) {
  if (!lines?.length) return (
    <div className="li-section" style={{ padding: "10px 16px 10px 72px", color: "#9ca3af", fontSize: 12, fontStyle: "italic" }}>
      No line items.
    </div>
  );
  return (
    <div className="li-section">
      <div className="li-head">
        <span>Description</span>
        <span style={{ textAlign: "right" }}>Qty</span>
        <span style={{ textAlign: "right" }}>Unit Price</span>
        <span style={{ textAlign: "right" }}>Total</span>
      </div>
      {lines.map(l => (
        <div key={l.id} className="li-row">
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#374151" }}>
            <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: 10, color: "#a5b4fc", flexShrink: 0 }} />
            {l.product_name}
          </span>
          <span style={{ textAlign: "right", color: "#6b7280" }}>{l.received_qty}</span>
          <span style={{ textAlign: "right", color: "#6b7280", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(l.price)}</span>
          <span style={{ textAlign: "right", fontWeight: 600, color: "#374151", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(l.line_total)}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   L1 — INVOICE ROW inside vendor section
═══════════════════════════════════════════════════════════ */
function InvoiceRow({ inv, checked, onCheck }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* main invoice row */}
      <div
        className={`inv-row ${checked ? "inv-sel" : ""}`}
        onClick={() => onCheck(inv)}
      >
        {/* checkbox */}
        <span
          className={`pcb ${checked ? "pcb-on" : ""}`}
          onClick={e => { e.stopPropagation(); onCheck(inv); }}
        >
          {checked && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span />
        {/* invoice number */}
        <span style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden" }}>
          <FontAwesomeIcon icon={faFileInvoiceDollar} style={{ fontSize: 11, color: "#818cf8", flexShrink: 0 }} />
          <span style={{ fontWeight: 700, color: "#4f46e5", fontSize: 12, whiteSpace: "nowrap" }}>{inv.invoice_number}</span>
        </span>

        {/* PO number */}
        <span style={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap" }}>
          {inv.po_number ?? "—"}
        </span>

        {/* invoice date */}
        <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
          {formattedDate(inv.invoice_date)}
        </span>

        {/* due date */}
        <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
          {formattedDate(inv.invoice_due_date)}
        </span>

        {/* amount */}
        <span style={{ textAlign: "right", fontWeight: 700, color: "#111827", fontVariantNumeric: "tabular-nums", paddingRight: 6 }}>
          {formatCurrency(inv.invoice_amount)}
        </span>

        {/* status */}
        <span style={{ textAlign: "center" }}>
          <StatusBadge s={inv.invoice_payment_status} />
        </span>

        {/* expand lines toggle */}
        <span
          style={{ display: "flex", justifyContent: "center" }}
          onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        >
          <span className={`chev ${open ? "chev-on" : ""}`}>
            <FontAwesomeIcon icon={open ? faChevronDown : faChevronRight} style={{ fontSize: 9 }} />
          </span>
        </span>
      </div>

      {/* L2 line items */}
      {open && <LineItems lines={inv.receipt_products} />}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   L0 — VENDOR ROW  (real API data)
═══════════════════════════════════════════════════════════ */
function VendorRow({ row, onPay }) {
  const [open, setOpen] = useState(false);
  const [selMap, setSelMap] = useState(new Map());

  const invoices = useRef(null);

  const selList = Array.from(selMap.values());
  const selTotal = selList.reduce((s, inv) => s + inv.invoice_amount, 0);

  const allSelected = row.po_invoices?.length > 0 && selList.length === row.po_invoices?.length;

  const toggleSelectAll = (e) => {
    e.stopPropagation();
    if (allSelected) {
      setSelMap(new Map());
    } else {
      const next = new Map();
      row.po_invoices.forEach(inv => next.set(inv.po_invoice_id, inv));
      setSelMap(next);
    }
  };

  const toggleInv = (inv) => {
    setSelMap(prev => {
      const next = new Map(prev);
      next.has(inv.po_invoice_id) ? next.delete(inv.po_invoice_id) : next.set(inv.po_invoice_id, inv);
      return next;
    });
  };

  const removeFromSel = (id) => setSelMap(prev => { const n = new Map(prev); n.delete(id); return n; });

  return (
    <>
      <tr className={`rv ${open ? "rv-open" : ""}`}>
        <td style={{ padding: 0 }}>
          <div
            className="rv-inner"
            onClick={() => setOpen(v => !v)}
            style={{ display: "grid", gridTemplateColumns: "24px 26px 32px 1fr 100px 80px 120px 1fr 140px 55px", alignItems: "center", gap: 0 }}
          >
            {/* chevron */}
            <span className={`chev ${open ? "chev-on" : ""}`}>
              <FontAwesomeIcon icon={open ? faChevronDown : faChevronRight} style={{ fontSize: 11 }} />
            </span>

            {/* Select All checkbox */}
            <span className={`pcb ${allSelected ? "pcb-on" : selList.length > 0 ? "pcb-on" : ""}`}
              style={{ opacity: selList.length > 0 && !allSelected ? 0.5 : 1, flexShrink: 0 }}
              onClick={toggleSelectAll}
            >
              {allSelected && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {selList.length > 0 && !allSelected && (
                <svg width="9" height="3" viewBox="0 0 9 3" fill="none">
                  <path d="M1 1.5H8" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
            </span>

            {/* avatar */}
            <span style={{ width: 28, height: 28, borderRadius: 8, background: "#ede9fe", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <FontAwesomeIcon icon={faBuilding} style={{ fontSize: 12, color: "#7c3aed" }} />
            </span>

            {/* name */}
            {/* vendor name — no vchip */}
            <span style={{ overflow: "hidden", minWidth: 0 }}>
              <a href={`/vendor/editvendor/${row.vendor_id}`}
                target="_blank" rel="noreferrer"
                style={{ fontWeight: 700, color: "#111827", textDecoration: "none", fontSize: 13, whiteSpace: "nowrap" }}
                onClick={e => e.stopPropagation()}
              >
                {row.vendor_name}
              </a>
            </span>
            {/* vendor code  */}
            <span style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
              {row.vendor_code}
            </span>

            {/* currency */}
            <span style={{ color: "#111827", fontSize: 12, whiteSpace: "nowrap" }}>
              {row.vendor_currency}
            </span>
            {/* vendor type */}
            <span style={{ color: "#111827", fontSize: 12, whiteSpace: "nowrap" }}>
              {row.vendor_type}
            </span>
            {/* payment method chips */}
            <span style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
              {(row.mode_of_payment ?? []).map((m, i) => (
                <span key={i} style={{ background: "#f0f0f5", color: "#4f46e5", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {m}
                </span>
              ))}
              {(!row.mode_of_payment?.length) && <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>}
            </span>

            {/* total due amount */}
            <span style={{ textAlign: "right", paddingRight: 20, fontWeight: 700, fontSize: 13, color: "#111827", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
              {formatCurrency(row.inv_total)}
            </span>

            {/* payment term
            <span style={{ color:"#6b7280", fontSize:12, whiteSpace:"nowrap" }}>
              {row.payment_term_name ?? "—"}
            </span> */}

            {/* inv count */}
            <span style={{ textAlign: "center" }}>
              <span style={{ background: "#ede9fe", color: "#7c3aed", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                {row.po_invoices?.length ?? 0}
              </span>
            </span>
          </div>
        </td>
      </tr>

      {/* invoice section */}
      {open && (
        <tr>
          <td style={{ padding: 0 }}>
            <div className="inv-section">
              <div className="inv-tbl-head">
                <span>Select</span>
                <span />
                <span>Invoice No</span>
                <span>PO Number</span>
                <span>Invoice Date</span>
                <span>Due Date</span>
                <span style={{ textAlign: "right", paddingRight: 6 }}>Invoice Amount</span>
                <span style={{ textAlign: "center" }}>Status</span>
                <span style={{ textAlign: "center" }}>Lines</span>
              </div>

              {row.po_invoices.map(inv => (
                <InvoiceRow
                  key={inv.po_invoice_id}
                  inv={inv}
                  checked={selMap.has(inv.po_invoice_id)}
                  onCheck={toggleInv}
                />
              ))}

              {selList.length > 0 && (
                <div className="pay-footer pay-footer-anim">
                  <div className="pay-footer-invoices">
                    {selList.map(inv => (
                      <span key={inv.po_invoice_id} className="pay-chip">
                        {inv.invoice_number}
                        <button className="pay-chip-x" onClick={() => removeFromSel(inv.po_invoice_id)} title="Remove">
                          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 9 }} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="pay-footer-right">
                    <div>
                      <div className="pay-total-lbl">
                        {selList.length} Invoice{selList.length > 1 ? "s" : ""} Selected
                      </div>
                      <div className="pay-total-amt">{formatCurrency(selTotal)}</div>
                    </div>
                    <button
                      className="btn-pay"
                      onClick={() => onPay(selList, row.vendor_name, row, () => setSelMap(new Map()))}
                    >
                      <FontAwesomeIcon icon={faCreditCard} style={{ fontSize: 13 }} />
                      Pay Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════ */
function SkeletonRows() {
  return Array.from({ length: 7 }, (_, i) => (
    <tr key={i} className="rv">
      <td style={{ padding: "13px 14px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="skel" style={{ width: 20, height: 20, borderRadius: 5 }} />
          <div className="skel" style={{ width: 28, height: 28, borderRadius: 8 }} />
          <div className="skel" style={{ width: 120 + (i % 4) * 28, height: 13 }} />
          <div style={{ flex: 1 }} />
          <div className="skel" style={{ width: 80, height: 13 }} />
          <div className="skel" style={{ width: 64, height: 13 }} />
        </div>
      </td>
    </tr>
  ));
}

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function PendingInvoiceList() {
  const [searchValue, setSearchValue] = useState("");
  const [vendorSuggestions, setVendorSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dueDateDisplay, setDueDateDisplay] = useState("");
  const [filters, setFilters] = useState({ due_date_from: "", due_date_to: "" });
  const [paymentTerm, setPaymentTerm] = useState("");

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [sortBy, setSortBy] = useState("");
  const [sortDir, setSortDir] = useState("asc");

  const [modal, setModal] = useState(null); // { invoices, vendorName }

  const debounceRef = useRef(null);
  const { paymentTerms } = useMasterData();

  /* fetch */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        page, size: pageSize,
        vendor_search: searchValue,
        due_date_from: filters.due_date_from,
        due_date_to: filters.due_date_to,
        payment_term_id: paymentTerm,
        sort_by: sortBy, sort_dir: sortDir,
      }).toString();
      //const res = await apiFetch(`${API_BASE}api/purchaseorder/api/purchase-order/invoices/listing?${qs}`);
      const res = await apiFetch(`${API_BASE}api/purchaseorder/api/purchase-order/invoices/pending_lists?${qs}`);
      setRows(res?.data ?? []);
      setLastPage(res?.last_page ?? 1);
      if (res?.summary) setSummary(res.summary);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, pageSize, searchValue, filters, paymentTerm, sortBy, sortDir]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* vendor autocomplete */
  const handleVendorInput = (val) => {
    setSearchValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setVendorSuggestions([]); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await apiFetch(`${API_BASE}api/vendor_api/lists?search=${val}`);
        if (res?.data) { setVendorSuggestions(res.data); setShowDropdown(true); }
      } catch { }
    }, 300);
  };
  const selectVendor = (v) => {
    setSearchValue(v.vendor_name); // vendor_code → vendor_name
    setShowDropdown(false);
    setVendorSuggestions([]);
    setPage(1);
  };

  /* sort */
  const handleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir("asc"); }
    setPage(1);
  };

  /* clear */
  const clearAll = () => {
    setSearchValue(""); setDueDateDisplay("");
    setFilters({ due_date_from: "", due_date_to: "" });
    setPaymentTerm(""); setVendorSuggestions([]); setShowDropdown(false); setPage(1);
  };

  /* pay callback */
  const handlePay = (invList, vendorName, vendorData, resetFn) => setModal({ invoices: invList, vendorName, vendorData, resetFn });
  const handleConfirm = async (data) => {
    try {
      await apiFetch(
        `${API_BASE}api/purchaseorder/api/purchase-order/invoices/mark-paid`,
        {
          method: "POST",
          body: JSON.stringify({
            invoice_ids: data.invoices.map(inv => inv.po_invoice_id),
            vendor_id: modal.vendorData?.vendor_id,
            currency: modal.vendorData?.currency_code,
            ...data,
          }),
        }
      );
      setModal(null);
      modal.resetFn?.();
      toast.success("Payment recorded successfully!");
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("Payment failed. Please try again.");
    }
  };

  const pageNums = () => {
    const pages = [];
    for (let i = Math.max(1, page - 2); i <= Math.min(lastPage, page + 2); i++) pages.push(i);
    return pages;
  };

  /* ═══════════ RENDER ═══════════ */
  return (
    <div className="pil">
      <style>{CSS}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 ps-1">
        <h5 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: "#111827" }}>
          <span style={{ width: 32, height: 32, borderRadius: 10, background: "#ede9fe", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <FontAwesomeIcon icon={faListUl} style={{ fontSize: 13, color: "#7c3aed" }} />
          </span>
          Due Invoices
        </h5>
        <Link
          to="/purchaseorder/invoices"
          style={{
            background: "#c8efff",
            color: "#0ca9ed",
            border: "1.5px solid #0ca9ed",
            fontWeight: 700,
            fontSize: 14,
            padding: "8px 18px",
            borderRadius: 9,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            transition: "all .2s ease",
            boxShadow: "0 2px 8px rgba(12,169,237,.15)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#0ca9ed";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(12,169,237,.35)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#c8efff";
            e.currentTarget.style.color = "#0ca9ed";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(12,169,237,.15)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          All Invoices
        </Link>
      </div>

      {/* Stat cards */}
      <div className="row g-2 mb-3">
        {STAT_CFG.map(c => (
          <div key={c.key} className="col-xl col-lg-4 col-md-6">
            <StatCard cfg={c} summary={summary} />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="pil-card bg-white mb-3 p-3">
        <div className="row g-2 align-items-end">
          <div className="col-md-5">
            <label style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 5, display: "block" }}>Search Vendor</label>
            <div className="position-relative">
              <FontAwesomeIcon icon={faSearch} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 12, pointerEvents: "none" }} />
              <input type="text" autoComplete="off" className="form-control form-control-sm"
                style={{ paddingLeft: 30, borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                placeholder="Name or code…" value={searchValue}
                onChange={e => { handleVendorInput(e.target.value); setPage(1); }}
                onFocus={() => vendorSuggestions.length && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              />
              {showDropdown && vendorSuggestions.length > 0 && (
                <ul className="list-group position-absolute w-100 shadow-sm"
                  style={{ zIndex: 1000, top: "calc(100% + 4px)", maxHeight: 220, overflowY: "auto", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                  {vendorSuggestions.map(v => (
                    <li key={v.id} className="list-group-item list-group-item-action py-2"
                      style={{ cursor: "pointer", fontSize: 13, borderLeft: "none", borderRight: "none" }}
                      onMouseDown={() => selectVendor(v)}>
                      <strong style={{ color: "#4f46e5" }}>{v.vendor_code}</strong>
                      <span className="ms-2 text-muted">{v.vendor_name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="col-md-3">
            <label style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 5, display: "block" }}>Due Date</label>
            <DateRangeInput
              isRange
              size="sm"
              value={dueDateDisplay}
              onChange={(s, e) => {
                setDueDateDisplay(`${s.format("DD/MM/YYYY")} - ${e.format("DD/MM/YYYY")}`);
                setFilters({ due_date_from: s.format("YYYY-MM-DD"), due_date_to: e.format("YYYY-MM-DD") });
                setPage(1);
              }}
              onCancel={() => { setDueDateDisplay(""); setFilters({ due_date_from: "", due_date_to: "" }); }}
              placeholder="Select range"
            />
          </div>
          <div className="col-md-2">
            <label style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 5, display: "block" }}>Payment Term</label>
            <select className="form-select form-select-sm" style={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
              value={paymentTerm} onChange={e => { setPaymentTerm(e.target.value); setPage(1); }}>
              <option value="">All terms</option>
              {paymentTerms?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="col-md-2 d-flex gap-2">
            <button onClick={() => { setPage(1); fetchData(); }}
              style={{ flex: "0 0 auto", background: "#343a40", color: "#ffffff", borderRadius: 8, fontSize: 12, fontWeight: 700, padding: "5px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, width: "100px" }}>
              <FontAwesomeIcon icon={faSearch} style={{ fontSize: 15 }} /> Search
            </button>
            {/*<button onClick={clearAll} title="Clear" className="btn btn-light" 
              style={{ width:34,background:"#f3f4f6",color:"#6b7280",border:"none",borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}
              <FontAwesomeIcon icon={faTimes} style={{ fontSize:12 }} />
              Clear
            </button>*/}
            <button onClick={clearAll} title="Clear" className="btn btn-light"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      <div className="clearfix"></div>
      {/* Table */}
      <div className="pil-card bg-white">
        {/* toolbar */}
        <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>Show</span>
            <select className="form-select form-select-sm" style={{ width: 65, fontSize: 12, borderRadius: 6, border: "1px solid #e5e7eb", padding: "2px 6px" }}
              value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(1); }}>
              {[20, 30, 40, 50].map(n => <option key={n}>{n}</option>)}
            </select>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>entries</span>
          </div>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9ca3af" }}>
              <div className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2, color: "#818cf8" }} />
              Loading…
            </div>
          )}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="pil-tbl">
            <thead>
              <tr>
                <th style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40px 40px 40px repeat(7, 1fr)",
                      alignItems: "center",
                    }}
                  >
                    <span />
                    <span />
                    <span />

                    <span
                      className={sortBy === "vendor_name" ? "th-on" : ""}
                      onClick={() => handleSort("vendor_name")}
                    >
                      Vendor Name
                    </span>

                    <span>Vendor Code</span>
                    <span>Currency</span>
                    <span>Vendor Type</span>
                    <span>Payment Method</span>

                    <span
                      className={sortBy === "invoice_amount" ? "th-on" : ""}
                      style={{ textAlign: "right" }}
                      onClick={() => handleSort("invoice_amount")}
                    >
                      Total Due Amount
                    </span>

                    <span style={{ textAlign: "center" }}>No. of Inv</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && !rows.length
                ? <SkeletonRows />
                : !rows.length
                  ? <tr><td><div className="pil-empty"><div style={{ fontSize: 32, marginBottom: 10, opacity: .3 }}>📄</div>No records found</div></td></tr>
                  : rows.map((r, i) => (
                    <VendorRow key={r.vendor_id ?? i} row={r} onPay={handlePay} />
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f5", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>Page {page} of {lastPage}</span>
          <nav className="pager">
            <button className="ppage" onClick={() => setPage(1)} disabled={page === 1}>«</button>
            <button className="ppage" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {pageNums().map(n => (
              <button key={n} className={`ppage ${n === page ? "pp-on" : ""}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="ppage" onClick={() => setPage(p => p + 1)} disabled={page === lastPage}>›</button>
            <button className="ppage" onClick={() => setPage(lastPage)} disabled={page === lastPage}>»</button>
          </nav>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <PaymentModal
          invoices={modal.invoices}
          vendorName={modal.vendorName}
          vendorData={modal.vendorData}
          onClose={() => setModal(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
