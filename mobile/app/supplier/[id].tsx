import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api, { Endpoints } from '@/services/api';
import { Palette, Spacing, BorderRadius } from '@/constants/theme';
import { AppButton } from '@/components/ui/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SupplierCatalog() {
  // CRITICAL FIX: Retrieve the chatUserId passed from the Network screen
  const { id, name, chatUserId } = useLocalSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState<{ [key: number]: number }>({}); 
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, [id]);

  const loadCatalog = async () => {
    try {
      // Load products for this Merchant Profile ID (id)
      const res = await api.get(`${Endpoints.inventory}/${id}`);
      setProducts(res.data);
    } catch (e) {
      Alert.alert("Error", "Could not load catalog. Check connection.");
      router.back();
    }
  };

  const updateCart = (pid: number, delta: number) => {
    setCart(prev => {
      const current = prev[pid] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[pid];
        return copy;
      }
      return { ...prev, [pid]: next };
    });
  };

  const placeOrder = async () => {
    const items = Object.entries(cart).map(([pid, qty]) => ({
      product_id: parseInt(pid),
      quantity: qty
    }));

    if (items.length === 0) return;

    setSubmitting(true);
    try {
      await api.post(Endpoints.transactions, {
        merchant_id: id, // Orders are linked to the Merchant Profile ID
        items
      });
      Alert.alert("Success", "Order placed successfully!");
      router.replace('/(tabs)/orders');
    } catch (e) {
      Alert.alert("Failed", "Could not place order.");
    } finally {
      setSubmitting(false);
    }
  };

  const openChat = () => {
    // CRITICAL FIX: Initiate chat with the User ID (chatUserId), NOT the Profile ID (id)
    if (chatUserId) {
        router.push(`/chat/${chatUserId}`);
    } else {
        // Fallback: If chatUserId wasn't passed (e.g., accessed via deep link), warn the user
        Alert.alert("Unavailable", "Direct chat is only available for connected partners.");
    }
  };

  // Calculate Total Value
  const total = products.reduce((sum, p: any) => {
    const qty = cart[p.id] || 0;
    return sum + (p.price * qty);
  }, 0);

  const renderProduct = ({ item }: { item: any }) => {
    const qty = cart[item.id] || 0;
    
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
            <Text style={styles.prodName}>{item.name}</Text>
            <Text style={styles.prodDetails}>
                ${item.price.toFixed(2)} / {item.unit_type}
            </Text>
            {item.stock < 10 && (
                <Text style={{ color: 'orange', fontSize: 12 }}>Low Stock: {item.stock}</Text>
            )}
        </View>

        <View style={styles.counter}>
            <TouchableOpacity onPress={() => updateCart(item.id, -1)} style={styles.countBtn}>
                <Ionicons name="remove" size={20} color={Palette.primary} />
            </TouchableOpacity>
            
            <Text style={styles.countText}>{qty}</Text>
            
            <TouchableOpacity onPress={() => updateCart(item.id, 1)} style={styles.countBtn}>
                <Ionicons name="add" size={20} color={Palette.primary} />
            </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="close" size={28} color={Palette.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{name}</Text>
        
        <TouchableOpacity onPress={openChat} style={styles.headerBtn}>
            <Ionicons name="chatbubble-ellipses-outline" size={26} color={Palette.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={{ padding: Spacing.md }}
      />

      {/* Floating Checkout Bar */}
      {total > 0 && (
        <SafeAreaView edges={['bottom']} style={styles.checkoutWrapper}>
            <View style={styles.checkoutBar}>
                <View>
                    <Text style={styles.checkoutLabel}>Total Estimate</Text>
                    <Text style={styles.checkoutTotal}>${total.toFixed(2)}</Text>
                </View>
                <AppButton 
                    title={submitting ? "Sending..." : "Place Order"} 
                    onPress={placeOrder}
                    loading={submitting}
                    style={{ width: 140 }}
                />
            </View>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: Spacing.md, 
    paddingVertical: Spacing.sm,
    backgroundColor: Palette.card, 
    borderBottomWidth: 1, 
    borderBottomColor: Palette.border 
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Palette.text },
  headerBtn: { padding: 4 },
  
  card: { flexDirection: 'row', backgroundColor: Palette.card, padding: Spacing.md, marginBottom: Spacing.sm, borderRadius: BorderRadius.md, alignItems: 'center' },
  prodName: { fontSize: 16, fontWeight: '700', color: Palette.text },
  prodDetails: { color: Palette.subText, marginTop: 4 },
  
  counter: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 8 },
  countBtn: { padding: 8 },
  countText: { width: 30, textAlign: 'center', fontWeight: '700', fontSize: 16 },
  
  checkoutWrapper: { backgroundColor: Palette.card, borderTopWidth: 1, borderTopColor: Palette.border },
  checkoutBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg },
  checkoutLabel: { fontSize: 12, color: Palette.subText },
  checkoutTotal: { fontSize: 24, fontWeight: '800', color: Palette.primaryDark }
});
