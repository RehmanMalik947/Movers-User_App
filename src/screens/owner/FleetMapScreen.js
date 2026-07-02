import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ownerApi } from '../../api/apiService';

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
  error: '#EF4444',
};

const DEFAULT_REGION = {
  latitude: 31.5204,
  longitude: 74.3587,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

function formatLastSeen(dateStr) {
  if (!dateStr) return 'No location yet';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleString();
}

export default function FleetMapScreen() {
  const mapRef = useRef(null);
  const [fleet, setFleet] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const loadFleet = async () => {
    try {
      const res = await ownerApi.getFleetLocations();
      if (res.success) {
        setFleet(res.data || []);
        setSummary(res.summary || null);
      }
    } catch (err) {
      console.error('Fleet locations error:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFleet();
      const interval = setInterval(loadFleet, 15000);
      return () => clearInterval(interval);
    }, [])
  );

  const locatedItems = fleet.filter((item) => item.hasLocation);
  const selectedItem = fleet.find(
    (item) => String(item.truckId || item.driver?.id) === String(selectedId)
  );

  const focusOnItem = (item) => {
    const id = item.truckId || item.driver?.id;
    setSelectedId(id);
    if (item.driver?.latitude != null && item.driver?.longitude != null) {
      mapRef.current?.animateToRegion(
        {
          latitude: item.driver.latitude,
          longitude: item.driver.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );
    }
  };

  const fitAllMarkers = () => {
    const coords = locatedItems
      .filter((item) => item.driver?.latitude != null)
      .map((item) => ({
        latitude: item.driver.latitude,
        longitude: item.driver.longitude,
      }));
    if (coords.length > 0) {
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 40, bottom: 200, left: 40 },
        animated: true,
      });
    }
  };

  const renderFleetItem = ({ item }) => {
    const id = item.truckId || item.driver?.id;
    const isSelected = String(selectedId) === String(id);
    const label = item.registrationNumber || item.driver?.name || 'Driver';
    const subtitle = item.registrationNumber
      ? item.driver?.name || 'No driver assigned'
      : 'Online — no active truck';

    return (
      <TouchableOpacity
        style={[styles.fleetCard, isSelected && styles.fleetCardSelected]}
        onPress={() => focusOnItem(item)}
        activeOpacity={0.85}
      >
        <View style={styles.fleetCardIcon}>
          <Icon
            name={item.hasLocation ? 'navigate' : 'navigate-outline'}
            size={18}
            color={item.hasLocation ? C.success : C.textMuted}
          />
        </View>
        <View style={styles.fleetCardBody}>
          <Text style={styles.fleetCardTitle} numberOfLines={1}>{label}</Text>
          <Text style={styles.fleetCardSub} numberOfLines={1}>{subtitle}</Text>
          <Text style={styles.fleetCardMeta}>
            {item.hasLocation
              ? formatLastSeen(item.driver?.locationUpdatedAt)
              : item.driver
                ? 'Driver has no GPS signal'
                : 'No driver on this truck'}
          </Text>
        </View>
        {item.driver?.is_online && (
          <View style={styles.onlineDot} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Fleet Live Map</Text>
        <TouchableOpacity style={styles.fitBtn} onPress={fitAllMarkers}>
          <Icon name="scan-outline" size={20} color={C.primaryStandard} />
        </TouchableOpacity>
      </View>

      {summary && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryVal}>{summary.trucksWithLocation}/{summary.totalTrucks}</Text>
            <Text style={styles.summaryLab}>Located</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryVal}>{summary.onlineDrivers}</Text>
            <Text style={styles.summaryLab}>Online</Text>
          </View>
        </View>
      )}

      <View style={styles.mapWrap}>
        {loading && fleet.length === 0 ? (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="large" color={C.primaryStandard} />
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={DEFAULT_REGION}
            showsUserLocation={false}
            onMapReady={() => {
              if (locatedItems.length > 0) fitAllMarkers();
            }}
          >
            {locatedItems.map((item) => {
              const key = `${item.truckId || 'd'}-${item.driver?.id}`;
              const isSelected = String(selectedId) === String(item.truckId || item.driver?.id);
              return (
                <Marker
                  key={key}
                  coordinate={{
                    latitude: item.driver.latitude,
                    longitude: item.driver.longitude,
                  }}
                  title={item.registrationNumber || item.driver?.name}
                  description={item.activeJob?.title || 'Available'}
                  pinColor={isSelected ? C.primaryStandard : C.success}
                  onPress={() => setSelectedId(item.truckId || item.driver?.id)}
                />
              );
            })}
          </MapView>
        )}
      </View>

      {selectedItem && (
        <View style={styles.selectedBanner}>
          <Icon name="bus" size={16} color={C.primaryStandard} />
          <Text style={styles.selectedText} numberOfLines={1}>
            {selectedItem.registrationNumber || selectedItem.driver?.name}
            {selectedItem.activeJob ? ` · ${selectedItem.activeJob.title}` : ''}
          </Text>
        </View>
      )}

      <View style={styles.listSection}>
        <Text style={styles.listTitle}>Your Trucks & Drivers</Text>
        <FlatList
          data={fleet}
          keyExtractor={(item) => String(item.truckId || `driver-${item.driver?.id}`)}
          renderItem={renderFleetItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadFleet} tintColor={C.primaryStandard} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="map-outline" size={40} color={C.border} />
              <Text style={styles.emptyText}>No trucks in your fleet yet</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: { fontSize: 22, fontWeight: '900', color: C.textHead },
  fitBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  summaryPill: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  summaryVal: { fontSize: 18, fontWeight: '800', color: C.textHead },
  summaryLab: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  mapWrap: { flex: 1, marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  map: { flex: 1 },
  mapLoading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface },
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 10,
    backgroundColor: C.primaryLight,
    borderRadius: 12,
  },
  selectedText: { flex: 1, fontSize: 13, fontWeight: '600', color: C.primary },
  listSection: { paddingTop: 12, paddingBottom: 8 },
  listTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: C.textHead,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  listContent: { paddingHorizontal: 16, gap: 10 },
  fleetCard: {
    width: 200,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  fleetCardSelected: { borderColor: C.primaryStandard, backgroundColor: C.primaryLight },
  fleetCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fleetCardBody: { flex: 1 },
  fleetCardTitle: { fontSize: 14, fontWeight: '700', color: C.textHead },
  fleetCardSub: { fontSize: 12, color: C.textBody, marginTop: 2 },
  fleetCardMeta: { fontSize: 10, color: C.textMuted, marginTop: 4 },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.success,
    marginTop: 4,
  },
  empty: { alignItems: 'center', padding: 24, gap: 8 },
  emptyText: { fontSize: 13, color: C.textMuted },
});
