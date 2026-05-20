// src/services/client.js
const API_ROOT = "http://localhost:8000";

/**
 * Secure Fetch Wrapper
 * Handles token injection and error parsing
 */
async function request(endpoint, config = {}) {
  const token = localStorage.getItem("session_token"); // Changed from 'token' to 'session_token'
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...config.headers,
  };

  const response = await fetch(`${API_ROOT}${endpoint}`, {
    ...config,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Request failed: ${response.status}`);
  }

  return response.json();
}

// Exported as "Backend" instead of "api"
export const Backend = {
  get: (url) => request(url, { method: "GET" }),
  
  post: (url, data) => request(url, { 
    method: "POST", 
    body: JSON.stringify(data) 
  }),
  
  put: (url, data) => request(url, { 
    method: "PUT", 
    body: JSON.stringify(data) 
  }),

  del: (url) => request(url, { method: "DELETE" }),

  // Specialized Auth Request (Form Data)
  authenticate: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    // CRITICAL FIX: Changed endpoint from /auth/token to /api/v1/auth/login
    const response = await fetch(`${API_ROOT}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!response.ok) throw new Error("Invalid Credentials");
    return response.json();
  }
};
