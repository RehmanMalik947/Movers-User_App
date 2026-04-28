import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

// ─── Design Tokens - Matching Login Screen ─────────────────────────────────────────
const C = {
  primary: '#1847B1', // Deep navy blue
  primaryStandard: '#2260D9', // Standard primary blue
  primaryLight: '#E8EFFD', // Light blue tint
  bg: '#F8FAFC', // Cool Gray Background
  surface: '#FFFFFF', // White
  surfaceAlt: '#F8FAFC', // Light background
  textHead: '#0F172A', // Dark text
  textBody: '#334155', // Body text
  textMuted: '#64748B', // Muted text
  textLink: '#2260D9', // Standard blue for links
  border: '#E2E8F0', // Border color
  divider: '#E2E8F0', // Divider color
  white: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

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

  const getInitials = name => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const getRoleIcon = role => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return 'business-outline';
      case 'driver':
        return 'car-outline';
      default:
        return 'person-outline';
    }
  };

  const getRoleColor = role => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return C.warning;
      case 'driver':
        return C.success;
      default:
        return C.primaryStandard;
    }
  };

  const menuItems = [
    {
      icon: 'cart-outline',
      label: 'My Orders',
      onPress: () => navigation?.navigate('Orders'),
    },
    {
      icon: 'card-outline',
      label: 'Payment Methods',
      onPress: () => navigation?.navigate('Payments'),
    },
    {
      icon: 'location-outline',
      label: 'Saved Addresses',
      onPress: () => navigation?.navigate('Addresses'),
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => navigation?.navigate('Notifications'),
      badge: 3,
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Privacy & Security',
      onPress: () => navigation?.navigate('Privacy'),
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      onPress: () => navigation?.navigate('Support'),
    },
    {
      icon: 'settings-outline',
      label: 'Settings',
      onPress: () => navigation?.navigate('Settings'),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Back Button */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color={C.textHead} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation?.navigate('EditProfile')}
            activeOpacity={0.7}
          >
            <Icon name="create-outline" size={22} color={C.primaryStandard} />
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Info Card */}
        <Animated.View
          style={[
            styles.profileCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.7}>
              <Icon name="camera-outline" size={14} color={C.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: getRoleColor(user?.role) + '20' },
            ]}
          >
            <Icon
              name={getRoleIcon(user?.role)}
              size={14}
              color={getRoleColor(user?.role)}
            />
            <Text style={[styles.role, { color: getRoleColor(user?.role) }]}>
              {user?.role?.toUpperCase() || 'USER'}
            </Text>
          </View>
        </Animated.View>

        {/* Contact Info Card */}
        <Animated.View
          style={[
            styles.infoCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Icon name="mail-outline" size={18} color={C.primaryStandard} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>
                {user?.email || 'Not provided'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Icon name="call-outline" size={18} color={C.primaryStandard} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>
                {user?.phone || 'Not provided'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Icon
                name="calendar-outline"
                size={18}
                color={C.primaryStandard}
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>January 2024</Text>
            </View>
          </View>
        </Animated.View>

        {/* Menu Items */}
        <Animated.View
          style={[
            styles.menuCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>Account Settings</Text>

          {menuItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconBg}>
                  <Icon name={item.icon} size={20} color={C.primaryStandard} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <View style={styles.menuRight}>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Icon name="chevron-forward" size={18} color={C.textMuted} />
                </View>
              </TouchableOpacity>
              {index < menuItems.length - 1 && (
                <View style={styles.menuDivider} />
              )}
            </React.Fragment>
          ))}
        </Animated.View>

        {/* Logout Button */}
        <Animated.View
          style={[
            styles.logoutSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={logout}
            activeOpacity={0.8}
          >
            <Icon name="log-out-outline" size={20} color={C.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Version 1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 20,
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
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Profile Card
  profileCard: {
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: C.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
    color: C.primaryStandard,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: C.textHead,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  role: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Info Card
  infoCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    paddingLeft: 20,
    fontSize: 16,
    fontWeight: '600',
    color: C.textHead,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: C.textHead,
  },
  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginVertical: 14,
  },

  // Menu Card
  menuCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingVertical: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: C.textBody,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: C.white,
  },
  menuDivider: {
    height: 1,
    backgroundColor: C.divider,
    marginHorizontal: 16,
  },

  // Logout Section
  logoutSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.error,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.error,
  },
  versionText: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 16,
  },
});
