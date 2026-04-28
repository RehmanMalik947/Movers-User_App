import { useNavigation } from '@react-navigation/native';
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

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

const TABS = ['Departments', 'National', 'International'];

export default function HomeScreen() {
  const activeIndex = 1; // "National" active
  const navigation = useNavigation();

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

  const services = [
    { name: 'Small Truck', image: require('../assets/smallTruck.png'), size: 'Small' },
    { name: 'Medium Truck', image: require('../assets/mediumTruck.png'), size: 'Medium' },
    { name: 'Heavy Truck', image: require('../assets/heavyTruck.png'), size: 'Heavy' },
    { name: 'Pickup Truck', image: require('../assets/pickup_truck.png'), size: 'Pickup' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcome}>
              Welcome back, <Text style={styles.userName}>Imran</Text> 👋
            </Text>
            <Text style={styles.subtitle}>Driving efficiency in every shipment</Text>
            
            <View style={styles.miniRoute}>
              <View style={styles.miniRouteBadge}>
                <Icon name="location-outline" size={12} color={C.primaryStandard} />
              </View>
              <View style={styles.miniRouteLine} />
              <View style={styles.miniRouteBadge}>
                <Icon name="flag-outline" size={12} color={C.primaryStandard} />
              </View>
            </View>
          </View>

          <View style={styles.profileWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' }}
              style={styles.profileImg}
            />
            <View style={styles.onlineBadge} />
          </View>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.statCard}>
            <View style={styles.statIconBg}>
              <Icon name="cube-outline" size={20} color={C.primaryStandard} />
            </View>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Active Shipments</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconBg}>
              <Icon name="checkmark-circle-outline" size={20} color={C.success} />
            </View>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconBg}>
              <Icon name="star-outline" size={20} color={C.warning} />
            </View>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </Animated.View>

        {/* Tabs */}
        <Animated.View style={[styles.tabsWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.tabs}>
            {TABS.map((tab, idx) => {
              const active = idx === activeIndex;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, active && styles.activeTab]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabText, active && styles.activeTabText]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Route Box */}
        <Animated.View style={[styles.routeBox, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.routeHeader}>
            <Icon name="swap-vertical-outline" size={18} color={C.primaryStandard} />
            <Text style={styles.routeHeaderText}>Current Route</Text>
          </View>
          
          <View style={styles.routeRow}>
            <View style={styles.routeDotStart} />
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>Pickup Location</Text>
              <Text style={styles.routeValue}>Mall 1, Gulberg, Lahore</Text>
            </View>
            <MaterialIcon name="chevron-right" size={22} color={C.textMuted} />
          </View>

          <View style={styles.routeDivider} />

          <View style={styles.routeRow}>
            <View style={styles.routeDotEnd} />
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>Delivery Location</Text>
              <Text style={styles.routeValue}>Johar Town, Lahore</Text>
            </View>
            <MaterialIcon name="chevron-right" size={22} color={C.textMuted} />
          </View>
        </Animated.View>

        {/* Services Section */}
        <Animated.View style={[styles.servicesSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.servicesTitle}>Available Trucks</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {services.map((item, index) => (
              <TouchableOpacity
                key={item.name}
                onPress={() => navigation.navigate('pickup')}
                style={styles.card}
                activeOpacity={0.9}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={styles.cardBadge}>
                      <Text style={styles.cardBadgeText}>{item.size}</Text>
                    </View>
                  </View>
                  <Image
                    source={item.image}
                    style={styles.truckImg}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.arrowWrap}>
                  <Icon name="arrow-forward" size={18} color={C.white} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
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
    paddingBottom: 20,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
    padding: 16,
    backgroundColor: C.surface,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerLeft: {
    flex: 1,
  },
  welcome: {
    fontSize: 16,
    color: C.textMuted,
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textHead,
  },
  subtitle: {
    fontSize: 13,
    color: C.textMuted,
    marginBottom: 10,
  },
  miniRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniRouteBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniRouteLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  profileWrapper: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.white,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  profileImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.success,
    borderWidth: 2,
    borderColor: C.white,
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textHead,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: C.textMuted,
  },

  // Tabs
  tabsWrap: {
    marginBottom: 20,
  },
  tabs: {
    backgroundColor: C.surface,
    borderRadius: 30,
    padding: 4,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: C.border,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: C.primary,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
  },
  activeTabText: {
    color: C.white,
  },

  // Route Box
  routeBox: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  routeHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textHead,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeDotStart: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.primaryStandard,
  },
  routeDotEnd: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.textMuted,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 2,
  },
  routeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textHead,
  },
  routeDivider: {
    height: 1,
    backgroundColor: C.divider,
    marginVertical: 12,
    marginLeft: 22,
  },

  // Services Section
  servicesSection: {
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textHead,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primaryStandard,
  },

  // Grid Cards
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 52) / 2, // Account for padding and gap
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textHead,
  },
  cardBadge: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: C.primaryStandard,
  },
  truckImg: {
    width: '100%',
    height: 60,
  },
  arrowWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  bottomPadding: {
    height: 20,
  },
});