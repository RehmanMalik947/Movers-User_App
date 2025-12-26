import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const PlaceOrderScreen = () => {
  const navigation = useNavigation();

  // Dummy data (replace with Redux or props)
  const [pickupAddress, setPickupAddress] = useState('Savanti Road, Bhatti Compound, Karachi, Pakistan');
  const [deliveryAddress, setDeliveryAddress] = useState('Moulvi Tamizuddin Khan Road, Naval Officers Colony, Karachi');
  const [vehicle, setVehicle] = useState('Shehzore');
  const [goodsType, setGoodsType] = useState('Office Shifting');

  navigation.setOptions({
    headerShown: true,
    title: 'Order Summary',
    headerStyle: {
      backgroundColor: '#DAAE58',
    },
    headerTitleStyle: {
      color: '#000', // optional (title color)
    },
  });

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
   

      {/* Card Sections */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Point of Loading Info</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Point of Loading Address</Text>
            <Text style={styles.value}>{pickupAddress}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="pencil-outline" size={20} color="#DAAE58" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Point of Delivery Info</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Point of Delivery Address</Text>
            <Text style={styles.value}>{deliveryAddress}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="pencil-outline" size={20} color="#DAAE58" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vehicle & Goods Info</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Vehicle</Text>
            <Text style={styles.value}>{vehicle}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="pencil-outline" size={20} color="#DAAE58" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Goods Type</Text>
            <Text style={styles.value}>{goodsType}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="pencil-outline" size={20} color="#DAAE58" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
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
      <TouchableOpacity style={styles.nextButton} onPress={() => {Alert.alert('Next', 'Proceeding to the next step')}}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingVertical: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF1D9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', marginLeft: 16, color: '#2A2A2A' },
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
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
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
