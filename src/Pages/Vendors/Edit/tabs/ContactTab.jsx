import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Modal, Row, Col, Form } from 'react-bootstrap';
import { apiFetch } from "../../../../Utils/apiFetch";
import { API_BASE } from "../../../../config/api";
import Swal from "sweetalert2";

const ContactTab = ({ vendorId }) => {
    const [contacts, setContacts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [tempContact, setTempContact] = useState({ first_name: "", last_name: "", email: "", phone: "", department: "" });

    const fetchContacts = useCallback(async () => {
        const res = await apiFetch(`${API_BASE}api/vendor/contact/getall/${vendorId}`);
        if (res.status) setContacts(res.data || []);
    }, [vendorId]);

    useEffect(() => { fetchContacts(); }, [fetchContacts]);

    const handleSave = async () => {
        const url = tempContact.id ? `${API_BASE}api/vendor/contact/update/${tempContact.id}` : `${API_BASE}api/vendor/contact/addNew/${vendorId}`;
        const res = await apiFetch(url, { method: "POST", body: JSON.stringify(tempContact) });
        if (res.status) {
            setShowModal(false);
            fetchContacts();
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Delete Contact?', icon: 'warning', showCancelButton: true });
        if (result.isConfirmed) {
            await apiFetch(`${API_BASE}api/vendor/contact/delete/${id}/${vendorId}`, { method: "POST" });
            fetchContacts();
        }
    };

    return (
        <div className="py-2 px-2">
            <Button variant="link" className="float-end mb-2 small" onClick={() => { setTempContact({}); setShowModal(true); }}>
                <i className="fas fa-plus-circle me-1"></i> Add Contact
            </Button>
            <Table size="sm" bordered hover className="text-center align-middle small">
                <thead className="table-light">
                    <tr><th>NAME</th><th>DEPARTMENT</th><th>EMAIL</th><th>ACTION</th></tr>
                </thead>
                <tbody>
                    {contacts.map(c => (
                        <tr key={c.id}>
                            <td>{c.first_name} {c.last_name}</td>
                            <td>{c.department}</td>
                            <td className="text-primary">{c.email}</td>
                            <td>
                                <Button variant="link" size="sm" className="text-success p-0 me-2" onClick={() => { setTempContact(c); setShowModal(true); }}><i className="fas fa-pen"></i></Button>
                                <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleDelete(c.id)}><i className="fas fa-trash"></i></Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {/* Modal code similar to Warehouse Modal but with contact fields */}
        </div>
    );
};

export default ContactTab;