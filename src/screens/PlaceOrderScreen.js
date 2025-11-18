import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Button, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';

const PlaceOrderScreen = () => {
  const [vehicle, setVehicle] = useState('SM');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [pickupDateTime, setPickupDateTime] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingPickup, setSelectingPickup] = useState(true);

  const navigation = useNavigation();

  const itemOptions = ['Food', 'Documents', 'Clothing', 'Car', 'Digital Product', 'Glass'];
  const cityList = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Multan', 'Faisalabad', 'Peshawar'];

  const toggleItem = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const openModal = (isPickup) => {
    setSelectingPickup(isPickup);
    setModalVisible(true);
  };

  const selectCity = (city) => {
    if (selectingPickup) setPickupLocation(city);
    else setDropLocation(city);
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place Order</Text>
      </View>

      {/* Vehicle Selection */}
      <View style={{ marginBottom: 12, paddingTop: 22, borderRadius: 18, backgroundColor: '#FDF1D9' }}>
        <View style={styles.vehicleContainer}>
          {['SM', 'MT', 'LT', 'HT'].map(v => (
            <TouchableOpacity
              key={v}
              style={[styles.vehicleButton, vehicle === v && styles.vehicleButtonSelected]}
              onPress={() => setVehicle(v)}
            >
              <Text style={vehicle === v ? styles.vehicleTextSelected : styles.vehicleText}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Location */}
      {/* <View style={styles.locationContainer}>
        <Text style={styles.label}>Add location</Text>
        <TouchableOpacity style={styles.locationBox} onPress={() => openModal(true)}>
          <Text>{pickupLocation || 'Enter pickup location'}</Text>
          <Icon name="plus-circle-outline" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.locationBox} onPress={() => openModal(false)}>
          <Text>{dropLocation || 'Drop off location'}</Text>
          <Icon name="plus-circle-outline" size={24} color="#aaa" />
        </TouchableOpacity>
      </View> */}

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
      <Button mode="contained" onPress={()=>{navigation.navigate('setDate')}} style={styles.nextButton}>
        Next
      </Button>

      {/* City Selection Modal */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {selectingPickup ? 'Select Pickup City' : 'Select Drop-off City'}
          </Text>

          <FlatList
            data={cityList}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.cityItem} onPress={() => selectCity(item)}>
                <Text style={styles.cityText}>{item}</Text>
              </TouchableOpacity>
            )}
          />

          <Button onPress={() => setModalVisible(false)} mode="outlined" style={{ marginTop: 10 }}>
            Cancel
          </Button>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 16, color: '#2A2A2A' },
  vehicleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  vehicleButton: {
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DAAE58',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#DAAE58',
  },
  vehicleButtonSelected: { backgroundColor: '#DAAE58', borderColor: '#DAAE58' },
  vehicleText: { color: '#fff', fontWeight: '600' },
  vehicleTextSelected: { color: '#fff', fontWeight: '700' },
  locationContainer: { marginBottom: 24 },
  label: { fontWeight: '700', marginBottom: 8, color: '#2A2A2A' },
  locationBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0E8D6',
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: '#FDF1D9',
  },
  pickupContainer: { marginBottom: 24 },
  pickupBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#DAAE58',
    borderRadius: 18,
    backgroundColor: '#FDF1D9',
  },
  itemsContainer: { marginBottom: 24 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { marginRight: 8, marginBottom: 8, borderColor: '#F0E8D6' },
  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FDF1D9',
    borderRadius: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0E8D6',
  },
  fareText: { fontWeight: '700', color: '#2A2A2A' },
  fareAmount: { fontWeight: '700', color: '#2A2A2A' },
  nextButton: { padding: 8, borderRadius: 18, backgroundColor: '#DAAE58' },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#2A2A2A' },
  cityItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cityText: { fontSize: 16, color: '#333' },
});

export default PlaceOrderScreen;
