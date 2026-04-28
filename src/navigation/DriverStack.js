import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import DriverDashboard from '../screens/driver/DriverDashboard';
import ActiveJobScreen from '../screens/driver/ActiveJobScreen';
import MessagingScreen from '../screens/MessagingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatStack from './ChatStack';

// ─── Design Tokens ───────────────────────────────────────────────────────────────
const C = {
  primary: '#1847B1',
  primaryStandard: '#2260D9',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  textMuted: '#64748B',
  border: '#E2E8F0',
};

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
                tabBarActiveTintColor: C.primaryStandard,
                tabBarInactiveTintColor: C.textMuted,
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DriverHomeStack}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Icon name={focused ? "speedometer" : "speedometer-outline"} size={22} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Messages"
                component={ChatStack}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Icon name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} size={22} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Icon name={focused ? "person" : "person-outline"} size={22} color={color} />
                    )
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        height: 70,
        backgroundColor: C.surface,
        borderTopWidth: 1,
        borderTopColor: C.border,
        paddingBottom: 12,
        paddingTop: 10,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }
});
