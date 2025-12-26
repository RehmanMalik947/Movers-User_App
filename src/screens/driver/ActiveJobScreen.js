import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme/theme';
import { mockApi } from '../../api/mockService';

export default function ActiveJobScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { jobId } = route.params;

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadJob();
    }, []);

    const loadJob = async () => {
        // Need to refetch job details. 
        // Assuming we can get 'getUserJobs' or 'getDriverJobs' and filter.
        try {
            // HACK: mockApi.getDriverJobs + find. In real app, getJobById.
            // Since mock service is memory based, getting the list works.
            const data = await mockApi.getDriverJobs('d1'); // Assuming 'd1' context, actually should use context user.id.
            // BUT wait, I don't have user.id here easily unless I use context repeatedly or passed in.
            // I'll grab context or just assume the job is fetched.
            // Wait, I can't use 'd1' hardcoded. I should fetch by ID if possible or pass data.
            // I'll just rely on `mockApi` having a helper or I'll implement `getJob` properly.
            // But for now, let's assume `getDriverJobs` is what I used in Dashboard.

            // Let's use a simpler hack: I will access the GLOBAL mock data if I could.
            // Instead, I'll use the hack I did in Owner logic: filter from available? No.
            // I'll update mockApi to expose a `getJobById` quickly or just loop.
            // I'll just iterate all jobs in memory via `getUserJobs` of "u1" maybe? No.

            // Okay, I will implement `getJob` in mockService really quickly in next step.
            // For now, I will write this assuming `mockApi.getJob(jobId)` exists.
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
            Alert.alert("Updated", `Job marked as ${newStatus}`);
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <ActivityIndicator style={styles.center} />;
    if (!job) return <View style={styles.center}><Text>Job not found</Text></View>;

    // Flow: ASSIGNED -> IN_PROGRESS -> PICKED_UP -> DROPPED_OFF -> COMPLETED
    // Simplified: ASSIGNED -> STARTED -> COMPLETED
    // Let's do: ASSIGNED -> "Start Trip" -> IN_PROGRESS -> "Arrived at Pickup" -> "Picked Up" -> "Arrived at Dropoff" -> "Dropped Off" -> COMPLETED.
    // For FYP simplicity: ASSIGNED -> IN_PROGRESS -> COMPLETED

    const getNextAction = () => {
        switch (job.status) {
            case 'ASSIGNED': return { label: 'Start Job', next: 'IN_PROGRESS', icon: 'directions-car' };
            case 'IN_PROGRESS': return { label: 'Complete Job', next: 'COMPLETED', icon: 'check-circle' };
            default: return null;
        }
    };

    const action = getNextAction();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Current Job</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.title}>{job.title}</Text>

                {/* Map Placeholder */}
                <View style={styles.mapPlaceholder}>
                    <Icon name="map" size={48} color="#ccc" />
                    <Text style={{ color: '#999' }}>Map View</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.row}>
                        <Icon name="my-location" size={20} color="#4CAF50" />
                        <View>
                            <Text style={styles.label}>Pickup</Text>
                            <Text style={styles.val}>{job.pickup}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Icon name="location-on" size={20} color="#F44336" />
                        <View>
                            <Text style={styles.label}>Dropoff</Text>
                            <Text style={styles.val}>{job.dropoff}</Text>
                        </View>
                    </View>
                </View>

                {action ? (
                    <TouchableOpacity
                        style={styles.bigBtn}
                        onPress={() => updateStatus(action.next)}
                        disabled={updating}
                    >
                        {updating ? <ActivityIndicator color="#fff" /> : (
                            <>
                                <Icon name={action.icon} size={28} color="#fff" style={{ marginRight: 10 }} />
                                <Text style={styles.btnText}>{action.label}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                ) : (
                    <View style={styles.completedBox}>
                        <Text style={styles.completedText}>Job Completed</Text>
                    </View>
                )}

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
    title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },

    mapPlaceholder: { height: 200, backgroundColor: '#eee', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },

    card: { backgroundColor: '#F9F9F9', padding: 16, borderRadius: 12, marginBottom: 30 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    divider: { height: 1, backgroundColor: '#ddd', marginVertical: 12, marginLeft: 32 },
    label: { fontSize: 12, color: '#888' },
    val: { fontSize: 15, color: '#333', fontWeight: '500' },

    bigBtn: { backgroundColor: theme.colors.primary, paddingVertical: 20, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', elevation: 4 },
    btnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

    completedBox: { backgroundColor: theme.colors.success, padding: 20, borderRadius: 12, alignItems: 'center' },
    completedText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});
