import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { chatApi, jobApi } from '../../api/apiService';
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
            const res = await jobApi.getOne(jobId);
            if (res.success) {
                setJob(res.data);
            } else {
                Alert.alert("Error", "Could not load job");
            }
        } catch (error) {
            Alert.alert("Error", "Could not load job");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus) => {
        setUpdating(true);
        try {
            const res = await jobApi.update(jobId, { status: newStatus.toLowerCase() });
            if (res.success) {
                setJob(prev => ({ ...prev, status: newStatus.toLowerCase() }));
                Alert.alert("Success", `Status updated to ${newStatus}`);
            } else {
                Alert.alert("Error", res.error || "Could not update status");
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleChatWithCustomer = async () => {
      const customerId = job.customer_id || job.userId;
      if (!customerId) {
        Alert.alert('Notice', 'Customer information not found.');
        return;
      }
      setUpdating(true);
      try {
        const res = await chatApi.startConversation(currentUser.id, customerId, 'user-driver');
        if (res.success) {
          navigation.navigate('Messages', {
            screen: 'Chat',
            params: {
              conversationId: res.data.id,
              otherId: customerId,
              otherName: job.customer_name || 'Customer',
            },
          });
        }
      } catch (err) {
        Alert.alert('Error', 'Could not start chat');
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
        const currentStatus = job.status?.toLowerCase();
        switch (currentStatus) {
            case 'assigned': return { label: 'Start Job', next: 'IN_PROGRESS', icon: 'play' };
            case 'in_progress': return { label: 'Complete Job', next: 'COMPLETED', icon: 'checkmark-circle' };
            default: return null;
        }
    };

    const action = getNextAction();
    const isCompleted = job.status?.toLowerCase() === 'completed';

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
                        <Text style={styles.statusText}>{job.status ? job.status.toUpperCase() : 'UNKNOWN'}</Text>
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
                            <Text style={styles.val}>{job.pickupLocation || job.pickup}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.routeLine} />

                    <View style={styles.routeRow}>
                        <View style={styles.iconCircle}>
                            <Icon name="flag" size={18} color={C.error} />
                        </View>
                        <View style={styles.routeInfo}>
                            <Text style={styles.label}>Dropoff</Text>
                            <Text style={styles.val}>{job.deliveryLocation || job.dropoff}</Text>
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
                    ) : isCompleted ? (
                        <View>
                            <View style={styles.completedBox}>
                                <Icon name="checkmark-done-circle" size={30} color={C.white} />
                                <Text style={styles.completedText}>Job Completed</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.rateBtn}
                                onPress={() => navigation.navigate('RateJob', {
                                    jobId,
                                    toId: job.userId || job.customer_id,
                                    toRole: 'customer',
                                    toName: job.customer_name || job.userName || 'Customer',
                                    myId: currentUser?.id,
                                    myRole: 'driver',
                                    jobTitle: job.title,
                                })}
                                activeOpacity={0.9}
                            >
                                <Icon name="star-outline" size={22} color={C.warning} />
                                <Text style={styles.rateBtnText}>Rate Customer</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
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
    rateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.surface,
        padding: 16,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: C.warning,
        gap: 10,
        marginTop: 12,
    },
    rateBtnText: { color: C.warning, fontWeight: '800', fontSize: 16 },
    emptyText: { color: C.textMuted, fontSize: 16, fontWeight: '500' },
});
