// src/screens/owner/OwnerRequestsScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const DUMMY_REQUESTS = [
  {
    id: 'REQ-101',
    pickup: 'Mall 1, Gulberg, Lahore',
    dropoff: 'Johar Town, Lahore',
    truckType: 'Medium truck',
    distance: '12 km',
    time: 'Today, 3:00 PM',
  },
  {
    id: 'REQ-102',
    pickup: 'Shalimar, Lahore',
    dropoff: 'Bahria Town, Lahore',
    truckType: 'Heavy truck',
    distance: '25 km',
    time: 'Today, 6:00 PM',
  },
];

export default function OwnerRequestsScreen() {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('OwnerRequestDetail', { request: item })}
      activeOpacity={0.9}
    >
      <Text style={styles.id}>{item.id}</Text>
      <Text style={styles.label}>Pickup:</Text>
      <Text style={styles.value}>{item.pickup}</Text>

      <Text style={styles.label}>Dropoff:</Text>
      <Text style={styles.value}>{item.dropoff}</Text>

      <View style={styles.row}>
        <Text style={styles.tag}>{item.truckType}</Text>
        <Text style={styles.tag}>{item.distance}</Text>
      </View>

      <Text style={styles.time}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Requests</Text>
      <FlatList
        data={DUMMY_REQUESTS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', color: '#2B2B2B', marginBottom: 12 },
  card: {
    backgroundColor: '#FDF1D9',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0E8D6',
  },
  id: { fontSize: 13, fontWeight: '600', color: '#E6A940', marginBottom: 6 },
  label: { fontSize: 12, color: '#777', marginTop: 4 },
  value: { fontSize: 14, fontWeight: '600', color: '#333' },
  row: { flexDirection: 'row', marginTop: 8, gap: 8 },
  tag: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0E8D6',
    color: '#555',
  },
  time: { marginTop: 8, fontSize: 12, color: '#999' },
});
