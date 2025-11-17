import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/FontAwesome';

import HomeScreen from '../HomeScreen';

const Tab = createBottomTabNavigator();
const HomeStackNav = createNativeStackNavigator();

const DummyScreen = ({ title }) => (
  <View style={styles.dummy}>
    <Text style={{ fontSize: 18 }}>{title}</Text>
  </View>
);

const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={styles.centerButtonWrapper}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <View style={styles.centerButton}>{children}</View>
  </TouchableOpacity>
);

function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="HomeMain" component={HomeScreen} />
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
          tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
        }}
      />

      <Tab.Screen
        name="Tracking"
        children={() => <DummyScreen title="Tracking" />}
        options={{
          tabBarIcon: ({ color }) => <Icon name="location-on" size={24} color={color} />,
        }}
      />

      {/* Center Floating Button */}
     <Tab.Screen
  name="Action"
  children={() => <DummyScreen title="New Shipment" />}
  options={{
    tabBarIcon: () => (
      <Icon2
        name="send"
        size={28}
        color="#fff"
        style={{ alignSelf: 'center' , marginTop: -2 }}
      />
    ),
    tabBarButton: (props) => <CustomTabBarButton {...props} />,
    tabBarLabel: () => null, // completely remove label space
  }}
      />

      <Tab.Screen
        name="Chats"
        children={() => <DummyScreen title="Chats" />}
        options={{
          tabBarIcon: ({ color }) => <Icon name="chat-bubble-outline" size={24} color={color} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        children={() => <DummyScreen title="Profile" />}
        options={{
          tabBarIcon: ({ color }) => <Icon name="person-outline" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: 65,
    borderTopWidth: 0.3,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
  },
  tabLabel: {
    fontSize: 12,
    paddingBottom: 4,
  },
  centerButtonWrapper: {
    top: -25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E6A940',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  centerButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#E6A940',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  dummy: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
