// src/context/SessionContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { Backend } from "../services/client";

const SessionContext = createContext();

export function SessionProvider({ children }) {
  // Renamed 'token' to 'sessionToken' to differentiate state
  const [sessionToken, setSessionToken] = useState(() => {
    try {
      return localStorage.getItem("session_token");
    } catch {
      return null;
    }
  });

  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    try {
      if (sessionToken) {
        localStorage.setItem("session_token", sessionToken);
        // Optional: Fetch user profile here if you had an endpoint for it
      } else {
        localStorage.removeItem("session_token");
        setUserProfile(null);
      }
    } catch {}
  }, [sessionToken]);

  const authenticateUser = async (email, pass) => {
    try {
      const response = await Backend.authenticate(email, pass);
      setSessionToken(response.access_token);
      return true;
    } catch (error) {
      console.error("Session Error:", error);
      throw error;
    }
  };

  const endSession = () => {
    setSessionToken(null);
    // Redirect logic handled by components consuming this context
  };

  const registerUser = async (payload) => {
    // CHANGED: Point to the correct backend endpoint
    return Backend.post("/api/v1/auth/signup", payload);
  };

  return (
    <SessionContext.Provider 
      value={{ 
        sessionToken, 
        isAuthenticated: !!sessionToken,
        authenticateUser, 
        endSession,
        registerUser,
        userProfile 
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
