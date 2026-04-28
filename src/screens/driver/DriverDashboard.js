import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../api/mockService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { chatApi } from '../../api/apiService';
import Icon from 'react-native-vector-icons/Ionicons';

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
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const data = await mockApi.getDriverJobs(user.id);
            setJobs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleContactOwner = async () => {
        if (!user.truckOwnerId) {
            Alert.alert("Notice", "No truck owner assigned to your profile.");
            return;
        }
        try {
            const chatRes = await chatApi.startChat(user.id, user.truckOwnerId, 'driver-owner');
            if (chatRes.success) {
                navigation.navigate('Messaging', {
                    chatId: chatRes.data.id,
                    otherId: user.truckOwnerId,
                    otherName: user.truckOwnerName || 'Truck Owner',
                    myId: user.id,
                    myName: user.name,
                    myRole: 'Driver'
                });
            }
        } catch (error) {
            Alert.alert("Error", "Could not start chat");
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadJobs();
        }, [])
    );

    const renderJobItem = ({ item }) => {
        const isActive = item.status !== 'COMPLETED';
        return (
            <TouchableOpacity
                style={[styles.jobCard, isActive && styles.activeCard]}
                onPress={() => navigation.navigate('ActiveJob', { jobId: item.id })}
                disabled={!isActive}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: isActive ? C.primaryLight : C.border }]}>
                        <Text style={[styles.statusText, { color: isActive ? C.primaryStandard : C.textMuted }]}>
                            {item.status}
                        </Text>
                    </View>
                    <Text style={styles.jobDate}>{new Date(item.date).toDateString()}</Text>
                </View>

                <Text style={styles.jobTitle}>{item.title}</Text>

                <View style={styles.routeContainer}>
                    <View style={styles.routeItem}>
                        <View style={[styles.dot, { backgroundColor: C.success }]} />
                        <Text style={styles.routeText} numberOfLines={1}>{item.pickup}</Text>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.routeItem}>
                        <View style={[styles.dot, { backgroundColor: C.error }]} />
                        <Text style={styles.routeText} numberOfLines={1}>{item.dropoff}</Text>
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
                    <View>
                        <Text style={styles.welcomeText}>Hello, Captain {user?.name} 👋</Text>
                        <Text style={styles.subText}>Ready for your next move?</Text>
                    </View>
                    <TouchableOpacity style={styles.chatBtn} onPress={handleContactOwner} activeOpacity={0.7}>
                        <Icon name="chatbubble-ellipses" size={24} color={C.white} />
                        <View style={styles.chatBadge} />
                    </TouchableOpacity>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{jobs.filter(j => j.status !== 'COMPLETED').length}</Text>
                        <Text style={styles.statLab}>Active Jobs</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{jobs.filter(j => j.status === 'COMPLETED').length}</Text>
                        <Text style={styles.statLab}>Completed</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Assignments</Text>

                <FlatList
                    data={jobs}
                    keyExtractor={item => item.id}
                    renderItem={renderJobItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={loadJobs} tintColor={C.primaryStandard} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="calendar-outline" size={50} color={C.border} />
                            <Text style={styles.emptyText}>No jobs assigned yet.</Text>
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
        marginTop: 12,
        marginBottom: 24 
    },
    welcomeText: { fontSize: 22, fontWeight: '800', color: C.textHead, letterSpacing: -0.5 },
    subText: { fontSize: 14, color: C.textMuted, marginTop: 2 },
    chatBtn: { 
        width: 52, 
        height: 52, 
        borderRadius: 18, 
        backgroundColor: C.primary, 
        justifyContent: 'center', 
        alignItems: 'center',
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },
    chatBadge: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: C.success,
        borderWidth: 1.5,
        borderColor: C.primary,
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

    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, color: C.textHead },
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
