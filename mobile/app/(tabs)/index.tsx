import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import api, { Endpoints } from '@/services/api';
import { Palette, Spacing, BorderRadius } from '@/constants/theme';
import { AppButton } from '@/components/ui/AppButton';
import { Ionicons } from '@expo/vector-icons';

export default function MarketScreen() {
  const [merchantList, setMerchantList] = useState([]);
  const [existingPartnerships, setExistingPartnerships] = useState<number[]>([]); 
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMarketData = async () => {
    try {
      // 1. Get all public merchants
      const merchantsReq = await api.get(Endpoints.merchants);
      
      // 2. Get my existing requests to know who I am already connected to
      const partnersReq = await api.get(`${Endpoints.partnerships}/sent`);
      
      // Map the response to get IDs of merchants I already requested
      const linkedIds = partnersReq.data.map((p: any) => p.merchant_id);
      
      setMerchantList(merchantsReq.data);
      setExistingPartnerships(linkedIds);
    } catch (err) { 
      console.log("Market fetch error", err); 
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMarketData();
    }, [])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMarketData();
    setIsRefreshing(false);
  };

  const sendConnectionRequest = async (merchantId: number) => {
    try {
      await api.post(Endpoints.partnerships, { merchant_id: merchantId });
      Alert.alert("Request Sent", "Waiting for merchant approval.");
      // Refresh to update the button state
      fetchMarketData();
    } catch (e: any) {
      Alert.alert("Failed", "Could not connect.");
    }
  };

  const renderMerchantCard = ({ item }: { item: any }) => {
    const isConnected = existingPartnerships.includes(item.id);
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {/* Decorative Icon Box */}
          <View style={styles.iconBox}>
            <Ionicons name="business" size={24} color={Palette.primary} />
          </View>
          
          <View style={styles.textContainer}>
            <View style={styles.nameRow}>
                <Text style={styles.bizName}>{item.business_name}</Text>
                {item.is_verified && <Ionicons name="checkmark-circle" size={16} color={Palette.primary} style={{marginLeft: 4}}/>}
            </View>
            <Text style={styles.bizDesc} numberOfLines={2}>
              {item.description || "Verified Merchant Partner"}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          {isConnected ? (
            <View style={styles.statusBadge}>
              <Ionicons name="time" size={16} color={Palette.subText} />
              <Text style={styles.statusText}>Request Pending / Linked</Text>
            </View>
          ) : (
            <AppButton 
              title="Connect" 
              variant="outline"
              onPress={() => sendConnectionRequest(item.id)}
              style={styles.compactBtn} 
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.screenTitle}>Marketplace</Text>
            <Text style={styles.screenSubtitle}>Discover new suppliers</Text>
        </View>
      <FlatList
        data={merchantList}
        keyExtractor={(item: any) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[Palette.primary]} />}
        renderItem={renderMerchantCard}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background, padding: Spacing.md },
  header: { marginBottom: Spacing.lg, marginTop: Spacing.sm },
  screenTitle: { fontSize: 28, fontWeight: '800', color: Palette.text },
  screenSubtitle: { fontSize: 16, color: Palette.subText },
  
  card: { backgroundColor: Palette.card, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: { width: 48, height: 48, borderRadius: BorderRadius.md, backgroundColor: Palette.primaryLight, alignItems: 'center', justifyContent: 'center' },
  textContainer: { flex: 1, marginLeft: Spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  bizName: { fontSize: 18, fontWeight: '700', color: Palette.text },
  bizDesc: { fontSize: 14, color: Palette.subText, marginTop: 4, lineHeight: 20 },
  
  actionRow: { marginTop: Spacing.md, borderTopWidth: 1, borderTopColor: Palette.border, paddingTop: Spacing.md, alignItems: 'flex-end' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.sm },
  statusText: { color: Palette.subText, fontWeight: '600', fontSize: 12 },
  compactBtn: { width: 'auto', paddingHorizontal: Spacing.lg, paddingVertical: 8, height: 'auto' }
});
