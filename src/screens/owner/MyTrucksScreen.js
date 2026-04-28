import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ownerApi } from '../../api/apiService';
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

export default function MyTrucksScreen() {
  const [trucks, setTrucks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category_id: null,
    registration_number: '',
    model: '',
    year: '',
    capacity_kg: '',
  });

  const loadCategories = async () => {
    try {
      const res = await ownerApi.getCategories();
      const data = res?.data ?? res ?? [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setCategories([]);
    }
  };

  const openAddModal = () => {
    setForm({ category_id: null, registration_number: '', model: '', year: '', capacity_kg: '' });
    setShowCategoryPicker(false);
    loadCategories();
    setShowAdd(true);
  };

  const loadTrucks = async () => {
    setLoading(true);
    try {
      const res = await ownerApi.getTrucks();
      const data = res?.data ?? res ?? [];
      setTrucks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setTrucks([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTrucks();
    }, [])
  );

  const handleAddTruck = async () => {
    if (!form.registration_number.trim()) {
      Alert.alert('Required', 'Registration number is required');
      return;
    }
    if (categories.length > 0 && (form.category_id == null || form.category_id === '')) {
      Alert.alert('Required', 'Please select a truck category');
      return;
    }
    setSaving(true);
    try {
      await ownerApi.addTruck({
        category_id: form.category_id != null && form.category_id !== '' ? Number(form.category_id) : undefined,
        registration_number: form.registration_number.trim(),
        model: form.model.trim() || undefined,
        year: form.year ? parseInt(form.year, 10) : undefined,
        capacity_kg: form.capacity_kg ? parseInt(form.capacity_kg, 10) : undefined,
      });
      setShowAdd(false);
      setForm({ category_id: null, registration_number: '', model: '', year: '', capacity_kg: '' });
      loadTrucks();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add truck');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.truckIconBg}>
            <Icon name="bus" size={24} color={C.primaryStandard} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.regNo}>{item.registration_number || `Truck #${item.id}`}</Text>
          <View style={styles.metaRow}>
            {item.model ? <Text style={styles.model}>{item.model}</Text> : null}
            {item.capacity_kg ? (
                <>
                    <View style={styles.dot} />
                    <Text style={styles.cap}>{item.capacity_kg} kg</Text>
                </>
            ) : null}
          </View>
        </View>
        <View style={[styles.statusBadge, item.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={styles.statusText}>{item.status || 'active'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <View>
            <Text style={styles.title}>My Trucks</Text>
            <Text style={styles.subTitle}>{trucks.length} vehicles registered</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal} activeOpacity={0.8}>
          <Icon name="add" size={22} color={C.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={trucks}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTrucks} tintColor={C.primaryStandard} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
                <Icon name="car-outline" size={50} color={C.border} />
                <Text style={styles.emptyText}>No trucks added yet.</Text>
            </View>
          ) : null
        }
      />

      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register New Truck</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Icon name="close" size={24} color={C.textHead} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.form}>
              <Text style={styles.label}>Truck Category</Text>
              {categories.length === 0 ? (
                <Text style={styles.hint}>Loading categories...</Text>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowCategoryPicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownText, !form.category_id && styles.dropdownPlaceholder]}>
                      {form.category_id ? (categories.find((c) => c.id === form.category_id)?.name || 'Select') : 'Select truck type'}
                    </Text>
                    <Icon name="chevron-down" size={20} color={C.textMuted} />
                  </TouchableOpacity>
                  
                  <Modal visible={showCategoryPicker} transparent animationType="fade">
                    <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowCategoryPicker(false)}>
                      <View style={styles.pickerBox}>
                        <Text style={styles.pickerTitle}>Select Category</Text>
                        {categories.map((c) => (
                          <TouchableOpacity
                            key={c.id}
                            style={[styles.pickerItem, form.category_id === c.id && styles.pickerItemSelected]}
                            onPress={() => { setForm({ ...form, category_id: c.id }); setShowCategoryPicker(false); }}
                          >
                            <Text style={[styles.pickerItemText, form.category_id === c.id && { color: C.primaryStandard, fontWeight: '700' }]}>{c.name}</Text>
                            {form.category_id === c.id ? <Icon name="checkmark-circle" size={20} color={C.primaryStandard} /> : null}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </TouchableOpacity>
                  </Modal>
                </>
              )}
              
              <Text style={styles.label}>Registration Number</Text>
              <TextInput
                style={styles.input}
                value={form.registration_number}
                onChangeText={(t) => setForm({ ...form, registration_number: t })}
                placeholder="e.g. ABC-1234"
                placeholderTextColor={C.textMuted}
              />
              
              <Text style={styles.label}>Model / Manufacturer</Text>
              <TextInput
                style={styles.input}
                value={form.model}
                onChangeText={(t) => setForm({ ...form, model: t })}
                placeholder="e.g. Isuzu Forward"
                placeholderTextColor={C.textMuted}
              />
              
              <View style={styles.rowInput}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Year</Text>
                    <TextInput
                        style={styles.input}
                        value={form.year}
                        onChangeText={(t) => setForm({ ...form, year: t })}
                        placeholder="2024"
                        keyboardType="number-pad"
                        placeholderTextColor={C.textMuted}
                    />
                </View>
                <View style={{ width: 20 }} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Capacity (kg)</Text>
                    <TextInput
                        style={styles.input}
                        value={form.capacity_kg}
                        onChangeText={(t) => setForm({ ...form, capacity_kg: t })}
                        placeholder="3500"
                        keyboardType="number-pad"
                        placeholderTextColor={C.textMuted}
                    />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, saving && styles.submitDisabled]}
                onPress={handleAddTruck}
                disabled={saving}
                activeOpacity={0.9}
              >
                {saving ? (
                    <ActivityIndicator color={C.white} />
                ) : (
                    <Text style={styles.submitText}>Save Vehicle</Text>
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
    backgroundColor: C.surface, 
    borderRadius: 24, 
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
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  truckIconBg: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: { flex: 1, marginLeft: 16 },
  regNo: { fontSize: 17, fontWeight: '700', color: C.textHead },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  model: { fontSize: 14, color: C.textMuted, fontWeight: '500' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.divider, mx: 8, marginHorizontal: 8 },
  cap: { fontSize: 14, color: C.textMuted, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  activeBadge: { backgroundColor: C.success + '15' },
  inactiveBadge: { backgroundColor: C.error + '15' },
  statusText: { fontSize: 10, fontWeight: '800', color: C.textHead, textTransform: 'uppercase' },
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
  hint: { fontSize: 13, color: C.textMuted, marginBottom: 8 },
  dropdown: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    backgroundColor: C.bg, 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: C.border 
  },
  dropdownText: { fontSize: 16, color: C.textHead, fontWeight: '500' },
  dropdownPlaceholder: { color: C.textMuted },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', padding: 24 },
  pickerBox: { backgroundColor: C.surface, borderRadius: 24, padding: 16, maxHeight: 400, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  pickerTitle: { fontSize: 18, fontWeight: '800', color: C.textHead, marginBottom: 16, textAlign: 'center' },
  pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14 },
  pickerItemSelected: { backgroundColor: C.primaryLight },
  pickerItemText: { fontSize: 16, color: C.textHead },
  input: { 
    backgroundColor: C.bg, 
    borderRadius: 14, 
    padding: 16, 
    fontSize: 16, 
    color: C.textHead,
    borderWidth: 1,
    borderColor: C.border,
  },
  rowInput: { flexDirection: 'row' },
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
