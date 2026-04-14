import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Spinner } from 'react-bootstrap';
import { toast } from "react-hot-toast";
import { useMasterData } from "../../Context/MasterDataProvider";
import { API_BASE, API_ENDPOINTS } from "../../Config/api";
import formatCurrency, { formatAUD, formatToISODate } from "../../Utils/utilFunctions";
import ProductAutoComplete from "../../Components/ProductAutoComplete";
import InlineEditableNumber from "../../Components/Common/InlineEditableNumber";
import apiFetch from "../../Utils/apiFetch";
import StickyHeader from "../../Components/Common/StickyHeader";
import LineItemsTable from "./POComponents/LineItemsTable";
import OrderInfoSection from "./POComponents/OrderInfoSection";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faFileInvoice, faTruck } from '@fortawesome/free-solid-svg-icons';
import SplitButton from "react-bootstrap/SplitButton";
import Dropdown from "react-bootstrap/Dropdown";
import Swal from "sweetalert2";
import InvoiceModel from "../../Components/PO/View/NewInvoiceModel";
import AddShippingModal from "../../Components/PO/View/AddShippingModal";

const CSS = `
  .po-form-card { background:#fff; border:0.5px solid #e5e7eb; border-radius:12px; margin-bottom:12px; overflow:visible; }
  .po-form-card-header { padding:10px 16px; font-size:11px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; background:#f9fafb; border-bottom:0.5px solid #e5e7eb; border-radius:12px 12px 0 0; }
  .po-form-card-body { padding:16px; }
  .po-line-items-wrap .tabulator-header,
  .po-line-items-wrap thead tr,
  .po-line-items-wrap table thead { background:#0f0f1a !important; }
  .po-line-items-wrap thead th { background:#0f0f1a !important; color:#9ca3af !important; font-size:10px !important; font-weight:600 !important; text-transform:uppercase !important; letter-spacing:0.5px !important; padding:10px 12px !important; border:none !important; }
  .po-summary-card { background:#fff; border:0.5px solid #e5e7eb; border-radius:12px; padding:16px 20px; }
  .po-summary-row { display:flex; justify-content:space-between; font-size:13px; color:#6b7280; padding:4px 0; }
  .po-summary-row.total { font-size:14px; font-weight:700; color:#111827; border-top:0.5px solid #e5e7eb; margin-top:8px; padding-top:10px; }
  .po-summary-row.total span:last-child { color:#15803d; }
  .po-inline-edit { display:flex; justify-content:space-between; align-items:center; font-size:13px; color:#6b7280; padding:4px 0; }
`;

const recalculateLandedCost = (items, freight, surcharge) => {
  const totalSubtotal = items.reduce((sum, i) => sum + Number(i.sub_total || 0), 0);
  if (totalSubtotal === 0) return items;
  const totalExtra = Number(freight) + Number(surcharge);
  return items.map((item) => {
    const qty = Number(item.quantity || 0);
    const sub = Number(item.sub_total || 0);
    if (qty === 0) return { ...item, cost_per_item: 0 };
    const itemExtra = totalSubtotal > 0 ? (sub / totalSubtotal) * totalExtra : 0;
    const landedTotal = sub + itemExtra;
    const costPerItem = landedTotal / qty;
    return { ...item, cost_per_item: costPerItem };
  });
};

const PurchaseOrderForm = () => {
  const { poId } = useParams();
  const navigate = useNavigate();
  const qtyInputRef = useRef(null);
  const location = useLocation();
  const isAddNew = location.pathname.endsWith('/AddNew');
  const { vendors, warehouses, countries, refreshMasterData, loading: masterLoading, error: masterError } = useMasterData();

  const [loading, setLoading] = useState(true);
  const [deliveryForm, setDeliveryForm] = useState({ delivery_name: "", address_line1: "", address_line2: "", city: "", state: "", zip: "", country: "" });
  const [sbPoNumber, setSbPoNumber] = useState("");
  const [poStatus, setPoStatus] = useState(null);
  const [poVendorCode, setPOVendorCode] = useState(null);
  const [sbPoDate, setSbPoDate] = useState(null);
  const [sbPoDeliveryDate, setSbPoDeliveryDate] = useState(new Date());
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [vendorDetails, setVendorDetails] = useState({ name: "", currency: "" });
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [states, setStates] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [vendorOrders, setVendorOrders] = useState([{ vendor_po_number: "", order_number: "", order_date: null }]);
  const [freightExGst, setFreightExGst] = useState(0);
  const [surchargeExGst, setSurchargeExGst] = useState(0);
  const [comments, setComments] = useState("");
  const [productSearchText, setProductSearchText] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lineItemProductId, setLineItemProductId] = useState(null);
  const [lineItemQty, setLineItemQty] = useState("");
  const [lineItemComment, setLineItemComment] = useState("");
  const [lineItemPrice, setLineItemPrice] = useState("");
  const [lineItemDiscount, setLineItemDiscount] = useState("");
  const [subtotal, setSubTotal] = useState(null);
  const [glboalTaxRate, setGlobalTaxRate] = useState(10.0);
  const [globalDiscount, setGlobalDiscount] = useState(null);
  const [minOrderValue, setMinOrderValue] = useState(null);
  const [poReceiveId, setPoReceiveId] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [preferredPaymentTerm, setPreferredPaymentTerm] = useState(null);
  const [preferredShippingProvider, setPreferredShippingProvider] = useState(null);

  useEffect(() => { refreshMasterData(); if (!sbPoDate) setSbPoDate(new Date()); }, []);

  const update_po_status = async (newStatusId) => {
    try {
      const res = await apiFetch(API_ENDPOINTS.UPDATE_PO_STATUS, {
        method: "POST", body: JSON.stringify({ po_id: poId, status_id: newStatusId }),
      });
      if (res.status) toast.success(res.message || "PO Updated successfully");
      else toast.error(res.message || "Error updating PO status");
      if ("po_status_id" in res) setPoStatus(res.po_status_id);
    } finally { }
  };

  const handleCompleteReceipt = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This action will complete the receipt and make the PO unavailable for further editing. This change cannot be undone.",
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Yes, Complete it!', cancelButtonText: 'No, keep it',
    }).then(async (result) => { if (result.isConfirmed) await update_po_status(4); });
  };

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
    const qty = Number(lineItemQty || 0);
    const price = Number(lineItemPrice || 0);
    const discount = Number(lineItemDiscount || 0);
    setSubTotal((qty * price) * (1 - discount / 100));
  }, [lineItemQty, lineItemPrice, lineItemDiscount]);

  useEffect(() => {
    const fetchPoData = async () => {
      if (masterLoading) return;
      if (!poId) { setLoading(false); return; }
      if (masterError) {
        setLoading(false);
        toast.error("Unable to load master data");
        return;
      }
      if (vendors.length === 0 || warehouses.length === 0) {
        setLoading(false);
        toast.error("Required vendor/warehouse data is unavailable");
        return;
      }
      try {
        const res = await apiFetch(`${API_BASE}api/purchaseorder/api/get_po_details/${poId}`);
        const json = await res;
        if (json.status) {
          const { po: p, po_vendor_details, line_items, po_receive_id, preferred_shipping_provider } = json.data;
          setSbPoNumber(p.po_number || "");
          setPoReceiveId(po_receive_id || null);
          setPreferredPaymentTerm(p.vendor_payment_term_id);
          setPreferredShippingProvider(preferred_shipping_provider);
          setPOVendorCode(p.vendor_code);
          setSbPoDate(p.sbpo_order_date ? new Date(p.sbpo_order_date) : new Date());
          setComments(p.comments || "");
          setPoStatus(p.status_id);
          setFreightExGst(Number(p.shipping_charge) || 0);
          setSurchargeExGst(Number(p.surcharge_total) || 0);
          setGlobalTaxRate(Number(p.global_tax_rate) || 10);
          setGlobalDiscount(Number(p.global_discount_percentage));
          setMinOrderValue(p.minimum_order_value ? Number(p.minimum_order_value) : null);
          if (p.sb_po_delivery_date && p.sb_po_delivery_date !== "")
            setSbPoDeliveryDate(new Date(p.sb_po_delivery_date));
          const vendorObj = vendors.find(v => String(v.id) === String(p.vendor_id));
          if (vendorObj) { setSelectedVendorId(vendorObj.id); fetchVendorDetails(vendorObj.id); } else {
            if (!isAddNew)
              toast.error("Invalid vendor details")
          }
          const whObj = warehouses.find(w => w.id === Number(p.warehouse_id) || w.name === p.warehouse_id);
          if (whObj) setSelectedWarehouse(whObj);
          setDeliveryForm({ delivery_name: p.po_delivery_name || "", address_line1: p.po_address_line1 || "", address_line2: p.po_address_line2 || "", city: p.po_city || "", state: p.po_state || "", zip: p.po_zip || "", country: p.po_country || "" });
          if (po_vendor_details?.length > 0)
            setVendorOrders(po_vendor_details.filter(vo => vo.is_primary === 1).map(vo => ({
              po_vendor_id: vo.po_vendor_id, vendor_po_number: vo.vendor_po_number,
              order_number: vo.order_number, order_date: formatToISODate(vo.order_date)
            })));
          if (line_items?.length > 0)
            setLineItems(recalculateLandedCost(line_items.map(li => ({
              product_id: li.row_item.id, title: li.row_item.title, sku: li.row_item.sku,
              asin: li.row_item.asin, fnsku: li.row_item.fnsku, ean: li.row_item.ean,
              prep_type: li.row_item.prep_type, is_taxfree: li.row_item.is_taxfree,
              po_image_url: li.row_item.image, quantity: li.qty, price: li.price,
              discount: li.discount, gst_percent: li.tax, gst_amount: li.tax_amount,
              sub_total: li.sub_total, total: li.line_total, comment: li.comment, delivery_date: li.delivery_date
            })), p.shipping_charge, p.surcharge_total));
        } else {
          toast.error(json?.message || "Unable to load Purchase Order");
        }
      } catch (err) {
        toast.error("Error loading Purchase Order");
      } finally {
        setLoading(false);
      }
    };
    fetchPoData();
  }, [poId, vendors, warehouses, masterLoading, masterError]);

  const fetchVendorDetails = async (id) => {
    try {

      const res = await apiFetch(`${API_ENDPOINTS.GET_VENDOR_DETAILS}?vendor_id=${id}`);
      const json = await res;
      const vendor_detail = json.data.primary || {};
      if (json.status) {
        if (poStatus === -1) update_po_status(0);
        setPOVendorCode(vendor_detail.vendor_code);
        setMinOrderValue(
          vendor_detail.min_order_value != null && vendor_detail.min_order_value !== "" && Number(vendor_detail.min_order_value) !== 0
            ? Number(vendor_detail.min_order_value) : ""
        );
        if (vendor_detail.default_warehouse) {
          const selctedWh = warehouses.find(w => w.id === Number(vendor_detail.default_warehouse));
          if (selctedWh) {
            setSelectedWarehouse(selctedWh);
            if (selctedWh.country_id) await fetchStates(selctedWh.country_id);
            setDeliveryForm({ delivery_name: selctedWh.name || "", address_line1: selctedWh.address_line1 || "", address_line2: selctedWh.address_line2 || "", city: selctedWh.city || "", state: selctedWh.state_id ? Number(selctedWh.state_id) : "", zip: selctedWh.zip_code || "", country: selctedWh.country_id ? Number(selctedWh.country_id) : "" });
          }
        }
        setVendorDetails({ name: vendor_detail.vendor_display_name || "", currency: vendor_detail.currency || "", default_warehouse: vendor_detail.default_warehouse || "" });
      }
    } catch (err) { console.error(err); }
  };

  const handleVendorChange = async (e) => {
    setSelectedVendorId(e.target.value);
    if (!e.target.value) {
      setVendorDetails({ name: "", currency: "", default_warehouse: "" });
      setMinOrderValue(null); setPOVendorCode(null);
      setSelectedWarehouse(null);
      setDeliveryForm({
        delivery_name: "", address_line1: "",
        address_line2: "", city: "", state: "", zip: "", country: ""
      });
      setStates([]);
      return;
    }
    await fetchVendorDetails(e.target.value);
  };

  const handleWarehouseChange = (e) => {
    const val = e.target.value;
    if (!val) { setSelectedWarehouse(null); setDeliveryForm({ delivery_name: "", address_line1: "", address_line2: "", city: "", state: "", zip: "", country: "" }); setStates([]); return; }
    const wh = warehouses.find(w => w.id === Number(val));
    setSelectedWarehouse(wh || null);
    if (wh) {
      setDeliveryForm({ delivery_name: wh.name || "", address_line1: wh.address_line1 || "", address_line2: wh.address_line2 || "", city: wh.city || "", state: wh.state_id ? Number(wh.state_id) : "", zip: wh.zip_code || "", country: wh.country_id ? Number(wh.country_id) : "" });
      if (wh.country_id) fetchStates(wh.country_id); else setStates([]);
    }
  };

  const updateLineItem = (index, field, value) => {
    setLineItems(prev => {
      const updated = prev.map((item, i) => {
        if (i !== index) return item;
        const newItem = { ...item, [field]: field === "delivery_date" || field === "comment" ? value : Number(value ?? 0) };
        const sub = (Number(newItem.quantity || 0) * Number(newItem.price || 0)) * (1 - Number(newItem.discount || 0) / 100);
        const gst = sub * (Number(newItem.gst_percent || 0) / 100);
        return { ...newItem, sub_total: sub, gst_amount: gst, total: sub + gst };
      });
      return recalculateLandedCost(updated, freightExGst, surchargeExGst);
    });
  };

  const createLineItem = () => {
    if (!selectedProduct) {
      toast.error("Invalid Product"); return;
    }
    if (!selectedProduct || lineItems.some(i => i.product_id === lineItemProductId)) {
      toast.error("Product already added to line items"); return;
    }
    if (!lineItemQty || Number(lineItemQty) <= 0) {
      toast.error("Quantity must be at least 1"); qtyInputRef.current?.focus(); return;
    }
    const sub = (lineItemQty * lineItemPrice) * (1 - lineItemDiscount / 100);
    const gst = sub * (glboalTaxRate / 100);
    const newItem = {
      product_id: lineItemProductId, title: selectedProduct.title, sku: selectedProduct.sku,
      asin: selectedProduct.asin, fnsku: selectedProduct.fnsku, ean: selectedProduct.ean,
      prep_type: selectedProduct.prep_type, is_taxfree: selectedProduct.is_taxfree,
      po_image_url: selectedProduct.image, price: lineItemPrice, quantity: lineItemQty,
      discount: lineItemDiscount, sub_total: sub, gst_percent: glboalTaxRate,
      gst_amount: gst, total: sub + gst, delivery_date: formatToISODate(sbPoDeliveryDate), comment: lineItemComment
    };
    setLineItems(prev => recalculateLandedCost([...prev, newItem], freightExGst, surchargeExGst));
    setSelectedProduct(null); setProductSearchText(""); setLineItemQty(""); setLineItemPrice("");
    setLineItemProductId(null); setLineItemComment(""); setLineItemDiscount("");
  };
  //function to redirect receive view
  const handleReceive = async () => {
    if (!poReceiveId) { toast.error("Receive details not found for this PO"); return; }
    try {
      const res = await apiFetch(`${API_BASE}api/purchaseorder/api/purchase-order/get_invoice_rows/${poId}`);
      const invoiceCount = res?.data?.length || 0;
      if (invoiceCount === 0) {
        const result = await Swal.fire({
          title: "No Invoices Found",
          text: "This PO has no invoices. Do you still want to proceed to Receipt?",
          icon: "warning", showCancelButton: true,
          confirmButtonColor: "#0f0f1a", confirmButtonText: "Yes, Proceed", cancelButtonText: "Cancel"
        });
        if (result.isConfirmed) { navigate(`/purchaseorder/receive/${poReceiveId}`); return; }
      } else
        navigate(`/purchaseorder/receive/${poReceiveId}`);
    } catch (err) { console.error("Invoice check failed", err); navigate(`/purchaseorder/receive/${poReceiveId}`); }
  };

  const getPOStatusBadge = (statusId) => {
    let text = "Unknown", badge = "badge-info";
    if (statusId === -1) { text = "Draft"; badge = "badge-secondary"; }
    else if (statusId === 0) { text = "Parked"; badge = "badge-warning"; }
    else if (statusId === 1) { text = "Placed"; badge = "badge-primary"; }
    else if (statusId === 2) { text = "Costed"; badge = "badge-info"; }
    else if (statusId === 3) { text = "Receipted"; badge = "badge-success"; }
    else if (statusId === 4) { text = "Completed"; badge = "badge-warning"; }
    else if (statusId === 5) { text = "Part. Delivered"; badge = "badge-danger"; }
    else if (statusId === 6) { text = "Delivered"; badge = "badge-danger"; }
    else if (statusId === 7) { text = "Closed"; badge = "badge-danger"; }
    else if (statusId === 8) { text = "Cancelled"; badge = "badge-danger"; }
    return `<span class="px-3 py-2 fs-7 badge badge-pill ${badge}">${text.toUpperCase()}</span>`;
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    let toastId;
    try {
      const result = await Swal.fire({
        title: "Delete Purchase Order?", text: "This purchase order will be permanently deleted.",
        icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Yes, delete it!"
      });
      if (result.isConfirmed) {
        toastId = toast.loading("Deleting purchase order...");
        const response = await apiFetch(`${API_ENDPOINTS.DELETE_PURCHASE_ORDER}${poId}/`, { method: "DELETE" });
        toast.dismiss(toastId);
        if (response.status) { Swal.fire("Deleted!", "PO Details has been removed.", "success"); navigate("/purchaseorder/listing"); }
        else toast.error(response.message || response.error || "Delete failed");
      }
    } catch (err) { toast.dismiss(toastId); toast.error(err?.message || "Error deleting PO"); }
  };

  const buildPayload = () => {
    const formattedLineItems = lineItems.map(item => ({ ...item, delivery_date: formatToISODate(item.delivery_date) }));
    const formattedVendorOrders = [{ vendor_po_number: vendorOrders[0]?.vendor_po_number || "", order_number: vendorOrders[0]?.order_number || "", order_date: vendorOrders[0]?.order_date ? formatToISODate(vendorOrders[0].order_date) : null }];
    return { po_id: poId, sb_po_number: sbPoNumber, sb_po_delivery_date: formatToISODate(sbPoDeliveryDate), minimum_order_value: minOrderValue, global_tax_rate: glboalTaxRate, global_discount: globalDiscount, sb_po_date: formatToISODate(sbPoDate), warehouse_id: selectedWarehouse.id, vendor_id: selectedVendorId, delivery_details: deliveryForm, vendor_orders: formattedVendorOrders, line_items: formattedLineItems, summary: { subtotal: subTotalValue, freight: freightExGst, surcharge: surchargeExGst, gst: totalGstAmount, grand_total: grandTotal }, comments };
  };

  const validateForm = () => {
    if (!sbPoNumber || !selectedVendorId || !selectedWarehouse || !sbPoDate || lineItems.length === 0) {
      toast.error("Missing required fields"); return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return false;
    try {
      const res = await apiFetch(`${API_BASE}api/purchaseorder/api/save_po_details`, { method: "POST", body: JSON.stringify(buildPayload()) });
      if ("po_status_id" in res) setPoStatus(res.po_status_id);
      if (res.status) { toast.success("Saved!"); return true; }
      else { toast.error(res.message || "Save failed"); return false; }
    } catch (err) { toast.error(err?.message || "Save failed"); return false; }
  };

  const handleParked = async () => {
    if (!validateForm()) return;
    try {
      const res = await apiFetch(`${API_BASE}api/purchaseorder/api/save_po_details`, { method: "POST", body: JSON.stringify(buildPayload()) });
      if ("po_status_id" in res) setPoStatus(res.po_status_id);
      if (res.status) await update_po_status(0);
      else toast.error(res.message || "Save failed");
    } catch (err) { toast.error(err?.message || "Save failed"); }
  };

  const handleCosted = async () => {
    if (!validateForm()) return;
    try {
      const res = await apiFetch(`${API_BASE}api/purchaseorder/api/save_po_details`, { method: "POST", body: JSON.stringify(buildPayload()) });
      if ("po_status_id" in res) setPoStatus(res.po_status_id);
      if (res.status) {
        try {
          const response = await apiFetch(API_ENDPOINTS.approve_purchase_order + `${poId}`, { method: "POST", body: JSON.stringify({ po_id: poId }) });
          if (response.status && response.po_receive_id) await update_po_status(2);
          else toast.error(response.message || "Error");
          if ("po_status_id" in response) setPoStatus(2);
          if ("po_receive_id" in response) setPoReceiveId(response.po_receive_id);
        } catch { toast.error("Network error"); }
        return true;
      } else { toast.error(res.message || "Save failed"); return false; }
    } catch (err) { toast.error(err?.message || "Save failed"); return false; }
  };

  const handlePlace = async () => {
    if (!validateForm()) return;
    try {
      const res = await apiFetch(`${API_BASE}api/purchaseorder/api/save_po_details`, { method: "POST", body: JSON.stringify(buildPayload()) });
      if ("po_status_id" in res) setPoStatus(res.po_status_id);
      if (res.status) {
        try {
          const response = await apiFetch(API_ENDPOINTS.approve_purchase_order + `${poId}`, { method: "POST", body: JSON.stringify({ po_id: poId }) });
          if (response.status && response.po_receive_id) await update_po_status(1);
          else toast.error(response.message || "Error");
          if ("po_status_id" in response) setPoStatus(response.po_status_id);
          if ("po_receive_id" in response) setPoReceiveId(response.po_receive_id);
        } catch { toast.error("Network error"); }
        return true;
      } else { toast.error(res.message || "Save failed"); return false; }
    } catch (err) { toast.error(err?.message || "Save failed"); return false; }
  };

  const subTotalValue = lineItems.reduce((sum, i) => sum + i.sub_total, 0);
  const totalGstAmount = (lineItems.reduce((sum, i) => sum + i.gst_amount, 0)) + ((Number(freightExGst) + Number(surchargeExGst)) * 0.1);
  const grandTotal = subTotalValue + Number(freightExGst) + Number(surchargeExGst) + totalGstAmount;

  const canDelete = poVendorCode && poStatus >= 0 && poStatus <= 1;
  const canReceipt = poStatus === 1 || poStatus === 2;
  const canPlace = poStatus === 0;
  const showAddActions = poStatus === 1;
  const showSave = poStatus === 0 || poStatus === 1 || poStatus === 2;
  const hasActions = canDelete || showAddActions;

  //  Placed-ல fields lock
  const isPlaced = poStatus === 1 || poStatus === 4 || poStatus === 3;
  const isCompleted = poStatus === 4 || poStatus === 3;

  if (loading) return <Spinner animation="border" />;

  return (
    <div className="pt-0">
      <style>{CSS}</style>

      <StickyHeader>
        <div className="d-flex justify-content-between align-items-center mb-2 pt-0">
          <div className="d-flex align-items-center gap-2">
            <h3 className="mb-0">{isAddNew ? "Create" : "Edit"} Purchase Order</h3>
            <span dangerouslySetInnerHTML={{ __html: getPOStatusBadge(poStatus) }} />
          </div>
          <div className="d-flex align-items-center gap-2">
            {hasActions && (
              <Dropdown>
                <Dropdown.Toggle variant="primary" id="actions-dropdown">
                  Actions
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {showAddActions && (
                    <>
                      <Dropdown.Item onClick={() => setShowInvoiceModal(true)}>
                        <FontAwesomeIcon icon={faFileInvoice} className="me-2 text-secondary" />
                        Add Invoice
                      </Dropdown.Item>

                      <Dropdown.Item onClick={() => setShowShippingModal(true)}>
                        <FontAwesomeIcon icon={faTruck} className="me-2 text-secondary" />
                        Add Shipping
                      </Dropdown.Item>
                    </>
                  )}

                  {canDelete && showAddActions && <Dropdown.Divider />}

                  {canDelete && (
                    <Dropdown.Item className="text-danger" onClick={handleDelete}>
                      <FontAwesomeIcon icon={faTrash} className="me-2" />
                      Delete
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            )}
            <button className="btn btn-outline-secondary" onClick={() => navigate("/purchaseorder/listing")}>All PO's</button>
            {poStatus >= 0 && (
              <button className="btn btn-outline-info" onClick={() => navigate(`/purchaseorder/details/${poId}`)}>View</button>
            )}
            <div className="vr mx-1" />
            {showSave && (
              <SplitButton variant="success" size="sm" title="Save" id="save-split-btn"
                className="po-save-dropdown" onClick={handleSave}>
                <Dropdown.Item onClick={handleParked}>Parked</Dropdown.Item>
                {poStatus === 2 && <Dropdown.Item onClick={handlePlace}>Placed</Dropdown.Item>}
                <Dropdown.Item onClick={handleCosted}>Costed</Dropdown.Item>
              </SplitButton>
            )}
            {canPlace && <button className="btn btn-placed" onClick={handlePlace}>Place</button>}
            {canReceipt && <button className="btn btn-receive" onClick={handleReceive}>Receipt</button>}
            {poStatus === 3 && (
              <button className="btn btn-receive" onClick={handleCompleteReceipt}>Complete Receipt</button>
            )}
          </div>
        </div>
      </StickyHeader>

      <OrderInfoSection {...{
        sbPoNumber, setSbPoNumber, vendors, selectedVendorId, handleVendorChange,
        vendorDetails, sbPoDate, setSbPoDate, warehouses, selectedWarehouse,
        handleWarehouseChange, deliveryForm, setDeliveryForm, states, countries,
        setSbPoDeliveryDate, sbPoDeliveryDate, glboalTaxRate, setGlobalTaxRate,
        globalDiscount, setGlobalDiscount, minOrderValue, setMinOrderValue,
        vendorOrders, setVendorOrders,
        isPlaced,  // ✅
      }} />

      {/* ✅ Add Product — Placed-ல hide */}
      {!isPlaced && (
        <div className="po-form-card">
          <div className="po-form-card-header">
            Add Product Item <span style={{ color: "#ef4444" }}>*</span>
          </div>
          <div className="po-form-card-body">
            <div className="row g-2 align-items-end mb-3">
              <div className="col-md-3">
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.3px" }}>Product</label>
                <ProductAutoComplete value={productSearchText} onChange={setProductSearchText}
                  onSelect={(p) => {
                    setSelectedProduct(p); setLineItemProductId(p.id);
                    setLineItemPrice(p.price || 0); setProductSearchText(p.title);
                    setLineItemDiscount(globalDiscount);
                    setTimeout(() => qtyInputRef.current?.focus(), 50);
                  }}
                />
              </div>
              <div className="col-md-1">
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.3px" }}>Qty</label>
                <input type="number" className="form-control" ref={qtyInputRef} value={lineItemQty} min="1"
                  onChange={(e) => { let val = e.target.value; if (val.length > 1 && val.startsWith("0")) val = val.replace(/^0+/, ""); setLineItemQty(val === "" ? "" : Number(val)); }}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                />
              </div>
              <div className="col-md-1">
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.3px" }}>Price</label>
                <input type="number" className="form-control" value={lineItemPrice}
                  onChange={(e) => setLineItemPrice(e.target.value)} onFocus={(e) => e.target.select()} />
              </div>
              <div className="col-md-1">
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.3px" }}>Disc %</label>
                <input type="number" className="form-control" value={lineItemDiscount}
                  onChange={(e) => setLineItemDiscount(e.target.value)} onFocus={(e) => e.target.select()} />
              </div>
              <div className="col-md-2">
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.3px" }}>Sub Total</label>
                <input type="text" className="form-control" style={{ background: "#f9fafb", fontWeight: 600 }} value={subtotal?.toFixed(2)} readOnly />
              </div>
              <div className="col-md-3">
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.3px" }}>Comments</label>
                <input type="text" className="form-control" value={lineItemComment} onChange={(e) => setLineItemComment(e.target.value)} />
              </div>
              <div className="col-md-1 text-end">
                <button className="btn w-100"
                  style={{ height: "38px", background: "#0f0f1a", color: "#fff", fontSize: "13px", fontWeight: 600, borderRadius: "8px", border: "none", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
                  onMouseLeave={e => e.currentTarget.style.background = "#0f0f1a"}
                  onClick={createLineItem}>Add</button>
              </div>
            </div>
            <div className="po-line-items-wrap">
              <LineItemsTable lineItems={lineItems} updateLineItem={updateLineItem}
                deleteLineItem={i => setLineItems(prev => prev.filter((_, idx) => idx !== i))} />
            </div>
          </div>
        </div>
      )}

      {/* ✅ Placed-ல table only — no add/delete */}
      {isPlaced && lineItems.length > 0 && (
        <div className="po-form-card">
          <div className="po-form-card-header">Order Items</div>
          <div className="po-form-card-body">
            <div className="po-line-items-wrap">
              <LineItemsTable
                lineItems={lineItems}
                updateLineItem={updateLineItem}
                deleteLineItem={null}
                isReadOnly={true}
                isPlaced={true}
              />
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <InvoiceModel
          //maxInvoice={grandTotal}
          maxInvoice={100000}
          preferredPaymentId={preferredPaymentTerm} setShowModal={setShowInvoiceModal} poId={poId} onSuccess={() => setShowInvoiceModal(false)} />
      )}
      {showShippingModal && (
        <AddShippingModal poId={poId} onClose={() => setShowShippingModal(false)} preferredShippingProvider={preferredShippingProvider} onSuccess={() => setShowShippingModal(false)} />
      )}

      <div className="row">
        <div className="col-md-6">
          {/* ✅ Comments — always editable */}
          {isCompleted ? <>{comments}</> : <>
            <textarea className="form-control"
              style={{ borderRadius: "8px", border: "0.5px solid #e5e7eb", fontSize: "13px", resize: "vertical" }}
              placeholder="Comments" value={comments} onChange={e => setComments(e.target.value)} rows="4" /></>}
        </div>
        <div className="col-md-6">
          <div className="po-summary-card">
            <div className="po-summary-row"><span>Subtotal</span><span>{formatCurrency(subTotalValue)}</span></div>
            <div className="po-inline-edit">
              <span>Surcharge</span>
              {/* ✅ Surcharge — always editable */}
              {isPlaced || isCompleted ? <>{formatAUD(surchargeExGst)}</> : <><InlineEditableNumber style={{ width: "100px" }} value={surchargeExGst} onChange={setSurchargeExGst} /></>}
            </div>
            <div className="po-inline-edit">
              <span>Freight</span>
              {/*  Freight — always editable */}
              {isPlaced || isCompleted ? <>{formatAUD(freightExGst)}</> : <>
                <InlineEditableNumber style={{ width: "100px" }} value={freightExGst} onChange={setFreightExGst} /></>}
            </div>
            <div className="po-summary-row"><span>GST Total</span><span>{formatCurrency(totalGstAmount)}</span></div>
            <div className="po-summary-row total"><span>Grand Total</span><span>{formatCurrency(grandTotal)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;