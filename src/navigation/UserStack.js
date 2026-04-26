import React from 'react';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

// Screens
import UserDashboard from '../screens/user/DashboardScreen';
import CreateJobScreen from '../screens/user/CreateJobScreen';
import JobDetailsScreen from '../screens/user/JobDetailsScreen';
import TrackingScreen from '../screens/TrackingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PickupLocationScreen from '../screens/setPickup';
import DropoffLocationScreen from '../screens/DropoffLocation';
import PlaceOrderScreen from '../screens/PlaceOrderScreen';
import AIChatbotScreen from '../screens/user/AIChatbotScreen';
import MessagingScreen from '../screens/MessagingScreen';
import ChatStack from './ChatStack';

// Theme
import { theme } from '../theme/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CustomTabBarButton = ({ children, onPress }) => (
    <TouchableOpacity
        style={styles.centerButtonWrapper}
        onPress={onPress}
        activeOpacity={0.9}
    >
        <View style={styles.centerButton}>{children}</View>
    </TouchableOpacity>
);

// ================= HOME STACK =================
function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={UserDashboard} />
            <Stack.Screen name="CreateJob" component={CreateJobScreen} />
            <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
            <Stack.Screen name="Pickup" component={PickupLocationScreen} />
            <Stack.Screen name="Dropoff" component={DropoffLocationScreen} />
            <Stack.Screen name="Messaging" component={MessagingScreen} />
            <Stack.Screen name="AIChatbot" component={AIChatbotScreen} />
        </Stack.Navigator>
    );
}

// ================= USER STACK =================
export default function UserStack() {
    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator
                tabBar={(props) => {
                    const { state, navigation } = props;
                    const currentRoute = state.routes[state.index];
                    const routeName = getFocusedRouteNameFromRoute(currentRoute) ?? currentRoute.name;
                    
                    const hideFAB = routeName === 'Messaging' || routeName === 'AIChatbot';
                    
                    return (
                        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, elevation: 0 }}>
                            {!hideFAB && (
                                <View style={{ position: 'absolute', bottom: 85, right: 20, zIndex: 100 }}>
                                    <TouchableOpacity 
                                        style={styles.fab} 
                                        onPress={() => navigation.navigate('HomeTab', { screen: 'AIChatbot' })}
                                        activeOpacity={0.8}
                                    >
                                        <Icon name="smart-toy" size={28} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            <BottomTabBar {...props} />
                        </View>
                    );
                }}
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: true,
                    tabBarLabelStyle: styles.tabLabel,
                    tabBarActiveTintColor: theme.colors.secondary,
                    tabBarInactiveTintColor: '#777',
                    tabBarStyle: styles.tabBar,
                }}
            >
                {/* HOME TAB */}
                <Tab.Screen
                    name="HomeTab"
                    component={HomeStack}
                    options={({ route }) => {
                        const routeName =
                            getFocusedRouteNameFromRoute(route) ?? 'HomeMain';

                        const showTabBar = routeName === 'HomeMain';

                        return {
                            title: 'Home',
                            tabBarIcon: ({ color }) => (
                                <Icon name="home" size={24} color={color} />
                            ),
                            tabBarStyle: showTabBar
                                ? styles.tabBar
                                : { display: 'none' },
                        };
                    }}
                />

                {/* TRACKING */}
                <Tab.Screen
                    name="Tracking"
                    component={TrackingScreen}
                    options={{
                        tabBarIcon: ({ color }) => (
                            <Icon name="location-on" size={24} color={color} />
                        ),
                    }}
                />

                {/* CENTER ACTION BUTTON */}
                <Tab.Screen
                    name="Action"
                    component={PlaceOrderScreen}
                    options={{
                        tabBarIcon: () => (
                            <Icon2
                                name="send"
                                size={28}
                                color="#fff"
                                style={{ marginTop: -2 }}
                            />
                        ),
                        tabBarButton: (props) => <CustomTabBarButton {...props} />,
                        tabBarLabel: () => null,
                    }}
                    listeners={({ navigation }) => ({
                        tabPress: (e) => {
                            e.preventDefault();
                            navigation.navigate('HomeTab', {
                                screen: 'CreateJob',
                            });
                        },
                    })}
                />

                {/* MESSAGES TAB */}
                <Tab.Screen
                    name="Messages"
                    component={ChatStack}
                    options={{
                        tabBarIcon: ({ color }) => (
                            <Icon name="chat" size={24} color={color} />
                        ),
                    }}
                />

                {/* PROFILE */}
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        tabBarIcon: ({ color }) => (
                            <Icon name="person-outline" size={24} color={color} />
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
        shadowColor: theme.colors.secondary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    centerButton: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    fab: {
        position: 'absolute',
        bottom: 85,
        right: 20,
        backgroundColor: theme.colors.secondary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: theme.colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    }
});
