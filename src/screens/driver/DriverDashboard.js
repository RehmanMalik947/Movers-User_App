import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { driverApi, chatApi, jobApi } from '../../api/apiService';
import Icon from 'react-native-vector-icons/Ionicons';
import { getStatusColor, getStatusLabel, isActiveStatus } from '../../utils/jobStatus';
import { useDriverOnline } from '../../context/DriverOnlineContext';

// ─── Design Tokens - Matching Login Screen ─────────────────────────────────────────
const C = {
  primary: '#1847B1',        // Deep navy blue
  primaryStandard: '#2260D9', // Standard primary blue
  primaryLight: '#E8EFFD',    // Light blue tint
  bg: '#F8FAFC',              // Cool Gray Background
  surface: '#FFFFFF',         // White
  surfaceAlt: '#F8FAFC',      // Light background
  textHead: '#0F172A',        // Dark text
  textBody: '#334155',        // Body text
  textMuted: '#64748B',       // Muted text
  textLink: '#2260D9',        // Standard blue for links
  border: '#E2E8F0',          // Border color
  divider: '#E2E8F0',         // Divider color
  white: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

export default function DriverDashboard() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const { isOnline, setIsOnline } = useDriverOnline();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);
    const [completedCount, setCompletedCount] = useState(0);

    const fetchStatus = async () => {
        try {
            const res = await driverApi.getProfile();
            if (res.success) {
                setIsOnline(res.driver.is_online);
                return res.driver.is_online;
            }
        } catch (error) {
            console.error('Fetch status error:', error);
        }
        return false;
    };

    const toggleStatus = async () => {
        setStatusLoading(true);
        try {
            const newStatus = !isOnline;
            const res = await driverApi.toggleOnline(newStatus);
            if (res.success) {
                setIsOnline(newStatus);
                if (newStatus) {
                    loadJobs();
                } else {
                    setJobs([]);
                }
            }
        } catch (error) {
            Alert.alert("Error", "Could not update status");
        } finally {
            setStatusLoading(false);
        }
    };

    const loadJobs = async () => {
        setLoading(true);
        try {
            const [activeRes, historyRes] = await Promise.all([
                jobApi.getDriverActiveJobs(user.id),
                jobApi.getDriverHistory(user.id),
            ]);
            const activeList = activeRes?.data ?? [];
            const historyList = historyRes?.data ?? [];
            setJobs(activeList);
            setCompletedCount(historyList.filter((j) => j.status === 'completed').length);
        } catch (error) {
            console.error(error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleContactOwner = async () => {
      if (!user.truckOwnerId) {
        Alert.alert('Notice', 'No truck owner assigned to your profile.');
        return;
      }
      try {
        const res = await chatApi.startConversation(user.id, user.truckOwnerId, 'driver-owner');
        if (res.success) {
          navigation.navigate('Messages', {
            screen: 'Chat',
            params: {
              conversationId: res.data.id,
              otherId: user.truckOwnerId,
              otherName: user.truckOwnerName || 'Truck Owner',
            },
          });
        }
      } catch (err) {
        Alert.alert('Error', 'Could not start chat');
      }
    };

    useFocusEffect(
        useCallback(() => {
            let mounted = true;
            (async () => {
                const online = await fetchStatus();
                if (!mounted) return;
                if (online) {
                    loadJobs();
                } else {
                    setJobs([]);
                    setLoading(false);
                }
            })();
            return () => { mounted = false; };
        }, [])
    );

    const renderJobItem = ({ item }) => {
        const isActive = item.status?.toLowerCase() !== 'completed';
        const displayStatus = getStatusLabel(item.status);
        const statusColor = getStatusColor(item.status);
        const date = item.requestedDate || item.date || new Date().toISOString();
        return (
            <TouchableOpacity
                style={[styles.jobCard, isActive && styles.activeCard]}
                onPress={() => navigation.navigate('ActiveJob', { jobId: item.id })}
                disabled={!isActive}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {displayStatus}
                        </Text>
                    </View>
                    <Text style={styles.jobDate}>{new Date(date).toDateString()}</Text>
                </View>

                <Text style={styles.jobTitle}>{item.title}</Text>

                <View style={styles.routeContainer}>
                    <View style={styles.routeItem}>
                        <View style={[styles.dot, { backgroundColor: C.success }]} />
                        <Text style={styles.routeText} numberOfLines={1}>{item.pickupLocation || item.pickup}</Text>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.routeItem}>
                        <View style={[styles.dot, { backgroundColor: C.error }]} />
                        <Text style={styles.routeText} numberOfLines={1}>{item.deliveryLocation || item.dropoff}</Text>
                    </View>
                </View>

                {isActive && (
                    <View style={styles.footer}>
                        <Text style={styles.actionText}>Update Status</Text>
                        <Icon name="arrow-forward" size={16} color={C.primaryStandard} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.greetingSection}>
                        <Text style={styles.welcomeText} numberOfLines={1}>Hello, Captain {user?.name} 👋</Text>
                        <Text style={styles.subText} numberOfLines={1}>Ready for your next move?</Text>
                    </View>
                    
                    <View style={styles.headerActions}>
                        <TouchableOpacity 
                            style={[
                                styles.statusPill, 
                                isOnline ? styles.pillOnline : styles.pillOffline
                            ]} 
                            onPress={toggleStatus}
                            disabled={statusLoading}
                            activeOpacity={0.8}
                        >
                            {statusLoading ? (
                                <ActivityIndicator size="small" color={isOnline ? C.white : C.primary} />
                            ) : (
                                <>
                                    <View style={[styles.statusIndicator, { backgroundColor: isOnline ? C.success : '#CBD5E1' }]} />
                                    <Text style={[styles.statusPillText, isOnline ? styles.textWhite : styles.textMuted]}>
                                        {isOnline ? 'ONLINE' : 'OFFLINE'}
                                    </Text>
                                    <Icon 
                                        name={isOnline ? "chevron-down" : "chevron-forward"} 
                                        size={12} 
                                        color={isOnline ? C.white : C.textMuted} 
                                    />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{jobs.length}</Text>
                        <Text style={styles.statLab}>Active Jobs</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{completedCount}</Text>
                        <Text style={styles.statLab}>Completed</Text>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active Assignments</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('OrderHistory')}
                        style={styles.historyBtn}
                    >
                        <Icon name="time-outline" size={16} color={C.primaryStandard} />
                        <Text style={styles.historyText}>History</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={jobs}
                    keyExtractor={item => item.id}
                    renderItem={renderJobItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={loadJobs} tintColor={C.primaryStandard} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon 
                                name={isOnline ? "calendar-outline" : "moon-outline"} 
                                size={50} 
                                color={C.border} 
                            />
                            <Text style={styles.emptyText}>
                                {isOnline ? "No jobs assigned yet." : "You are currently offline. Go online to see jobs."}
                            </Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    container: { flex: 1, paddingHorizontal: 20 },
    header: { 
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    greetingSection: {
        flex: 1,
        marginRight: 10,
    },
    welcomeText: { fontSize: 20, fontWeight: '900', color: C.textHead, letterSpacing: -0.5 },
    subText: { fontSize: 12, color: C.textMuted, marginTop: 2 },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 15,
        gap: 6,
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    pillOnline: {
        backgroundColor: C.primary,
        borderColor: C.primary,
    },
    pillOffline: {
        backgroundColor: C.surface,
        borderColor: C.border,
    },
    statusIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: C.white,
    },
    statusPillText: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.2,
    },
    textWhite: { color: C.white },
    textMuted: { color: C.textMuted },
    headerBtn: { 
        width: 40, 
        height: 40, 
        borderRadius: 12, 
        backgroundColor: C.primaryLight, 
        justifyContent: 'center', 
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: C.surface,
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: C.border,
        alignItems: 'center',
    },
    statBox: { flex: 1, alignItems: 'center' },
    statVal: { fontSize: 20, fontWeight: '800', color: C.textHead },
    statLab: { fontSize: 12, color: C.textMuted, marginTop: 2 },
    statDivider: { width: 1, height: 30, backgroundColor: C.divider },

    sectionTitle: { fontSize: 18, fontWeight: '800', color: C.textHead },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    historyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: C.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    historyText: { fontSize: 12, fontWeight: '700', color: C.primaryStandard },
    list: { paddingBottom: 90 },
    jobCard: { 
        backgroundColor: C.surface, 
        padding: 16, 
        borderRadius: 20, 
        marginBottom: 16, 
        borderWidth: 1, 
        borderColor: C.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    activeCard: { 
        borderColor: C.primaryLight,
        backgroundColor: C.surface,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: { 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 8, 
    },
    statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    jobTitle: { fontSize: 17, fontWeight: '700', color: C.textHead, marginBottom: 16 },
    jobDate: { fontSize: 12, color: C.textMuted, fontWeight: '500' },

    routeContainer: { marginBottom: 16 },
    routeItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    routeText: { fontSize: 14, color: C.textBody, flex: 1, fontWeight: '500' },
    routeLine: { 
        height: 12, 
        width: 1, 
        backgroundColor: C.divider, 
        marginLeft: 3.5, 
        marginVertical: 2 
    },

    footer: { 
        marginTop: 4, 
        paddingTop: 12, 
        borderTopWidth: 1, 
        borderTopColor: C.divider, 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
    },
    actionText: { fontSize: 13, color: C.primaryStandard, fontWeight: '700' },

    emptyContainer: { alignItems: 'center', marginTop: 60, gap: 12 },
    emptyText: { fontSize: 14, color: C.textMuted, fontWeight: '500' }
});
