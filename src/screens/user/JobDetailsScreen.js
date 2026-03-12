import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';
import { jobApi } from '../../api/apiService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function JobDetailsScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { jobId } = route.params;

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

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

    if (loading) return <ActivityIndicator style={styles.center} color={theme.colors.primary} />;
    if (!job) return <View style={styles.center}><Text>Job not found</Text></View>;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Status Banner */}
                <View style={[styles.statusBanner,
                (job.status === 'BIDDING' || job.status === 'PENDING') ? { backgroundColor: theme.colors.secondary } :
                    job.status === 'ACCEPTED' ? { backgroundColor: theme.colors.success } :
                        { backgroundColor: theme.colors.primary }
                ]}>
                    <Text style={styles.statusText}>{job.status?.replace('_', ' ') || job.status}</Text>
                    <Text style={styles.statusSub}>
                        {(job.status === 'BIDDING' || job.status === 'PENDING') ? 'Waiting for bids' :
                            job.status === 'ACCEPTED' ? 'Owner needs to assign a driver' :
                                job.status === 'ASSIGNED' || job.status === 'IN_PROGRESS' ? 'Job is in progress' :
                                    job.status === 'COMPLETED' ? 'Completed' : '—'}
                    </Text>
                </View>

                {/* Info Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Trip Details</Text>
                    <View style={styles.row}>
                        <Icon name="my-location" size={20} color="#4CAF50" />
                        <View style={styles.textBlock}>
                            <Text style={styles.label}>Pickup</Text>
                            <Text style={styles.value}>{job.pickup}</Text>
                        </View>
                    </View>
                    <View style={styles.connector} />
                    <View style={styles.row}>
                        <Icon name="location-on" size={20} color="#F44336" />
                        <View style={styles.textBlock}>
                            <Text style={styles.label}>Dropoff</Text>
                            <Text style={styles.value}>{job.dropoff}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.metaRow}>
                        <View>
                            <Text style={styles.label}>Goods Type</Text>
                            <Text style={styles.value}>{job.goodsType}</Text>
                        </View>
                        <View>
                            <Text style={styles.label}>Vehicle</Text>
                            <Text style={styles.value}>{job.vehicleType}</Text>
                        </View>
                    </View>
                </View>

                {/* Bids Section */}
                <Text style={styles.sectionTitle}>Bids Received ({job.bids?.length ?? 0})</Text>

                {!job.bids?.length ? (
                    <Text style={styles.emptyText}>No bids yet. Truck owners with matching trucks can place bids.</Text>
                ) : (
                    job.bids.map(bid => (
                        <View key={bid.id} style={styles.bidCard}>
                            <View>
                                <Text style={styles.bidOwner}>{bid.truck_owner_name || `Owner #${bid.truck_owner_id}`}</Text>
                                <Text style={styles.bidAmount}>Rs. {bid.price}</Text>
                            </View>

                            {(bid.status || '').toLowerCase() === 'accepted' ? (
                                <View style={styles.acceptedBadge}>
                                    <Icon name="check" size={16} color="#fff" />
                                    <Text style={styles.acceptedText}>ACCEPTED</Text>
                                </View>
                            ) : (job.status === 'PENDING' || job.status === 'BIDDING' || (job.status || '').toLowerCase() === 'pending') ? (
                                <TouchableOpacity
                                    style={styles.acceptBtn}
                                    onPress={() => handleAcceptBid(bid.id)}
                                    disabled={actionLoading}
                                >
                                    <Text style={styles.acceptBtnText}>Accept</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.rejectedText}>{bid.status || '—'}</Text>
                            )}
                        </View>
                    ))
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', elevation: 2 },
    headerTitle: { fontSize: 20, fontWeight: '700', marginLeft: 16, color: '#333' },
    scroll: { padding: 20 },

    statusBanner: { padding: 16, borderRadius: 12, marginBottom: 20 },
    statusText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    statusSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },

    card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, elevation: 2, marginBottom: 24 },
    sectionHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#333' },
    row: { flexDirection: 'row', alignItems: 'flex-start' },
    textBlock: { marginLeft: 12, flex: 1 },
    label: { fontSize: 12, color: '#888' },
    value: { fontSize: 15, color: '#333', fontWeight: '500' },
    connector: { height: 20, borderLeftWidth: 1, borderLeftColor: '#ddd', marginLeft: 9, marginVertical: 4 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between' },

    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#333' },
    emptyText: { color: '#999', fontStyle: 'italic' },

    bidCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1 },
    bidOwner: { fontSize: 14, color: '#555' },
    bidAmount: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },

    acceptBtn: { backgroundColor: theme.colors.secondary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    acceptBtnText: { color: '#fff', fontWeight: 'bold' },

    acceptedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.success, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    acceptedText: { color: '#fff', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
    rejectedText: { color: '#ccc', fontSize: 12 }
});
