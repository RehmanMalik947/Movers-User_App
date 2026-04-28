import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { mockApi } from '../../api/mockService';
import { chatApi } from '../../api/apiService';
import { useAuth } from '../../context/AuthContext';

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

export default function ActiveJobScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { jobId } = route.params;

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        loadJob();
    }, []);

    const loadJob = async () => {
        try {
            const jobData = await mockApi.getJob(jobId);
            setJob(jobData);
        } catch (error) {
            Alert.alert("Error", "Could not load job");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus) => {
        setUpdating(true);
        try {
            await mockApi.updateJobStatus(jobId, newStatus);
            setJob(prev => ({ ...prev, status: newStatus }));
            Alert.alert("Success", `Status updated to ${newStatus}`);
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleChatWithCustomer = async () => {
        if (!job.customer_id && !job.userId) {
            Alert.alert("Notice", "Customer information not found.");
            return;
        }
        setUpdating(true);
        const customerId = job.customer_id || job.userId;
        try {
            const chatRes = await chatApi.startChat(currentUser.id, customerId, 'user-driver');
            if (chatRes.success) {
                navigation.navigate('Messaging', {
                    chatId: chatRes.data.id,
                    otherId: customerId,
                    otherName: job.customer_name || 'Customer',
                    myId: currentUser.id,
                    myName: currentUser.name,
                    myRole: 'Driver'
                });
            }
        } catch (error) {
            Alert.alert("Error", "Could not start chat");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={C.primaryStandard} />
        </View>
    );

    if (!job) return (
        <View style={styles.center}>
            <Icon name="alert-circle-outline" size={50} color={C.border} />
            <Text style={styles.emptyText}>Job not found</Text>
        </View>
    );

    const getNextAction = () => {
        switch (job.status) {
            case 'ASSIGNED': return { label: 'Start Job', next: 'IN_PROGRESS', icon: 'play' };
            case 'IN_PROGRESS': return { label: 'Complete Job', next: 'COMPLETED', icon: 'checkmark-circle' };
            default: return null;
        }
    };

    const action = getNextAction();

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                    <Icon name="arrow-back" size={24} color={C.textHead} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Active Shipment</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={styles.statusSection}>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{job.status}</Text>
                    </View>
                    <Text style={styles.title}>{job.title}</Text>
                </View>

                {/* Map Placeholder */}
                <View style={styles.mapContainer}>
                    <View style={styles.mapPlaceholder}>
                        <Icon name="map-outline" size={40} color={C.textMuted} />
                        <Text style={styles.mapText}>Live Tracking View</Text>
                    </View>
                    <View style={styles.mapOverlay}>
                        <TouchableOpacity style={styles.mapActionBtn}>
                            <Icon name="navigate-outline" size={20} color={C.primaryStandard} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Route Details</Text>
                    
                    <View style={styles.routeRow}>
                        <View style={styles.iconCircle}>
                            <Icon name="location" size={18} color={C.success} />
                        </View>
                        <View style={styles.routeInfo}>
                            <Text style={styles.label}>Pickup</Text>
                            <Text style={styles.val}>{job.pickup}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.routeLine} />

                    <View style={styles.routeRow}>
                        <View style={styles.iconCircle}>
                            <Icon name="flag" size={18} color={C.error} />
                        </View>
                        <View style={styles.routeInfo}>
                            <Text style={styles.label}>Dropoff</Text>
                            <Text style={styles.val}>{job.dropoff}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity 
                        style={styles.chatButton} 
                        onPress={handleChatWithCustomer}
                        disabled={updating}
                        activeOpacity={0.8}
                    >
                        <Icon name="chatbubble-ellipses-outline" size={22} color={C.primaryStandard} />
                        <Text style={styles.chatButtonText}>Chat with Customer</Text>
                    </TouchableOpacity>

                    {action ? (
                        <TouchableOpacity
                            style={styles.bigBtn}
                            onPress={() => updateStatus(action.next)}
                            disabled={updating}
                            activeOpacity={0.9}
                        >
                            {updating ? <ActivityIndicator color={C.white} /> : (
                                <>
                                    <Icon name={action.icon} size={24} color={C.white} style={{ marginRight: 10 }} />
                                    <Text style={styles.btnText}>{action.label}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.completedBox}>
                            <Icon name="checkmark-done-circle" size={30} color={C.white} />
                            <Text style={styles.completedText}>Job Completed</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingHorizontal: 16, 
        paddingVertical: 12,
        backgroundColor: C.surface,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: C.textHead },
    scroll: { padding: 20 },
    
    statusSection: { marginBottom: 24, alignItems: 'center' },
    statusBadge: { 
        backgroundColor: C.primaryLight, 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 20,
        marginBottom: 10,
    },
    statusText: { color: C.primaryStandard, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
    title: { fontSize: 24, fontWeight: '800', color: C.textHead, textAlign: 'center', letterSpacing: -0.5 },

    mapContainer: { marginBottom: 24, position: 'relative' },
    mapPlaceholder: { 
        height: 180, 
        backgroundColor: C.surface, 
        borderRadius: 24, 
        justifyContent: 'center', 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: C.border,
    },
    mapText: { color: C.textMuted, marginTop: 8, fontSize: 14, fontWeight: '500' },
    mapOverlay: { position: 'absolute', bottom: 12, right: 12 },
    mapActionBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: C.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },

    card: { 
        backgroundColor: C.surface, 
        padding: 20, 
        borderRadius: 24, 
        marginBottom: 24,
        borderWidth: 1,
        borderColor: C.border,
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: C.textHead, marginBottom: 20 },
    routeRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: C.bg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    routeInfo: { flex: 1 },
    routeLine: { 
        height: 20, 
        width: 1, 
        backgroundColor: C.divider, 
        marginLeft: 18, 
        marginVertical: 4 
    },
    label: { fontSize: 12, color: C.textMuted, marginBottom: 2 },
    val: { fontSize: 15, color: C.textHead, fontWeight: '600' },

    actionsContainer: { gap: 16, marginBottom: 40 },
    chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.surface,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.primaryStandard,
        gap: 10,
    },
    chatButtonText: {
        color: C.primaryStandard,
        fontWeight: '700',
        fontSize: 16,
    },
    bigBtn: { 
        backgroundColor: C.primary, 
        paddingVertical: 18, 
        borderRadius: 20, 
        alignItems: 'center', 
        flexDirection: 'row', 
        justifyContent: 'center', 
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8 
    },
    btnText: { color: C.white, fontSize: 18, fontWeight: '800' },

    completedBox: { 
        backgroundColor: C.success, 
        padding: 20, 
        borderRadius: 20, 
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    completedText: { color: C.white, fontWeight: '800', fontSize: 18 },
    emptyText: { color: C.textMuted, fontSize: 16, fontWeight: '500' },
});
