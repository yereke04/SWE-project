// src/components/Layout.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";

export function DashboardLayout({ children }) {
  const { endSession } = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    endSession();
    navigate("/");
  };

  return (
    <div className="layout-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div style={{ marginBottom: "2rem", fontSize: "1.25rem", fontWeight: "bold" }}>
          <span style={{ color: "#3b82f6" }}>Nexus</span>Supplier
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
          <NavLink to="/dashboard" active={isActive("/dashboard")} label="Overview" />
          <NavLink to="/inventory" active={isActive("/inventory")} label="Inventory" />
          <NavLink to="/orders" active={isActive("/orders")} label="Orders" />
          <NavLink to="/messages" active={isActive("/messages")} label="Messages" />
          <NavLink to="/settings" active={isActive("/settings")} label="Settings" />
        </nav>

        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid #334155" }}>
          <button 
            onClick={handleLogout}
            className="btn btn-ghost" 
            style={{ color: "#94a3b8", width: "100%", justifyContent: "flex-start" }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

// Helper component for sidebar links
function NavLink({ to, active, label }) {
  return (
    <Link
      to={to}
      style={{
        display: "block",
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        textDecoration: "none",
        color: active ? "#ffffff" : "#94a3b8",
        backgroundColor: active ? "#3b82f6" : "transparent",
        fontWeight: 500,
        transition: "all 0.2s"
      }}
    >
      {label}
    </Link>
  );
}
