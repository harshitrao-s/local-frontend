import React, { useEffect, useRef, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { Modal, Table, Button, Form, Card, Row, Col } from 'react-bootstrap';
import { apiFetch } from "../../Utils/apiFetch";
import { API_BASE } from "../../Config/api";
import useMasterData from "../../Context/MasterDataProvider";
const PurchaseInvoiceList = ({ vendors }) => {
  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);
  const { vendors: masterVendors } = useMasterData();

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  // Helper to format currency as AUD
  const formatAUD = (amount) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount || 0);
  };

  const formattedDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    tabulatorRef.current = new Tabulator(tableRef.current, {
      height: "500px",
      layout: "fitColumns",
      placeholder: "No Records found",
      // Updated API endpoint
      ajaxURL: `${API_BASE}api/purchaseorder/api/bills/listing_json`,
      pagination: true,
      paginationMode: "remote",
      paginationSize: 20,

      ajaxParams: function () {
        return {
          q: document.getElementById("filter_search_query")?.value || "",
          vendor_id: document.getElementById("filter_vendor_id")?.value || "",
        };
      },

      ajaxRequestFunc: function (url, config, params) {
        const query = new URLSearchParams({
          ...params,
          page: params.page || 1,
          size: params.size || 20,
        }).toString();

        return apiFetch(`${url}?${query}`, {
          method: "GET",
          credentials: "include",
        }).then((res) => res.json());
      },

      ajaxResponse: function (url, params, response) {
        return {
          data: response.data || [],
          last_page: response.last_page || 1,
        };
      },

      // Column formatting based on your specific reference
      columns: [
        { title: "ID", field: "bill_id", visible: false },
        { 
          title: "INVOICE DATE", 
          field: "invoice_date", 
          hozAlign: "center", 
          width: 120, 
          headerHozAlign: "center", 
          formatter: (cell) => formattedDate(cell.getValue()) 
        },
        {
          title: "INVOICE NO",
          field: "invoice_number",
          minWidth: 110,
          headerHozAlign: "center",
          hozAlign: "center",
          formatter: function (cell) {
            const bill_id = cell.getData().bill_id;
            const invoice_no = cell.getValue();
            // Link structure for viewing bill details
            return `<a href="#" class="text-primary font-weight-bold">${invoice_no}</a>`;
          }
        },
        { title: "PO NUMBER", field: "po_number", hozAlign: "center", minWidth: 120, headerHozAlign: "center" },
        { title: "VENDOR NAME", field: "vendor_name", hozAlign: "center", minWidth: 120, headerHozAlign: "center" },
        { 
          title: "INVOICE AMOUNT", 
          width: 160, 
          field: "po_amount", 
          hozAlign: "center", 
          minWidth: 110, 
          headerHozAlign: "center", 
          formatter: (cell) => formatAUD(cell.getValue()) 
        },
        { 
          title: "DUE DATE", 
          width: 120, 
          field: "invoice_due_date", 
          hozAlign: "center", 
          minWidth: 110, 
          headerHozAlign: "center", 
          formatter: (cell) => formattedDate(cell.getValue()) 
        },
        { 
          title: "STATUS", 
          field: "invoice_status_id", 
          width: 160, 
          minWidth: 120, 
          hozAlign: "center", 
          headerHozAlign: "center", 
          headerSort: false,
          formatter: function (cell) {
            const status = cell.getValue();
            const statusMap = {
              1: "Paid",
              2: "Unpaid",
              3: "Cancelled",
              4: "On Hold",
            };
            return `<span class="badge badge-pill badge-info">${statusMap[status] || "Unknown"}</span>`;
          }
        }
      ],
    });

    return () => tabulatorRef.current?.destroy();
  }, []);

  // const openShippingModal = async (poId, productId, receivedItemId) => {
  //   setLoadingModal(true);
  //   setModalData([]);
  //   setShowModal(true);

  //   try {
  //       const response = await apiFetch(
  //         `${API_BASE}api/purchaseorder/api/purchase-order/${poId}/${productId}/${receivedItemId}/shipments/`,
  //         { method: "GET" }
  //       );
  //       setModalData(response.data || []);
  //   } catch (err) {
  //       console.error("Failed to fetch shipments", err);
  //   } finally {
  //       setLoadingModal(false);
  //   }
  // };

  const handleSearch = (e) => {
    e.preventDefault();
    tabulatorRef.current.setData();
  };

  return (
    <div className="pt-2">
      <Card className="card card-primary mb-4">
        <Card.Header className="bg-white">
          <Form id="invoiceFilterForm" onSubmit={handleSearch}>
            <Row className="align-items-end g-2">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Search (Invoice#, PO#, or Vendor)</Form.Label>
                  <Form.Control size="sm" type="text" id="filter_search_query" placeholder="Enter keyword..." />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Vendor</Form.Label>
                  <Form.Select size="sm" id="filter_vendor_id">
                    <option value="">All Vendors</option>
                    {masterVendors?.map(v => <option key={v.id} value={v.id}>{v.display_name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} className="text-end">
                <Button variant="primary" size="sm" type="submit" className="w-100">
                  <i className="fas fa-search me-1"></i> Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Header>
        <Card.Body className="p-0">
          <div ref={tableRef}></div>
        </Card.Body>
      </Card>

      {/* React-Bootstrap Modal for Shipping */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton className="py-2 bg-light">
          <Modal.Title className="h6 fw-bold">Shipping & Tracking</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Table responsive bordered striped hover size="sm" className="mb-0" style={{ fontSize: '0.85rem' }}>
            <thead className="table-light">
              <tr>
                <th className="px-3" style={{ width: "25%" }}>Provider</th>
                <th className="px-3">Tracking</th>
                <th className="px-3" style={{ width: "15%" }}>Shipped Date</th>
                <th className="px-3" style={{ width: "15%" }}>Received Date</th>
              </tr>
            </thead>
            <tbody>
              {loadingModal ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary"></div>
                  </td>
                </tr>
              ) : modalData?.length > 0 ? (
                modalData.map((item) => (
                  <tr key={item.po_shipping_id}>
                    <td className="px-3 py-2 text-muted">{item.provider_name}</td>
                    <td className="px-3 py-2 fw-bold">
                      <a href={item.provider_tracking_url} target="_blank" rel="noreferrer" className="text-primary text-decoration-none">
                        {item.tracking_number}
                      </a>
                    </td>
                    <td className="px-3 py-2">{formattedDate(item.shipped_date)}</td>
                    <td className="px-3 py-2">{formattedDate(item.received_date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">No shipping records found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PurchaseInvoiceList;