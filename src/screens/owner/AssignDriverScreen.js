import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { mockApi } from '../../api/mockService';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function AssignDriverScreen() {
    const { user } = useAuth();
    const route = useRoute();
    const navigation = useNavigation();
    const { jobId } = route.params;

    const [drivers, setDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = async () => {
        // Mock API: getMyDrivers(ownerId)
        // I define this in mockService but I need to ensure it's there. 
        // Logic: drivers where user.ownerId === me.
        const data = await mockApi.getMyDrivers(user.id);
        setDrivers(data);
    };

    const handleAssign = async () => {
        if (!selectedDriver) {
            Alert.alert("Select Driver", "Please select a driver first.");
            return;
        }

        setLoading(true);
        try {
            await mockApi.assignDriver(jobId, selectedDriver.id);
            Alert.alert("Success", "Driver Assigned!");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Assign Driver</Text>
            </View>

            <Text style={styles.sub}>Select a driver for this job:</Text>

            <FlatList
                data={drivers}
                style={{ flex: 1 }}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.driverCard, selectedDriver?.id === item.id && styles.selected]}
                        onPress={() => setSelectedDriver(item)}
                    >
                        <View style={styles.avatar}>
                            <Icon name="person" size={24} color="#fff" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.vehicle}>{item.vehicle || 'No Vehicle'}</Text>
                        </View>
                        {selectedDriver?.id === item.id && <Icon name="check-circle" size={24} color={theme.colors.secondary} />}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No drivers found.</Text>}
            />

            <TouchableOpacity
                style={[styles.btn, !selectedDriver && styles.disabled]}
                disabled={!selectedDriver || loading}
                onPress={handleAssign}
            >
                <Text style={styles.btnText}>Confirm Assignment</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    title: { fontSize: 18, fontWeight: '700', marginLeft: 16, color: '#333' },
    sub: { padding: 16, color: '#666' },
    driverCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    selected: { backgroundColor: '#FFF8E1' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    name: { fontSize: 16, fontWeight: '600', color: '#333' },
    vehicle: { fontSize: 12, color: '#888' },
    btn: { margin: 20, backgroundColor: theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
    disabled: { backgroundColor: '#ccc' },
    btnText: { color: '#fff', fontWeight: 'bold' }
});
