import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { ownerApi } from '../../api/apiService';
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

const mapJobToUI = (j) => ({
    ...j,
    id: j.id,
    title: j.title || 'Job',
    pickup: j.pickupLocation || j.pickup || '',
    dropoff: j.deliveryLocation || j.dropoff || '',
    vehicleType: j.truckType || j.vehicleType || '',
    goodsType: j.goodsType || '',
    date: j.requestedDate || j.date || '',
});

export default function OwnerDashboard() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const data = await ownerApi.getAvailableJobs();
            const list = Array.isArray(data) ? data : (data?.data ?? []);
            setJobs(list.map(mapJobToUI));
        } catch (error) {
            console.error(error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadJobs();
        }, [])
    );

    const renderJobItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.jobCard}
                onPress={() => navigation.navigate('BidOnJob', { jobId: item.id })}
                activeOpacity={0.8}
            >
                <View style={styles.headerRow}>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.goodsType.toUpperCase()}</Text>
                    </View>
                </View>

                <Text style={styles.jobDate}>{new Date(item.date).toDateString()}</Text>

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

                <View style={styles.footer}>
                    <View style={styles.infoRow}>
                        <Icon name="car-outline" size={16} color={C.textMuted} />
                        <Text style={styles.infoText}>{item.vehicleType}</Text>
                    </View>
                    <View style={styles.actionRow}>
                        <Text style={styles.actionText}>Place Bid</Text>
                        <Icon name="arrow-forward" size={16} color={C.primaryStandard} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Hello, {user?.name} 👋</Text>
                        <Text style={styles.subText}>Find new loads for your fleet</Text>
                    </View>
                    <View style={styles.avatar}>
                        <Icon name="business" size={24} color={C.primaryStandard} />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.myJobsBtn}
                    onPress={() => navigation.navigate('MyJobs')}
                    activeOpacity={0.7}
                >
                    <View style={styles.myJobsIconBg}>
                        <Icon name="list" size={20} color={C.primaryStandard} />
                    </View>
                    <Text style={styles.myJobsBtnText}>Active Bids & Jobs</Text>
                    <Icon name="chevron-forward" size={20} color={C.textMuted} />
                </TouchableOpacity>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Available Market</Text>
                    <TouchableOpacity onPress={loadJobs}>
                        <Icon name="refresh" size={20} color={C.primaryStandard} />
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
                            <Icon name="search-outline" size={50} color={C.border} />
                            <Text style={styles.emptyText}>No available jobs at the moment.</Text>
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
    avatar: { 
        width: 48, 
        height: 48, 
        borderRadius: 16, 
        backgroundColor: C.primaryLight, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },

    myJobsBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: C.surface, 
        padding: 14, 
        borderRadius: 20, 
        marginBottom: 24, 
        borderWidth: 1,
        borderColor: C.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
        gap: 12 
    },
    myJobsIconBg: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: C.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    myJobsBtnText: { flex: 1, fontSize: 16, fontWeight: '700', color: C.textHead },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: C.textHead },

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
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    jobTitle: { fontSize: 17, fontWeight: '700', color: C.textHead, flex: 1, marginRight: 8 },
    badge: { 
        backgroundColor: C.primaryLight, 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 8 
    },
    badgeText: { fontSize: 10, color: C.primaryStandard, fontWeight: '800', letterSpacing: 0.5 },
    jobDate: { fontSize: 12, color: C.textMuted, marginBottom: 16, marginTop: 4, fontWeight: '500' },

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
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { fontSize: 13, color: C.primaryStandard, fontWeight: '700' },

    emptyContainer: { alignItems: 'center', marginTop: 60, gap: 12 },
    emptyText: { fontSize: 14, color: C.textMuted, fontWeight: '500' }
});
