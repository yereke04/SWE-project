import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ⚠️ REPLACE with your current Ngrok URL
const BASE_URL = 'https://unwarped-bullheadedly-eladia.ngrok-free.dev/';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

// Centralized Endpoints to keep code clean and matching your NEW backend
export const Endpoints = {
  login: '/api/v1/auth/login',
  register: '/api/v1/auth/signup',
  
  merchants: '/merchants',                  // Was /suppliers
  partnerships: '/merchants/partnerships',  // Was /links
  inventory: '/inventory/merchant',         // Was /products/supplier
  transactions: '/transactions',            // Was /orders
  
  myInventory: '/inventory/me',
  chat: '/communication/chat',
};
