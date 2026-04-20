import { Link, useLocation } from "react-router-dom";
import { useLayout } from "../../Context/LayoutContext";
import { useAuth } from "../../Context/AuthContext";
import { useState } from "react";

export default function Topbar() {
  const { toggleSidebar } = useLayout();
  const { logout } = useAuth();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  // Active route check

  const handleLogout = async () => {
    if (loggingOut) return; // 🔒 prevent double click
    setLoggingOut(true);

    // Close dropdown immediately (AdminLTE / Bootstrap fix)
    document.activeElement?.blur();

    await logout(); //  single source of truth
  };

  return (
    <nav className="main-header navbar navbar-expand text-sm border-bottom-0 navbar-dark navbar-light">
      
      {/* Left navbar */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <button
            type="button"
            className="nav-link btn"
            onClick={toggleSidebar}
          >
            <i className="fas fa-bars text-white"></i>
          </button>
        </li>

        <li className="nav-item d-none">
          <Link to="/dashboard" className="nav-link text-white">
            Home
          </Link>
        </li>
      </ul>

      {/* Right navbar */}
      <ul className="navbar-nav ms-auto">
        
        {/* Organization */}
        

        {/* Dropdown */}
        {/* <li className="nav-item dropdown">
          <button
            className="nav-link btn"
            data-bs-toggle="dropdown"
            type="button"
            disabled={loggingOut}
          >
            <i className="fas fa-th-large text-white"></i>
          </button>

          <div className="dropdown-menu dropdown-menu-sm dropdown-menu-end shadow">
            <button
              onClick={handleLogout}
              className="dropdown-item py-2"
              disabled={loggingOut}
            >
              <i className="fas fa-power-off me-2 text-danger"></i>
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </li> */}

      </ul>
    </nav>
  );
}
