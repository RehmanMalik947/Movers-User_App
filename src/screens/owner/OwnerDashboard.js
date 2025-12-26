import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../api/mockService';
import { theme } from '../../theme/theme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function OwnerDashboard() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const data = await mockApi.getAvailableJobs();
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
        return (
            <TouchableOpacity
                style={styles.jobCard}
                onPress={() => navigation.navigate('BidOnJob', { jobId: item.id })}
            >
                <View style={styles.headerRow}>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.goodsType}</Text>
                    </View>
                </View>

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
                    <View style={styles.infoRow}>
                        <Icon name="local-shipping" size={16} color="#666" />
                        <Text style={styles.infoText}>{item.vehicleType}</Text>
                    </View>
                    <Text style={styles.actionText}>Tap to Bid →</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
                    <Text style={styles.subText}>Find loads for your fleet</Text>
                </View>
                <Image source={require('../../assets/heavyTruck.png')} style={{ width: 40, height: 40 }} />
            </View>

            <Text style={styles.sectionTitle}>Available Markets</Text>

            <FlatList
                data={jobs}
                keyExtractor={item => item.id}
                renderItem={renderJobItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadJobs} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No available jobs at the moment.</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    welcomeText: { fontSize: 22, fontWeight: '700', color: '#333' },
    subText: { fontSize: 14, color: '#777' },

    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: '#333' },

    jobCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
    headerRow: { flexDirection: 'row', justifyConent: 'space-between', alignItems: 'flex-start', flex: 1 },
    jobTitle: { fontSize: 16, fontWeight: '700', color: '#333', flex: 1, marginRight: 8 },
    badge: { backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    badgeText: { fontSize: 11, color: theme.colors.secondary, fontWeight: 'bold' },
    jobDate: { fontSize: 12, color: '#888', marginBottom: 12, marginTop: 4 },

    routeContainer: { marginBottom: 12 },
    routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    routeText: { fontSize: 14, color: '#555' },
    verticalLine: { height: 16, borderLeftWidth: 1, borderLeftColor: '#ddd', marginLeft: 7.5, marginVertical: 2 },

    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoText: { fontSize: 13, color: '#666' },
    actionText: { fontSize: 13, color: theme.colors.primary, fontWeight: '700' },

    emptyText: { textAlign: 'center', color: '#999', marginTop: 40 }
});
