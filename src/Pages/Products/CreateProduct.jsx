import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Form, Row, Col, Button, Card, Spinner } from 'react-bootstrap';
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { API_BASE } from "../../Config/api";
import { apiFetch } from "../../Utils/apiFetch";

const CreateProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [manufacturers, setManufacturers] = useState([]);
    const [brands, setBrands] = useState([]);

    useEffect(() => {
        const fetchMasterData = async () => {
            setLoading(true);
            try {
                // Fetching both lists concurrently for better performance
                const [brandsRes, manufacturersRes] = await Promise.all([
                    apiFetch(`${API_BASE}api/product_api/product_brands/all`),
                    apiFetch(`${API_BASE}api/product_api/product_manufacturers/all`) // Adjust path as needed
                ]);

                if (brandsRes.status) {
                    setBrands(brandsRes.data || []); // Assuming your API wraps data in a 'data' key
                }

                if (manufacturersRes.status) {
                    setManufacturers(manufacturersRes.data || []);
                }

            } catch (error) {
                console.error("Master data fetch error:", error);
                toast.error("Failed to load brands or manufacturers");
            } finally {
                setLoading(false);
            }
        };

        fetchMasterData();
    }, []);

    // Form state mapping exactly to your list
    const [product, setProduct] = useState({
        product_type: 43,
        sku: "",
        title: "",
        subtitle: "",
        description: "",
        short_description: "",
        brand_id: 0,
        manufacturer_id: 0,
        ean: "",
        upc: "",
        isbn: "",
        mpn: "",
        status_condition: "new",
        asin: "",
        fnsku: "",
        fba_sku: "",
        is_taxable: false,
        is_alias: false
    });


    const handleInputChange = (field, value) => {
        setProduct(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const response = await apiFetch(`${API_BASE}api/product/create`, {
                method: "POST",
                body: JSON.stringify(product),
            });

            if (response.status) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Product Created',
                    icon: 'success',
                    confirmButtonColor: '#000'
                });
                navigate(`/product/edit/${response.product_id}`);
            } else {
                toast.error(response.message || "Save failed");
            }
        } catch (error) {
            toast.error("Network error - Check server connection");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100">
            {/* Header with Actions */}
            <div className="d-flex justify-content-between mb-4 border-bottom pb-3">
                <h3 className="fw-bold m-0">Create New Product</h3>
                <div className="d-flex gap-2">
                    <Button variant="success" onClick={handleSave} disabled={loading}>
                        {loading ? <Spinner size="sm" /> : "Save Product"}
                    </Button>
                    <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                </div>
            </div>

            <Form onSubmit={handleSave}>
                {/* 1. BASIC INFORMATION */}
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-white fw-bold">Basic Information</Card.Header>
                    <Card.Body className="row g-3">
                        <Col md={3}>
                            <Form.Label className="small fw-bold">Product Type</Form.Label>
                            <Form.Select size="sm" value={product.product_type} onChange={e => handleInputChange('product_type', e.target.value)}>
                                <option value="1">Standard</option>
                                <option value="2">Parent</option>
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Label className="small fw-bold">SKU *</Form.Label>
                            <Form.Control size="sm" required value={product.sku} onChange={e => handleInputChange('sku', e.target.value)} />
                        </Col>
                        <Col md={6}>
                            <Form.Label className="small fw-bold">Title *</Form.Label>
                            <Form.Control size="sm" required value={product.title} onChange={e => handleInputChange('title', e.target.value)} />
                        </Col>
                        <Col md={12}>
                            <Form.Label className="small fw-bold">Subtitle</Form.Label>
                            <Form.Control size="sm" value={product.subtitle} onChange={e => handleInputChange('subtitle', e.target.value)} />
                        </Col>
                        <Col md={6}>
                            <Form.Label className="small fw-bold">Description</Form.Label>
                            <ReactQuill theme="snow" value={product.description} onChange={val => handleInputChange('description', val)} style={{ height: '120px', marginBottom: '40px' }} />
                        </Col>
                        <Col md={6}>
                            <Form.Label className="small fw-bold">Short Desc</Form.Label>
                            <ReactQuill theme="snow" value={product.short_description} onChange={val => handleInputChange('short_description', val)} style={{ height: '120px', marginBottom: '40px' }} />
                        </Col>
                    </Card.Body>
                </Card>

                {/* 2. IDENTIFIERS */}
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-white fw-bold">Product Identifiers</Card.Header>
                    <Card.Body className="row g-3">
                        <Col md={3}><Form.Label className="small">Brand </Form.Label><Form.Select type="number" size="sm" value={product.brand_id} onChange={e => handleInputChange('brand_id', e.target.value)} >
                            <option value={""} >select</option>
                            {manufacturers.map((d) => {
                                return <option value={d.manufacturer_id}>{d.name}</option>
                            })}
                        </Form.Select>
                        </Col>
                        <Col md={3}><Form.Label className="small">Manufacturer</Form.Label>
                            <Form.Select size="sm" value={product.manufacturer_id} onChange={e => handleInputChange('manufacturer_id', e.target.value)} >
                                <option value={""} >select</option>
                                {brands.map((d) => {
                                    return <option value={d.brand_id}>{d.name}</option>
                                })}
                            </Form.Select>

                        </Col>
                        <Col md={3}><Form.Label className="small">Condition</Form.Label>
                            <Form.Select size="sm" value={product.status_condition} onChange={e => handleInputChange('status_condition', e.target.value)}>
                                <option value="new">New</option>
                                <option value="used">Used</option>
                                <option value="refurbished">Refurbished</option>
                                <option value="openbox">Open Box</option>
                            </Form.Select>
                        </Col>
                        <Col md={3}><Form.Label className="small">MPN</Form.Label><Form.Control size="sm" value={product.mpn} onChange={e => handleInputChange('mpn', e.target.value)} /></Col>
                        <Col md={4}><Form.Label className="small">EAN</Form.Label><Form.Control size="sm" value={product.ean} onChange={e => handleInputChange('ean', e.target.value)} /></Col>
                        <Col md={4}><Form.Label className="small">UPC</Form.Label><Form.Control size="sm" value={product.upc} onChange={e => handleInputChange('upc', e.target.value)} /></Col>
                        <Col md={4}><Form.Label className="small">ISBN</Form.Label><Form.Control size="sm" value={product.isbn} onChange={e => handleInputChange('isbn', e.target.value)} /></Col>
                    </Card.Body>
                </Card>

                {/* 3. AMAZON & SYSTEM */}
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-white fw-bold">Amazon & Flags</Card.Header>
                    <Card.Body className="row g-3">
                        <Col md={4}><Form.Label className="small">ASIN</Form.Label><Form.Control size="sm" value={product.asin} onChange={e => handleInputChange('asin', e.target.value)} /></Col>
                        <Col md={4}><Form.Label className="small">FNSKU</Form.Label><Form.Control size="sm" value={product.fnsku} onChange={e => handleInputChange('fnsku', e.target.value)} /></Col>
                        <Col md={4}><Form.Label className="small">FBA SKU</Form.Label><Form.Control size="sm" value={product.fba_sku} onChange={e => handleInputChange('fba_sku', e.target.value)} /></Col>
                        <Col md={6} className="d-flex align-items-center gap-4 ms-4">
                            <Form.Check
                                type="switch" className=" fw-bold" label="Is Taxable" checked={product.is_taxable}
                                onChange={e => handleInputChange('is_taxable', e.target.checked)}
                            />
                            <Form.Check
                                type="switch" className="ms-4 fw-bold" label="Is Alias" checked={product.is_alias}
                                onChange={e => handleInputChange('is_alias', e.target.checked)}
                            />
                        </Col>
                    </Card.Body>
                </Card>
            </Form>
        </div>
    );
};

export default CreateProduct;