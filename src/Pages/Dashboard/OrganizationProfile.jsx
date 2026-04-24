

import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import OrganizationLocations from "./OrganizationLocations";
import { API_BASE } from "../../Config/api";
import { apiFetch } from "../../Utils/apiFetch";
import { Input } from "../../Components/Common/ui/input";
import { Button } from "../../Components/Common/ui/button";
import { Textarea } from "../../Components/Common/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/Common/ui/select";
import CmnHeader from "../../Components/Common/CmnHeader";
import { Building } from "lucide-react"

const OrganizationProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    website_url: "",
    country_id: "",
    street_address: "",
    city: "",
    state_id: "",
    zip_code: "",
    phone: ""
  });

  const [metaData, setMetaData] = useState({
    countries: [],
    states: [],
    stats: { active_users: 0, total_roles: 0 },
    locations: [],
    logo_url: ""
  });

  const loadOrganizationData = async () => {
    try {
      const res = await apiFetch(`${API_BASE}api/organizations/view`);
      if (res.status) {
        const { organization, ...rest } = res.data;
        setFormData({
          company_name: organization.company_name || "",
          email: organization.email || "",
          website_url: organization.website_url || "",
          country_id: organization.country_id || "",
          street_address: organization.street_address || "",
          city: organization.city || "",
          state_id: organization.state_id || "",
          zip_code: organization.zip_code || "",
          phone: organization.phone || ""
        });
        setMetaData({
          countries: rest.countries || [],
          states: rest.states || [],
          stats: rest.stats || { active_users: 0, total_roles: 0 },
          locations: rest.locations || [],
          logo_url: organization.logo_url || ""
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.company_name) {
      return Swal.fire("Required", "Company Name is mandatory.", "info");
    }

    setSaving(true);

    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      dataToSend.append(key, formData[key]);
    });

    const logoFileInput = document.getElementById("logoUpload");
    if (logoFileInput && logoFileInput.files[0]) {
      dataToSend.append("logo", logoFileInput.files[0]);
    }

    try {
      const res = await apiFetch(`${API_BASE}api/organizations/update`, {
        method: "PUT",
        body: dataToSend,
        isFormData: true
      });

      if (res.status) {
        Swal.fire({ icon: 'success', title: 'Success', text: res.message, timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire("Error", res.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server error", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-[16px]">Loading...</div>;

  return (
    <>
      <CmnHeader
        title="Organization Profile" IconLucide={Building} Icon="iwl-add-btn" actionName="Save" actionBtn={handleSave}
      />

      {/* Stats */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Active Users */}
          <div className="p-4 bg-white rounded-[20px] flex items-center gap-4">
            <div className="bg-blue-500 text-white p-3 rounded-[20px]">
              <i className="fas fa-users text-lg"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">ACTIVE USERS</p>
              <h4 className="font-bold">{metaData.stats.active_users}</h4>
            </div>
          </div>

          {/* Total Roles */}
          <div className="p-4 bg-white rounded-[20px] flex items-center gap-4">
            <div className="bg-cyan-500 text-white p-3 rounded-[20px]">
              <i className="fas fa-user-shield text-lg"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">TOTAL ROLES</p>
              <h4 className="font-bold">{metaData.stats.total_roles}</h4>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* LEFT */}
          <div className="lg:col-span-8 space-y-4">

            {/* General */}
            <div className="p-4 rounded-[20px] bg-white space-y-4">

              <div className="">
                <label>Company Name *</label>
                <Input name="company_name" value={formData.company_name} onChange={handleChange} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label>Email</label>
                  <Input name="email" value={formData.email} onChange={handleChange} />
                </div>
                <div>
                  <label>Website</label>
                  <Input name="website_url" value={formData.website_url} onChange={handleChange} />
                </div>
              </div>

            </div>

            {/* Address */}
            <div className=" rounded-[20px] bg-white p-4 space-y-4">

              <div>
                <label>Country</label>
                <Select disabled value={formData.country_id} >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {metaData.countries.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label>Street</label>
                <Textarea name="street_address" value={formData.street_address} onChange={handleChange} />
              </div>

              <div className="grid md:grid-cols-12 gap-4">
                <Input className="md:col-span-6" name="city" value={formData.city} onChange={handleChange} />

                <Select value={formData.state_id} onValueChange={(val) => handleChange({ target: { name: 'state_id', value: val } })}>
                  <SelectTrigger className="md:col-span-3">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    {metaData.states.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input className="md:col-span-3" name="zip_code" value={formData.zip_code} onChange={handleChange} />
              </div>

              <Input name="phone" value={formData.phone} onChange={handleChange} />

            </div>

          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4">
            <div className=" rounded-[20px] p-4 text-center bg-white">
              <img src="/Logo.svg" className="h-[80px] mx-auto object-contain" />
              <Input type="file" id="logoUpload" className="mt-3" />
            </div>
          </div>

        </div>

        <OrganizationLocations locations={metaData.locations} />
      </div>

    </>
  );
};

export default OrganizationProfile;
