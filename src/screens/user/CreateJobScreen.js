import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { jobApi } from '../../api/apiService';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { resetLocations } from '../../redux/slices/locationSlice';

const { width } = Dimensions.get('window');

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

export default function CreateJobScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { pickup, dropoff } = useSelector(state => state.location);

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [goodsType, setGoodsType] = useState('');
    const [categoryId, setCategoryId] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        let cancelled = false;
        jobApi.getCategories().then((data) => {
            const list = Array.isArray(data) ? data : (data?.data ?? []);
            if (!cancelled) setCategories(list);
        }).catch(() => { if (!cancelled) setCategories([]); });
        return () => { cancelled = true; };
    }, []);

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const vehicleType = selectedCategory?.name || (categories[0]?.name) || '';

    const handlePostJob = async () => {
        if (!title || !pickup.address || !dropoff.address || !goodsType) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }
        if (categories.length > 0 && !categoryId) {
            Alert.alert("Missing Fields", "Please select a truck type.");
            return;
        }

        setLoading(true);
        try {
            await jobApi.create({
                userId: String(user.id),
                userName: user.name || 'Customer',
                title,
                pickup: pickup.address,
                dropoff: dropoff.address,
                pickupLocation: pickup.address,
                deliveryLocation: dropoff.address,
                goodsType,
                vehicleType: selectedCategory?.name || vehicleType,
                categoryId: categoryId != null ? categoryId : undefined,
                date: date || new Date().toISOString().split('T')[0],
                fare: 0,
                distance: 0,
            });
            Alert.alert("Success", "Job Posted Successfully!");
            dispatch(resetLocations());
            navigation.navigate('HomeMain');
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to post job");
        } finally {
            setLoading(false);
        }
    };

    const LocationButton = ({ label, value, onPress, icon, color }) => (
        <TouchableOpacity style={styles.locBtn} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <Icon name={icon} size={20} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.locLabel}>{label}</Text>
                <Text style={[styles.locValue, !value && { color: C.textMuted }]} numberOfLines={1}>
                    {value || "Tap to select location"}
                </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={C.border} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color={C.textHead} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Post a Job</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={styles.sectionHeader}>Shipment Summary</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. Moving 2BHK furniture"
                        placeholderTextColor={C.textMuted}
                    />

                    <Text style={styles.sectionHeader}>Route Information</Text>
                    <View style={styles.routeCard}>
                        <LocationButton
                            label="Pickup Location"
                            value={pickup.address}
                            icon="location"
                            color={C.success}
                            onPress={() => navigation.navigate('Pickup')}
                        />
                        <View style={styles.divider} />
                        <LocationButton
                            label="Drop-off Location"
                            value={dropoff.address}
                            icon="flag"
                            color={C.error}
                            onPress={() => navigation.navigate('Dropoff')}
                        />
                    </View>

                    <Text style={styles.sectionHeader}>Cargo Details</Text>
                    <TextInput
                        style={styles.input}
                        value={goodsType}
                        onChangeText={setGoodsType}
                        placeholder="e.g. Household goods, Office equipment"
                        placeholderTextColor={C.textMuted}
                    />

                    <Text style={styles.sectionHeader}>Vehicle Requirements</Text>
                    {categories.length === 0 ? (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator size="small" color={C.primaryStandard} />
                            <Text style={styles.hint}>Fetching vehicle types...</Text>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity 
                                style={[styles.dropdown, categoryId && styles.dropdownSelected]} 
                                onPress={() => setShowCategoryPicker(true)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.dropdownInfo}>
                                    <Icon name="car-outline" size={20} color={categoryId ? C.primaryStandard : C.textMuted} />
                                    <Text style={[styles.dropdownText, !categoryId && styles.dropdownPlaceholder]}>
                                        {selectedCategory ? selectedCategory.name : 'Choose required truck'}
                                    </Text>
                                </View>
                                <Icon name="chevron-down" size={20} color={C.textMuted} />
                            </TouchableOpacity>

                            <Modal visible={showCategoryPicker} transparent animationType="slide">
                                <View style={styles.pickerOverlay}>
                                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowCategoryPicker(false)} />
                                    <View style={styles.pickerBox}>
                                        <View style={styles.modalHandle} />
                                        <Text style={styles.pickerTitle}>Select Vehicle Type</Text>
                                        <ScrollView>
                                            {categories.map((c) => (
                                                <TouchableOpacity
                                                    key={c.id}
                                                    style={[styles.pickerItem, categoryId === c.id && styles.pickerItemSelected]}
                                                    onPress={() => { setCategoryId(c.id); setShowCategoryPicker(false); }}
                                                >
                                                    <Text style={[styles.pickerItemText, categoryId === c.id && styles.pickerItemTextSelected]}>{c.name}</Text>
                                                    {categoryId === c.id && <Icon name="checkmark-circle" size={20} color={C.primaryStandard} />}
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </View>
                            </Modal>
                        </>
                    )}

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                        onPress={handlePostJob}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={C.white} />
                        ) : (
                            <>
                                <Text style={styles.btnText}>Submit Request</Text>
                                <Icon name="send" size={18} color={C.white} />
                            </>
                        )}
                    </TouchableOpacity>
                    <View style={{ height: 40 }} />
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16, 
        backgroundColor: C.surface,
        borderBottomWidth: 1,
        borderBottomColor: C.border
    },
    backBtn: { 
        width: 40, 
        height: 40, 
        borderRadius: 12, 
        backgroundColor: C.bg, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: C.textHead, letterSpacing: -0.5 },

    scroll: { padding: 24, paddingBottom: 100 },
    sectionHeader: { fontSize: 14, fontWeight: '800', color: C.textHead, textTransform: 'uppercase', letterSpacing: 1, marginTop: 24, marginBottom: 12 },

    input: { 
        backgroundColor: C.surface, 
        borderRadius: 16, 
        padding: 16, 
        color: C.textHead, 
        fontSize: 16, 
        fontWeight: '600',
        borderWidth: 1,
        borderColor: C.border
    },

    routeCard: { 
        backgroundColor: C.surface, 
        borderRadius: 20, 
        padding: 8, 
        borderWidth: 1,
        borderColor: C.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2
    },
    locBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    locLabel: { fontSize: 11, color: C.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    locValue: { fontSize: 15, color: C.textHead, fontWeight: '700', marginTop: 2 },
    divider: { height: 1, backgroundColor: C.divider, marginLeft: 64 },

    loadingBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
    hint: { fontSize: 14, color: C.textMuted, fontWeight: '500' },
    
    dropdown: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: 16, 
        backgroundColor: C.surface, 
        borderRadius: 16, 
        borderWidth: 1, 
        borderColor: C.border 
    },
    dropdownSelected: {
        borderColor: C.primaryStandard,
        backgroundColor: C.primaryLight
    },
    dropdownInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dropdownText: { fontSize: 16, color: C.textHead, fontWeight: '600' },
    dropdownPlaceholder: { color: C.textMuted, fontWeight: '500' },
    
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
    pickerBox: { 
        backgroundColor: C.surface, 
        borderTopLeftRadius: 32, 
        borderTopRightRadius: 32, 
        padding: 24, 
        maxHeight: 450,
        paddingBottom: 40
    },
    modalHandle: { width: 40, height: 5, backgroundColor: C.divider, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
    pickerTitle: { fontSize: 20, fontWeight: '800', color: C.textHead, marginBottom: 20, textAlign: 'center' },
    pickerItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: 18, 
        borderRadius: 16,
        marginBottom: 8,
        backgroundColor: C.bg
    },
    pickerItemSelected: { backgroundColor: C.primaryLight, borderWidth: 1, borderColor: C.primaryStandard },
    pickerItemText: { fontSize: 16, color: C.textBody, fontWeight: '600' },
    pickerItemTextSelected: { color: C.primaryStandard, fontWeight: '700' },

    submitBtn: { 
        marginTop: 40, 
        backgroundColor: C.primary, 
        paddingVertical: 18, 
        borderRadius: 20, 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 12,
        shadowColor: C.primary, 
        shadowOpacity: 0.3, 
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 12,
        elevation: 8
    },
    btnText: { color: C.white, fontSize: 18, fontWeight: '800' }
});
