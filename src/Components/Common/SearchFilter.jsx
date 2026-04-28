import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SbAdminSvg } from "./Svgs/ActionsSvg";
import CommonModal from "./CommonModal";
import {
  MdOutlineSpaceDashboard,
  MdDashboard,
  MdOutlineStore,
  MdStore,
  MdOutlineShoppingCart,
  MdShoppingCart,
  MdOutlineAssignmentReturn,
  MdAssignmentReturn,
  MdOutlineLocalShipping,
  MdLocalShipping,
  MdOutlineAttachMoney,
  MdAttachMoney,
  MdOutlineInventory,
  MdInventory,
  MdOutlineSecurity,
  MdSecurity,
  MdOutlineSettings,
  MdSettings,
  MdOutlineBusiness,
  MdBusiness,
  MdOutlineLogout,
  MdLogout,
} from "react-icons/md";
import { SlidersHorizontal } from "lucide-react";

// ================= DATA =================
const DATA = [
  { label: "Dashboard", icon: MdOutlineSpaceDashboard, activeIcon: MdDashboard, path: "/dashboard" },
  { label: "Vendor", key: "vendor", icon: MdOutlineStore, activeIcon: MdStore },
  { label: "Purchase", key: "purchase", icon: MdOutlineShoppingCart, activeIcon: MdShoppingCart },
  { label: "Supplier Returns", key: "supplier", icon: MdOutlineAssignmentReturn, activeIcon: MdAssignmentReturn },
  { label: "Track Status", icon: MdOutlineLocalShipping, activeIcon: MdLocalShipping, path: "/purchaseorder/shipments" },
  { label: "Finance", key: "finance", icon: MdOutlineAttachMoney, activeIcon: MdAttachMoney },
  { label: "Products", key: "products", icon: MdOutlineInventory, activeIcon: MdInventory },
  { label: "Security", key: "security", icon: MdOutlineSecurity, activeIcon: MdSecurity },
  { label: "Settings", key: "settings", icon: MdOutlineSettings, activeIcon: MdSettings },
  { label: "Organization", icon: MdOutlineBusiness, activeIcon: MdBusiness, path: "/organizations/view" },
  { label: "Logout", icon: MdOutlineLogout, activeIcon: MdLogout, path: "/login" },

  // Submenus
  { label: "Add Vendor", path: "/vendor/addnewvendor", parent: "vendor" },
  { label: "View Vendor", path: "/vendor/vendors", parent: "vendor" },
  { label: "Import/Export", path: "/vendor/import", parent: "vendor" },

  { label: "Add Purchase", path: "/purchaseorder/create/470/AddNew", parent: "purchase" },
  { label: "View Purchases", path: "/purchaseorder/listing", parent: "purchase" },
  { label: "Kanban", path: "/purchaseorder/kanbanlisting", parent: "purchase" },
  { label: "Import/Export", path: "/purchaseorder/importexport", parent: "purchase" },

  { label: "Add Return", path: "#", parent: "supplier" },
  { label: "View Returns", path: "#", parent: "supplier" },

  { label: "Invoices", path: "/purchaseorder/invoices", parent: "finance" },
  { label: "Dues Today", path: "/purchaseorder/invoicedue", parent: "finance" },

  { label: "All Products", path: "/product/allproducts", parent: "products" },
  { label: "Brands", path: "/product/brands", parent: "products" },
  { label: "Category", path: "/product/categories", parent: "products" },
  { label: "Manufacturers", path: "/product/manufacturers", parent: "products" },
  { label: "Attributes", path: "/product/attributes", parent: "products" },
  { label: "Unit Of Measurement", path: "/product/unit_of_measurements", parent: "products" },

  { label: "Users", path: "/security/users", parent: "security" },
  { label: "Roles", path: "/security/roles", parent: "security" },

  { label: "Country", path: "/settings/countries", parent: "settings" },
  { label: "Payment Terms", path: "/settings/payment_terms", parent: "settings" },
  { label: "Warehouse", path: "/settings/warehouses", parent: "settings" },
  { label: "Shipping Providers", path: "/settings/shipping_providers", parent: "settings" },
  { label: "Vendor Login Credentials", path: "/settings/vendor_login_credentials", parent: "settings" },
];

// ================= COMPONENT =================
const SearchFilter = () => {
  const [query, setQuery] = useState("");
  const [show, setShow] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // 👉 Get icon (fallback to parent icon)
  const getIcon = (item) => {
    if (item.icon) return item.icon;
    const parent = DATA.find((d) => d.key === item.parent);
    return parent?.icon;
  };

  // 👉 Filter only items with path
  const filtered = DATA.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) &&
      item.path
  );

  return (
    <div className="relative w-[300px]">

      {/* INPUT */}
      <div className="flex items-center border rounded-full px-3 py-1.5 bg-white ">
        {SbAdminSvg.searchIcon}

        <input
          type="text"
          value={query}
          onFocus={() => setShow(true)}
          onBlur={() => setTimeout(() => setShow(false), 150)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full outline-none text-sm px-2"
        />

        <div
          onClick={() => setOpenModal(!openModal)}
          className="cursor-pointer"
        >
          <SlidersHorizontal className="text-[#454545]" color="#454545" />
        </div>
      </div>

      {/* DROPDOWN */}
      {show && query && (
        <div className="absolute top-full mt-2 w-full bg-white border rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">

          {filtered.length > 0 ? (
            filtered.map((item, index) => {
              const Icon = getIcon(item);

              return (
                <Link
                  to={item.path}
                  key={index}
                  className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition no-underline"
                //   onMouseDown={() => setShow(false)}
                >
                  {Icon && <Icon size={16} className="text-gray-600" />}
                  <span>{item.label}</span>
                </Link>
              );
            })
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              No results found
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {openModal && (
        <CommonModal
          open={openModal}
          title="Select Filter"
          subTitle="Select Filter helps narrow results by choosing options."
          onClose={() => setOpenModal(false)}
        />
      )}
    </div>
  );
};

export default SearchFilter;