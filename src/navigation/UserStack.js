import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { jobApi } from '../api/apiService';

// Screens
import UserDashboard from '../screens/user/DashboardScreen';
import CreateJobScreen from '../screens/user/CreateJobScreen';
import JobDetailsScreen from '../screens/user/JobDetailsScreen';
import TrackingScreen from '../screens/TrackingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PickupLocationScreen from '../screens/setPickup';
import DropoffLocationScreen from '../screens/DropoffLocation';
import PlaceOrderScreen from '../screens/PlaceOrderScreen';
import RateJobScreen from '../screens/RateJobScreen';
import ChatStack from './ChatStack';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import TruckOwnersScreen from '../screens/user/TruckOwnersScreen';
import TruckOwnerDetailScreen from '../screens/user/TruckOwnerDetailScreen';

// ─── Design Tokens - Matching Premium Aesthetic ──────────────────────────────────
const C = {
  primary: '#1847B1',
  primaryStandard: '#2260D9',
  primaryLight: '#E8EFFD',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  textHead: '#0F172A',
  textBody: '#334155',
  textMuted: '#64748B',
  border: '#E2E8F0',
  divider: '#E2E8F0',
  white: '#FFFFFF',
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CustomTabBarButton = ({ children, onPress }) => (
    <TouchableOpacity
        style={styles.centerButtonWrapper}
        onPress={onPress}
        activeOpacity={0.9}
    >
        <View style={styles.centerButton}>
            <View style={styles.centerButtonInner}>
                {children}
            </View>
        </View>
    </TouchableOpacity>
);

// ================= HOME STACK =================
function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={UserDashboard} />
            <Stack.Screen name="CreateJob" component={CreateJobScreen} />
            <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
            <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
            <Stack.Screen name="Pickup" component={PickupLocationScreen} />
            <Stack.Screen name="Dropoff" component={DropoffLocationScreen} />
            <Stack.Screen name="RateJob" component={RateJobScreen} />
            <Stack.Screen name="TruckOwners" component={TruckOwnersScreen} />
            <Stack.Screen name="TruckOwnerDetail" component={TruckOwnerDetailScreen} />
        </Stack.Navigator>
    );
}

// ================= USER STACK =================
export default function UserStack() {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: true,
                    tabBarLabelStyle: styles.tabLabel,
                    tabBarActiveTintColor: C.primaryStandard,
                    tabBarInactiveTintColor: C.textMuted,
                    tabBarStyle: [
                        styles.tabBar,
                        {
                            height: Platform.OS === 'ios' ? (insets.bottom > 0 ? 64 + insets.bottom : 70) : (60 + insets.bottom),
                            paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
                        }
                    ],
                }}
            >
                {/* HOME TAB */}
                <Tab.Screen
                    name="HomeTab"
                    component={HomeStack}
                    options={({ route }) => {
                        const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeMain';
                        const showTabBar = routeName === 'HomeMain';

                        return {
                            title: 'Home',
                            tabBarIcon: ({ color, focused }) => (
                                <Icon name={focused ? "home" : "home-outline"} size={22} color={color} />
                            ),
                            tabBarStyle: showTabBar ? [
                                styles.tabBar,
                                {
                                    height: Platform.OS === 'ios' ? (insets.bottom > 0 ? 64 + insets.bottom : 70) : (60 + insets.bottom),
                                    paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
                                }
                            ] : { display: 'none' },
                        };
                    }}
                />

                {/* TRACKING */}
                <Tab.Screen
                    name="Tracking"
                    component={TrackingScreen}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Icon name={focused ? "location" : "location-outline"} size={22} color={color} />
                        ),
                    }}
                />

                {/* CENTER ACTION BUTTON */}
                <Tab.Screen
                    name="Action"
                    component={PlaceOrderScreen}
                    options={{
                        tabBarIcon: () => (
                            <Icon
                                name="add"
                                size={32}
                                color="#fff"
                            />
                        ),
                        tabBarButton: (props) => <CustomTabBarButton {...props} />,
                        tabBarLabel: () => null,
                    }}
                    listeners={({ navigation }) => ({
                        tabPress: async (e) => {
                            e.preventDefault();
                            try {
                                const res = await jobApi.getMyActiveJobs(user.id);
                                const list = res?.data ?? [];
                                if (list.length > 0) {
                                    Alert.alert(
                                        'Active Job Exists',
                                        'Cancel your current shipment before posting a new job.',
                                    );
                                    return;
                                }
                            } catch {
                                // allow navigation if check fails
                            }
                            navigation.navigate('HomeTab', { screen: 'CreateJob' });
                        },
                    })}
                />

                {/* MESSAGES */}
                <Tab.Screen
                    name="Messages"
                    component={ChatStack}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Icon name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} size={22} color={color} />
                        ),
                    }}
                />

                {/* PROFILE */}
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
        </View>
    );
}

// ================= STYLES =================
const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: C.surface,
        borderTopWidth: 1,
        borderTopColor: C.border,
        paddingTop: 10,
        elevation: 20,
        shadowColor: '#0F172A',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 12,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    centerButtonWrapper: {
        top: -32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerButton: {
        width: 68,
        height: 68,
        borderRadius: 24,
        backgroundColor: C.surface,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 12,
    },
    centerButtonInner: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: C.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
