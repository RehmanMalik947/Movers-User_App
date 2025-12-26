import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme/theme';
import { mockApi } from '../../api/mockService';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { resetLocations } from '../../redux/slices/locationSlice';

export default function CreateJobScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { pickup, dropoff } = useSelector(state => state.location);

    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [goodsType, setGoodsType] = useState('');
    const [vehicleType, setVehicleType] = useState('Shehzore');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handlePostJob = async () => {
        if (!title || !pickup.address || !dropoff.address || !goodsType) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            await mockApi.postJob({
                userId: user.id,
                title,
                pickup: pickup.address,
                dropoff: dropoff.address,
                pickupLat: pickup.latitude,
                pickupLng: pickup.longitude,
                dropoffLat: dropoff.latitude,
                dropoffLng: dropoff.longitude,
                goodsType,
                vehicleType,
                date,
            });
            Alert.alert("Success", "Job Posted Successfully!");
            dispatch(resetLocations());
            navigation.navigate('HomeMain'); // Go back to Dashboard
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const LocationButton = ({ label, value, onPress, icon, color }) => (
        <TouchableOpacity style={styles.locBtn} onPress={onPress}>
            <View style={[styles.iconBox, { backgroundColor: color }]}>
                <Icon name={icon} size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.locLabel}>{label}</Text>
                <Text style={[styles.locValue, !value && { color: '#ccc' }]} numberOfLines={1}>
                    {value || "Select Location"}
                </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Post a Job</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>

                <Text style={styles.sectionHeader}>Shipment Details</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="What are you moving? (e.g. Home Shifting)"
                    placeholderTextColor="#999"
                />

                <Text style={styles.sectionHeader}>Route</Text>
                <View style={styles.routeCard}>
                    <LocationButton
                        label="Pickup From"
                        value={pickup.address}
                        icon="my-location"
                        color="#4CAF50"
                        onPress={() => navigation.navigate('Pickup')}
                    />
                    <View style={styles.divider} />
                    <LocationButton
                        label="Dropoff To"
                        value={dropoff.address}
                        icon="location-on"
                        color="#F44336"
                        onPress={() => navigation.navigate('Dropoff')}
                    />
                </View>

                <Text style={styles.sectionHeader}>Cargo Info</Text>
                <TextInput
                    style={styles.input}
                    value={goodsType}
                    onChangeText={setGoodsType}
                    placeholder="Goods Type (e.g. Furniture, Electronics)"
                    placeholderTextColor="#999"
                />

                <Text style={styles.sectionHeader}>Required Vehicle</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {['Shehzore', 'Mazda', 'Suzuki Pickup', 'Trailor'].map(v => (
                        <TouchableOpacity
                            key={v}
                            style={[styles.chip, vehicleType === v && styles.chipActive]}
                            onPress={() => setVehicleType(v)}
                        >
                            <ImagePlaceholder />
                            <Text style={[styles.chipText, vehicleType === v && styles.chipTextActive]}>{v}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handlePostJob}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Post Job Now</Text>}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const ImagePlaceholder = () => (
    <View style={{ width: 40, height: 30, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 8, borderRadius: 4 }} />
)

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', elevation: 2 },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: '700', marginLeft: 16, color: '#333' },

    scroll: { padding: 20 },
    sectionHeader: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 20, marginBottom: 12 },

    input: { backgroundColor: '#fff', borderRadius: 12, padding: 16, color: '#333', fontSize: 16, elevation: 1 },

    routeCard: { backgroundColor: '#fff', borderRadius: 16, padding: 8, elevation: 2 },
    locBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    locLabel: { fontSize: 12, color: '#888', fontWeight: 'bold' },
    locValue: { fontSize: 15, color: '#333', fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 64 },

    chipScroll: { flexDirection: 'row', overflow: 'visible' },
    chip: { padding: 12, borderRadius: 12, backgroundColor: '#fff', marginRight: 12, width: 100, alignItems: 'center', borderWidth: 1, borderColor: 'transparent', elevation: 1 },
    chipActive: { borderColor: theme.colors.secondary, backgroundColor: '#FFF8E1' },
    chipText: { color: '#666', fontWeight: '600', fontSize: 12 },
    chipTextActive: { color: theme.colors.secondary, fontWeight: 'bold' },

    submitBtn: { marginTop: 40, backgroundColor: theme.colors.primary, padding: 18, borderRadius: 16, alignItems: 'center', elevation: 4, shadowColor: theme.colors.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 } },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 }
});
