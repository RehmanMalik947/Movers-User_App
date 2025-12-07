// src/screens/owner/OwnerHomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function OwnerHomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Truck Owner Mode</Text>
      <Text style={styles.subtitle}>Manage your trucks, drivers & jobs</Text>

      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardNumber}>3</Text>
          <Text style={styles.cardLabel}>New Requests</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardNumber}>2</Text>
          <Text style={styles.cardLabel}>Active Jobs</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.btnPrimary}
        onPress={() => navigation.navigate('OwnerRequests')}
      >
        <Text style={styles.btnText}>View New Requests</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnSecondary}
        onPress={() => navigation.navigate('OwnerJobs')}
      >
        <Text style={styles.btnSecondaryText}>View My Jobs</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', color: '#2B2B2B', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#777', marginBottom: 18 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  card: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#FFF4D9',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  cardNumber: { fontSize: 20, fontWeight: '700', color: '#E6A940' },
  cardLabel: { marginTop: 4, fontSize: 13, color: '#555' },
  btnPrimary: {
    backgroundColor: '#E6A940',
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnSecondary: {
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6A940',
  },
  btnSecondaryText: { color: '#E6A940', fontSize: 14, fontWeight: '500' },
});
