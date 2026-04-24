import React, { useState, useEffect } from "react";
import { API_BASE } from "../../Config/api";
import { apiFetch } from "../../Utils/apiFetch";
import Swal from 'sweetalert2';
import { Input } from "../../Components/Common/ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "../../Components/Common/ui/select";

const LocationModal = ({ mode, locationId, onClose, countries, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statesList, setStatesList] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    parent_location_id: "",
    attention: "",
    address_line1: "",
    address_line2: "",
    city: "",
    zip_code: "",
    phone: "",
    fax: "",
    website_url: "",
    country_id: "",
    state_name: ""
  });

  // 1. Fetch States based on Country Change
  const fetchStates = async (countryId) => {
    if (!countryId) {
      setStatesList([]);
      return;
    }
    try {
      const res = await apiFetch(`${API_BASE}api/common/list_states/?country_id=${countryId}`);
      if (res) {
        // Mapping 'results' from your API to the local state
        setStatesList(res.results || []);
      }
    } catch (err) {
      console.error("Error fetching states:", err);
    }
  };

  // 2. Load Existing Details for Edit Mode
  useEffect(() => {
    if (mode === 'edit' && locationId) {
      const fetchLocationDetails = async () => {
        setLoading(true);
        try {
          const res = await apiFetch(`${API_BASE}api/organizations/locations/detail/${locationId}`);
          if (res.status) {
            const d = res.data;
            setFormData({
              name: d.name || "",
              parent_location_id: d.parent_location_id || "",
              attention: d.attention || "",
              address_line1: d.address_line1 || "",
              address_line2: d.address_line2 || "",
              city: d.city || "",
              zip_code: d.zip_code || "",
              phone: d.phone || "",
              fax: d.fax || "",
              website_url: d.website_url || "",
              country_id: d.country_id || "",
              state_name: d.state_name || ""
            });
            // Immediately load states for the existing country
            if (d.country_id) fetchStates(d.country_id);
          }
        } catch (err) {
          Swal.fire("Error", "Could not fetch location details", "error");
        } finally {
          setLoading(false);
        }
      };
      fetchLocationDetails();
    }
  }, [mode, locationId]);

  // 3. Handle Input Changes & Trigger State API
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "country_id") {
      setFormData(prev => ({ ...prev, state_name: "" })); 
      fetchStates(value);
    }
  };

  // 4. Handle Save (POST for Add, PUT for Edit)
  const handleSave = async () => {
    if (!formData.name) {
      return Swal.fire("Required", "Location Name is mandatory.", "info");
    }

    setSaving(true);
    try {
      const url = mode === 'edit' 
        ? `${API_BASE}api/organizations/locations/update/${locationId}` 
        : `${API_BASE}api/organizations/locations/add/`;
      
      const method = mode === 'edit' ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method: method,
        body: JSON.stringify(formData)
      });

      if (res.status) {
        Swal.fire({ icon: 'success', title: 'Success', text: res.message, timer: 2000, showConfirmButton: false });
        if (onRefresh) onRefresh(); 
        setTimeout(()=>{
           window.location.reload()
        },600 ) 
        onClose(); 
      } else {
        Swal.fire("Error", res.message || "Operation failed", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server error occurred while saving.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              {mode === 'edit' ? <i className="fas fa-edit me-2"></i> : <i className="fas fa-plus me-2"></i>}
              {mode === 'edit' ? 'Edit Location' : 'Add New Location'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {loading ? (
              <div className="text-center py-5"><i className="fas fa-spinner fa-spin fa-2x text-primary"></i></div>
            ) : (
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Location Name *</label>
                  {/* <input name="name" className="form-control shadow-sm" value={formData.name} onChange={handleChange} /> */}
                  <Input  name="name"  value={formData.name} onChange={handleChange}/>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Attention</label>
                  <Input  name="attention"  value={formData.attention} onChange={handleChange}/>
                </div>
                <div className="col-md-12">
                  <label className="form-label fw-bold small">Address Line 1</label>
                  <Input   name="address_line1"  value={formData.address_line1} onChange={handleChange}/>
                </div>
                <div className="col-md-12">
                  <label className="form-label fw-bold small">Address Line 2</label>
                  <Input  name="address_line2"  value={formData.address_line2} onChange={handleChange}/>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold small">City</label>
                  <Input  name="city" value={formData.city} onChange={handleChange}/>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold small">Country</label>
                  {/* <select name="country_id" className="form-select shadow-sm" value={formData.country_id} onChange={handleChange}>
                    <option value="">Select Country</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.text || c.name}</option>)}
                  </select> */}

                  <Select name="country_id" value={formData.country_id} onChange={handleChange}>
                  <SelectTrigger className="md:col-span-3">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.text || c.name}</option>)}
                  </SelectContent>
                </Select>

                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold small">State</label>
                  {/* <select 
                    name="state_name" 
                    className="form-select shadow-sm" 
                    value={formData.state_name} 
                    onChange={handleChange}
                    disabled={!formData.country_id}
                  >
                    <option value="">Select State</option>
                    {statesList.map(s => <option key={s.id} value={s.name}>{s.text || s.name}</option>)}
                  </select> */}

                  <Select name="state_name" 
                    className="form-select shadow-sm" 
                    value={formData.state_name} 
                    onChange={handleChange}
                    disabled={!formData.country_id}>

                  <SelectTrigger className="md:col-span-3">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                  {statesList.map(s => <option key={s.id} value={s.name}>{s.text || s.name}</option>)}
                  </SelectContent>
                </Select>

                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold small">ZIP Code</label>
                  <Input name="zip_code" value={formData.zip_code} onChange={handleChange}/>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold small">Phone</label>
                  <Input name="phone"  value={formData.phone} onChange={handleChange}/>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold small">Website</label>
                  <Input name="website_url"  value={formData.website_url} onChange={handleChange}/>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer bg-light border-0">
            <button className="btn btn-secondary px-4 shadow-sm" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn btn-primary px-4 shadow-sm" onClick={handleSave} disabled={loading || saving}>
              {saving ? <><i className="fas fa-spinner fa-spin me-1"></i> Saving...</> : <><i className="fas fa-save me-1"></i> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;