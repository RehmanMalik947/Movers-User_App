import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { jobApi } from '../api/apiService';
import { useAuth } from '../context/AuthContext';

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
};

const PlaceOrderScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real data from Redux
  const pickupLocation = useSelector(state => state.location.pickupLocation);
  const dropoffLocation = useSelector(state => state.location.dropoffLocation);

  // These should ideally come from Redux or navigation params
  const vehicle = 'Shehzore';
  const goodsType = 'Furniture';

  navigation.setOptions({
    headerShown: true,
    title: 'Review Order',
    headerStyle: { backgroundColor: C.surface },
    headerTintColor: C.textHead,
    headerTitleStyle: { fontWeight: '800' },
  });

  const handlePlaceOrder = async () => {
    if (!pickupLocation || !dropoffLocation) {
      Alert.alert('Error', 'Missing location information');
      return;
    }

    setIsSubmitting(true);
    try {
      const jobData = {
        userId: user?.id,
        title: `${goodsType} from ${pickupLocation.address.split(',')[0]} to ${dropoffLocation.address.split(',')[0]}`,
        pickup: pickupLocation.address,
        dropoff: dropoffLocation.address,
        goodsType: goodsType,
        vehicleType: vehicle,
        date: new Date().toISOString(),
      };

      await jobApi.create(jobData);

      Alert.alert(
        'Success',
        'Your job has been posted successfully! Drivers will start bidding soon.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      Alert.alert('Order Failed', error.message || 'Could not place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const InfoRow = ({ label, value, onEdit, icon }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBg}>
        <Icon name={icon} size={18} color={C.primaryStandard} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={2}>{value || 'Not Set'}</Text>
      </View>
      {onEdit && (
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Icon name="pencil" size={16} color={C.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Shipment Details</Text>
        
        <View style={styles.card}>
          <InfoRow 
            label="Pickup Address" 
            value={pickupLocation?.address} 
            icon="location"
            onEdit={() => navigation.navigate('SetPickup')}
          />
          <View style={styles.connectorLine} />
          <InfoRow 
            label="Delivery Address" 
            value={dropoffLocation?.address} 
            icon="flag"
            onEdit={() => navigation.navigate('DropoffLocation')}
          />
        </View>

        <View style={styles.card}>
          <InfoRow 
            label="Selected Vehicle" 
            value={vehicle} 
            icon="car-sport"
            onEdit={() => navigation.navigate('vehicleSelection')}
          />
          <View style={styles.divider} />
          <InfoRow 
            label="Goods Category" 
            value={goodsType} 
            icon="cube"
            onEdit={() => navigation.navigate('goodinfo')}
          />
        </View>

        <View style={styles.fareCard}>
          <View style={styles.fareHeader}>
            <Icon name="calculator" size={20} color={C.primaryStandard} />
            <Text style={styles.fareTitle}>Estimated Fare</Text>
          </View>
          <Text style={styles.fareAmount}>PKR 4,500 - 5,500</Text>
          <View style={styles.fareNoteBox}>
            <Icon name="information-circle" size={14} color={C.textMuted} />
            <Text style={styles.note}>
              Final rates will be provided by drivers via bidding.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, isSubmitting && { opacity: 0.7 }]}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color={C.white} />
          ) : (
            <>
              <Text style={styles.confirmBtnText}>Post Job Request</Text>
              <Icon name="send" size={18} color={C.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.textHead,
    marginBottom: 20,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textHead,
    marginTop: 2,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectorLine: {
    width: 2,
    height: 20,
    backgroundColor: C.divider,
    marginLeft: 19,
    marginVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginVertical: 16,
  },
  fareCard: {
    backgroundColor: C.primary,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  fareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  fareTitle: {
    fontWeight: '700',
    color: C.white,
    fontSize: 13,
  },
  fareAmount: {
    fontWeight: '900',
    fontSize: 24,
    color: C.white,
    marginBottom: 12,
  },
  fareNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.8,
  },
  note: {
    fontSize: 11,
    color: C.white,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
  confirmBtn: {
    backgroundColor: C.primaryStandard,
    flexDirection: 'row',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: C.primaryStandard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmBtnText: {
    color: C.white,
    fontWeight: '800',
    fontSize: 16,
  },
});

export default PlaceOrderScreen;
