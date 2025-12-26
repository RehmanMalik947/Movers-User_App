import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme/theme';

// Screens
import OwnerDashboard from '../screens/owner/OwnerDashboard';
import BidOnJobScreen from '../screens/owner/BidOnJobScreen';
import AssignDriverScreen from '../screens/owner/AssignDriverScreen';
import OwnerJobsScreen from '../screens/owner/OwnerJobsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function OwnerHomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="OwnerDashboard" component={OwnerDashboard} />
            <Stack.Screen name="BidOnJob" component={BidOnJobScreen} />
            <Stack.Screen name="AssignDriver" component={AssignDriverScreen} />
        </Stack.Navigator>
    );
}

export default function OwnerStack() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.secondary,
                tabBarInactiveTintColor: '#777',
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={OwnerHomeStack}
                options={{
                    tabBarIcon: ({ color }) => <Icon name="dashboard" size={24} color={color} />,
                }}
            />

            <Tab.Screen
                name="MyTrucks"
                component={OwnerJobsScreen} // Placeholder, should be Truck Management
                options={{
                    title: 'My Trucks',
                    tabBarIcon: ({ color }) => <Icon name="local-shipping" size={24} color={color} />,
                }}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color }) => <Icon name="person" size={24} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}
