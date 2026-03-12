import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { ownerApi } from '../../api/apiService';
import { theme } from '../../theme/theme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
      >
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={[styles.badge, { backgroundColor: isActionRequired ? theme.colors.error : theme.colors.success }]}>
            <Text style={styles.badgeText}>{item.status?.replace('_', ' ') || item.status}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Icon name="my-location" size={16} color="#666" />
          <Text style={styles.loc}>{item.pickup}</Text>
        </View>
        <View style={styles.row}>
          <Icon name="location-on" size={16} color="#666" />
          <Text style={styles.loc}>{item.dropoff}</Text>
        </View>

        {isActionRequired && (
          <View style={styles.actionBanner}>
            <Text style={styles.actionText}>Assign driver → Tap to assign</Text>
          </View>
        )}

        {item.driverId && (
          <Text style={styles.driverText}>Driver assigned (ID: {item.driverId})</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>My Active Jobs</Text>
      <FlatList
        data={jobs}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadMyJobs} />}
        ListEmptyComponent={<Text style={styles.empty}>No active jobs.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  highlight: { borderColor: theme.colors.error, borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#333' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  loc: { fontSize: 13, color: '#555' },
  actionBanner: { marginTop: 12, backgroundColor: '#FFEBEE', padding: 8, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#D32F2F', fontWeight: 'bold' },
  driverText: { marginTop: 12, fontStyle: 'italic', color: '#4CAF50' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});
