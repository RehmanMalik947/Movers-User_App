import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { chatApi } from '../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

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

export default function ChatListScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    setupUser();
    const unsubscribe = navigation.addListener('focus', () => {
      if (userId) loadChats(userId);
    });
    return unsubscribe;
  }, [userId]);

  const setupUser = async () => {
    try {
      const rawUser = await AsyncStorage.getItem('user');
      if (rawUser) {
        const user = JSON.parse(rawUser);
        setUserId(user.id);
        setUserInfo(user);
        loadChats(user.id);
      }
    } catch (error) {
      console.error('Setup user error:', error);
    }
  };

  const loadChats = async (id) => {
    try {
      const response = await chatApi.getMyChats(id);
      setChats(response.data);
    } catch (error) {
      console.error('Chat list load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToChat = (item) => {
    const isParticipant1 = item.participant1Id === userId;
    const otherId = isParticipant1 ? item.participant2Id : item.participant1Id;
    const otherName = "Participant";

    navigation.navigate('Messaging', {
      chatId: item.id,
      otherId: otherId,
      otherName: otherName,
      myId: userId,
      myName: userInfo.name,
      myRole: userInfo.role === 'customer' ? 'User' : userInfo.role === 'driver' ? 'Driver' : 'TruckOwner'
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'driver':
        return 'car-outline';
      case 'owner':
        return 'business-outline';
      default:
        return 'person-outline';
    }
  };

  const getInitials = (name) => {
    if (!name || name === 'Participant') return '?';
    return name.charAt(0).toUpperCase();
  };

  const getRandomColor = (id) => {
    const colors = ['#2260D9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const index = id ? id.length % colors.length : 0;
    return colors[index];
  };

  const renderChatTile = ({ item }) => {
    const isParticipant1 = item.participant1Id === userId;
    const otherName = item.chatType === 'user-driver'
      ? (isParticipant1 ? 'Driver' : 'Customer')
      : (isParticipant1 ? 'Truck Owner' : 'Driver');
    
    const avatarColor = getRandomColor(item.id);
    const hasUnread = item.unreadCount > 0;

    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <TouchableOpacity style={styles.chatTile} onPress={() => navigateToChat(item)} activeOpacity={0.7}>
          <View style={[styles.avatarContainer, { backgroundColor: C.primaryLight }]}>
            <Text style={[styles.avatarText, { color: C.primaryStandard }]}>
              {getInitials(otherName)}
            </Text>
          </View>
          
          <View style={styles.chatInfo}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatName}>{otherName}</Text>
              <Text style={styles.chatTime}>
                {item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
              </Text>
            </View>
            
            <View style={styles.messageRow}>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage || 'Start a conversation'}
              </Text>
              {hasUnread && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
          
          <Icon name="chevron-forward" size={20} color={C.textMuted} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={C.primaryStandard} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color={C.textHead} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
            <Icon name="search-outline" size={22} color={C.textMuted} />
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Banner */}
        <Animated.View style={[styles.statsBanner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{chats.length}</Text>
            <Text style={styles.statLabel}>Total Chats</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {chats.filter(chat => chat.unreadCount > 0).length}
            </Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="chatbubbles-outline" size={20} color={C.primaryStandard} />
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </Animated.View>

        {/* Chat List */}
        {chats.length === 0 ? (
          <Animated.View style={[styles.emptyState, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.emptyIconBg}>
              <Icon name="chatbubbles-outline" size={50} color={C.primaryStandard} />
            </View>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>Start a conversation with our team</Text>
            <TouchableOpacity 
              style={styles.startChatBtn}
              onPress={() => navigation.navigate('NewChat')}
              activeOpacity={0.8}
            >
              <Text style={styles.startChatBtnText}>Start New Chat</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={renderChatTile}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* FAB Button */}
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => navigation.navigate('NewChat')}
          activeOpacity={0.85}
        >
          <Icon name="create-outline" size={24} color={C.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textHead,
    letterSpacing: -0.3,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats Banner
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textHead,
  },
  statLabel: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: C.divider,
    alignSelf: 'center',
  },

  // Loading
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 12,
  },

  // List
  list: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },

  // Chat Tile
  chatTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textHead,
  },
  chatTime: {
    fontSize: 11,
    color: C.textMuted,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 13,
    color: C.textMuted,
    marginRight: 10,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.primaryStandard,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 10,
    fontWeight: '600',
    color: C.white,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 90,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textHead,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  startChatBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: C.primary,
    borderRadius: 12,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  startChatBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.white,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});