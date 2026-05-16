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
  Image,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ownerApi, chatApi } from '../../api/apiService';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_BASE_URL } from '../../config/api';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    cnic: '',
    licence_number: '',
    profile_pic: null,
    license_pic: null,
    cnic_front_pic: null,
    cnic_back_pic: null,
  });
  const navigation = useNavigation();
  const { user: currentUser } = useAuth();

  const handleChatWithDriver = async (driver) => {
    try {
      const res = await chatApi.startConversation(currentUser.id, driver.id, 'driver-owner');
      if (res.success) {
        navigation.navigate('Messages', {
          screen: 'Chat',
          params: {
            conversationId: res.data.id,
            otherId: driver.id,
            otherName: driver.name,
          },
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Could not start chat');
    }
  };

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

  const pickImage = (field) => {
    Alert.alert(
      'Select Image',
      'Choose an option to upload your document',
      [
        {
          text: 'Camera',
          onPress: () => {
            launchCamera({ mediaType: 'photo', quality: 0.7, saveToPhotos: true }, (response) => {
              if (response.didCancel || response.errorCode) return;
              if (response.assets && response.assets.length > 0) {
                setForm(prev => ({ ...prev, [field]: response.assets[0] }));
              }
            });
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (response) => {
              if (response.didCancel || response.errorCode) return;
              if (response.assets && response.assets.length > 0) {
                setForm(prev => ({ ...prev, [field]: response.assets[0] }));
              }
            });
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleEditPress = (driver) => {
    setEditId(driver.id);
    setIsEditing(true);
    setForm({
      name: driver.name,
      phone: driver.phone,
      email: driver.email || '',
      password: '',
      cnic: driver.cnic,
      licence_number: driver.licence_number,
      profile_pic: driver.profile_img ? { uri: API_BASE_URL.replace('/api/', '/uploads/') + driver.profile_img, isExisting: true } : null,
      license_pic: driver.licence_img ? { uri: API_BASE_URL.replace('/api/', '/uploads/') + driver.licence_img, isExisting: true } : null,
      cnic_front_pic: driver.cnic_front_img ? { uri: API_BASE_URL.replace('/api/', '/uploads/') + driver.cnic_front_img, isExisting: true } : null,
      cnic_back_pic: driver.cnic_back_img ? { uri: API_BASE_URL.replace('/api/', '/uploads/') + driver.cnic_back_img, isExisting: true } : null,
    });
    setShowAdd(true);
  };

  const handleAddDriver = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || (!isEditing && !form.password.trim()) || !form.cnic.trim() || !form.licence_number.trim()) {
      Alert.alert('Required', 'Please fill in all required fields.');
      return;
    }

    if (!isEditing && (!form.license_pic || !form.cnic_front_pic || !form.cnic_back_pic)) {
      Alert.alert('Documents Required', 'Please upload License and CNIC (Front & Back) pictures.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('phone', form.phone.trim());
      formData.append('email', form.email.trim());
      if (form.password.trim()) formData.append('password', form.password.trim());
      formData.append('cnic', form.cnic.trim());
      formData.append('licence_number', form.licence_number.trim());

      // Append Images
      const appendFile = (field, asset) => {
        if (asset && !asset.isExisting) {
          formData.append(field, {
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `${field}.jpg`,
          });
        }
      };

      appendFile('profile_pic', form.profile_pic);
      appendFile('license_pic', form.license_pic);
      appendFile('cnic_front_pic', form.cnic_front_pic);
      appendFile('cnic_back_pic', form.cnic_back_pic);

      if (isEditing) {
        await ownerApi.updateDriver(editId, formData);
      } else {
        await ownerApi.addDriver(formData);
      }
      
      setShowAdd(false);
      setIsEditing(false);
      setEditId(null);
      setForm({ 
        name: '', phone: '', cnic: '', licence_number: '',
        profile_pic: null, license_pic: null, cnic_front_pic: null, cnic_back_pic: null 
      });
      loadDrivers();
      Alert.alert('Success', isEditing ? 'Driver updated successfully.' : 'Driver added successfully and pending verification.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add driver');
    } finally {
      setSaving(false);
    }
  };

  const toggleDriverStatus = async (driver) => {
    try {
      const newStatus = driver.status === 'active' ? 'inactive' : 'active';
      const formData = new FormData();
      formData.append('status', newStatus);
      await ownerApi.updateDriver(driver.id, formData);
      loadDrivers();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDeleteDriver = async () => {
    Alert.alert(
      'Delete Driver',
      'Are you sure you want to remove this driver profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await ownerApi.deleteDriver(editId);
              setShowAdd(false);
              loadDrivers();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete driver');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
        style={styles.card} 
        onPress={() => handleEditPress(item)}
        activeOpacity={0.9}
    >
      <View style={styles.avatarContainer}>
        {item.profile_img ? (
          <Image 
            source={{ uri: API_BASE_URL.replace('/api/', '/uploads/') + item.profile_img }} 
            style={styles.avatarImage} 
          />
        ) : (
          <Text style={styles.avatarText}>{(item.name || 'D').charAt(0).toUpperCase()}</Text>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
        <View style={styles.badgeRow}>
            <TouchableOpacity 
                style={[styles.statusBadge, item.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}
                onPress={() => toggleDriverStatus(item)}
                activeOpacity={0.7}
            >
                <Text style={styles.statusText}>{item.status || 'active'}</Text>
            </TouchableOpacity>
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
    </TouchableOpacity>
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
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Driver' : 'New Driver Profile'}</Text>
              <TouchableOpacity onPress={() => {
                  setShowAdd(false);
                  setIsEditing(false);
                  setEditId(null);
                  setForm({ 
                    name: '', phone: '', email: '', password: '', cnic: '', licence_number: '',
                    profile_pic: null, license_pic: null, cnic_front_pic: null, cnic_back_pic: null 
                  });
              }}>
                <Icon name="close" size={24} color={C.textHead} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.form}>
              <View style={styles.profileUploadContainer}>
                <TouchableOpacity style={styles.profileUploadBtn} onPress={() => pickImage('profile_pic')}>
                  {form.profile_pic ? (
                    <Image source={{ uri: form.profile_pic.uri }} style={styles.profilePreview} />
                  ) : (
                    <View style={styles.profilePlaceholder}>
                      <Icon name="person" size={40} color={C.primaryStandard} />
                      <Text style={styles.profilePlaceholderText}>Add Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

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
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(t) => setForm({ ...form, email: t })}
                placeholder="driver@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={C.textMuted}
              />
              <Text style={styles.label}>Password {isEditing && '(Leave blank to keep current)'}</Text>
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={(t) => setForm({ ...form, password: t })}
                placeholder="Set password"
                secureTextEntry
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

              <Text style={styles.label}>Documents (Required)</Text>
              
              <View style={styles.docsRow}>
                <View style={styles.docCol}>
                    <Text style={styles.docLabel}>License Pic</Text>
                    <TouchableOpacity style={styles.docUpload} onPress={() => pickImage('license_pic')}>
                        {form.license_pic ? (
                            <Image source={{ uri: form.license_pic.uri }} style={styles.docPreview} />
                        ) : (
                            <Icon name="camera" size={24} color={C.primaryStandard} />
                        )}
                    </TouchableOpacity>
                </View>
                
                <View style={styles.docCol}>
                    <Text style={styles.docLabel}>CNIC Front</Text>
                    <TouchableOpacity style={styles.docUpload} onPress={() => pickImage('cnic_front_pic')}>
                        {form.cnic_front_pic ? (
                            <Image source={{ uri: form.cnic_front_pic.uri }} style={styles.docPreview} />
                        ) : (
                            <Icon name="card" size={24} color={C.primaryStandard} />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.docCol}>
                    <Text style={styles.docLabel}>CNIC Back</Text>
                    <TouchableOpacity style={styles.docUpload} onPress={() => pickImage('cnic_back_pic')}>
                        {form.cnic_back_pic ? (
                            <Image source={{ uri: form.cnic_back_pic.uri }} style={styles.docPreview} />
                        ) : (
                            <Icon name="card-outline" size={24} color={C.primaryStandard} />
                        )}
                    </TouchableOpacity>
                </View>
              </View>

              
              <TouchableOpacity
                style={[styles.submitBtn, saving && styles.submitDisabled]}
                onPress={handleAddDriver}
                disabled={saving}
                activeOpacity={0.9}
              >
                {saving ? (
                    <ActivityIndicator color={C.white} />
                ) : (
                    <Text style={styles.submitText}>{isEditing ? 'Update Driver' : 'Save Driver'}</Text>
                )}
              </TouchableOpacity>

              {isEditing && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={handleDeleteDriver}
                  activeOpacity={0.8}
                >
                  <Icon name="trash-outline" size={20} color={C.error} />
                  <Text style={styles.deleteText}>Remove Driver Profile</Text>
                </TouchableOpacity>
              )}
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
    alignItems: 'center',
    overflow: 'hidden'
  },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
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
  
  docsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 8 },
  docCol: { flex: 1, alignItems: 'center' },
  docLabel: { fontSize: 10, fontWeight: '700', color: C.textMuted, marginBottom: 6, textTransform: 'uppercase' },
  docUpload: { 
    width: '100%', 
    aspectRatio: 1, 
    backgroundColor: C.bg, 
    borderRadius: 16, 
    borderWidth: 1.5, 
    borderColor: C.border, 
    borderStyle: 'dashed',
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'hidden'
  },
  docPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  profileUploadContainer: { alignItems: 'center', marginVertical: 10 },
  profileUploadBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.bg,
    borderWidth: 2,
    borderColor: C.primaryStandard,
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  profilePlaceholder: { alignItems: 'center' },
  profilePlaceholderText: { fontSize: 10, color: C.primaryStandard, fontWeight: '700', marginTop: 4 },
  deleteBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  deleteText: { color: C.error, fontWeight: '700', fontSize: 14 },
});
