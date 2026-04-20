import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Spinner } from 'react-bootstrap';
import { toast } from "react-hot-toast";
import { useMasterData } from "../../../Context/MasterDataProvider";
import { API_BASE, API_ENDPOINTS } from "../../../Config/api"; 
import formatCurrency, { formatAUD, formatToISODate } from "../../../Utils/utilFunctions";
import apiFetch from "../../../Utils/apiFetch";
import StickyHeader from "../../Common/StickyHeader";
import "react-datepicker/dist/react-datepicker.css";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import SplitButton from "react-bootstrap/SplitButton";
import Dropdown from "react-bootstrap/Dropdown";
import Swal from "sweetalert2";
import ReceiveLineItemsTable from "../../../Pages/PurchaseOrder/POComponents/POReceipt/ReceiveLineItemsTable";
import ReceiveOrderInfoSection from "../../../Pages/PurchaseOrder/POComponents/POReceipt/ReceiveOrderInfoSection";

const recalculateLandedCost = (items, freight, surcharge) => {
  const totalQty = items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
  if (totalQty === 0) return items;
  const additionalPerUnit = (Number(freight) + Number(surcharge)) / totalQty;
  return items.map((item) => {
    const qty = Number(item.quantity || 0);
    if (qty === 0) return { ...item, cost_per_item: 0 };
    const discountedUnitPrice = Number(item.price || 0) * (1 - Number(item.discount || 0) / 100);
    const landedCost = ((discountedUnitPrice * qty) + (additionalPerUnit * qty)) / qty;
    return { ...item, cost_per_item: landedCost };
  });
};

const PurchaseReceiveForm = () => {
  const { receiveId } = useParams();
  const navigate      = useNavigate();

  const [poError, setPOError]               = useState(false);
  const { vendors, warehouses, countries, refreshMasterData } = useMasterData();
  const [poReceiveDetails, setPOReceiveDetails] = useState(null);
  const [loading, setLoading]               = useState(true);
  const [deliveryForm, setDeliveryForm]     = useState({ delivery_name:"", address_line1:"", address_line2:"", city:"", state:"", zip:"", country:"" });
  const [sbPoNumber, setSbPoNumber]         = useState("");
  const [poStatus, setPoStatus]             = useState(null);
  const [poVendorCode, setPOVendorCode]     = useState(null);
  const [sbPoDate, setSbPoDate]             = useState(null);
  const [sbPoDeliveryDate, setSbPoDeliveryDate] = useState(new Date());
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [vendorDetails, setVendorDetails]   = useState({ name:"", currency:"" });
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [states, setStates]                 = useState([]);
  const [lineItems, setLineItems]           = useState([]);
  const [vendorOrders, setVendorOrders]     = useState([{ vendor_po_number:"", order_number:"", order_date:null }]);
  const [freightExGst, setFreightExGst]     = useState(0);
  const [surchargeExGst, setSurchargeExGst] = useState(0);
  const [comments, setComments]             = useState("");
  const [lineItemQty, setLineItemQty]       = useState("");
  const [lineItemComment, setLineItemComment] = useState("");
  const [lineItemPrice, setLineItemPrice]   = useState("");
  const [lineItemDiscount, setLineItemDiscount] = useState("");
  const [subtotal, setSubTotal]             = useState(null);
  const [glboalTaxRate, setGlobalTaxRate]   = useState(10.0);
  const [globalDiscount, setGlobalDiscount] = useState(null);
  const [minOrderValue, setMinOrderValue]   = useState(null);
  const [allReceived, setAllReceived]       = useState(false);
  const [receiveStatus, setReceiveStatus]   = useState("pending");
  const [newLineItemProductId, setNewLineItemProductId] = useState(null);
  const [newLineItemInvoiceId, setNewLineItemInvoiceId] = useState(null);
  const [poInvoices, setPoInvoices]         = useState([]);
  const [receivedLineItems, setReceivedLineItem] = useState([]);
  const [visible, setVisible]               = useState(false);
  const [poId, setPOId]                     = useState(null);

  // ── Derived values ────────────────────────────────────────────────
  const hasItems    = receivedLineItems.length > 0;
  const isFullMatch = hasItems && lineItems
    .filter(li => receivedLineItems.some(r => r.product_id === li.product_id))
    .every(li => Number(li.receive_item_details?.received_qty || 0) === Number(li.quantity || 0));
  const isPartial = hasItems && !isFullMatch &&
    lineItems
      .filter(li => receivedLineItems.some(r => r.product_id === li.product_id))
      .every(li => Number(li.receive_item_details?.received_qty || 0) >= 1);

  const selectedInvoice = poInvoices.find(p => String(p.po_invoice_id) === String(newLineItemInvoiceId));
  const subTotalValue   = Number(selectedInvoice?.invoice_total || 0);
  const grandTotal      = Number(selectedInvoice?.invoice_total || 0);

  // ✅ estimatedLandedTotal — must be before landedCostTooltip
  const estimatedLandedTotal = lineItems.reduce((sum, item) => {
    const receivedQty  = Number(item?.receive_item_details?.received_qty || 0);
    const landedIncGst = Number(item?.landed_cost_inc_gst || 0);
    return sum + (receivedQty * landedIncGst);
  }, 0);

  // ✅ landedCostTooltip — after estimatedLandedTotal
  const landedCostTooltip = (
    <div style={{ fontSize:"12px", minWidth:"260px", padding:"4px" }}>
      <div style={{ fontWeight:700, marginBottom:"8px", borderBottom:"1px solid rgba(255,255,255,0.2)", paddingBottom:"6px" }}>
        Landed Cost Breakdown
      </div>
      {lineItems.map((item, i) => {
        const receivedQty  = Number(item?.receive_item_details?.received_qty || 0);
        const landedIncGst = Number(item?.landed_cost_inc_gst || 0);
        const itemTotal    = receivedQty * landedIncGst;
        return (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", gap:"12px", marginBottom:"4px" }}>
            <span style={{ opacity:0.85, maxWidth:"160px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {item.title}
            </span>
            <span style={{ whiteSpace:"nowrap", opacity:0.7 }}>×{receivedQty}</span>
            <span style={{ fontWeight:600, whiteSpace:"nowrap" }}>{formatAUD(itemTotal)}</span>
          </div>
        );
      })}
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.2)", marginTop:"8px", paddingTop:"6px", display:"flex", justifyContent:"space-between", fontWeight:700 }}>
        <span>Total</span>
        <span>{formatAUD(estimatedLandedTotal)}</span>
      </div>
    </div>
  );
  // ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (newLineItemInvoiceId) setVisible(true);
    else setVisible(false);
  }, [newLineItemInvoiceId]);

  const update_po_status = async (poId, newStatusId) => {
    try {
      const res = await apiFetch(API_ENDPOINTS.UPDATE_PO_STATUS, {
        method: "POST", body: JSON.stringify({ po_id: poId, status_id: newStatusId }),
      });
      if (res.status) toast.success("PO Updated successfully");
      else toast.error(res.message || "Error updating PO status");
      if ("po_status_id" in res) setPoStatus(res.po_status_id);
      if (res.po_status_id === 4) navigate(`/purchaseorder/details/${poId}`);
    } finally {}
  };

 

  const handleSaveReceipt = async (isComplete = false) => {
    if (isComplete) {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This action will complete the receipt and make the PO unavailable for further editing. This change cannot be undone.",
        icon: 'warning', showCancelButton: true,
        confirmButtonText: 'Yes, Complete it!', cancelButtonText: 'No, keep it',
      });
      if (!result.isConfirmed) return;
    }

    const payload = {
      po_id:         poReceiveDetails?.po_id,
      po_receive_id: receiveId,
      is_complete:   isComplete,  // ✅ backend-க்கு pass பண்ணு
      comments,
      lineItems: receivedLineItems.map(r => {
        const item = lineItems.find(li => li.product_id === r.product_id);
        return {
          product_id:    r.product_id,
          po_invoice_id: r.po_invoice_id,
          received_date: formatToISODate(r.received_date),
          received_qty:  item?.receive_item_details?.received_qty || 0,
        };
      })
    };

    try {
      const res = await apiFetch(`${API_BASE}api/purchaseorder/poreceives/save_po_receipt`, {
        method: "POST", body: JSON.stringify(payload)
      });
      if (res.status) {
        toast.success(isComplete ? "Receipt completed successfully!" : "Receipt confirmed successfully!");
        setReceivedLineItem([]);
        setNewLineItemInvoiceId(null);
        setNewLineItemProductId(null);
        setComments("");
        setPOReceiveDetails(prev => ({ ...prev, received_date: null }));
        if ("po_status_id" in res) setPoStatus(res.po_status_id);
        navigate(isComplete?`/purchaseorder/details/${poReceiveDetails?.po_id}?tab=warehouse`:`/purchaseorder/create/${poReceiveDetails?.po_id}/`);
      } else {
        toast.error(res.message || "Save failed");
      }
    } catch (err) { toast.error(err?.message || "Save failed"); }
  };

  const handleSplitOrder = async (isComplete = false) => {
    Swal.fire({
      title: isComplete ? 'Split and complete?' : 'Split this receipt?',
      text: isComplete
        ? "The current receipt will be split for received items and the PO will be marked as complete. Remaining items will not be tracked."
        : "The current receipt will be marked as complete and a new receipt will be created for the remaining quantity.",
      icon: 'warning', showCancelButton: true,
      confirmButtonText:  isComplete ?'Yes, split & complete!':'Yes, split!', cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        
        const payload = {
          po_id:         poReceiveDetails?.po_id,
          po_receive_id: receiveId,
          is_complete:   isComplete,  // ✅ backend-க்கு pass பண்ணு
          comments,
          lineItems: receivedLineItems.map(r => {
            const item = lineItems.find(li => li.product_id === r.product_id);
            return {
              product_id:    r.product_id,
              po_invoice_id: r.po_invoice_id,
              received_date: formatToISODate(r.received_date),
              received_qty:  item?.receive_item_details?.received_qty || 0,
            };
          })
        };
       
        try {
          const res = await apiFetch(`${API_BASE}api/purchaseorder/poreceives/save_split_receive`, {
            method: "POST", body: JSON.stringify(payload)
          });
          if (res.status) {
            toast.success("Receipt split successfully!");
            setTimeout(() => window.location.reload(), 800);
            if ("po_status_id" in res) setPoStatus(res.po_status_id);
            navigate(isComplete?`/purchaseorder/details/${poReceiveDetails?.po_id}?tab=warehouse`:`/purchaseorder/create/${poReceiveDetails?.po_id}/`);

          } else {
            toast.error(res.message || "Save failed");
          }
        } catch (err) {
          toast.error(err?.response?.data?.message || err?.message || "Save failed");
        }
      }
    });
  };

  useEffect(() => { refreshMasterData(); if (!sbPoDate) setSbPoDate(new Date()); }, []);

  useEffect(() => {
    const isAllCompleted = lineItems.length > 0 && lineItems.every(item =>
      Number(item?.receive_item_details?.received_qty || 0) === Number(item.quantity || 0)
    );
    const hasStartedReceiving = lineItems.some(item =>
      Number(item?.receive_item_details?.received_qty || 0) > 0
    );
    if (isAllCompleted) setReceiveStatus("Completed");
    else if (hasStartedReceiving) setReceiveStatus("Partial");
    else setReceiveStatus("Pending");
  }, [lineItems]);

  const fetchStates = useCallback(async (countryId) => {
    if (!countryId) return;
    try {
      const response = await apiFetch(`${API_BASE}api/common/list_states/?country_id=${countryId}`, { method: "GET" });
      if (response?.results) setStates(response.results);
    } catch (err) { console.error("State fetch error", err); }
  }, []);

  useEffect(() => {
    if (deliveryForm?.country) fetchStates(deliveryForm.country);
    else setStates([]);
  }, [deliveryForm?.country, fetchStates]);

  useEffect(() => {
    const qty      = Number(lineItemQty || 0);
    const price    = Number(lineItemPrice || 0);
    const discount = Number(lineItemDiscount || 0);
    setSubTotal((qty * price) * (1 - discount / 100));
  }, [lineItemQty, lineItemPrice, lineItemDiscount]);

  useEffect(() => {
    const fetchPoData = async () => {
      if (!receiveId || vendors.length === 0 || warehouses.length === 0) return;
      try {
        const res  = await apiFetch(`${API_BASE}api/purchaseorder/api/get_po_receive_details/${receiveId}`);
        const json = await res;
        setLoading(false);
        if (json.status) {
          const { po:p, po_vendor_details, line_items, all_received, receive_details, po_invoices } = json.data;
          setPOId(p.po_id);
          setAllReceived(all_received);
          setPOReceiveDetails(receive_details);
          setSbPoNumber(p.po_number || "");
          setPOVendorCode(p.vendor_code);
          setSbPoDate(p.sbpo_order_date ? new Date(p.sbpo_order_date) : new Date());
          setComments(receive_details.internal_ref_notes || "");
          setPoStatus(p.status_id);
          setFreightExGst(Number(p.shipping_charge) || 0);
          setSurchargeExGst(Number(p.surcharge_total) || 0);
          setGlobalTaxRate(Number(p.global_tax_rate) || 10);
          setGlobalDiscount(Number(p.global_discount_percentage));
          setMinOrderValue(p.minimum_order_value ? Number(p.minimum_order_value) : null);
          setPoInvoices(po_invoices || []);
          if (p.sb_po_delivery_date && p.sb_po_delivery_date !== "")
            setSbPoDeliveryDate(new Date(p.sb_po_delivery_date));
          const vendorObj = vendors.find(v => v.vendor_code === p.vendor_code);
          if (vendorObj) { setSelectedVendorId(vendorObj.id); fetchVendorDetails(vendorObj.id); }
          const whObj = warehouses.find(w => w.id === Number(p.warehouse_id) || w.name === p.warehouse_id);
          if (whObj) setSelectedWarehouse(whObj);
          setDeliveryForm({ delivery_name:p.po_delivery_name||"", address_line1:p.po_address_line1||"", address_line2:p.po_address_line2||"", city:p.po_city||"", state:p.po_state||"", zip:p.po_zip||"", country:p.po_country||"" });
          if (po_vendor_details?.length > 0)
            setVendorOrders(po_vendor_details.filter(vo => vo.is_primary === 1).map(vo => ({
              po_vendor_id: vo.po_vendor_id, vendor_po_number: vo.vendor_po_number,
              order_number: vo.order_number, order_date: formatToISODate(vo.order_date)
            })));
          if (line_items?.length > 0) {
            setLineItems(recalculateLandedCost(line_items.map(li => ({
              product_id:          li.row_item.id,
              title:               li.row_item.title,
              sku:                 li.row_item.sku,
              asin:                li.row_item.asin,
              fnsku:               li.row_item.fnsku,
              ean:                 li.row_item.ean,
              prep_type:           li.row_item.prep_type,
              is_taxfree:          li.row_item.is_taxfree,
              po_image_url:        li.row_item.image,
              quantity:            li.qty,
              price:               li.price,
              discount:            li.discount,
              gst_percent:         li.tax,
              gst_amount:          li.tax_amount,
              sub_total:           li.sub_total,
              total:               li.line_total,
              comment:             li.comment,
              delivery_date:       li.delivery_date,
              landed_cost_ex_gst:  Number(li.landed_cost_ex_gst || 0),   // ✅ top level
              landed_cost_inc_gst: Number(li.landed_cost_inc_gst || 0),  // ✅ top level
              receive_item_details: {
                ...li.receive_item_details,
                received_qty: li.receive_item_details?.received_qty ?? 0
              },
            })), p.shipping_charge, p.surcharge_total));
          }
        } else { setPOError(true); }
      } catch (err) { setPOError(true); setLoading(false); toast.error("Error loading Purchase Order"); }
    };
    fetchPoData();
  }, [receiveId, vendors, warehouses]);

  const fetchVendorDetails = async (id) => {
    try {
      const res  = await apiFetch(`${API_ENDPOINTS.GET_VENDOR_DETAILS}?vendor_id=${id}`);
      const json = await res;
      const vendor_detail = json.data.primary || {};
      if (json.status) {
        setPOVendorCode(vendor_detail.vendor_code);
        if (!minOrderValue) setMinOrderValue(vendor_detail.min_order_value);
        if (vendor_detail.default_warehouse) {
          const selctedWh = warehouses.find(w => w.id === Number(vendor_detail.default_warehouse));
          if (selctedWh) {
            setSelectedWarehouse(selctedWh);
            if (selctedWh.country_id) await fetchStates(selctedWh.country_id);
            setDeliveryForm({ delivery_name:selctedWh.name||"", address_line1:selctedWh.address_line1||"", address_line2:selctedWh.address_line2||"", city:selctedWh.city||"", state:selctedWh.state_id?Number(selctedWh.state_id):"", zip:selctedWh.zip_code||"", country:selctedWh.country_id?Number(selctedWh.country_id):"" });
          }
        }
        setVendorDetails({ name:vendor_detail.vendor_name||"", currency:vendor_detail.currency||"", default_warehouse:vendor_detail.default_warehouse||"" });
      }
    } catch (err) { console.error(err); }
  };

  const handleVendorChange    = (e) => { setSelectedVendorId(e.target.value); fetchVendorDetails(e.target.value); };
  const handleWarehouseChange = (e) => {
    const wh = warehouses.find(w => w.id === Number(e.target.value));
    setSelectedWarehouse(wh || null);
    if (wh) setDeliveryForm({ delivery_name:wh.name, address_line1:wh.address_line1, address_line2:wh.address_line2, city:wh.city, state:wh.state_id, zip:wh.zip_code, country:wh.country_id });
  };

  const updateLineItem = (index, field, value) => {
    if (field === "receive_item_details.received_qty") {
      const enteredQty = Number(value ?? 0);
      const maxAllowed = Number(lineItems[index]?.quantity || 0);
      if (enteredQty < 0) { toast.error("Quantity cannot be negative!"); value = 0; }
      if (enteredQty > maxAllowed) { toast.error(`Maximum allowed quantity is ${maxAllowed}`); value = maxAllowed; }
    }
    setLineItems(prev => {
      const updated = prev.map((item, i) => {
        if (i !== index) return item;
        let newItem = { ...item };
        if (field === "receive_item_details.received_qty") {
          newItem.receive_item_details = { ...item.receive_item_details, received_qty: Number(value ?? 0) };
        } else {
          newItem[field] = (field === "delivery_date" || field === "comment") ? value : Number(value ?? 0);
        }
        const q = Number(newItem.quantity || 0);
        const p = Number(newItem.price || 0);
        const d = Number(newItem.discount || 0);
        const g = Number(newItem.gst_percent || 0);
        const sub    = (q * p) * (1 - d / 100);
        const gstAmt = sub * (g / 100);
        return { ...newItem, sub_total:sub, gst_amount:gstAmt, total:sub+gstAmt };
      });
      return recalculateLandedCost(updated, freightExGst, surchargeExGst);
    });
  };

  const getPOStatusBadge = (statusId) => {
    let text = "Unknown", badge = "badge-info";
    if (statusId === -1) { text = "Draft";              badge = "badge-secondary"; }
    else if (statusId === 0) { text = "Parked";         badge = "badge-warning"; }
    else if (statusId === 1) { text = "Placed";         badge = "badge-primary"; }
    else if (statusId === 2) { text = "Costed";         badge = "badge-info"; }
    else if (statusId === 3) { text = "Receipted";      badge = "badge-success"; }
    else if (statusId === 4) { text = "Completed";      badge = "badge-warning"; }
    else if (statusId === 5) { text = "Part. Delivered"; badge = "badge-danger"; }
    else if (statusId === 6) { text = "Delivered";      badge = "badge-danger"; }
    else if (statusId === 7) { text = "Closed";         badge = "badge-danger"; }
    else if (statusId === 8) { text = "Cancelled";      badge = "badge-danger"; }
    return `<span class="px-3 py-2 fs-7 badge badge-pill ${badge}">${text.toUpperCase()}</span>`;
  };

  if (loading) return <Spinner animation="border" />;
  if (poError) return <div className="alert alert-danger">Error loading Purchase Receive details. Please try again later.</div>;

  return (
    <div className="">
      <StickyHeader>
        <div className="d-flex justify-content-between align-items-center mb-2 pt-0">
          <div className="d-flex align-items-center">
            <h3 className="mb-0 me-2">SB PO #{sbPoNumber}</h3>
            <span dangerouslySetInnerHTML={{ __html: getPOStatusBadge(poStatus) }} />
          </div>
          <div className="d-flex gap-2 align-items-center">
            <Link to="/purchaseorder/listing" className="btn btn-outline-primary px-3 shadow-sm" >
              All PO's
            </Link>
            {poVendorCode && poStatus >= 0 && (
              <Link to ={`/purchaseorder/create/${poReceiveDetails?.po_id}`}className="btn btn-outline-primary px-4 shadow-sm">
                View Purchase
              </Link>
            )}
            {poStatus !== 4 && poVendorCode && !allReceived && (
              <>
                {isFullMatch && (
                  <SplitButton variant="success" title="Confirm Receipt" id="receipt-actions-dropdown" onClick={(e)=>handleSaveReceipt(false)}>
                    <Dropdown.Item onClick={(e)=>handleSaveReceipt(true)}>Complete Receipt</Dropdown.Item>
                  </SplitButton>
                )}
                {isPartial && (
                  <SplitButton variant="success" title="Split Receipt" id="receipt-actions-dropdown" onClick={(e)=>handleSplitOrder()}>
                    <Dropdown.Item onClick={(e) => handleSplitOrder(true)}>Split Complete</Dropdown.Item>
                  </SplitButton>
                )}
              </>
            )}
            {poReceiveDetails?.status_id !== 4 && allReceived && (
              <button className="btn btn-receive px-4 shadow-sm" onClick={()=>handleSaveReceipt(true)}>Complete</button>
            )}
          </div>
        </div>
      </StickyHeader>

      <ReceiveOrderInfoSection {...{
        sbPoNumber, setSbPoNumber, vendors, selectedVendorId, handleVendorChange,
        vendorDetails, sbPoDate, setSbPoDate, warehouses, selectedWarehouse,
        handleWarehouseChange, deliveryForm, setDeliveryForm, states, countries,
        setSbPoDeliveryDate, sbPoDeliveryDate, glboalTaxRate, setGlobalTaxRate,
        globalDiscount, setGlobalDiscount, minOrderValue, setMinOrderValue,
        vendorOrders, setVendorOrders, poReceiveDetails, setPOReceiveDetails,
        newLineItemInvoiceId, setNewLineItemInvoiceId, poInvoices,
        setNewLineItemProductId, newLineItemProductId, lineItems,
        receivedLineItems, setReceivedLineItem, visible, setVisible, updateLineItem
      }} />

      <div style={{ opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(-10px)", transition:"opacity 0.3s ease, transform 0.3s ease", pointerEvents:visible?"auto":"none", overflow:visible?"visible":"hidden" }}>

        {/* Order Items */}
        {lineItems.length > 0 && (
          <div style={{ background:"#fff", border:"0.5px solid #e5e7eb", borderRadius:"12px", marginBottom:"12px" }}>
            <div style={{ padding:"10px 16px", fontSize:"11px", fontWeight:600, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.5px", background:"#f9fafb", borderBottom:"0.5px solid #e5e7eb", borderRadius:"12px 12px 0 0" }}>
              Order Items
            </div>
            <div style={{ padding:"16px" }}>
              <ReceiveLineItemsTable
                setReceivedLineItem={setReceivedLineItem}
                receivedLineItems={receivedLineItems}
                receiveDetails={poReceiveDetails}
                lineItems={lineItems}
                updateLineItem={updateLineItem}
                deleteLineItem={productId => setLineItems(prev => prev.filter(i => i.product_id !== productId))}
              />
            </div>
          </div>
        )}

        {/* Footer: Comments + Totals */}
        <div style={{ display:"flex", gap:"16px", alignItems:"flex-start", marginBottom:"16px" }}>
          <div style={{ flex:1 }}>
            <textarea
              style={{ width:"100%", minHeight:"120px", borderRadius:"8px", border:"0.5px solid #e5e7eb", padding:"10px 12px", fontSize:"13px", resize:"vertical", outline:"none", color:"#111827" }}
              placeholder="Comments"
              value={comments}
              onChange={e => setComments(e.target.value)}
            />
          </div>

          {/* ✅ Summary card */}
          <div style={{ background:"#fff", border:"0.5px solid #e5e7eb", borderRadius:"12px", overflow:"hidden", minWidth:"300px" }}>

            {/* Landed Cost header */}
            <div style={{ background:"#0f172a", padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                <span style={{ color:"#94a3b8", fontSize:"11px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                  Total Landed Cost
                </span>
                <Tippy content={landedCostTooltip} theme="dark" placement="top" interactive={true}>
                  <span style={{ width:"15px", height:"15px", borderRadius:"50%", background:"rgba(255,255,255,0.15)", color:"#94a3b8", fontSize:"10px", fontWeight:700, display:"inline-flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                    i
                  </span>
                </Tippy>
              </div>
              <span style={{ color:"#38bdf8", fontWeight:700, fontSize:"14px" }}>{formatAUD(estimatedLandedTotal)}</span>
            </div>

            {/* Invoice rows */}
            <div style={{ padding:"12px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"13px", color:"#6b7280", padding:"4px 0" }}>
                <span>Invoice Subtotal</span>
                <span>{formatCurrency(subTotalValue)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"14px", fontWeight:700, color:"#0f172a", borderTop:"0.5px solid #e5e7eb", marginTop:"8px", paddingTop:"10px" }}>
                <span>Invoice Grand Total</span>
                <span style={{ color:"#15803d" }}>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PurchaseReceiveForm;