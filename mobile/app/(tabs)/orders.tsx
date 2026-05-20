import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import api, { Endpoints } from '@/services/api';
import { Palette, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      // NEW ENDPOINT: /transactions (was /orders)
      const res = await api.get(Endpoints.transactions);
      setOrders(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const renderOrder = ({ item }: { item: any }) => {
    // Format date nicely
    const date = new Date(item.created_at).toLocaleDateString();
    
    // Status colors
    let statusColor = Palette.primary;
    if (item.status === 'pending') statusColor = '#f59e0b'; // Amber
    if (item.status === 'rejected') statusColor = Palette.error;
    if (item.status === 'completed') statusColor = Palette.subText;

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
            <Text style={styles.orderId}>Order #{item.id}</Text>
            <Text style={styles.date}>{date}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
            <View>
                <Text style={styles.label}>Total Amount</Text>
                <Text style={styles.amount}>${item.total_value.toFixed(2)}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                    {item.status.toUpperCase()}
                </Text>
            </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order History</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item: any) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={renderOrder}
        ListEmptyComponent={
            <View style={styles.empty}>
                <Ionicons name="receipt-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>No orders yet</Text>
            </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background, padding: Spacing.md },
  header: { marginBottom: Spacing.md },
  title: { fontSize: 28, fontWeight: '800', color: Palette.text },
  
  card: { backgroundColor: Palette.card, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, elevation: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontWeight: '700', fontSize: 16, color: Palette.text },
  date: { color: Palette.subText, fontSize: 14 },
  
  divider: { height: 1, backgroundColor: Palette.border, marginVertical: Spacing.md },
  
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 12, color: Palette.subText },
  amount: { fontSize: 20, fontWeight: '700', color: Palette.primaryDark },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: Palette.subText, marginTop: 10, fontSize: 16 }
});
