import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PlaceOrderScreen = () => {
  const [vehicle, setVehicle] = useState('SM');
  const [pickupLocation, setPickupLocation] = useState('Mall 1, Gulberg, Lahore');
  const [dropLocation, setDropLocation] = useState('');
  const [pickupDateTime, setPickupDateTime] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  const itemOptions = ['Food', 'Documents', 'Clothing', 'Car', 'Digital Product', 'Glass'];

  const toggleItem = (item) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place Order</Text>
      </View>

      {/* Vehicle Selection */}
      <View style={{ marginBottom: 12 , paddingTop:22 , borderRadius:18 , backgroundColor:'#FDF1D9'}}>
              <View style={styles.vehicleContainer}>
        {['SM', 'MT', 'LT', 'HT'].map(v => (
          <TouchableOpacity
            key={v}
            style={[
              styles.vehicleButton,
              vehicle === v && styles.vehicleButtonSelected
            ]}
            onPress={() => setVehicle(v)}
          >
            <Text style={vehicle === v ? styles.vehicleTextSelected : styles.vehicleText}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>
      </View>

      {/* Location */}
      <View style={styles.locationContainer}>
        <Text style={styles.label}>Add location</Text>
        <TouchableOpacity style={styles.locationBox}>
          <Text>{pickupLocation || 'Enter pickup location'}</Text>
          <Icon name="plus-circle-outline" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.locationBox}>
          <Text>{dropLocation || 'Drop off location'}</Text>
          <Icon name="plus-circle-outline" size={24} color="#aaa" />
        </TouchableOpacity>
      </View>

      {/* Pickup Date & Time */}
      <View style={styles.pickupContainer}>
        <Text style={styles.label}>Pickup</Text>
        <TouchableOpacity style={styles.pickupBox}>
          <Text>{pickupDateTime || 'Enter Pickup Date and Time'}</Text>
        </TouchableOpacity>
      </View>

      {/* Item Description */}
      <View style={styles.itemsContainer}>
        <Text style={styles.label}>Item Description</Text>
        <View style={styles.chipsRow}>
          {itemOptions.map(item => (
            <Chip
              key={item}
              mode={selectedItems.includes(item) ? 'flat' : 'outlined'}
              selected={selectedItems.includes(item)}
              onPress={() => toggleItem(item)}
              style={styles.chip}
            >
              {item}
            </Chip>
          ))}
        </View>
      </View>

      {/* Estimated Fare */}
      <View style={styles.fareContainer}>
        <Text style={styles.fareText}>Estimated Fare</Text>
        <Text style={styles.fareAmount}>RS 600</Text>
      </View>

      {/* Next Button */}
      <Button mode="contained" style={styles.nextButton}>
        Next
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff', // same as home screen
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#2A2A2A', // match home screen text dark
  },
  vehicleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  vehicleButton: {
    padding: 10,
    borderRadius: 18, // more rounded like home
    borderWidth: 1,
    borderColor: '#F0E8D6', // home screen card border
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#FDF1D9', // light cream background
  },
  vehicleButtonSelected: {
    backgroundColor: '#DAAE58', // gold/honey active
    borderColor: '#DAAE58',
  },
  vehicleText: {
    color: '#2A2A2A',
    fontWeight: '600',
  },
  vehicleTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  locationContainer: {
    marginBottom: 24,
  },
  label: {
    fontWeight: '700',
    marginBottom: 8,
    color: '#2A2A2A',
  },
  locationBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0E8D6',
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: '#FDF1D9', // light cream like home screen cards
  },
  pickupContainer: {
    marginBottom: 24,
  },
  pickupBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#DAAE58',
    borderRadius: 18,
    backgroundColor: '#FDF1D9',
  },
  itemsContainer: {
    marginBottom: 24,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    borderColor: '#F0E8D6',
  },
  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FDF1D9', // match home screen card style
    borderRadius: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0E8D6',
  },
  fareText: {
    fontWeight: '700',
    color: '#2A2A2A',
  },
  fareAmount: {
    fontWeight: '700',
    color: '#2A2A2A',
  },
  nextButton: {
    padding: 8,
    borderRadius: 18,
    backgroundColor: '#DAAE58', // gold like home screen arrow button
  },
});


export default PlaceOrderScreen;
