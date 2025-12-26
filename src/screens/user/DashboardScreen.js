import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../api/mockService';
import { theme } from '../../theme/theme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function UserDashboard() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const data = await mockApi.getUserJobs(user.id);
            setJobs(data);
        } catch (error) {
            console.error(error);
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
        let statusColor = '#999';
        if (item.status === 'BIDDING') statusColor = theme.colors.secondary;
        if (item.status === 'ACCEPTED') statusColor = theme.colors.success;
        if (item.status === 'ASSIGNED') statusColor = theme.colors.primary;

        return (
            <TouchableOpacity
                style={styles.jobCard}
                onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
            >
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>

                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.jobDate}>{new Date(item.date).toDateString()}</Text>

                <View style={styles.routeContainer}>
                    <View style={styles.routeRow}>
                        <Icon name="my-location" size={16} color="#4CAF50" />
                        <Text style={styles.routeText}>{item.pickup}</Text>
                    </View>
                    <View style={styles.verticalLine} />
                    <View style={styles.routeRow}>
                        <Icon name="location-on" size={16} color="#F44336" />
                        <Text style={styles.routeText}>{item.dropoff}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.infoBadge}>
                        <Text style={styles.infoText}>{item.vehicleType}</Text>
                    </View>
                    {item.status === 'BIDDING' && (
                        <Text style={styles.bidsText}>{item.bids.length} Bids Received</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Hello, {user?.name}</Text>
                    <Text style={styles.subText}>Where do you want to move?</Text>
                </View>
                <Image source={require('../../assets/heavyTruck.png')} style={{ width: 40, height: 40 }} />
            </View>

            <View style={styles.actionCard}>
                <Text style={styles.actionTitle}>Book a Truck</Text>
                <Text style={styles.actionSub}>Post a job and get bids from drivers</Text>
                <TouchableOpacity
                    style={styles.bookBtn}
                    onPress={() => navigation.navigate('CreateJob')}
                >
                    <Text style={styles.bookBtnText}>Post New Job</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>My Active Jobs</Text>

            <FlatList
                data={jobs}
                keyExtractor={item => item.id}
                renderItem={renderJobItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadJobs} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No active jobs found.</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    welcomeText: { fontSize: 22, fontWeight: '700', color: '#333' },
    subText: { fontSize: 14, color: '#777' },

    actionCard: { backgroundColor: theme.colors.primary, padding: 20, borderRadius: 16, marginBottom: 24, elevation: 4 },
    actionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    actionSub: { color: '#ccc', fontSize: 13, marginBottom: 16 },
    bookBtn: { backgroundColor: theme.colors.secondary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignSelf: 'flex-start' },
    bookBtnText: { color: '#fff', fontWeight: 'bold' },

    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#333' },

    jobCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 8 },
    statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    jobTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
    jobDate: { fontSize: 12, color: '#888', marginBottom: 12 },

    routeContainer: { marginBottom: 12 },
    routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    routeText: { fontSize: 14, color: '#555' },
    verticalLine: { height: 16, borderLeftWidth: 1, borderLeftColor: '#ddd', marginLeft: 7.5, marginVertical: 2 },

    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8 },
    infoBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    infoText: { fontSize: 12, color: '#1976D2' },
    bidsText: { fontSize: 12, color: theme.colors.secondary, fontWeight: '600' },

    emptyText: { textAlign: 'center', color: '#999', marginTop: 40 }
});
