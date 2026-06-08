import React, { useState, useEffect, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
import {  Form, Row, Col, } from 'react-bootstrap';



export const AddressForm = React.memo(({ type, data, countries, states, onChange }) => (
    <Col md={6} className={type === 'billing' ? "border-end px-4" : "px-4"}>
        <h6 className="fw-bold mb-3">{type === 'billing' ? "Billing Address" : "Shipping Address"}</h6>
        <Form.Group className="mb-2">
            <Form.Label className="small">Billing Attention </Form.Label>
            <Form.Control size="md" value={data.attention || ""} onChange={e => onChange(type, 'attention', e.target.value)} placeholder="e.g., Accounts Payable" />
        </Form.Group>
        <Form.Group className="mb-2">
            <Form.Label className="small">Billing Country </Form.Label>
            <Form.Select size="md" value={data.country || ""} onChange={e => onChange(type, 'country', e.target.value)}>
                <option value="">Select Country</option>
                {countries?.map(c => <option key={c.id} value={c.id}>{c.text}</option>)}
            </Form.Select>
        </Form.Group>
        <Form.Group className="mb-2">
            <Form.Label className="small">Billing Street</Form.Label>
            <Form.Control as="textarea" rows={2} size="md" className="mb-1" value={data.street1 || ""} onChange={e => onChange(type, 'street1', e.target.value)} placeholder="Street 1" />
            <Form.Control as="textarea" rows={2} size="md" value={data.street2 || ""} onChange={e => onChange(type, 'street2', e.target.value)} placeholder="Street 2" />
        </Form.Group>

        <Form.Group className="mb-2">
            <Form.Label className="small">Billing Suburb</Form.Label>
            <Form.Control as="textarea" rows={2} size="md" className="mb-1" value={data.street1 || ""} onChange={e => onChange(type, 'street1', e.target.value)} placeholder="Street 1" />
            <Form.Control as="textarea" rows={2} size="md" value={data.street2 || ""} onChange={e => onChange(type, 'street2', e.target.value)} placeholder="Street 2" />
        </Form.Group>

        <Row className="mb-2">
            <Col md={6}>
                <Form.Label className="small">Billing State</Form.Label>
                <Form.Select size="md" value={data.state || ""} onChange={e => onChange(type, 'state', e.target.value)}>
                    <option value="">Select State</option>
                    {states.map(s => <option key={s.id} value={s.id}>{s.text}</option>)}
                </Form.Select>
            </Col>
            <Col md={6}>
                <Form.Label className="small">Billing City</Form.Label>
                <Form.Control size="md" value={data.city || ""} onChange={e => onChange(type, 'city', e.target.value)} />
            </Col>
        </Row>
        <Row>
            <Col md={6}><Form.Label className="small">Billing Postcode</Form.Label><Form.Control size="md" value={data.zip || ""} onChange={e => onChange(type, 'zip', e.target.value)} /></Col>
            <Col md={6}><Form.Label className="small">Billing Phone</Form.Label><Form.Control size="md" value={data.phone || ""} onChange={e => onChange(type, 'phone', e.target.value)} /></Col>
        </Row>

        {type === 'shipping' && (
            <Form.Group className="mb-2">
                <Form.Label className="small">Delivery Instructions</Form.Label>
                <Form.Control
                    size="md"
                    as="textarea"
                    placeholder="Gate code, loading dock, etc."
                    value={data.delivery_instructions || ""}
                    onChange={e => onChange(type, 'delivery_instructions', e.target.value)}
                />
            </Form.Group>
        )}
    </Col>
));