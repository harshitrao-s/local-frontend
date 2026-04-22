import React, { useState } from "react";
import Logo from "../../Assets/dist/img/logo.png";
import SmallLogo from "../../Assets/dist/img/smalllogo.png";
import {
  MdKeyboardArrowDown,

  // ICON PAIRS
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

import { NavLink, useLocation } from "react-router-dom";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: MdOutlineSpaceDashboard,
      activeIcon: MdDashboard,
      path: "/dashboard",
    },
    {
      title: "Vendor",
      key: "vendor",
      icon: MdOutlineStore,
      activeIcon: MdStore,
      submenu: [
        { title: "Add Vendor", path: "/vendor/addnewvendor" },
        { title: "View Vendor", path: "/vendor/vendors" },
        { title: "Import/Export", path: "/vendor/import" },
      ],
    },
    {
      title: "Purchase",
      key: "purchase",
      icon: MdOutlineShoppingCart,
      activeIcon: MdShoppingCart,
      submenu: [
        { title: "Add Purchase", path: "/purchaseorder/create/470/AddNew" },
        { title: "View Purchases", path: "/purchaseorder/listing" },
        { title: "Kanban", path: "/purchaseorder/kanbanlisting" },
      ],
    },
    {
      title: "Supplier Returns",
      key: "supplier",
      icon: MdOutlineAssignmentReturn,
      activeIcon: MdAssignmentReturn,
      submenu: [
        { title: "Add Return", path: "/supplier-return/add" },
        { title: "View Returns", path: "/supplier-return/listing" },
      ],
    },
    {
      title: "Track Status",
      icon: MdOutlineLocalShipping,
      activeIcon: MdLocalShipping,
      path: "/purchaseorder/shipments",
    },
    {
      title: "Finance",
      key: "finance",
      icon: MdOutlineAttachMoney,
      activeIcon: MdAttachMoney,
      submenu: [
        { title: "Invoices", path: "/purchaseorder/invoices" },
        { title: "Dues Today", path: "/purchaseorder/invoicedue" },
      ],
    },
    {
      title: "Products",
      key: "products",
      icon: MdOutlineInventory,
      activeIcon: MdInventory,
      submenu: [
        { title: "All Products", path: "/product/allproducts" },
        { title: "Brands", path: "/product/brands" },
        { title: "Category", path: "/product/categories" },
      ],
    },
    {
      title: "Security",
      key: "security",
      icon: MdOutlineSecurity,
      activeIcon: MdSecurity,
      submenu: [
        { title: "Users", path: "/security/users" },
        { title: "Roles", path: "/security/roles" },
      ],
    },
    {
      title: "Settings",
      key: "settings",
      icon: MdOutlineSettings,
      activeIcon: MdSettings,
      submenu: [
        { title: "Country", path: "/settings/countries" },
        { title: "Warehouse", path: "/settings/warehouses" },
      ],
    },
    {
      title: "Organization",
      icon: MdOutlineBusiness,
      activeIcon: MdBusiness,
      path: "/organizations/view",
    },
    {
      title: "Logout",
      icon: MdOutlineLogout,
      activeIcon: MdLogout,
      path: "/logout",
    },
  ];

  const toggleMenu = (key) => {
    setOpenMenu(openMenu === key ? null : key);
  };

  return (
    <nav className="w-[250px] h-screen bg-gray-50 border-r px-3 py-4 overflow-y-auto">

      {/* Logo */}
      <div className="flex items-center justify-between mb-6">
        {collapsed ? (
          <img src={SmallLogo} alt="Small Logo" className="w-8" />
        ) : (
          <img src={Logo} alt="Logo" className="w-36" />
        )}

      </div>

      {/* Menu */}
      <div className="space-y-1">
        {menuItems.map((item, index) => {
          const DefaultIcon = item.icon;
          const ActiveIcon = item.activeIcon;

          const isSubmenuActive =
            item.submenu &&
            item.submenu.some((sub) =>
              location.pathname.startsWith(sub.path)
            );

          return (
            <div key={index}>

              {/* With Submenu */}
              {item.submenu ? (
                <>
                  <div
                    onClick={() => toggleMenu(item.key)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
                      ${isSubmenuActive
                        ? "bg-[#d9edff] text-black rounded-full"
                        : "text-gray-600 hover:bg-[#d9edff] hover:text-black rounded-full"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* ICON SWITCH */}
                      {isSubmenuActive ? (
                        <ActiveIcon className="text-lg" />
                      ) : (
                        <>
                          <DefaultIcon className="text-lg group-hover:hidden" />
                          <ActiveIcon className="text-lg hidden group-hover:block" />
                        </>
                      )}
                      <span>{item.title}</span>
                    </div>

                    <MdKeyboardArrowDown
                      className={`transition-transform ${openMenu === item.key || isSubmenuActive
                        ? "rotate-180"
                        : ""
                        }`}
                    />
                  </div>

                  {/* Submenu */}
                  {(openMenu === item.key || isSubmenuActive) && (
                    <div className="ml-6 mt-1 border-l pl-4 space-y-1 text-sm">
                      {item.submenu.map((sub, i) => (
                        <NavLink
                          key={i}
                          to={sub.path}
                          className={({ isActive }) =>
                            `block px-2 py-1 rounded-md transition-all duration-200
   no-underline hover:no-underline focus:no-underline active:no-underline
                             ${isActive
                              ? "bg-[#d9edff] text-black rounded-full"
                              : "text-gray-500 hover:bg-[#d9edff] hover:text-black rounded-full"
                            }`
                          }
                        >
                          {sub.title}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Simple Menu */
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
   no-underline hover:no-underline focus:no-underline active:no-underline
                     ${isActive
                      ? "bg-[#d9edff] text-black rounded-full"
                      : "text-gray-600 hover:bg-[#d9edff] hover:text-black rounded-full"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <ActiveIcon className="text-lg" />
                      ) : (
                        <>
                          <DefaultIcon className="text-lg group-hover:hidden" />
                          <ActiveIcon className="text-lg hidden group-hover:block" />
                        </>
                      )}
                      <span>{item.title}</span>
                    </>
                  )}
                </NavLink>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default Sidebar;