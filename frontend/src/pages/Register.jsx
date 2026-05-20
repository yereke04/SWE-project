import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";

export default function Register() {
  const { registerUser, authenticateUser } = useSession();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register
      await registerUser({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName, // Backend expects 'full_name'
        role: "merchant_admin"        // Hardcoded for web portal
      });

      // Auto-login
      await authenticateUser(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      alert("Registration failed. Email might be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#f1f5f9" }}>
      <div className="card" style={{ width: "100%", maxWidth: "450px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "0.5rem", color: "#0f172a" }}>Join Nexus</h2>
        <p style={{ textAlign: "center", marginBottom: "1.5rem", color: "#64748b" }}>Create your supplier account</p>

        <form onSubmit={handleSubmit}>
          <input 
            className="input-field" 
            placeholder="Company Name / Full Name" 
            required 
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          />
          <input 
            className="input-field" 
            placeholder="Business Email" 
            type="email"
            required 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            className="input-field" 
            placeholder="Password" 
            type="password"
            required 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
            {loading ? "Creating Account..." : "Get Started"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem" }}>
          <Link to="/" style={{ color: "#64748b", textDecoration: "none" }}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
