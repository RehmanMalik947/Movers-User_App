import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ownerApi } from '../../api/apiService';
import { useAuth } from '../../context/AuthContext';

// ─── Design Tokens ───────────────────────────────────────────────────────────────
const C = {
  primary: '#1847B1',
  primaryStandard: '#2260D9',
  primaryLight: '#E8EFFD',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  textHead: '#0F172A',
  textBody: '#334155',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

const mapJobToUI = (j) => ({
  ...j,
  id: j.id,
  title: j.title || 'Job',
  pickup: j.pickupLocation || j.pickup || '',
  dropoff: j.deliveryLocation || j.dropoff || '',
  status: (j.status || '').toUpperCase().replace('-', '_'),
  driverId: j.driverId,
});

export default function OwnerJobsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMyJobs = async () => {
    setLoading(true);
    try {
      const data = await ownerApi.getMyJobs();
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setJobs(list.map(mapJobToUI));
    } catch (error) {
      console.error(error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMyJobs();
    }, [])
  );

  const renderItem = ({ item }) => {
    const needsDriver = item.status === 'ASSIGNED' && !item.driverId;
    const isActionRequired = needsDriver;

    return (
      <TouchableOpacity
        style={[styles.card, isActionRequired && styles.highlight]}
        onPress={() => {
          if (isActionRequired) {
            navigation.navigate('AssignDriver', { jobId: item.id });
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={[styles.badge, { backgroundColor: isActionRequired ? C.error : C.success }]}>
            <Text style={styles.badgeText}>{item.status?.replace('_', ' ') || item.status}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <View style={styles.dotContainer}>
            <View style={[styles.dot, { backgroundColor: C.primaryStandard }]} />
            <View style={styles.line} />
            <View style={[styles.dot, { backgroundColor: C.error }]} />
          </View>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText} numberOfLines={1}>{item.pickup}</Text>
            <View style={{ height: 16 }} />
            <Text style={styles.addressText} numberOfLines={1}>{item.dropoff}</Text>
          </View>
        </View>

        {isActionRequired && (
          <View style={styles.actionBanner}>
            <Icon name="alert-circle" size={16} color={C.error} />
            <Text style={styles.actionText}>Tap to assign a driver</Text>
          </View>
        )}

        {item.driverId && (
          <View style={styles.driverBadge}>
            <Icon name="person" size={14} color={C.success} />
            <Text style={styles.driverText}>Driver assigned</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Active Jobs</Text>
        <Text style={styles.headerSub}>Manage your ongoing logistics</Text>
      </View>
      <FlatList
        data={jobs}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadMyJobs} tintColor={C.primaryStandard} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="document-text-outline" size={64} color={C.border} />
            <Text style={styles.empty}>No active jobs found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { padding: 20, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontSize: 24, fontWeight: '800', color: C.textHead, letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: C.textMuted, marginTop: 4 },
  list: { padding: 20 },
  card: { backgroundColor: C.surface, padding: 16, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  highlight: { borderColor: C.error, borderWidth: 1.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: C.textHead },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: C.white, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  locationRow: { flexDirection: 'row', marginBottom: 12 },
  dotContainer: { alignItems: 'center', width: 20, marginRight: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  line: { width: 1, flex: 1, backgroundColor: C.border, marginVertical: 2 },
  addressContainer: { flex: 1 },
  addressText: { fontSize: 14, color: C.textBody, fontWeight: '500' },
  actionBanner: { 
    marginTop: 12, 
    backgroundColor: C.error + '10', 
    padding: 10, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  actionText: { color: C.error, fontWeight: '700', fontSize: 13 },
  driverBadge: { 
    marginTop: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
    backgroundColor: C.success + '10',
    padding: 6,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  driverText: { fontSize: 12, fontWeight: '600', color: C.success },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 16 },
  empty: { fontSize: 16, color: C.textMuted, fontWeight: '500' }
});
