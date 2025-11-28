import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';

export default function VehicleScreen() {
  const navigation = useNavigation();

  const [openModal, setOpenModal] = useState(false);

  // MAIN CATEGORY SELECTED
  const [selectedMainCatId, setSelectedMainCatId] = useState(null);

  // SUB CATEGORY SELECTED
  const [selectedSubCatId, setSelectedSubCatId] = useState(null);

  const [subCatsToShow, setSubCatsToShow] = useState([]);

  const [vehicleCount, setVehicleCount] = useState(1);

  const vehicles = [
    {
      id: 1,
      name: 'Suzuki',
      image: require('../assets/smallTruck.png'),
      capacity: '500 kg – 3 tons',
      dimension: '12 ft × 6 ft × 6 ft',
    },
    {
      id: 2,
      name: 'Shehzore',
      capacity: '1.0 tons – 2 tons',
      dimension: '20 / 40 Feet',
      image: require('../assets/pickup_truck.png'),
    },
    {
      id: 3,
      name: 'Mazda',
      image: require('../assets/mediumTruck.png'),
      subCategories: [
        {
          id: 11,
          name: 'Suzuki Mazda',
          capacity: '500 kg - 300 kg',
          dimension: '5 ft × 3 ft × 3 ft',
          image: require('../assets/mediumTruck.png'),
        },
        {
          id: 12,
          name: 'Suzuki Large',
          capacity: '600 kg - 1200 kg',
          dimension: '6 ft × 3.5 ft × 4 ft',
          image: require('../assets/mediumTruck.png'),
        },
      ],
    },
    {
      id: 4,
      name: 'Trailer',
      image: require('../assets/heavyTruck.png'),
      subCategories: [
        {
          id: 21,
          name: 'Trailer Normal',
          capacity: '5 ton - 9.5 tons',
          dimension: '8 ft × 5 ft × 5 ft',
          image: require('../assets/heavyTruck.png'),
        },
        {
          id: 22,
          name: 'Trailer XL',
          capacity: '12.5 tons - 15.0 tons',
          dimension: '9 ft × 5 ft × 5 ft',
          image: require('../assets/heavyTruck.png'),
        },
      ],
    },
  ];

  // ******** OPEN MAIN CATEGORY ********
  const openSubCategoryModal = (item) => {
    if (item.subCategories) {
      // Main category has subcategories
      setSelectedMainCatId(item.id);
      setSubCatsToShow(item.subCategories);
      setOpenModal(true);
      setSelectedSubCatId(null); // reset previous subcategory
    } else {
      // No subcategory → select main category immediately
      setSelectedMainCatId(item.id);
      setSelectedSubCatId(null);
    }
  };

  // ******** FINAL SELECTED VEHICLE ********
// ******** FINAL SELECTED VEHICLE ********
const finalSelectedVehicle = (() => {
  if (selectedSubCatId) {
    // subcategory selected
    return subCatsToShow.find((s) => s.id === selectedSubCatId);
  } else if (selectedMainCatId) {
    const mainVehicle = vehicles.find((v) => v.id === selectedMainCatId);
    // show bottom bar if it has no subcategory
    if (!mainVehicle.subCategories) return mainVehicle;
  }
  return null;
})();


  // ******** MAIN CATEGORY CARD ********
  const renderVehicleCard = ({ item }) => {
    // Highlight logic:
    // 1. If category has no subcategory → highlight immediately
    // 2. If category has subcategory → highlight only if subcategory is selected
    const isSelected =
      (!item.subCategories && selectedMainCatId === item.id) ||
      (item.subCategories &&
        selectedMainCatId === item.id &&
        selectedSubCatId !== null);

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => openSubCategoryModal(item)}
      >
        <Image source={item.image} style={styles.img} />

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.name}</Text>
          {item.capacity && <Text style={styles.subTxt}>Capacity: {item.capacity}</Text>}
          {item.dimension && <Text style={styles.subTxt}>Dimensions: {item.dimension}</Text>}
        </View>

        {item.subCategories && <Icon name="chevron-forward" size={22} color="#555" />}
      </TouchableOpacity>
    );
  };

  // ******** SUB CATEGORY CARD ********
  const renderSubCategoryCard = ({ item }) => {
    const isSelected = selectedSubCatId === item.id;

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => {
          setSelectedSubCatId(item.id); // select subcategory
          setOpenModal(false);
        }}
      >
        <Image source={item.image} style={styles.img} />

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subTxt}>Capacity: {item.capacity}</Text>
          <Text style={styles.subTxt}>Dimensions: {item.dimension}</Text>
        </View>

        {isSelected && <Icon name="checkmark-circle" size={26} color="#DAAE58" />}
      </TouchableOpacity>
    );
  };

  navigation.setOptions({
    headerShown: true,
    title: 'Select Vehicle',
    headerStyle: { backgroundColor: '#DAAE58' },
    headerTitleStyle: { color: '#000' },
  });

  return (
    <View style={styles.container}>
      {/* MAIN LIST */}
      <FlatList
        data={vehicles}
        renderItem={renderVehicleCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* SUB CATEGORY MODAL */}
      <Modal
        isVisible={openModal}
        onBackdropPress={() => setOpenModal(false)}
        style={{ margin: 0, justifyContent: 'flex-end' }}
      >
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Select Sub Category</Text>

          <FlatList
            data={subCatsToShow}
            renderItem={renderSubCategoryCard}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      </Modal>

      {/* BOTTOM BAR */}
      // ******** BOTTOM BAR ********
{finalSelectedVehicle && (
  <View style={styles.bottomBar}>
    {/* QUANTITY */}
    <View style={styles.qtyBox}>
      <TouchableOpacity
        onPress={() => vehicleCount > 1 && setVehicleCount(vehicleCount - 1)}
        style={styles.qtyBtn}
      >
        <Text style={styles.qtyBtnText}>−</Text>
      </TouchableOpacity>

      <Text style={styles.qtyNumber}>{vehicleCount}</Text>

      <TouchableOpacity
        onPress={() => setVehicleCount(vehicleCount + 1)}
        style={styles.qtyBtn}
      >
        <Text style={styles.qtyBtnText}>+</Text>
      </TouchableOpacity>
    </View>

    {/* NEXT BUTTON */}
    <TouchableOpacity onPress={()=>{navigation.navigate('goodinfo')}} style={styles.nextBtn}>
      <Text style={styles.nextTxt}>Next →</Text>
    </TouchableOpacity>
  </View>
)}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4', padding: 16 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
  },

  cardSelected: {
    backgroundColor: '#FFE7AC',
    borderWidth: 2,
    borderColor: '#DAAE58',
  },

  img: { width: 55, height: 55, marginRight: 12, resizeMode: 'contain' },

  title: { fontSize: 18, fontWeight: '700', color: '#000' },

  subTxt: { fontSize: 14, color: '#555', marginTop: 3 },

  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
  },

  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 15, textAlign: 'center' },

 bottomBar: {
  position: 'absolute',
  bottom: 16,
  left: 16,
  right: 16,
  backgroundColor: '#fff',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 5, // for android shadow
},

qtyBox: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F5F5F5',
  paddingVertical: 10,
  paddingHorizontal: 18,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#DDD',
},

qtyBtnText: { fontSize: 26, fontWeight: '700', color: '#333' },

qtyNumber: { fontSize: 20, fontWeight: '700', marginHorizontal: 14 },

nextBtn: {
  backgroundColor: '#DAAE58',
  paddingVertical: 14,
  paddingHorizontal: 28,
  borderRadius: 14,
  shadowColor: '#DAAE58',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 3,
},

nextTxt: { fontSize: 18, fontWeight: '700', color: '#000' },

});
