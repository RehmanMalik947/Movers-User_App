import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { truckOwnerApi, jobApi } from '../../api/apiService';
import StarRating from '../../components/StarRating';

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
  warning: '#F59E0B',
};

export default function TruckOwnersScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { jobId } = route.params || {};
  const [owners, setOwners] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadOwners = async (query = search) => {
    setLoading(true);
    try {
      const promises = [
        truckOwnerApi.getAll(query ? { search: query } : {})
      ];
      if (jobId) {
        promises.push(jobApi.getBids(jobId).catch(() => []));
      }
      const [ownersRes, bidsRes] = await Promise.all(promises);
      setOwners(ownersRes?.data ?? []);
      if (bidsRes) {
        setBids(bidsRes?.data ?? bidsRes ?? []);
      }
    } catch {
      setOwners([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOwners();
    }, [])
  );

  const handleSearch = () => loadOwners(search);

  const renderItem = ({ item }) => {
    const existingBid = bids.find(b => String(b.truck_owner_id) === String(item.id));
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('TruckOwnerDetail', { ownerId: item.id, jobId })}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.display_name || 'O').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.name} numberOfLines={1}>{item.display_name}</Text>
          {item.address ? (
            <View style={styles.metaRow}>
              <Icon name="location-outline" size={12} color={C.textMuted} />
              <Text style={styles.metaText} numberOfLines={1}>{item.address}</Text>
            </View>
          ) : null}
          <View style={styles.statsRow}>
            <StarRating rating={item.rating} size={13} />
            <Text style={styles.reviewCount}>({item.total_reviews || 0})</Text>
            {existingBid && (
              <View style={styles.bidBadge}>
                <Icon name="checkmark-circle" size={12} color={C.success} />
                <Text style={styles.bidBadgeText}>Bid: Rs. {existingBid.price}</Text>
              </View>
            )}
          </View>
          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Icon name="bus-outline" size={11} color={C.primaryStandard} />
              <Text style={styles.chipText}>{item.truck_count || 0} trucks</Text>
            </View>
            {item.categories?.slice(0, 2).map((cat) => (
              <View key={cat.id} style={styles.chip}>
                <Text style={styles.chipText}>{cat.name}</Text>
              </View>
            ))}
          </View>
        </View>
        <Icon name="chevron-forward" size={20} color={C.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={C.textHead} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Truck Owners</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchRow}>
        <Icon name="search" size={18} color={C.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or location..."
          placeholderTextColor={C.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(''); loadOwners(''); }}>
            <Icon name="close-circle" size={18} color={C.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {loading && owners.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primaryStandard} />
        </View>
      ) : (
        <FlatList
          data={owners}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadOwners()} tintColor={C.primaryStandard} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Icon name="business-outline" size={52} color={C.border} />
              <Text style={styles.emptyTitle}>No truck owners found</Text>
              <Text style={styles.emptySub}>Approved fleet operators will appear here</Text>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchInput: { flex: 1, fontSize: 15, color: C.textHead, padding: 0 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: C.primaryStandard },
  cardBody: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: C.textHead, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  metaText: { flex: 1, fontSize: 12, color: C.textMuted },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewCount: { fontSize: 12, color: C.textMuted, marginLeft: 4, fontWeight: '600' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipText: { fontSize: 10, fontWeight: '700', color: C.primaryStandard },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: C.textHead },
  emptySub: { fontSize: 13, color: C.textMuted, textAlign: 'center' },
  bidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 10,
    gap: 4,
  },
  bidBadgeText: {
    fontSize: 11,
    color: C.success,
    fontWeight: '700',
  },
});
