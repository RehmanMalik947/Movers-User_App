import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { jobApi } from '../../api/apiService';
import { getStatusColor, getStatusLabel, normalizeStatus } from '../../utils/jobStatus';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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

export default function UserDashboard() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasOpenJob, setHasOpenJob] = useState(false);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const data = await jobApi.getMyActiveJobs(user.id);
            const list = Array.isArray(data) ? data : (data?.data ?? []);
            setJobs(list.map(mapJobToUI));
            setHasOpenJob(list.length > 0);
        } catch (error) {
            console.error(error);
            setJobs([]);
            setHasOpenJob(false);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJob = () => {
        if (hasOpenJob) {
            Alert.alert(
                'Active Job Exists',
                'You already have an open shipment. Cancel it from job details before posting a new one.',
                [{ text: 'OK' }]
            );
            return;
        }
        navigation.navigate('CreateJob');
    };

    const mapJobToUI = (j) => ({
        id: j.id,
        title: j.title || `${j.pickupLocation || ''} → ${j.deliveryLocation || ''}`.trim() || 'Shipment Request',
        pickup: j.pickupLocation || '',
        dropoff: j.deliveryLocation || '',
        vehicleType: j.truckType || 'Shehzore',
        date: j.requestedDate || new Date().toISOString(),
        rawStatus: normalizeStatus(j.status),
        status: getStatusLabel(j.status),
        bids: j.bids || [],
    });

    useFocusEffect(
        useCallback(() => {
            loadJobs();
        }, [])
    );

    const renderJobItem = ({ item }) => {
        const statusColor = getStatusColor(item.rawStatus);
        const badgeBg = statusColor + '18';

        return (
            <TouchableOpacity
                style={styles.jobCard}
                onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
                    </View>
                    <Text style={styles.jobDate}>{new Date(item.date).toDateString()}</Text>
                </View>

                <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>

                <View style={styles.routeContainer}>
                    <View style={styles.routeRow}>
                        <View style={[styles.dot, { backgroundColor: C.success }]} />
                        <Text style={styles.routeText} numberOfLines={1}>{item.pickup}</Text>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.routeRow}>
                        <View style={[styles.dot, { backgroundColor: C.error }]} />
                        <Text style={styles.routeText} numberOfLines={1}>{item.dropoff}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.infoRow}>
                        <Icon name="car-outline" size={14} color={C.textMuted} />
                        <Text style={styles.infoText}>{item.vehicleType}</Text>
                    </View>
                    {item.status === 'BIDDING' && item.bids.length > 0 && (
                        <View style={styles.bidsBadge}>
                            <Text style={styles.bidsText}>{item.bids.length} Bids</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Hello, {user?.name} 👋</Text>
                        <Text style={styles.subText}>Manage your move seamlessly</Text>
                    </View>
                    <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
                        <Icon name="person" size={24} color={C.primaryStandard} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.actionCard, hasOpenJob && styles.actionCardMuted]}>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>{hasOpenJob ? 'Shipment in progress' : 'Need to move?'}</Text>
                        <Text style={styles.actionSub}>
                            {hasOpenJob
                                ? 'Finish or cancel your current job before posting a new request.'
                                : 'Post a job and get real-time bids from vetted drivers.'}
                        </Text>
                        <TouchableOpacity
                            style={[styles.bookBtn, hasOpenJob && styles.bookBtnDisabled]}
                            onPress={handleCreateJob}
                            activeOpacity={0.9}
                            disabled={hasOpenJob}
                        >
                            <Text style={styles.bookBtnText}>
                                {hasOpenJob ? 'Job Already Active' : 'Request a Truck'}
                            </Text>
                            {!hasOpenJob && <Icon name="arrow-forward" size={18} color={C.white} />}
                        </TouchableOpacity>
                    </View>
                    <Image source={require('../../assets/mediumTruck.png')} style={styles.actionImg} resizeMode="contain" />
                </View>

                <TouchableOpacity
                    style={styles.browseOwnersBtn}
                    onPress={() => navigation.navigate('TruckOwners')}
                    activeOpacity={0.85}
                >
                    <View style={styles.browseOwnersIcon}>
                        <Icon name="business" size={22} color={C.primaryStandard} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.browseOwnersTitle}>Browse Truck Owners</Text>
                        <Text style={styles.browseOwnersSub}>View ratings & send job requests to specific owners</Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color={C.textMuted} />
                </TouchableOpacity>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active Shipments</Text>
                    <View style={styles.sectionActions}>
                        <TouchableOpacity onPress={() => navigation.navigate('OrderHistory')} style={styles.historyBtn}>
                            <Icon name="time-outline" size={18} color={C.primaryStandard} />
                            <Text style={styles.historyBtnText}>History</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={loadJobs}>
                            <Icon name="refresh" size={20} color={C.primaryStandard} />
                        </TouchableOpacity>
                    </View>
                </View>

                <FlatList
                    data={jobs}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderJobItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={loadJobs} tintColor={C.primaryStandard} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="cube-outline" size={50} color={C.border} />
                            <Text style={styles.emptyText}>No active shipments found.</Text>
                        </View>
                    }
                />
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    content: { flex: 1, paddingHorizontal: 20 },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: 12,
        marginBottom: 24 
    },
    welcomeText: { fontSize: 22, fontWeight: '800', color: C.textHead, letterSpacing: -0.5 },
    subText: { fontSize: 14, color: C.textMuted, marginTop: 2 },
    profileBtn: { 
        width: 48, 
        height: 48, 
        borderRadius: 16, 
        backgroundColor: C.surface, 
        justifyContent: 'center', 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: C.border
    },

    actionCard: { 
        backgroundColor: C.primary, 
        padding: 24, 
        borderRadius: 24, 
        marginBottom: 32, 
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden'
    },
    actionContent: { flex: 1, zIndex: 2 },
    actionTitle: { color: C.white, fontSize: 22, fontWeight: '800', marginBottom: 4 },
    actionSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 20, lineHeight: 18 },
    bookBtn: { 
        backgroundColor: C.primaryStandard, 
        paddingVertical: 12, 
        paddingHorizontal: 20, 
        borderRadius: 14, 
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 8
    },
    bookBtnText: { color: C.white, fontWeight: '700', fontSize: 14 },
    bookBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.25)' },
    actionCardMuted: { opacity: 0.95 },
    actionImg: { width: 120, height: 100, position: 'absolute', right: -20, bottom: -10, opacity: 0.9 },

    browseOwnersBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.surface,
        borderRadius: 18,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: C.border,
        gap: 12,
    },
    browseOwnersIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: C.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    browseOwnersTitle: { fontSize: 15, fontWeight: '800', color: C.textHead },
    browseOwnersSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    historyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: C.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    historyBtnText: { fontSize: 12, fontWeight: '700', color: C.primaryStandard },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: C.textHead },

    list: { paddingBottom: 100 },
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
        elevation: 2 
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    jobTitle: { fontSize: 17, fontWeight: '700', color: C.textHead, marginBottom: 12 },
    jobDate: { fontSize: 12, color: C.textMuted, fontWeight: '500' },

    routeContainer: { marginBottom: 16 },
    routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    routeText: { fontSize: 14, color: C.textBody, flex: 1, fontWeight: '500' },
    routeLine: { height: 12, width: 1, backgroundColor: C.divider, marginLeft: 3.5, marginVertical: 2 },

    footer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: 4, 
        borderTopWidth: 1, 
        borderTopColor: C.divider, 
        paddingTop: 12 
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoText: { fontSize: 13, color: C.textMuted, fontWeight: '500' },
    bidsBadge: { backgroundColor: C.success, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    bidsText: { fontSize: 11, color: C.white, fontWeight: '700' },

    emptyContainer: { alignItems: 'center', marginTop: 60, gap: 12 },
    emptyText: { fontSize: 14, color: C.textMuted, fontWeight: '500' }
});
