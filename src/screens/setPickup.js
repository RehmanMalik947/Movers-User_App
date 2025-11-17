import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import OpenStreetMap from 'react-native-open-street-map';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';

export default function PickupLocationScreen({ navigation }) {
  console.log("GEO: ", Geolocation);
console.log("MAPVIEW: ", MapView);
console.log("URLTILE: ", UrlTile);

  const [region, setRegion] = useState({
    latitude: 33.6844,
    longitude: 73.0479,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use this feature.'
        );
      }
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (pos) => {
        setRegion({
          ...region,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => console.log(err),
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    requestLocationPermission();
    getCurrentLocation();
  }, []);

  const searchLocation = async (text) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${text}`
      );
      setResults(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSelectLocation = (item) => {
    setRegion({
      ...region,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    });
    setQuery(item.display_name);
    setResults([]);
  };

  const handleConfirm = () => {
    navigation.navigate('NextScreen', {
      pickupLocation: {
        latitude: region.latitude,
        longitude: region.longitude,
        address: query,
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          value={query}
          placeholder="Search location..."
          onChangeText={searchLocation}
          style={styles.input}
        />
      </View>

      {/* Search Results */}
      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.place_id.toString()}
          style={styles.resultsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => handleSelectLocation(item)}
            >
              <Text>{item.display_name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Map */}
      <OpenStreetMap
        style={{ flex: 1 }}
        latitude={region.latitude}
        longitude={region.longitude}
        zoom={16}
        onRegionChangeComplete={(r) => setRegion(r)}
      />

      {/* Fixed Marker */}
      <View style={styles.markerFixed}>
        <Text style={{ fontSize: 30 }}>📍</Text>
      </View>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleConfirm}>
          <Text style={styles.btnText}>Confirm Pickup Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    position: 'absolute',
    top: 20,
    left: 10,
    right: 10,
    zIndex: 100,
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
    top: 70,
    width: '100%',
    backgroundColor: '#fff',
    maxHeight: 200,
    zIndex: 200,
    borderRadius: 8,
    elevation: 5,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  markerFixed: {
    left: '50%',
    marginLeft: -15,
    marginTop: -35,
    position: 'absolute',
    top: '50%',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: 'black',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
  },
});
