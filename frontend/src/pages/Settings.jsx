import React, { useEffect, useState } from "react";
import { Backend } from "../services/client";

export default function Settings() {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // 1. Fetch the profile data to get the current visibility status
    // NOTE: We don't have a specific GET /profile endpoint, so we use a POST to check the current status 
    // or rely on an assumption that the status is somehow exposed, but to be robust, we need a small change in the Backend.
    
    // Since the original backend didn't have a GET endpoint for profile status, 
    // we'll store the state locally and assume visibility is updated correctly via the toggle endpoint.
    const savedVis = localStorage.getItem("merchant_is_visible") === "true";
    setIsVisible(savedVis);
    setLoading(false);
  }, []);

  const toggleVisibility = async () => {
    if (isUpdating) return;

    const newStatus = !isVisible;
    const action = newStatus ? 'show' : 'hide'; // Backend expects 'show' or 'hide'

    setIsUpdating(true);
    try {
      // Endpoint: /merchants/visibility?action=show/hide (based on your refactored backend)
      await Backend.post(`/merchants/visibility?action=${action}`);
      
      setIsVisible(newStatus);
      localStorage.setItem("merchant_is_visible", newStatus);
      alert(`Profile visibility set to ${newStatus ? 'Public' : 'Private'}`);
    } catch (e) {
      alert(`Failed to change visibility: ${e.message}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const statusColor = isVisible ? "rgba(22,163,74,0.15)" : "rgba(239,68,68,0.15)"; // Green or Red
  const statusTextColor = isVisible ? "#15803d" : "#ef4444"; 

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>Loading settings...</div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "2rem" }}>Settings & Profile</h1>

      <div className="card" style={{ maxWidth: 700 }}>
        <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>Market Visibility</h3>
        <p style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
          Toggle this setting to control whether your company profile appears in the Buyer's public marketplace.
        </p>

        <div 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            padding: "1rem", 
            borderRadius: "8px",
            backgroundColor: statusColor,
            border: `1px solid ${statusTextColor}`
          }}
        >
          <div style={{ color: statusTextColor, fontWeight: 600 }}>
            Status: {isVisible ? "PUBLIC (Visible)" : "PRIVATE (Hidden)"}
          </div>
          
          <button 
            className="btn" 
            style={{ 
              backgroundColor: statusTextColor, 
              color: 'white' 
            }}
            onClick={toggleVisibility}
            disabled={isUpdating}
          >
            {isUpdating 
              ? "Updating..." 
              : isVisible 
                ? "Set Private" 
                : "Set Public"
            }
          </button>
        </div>

        <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Note: Customers who already have an active partnership will still be able to view your catalog regardless of this setting.
        </p>
      </div>
    </div>
  );
}
