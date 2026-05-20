import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";

export default function Login() {
  const { authenticateUser } = useSession();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authenticateUser(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#f1f5f9" }}>
      <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#0f172a" }}>Supplier Login</h2>
        
        {error && (
          <div style={{ padding: "0.75rem", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>Email</label>
            <input 
              className="input-field" 
              name="email" 
              type="email" 
              required 
              placeholder="admin@company.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>Password</label>
            <input 
              className="input-field" 
              name="password" 
              type="password" 
              required 
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "#64748b" }}>
          Don't have an account? <Link to="/register" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>Register here</Link>
        </div>
      </div>
    </div>
  );
}
