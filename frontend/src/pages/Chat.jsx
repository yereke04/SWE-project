import React, { useEffect, useState } from "react";
import { Backend } from "../services/client";

export default function Chat() {
  const [partners, setPartners] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // 1. Load "Partners" (People I can chat with)
  useEffect(() => {
    const loadPartners = async () => {
      try {
        // We use accepted partnerships to find people
        const links = await Backend.get("/merchants/partnerships/received");
        const accepted = links.filter(l => l.status === 'active');
        setPartners(accepted);
      } catch (e) {}
    };
    loadPartners();
  }, []);

  // 2. Poll Messages
  useEffect(() => {
    if(!activeChat) return;
    
    const fetchMsgs = async () => {
      try {
        // Use buyer_id for the chat endpoint
        const msgs = await Backend.get(`/communication/chat/${activeChat.buyer_id}`);
        setMessages(msgs);
      } catch (e) {}
    };

    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3000);
    return () => clearInterval(interval);
  }, [activeChat]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if(!input.trim()) return;

    try {
      await Backend.post("/communication/chat", {
        receiver_id: activeChat.buyer_id,
        message_body: input
      });
      setInput("");
      // Refresh immediately
      const msgs = await Backend.get(`/communication/chat/${activeChat.buyer_id}`);
      setMessages(msgs);
    } catch (e) {
      alert("Failed to send");
    }
  };

  return (
    <div className="card" style={{ display: "flex", height: "calc(100vh - 140px)", padding: 0, overflow: "hidden" }}>
      {/* Sidebar List */}
      <div style={{ width: "250px", borderRight: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
        <div style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", fontWeight: "bold" }}>Contacts</div>
        {partners.map(p => (
          <div 
            key={p.id}
            onClick={() => setActiveChat(p)}
            style={{ 
              padding: "1rem", 
              cursor: "pointer", 
              backgroundColor: activeChat?.id === p.id ? "#e2e8f0" : "transparent",
              fontWeight: activeChat?.id === p.id ? 600 : 400
            }}
          >
            {p.buyer_name || `Customer #${p.buyer_id}`}
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeChat ? (
          <>
            <div style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", fontWeight: "bold" }}>
              Chat with {activeChat.buyer_name || `Customer #${activeChat.buyer_id}`}
            </div>
            
            <div style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {messages.map(msg => {
                const isMe = msg.sender_id !== activeChat.buyer_id; // If sender is NOT the buyer, it's me (merchant)
                return (
                  <div key={msg.id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                    <div style={{ 
                      backgroundColor: isMe ? "#3b82f6" : "#e2e8f0", 
                      color: isMe ? "white" : "#1e293b",
                      padding: "0.5rem 1rem", 
                      borderRadius: "12px" 
                    }}>
                      {msg.message_body}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px", textAlign: isMe ? "right" : "left" }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={sendMessage} style={{ padding: "1rem", borderTop: "1px solid #e2e8f0", display: "flex", gap: "0.5rem" }}>
              <input 
                className="input-field" 
                style={{ marginBottom: 0 }} 
                placeholder="Type a message..." 
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Send</button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
