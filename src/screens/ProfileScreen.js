import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Icon name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.row}>
          <Icon name="email" size={20} color="#666" />
          <Text style={styles.text}>{user?.email}</Text>
        </View>
        <View style={[styles.row, { marginTop: 10 }]}>
          <Icon name="phone" size={20} color="#666" />
          <Text style={styles.text}>{user?.phone}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Icon name="logout" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  role: { fontSize: 14, color: theme.colors.primary, fontWeight: '600', letterSpacing: 1 },

  infoCard: { width: '100%', backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 2, marginBottom: 30 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  text: { fontSize: 16, color: '#555' },

  logoutBtn: { flexDirection: 'row', backgroundColor: theme.colors.error, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
