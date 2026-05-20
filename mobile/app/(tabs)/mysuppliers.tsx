import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import api, { Endpoints } from '@/services/api';
import { Palette, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function MyNetworkScreen() {
  const [partners, setPartners] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchPartners = async () => {
    try {
      // NEW ENDPOINT: /merchants/partnerships/sent
      // This returns the list of partnerships I requested
      const res = await api.get(`${Endpoints.partnerships}/sent`);
      setPartners(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPartners();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPartners();
    setRefreshing(false);
  };

  const openCatalog = (merchantId: number, merchantName: string, merchantUserId: number) => {
    // Navigate to the Supplier Modal
    router.push({
        pathname: `/supplier/[id]`,
        params: { 
            id: merchantId, 
            name: merchantName,
            chatUserId: merchantUserId // This was undefined because it wasn't passed below
        }
    });
  };


  const renderPartnerRow = ({ item }: { item: any }) => {
    // Status color coding
    const isAccepted = item.status === 'active' || item.status === 'accepted';
    const statusColor = isAccepted ? Palette.success : '#fbbf24'; // Green or Amber

    return (
      <TouchableOpacity 
        style={styles.row} 
        // FIX APPLIED HERE: Added item.merchant_user_id as the 3rd argument
        onPress={() => isAccepted ? openCatalog(item.merchant_id, item.merchant_name, item.merchant_user_id) : null}
        disabled={!isAccepted}
      >
        <View style={[styles.avatar, { backgroundColor: isAccepted ? Palette.primary : '#ccc' }]}>
            <Text style={styles.avatarText}>{item.merchant_name?.charAt(0) || "?"}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{item.merchant_name}</Text>
          <View style={[styles.statusPill, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusLabel, { color: statusColor }]}>
                {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
        
        {isAccepted && (
            <Ionicons name="chevron-forward" size={20} color={Palette.subText} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Network</Text>
      </View>
      <FlatList
        data={partners}
        keyExtractor={(item: any) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={renderPartnerRow}
        ListEmptyComponent={
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No connections yet.</Text>
                <Text style={styles.emptySub}>Go to the Marketplace to connect.</Text>
            </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background, padding: Spacing.md },
  header: { marginBottom: Spacing.md },
  title: { fontSize: 24, fontWeight: '800', color: Palette.text },
  
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.card, padding: Spacing.md, marginBottom: Spacing.sm, borderRadius: BorderRadius.md, elevation: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: Palette.text },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  statusLabel: { fontSize: 10, fontWeight: '700' },
  
  emptyState: { marginTop: 50, alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: Palette.subText },
  emptySub: { fontSize: 14, color: '#94a3b8', marginTop: 4 }
});
