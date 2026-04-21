import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../../../Config/api";
import VendorLoginCredentialModals from "./VendorLoginCredentialModals";
import Swal from "sweetalert2";
import { apiFetch } from "../../../Utils/apiFetch";
import { useAuth } from "../../../Context/AuthContext";
import CmnHeader from "../../../Components/Common/CmnHeader";
import CommonTable from "../../../Components/Common/CmnTable";

const VendorLoginCredentialsList = () => {
  const { user, authChecked } = useAuth();
  const isSuper = Boolean(user?.is_superuser);

  const [vendorsLoginCredentials, setVendorsLoginCredentials] = useState([]);
  const [modalConfig, setModalConfig] = useState({ type: null, data: null });
  const [vendorsList, setVendorsList] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const credentialVendorIds = useMemo(
    () => new Set((vendorsLoginCredentials || []).map((r) => r.vendor_id)),
    [vendorsLoginCredentials]
  );

  // Fetch vendors (for modal)
  useEffect(() => {
    if (!isSuper) return;

    (async () => {
      try {
        const res = await apiFetch(`${API_BASE}api/vendor_api/lists`);
        setVendorsList(res?.data || []);
      } catch {
        setVendorsList([]);
      }
    })();
  }, [isSuper]);

  // Fetch credentials
  const fetchData = async (search = "") => {
    try {
      const query = new URLSearchParams({
        search: search || "",
      }).toString();

      const res = await apiFetch(
        `${API_BASE}api/vendor-portal-credentials?${query}`
      );

      setVendorsLoginCredentials(res?.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isSuper) fetchData();
  }, [isSuper]);

  const handleDelete = async (row) => {
    Swal.fire({
      title: "Remove credentials?",
      text: `This will delete stored login details for ${row.vendor_company_name || "this vendor"
        }.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#111827",
      confirmButtonText: "Yes, remove",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const res = await apiFetch(
          `${API_BASE}api/vendor-portal-credentials/delete/${row.credential_id}`,
          { method: "DELETE" }
        );

        if (res.status) {
          Swal.fire("Removed", res.message || "Credentials deleted.", "success");
          fetchData(searchValue);
        }
      } catch (e) {
        Swal.fire("Error", e.message || "Failed to delete", "error");
      }
    });
  };

  const tableConfig = [
    {
      title: "Vendor",
      field: "vendor_company_name",
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 700, fontSize: "14px" }}>
            {val || "—"}
          </span>
          <br />
          <span style={{ fontSize: "12px", color: "#6b7280" }}>
            {row.vendor_code || ""}
          </span>
        </div>
      ),
    },
    {
      title: "Website user name",
      field: "website_username",
      render: (val) => (
        <span >
          {val || "—"}
        </span>
      ),
    },
    {
      title: "User email",
      field: "website_user_email",
    },
    {
      title: "Website link",
      field: "website_link",
      render: (val) =>
        val ? (
          <a href={val} target="_blank" rel="noreferrer">
            {val.length > 48 ? `${val.slice(0, 46)}…` : val}
          </a>
        ) : (
          "—"
        ),
    },
    {
      title: "OTP",
      field: "otp_enabled",
      render: (val) =>
        val ? (
          <span className="new_badge new_badge_on">ON</span>
        ) : (
          <span className="new_badge new_badge_off">OFF</span>
        ),
    },
    {
      title: "Status",
      field: "is_active",
      render: (val) =>
        val ? (
          <span className="new_badge new_badge-success">ACTIVE</span>
        ) : (
          <span className="new_badge new_badge_inactive">INACTIVE</span>
        ),
    },
    {
      title: "Actions",
      type: "actions",
      actions: [
        {
          label: "Edit",
          icon: "fas fa-pen",
          className: "cl-edit-btn",
          onClick: (row) =>
            setModalConfig({ type: "edit", data: row }),
        },
        {
          icon: "fas fa-trash",
          className: "cl-del-btn",
          onClick: (row) => handleDelete(row),
        },
      ],
    },
  ];

  if (!authChecked) return null;

  if (!isSuper) {
    return (
      <div className="cl-wrap text-center p-5">
        <h4>Access restricted</h4>
      </div>
    );
  }

  return (
    <div className="cl-wrap">
      <CmnHeader
        title="Vendor Login Credentials"
        subtitle="Manage encrypted vendor portal logins"
        icon1="fas fa-key"
        actionBtn={() => setModalConfig({ type: "add", data: null })}
        actionName="Add Credential"
      />

      {/* Search */}
      <div className="cl-search-wrap">
        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

        <button onClick={() => fetchData(searchValue)}>Search</button>

        {searchValue && (
          <button
            onClick={() => {
              setSearchValue("");
              fetchData("");
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ✅ Only CommonTable */}
      <CommonTable
        config={tableConfig}
        data={vendorsLoginCredentials}
        isSearchable={false}
      />

      {modalConfig.type && (
        <VendorLoginCredentialModals
          config={modalConfig}
          onClose={() => setModalConfig({ type: null, data: null })}
          onRefresh={() => fetchData(searchValue)}
          credentialVendorIds={credentialVendorIds}
          vendorsList={vendorsList}
        />
      )}
    </div>
  );
};

export default VendorLoginCredentialsList;