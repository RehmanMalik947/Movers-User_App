import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { chatApi } from '../api/apiService';
import Icon from 'react-native-vector-icons/Ionicons';

const C = {
  primary: '#1847B1',
  primaryStandard: '#2260D9',
  primaryLight: '#E8EFFD',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  textHead: '#0F172A',
  textBody: '#334155',
  textMuted: '#64748B',
  border: '#E2E8F0',
};

export default function NewChatScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const res = await chatApi.getContacts(user?.id, user?.role || 'User');
      setContacts(res?.data || []);
    } catch (err) {
      console.error('Load contacts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (contact) => {
    try {
      const res = await chatApi.startConversation(
        user?.id,
        contact.id,
        contact.role === 'Driver' || contact.role === 'User' ? 'user-driver' : 'driver-owner'
      );
      if (res?.success) {
        navigation.replace('Chat', {
          conversationId: res.data.id,
          otherId: contact.id,
          otherName: contact.name,
        });
      }
    } catch (err) {
      console.error('Start conversation error:', err);
    }
  };

  const renderContact = ({ item }) => (
    <TouchableOpacity style={styles.contactItem} onPress={() => handleSelect(item)} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(item.name || '?').charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.contactBody}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactRole}>{item.role}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={C.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={C.textHead} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Conversation</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primaryStandard} />
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContact}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="people-outline" size={50} color={C.border} />
              <Text style={styles.emptyText}>No contacts available</Text>
              <Text style={styles.emptySub}>Assign a driver to a job to start chatting</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.textHead, marginLeft: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: C.primaryStandard, fontSize: 18, fontWeight: '800' },
  contactBody: { flex: 1, marginLeft: 14 },
  contactName: { fontSize: 16, fontWeight: '700', color: C.textHead },
  contactRole: { fontSize: 12, color: C.textMuted, marginTop: 2, textTransform: 'capitalize' },
  empty: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: C.textMuted },
  emptySub: { fontSize: 13, color: C.textMuted, textAlign: 'center' },
});
