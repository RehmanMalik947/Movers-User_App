// src/screens/owner/OwnerRequestDetailScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function OwnerRequestDetailScreen({ route }) {
  const { request } = route.params;
  const [offerPrice, setOfferPrice] = useState('');

  const handleSendOffer = () => {
    if (!offerPrice) {
      Alert.alert('Enter price', 'Please enter your fare to continue.');
      return;
    }
    // For now, static: later this will call API
    Alert.alert('Offer sent', `You offered Rs. ${offerPrice} for ${request.id}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request {request.id}</Text>

      <View style={styles.box}>
        <Text style={styles.label}>Pickup</Text>
        <Text style={styles.value}>{request.pickup}</Text>

        <Text style={styles.label}>Dropoff</Text>
        <Text style={styles.value}>{request.dropoff}</Text>

        <Text style={styles.label}>Truck type</Text>
        <Text style={styles.value}>{request.truckType}</Text>

        <Text style={styles.label}>Distance / Time</Text>
        <Text style={styles.value}>
          {request.distance} • {request.time}
        </Text>
      </View>

      <Text style={styles.label}>Your Fare (Rs)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your price"
        keyboardType="numeric"
        value={offerPrice}
        onChangeText={setOfferPrice}
      />

      <TouchableOpacity style={styles.btn} onPress={handleSendOffer}>
        <Text style={styles.btnText}>Send Offer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', color: '#2B2B2B', marginBottom: 16 },
  box: {
    backgroundColor: '#FDF1D9',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0E8D6',
  },
  label: { fontSize: 12, color: '#777', marginTop: 8 },
  value: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginTop: 6,
  },
  btn: {
    marginTop: 18,
    backgroundColor: '#E6A940',
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
