import React, { useEffect, useState } from "react";
import { Backend } from "../services/client";

export default function DashboardHome() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, partners: 0 });
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 1. Get Link Requests (Partnerships)
      const links = await Backend.get("/merchants/partnerships/received");
      setRequests(links.filter(l => l.status === 'pending'));
      const activeCount = links.filter(l => l.status === 'active').length;

      // 2. Get Orders
      const orders = await Backend.get("/transactions");
      const totalRev = orders.reduce((sum, o) => sum + o.total_value, 0);

      setStats({
        orders: orders.length,
        revenue: totalRev,
        partners: activeCount
      });
    } catch (e) {
      console.error("Dashboard load error", e);
    }
  };

  const handleAction = async (id, status) => {
    try {
      // PUT /merchants/partnerships/{id}
      await Backend.put(`/merchants/partnerships/${id}`, { status });
      loadData(); // Refresh
    } catch (e) {
      alert("Action failed");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Overview</h1>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <StatCard label="Total Revenue" value={`$${stats.revenue.toFixed(2)}`} />
        <StatCard label="Total Orders" value={stats.orders} />
        <StatCard label="Active Partners" value={stats.partners} />
      </div>

      {/* Pending Requests Section */}
      <div className="card">
        <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Connection Requests</h3>
        
        {requests.length === 0 ? (
          <p style={{ color: "#64748b" }}>No pending requests.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Buyer Name</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                  <td>{req.buyer_name || `User #${req.buyer_id}`}</td>
                  <td>{new Date(req.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }} onClick={() => handleAction(req.id, 'active')}>
                        Accept
                      </button>
                      <button className="btn btn-ghost" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", color: "#ef4444" }} onClick={() => handleAction(req.id, 'rejected')}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ color: "#64748b", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>{label}</div>
      <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#0f172a" }}>{value}</div>
    </div>
  );
}
