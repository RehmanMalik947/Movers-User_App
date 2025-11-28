import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';

export default function GoodsInfoScreen() {
  const [selectedGoodsType, setSelectedGoodsType] = useState(null); // 'home' or 'office'
  const [fragileGoods, setFragileGoods] = useState(false);
  const navigation = useNavigation();


  navigation.setOptions({
    headerShown: true,
    title: 'Goods Info',
    headerStyle: {
      backgroundColor: '#DAAE58',
    },
    headerTitleStyle: {
      color: '#000', // optional (title color)
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* <Text style={styles.title}>Select Goods Type</Text> */}

      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={[
            styles.card,
            selectedGoodsType === 'home' && styles.cardSelected,
          ]}
          onPress={() => setSelectedGoodsType('home')}
        >
          <Image
            source={require('../assets/home.png')} // replace with your asset
            style={styles.cardImage}
          />
          <Text style={styles.cardText}>Home Shifting</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.card,
            selectedGoodsType === 'office' && styles.cardSelected,
          ]}
          onPress={() => setSelectedGoodsType('office')}
        >
          <Image
            source={require('../assets/office.png')} // replace with your asset
            style={styles.cardImage}
          />
          <Text style={styles.cardText}>Office Shifting</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fragileContainer}>
        <Text style={styles.fragileText}>Fragile Goods</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              fragileGoods && styles.toggleInactive,
            ]}
            onPress={() => setFragileGoods(true)}
          >
            <Text
              style={[
                styles.toggleText,
                fragileGoods ? styles.toggleInactiveText : styles.toggleActiveText,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              !fragileGoods && styles.toggleInactive,
            ]}
            onPress={() => setFragileGoods(false)}
          >
            <Text
              style={[
                styles.toggleText,
                !fragileGoods ? styles.toggleInactiveText : styles.toggleActiveText,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={()=>{navigation.navigate('placeOrder')}} style={styles.nextBtn}>
        <Text style={styles.nextBtnText}>Next</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F4F4F4',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardSelected: {
    borderColor: '#DAAE58',
    borderWidth: 2,
    backgroundColor: '#FFF6DD',
  },
  cardImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fragileContainer: {
    marginBottom: 30,
  },
  fragileText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEE',
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#DAAE58',
  },
  toggleInactive: {
    backgroundColor: '#fff',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleActiveText: {
    color: '#000',
  },
  toggleInactiveText: {
    color: '#555',
  },
  nextBtn: {
    backgroundColor: '#DAAE58',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 'auto',
  },
  nextBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
});
