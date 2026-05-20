import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Override in mobile/.env: EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:8000
const DEFAULT_API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '');

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
  transactions: '/transactions/',
  
  myInventory: '/inventory/me',
  chat: '/communication/chat',
};
