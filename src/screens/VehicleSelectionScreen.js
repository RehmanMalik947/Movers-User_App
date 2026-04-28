import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setVehicle } from '../redux/slices/locationSlice';
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

export default function VehicleScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

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
      setSelectedMainCatId(item.id);
      setSubCatsToShow(item.subCategories);
      setOpenModal(true);
      setSelectedSubCatId(null);
    } else {
      setSelectedMainCatId(item.id);
      setSelectedSubCatId(null);
    }
  };

  // ******** FINAL SELECTED VEHICLE ********
  const finalSelectedVehicle = (() => {
    if (selectedSubCatId) {
      return subCatsToShow.find((s) => s.id === selectedSubCatId);
    } else if (selectedMainCatId) {
      const mainVehicle = vehicles.find((v) => v.id === selectedMainCatId);
      if (!mainVehicle.subCategories) return mainVehicle;
    }
    return null;
  })();

  navigation.setOptions({
    headerShown: true,
    title: 'Select Vehicle',
    headerStyle: { backgroundColor: C.surface },
    headerTintColor: C.textHead,
    headerTitleStyle: { fontWeight: '800' },
  });

  const renderVehicleCard = ({ item }) => {
    const isSelected =
      (!item.subCategories && selectedMainCatId === item.id) ||
      (item.subCategories &&
        selectedMainCatId === item.id &&
        selectedSubCatId !== null);

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => openSubCategoryModal(item)}
        activeOpacity={0.7}
      >
        <View style={styles.imgContainer}>
          <Image source={item.image} style={styles.img} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.name}</Text>
          {item.capacity && <Text style={styles.subTxt}>Capacity: {item.capacity}</Text>}
          {item.dimension && <Text style={styles.subTxt}>Dimensions: {item.dimension}</Text>}
        </View>

        {item.subCategories ? (
          <Icon name="chevron-forward" size={20} color={C.textMuted} />
        ) : (
          isSelected && <Icon name="checkmark-circle" size={24} color={C.primaryStandard} />
        )}
      </TouchableOpacity>
    );
  };

  const renderSubCategoryCard = ({ item }) => {
    const isSelected = selectedSubCatId === item.id;

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => {
          setSelectedSubCatId(item.id);
          setOpenModal(false);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.imgContainer}>
          <Image source={item.image} style={styles.img} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subTxt}>Capacity: {item.capacity}</Text>
          <Text style={styles.subTxt}>Dimensions: {item.dimension}</Text>
        </View>

        {isSelected && <Icon name="checkmark-circle" size={24} color={C.primaryStandard} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={vehicles}
        renderItem={renderVehicleCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        isVisible={openModal}
        onBackdropPress={() => setOpenModal(false)}
        style={{ margin: 0, justifyContent: 'flex-end' }}
        backdropOpacity={0.5}
      >
        <View style={styles.modalBox}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Select Sub Category</Text>

          <FlatList
            data={subCatsToShow}
            renderItem={renderSubCategoryCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        </View>
      </Modal>

      {finalSelectedVehicle && (
        <View style={styles.bottomBar}>
          <View style={styles.qtyBox}>
            <TouchableOpacity
              onPress={() => vehicleCount > 1 && setVehicleCount(vehicleCount - 1)}
              style={styles.qtyBtn}
            >
              <Icon name="remove" size={20} color={C.textHead} />
            </TouchableOpacity>

            <Text style={styles.qtyNumber}>{vehicleCount}</Text>

            <TouchableOpacity
              onPress={() => setVehicleCount(vehicleCount + 1)}
              style={styles.qtyBtn}
            >
              <Icon name="add" size={20} color={C.textHead} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              dispatch(setVehicle(finalSelectedVehicle));
              navigation.navigate('goodinfo');
            }}
            style={styles.nextBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.nextTxt}>Continue</Text>
            <Icon name="arrow-forward" size={18} color={C.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  card: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cardSelected: {
    borderColor: C.primaryStandard,
    backgroundColor: C.primaryLight,
  },

  imgContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  img: { width: 45, height: 45, resizeMode: 'contain' },

  title: { fontSize: 17, fontWeight: '700', color: C.textHead },

  subTxt: { fontSize: 13, color: C.textMuted, marginTop: 4 },

  modalBox: {
    backgroundColor: C.surface,
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: C.divider,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20, textAlign: 'center', color: C.textHead },

  bottomBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: C.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: C.divider,
  },

  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
  },

  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  qtyNumber: { fontSize: 18, fontWeight: '700', marginHorizontal: 16, color: C.textHead },

  nextBtn: {
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 18,
    gap: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  nextTxt: { fontSize: 16, fontWeight: '700', color: C.white },
});

