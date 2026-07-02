import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { chatApi, jobApi } from '../api/apiService';
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
  success: '#10B981',
};

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function ChatListScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await chatApi.getConversations(user.id, user.role || 'User');
      let chats = res?.data || [];
      
      const myRole = user?.role === 'customer' || user?.role === 'user' ? 'User' : user?.role === 'driver' ? 'Driver' : 'TruckOwner';
      
      if (myRole === 'User') {
          const activeRes = await jobApi.getMyActiveJobs(user?.id);
          const jobData = Array.isArray(activeRes) ? activeRes : (activeRes?.data || []);
          const activeDriverIds = jobData.map(j => String(j.driverId));
          chats = chats.filter(c => activeDriverIds.includes(String(c.otherId)));
      } else if (myRole === 'Driver') {
          const activeRes = await jobApi.getDriverActiveJobs(user?.id);
          const jobData = Array.isArray(activeRes) ? activeRes : (activeRes?.data || []);
          const activeUserIds = jobData.map(j => String(j.userId));
          chats = chats.filter(c => {
             if (c.type === 'user-driver') {
                 return activeUserIds.includes(String(c.otherId));
             }
             return true;
          });
      }
      
      setConversations(chats);
    } catch (err) {
      console.error('Load conversations error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.convItem}
      onPress={() => navigation.navigate('Chat', {
        conversationId: item.id,
        otherId: item.otherId,
        otherName: item.otherName,
      })}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(item.otherName || '?').charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.convBody}>
        <View style={styles.convTop}>
          <Text style={styles.convName} numberOfLines={1}>{item.otherName}</Text>
          <Text style={styles.convTime}>{formatTime(item.lastMessageAt)}</Text>
        </View>
        <View style={styles.convBottom}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastSenderName ? `${item.lastSenderName}: ` : ''}
            {item.lastMessage 
               ? (item.lastMessage.includes('|') ? `🎤 Voice Message (${item.lastMessage.split('|')[1]})` : item.lastMessage) 
               : 'No messages yet'}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount > 99 ? '99+' : item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={() => navigation.navigate('NewChat')} activeOpacity={0.7}>
          <Icon name="create-outline" size={24} color={C.primaryStandard} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadConversations} tintColor={C.primaryStandard} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Icon name="chatbubbles-outline" size={50} color={C.border} />
              <Text style={styles.emptyText}>
                {user?.role === 'user' || user?.role === 'customer' ? 'No Active Shipment' : 'No conversations yet'}
              </Text>
              <Text style={styles.emptySub}>
                {user?.role === 'user' || user?.role === 'customer' ? 'Currently no driver assigned with you.' : 'Start a chat from a job or contact'}
              </Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <ActivityIndicator size="large" color={C.primaryStandard} />
            </View>
          )
        }
      />
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
    borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.textHead, letterSpacing: -0.5 },
  list: { padding: 16, paddingBottom: 40 },
  convItem: {
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
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: C.primaryStandard, fontSize: 20, fontWeight: '800' },
  convBody: { flex: 1, marginLeft: 14 },
  convTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convName: { fontSize: 16, fontWeight: '700', color: C.textHead, flex: 1 },
  convTime: { fontSize: 12, color: C.textMuted, marginLeft: 8 },
  convBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  lastMessage: { fontSize: 13, color: C.textMuted, flex: 1 },
  unreadBadge: {
    backgroundColor: C.primaryStandard,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  empty: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: C.textMuted },
  emptySub: { fontSize: 13, color: C.textMuted },
});
