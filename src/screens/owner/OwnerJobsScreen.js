// src/screens/owner/OwnerJobsScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const DUMMY_JOBS = [
  {
    id: 'JOB-201',
    requestId: 'REQ-101',
    pickup: 'Mall 1, Gulberg',
    dropoff: 'Johar Town',
    truckType: 'Medium truck',
    status: 'Assigned',
    driverName: 'Ali',
  },
  {
    id: 'JOB-202',
    requestId: 'REQ-099',
    pickup: 'Defence, Lahore',
    dropoff: 'Shaikhupura',
    truckType: 'Heavy truck',
    status: 'In transit',
    driverName: 'Bilal',
  },
];

export default function OwnerJobsScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.id}>{item.id} • {item.status}</Text>
      <Text style={styles.label}>From</Text>
      <Text style={styles.value}>{item.pickup}</Text>
      <Text style={styles.label}>To</Text>
      <Text style={styles.value}>{item.dropoff}</Text>
      <Text style={styles.meta}>
        {item.truckType} • Driver: {item.driverName}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Jobs</Text>
      <FlatList
        data={DUMMY_JOBS}
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
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  id: { fontSize: 13, fontWeight: '600', color: '#E6A940', marginBottom: 6 },
  label: { fontSize: 12, color: '#777', marginTop: 4 },
  value: { fontSize: 14, fontWeight: '600', color: '#333' },
  meta: { marginTop: 8, fontSize: 12, color: '#555' },
});
