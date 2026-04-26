import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ownerApi, chatApi } from '../../api/apiService';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme/theme';

export default function MyDriversScreen() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    cnic: '',
    licence_number: '',
  });
  const navigation = useNavigation();
  const { user: currentUser } = useAuth();

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const res = await ownerApi.getDrivers();
      const data = res?.data ?? res ?? [];
      setDrivers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDrivers();
    }, [])
  );

  const handleAddDriver = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.cnic.trim() || !form.licence_number.trim()) {
      Alert.alert('Required', 'Name, phone, CNIC and licence number are required');
      return;
    }
    setSaving(true);
    try {
      await ownerApi.addDriver({
        name: form.name.trim(),
        phone: form.phone.trim(),
        cnic: form.cnic.trim(),
        licence_number: form.licence_number.trim(),
      });
      setShowAdd(false);
      setForm({ name: '', phone: '', cnic: '', licence_number: '' });
      loadDrivers();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add driver');
    } finally {
      setSaving(false);
    }
  };

  const handleChatWithDriver = async (driver) => {
    try {
      const chatRes = await chatApi.startChat(currentUser.id, driver.id, 'driver-owner');
      if (chatRes.success) {
        navigation.navigate('Messaging', {
          chatId: chatRes.data.id,
          otherId: driver.id,
          otherName: driver.name,
          myId: currentUser.id,
          myName: currentUser.name,
          myRole: 'TruckOwner'
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not start chat');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(item.name || 'D').charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
        <Text style={styles.licence}>Licence: {item.licence_number || item.licence_number || '—'}</Text>
      </View>
      <View style={[styles.statusBadge, item.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}>
        <Text style={styles.statusText}>{item.status || 'active'}</Text>
      </View>
      <TouchableOpacity style={styles.chatIconBtn} onPress={() => handleChatWithDriver(item)}>
        <Icon name="chat" size={24} color={theme.colors.secondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Drivers</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Icon name="person-add" size={22} color="#fff" />
          <Text style={styles.addBtnText}>Add Driver</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={drivers}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDrivers} />}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>No drivers yet. Tap "Add Driver" to add one.</Text>
          ) : null
        }
      />

      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Driver</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                placeholder="Driver name"
                placeholderTextColor="#999"
              />
              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(t) => setForm({ ...form, phone: t })}
                placeholder="e.g. 03001234567"
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
              <Text style={styles.label}>CNIC *</Text>
              <TextInput
                style={styles.input}
                value={form.cnic}
                onChangeText={(t) => setForm({ ...form, cnic: t })}
                placeholder="e.g. 35201-1234567-1"
                placeholderTextColor="#999"
              />
              <Text style={styles.label}>Licence Number *</Text>
              <TextInput
                style={styles.input}
                value={form.licence_number}
                onChangeText={(t) => setForm({ ...form, licence_number: t })}
                placeholder="e.g. LHR-12345678"
                placeholderTextColor="#999"
              />
            </ScrollView>
            <TouchableOpacity
              style={[styles.submitBtn, saving && styles.submitDisabled]}
              onPress={handleAddDriver}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save Driver</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: '700', color: '#333' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.secondary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  list: { padding: 16, paddingBottom: 24 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cardBody: { flex: 1, marginLeft: 14 },
  name: { fontSize: 16, fontWeight: '700', color: '#333' },
  phone: { fontSize: 14, color: '#666', marginTop: 2 },
  licence: { fontSize: 12, color: '#888', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  activeBadge: { backgroundColor: '#E8F5E9' },
  inactiveBadge: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 11, fontWeight: '600', color: '#333' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, paddingHorizontal: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', paddingBottom: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 14, fontSize: 16, color: '#333' },
  submitBtn: { marginHorizontal: 16, marginTop: 16, backgroundColor: theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  chatIconBtn: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  }
});
