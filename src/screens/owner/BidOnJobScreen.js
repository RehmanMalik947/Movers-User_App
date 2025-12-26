import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme/theme';
import { mockApi } from '../../api/mockService';
import { useAuth } from '../../context/AuthContext';

export default function BidOnJobScreen() {
    const { user } = useAuth();
    const route = useRoute();
    const navigation = useNavigation();
    const { jobId } = route.params;

    const [job, setJob] = useState(null);
    const [bidAmount, setBidAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadJob();
    }, []);

    const loadJob = async () => {
        try {
            // Find job from "all available jobs" (mock)
            // In real app, getJobById
            const jobs = await mockApi.getAvailableJobs(); // This might only show CREATED/BIDDING, perfect.
            const found = jobs.find(j => j.id === jobId);
            setJob(found);
        } catch (error) {
            Alert.alert("Error", "Could not load job details");
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceBid = async () => {
        if (!bidAmount) {
            Alert.alert("Required", "Please enter a bid amount");
            return;
        }

        setSubmitting(true);
        try {
            await mockApi.placeBid(jobId, user.id, parseInt(bidAmount));
            Alert.alert("Success", "Bid Placed Successfully! User will be notified.");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <ActivityIndicator style={styles.center} color={theme.colors.primary} />;
    if (!job) return <View style={styles.center}><Text>Job no longer available</Text></View>;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Place Bid</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.jobTitle}>{job.title}</Text>

                {/* Trip Summary */}
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Icon name="my-location" size={20} color="#4CAF50" />
                        <Text style={styles.address}>{job.pickup}</Text>
                    </View>
                    <View style={styles.connector} />
                    <View style={styles.row}>
                        <Icon name="location-on" size={20} color="#F44336" />
                        <Text style={styles.address}>{job.dropoff}</Text>
                    </View>

                    <View style={styles.divider} />
                    <View style={styles.rowSpace}>
                        <Text style={styles.label}>Vehicle: <Text style={styles.val}>{job.vehicleType}</Text></Text>
                        <Text style={styles.label}>Goods: <Text style={styles.val}>{job.goodsType}</Text></Text>
                    </View>
                </View>

                {/* Bid Input */}
                <Text style={styles.sectionTitle}>Your Offer (Rs.)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 5000"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={bidAmount}
                    onChangeText={setBidAmount}
                    autoFocus
                />
                <Text style={styles.hint}>Enter a competitive price to win this job.</Text>

                <TouchableOpacity
                    style={styles.btn}
                    onPress={handlePlaceBid}
                    disabled={submitting}
                >
                    {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Bid</Text>}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 18, fontWeight: '700', marginLeft: 16, color: '#333' },
    scroll: { padding: 20 },

    jobTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 20 },

    card: { backgroundColor: '#F9F9F9', padding: 16, borderRadius: 12, marginBottom: 30 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    address: { fontSize: 15, color: '#333', flex: 1 },
    connector: { height: 16, borderLeftWidth: 1, borderLeftColor: '#ddd', marginLeft: 9, marginVertical: 4 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
    rowSpace: { flexDirection: 'row', justifyConent: 'space-between', gap: 20 },
    label: { fontSize: 14, color: '#777' },
    val: { fontWeight: '600', color: '#333' },

    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
    input: { fontSize: 24, fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: theme.colors.secondary, paddingVertical: 8, color: '#333' },
    hint: { fontSize: 13, color: '#888', marginTop: 8, marginBottom: 40 },

    btn: { backgroundColor: theme.colors.secondary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
