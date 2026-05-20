import React, { useEffect, useState } from "react";
import { Backend } from "../services/client";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [newItem, setNewItem] = useState({ name: "", price: "", stock: "", unit_type: "unit" });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      // GET /inventory/me
      const data = await Backend.get("/inventory/me");
      setItems(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await Backend.post("/inventory/", {
        name: newItem.name,
        price: parseFloat(newItem.price),
        stock: parseInt(newItem.stock),
        unit_type: newItem.unit_type
      });
      setIsAdding(false);
      setNewItem({ name: "", price: "", stock: "", unit_type: "unit" });
      loadInventory();
    } catch (e) {
      alert("Failed to create item");
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Delete this item?")) return;
    try {
      await Backend.del(`/inventory/${id}`);
      loadInventory();
    } catch (e) {
      alert("Delete failed");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>Inventory</h1>
        <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : "+ Add Item"}
        </button>
      </div>

      {isAdding && (
        <div className="card" style={{ marginBottom: "2rem", maxWidth: "600px" }}>
          <h3 style={{ marginBottom: "1rem" }}>New Product</h3>
          <form onSubmit={handleCreate}>
            <input className="input-field" placeholder="Product Name" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <input className="input-field" type="number" placeholder="Price" required value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
              <input className="input-field" type="number" placeholder="Stock" required value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})} />
              <input className="input-field" placeholder="Unit (e.g. kg, box)" required value={newItem.unit_type} onChange={e => setNewItem({...newItem, unit_type: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary">Save Item</button>
          </form>
        </div>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Unit</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.name}</td>
                <td>${item.price}</td>
                <td>
                  <span style={{ color: item.stock < 10 ? "#ef4444" : "inherit", fontWeight: item.stock < 10 ? "bold" : "normal" }}>
                    {item.stock}
                  </span>
                </td>
                <td>{item.unit_type}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost" style={{ color: "#ef4444", padding: "0.4rem" }} onClick={() => handleDelete(item.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
