import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLayout } from "../../Context/LayoutContext";
import { useAuth } from "../../Context/AuthContext";
import { useState } from "react";

export default function Topbar() {
  const { toggleSidebar } = useLayout();
  const { logout } = useAuth();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();


  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Add Vendors", path: "/vendor/addnewvendor" },
    { name: "Vendor Listing", path: "/vendor/vendors" },
    { name: "Import/Export", path: "/vendor/import" },
    { name: "Add Purchases", path: "/purchaseorder/create/AddNew" },
    { name: "View Purchases", path: "/purchaseorder/listing" },
    { name: "Purchase Order Kanban", path: "/purchaseorder/kanbanlisting" },
    { name: "Import/Export", path: "/purchaseorder/importexport" },
    { name: "Add Supplier Return", path: "/" },
    { name: "View Returns", path: "/" },
    { name: "Track Status", path: "/purchaseorder/shipments" },
    { name: "All Invoices", path: "/purchaseorder/invoices" },
    { name: "Dues Todays", path: "/purchaseorder/invoicedue" },
    { name: "All Products", path: "/product/allproducts" },
    { name: "Brands", path: "/product/brands" },
    { name: "Category", path: "/product/categories" },
    { name: "Manufacturers", path: "/product/manufacturers" },
    { name: "Attributes", path: "/product/attributes" },
    { name: "Unit of Measurement", path: "/product/unit_of_measurements" },
    { name: "Users", path: "/security/users" },
    { name: "Roles", path: "/security/roles" },
    { name: "Country", path: "/settings/countries" },
    { name: "Payment Terms", path: "/settings/payment_terms" },
    { name: "Warehouse", path: "/settings/warehouses" },
    { name: "Shipping Providers", path: "/settings/shipping_providers" },
    { name: "Vendor Login Credentials", path: "/settings/vendor_login_credentials" },
    { name: "Organization Profile", path: "/organizations/view" },

  ];


  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );


  return (
    <nav className="">

      <div className="navbar-nav w-100 d-flex justify-content-center">

        <div className="position-relative" style={{ width: "500px" }}>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="form-control rounded-pill"
          />

          {/* Dropdown */}
          {query && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "6px",
                maxHeight: "200px",
                overflowY: "auto",
                zIndex: 1000,
                marginTop: "5px"
              }}
            >
              {filteredItems.length > 0 ? (
                filteredItems.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      navigate(item.path);
                      setQuery("");
                    }}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.background = "#f1f5f9")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.background = "transparent")
                    }
                  >
                    {item.name}
                  </div>
                ))
              ) : (
                <div style={{ padding: "8px 12px", color: "#999" }}>
                  No results found
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </nav>
  );
}
