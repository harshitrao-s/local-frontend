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

  return (
    <nav className="main-header navbar navbar-expand text-sm border-bottom-0 navbar-dark navbar-light">
      
      {/* Left navbar */}
      <ul className="navbar-nav">
        {/* <li className="nav-item">
          <button
            type="button"
            className="nav-link btn"
            onClick={toggleSidebar}
          >
            <i className="fas fa-bars text-white"></i>
          </button>
        </li> */}

        <li className="nav-item d-none">
          <Link to="/dashboard" className="nav-link text-white">
            Home
          </Link>
        </li>
      </ul>

      {/* Right navbar */}
      <ul className="navbar-nav ms-auto">
      </ul>
    </nav>
  );
}
