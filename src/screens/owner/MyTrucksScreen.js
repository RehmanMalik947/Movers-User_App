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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { ownerApi } from '../../api/apiService';
import { theme } from '../../theme/theme';

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
        <Icon name="local-shipping" size={28} color={theme.colors.primary} />
        <View style={styles.cardBody}>
          <Text style={styles.regNo}>{item.registration_number || `Truck #${item.id}`}</Text>
          {item.model ? <Text style={styles.model}>{item.model}</Text> : null}
          {item.capacity_kg ? <Text style={styles.cap}>{item.capacity_kg} kg</Text> : null}
        </View>
        <View style={[styles.statusBadge, item.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={styles.statusText}>{item.status || 'active'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Trucks</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Icon name="add" size={24} color="#fff" />
          <Text style={styles.addBtnText}>Add Truck</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={trucks}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTrucks} />}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>No trucks yet. Tap "Add Truck" to add one.</Text>
          ) : null
        }
      />

      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Truck</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Truck Category *</Text>
              {categories.length === 0 ? (
                <Text style={styles.hint}>No categories. Ask admin to add truck categories first.</Text>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowCategoryPicker(true)}
                  >
                    <Text style={[styles.dropdownText, !form.category_id && styles.dropdownPlaceholder]}>
                      {form.category_id ? (categories.find((c) => c.id === form.category_id)?.name || 'Select') : 'Select category'}
                    </Text>
                    <Icon name="arrow-drop-down" size={24} color="#666" />
                  </TouchableOpacity>
                  <Modal visible={showCategoryPicker} transparent animationType="fade">
                    <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowCategoryPicker(false)}>
                      <View style={styles.pickerBox}>
                        <Text style={styles.pickerTitle}>Select category</Text>
                        {categories.map((c) => (
                          <TouchableOpacity
                            key={c.id}
                            style={[styles.pickerItem, form.category_id === c.id && styles.pickerItemSelected]}
                            onPress={() => { setForm({ ...form, category_id: c.id }); setShowCategoryPicker(false); }}
                          >
                            <Text style={styles.pickerItemText}>{c.name}</Text>
                            {form.category_id === c.id ? <Icon name="check" size={20} color={theme.colors.primary} /> : null}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </TouchableOpacity>
                  </Modal>
                </>
              )}
              <Text style={styles.label}>Registration Number *</Text>
              <TextInput
                style={styles.input}
                value={form.registration_number}
                onChangeText={(t) => setForm({ ...form, registration_number: t })}
                placeholder="e.g. LHR-1234"
                placeholderTextColor="#999"
              />
              <Text style={styles.label}>Model</Text>
              <TextInput
                style={styles.input}
                value={form.model}
                onChangeText={(t) => setForm({ ...form, model: t })}
                placeholder="e.g. Shehzore"
                placeholderTextColor="#999"
              />
              <Text style={styles.label}>Year</Text>
              <TextInput
                style={styles.input}
                value={form.year}
                onChangeText={(t) => setForm({ ...form, year: t })}
                placeholder="e.g. 2020"
                keyboardType="number-pad"
                placeholderTextColor="#999"
              />
              <Text style={styles.label}>Capacity (kg)</Text>
              <TextInput
                style={styles.input}
                value={form.capacity_kg}
                onChangeText={(t) => setForm({ ...form, capacity_kg: t })}
                placeholder="e.g. 3500"
                keyboardType="number-pad"
                placeholderTextColor="#999"
              />
            </ScrollView>
            <TouchableOpacity
              style={[styles.submitBtn, saving && styles.submitDisabled]}
              onPress={handleAddTruck}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save Truck</Text>}
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
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardBody: { flex: 1, marginLeft: 12 },
  regNo: { fontSize: 16, fontWeight: '700', color: '#333' },
  model: { fontSize: 14, color: '#666', marginTop: 2 },
  cap: { fontSize: 12, color: '#888', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  activeBadge: { backgroundColor: '#E8F5E9' },
  inactiveBadge: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 11, fontWeight: '600', color: '#333' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, paddingHorizontal: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  hint: { fontSize: 13, color: '#888', marginBottom: 8 },
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: '#f5f5f5', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  dropdownText: { fontSize: 16, color: '#333' },
  dropdownPlaceholder: { color: '#999' },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  pickerBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: 320 },
  pickerTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 8 },
  pickerItemSelected: { backgroundColor: '#E8EAF6' },
  pickerItemText: { fontSize: 16, color: '#333' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 14, fontSize: 16, color: '#333' },
  submitBtn: { marginHorizontal: 16, marginTop: 16, backgroundColor: theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
