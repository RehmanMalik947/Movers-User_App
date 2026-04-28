import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setDropoffLocation } from '../redux/slices/locationSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';

// ─── Design Tokens - Matching Login Screen ─────────────────────────────────────────
const C = {
  primary: '#1847B1',        // Deep navy blue
  primaryStandard: '#2260D9', // Standard primary blue
  primaryLight: '#E8EFFD',    // Light blue tint
  bg: '#F8FAFC',              // Cool Gray Background
  surface: '#FFFFFF',         // White
  surfaceAlt: '#F8FAFC',      // Light background
  textHead: '#0F172A',        // Dark text
  textBody: '#334155',        // Body text
  textMuted: '#64748B',       // Muted text
  textLink: '#2260D9',        // Standard blue for links
  border: '#E2E8F0',          // Border color
  divider: '#E2E8F0',         // Divider color
  white: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
};

export default function DropoffLocationScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [region, setRegion] = useState({
    latitude: 31.5204,
    longitude: 74.3587,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [markerAddress, setMarkerAddress] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Set Drop-off',
      headerStyle: { backgroundColor: C.surface },
      headerTintColor: C.textHead,
      headerTitleStyle: { fontWeight: '800' },
    });
  }, [navigation]);

  const searchLocation = async (text) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }
    try {
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_API_KEY}`
      );
      setResults(res.data.predictions || []);
    } catch (err) {
      console.log(err);
    }
  };

  const updateMarkerAddress = async (lat, lng) => {
    try {
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );
      const address = res.data.results?.[0]?.formatted_address || '';
      setMarkerAddress(address);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSelectLocation = async (item) => {
    try {
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?place_id=${item.place_id}&key=${GOOGLE_API_KEY}`
      );
      const result = res.data.results?.[0];
      if (!result) return;
      const location = result.geometry.location;
      const formattedAddress = result.formatted_address || item.description;
      setRegion({
        ...region,
        latitude: location.lat,
        longitude: location.lng,
      });
      setQuery(formattedAddress);
      setMarkerAddress(formattedAddress);
      setResults([]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleConfirm = () => {
    const address = markerAddress || query || 'Selected location';
    dispatch(
      setDropoffLocation({
        latitude: region.latitude,
        longitude: region.longitude,
        address,
      })
    );
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={(r) => {
          setRegion(r);
          updateMarkerAddress(r.latitude, r.longitude);
        }}
        customMapStyle={mapStyle}
      >
        <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }}>
          <View style={styles.customMarker}>
            <View style={styles.markerCircle}>
              <View style={styles.markerInner} />
            </View>
            <View style={styles.markerShadow} />
          </View>
        </Marker>
      </MapView>

      <View style={styles.searchOverlay}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={C.textMuted} style={styles.searchIcon} />
          <TextInput
            value={query}
            placeholder="Search drop-off location"
            placeholderTextColor={C.textMuted}
            onChangeText={searchLocation}
            style={styles.input}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon name="close-circle" size={18} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {results.length > 0 && (
          <View style={styles.resultsWrapper}>
            <FlatList
              data={results}
              keyExtractor={(item) => item.place_id}
              style={styles.resultsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelectLocation(item)}
                >
                  <Icon name="location-sharp" size={16} color={C.primaryStandard} />
                  <Text style={styles.resultText} numberOfLines={1}>{item.description}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerHandle} />
        <View style={styles.addressRow}>
          <View style={styles.addressIconBg}>
            <Icon name="flag" size={20} color={C.primaryStandard} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.addressLabel}>Drop-off Location</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {markerAddress || 'Locating...'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
          <Text style={styles.confirmBtnText}>Confirm Drop-off</Text>
          <Icon name="chevron-forward" size={18} color={C.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
];

const styles = StyleSheet.create({
  searchOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 200,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: C.divider,
  },
  searchIcon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.textHead,
    fontWeight: '600',
  },
  resultsWrapper: {
    marginTop: 8,
    backgroundColor: C.surface,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: C.divider,
    maxHeight: 250,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: C.divider,
    gap: 12,
  },
  resultText: {
    fontSize: 14,
    color: C.textBody,
    flex: 1,
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.primary,
    borderWidth: 3,
    borderColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.white,
  },
  markerShadow: {
    width: 10,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 5,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: C.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: C.divider,
  },
  footerHandle: {
    width: 40,
    height: 5,
    backgroundColor: C.divider,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  addressIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textHead,
    marginTop: 2,
  },
  confirmBtn: {
    backgroundColor: C.primary,
    flexDirection: 'row',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmBtnText: {
    color: C.white,
    fontWeight: '800',
    fontSize: 16,
  },
});
