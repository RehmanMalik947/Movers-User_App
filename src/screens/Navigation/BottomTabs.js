import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/FontAwesome5';

import HomeScreen from '../HomeScreen';
import TrackingScreen from '../TrackingScreen';
import ChatScreen from '../chatScreen';
import ProfileScreen from '../ProfileScreen';

import { useMode } from '../../context/ModeContext';

import OwnerHomeScreen from '../owner/OwnerHomeScreen';
import OwnerRequestsScreen from '../owner/OwnerRequestsScreen';
import OwnerRequestDetailScreen from '../owner/OwnerRequestDetailScreen';
import OwnerJobsScreen from '../owner/OwnerJobsScreen';

// ─── Design Tokens - Matching Login Screen ─────────────────────────────────────────
const C = {
  primary: '#1847B1',        // Deep navy blue
  primaryStandard: '#2260D9', // Standard primary blue
  primaryLight: '#E8EFFD',    // Light blue tint
  bg: '#F8FAFC',              // Cool Gray Background
  surface: '#FFFFFF',         // White
  textHead: '#0F172A',        // Dark text
  textMuted: '#64748B',       // Muted text
  border: '#E2E8F0',          // Border color
  white: '#FFFFFF',
  active: '#2260D9',          // Active tab color
  inactive: '#94A3B8',        // Inactive tab color
};

const Tab = createBottomTabNavigator();
const HomeStackNav = createNativeStackNavigator();
const OwnerStackNav = createNativeStackNavigator();

const DummyScreen = ({ title }) => (
  <View style={styles.dummy}>
    <View style={styles.dummyIconBg}>
      <Icon name="rocket-outline" size={40} color={C.primaryStandard} />
    </View>
    <Text style={styles.dummyTitle}>{title}</Text>
    <Text style={styles.dummySubtitle}>Coming Soon</Text>
  </View>
);

const CustomTabBarButton = ({ children, onPress, accessibilityState }) => {
  const isFocused = accessibilityState?.selected;

  return (
    <TouchableOpacity
      style={styles.centerButtonWrapper}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[
        styles.centerButton,
        isFocused && styles.centerButtonFocused
      ]}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="HomeMain" component={HomeScreen} />
    </HomeStackNav.Navigator>
  );
}

function OwnerHomeStack() {
  return (
    <OwnerStackNav.Navigator screenOptions={{ headerShown: false }}>
      <OwnerStackNav.Screen name="OwnerHomeMain" component={OwnerHomeScreen} />
      <OwnerStackNav.Screen name="OwnerRequests" component={OwnerRequestsScreen} />
      <OwnerStackNav.Screen name="OwnerRequestDetail" component={OwnerRequestDetailScreen} />
      <OwnerStackNav.Screen name="OwnerJobs" component={OwnerJobsScreen} />
    </OwnerStackNav.Navigator>
  );
}

export default function BottomTabs() {
  const { mode } = useMode();
  const isOwnerMode = mode === 'owner';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: C.active,
        tabBarInactiveTintColor: C.inactive,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={isOwnerMode ? OwnerHomeStack : HomeStack}
        options={{
          title: isOwnerMode ? 'Owner' : 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Icon 
                name={isOwnerMode ? 'business-outline' : (focused ? 'home' : 'home-outline')} 
                size={22} 
                color={color} 
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Tracking"
        component={TrackingScreen}
        options={{
          title: 'Track',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Icon 
                name={focused ? 'location' : 'location-outline'} 
                size={22} 
                color={color} 
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Action"
        component={() => <DummyScreen title="New Shipment" />}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon2
              name="plus"
              size={24}
              color={C.white}
            />
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
          tabBarLabel: () => null,
        }}
      />

      <Tab.Screen
        name="Chats"
        component={ChatScreen}
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Icon 
                name={focused ? 'chatbubble' : 'chatbubble-outline'} 
                size={22} 
                color={color} 
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Icon 
                name={focused ? 'person' : 'person-outline'} 
                size={22} 
                color={color} 
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.surface,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 10,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainerActive: {
    // Optional: Add any active state styling for icon container
  },

  // Floating Action Button Styles
  centerButtonWrapper: {
    top: -28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: C.white,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  centerButtonFocused: {
    backgroundColor: C.primaryStandard,
    transform: [{ scale: 1.02 }],
  },

  // Dummy Screen Styles
  dummy: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bg,
  },
  dummyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dummyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textHead,
    marginBottom: 8,
  },
  dummySubtitle: {
    fontSize: 14,
    color: C.textMuted,
  },
});