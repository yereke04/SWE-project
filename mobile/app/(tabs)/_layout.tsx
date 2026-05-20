import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '@/constants/theme';
import { useAuth } from '../../context/AuthContext'; // Import Auth

export default function TabLayout() {
  const { logout } = useAuth(); // Get logout function

  return (
    <Tabs
      screenOptions={{
        headerShown: true, // Changed to true to show header
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
            <Ionicons name="log-out-outline" size={24} color={Palette.error} />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#f1f5f9',
            paddingTop: 6,
            height: Platform.OS === 'ios' ? 88 : 60,
        },
        tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginBottom: 4,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Market',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "storefront" : "storefront-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mysuppliers"
        options={{
          title: 'Network',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "receipt" : "receipt-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
