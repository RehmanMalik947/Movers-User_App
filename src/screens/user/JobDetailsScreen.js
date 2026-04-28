import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { jobApi, chatApi } from '../../api/apiService';
import { useAuth } from '../../context/AuthContext';

// ─── Design Tokens ───────────────────────────────────────────────────────────────
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
  white: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

export default function JobDetailsScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { jobId } = route.params;

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        loadJob();
    }, []);

    const mapJobToUI = (j) => {
        if (!j) return null;
        return {
            ...j,
            pickup: j.pickupLocation || j.pickup || '',
            dropoff: j.deliveryLocation || j.dropoff || '',
            vehicleType: j.truckType || j.vehicleType || '',
            status: (j.status || 'pending').toUpperCase().replace('-', '_'),
            bids: j.bids || [],
        };
    };

    const loadJob = async () => {
        try {
            const [jobRes, bidsRes] = await Promise.all([
                jobApi.getOne(jobId),
                jobApi.getBids(jobId).catch(() => []),
            ]);
            const raw = jobRes?.data ?? jobRes;
            const bids = Array.isArray(bidsRes) ? bidsRes : (bidsRes?.data ?? []);
            setJob({ ...mapJobToUI(raw), bids });
        } catch (error) {
            Alert.alert("Error", "Could not load job details");
            setJob(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptBid = async (bidId) => {
        setActionLoading(true);
        try {
            await jobApi.acceptBid(jobId, bidId);
            Alert.alert("Success", "Bid accepted! The truck owner will be notified.");
            loadJob();
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to accept bid");
        } finally {
            setActionLoading(false);
        }
    };

    const handleChatWithDriver = async () => {
        if (!job.driver_id) {
            Alert.alert("Notice", "Driver not assigned yet.");
            return;
        }
        setActionLoading(true);
        try {
            const chatRes = await chatApi.startChat(currentUser.id, job.driver_id, 'user-driver');
            if (chatRes.success) {
                navigation.navigate('Messaging', {
                    chatId: chatRes.data.id,
                    otherId: job.driver_id,
                    otherName: job.driver_name || 'Driver',
                    myId: currentUser.id,
                    myName: currentUser.name,
                    myRole: 'User'
                });
            }
        } catch (error) {
            Alert.alert("Error", "Could not start chat");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={C.primaryStandard} /></View>;
    if (!job) return <View style={styles.center}><Text style={styles.errorText}>Job not found</Text></View>;

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color={C.textHead} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Status Section */}
                <View style={[styles.statusBanner,
                (job.status === 'BIDDING' || job.status === 'PENDING') ? { backgroundColor: C.primaryStandard } :
                    job.status === 'ACCEPTED' ? { backgroundColor: C.success } :
                        { backgroundColor: C.primary }
                ]}>
                    <View style={styles.statusContent}>
                        <Icon name="shield-checkmark" size={24} color={C.white} />
                        <View>
                            <Text style={styles.statusText}>{job.status?.replace('_', ' ') || job.status}</Text>
                            <Text style={styles.statusSub}>
                                {(job.status === 'BIDDING' || job.status === 'PENDING') ? 'Waiting for bids' :
                                    job.status === 'ACCEPTED' ? 'Owner needs to assign a driver' :
                                        job.status === 'ASSIGNED' || job.status === 'IN_PROGRESS' ? 'Job is in progress' :
                                            job.status === 'COMPLETED' ? 'Completed' : '—'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Chat with Driver */}
                {(job.status === 'ASSIGNED' || job.status === 'IN_PROGRESS') && (
                    <TouchableOpacity 
                        style={styles.chatButton} 
                        onPress={handleChatWithDriver}
                        disabled={actionLoading}
                        activeOpacity={0.8}
                    >
                        <Icon name="chatbubbles" size={20} color={C.white} />
                        <Text style={styles.chatButtonText}>Chat with Driver</Text>
                    </TouchableOpacity>
                )}

                {/* Main Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.sectionHeader}>Route Summary</Text>
                        <View style={styles.vehicleBadge}>
                            <Text style={styles.vehicleText}>{job.vehicleType}</Text>
                        </View>
                    </View>

                    <View style={styles.locationRow}>
                        <View style={styles.dotContainer}>
                            <View style={[styles.dot, { backgroundColor: C.primaryStandard }]} />
                            <View style={styles.line} />
                            <View style={[styles.dot, { backgroundColor: C.error }]} />
                        </View>
                        <View style={styles.addressContainer}>
                            <View>
                                <Text style={styles.label}>Pickup</Text>
                                <Text style={styles.addressValue}>{job.pickup}</Text>
                            </View>
                            <View style={{ height: 24 }} />
                            <View>
                                <Text style={styles.label}>Dropoff</Text>
                                <Text style={styles.addressValue}>{job.dropoff}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.metaGrid}>
                        <View style={styles.metaItem}>
                            <Text style={styles.label}>Goods Type</Text>
                            <Text style={styles.metaValue}>{job.goodsType}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Text style={styles.label}>Posted Date</Text>
                            <Text style={styles.metaValue}>{new Date(job.createdAt).toLocaleDateString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Bids */}
                <Text style={styles.sectionTitle}>Bids ({job.bids?.length ?? 0})</Text>

                {!job.bids?.length ? (
                    <View style={styles.emptyBids}>
                        <Icon name="file-tray-outline" size={48} color={C.border} />
                        <Text style={styles.emptyText}>Waiting for truck owners to place bids...</Text>
                    </View>
                ) : (
                    job.bids.map(bid => (
                        <View key={bid.id} style={styles.bidCard}>
                            <View style={styles.bidInfo}>
                                <Text style={styles.bidOwner}>{bid.truck_owner_name || `Owner #${bid.truck_owner_id}`}</Text>
                                <Text style={styles.bidAmount}>Rs. {bid.price.toLocaleString()}</Text>
                            </View>

                            {(bid.status || '').toLowerCase() === 'accepted' ? (
                                <View style={styles.acceptedBadge}>
                                    <Icon name="checkmark-circle" size={16} color={C.white} />
                                    <Text style={styles.acceptedText}>ACCEPTED</Text>
                                </View>
                            ) : (job.status === 'PENDING' || job.status === 'BIDDING') ? (
                                <TouchableOpacity
                                    style={styles.acceptBtn}
                                    onPress={() => handleAcceptBid(bid.id)}
                                    disabled={actionLoading}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.acceptBtnText}>Accept</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.bidStatusText}>{bid.status || '—'}</Text>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: C.textMuted, fontSize: 16 },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 16, 
        backgroundColor: C.surface,
        borderBottomWidth: 1,
        borderBottomColor: C.border 
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: C.textHead, letterSpacing: -0.5 },
    scroll: { padding: 20, paddingBottom: 40 },

    statusBanner: { padding: 20, borderRadius: 24, marginBottom: 20, elevation: 4, shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10 },
    statusContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    statusText: { color: C.white, fontSize: 18, fontWeight: '800', textTransform: 'uppercase' },
    statusSub: { color: C.white + 'CC', fontSize: 13, fontWeight: '500', marginTop: 2 },

    card: { backgroundColor: C.surface, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: C.border, marginBottom: 24 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    sectionHeader: { fontSize: 16, fontWeight: '800', color: C.textHead },
    vehicleBadge: { backgroundColor: C.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    vehicleText: { color: C.primaryStandard, fontSize: 12, fontWeight: '700' },
    
    locationRow: { flexDirection: 'row' },
    dotContainer: { alignItems: 'center', width: 20, marginRight: 16 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    line: { width: 1, flex: 1, backgroundColor: C.border, marginVertical: 4 },
    addressContainer: { flex: 1 },
    label: { fontSize: 11, color: C.textMuted, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
    addressValue: { fontSize: 14, color: C.textBody, fontWeight: '500' },
    
    divider: { height: 1, backgroundColor: C.border, marginVertical: 20 },
    metaGrid: { flexDirection: 'row' },
    metaItem: { flex: 1 },
    metaValue: { fontSize: 15, color: C.textHead, fontWeight: '600' },

    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, color: C.textHead },
    emptyBids: { alignItems: 'center', paddingVertical: 40, gap: 12 },
    emptyText: { color: C.textMuted, fontSize: 14, textAlign: 'center' },

    bidCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.surface, padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: C.border },
    bidInfo: { flex: 1 },
    bidOwner: { fontSize: 13, color: C.textMuted, fontWeight: '500' },
    bidAmount: { fontSize: 18, fontWeight: '800', color: C.primaryStandard, marginTop: 2 },

    acceptBtn: { backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    acceptBtnText: { color: C.white, fontWeight: '800', fontSize: 14 },

    acceptedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.success, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 6 },
    acceptedText: { color: C.white, fontWeight: '800', fontSize: 11 },
    bidStatusText: { color: C.textMuted, fontSize: 13, fontWeight: '600' },

    chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.success,
        padding: 16,
        borderRadius: 20,
        marginBottom: 20,
        gap: 10,
        elevation: 4,
        shadowColor: C.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    chatButtonText: { color: C.white, fontWeight: '800', fontSize: 16 }
});

