// src/navigation/BottomTabs.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/FontAwesome';


import HomeScreen from '../HomeScreen';
// If you want real screens instead of dummies, import them and swap below
// import CartScreen from '../screens/CartScreen';
// import DetailsScreen from '../screens/DetailsScreen';

const Tab = createBottomTabNavigator();
const HomeStackNav = createNativeStackNavigator();

const DummyScreen = ({ title }) => (
  <View style={styles.dummy}>
    <Text style={{ fontSize: 18 }}>{title}</Text>
  </View>
);

// Center floating action button for the middle tab
const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={styles.centerButtonWrapper}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={styles.centerButton}>{children}</View>
  </TouchableOpacity>
);

// A stack for the Home tab so you can push details/cart later without leaving tabs
function HomeStack() {
  return (
    <HomeStackNav.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
      }}
    >
      <HomeStackNav.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false, title: 'Rubaika Cash & Carry' }}
      />
      {/*
      <HomeStackNav.Screen name="Details" component={DetailsScreen} options={{ title: 'Details' }} />
      <HomeStackNav.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
      */}
    </HomeStackNav.Navigator>
  );
}

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: '#E6A940',
        tabBarInactiveTintColor: '#777',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon name="home" size={22} color={color} />,
        }}
      />

      <Tab.Screen
        name="Tracking"
        children={() => <DummyScreen title="Tracking" />}
        options={{
          tabBarIcon: ({ color }) => <Icon name="location-on" size={22} color={color} />,
        }}
      />

      {/* Center Action Button */}
      <Tab.Screen
        name="Action"
        children={() => <DummyScreen title="New Shipment" />}
        options={{
          tabBarIcon: () => <Icon2 name="send" size={26} color="#fff" />,
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
          tabBarLabel: '',
        }}
      />

      <Tab.Screen
        name="Chats"
        children={() => <DummyScreen title="Chats" />}
        options={{
          tabBarIcon: ({ color }) => <Icon name="chat-bubble-outline" size={22} color={color} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        children={() => <DummyScreen title="Profile" />}
        options={{
          tabBarIcon: ({ color }) => <Icon name="person-outline" size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: 65,
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    elevation: 8,
  },
  tabLabel: {
    fontSize: 12,
    paddingBottom: 4,
  },
  centerButtonWrapper: {
    top: -25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6A940',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  dummy: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
