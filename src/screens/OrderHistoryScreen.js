import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { jobApi } from '../api/apiService';
import { getStatusColor, getStatusLabel, normalizeStatus } from '../utils/jobStatus';

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
  success: '#10B981',
  error: '#EF4444',
};

export default function OrderHistoryScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isDriver = user?.role?.toLowerCase() === 'driver';

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = isDriver
        ? await jobApi.getDriverHistory(user.id)
        : await jobApi.getMyHistory(user.id);
      const list = res?.data ?? [];
      setJobs(Array.isArray(list) ? list : []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [user?.id, isDriver])
  );

  const renderItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const canOpen = !isDriver || normalizeStatus(item.status) === 'completed';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={canOpen ? 0.8 : 1}
        onPress={() => {
          if (isDriver) {
            if (normalizeStatus(item.status) === 'completed') {
              navigation.navigate('ActiveJob', { jobId: item.id });
            }
          } else {
            navigation.navigate('JobDetails', { jobId: item.id });
          }
        }}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: statusColor + '18' }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
          <Text style={styles.date}>
            {item.completedAt
              ? new Date(item.completedAt).toLocaleDateString()
              : new Date(item.requestedDate || item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {item.title || `Order #${item.id}`}
        </Text>

        <View style={styles.routeRow}>
          <Icon name="location-outline" size={14} color={C.success} />
          <Text style={styles.routeText} numberOfLines={1}>
            {item.pickupLocation}
          </Text>
        </View>
        <View style={styles.routeRow}>
          <Icon name="flag-outline" size={14} color={C.error} />
          <Text style={styles.routeText} numberOfLines={1}>
            {item.deliveryLocation}
          </Text>
        </View>

        {item.fare > 0 && (
          <Text style={styles.fare}>Rs. {Number(item.fare).toLocaleString()}</Text>
        )}
        {normalizeStatus(item.status) === 'cancelled' && item.cancelReason && (
          <Text style={styles.cancelReason} numberOfLines={2}>
            Reason: {item.cancelReason}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={C.textHead} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && jobs.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primaryStandard} />
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadHistory} tintColor={C.primaryStandard} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Icon name="time-outline" size={52} color={C.border} />
              <Text style={styles.emptyTitle}>No Past Orders</Text>
              <Text style={styles.emptySub}>Your completed orders will appear here</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.textHead },
  list: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  date: { fontSize: 12, color: C.textMuted, fontWeight: '500' },
  title: { fontSize: 16, fontWeight: '700', color: C.textHead, marginBottom: 10 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  routeText: { flex: 1, fontSize: 13, color: C.textBody },
  fare: { marginTop: 10, fontSize: 14, fontWeight: '800', color: C.primaryStandard },
  cancelReason: { marginTop: 8, fontSize: 12, color: C.textMuted, fontStyle: 'italic' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.textHead },
  emptySub: { fontSize: 14, color: C.textMuted, textAlign: 'center' },
});
