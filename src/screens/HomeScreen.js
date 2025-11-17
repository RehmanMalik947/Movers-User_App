import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TABS = ['Departments', 'National', 'International'];

export default function HomeScreen() {

  const activeIndex = 1; // "National" active
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcome}>
              Welcome, Amna <Text style={{ fontSize: 18 }}>👋</Text>
            </Text>
            <Text style={styles.subtitle}>Driving efficiency in every shipment</Text>

            <View style={styles.miniRoute}>
              <Icon name="my-location" size={14} color="#E6A940" />
              <View style={styles.miniRouteDots} />
              <Icon name="location-on" size={16} color="#E6A940" />
            </View>
          </View>

          <View style={styles.profileWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b36?q=80&w=200&auto=format&fit=crop' }}
              style={styles.profileImg}
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsWrap}>
          <View style={styles.tabs}>
            {TABS.map((tab, idx) => {
              const active = idx === activeIndex;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, active && styles.activeTab]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.tabText, active && styles.activeTabText]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Pickup & Deliver Card */}
        <View style={styles.routeBox}>
          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: '#E6A940' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.routeLabel}>Pick it up from</Text>
              <Text style={styles.routeValue}>Mall 1, Gulberg, Lahore</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#9C9C9C" />
          </View>

          <View style={styles.routeDivider} />

          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: '#9C9C9C' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.routeLabel}>Deliver to</Text>
              <Text style={styles.routeValue}>Johar Town, Lahore</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#9C9C9C" />
          </View>
        </View>

        {/* Services */}
        <Text style={styles.servicesTitle}>Type of services</Text>

        <View style={styles.grid}>
          {[
            { name: 'Small truck', image: require('../assets/smallTruck.png') },
            { name: 'Medium truck', image: require('../assets/mediumTruck.png') },
            { name: 'Heavy truck', image: require('../assets/heavyTruck.png') },
            { name: 'Pickup truck', image: require('../assets/pickup_truck.png') },
            
          ].map((item) => (
            <TouchableOpacity
              key={item.name}
              onPress={() => navigation.navigate('placeOrder')}
              style={styles.card}
              activeOpacity={0.9}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitleTop}>{item.name.split(' ')[0]}</Text>
                <Text style={styles.cardTitleBottom}>{item.name.split(' ')[1] || ''}</Text>
                <Image
                  source={item.image}
                  style={styles.truckImg}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.arrowWrap}>
                <Icon name="chevron-right" size={22} color="#222" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* header */
  header: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    marginBottom: 20,
    backgroundColor: '#FFF4D9', // original color
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  welcome: { fontSize: 20, fontWeight: '700', color: '#2B2B2B' },
  subtitle: { marginTop: 2, fontSize: 14, color: '#7C7C7C' },
  miniRoute: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniRouteDots: { flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: '#E6A940', opacity: 0.6 },
  profileWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#F1E4C9',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  profileImg: { width: '100%', height: '100%' },

  /* tabs */
  tabsWrap: { marginBottom: 18 },
  tabs: { backgroundColor: '#FDF1D9', borderRadius: 22, padding: 5, flexDirection: 'row' },
  tab: { flex: 1, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  activeTab: { backgroundColor: '#DAAE58', shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 2 },
  tabText: { fontSize: 13, color: '#6F6F6F', fontWeight: '600' },
  activeTabText: { color: '#fff' },

  /* route box */
  routeBox: { backgroundColor: '#FDF1D9', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#F0E8D6', marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  routeLabel: { fontSize: 12, color: '#8F8F8F', marginBottom: 2 },
  routeValue: { fontSize: 14, fontWeight: '600', color: '#2A2A2A' },
  routeDivider: { height: 1, backgroundColor: '#EFE7D7', marginVertical: 10 },

  /* section title */
  servicesTitle: { fontSize: 16, fontWeight: '700', color: '#2B2B2B', marginBottom: 12 },

  /* grid & card */
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', height: 140, backgroundColor: '#F2F2F2', borderRadius: 18, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#F0E8D6', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2, flexDirection: 'row' },
  cardTitleTop: { fontSize: 14, fontWeight: '700', color: '#2A2A2A', marginTop: 2 },
  cardTitleBottom: { fontSize: 14, fontWeight: '700', color: '#2A2A2A', marginBottom: 6, lineHeight: 18 },
  truckImg: { width: 90, height: 60, position: 'absolute', bottom: 8, left: 0 },
  arrowWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#DAAE58', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
});
