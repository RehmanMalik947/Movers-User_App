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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ownerApi, chatApi } from '../../api/apiService';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

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
  warning: '#F59E0B',
};

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
      Alert.alert('Required', 'Please fill in all required fields.');
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
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{(item.name || 'D').charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
        <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, item.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}>
                <Text style={styles.statusText}>{item.status || 'active'}</Text>
            </View>
            <Text style={styles.licence}>#{item.licence_number || '—'}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.chatIconBtn} 
        onPress={() => handleChatWithDriver(item)}
        activeOpacity={0.7}
      >
        <Icon name="chatbubble-ellipses" size={20} color={C.primaryStandard} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <View>
            <Text style={styles.title}>My Drivers</Text>
            <Text style={styles.subTitle}>{drivers.length} drivers in your fleet</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)} activeOpacity={0.8}>
          <Icon name="add" size={20} color={C.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={drivers}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDrivers} tintColor={C.primaryStandard} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
                <Icon name="people-outline" size={50} color={C.border} />
                <Text style={styles.emptyText}>No drivers added yet.</Text>
            </View>
          ) : null
        }
      />

      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Driver Profile</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Icon name="close" size={24} color={C.textHead} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.form}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                placeholder="Enter full name"
                placeholderTextColor={C.textMuted}
              />
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(t) => setForm({ ...form, phone: t })}
                placeholder="03xx xxxxxxx"
                keyboardType="phone-pad"
                placeholderTextColor={C.textMuted}
              />
              <Text style={styles.label}>CNIC Number</Text>
              <TextInput
                style={styles.input}
                value={form.cnic}
                onChangeText={(t) => setForm({ ...form, cnic: t })}
                placeholder="xxxxx-xxxxxxx-x"
                placeholderTextColor={C.textMuted}
              />
              <Text style={styles.label}>Driving Licence</Text>
              <TextInput
                style={styles.input}
                value={form.licence_number}
                onChangeText={(t) => setForm({ ...form, licence_number: t })}
                placeholder="Enter licence number"
                placeholderTextColor={C.textMuted}
              />
              
              <TouchableOpacity
                style={[styles.submitBtn, saving && styles.submitDisabled]}
                onPress={handleAddDriver}
                disabled={saving}
                activeOpacity={0.9}
              >
                {saving ? (
                    <ActivityIndicator color={C.white} />
                ) : (
                    <Text style={styles.submitText}>Save Driver</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 16, 
    backgroundColor: C.surface, 
    borderBottomWidth: 1, 
    borderBottomColor: C.border 
  },
  title: { fontSize: 22, fontWeight: '800', color: C.textHead, letterSpacing: -0.5 },
  subTitle: { fontSize: 13, color: C.textMuted, marginTop: 2 },
  addBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: C.primary, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  list: { padding: 20, paddingBottom: 40 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: C.surface, 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 16, 
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2 
  },
  avatarContainer: { 
    width: 52, 
    height: 52, 
    borderRadius: 18, 
    backgroundColor: C.primaryLight, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { color: C.primaryStandard, fontSize: 20, fontWeight: '800' },
  cardBody: { flex: 1, marginLeft: 16 },
  name: { fontSize: 16, fontWeight: '700', color: C.textHead },
  phone: { fontSize: 14, color: C.textMuted, marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  activeBadge: { backgroundColor: C.success + '15' },
  inactiveBadge: { backgroundColor: C.error + '15' },
  statusText: { fontSize: 10, fontWeight: '800', color: C.textHead, textTransform: 'uppercase' },
  licence: { fontSize: 12, color: C.textMuted, fontWeight: '500' },
  chatIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyContainer: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: C.textMuted, fontWeight: '500' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalBox: { 
    backgroundColor: C.surface, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    maxHeight: '90%', 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 24, 
    borderBottomWidth: 1, 
    borderBottomColor: C.border 
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.textHead },
  form: { padding: 24 },
  label: { fontSize: 14, fontWeight: '700', color: C.textHead, marginBottom: 8, marginTop: 16 },
  input: { 
    backgroundColor: C.bg, 
    borderRadius: 14, 
    padding: 16, 
    fontSize: 16, 
    color: C.textHead,
    borderWidth: 1,
    borderColor: C.border,
  },
  submitBtn: { 
    marginTop: 32, 
    backgroundColor: C.primary, 
    padding: 18, 
    borderRadius: 18, 
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8
  },
  submitDisabled: { backgroundColor: C.border },
  submitText: { color: C.white, fontWeight: '800', fontSize: 16 },
});
