import React, { useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform, PanResponder, Animated, Dimensions } from 'react-native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

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

// ─── Design Tokens - Matching Premium Aesthetic ──────────────────────────────────
const C = {
  primary: '#1847B1',        // Deep navy blue
  primaryStandard: '#2260D9', // Standard primary blue
  primaryLight: '#E8EFFD',    // Light blue tint
  bg: '#F8FAFC',              // Cool Gray Background
  surface: '#FFFFFF',         // White
  textHead: '#0F172A',        // Dark text
  textBody: '#334155',        // Body text
  textMuted: '#64748B',       // Muted text
  border: '#E2E8F0',          // Border color
  divider: '#E2E8F0',         // Divider color
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

// ================= DRAGGABLE AI FAB =================
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const FAB_SIZE = 56;
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 70;
const EDGE_PADDING = 12;

function DraggableAIFab({ onPress }) {
    // Start bottom-right, just above the tab bar
    const position = useRef(new Animated.ValueXY({
        x: SCREEN_WIDTH - FAB_SIZE - 20,
        y: SCREEN_HEIGHT - TAB_BAR_HEIGHT - FAB_SIZE - 20,
    })).current;

    const lastPosition = useRef({
        x: SCREEN_WIDTH - FAB_SIZE - 20,
        y: SCREEN_HEIGHT - TAB_BAR_HEIGHT - FAB_SIZE - 20,
    });

    const isDragging = useRef(false);
    const dragDistance = useRef(0);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
            },
            onPanResponderGrant: () => {
                isDragging.current = false;
                dragDistance.current = 0;
                position.setOffset({
                    x: lastPosition.current.x,
                    y: lastPosition.current.y,
                });
                position.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: (_, gestureState) => {
                dragDistance.current = Math.sqrt(gestureState.dx ** 2 + gestureState.dy ** 2);
                if (dragDistance.current > 5) isDragging.current = true;
                position.setValue({ x: gestureState.dx, y: gestureState.dy });
            },
            onPanResponderRelease: (_, gestureState) => {
                position.flattenOffset();

                // Calculate new position
                let newX = lastPosition.current.x + gestureState.dx;
                let newY = lastPosition.current.y + gestureState.dy;

                // Snap to nearest horizontal edge
                const snapToRight = newX + FAB_SIZE / 2 > SCREEN_WIDTH / 2;
                newX = snapToRight
                    ? SCREEN_WIDTH - FAB_SIZE - EDGE_PADDING
                    : EDGE_PADDING;

                // Clamp vertically within safe area
                const minY = 60; // below status bar
                const maxY = SCREEN_HEIGHT - TAB_BAR_HEIGHT - FAB_SIZE - EDGE_PADDING;
                newY = Math.max(minY, Math.min(newY, maxY));

                // Animate snap
                Animated.spring(position, {
                    toValue: { x: newX, y: newY },
                    useNativeDriver: false,
                    tension: 60,
                    friction: 8,
                }).start();

                lastPosition.current = { x: newX, y: newY };

                // If it was a tap (not a drag), open chatbot
                if (!isDragging.current) {
                    onPress();
                }
            },
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.fabContainer,
                { transform: position.getTranslateTransform() },
            ]}
            {...panResponder.panHandlers}
        >
            <View style={styles.fab}>
                <View style={styles.fabGradient}>
                    <Icon name="sparkles" size={24} color="#fff" />
                </View>
            </View>
        </Animated.View>
    );
}

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
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <Tab.Navigator
                tabBar={(props) => {
                    const { state, navigation } = props;
                    const currentRoute = state.routes[state.index];
                    const routeName = getFocusedRouteNameFromRoute(currentRoute) ?? currentRoute.name;
                    
                    const hideFAB = routeName === 'Messaging' || routeName === 'AIChatbot' || routeName === 'Pickup' || routeName === 'Dropoff';
                    
                    return (
                        <View style={{
                            position: 'absolute',
                            top: 0, bottom: 0, left: 0, right: 0,
                            pointerEvents: 'box-none',
                            zIndex: 100,
                        }}>
                            {/* BottomTabBar pinned at bottom */}
                            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                                <BottomTabBar {...props} />
                            </View>
                            {/* Draggable FAB — free to go anywhere on screen */}
                            {!hideFAB && (
                                <DraggableAIFab
                                    onPress={() => navigation.navigate('HomeTab', { screen: 'AIChatbot' })}
                                />
                            )}
                        </View>
                    );
                }}
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: true,
                    tabBarLabelStyle: styles.tabLabel,
                    tabBarActiveTintColor: C.primaryStandard,
                    tabBarInactiveTintColor: C.textMuted,
                    tabBarStyle: styles.tabBar,
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
                            tabBarStyle: showTabBar ? styles.tabBar : { display: 'none' },
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
        position: 'absolute',
        height: Platform.OS === 'ios' ? 88 : 70,
        backgroundColor: C.surface,
        borderTopWidth: 1,
        borderTopColor: C.border,
        paddingBottom: Platform.OS === 'ios' ? 25 : 12,
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
    fab: {
        width: 56,
        height: 56,
        borderRadius: 20,
        backgroundColor: C.primaryStandard,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: C.primaryStandard,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    fabGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabContainer: {
        position: 'absolute',
        zIndex: 999,
        elevation: 20,
    },
});
