import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../api/mockService';
import { theme } from '../../theme/theme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function DriverDashboard() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const data = await mockApi.getDriverJobs(user.id);
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
        const isActive = item.status !== 'COMPLETED';
        return (
            <TouchableOpacity
                style={[styles.jobCard, isActive && styles.activeCard]}
                onPress={() => navigation.navigate('ActiveJob', { jobId: item.id })}
                disabled={!isActive}
            >
                <View style={[styles.statusBadge, { backgroundColor: isActive ? theme.colors.primary : '#999' }]}>
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

                {isActive && (
                    <View style={styles.footer}>
                        <Text style={styles.actionText}>Tap to Update Status →</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Hello, Captain {user?.name}</Text>
                    <Text style={styles.subText}>Ready to move?</Text>
                </View>
                <View style={styles.avatar}>
                    <Icon name="local-shipping" size={24} color="#fff" />
                </View>
            </View>

            <Text style={styles.sectionTitle}>My Assignments</Text>

            <FlatList
                data={jobs}
                keyExtractor={item => item.id}
                renderItem={renderJobItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadJobs} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No jobs assigned yet.</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    welcomeText: { fontSize: 22, fontWeight: '700', color: '#333' },
    subText: { fontSize: 14, color: '#777' },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.secondary, justifyContent: 'center', alignItems: 'center' },

    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#333' },

    jobCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1 },
    activeCard: { borderColor: theme.colors.primary, borderWidth: 1, elevation: 3 },

    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 8 },
    statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    jobTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
    jobDate: { fontSize: 12, color: '#888', marginBottom: 12 },

    routeContainer: { marginBottom: 12 },
    routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    routeText: { fontSize: 14, color: '#555' },
    verticalLine: { height: 16, borderLeftWidth: 1, borderLeftColor: '#ddd', marginLeft: 7.5, marginVertical: 2 },

    footer: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8, alignItems: 'flex-end' },
    actionText: { fontSize: 13, color: theme.colors.primary, fontWeight: '700' },

    emptyText: { textAlign: 'center', color: '#999', marginTop: 40 }
});
