import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import OwnerDashboard from '../screens/owner/OwnerDashboard';
import BidOnJobScreen from '../screens/owner/BidOnJobScreen';
import AssignDriverScreen from '../screens/owner/AssignDriverScreen';
import OwnerJobsScreen from '../screens/owner/OwnerJobsScreen';
import MyTrucksScreen from '../screens/owner/MyTrucksScreen';
import MyDriversScreen from '../screens/owner/MyDriversScreen';
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

function OwnerHomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="OwnerDashboard" component={OwnerDashboard} />
            <Stack.Screen name="BidOnJob" component={BidOnJobScreen} />
            <Stack.Screen name="AssignDriver" component={AssignDriverScreen} />
            <Stack.Screen name="MyJobs" component={OwnerJobsScreen} />
            <Stack.Screen name="Messaging" component={MessagingScreen} />
        </Stack.Navigator>
    );
}

export default function OwnerStack() {
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
                component={OwnerHomeStack}
                options={{
                    title: 'Jobs',
                    tabBarIcon: ({ color, focused }) => (
                        <Icon name={focused ? "briefcase" : "briefcase-outline"} size={22} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="MyTrucks"
                component={MyTrucksScreen}
                options={{
                    title: 'Trucks',
                    tabBarIcon: ({ color, focused }) => (
                        <Icon name={focused ? "bus" : "bus-outline"} size={22} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="MyDrivers"
                component={MyDriversScreen}
                options={{
                    title: 'Drivers',
                    tabBarIcon: ({ color, focused }) => (
                        <Icon name={focused ? "people" : "people-outline"} size={22} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Messages"
                component={ChatStack}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Icon name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} size={22} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Icon name={focused ? "person" : "person-outline"} size={22} color={color} />
                    ),
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
    }
});
