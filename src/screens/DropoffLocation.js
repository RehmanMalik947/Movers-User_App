import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { setDropoffLocation } from '../redux/slices/locationSlice';
import { useDispatch } from 'react-redux';

const { width, height } = Dimensions.get('window');

const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY'; // Replace with your key; same as AndroidManifest geo API key if needed

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
      title: 'Dropoff Location',
      headerStyle: { backgroundColor: '#DAAE58' },
      headerTitleStyle: { color: '#000' },
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
      setQuery(address);
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
    <View style={{ flex: 1 }}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          value={query}
          placeholder="Search drop-off location..."
          onChangeText={searchLocation}
          style={styles.input}
        />
      </View>

      {/* Search Results */}
      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.place_id}
          style={styles.resultsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => handleSelectLocation(item)}
            >
              <Text>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Map */}
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
        <Marker
          coordinate={{ latitude: region.latitude, longitude: region.longitude }}
        />
      </MapView>

      {/* Floating Center Marker */}
      <View style={styles.markerFixed}>
        <Text style={{ fontSize: 35 }}>📍</Text>
      </View>

      {/* Footer Panel */}
      <View style={styles.footer}>
        <Text style={styles.addressText}>
          {markerAddress || query || 'Move map or search to select drop-off location'}
        </Text>
        <TouchableOpacity style={styles.btn} onPress={handleConfirm}>
          <Text style={styles.btnText}>Confirm Drop-off Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Optional map style (light/dark theme)
const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
];

const styles = StyleSheet.create({
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 200,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    elevation: 4,
  },
  resultsList: {
    position: 'absolute',
    top: 60,
    width: '100%',
    backgroundColor: '#fff',
    maxHeight: 200,
    zIndex: 250,
    borderRadius: 8,
    elevation: 5,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  markerFixed: {
    left: width / 2 - 17,
    top: height / 2 - 50,
    position: 'absolute',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFF4D9',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 15,
    elevation: 8,
    alignItems: 'center',
  },
  addressText: {
    fontSize: 16,
    marginBottom: 10,
  },
  btn: {
    backgroundColor: '#DAAE58',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 12,
    width: '90%',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16 },
});
