import React, { useEffect, useState } from "react";
import { Backend } from "../services/client";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await Backend.get("/transactions");
      setOrders(data);
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await Backend.put(`/transactions/${id}/status`, { status });
      loadOrders();
    } catch (e) {
      alert("Update failed");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "2rem" }}>Order Management</h1>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Buyer ID</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>Customer #{order.buyer_id}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td style={{ fontWeight: "bold" }}>${order.total_value}</td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td>
                  {order.status === 'pending' && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn btn-primary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }} onClick={() => updateStatus(order.id, 'completed')}>
                        Complete
                      </button>
                      <button className="btn btn-ghost" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", color: "#ef4444" }} onClick={() => updateStatus(order.id, 'rejected')}>
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: { bg: "#fef3c7", text: "#b45309" },
    completed: { bg: "#dcfce7", text: "#166534" },
    rejected: { bg: "#fee2e2", text: "#991b1b" }
  };
  const style = colors[status] || { bg: "#f3f4f6", text: "#374151" };

  return (
    <span style={{ 
      backgroundColor: style.bg, 
      color: style.text, 
      padding: "0.25rem 0.75rem", 
      borderRadius: "999px", 
      fontSize: "0.75rem", 
      fontWeight: 600,
      textTransform: "uppercase"
    }}>
      {status}
    </span>
  );
}
