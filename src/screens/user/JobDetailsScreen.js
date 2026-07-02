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
import {
  getStatusColor,
  getStatusLabel,
  getUserStatusSubtitle,
  isActiveStatus,
  normalizeStatus,
} from '../../utils/jobStatus';
import CancelJobModal from '../../components/CancelJobModal';
import StarRating from '../../components/StarRating';

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
    const [showCancelModal, setShowCancelModal] = useState(false);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        loadJob();
    }, []);

    const mapJobToUI = (j) => {
        if (!j) return null;
        const rawStatus = normalizeStatus(j.status);
        return {
            ...j,
            pickup: j.pickupLocation || j.pickup || '',
            dropoff: j.deliveryLocation || j.dropoff || '',
            vehicleType: j.truckType || j.vehicleType || '',
            status: rawStatus.toUpperCase().replace(/-/g, '_'),
            rawStatus,
            bids: j.bids || [],
            driver_id: j.driverId || j.driver_id,
            driver_name: j.driverName || j.driver_name,
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
        Alert.alert('Notice', 'Driver not assigned yet.');
        return;
      }
      setActionLoading(true);
      try {
        const res = await chatApi.startConversation(currentUser.id, job.driver_id, 'user-driver');
        if (res.success) {
          navigation.navigate('Messages', {
            screen: 'Chat',
            params: {
              conversationId: res.data.id,
              otherId: job.driver_id,
              otherName: job.driver_name || 'Driver',
            },
          });
        }
      } catch (err) {
        Alert.alert('Error', 'Could not start chat');
      } finally {
        setActionLoading(false);
      }
    };

    const handleCancelJob = async (reason) => {
      setActionLoading(true);
      try {
        await jobApi.cancel(jobId, reason);
        setShowCancelModal(false);
        Alert.alert('Cancelled', 'Your shipment has been cancelled.', [
          { text: 'OK', onPress: () => navigation.navigate('HomeMain') },
        ]);
      } catch (error) {
        Alert.alert('Error', error.message || 'Could not cancel job');
      } finally {
        setActionLoading(false);
      }
    };

    const canCancel = normalizeStatus(job?.rawStatus) === 'pending';

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={C.primaryStandard} /></View>;
    if (!job) return <View style={styles.center}><Text style={styles.errorText}>Job not found</Text></View>;

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
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
                    job.status === 'COMPLETED' ? { backgroundColor: C.success } :
                        { backgroundColor: getStatusColor(job.rawStatus) || C.primary }
                ]}>
                    <View style={styles.statusContent}>
                        <Icon name="shield-checkmark" size={24} color={C.white} />
                        <View>
                            <Text style={styles.statusText}>{getStatusLabel(job.rawStatus)}</Text>
                            <Text style={styles.statusSub}>
                                {getUserStatusSubtitle(job.rawStatus)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Track and Chat options */}
                {isActiveStatus(job.rawStatus) && (
                  <View style={{ marginBottom: 20, gap: 12 }}>
                    <TouchableOpacity
                      style={styles.trackButton}
                      onPress={() => navigation.navigate('Tracking', { jobId: job.id })}
                      activeOpacity={0.8}
                    >
                      <Icon name="map" size={20} color={C.white} />
                      <Text style={styles.trackButtonText}>Track Shipment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.chatButton}
                      onPress={handleChatWithDriver}
                      disabled={actionLoading}
                      activeOpacity={0.8}
                    >
                      <Icon name="chatbubbles" size={20} color={C.white} />
                      <Text style={styles.chatButtonText}>Chat with Driver</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {canCancel && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowCancelModal(true)}
                    disabled={actionLoading}
                    activeOpacity={0.8}
                  >
                    <Icon name="close-circle-outline" size={20} color={C.error} />
                    <Text style={styles.cancelButtonText}>Cancel Shipment</Text>
                  </TouchableOpacity>
                )}

                {normalizeStatus(job.rawStatus) === 'cancelled' && job.cancelReason && (
                  <View style={styles.cancelledInfo}>
                    <Icon name="information-circle-outline" size={20} color={C.error} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cancelledLabel}>Cancellation reason</Text>
                      <Text style={styles.cancelledReason}>{job.cancelReason}</Text>
                    </View>
                  </View>
                )}

                {/* Rate Driver & Owner - only for completed jobs */}
                {normalizeStatus(job.rawStatus) === 'completed' && (
                  <View style={{ marginBottom: 20, gap: 10 }}>
                    <TouchableOpacity 
                        style={[styles.rateButton, { marginBottom: 0 }]} 
                        onPress={() => navigation.navigate('RateJob', {
                            jobId: job.id,
                            toId: job.driver_id,
                            toRole: 'driver',
                            toName: job.driver_name || 'Driver',
                            myId: currentUser?.id,
                            myRole: 'customer',
                            jobTitle: job.title,
                        })}
                        activeOpacity={0.8}
                    >
                        <Icon name="star" size={20} color={C.warning} />
                        <Text style={styles.rateButtonText}>Rate Driver</Text>
                    </TouchableOpacity>

                    {(job.truckOwnerId || job.truck_owner_id) ? (
                      <TouchableOpacity 
                          style={[styles.rateButton, { marginBottom: 0, backgroundColor: '#E8EFFD', borderColor: '#C3DAF9', borderStyle: 'solid' }]} 
                          onPress={() => navigation.navigate('RateJob', {
                              jobId: job.id,
                              toId: job.truckOwnerId || job.truck_owner_id,
                              toRole: 'owner',
                              toName: job.truckOwnerName || job.truck_owner_name || 'Truck Owner',
                              myId: currentUser?.id,
                              myRole: 'customer',
                              jobTitle: job.title,
                          })}
                          activeOpacity={0.8}
                      >
                          <Icon name="business" size={20} color="#2260D9" />
                          <Text style={[styles.rateButtonText, { color: '#2260D9' }]}>Rate Truck Owner</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
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

                {canCancel && (
                  <TouchableOpacity
                    style={styles.inviteBtn}
                    onPress={() => navigation.navigate('TruckOwners', { jobId: job.id })}
                    activeOpacity={0.8}
                  >
                    <Icon name="business-outline" size={18} color={C.primaryStandard} />
                    <Text style={styles.inviteBtnText}>Find & Invite Truck Owner</Text>
                  </TouchableOpacity>
                )}

                {job.targetOwnerId && job.targetOwnerName ? (
                  <View style={styles.targetInfo}>
                    <Icon name="paper-plane" size={16} color={C.primaryStandard} />
                    <Text style={styles.targetInfoText}>
                      Sent to <Text style={{ fontWeight: '800' }}>{job.targetOwnerName}</Text>
                    </Text>
                  </View>
                ) : null}

                {/* Bids */}
                <Text style={styles.sectionTitle}>Bids ({job.bids?.length ?? 0})</Text>

                {!job.bids?.length ? (
                    <View style={styles.emptyBids}>
                        <Icon name="file-tray-outline" size={48} color={C.border} />
                        <Text style={styles.emptyText}>
                          {job.targetOwnerName
                            ? `Waiting for ${job.targetOwnerName} to place a bid...`
                            : 'Waiting for truck owners to place bids...'}
                        </Text>
                    </View>
                ) : (
                    job.bids.map(bid => (
                        <View key={bid.id} style={styles.bidCard}>
                            <View style={styles.bidInfo}>
                                <TouchableOpacity
                                  onPress={() => navigation.navigate('TruckOwnerDetail', {
                                    ownerId: bid.truck_owner_id,
                                    jobId: canCancel ? job.id : undefined,
                                  })}
                                  activeOpacity={0.7}
                                >
                                  <Text style={styles.bidOwner}>{bid.truck_owner_name || `Owner #${bid.truck_owner_id}`}</Text>
                                  {(bid.owner_rating > 0 || bid.owner_review_count > 0) && (
                                    <View style={styles.bidRatingRow}>
                                      <StarRating rating={bid.owner_rating || 0} size={12} />
                                      <Text style={styles.bidReviewCount}>
                                        ({bid.owner_review_count || 0} reviews)
                                      </Text>
                                    </View>
                                  )}
                                </TouchableOpacity>
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

            <CancelJobModal
              visible={showCancelModal}
              onClose={() => setShowCancelModal(false)}
              onConfirm={handleCancelJob}
              loading={actionLoading}
            />
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
    bidOwner: { fontSize: 14, color: C.textHead, fontWeight: '700' },
    bidRatingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    bidReviewCount: { fontSize: 11, color: C.textMuted, fontWeight: '600' },
    bidAmount: { fontSize: 18, fontWeight: '800', color: C.primaryStandard, marginTop: 6 },
    inviteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: C.primaryLight,
      padding: 14,
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: C.primaryStandard + '30',
    },
    inviteBtnText: { color: C.primaryStandard, fontWeight: '800', fontSize: 14 },
    targetInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: C.surface,
      padding: 12,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: C.border,
    },
    targetInfoText: { fontSize: 13, color: C.textBody },

    acceptBtn: { backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    acceptBtnText: { color: C.white, fontWeight: '800', fontSize: 14 },

    acceptedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.success, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 6 },
    acceptedText: { color: C.white, fontWeight: '800', fontSize: 11 },
    bidStatusText: { color: C.textMuted, fontSize: 13, fontWeight: '600' },

    trackButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.primaryStandard,
      padding: 16,
      borderRadius: 20,
      gap: 10,
      elevation: 4,
      shadowColor: C.primaryStandard,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    trackButtonText: { color: C.white, fontWeight: '800', fontSize: 16 },
    chatButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.success,
      padding: 16,
      borderRadius: 20,
      gap: 10,
      elevation: 4,
      shadowColor: C.success,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    chatButtonText: { color: C.white, fontWeight: '800', fontSize: 16 },
    rateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.surface,
        padding: 16,
        borderRadius: 20,
        marginBottom: 20,
        gap: 10,
        borderWidth: 2,
        borderColor: C.warning,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    rateButtonText: { color: C.warning, fontWeight: '800', fontSize: 16 },
    cancelButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.surface,
      padding: 16,
      borderRadius: 20,
      marginBottom: 20,
      gap: 10,
      borderWidth: 1.5,
      borderColor: C.error,
    },
    cancelButtonText: { color: C.error, fontWeight: '800', fontSize: 16 },
    cancelledInfo: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: '#FEF2F2',
      padding: 16,
      borderRadius: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#FECACA',
    },
    cancelledLabel: { fontSize: 11, fontWeight: '700', color: C.error, textTransform: 'uppercase', marginBottom: 4 },
    cancelledReason: { fontSize: 14, color: C.textHead, fontWeight: '500', lineHeight: 20 },
});

