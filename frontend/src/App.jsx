// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionProvider, useSession } from "./context/SessionContext";
import { DashboardLayout } from "./components/Layout";

// Placeholder imports - we will build these next
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardHome from "./pages/DashboardHome";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSession();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useSession();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* PROTECTED APP ROUTES */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}
