import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { jobApi, ownerApi } from '../../api/apiService';
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

export default function BidOnJobScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { jobId } = route.params;

    const [job, setJob] = useState(null);
    const [bidAmount, setBidAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadJob();
    }, [jobId]);

    const loadJob = async () => {
        try {
            const raw = await jobApi.getOne(jobId);
            const j = raw?.data ?? raw;
            if (j) {
                setJob({
                    ...j,
                    pickup: j.pickupLocation || j.pickup || '',
                    dropoff: j.deliveryLocation || j.dropoff || '',
                    vehicleType: j.truckType || j.vehicleType || '',
                });
            }
        } catch (error) {
            Alert.alert("Error", "Could not load job details");
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceBid = async () => {
        const price = parseFloat(bidAmount, 10);
        if (!bidAmount || isNaN(price) || price <= 0) {
            Alert.alert("Required", "Please enter a valid bid amount (Rs.)");
            return;
        }

        setSubmitting(true);
        try {
            await ownerApi.placeBid(jobId, { price });
            Alert.alert("Success", "Bid placed! The customer will see your offer.");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to place bid");
        } finally {
            setSubmitting(false);
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
            <Text style={styles.emptyText}>Job no longer available</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                    <Icon name="close" size={24} color={C.textHead} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Review & Bid</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <Text style={styles.jobTitle}>{job.title}</Text>

                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Trip Route</Text>
                    
                    <View style={styles.routeRow}>
                        <Icon name="location" size={18} color={C.success} />
                        <Text style={styles.address}>{job.pickup}</Text>
                    </View>
                    <View style={styles.connector} />
                    <View style={styles.routeRow}>
                        <Icon name="flag" size={18} color={C.error} />
                        <Text style={styles.address}>{job.dropoff}</Text>
                    </View>

                    <View style={styles.divider} />
                    
                    <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Vehicle Type</Text>
                            <Text style={styles.detailVal}>{job.vehicleType}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Goods Type</Text>
                            <Text style={styles.detailVal}>{job.goodsType}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.bidSection}>
                    <Text style={styles.sectionTitle}>Your Offer Amount</Text>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.currencyPrefix}>Rs.</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            placeholderTextColor={C.textMuted}
                            keyboardType="numeric"
                            value={bidAmount}
                            onChangeText={setBidAmount}
                            autoFocus
                        />
                    </View>
                    <Text style={styles.hint}>Suggested bids are around Rs. 4,500 - 6,000</Text>
                </View>

                <TouchableOpacity
                    style={[styles.btn, (!bidAmount || submitting) && styles.btnDisabled]}
                    onPress={handlePlaceBid}
                    disabled={submitting || !bidAmount}
                    activeOpacity={0.9}
                >
                    {submitting ? (
                        <ActivityIndicator color={C.white} />
                    ) : (
                        <>
                            <Text style={styles.btnText}>Submit Bid</Text>
                            <Icon name="arrow-forward" size={20} color={C.white} style={{ marginLeft: 8 }} />
                        </>
                    )}
                </TouchableOpacity>

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

    jobTitle: { fontSize: 24, fontWeight: '800', color: C.textHead, marginBottom: 24, letterSpacing: -0.5 },

    card: { 
        backgroundColor: C.surface, 
        padding: 20, 
        borderRadius: 24, 
        marginBottom: 30,
        borderWidth: 1,
        borderColor: C.border,
    },
    cardLabel: { fontSize: 12, color: C.textMuted, fontWeight: '700', textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 },
    routeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    address: { fontSize: 15, color: C.textHead, flex: 1, fontWeight: '500' },
    connector: { height: 16, borderLeftWidth: 1.5, borderLeftColor: C.divider, marginLeft: 8.5, marginVertical: 4 },
    divider: { height: 1, backgroundColor: C.divider, marginVertical: 20 },
    detailsRow: { flexDirection: 'row', gap: 32 },
    detailItem: { flex: 1 },
    detailLabel: { fontSize: 12, color: C.textMuted, marginBottom: 4 },
    detailVal: { fontSize: 15, fontWeight: '700', color: C.textHead },

    bidSection: { marginBottom: 40 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16, color: C.textHead },
    inputWrapper: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: C.surface,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 2,
        borderColor: C.primaryStandard,
    },
    currencyPrefix: { fontSize: 20, fontWeight: '700', color: C.textMuted, marginRight: 8 },
    input: { 
        flex: 1, 
        fontSize: 24, 
        fontWeight: '800', 
        paddingVertical: 16, 
        color: C.textHead 
    },
    hint: { fontSize: 13, color: C.textMuted, marginTop: 12, fontWeight: '500' },

    btn: { 
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
    btnDisabled: { backgroundColor: C.border, shadowOpacity: 0, elevation: 0 },
    btnText: { color: C.white, fontSize: 18, fontWeight: '800' },
    emptyText: { fontSize: 16, color: C.textMuted, fontWeight: '500' },
});
