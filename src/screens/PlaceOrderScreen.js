import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { jobApi } from '../api/apiService';
import { useAuth } from '../context/AuthContext';

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
    title: 'Order Summary',
    headerStyle: {
      backgroundColor: '#DAAE58',
    },
    headerTitleStyle: {
      color: '#000',
    },
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

  return (
    <ScrollView style={styles.container}>
      {/* Card Sections */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Point of Loading Info</Text>
        <div className="flex flex-row items-center mb-3">
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Point of Loading Address</Text>
            <Text style={styles.value}>{pickupLocation?.address || 'Not Set'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('SetPickup')}>
            <Icon name="pencil-outline" size={20} color="#DAAE58" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </div>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Point of Delivery Info</Text>
        <div className="flex flex-row items-center mb-3">
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Point of Delivery Address</Text>
            <Text style={styles.value}>{dropoffLocation?.address || 'Not Set'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('DropoffLocation')}>
            <Icon name="pencil-outline" size={20} color="#DAAE58" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </div>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vehicle & Goods Info</Text>
        <div className="flex flex-row items-center mb-3">
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Vehicle</Text>
            <Text style={styles.value}>{vehicle}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="pencil-outline" size={20} color="#DAAE58" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </div>
        <div className="flex flex-row items-center mb-3">
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Goods Type</Text>
            <Text style={styles.value}>{goodsType}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="pencil-outline" size={20} color="#DAAE58" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </div>
      </View>

      {/* Fare Section */}
      <View style={styles.fareCard}>
        <Text style={styles.fareText}>Estimated Freight Fare</Text>
        <Text style={styles.fareAmount}>PKR 4,500 - 5,500</Text>
        <Text style={styles.note}>
          Note: These are tentative rates. Please place the order to get the Final Rates.
        </Text>
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, isSubmitting && { opacity: 0.7 }]}
        onPress={handlePlaceOrder}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.nextButtonText}>Confirm and Place Order</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingVertical: 8 },
  card: {
    backgroundColor: '#FDF1D9',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0E8D6',
  },
  cardTitle: { fontWeight: '700', marginBottom: 12, color: '#2A2A2A' },
  label: { fontWeight: '600', color: '#2A2A2A' },
  value: { marginTop: 4, color: '#000' },
  editButton: { flexDirection: 'row', alignItems: 'center' },
  editText: { color: '#DAAE58', marginLeft: 4, fontWeight: '600' },
  fareCard: {
    backgroundColor: '#FDF1D9',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0E8D6',
  },
  fareText: { fontWeight: '700', color: '#2A2A2A', marginBottom: 4 },
  fareAmount: { fontWeight: '700', fontSize: 18, color: '#DAAE58', marginBottom: 4 },
  note: { fontSize: 12, color: '#555', textAlign: 'center' },
  nextButton: {
    backgroundColor: '#DAAE58',
    marginHorizontal: 16,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  nextButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default PlaceOrderScreen;
