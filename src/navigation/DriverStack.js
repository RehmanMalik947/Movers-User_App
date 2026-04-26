import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverDashboard from '../screens/driver/DriverDashboard';
import ActiveJobScreen from '../screens/driver/ActiveJobScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MessagingScreen from '../screens/MessagingScreen';
import ChatStack from './ChatStack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DriverHomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
            <Stack.Screen name="ActiveJob" component={ActiveJobScreen} />
            <Stack.Screen name="Messaging" component={MessagingScreen} />
        </Stack.Navigator>
    );
}

export default function DriverStack() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.secondary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DriverHomeStack}
                options={{
                    tabBarIcon: ({ color }) => <Icon name="local-shipping" size={24} color={color} />
                }}
            />
            <Tab.Screen
                name="Messages"
                component={ChatStack}
                options={{
                    tabBarIcon: ({ color }) => <Icon name="chat" size={24} color={color} />
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color }) => <Icon name="person" size={24} color={color} />
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }
});
