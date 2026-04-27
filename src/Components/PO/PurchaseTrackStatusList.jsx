import React, { useEffect, useState } from "react";
import { API_BASE } from "../../Config/api";
import { apiFetch } from "../../Utils/apiFetch";
import CmnHeader from "../../Components/Common/CmnHeader";
import CmnTable from "../../Components/Common/CmnTable";
import { Truck } from "lucide-react";
import { Modal, Table, Row, Col, Form, Button, Card, InputGroup } from "react-bootstrap";
import useMasterData from "../../Context/MasterDataProvider";

const PurchaseTrackStatusList = () => {
  const { vendors } = useMasterData();

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    po_order: "",
    vendor_id: "",
    tracking_no: "",
    date_from: "",
    date_to: "",
  });

  const [modal, setModal] = useState({
    show: false,
    data: [],
    loading: false,
  });

  const formattedDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB") : "-";

  // ✅ FETCH WITH FILTERS
  const fetchData = async () => {
    try {
      const query = new URLSearchParams({
        page,
        size,
        ...filters,
      }).toString();

      const res = await apiFetch(
        `${API_BASE}api/purchaseorder/api/intransit/listing_json?${query}`
      );

      setData(res.data || []);
      setTotalPages(res.last_page || 1);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  // ✅ SEARCH
  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  // ✅ CLEAR
  const handleClear = () => {
    setFilters({
      po_order: "",
      vendor_id: "",
      tracking_no: "",
      date_from: "",
      date_to: "",
    });
    setPage(1);
  };

  // ✅ MODAL
  const openTrackingModal = async (row) => {
    setModal({ show: true, data: [], loading: true });

    try {
      const res = await apiFetch(
        `${API_BASE}api/purchaseorder/api/purchase-order/${row.po_id}/${row.product_id}/${row.received_item_id}/shipments/`
      );

      setModal({ show: true, data: res.data || [], loading: false });
    } catch {
      setModal({ show: true, data: [], loading: false });
    }
  };

  // ✅ TABLE CONFIG
  const tableConfig = [
    {
      title: "ORDER DATE",
      field: "order_date",
      render: (val) => formattedDate(val),
    },
    {
      title: "PO NUMBER",
      field: "po_number",
      render: (val, row) => (
        <a
          href={`/purchaseorder/poreceives/edit/${row.po_receive_id}`}
          className="text-primary fw-bold"
        >
          {val}
        </a>
      ),
    },
    {
      title: "ITEM",
      render: (_, row) => (
        <>
          <b>{row.product_name}</b>
          <br />
          <small>{row.product_sku}</small>
        </>
      ),
    },
    { title: "VENDOR", field: "vendor_name" },
    {
      title: "TRACKING",
      render: (_, row) => (
        <span
          className="text-primary"
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => openTrackingModal(row)}
        >
          Track
        </span>
      ),
    },
    { title: "ORDERED QTY", field: "ordered_qty" },
    { title: "RECEIVED QTY", field: "received_qty" },
    {
      title: "STATUS",
      field: "received_status",
      render: (val) =>
        val === 2 ? (
          <span className="new_badge badge-success">Shipped</span>
        ) : (
          <span className="new_badge badge-secondary">Pending</span>
        ),
    },
  ];

  return (
    <div>
      {/* ✅ HEADER */}
      <CmnHeader title="In-Transit Listings" IconLucide={Truck} />

      {/* ✅ FILTERS */}
      <Card className="mb-3 border-0">
        <Card.Body>
          <Row className="g-2 align-items-end">

            <Col lg={2}>
              <Form.Label>PO#</Form.Label>
              <Form.Control
                value={filters.po_order}
                onChange={(e) =>
                  setFilters({ ...filters, po_order: e.target.value })
                }
              />
            </Col>

            <Col lg={2}>
              <Form.Label>Vendor</Form.Label>
              <Form.Select
                value={filters.vendor_id}
                onChange={(e) =>
                  setFilters({ ...filters, vendor_id: e.target.value })
                }
              >
                <option value="">All</option>
                {vendors?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.display_name}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col lg={2}>
              <Form.Label>Tracking</Form.Label>
              <Form.Control
                value={filters.tracking_no}
                onChange={(e) =>
                  setFilters({ ...filters, tracking_no: e.target.value })
                }
              />
            </Col>

            <Col lg={3}>
              <Form.Label>Date</Form.Label>
              <InputGroup>
                <Form.Control
                  type="date"
                  value={filters.date_from}
                  onChange={(e) =>
                    setFilters({ ...filters, date_from: e.target.value })
                  }
                />
                <Form.Control
                  type="date"
                  value={filters.date_to}
                  onChange={(e) =>
                    setFilters({ ...filters, date_to: e.target.value })
                  }
                />
              </InputGroup>
            </Col>

            {/* ✅ INLINE BUTTONS */}
            <Col lg={3} className="d-flex gap-2">
              <Button onClick={handleSearch}>Search</Button>
              <Button variant="outline-secondary" onClick={handleClear}>
                Clear
              </Button>
            </Col>

          </Row>
        </Card.Body>
      </Card>

      {/* ✅ TABLE */}
      <CmnTable
        config={tableConfig}
        data={data}
        isPaginated={true}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />

      {/* ✅ MODAL */}
      <Modal
        show={modal.show}
        onHide={() => setModal({ ...modal, show: false })}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Shipping & Tracking</Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-0">
          <Table bordered size="sm" className="mb-0">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Tracking</th>
                <th>Shipped</th>
                <th>Received</th>
              </tr>
            </thead>

            <tbody>
              {modal.loading ? (
                <tr>
                  <td colSpan="4" className="text-center">Loading...</td>
                </tr>
              ) : modal.data.length ? (
                modal.data.map((item) => (
                  <tr key={item.po_shipping_id}>
                    <td>{item.provider_name}</td>
                    <td>
                      <a href={item.provider_tracking_url} target="_blank" rel="noreferrer">
                        {item.tracking_number}
                      </a>
                    </td>
                    <td>{formattedDate(item.shipped_date)}</td>
                    <td>{formattedDate(item.received_date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PurchaseTrackStatusList;