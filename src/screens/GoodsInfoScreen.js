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
            source={{uri:'data:image/jpeg;base64,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'}} // replace with your asset
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
