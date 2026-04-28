import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ownerApi } from '../../api/apiService';

// ─── Design Tokens ───────────────────────────────────────────────────────────────
const C = {
  primary: '#1847B1',
  primaryStandard: '#2260D9',
  primaryLight: '#E8EFFD',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  textHead: '#0F172A',
  textBody: '#334155',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  success: '#10B981',
};

export default function AssignDriverScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { jobId } = route.params || {};

    const [drivers, setDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = async () => {
        try {
            const res = await ownerApi.getDrivers();
            const data = res?.data ?? res ?? [];
            setDrivers(Array.isArray(data) ? data : []);
        } catch (e) {
            setDrivers([]);
        }
    };

    const handleAssign = async () => {
        if (!selectedDriver) {
            Alert.alert("Select Driver", "Please select a driver first.");
            return;
        }
        if (!jobId) {
            Alert.alert("Error", "Job not found.");
            return;
        }

        setLoading(true);
        try {
            await ownerApi.assignDriver(jobId, selectedDriver.id);
            Alert.alert("Success", "Driver assigned to this job.");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to assign driver");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color={C.textHead} />
                </TouchableOpacity>
                <Text style={styles.title}>Assign Driver</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.subTitle}>Select a driver from your fleet</Text>

                <FlatList
                    data={drivers}
                    keyExtractor={item => String(item.id)}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.driverCard, selectedDriver?.id === item.id && styles.selected]}
                            onPress={() => setSelectedDriver(item)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.avatar, selectedDriver?.id === item.id ? { backgroundColor: C.primaryStandard } : { backgroundColor: C.primaryLight }]}>
                                <Text style={[styles.avatarText, selectedDriver?.id === item.id && { color: C.white }]}>
                                    {(item.name || 'D').charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text style={styles.phone}>{item.phone || 'No phone number'}</Text>
                            </View>
                            <View style={styles.radio}>
                                {selectedDriver?.id === item.id && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Icon name="people-outline" size={48} color={C.border} />
                            <Text style={styles.emptyText}>No drivers found in your fleet.</Text>
                        </View>
                    }
                />
            </View>

            <TouchableOpacity
                style={[styles.btn, (!selectedDriver || loading) && styles.disabled]}
                disabled={!selectedDriver || loading}
                onPress={handleAssign}
                activeOpacity={0.9}
            >
                {loading ? (
                    <ActivityIndicator color={C.white} />
                ) : (
                    <Text style={styles.btnText}>Confirm Assignment</Text>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 20,
        paddingVertical: 16, 
        backgroundColor: C.surface,
        borderBottomWidth: 1, 
        borderBottomColor: C.border 
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '800', color: C.textHead, letterSpacing: -0.5 },
    content: { flex: 1, paddingHorizontal: 20 },
    subTitle: { fontSize: 15, color: C.textMuted, marginTop: 24, marginBottom: 16, fontWeight: '500' },
    driverCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: C.surface, 
        borderRadius: 20, 
        padding: 16, 
        marginBottom: 12,
        borderWidth: 1,
        borderColor: C.border,
    },
    selected: { borderColor: C.primaryStandard, backgroundColor: C.primaryLight + '40' },
    avatar: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    avatarText: { fontSize: 18, fontWeight: '800', color: C.primaryStandard },
    name: { fontSize: 16, fontWeight: '700', color: C.textHead },
    phone: { fontSize: 13, color: C.textMuted, marginTop: 2 },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.primaryStandard },
    btn: { 
        margin: 20, 
        backgroundColor: C.primary, 
        padding: 18, 
        borderRadius: 18, 
        alignItems: 'center',
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    disabled: { opacity: 0.5 },
    btnText: { color: C.white, fontWeight: '800', fontSize: 16 },
    empty: { alignItems: 'center', marginTop: 80, gap: 12 },
    emptyText: { color: C.textMuted, fontSize: 15, fontWeight: '500' }
});
