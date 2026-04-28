import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setGoods } from '../redux/slices/locationSlice';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';

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

export default function GoodsInfoScreen() {
  const [selectedGoodsType, setSelectedGoodsType] = useState(null); // 'home' or 'office'
  const [fragileGoods, setFragileGoods] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleNext = () => {
    if (!selectedGoodsType) {
      alert('Please select a goods type');
      return;
    }
    dispatch(setGoods({ type: selectedGoodsType, fragile: fragileGoods }));
    navigation.navigate('placeOrder');
  };

  navigation.setOptions({
    headerShown: true,
    title: 'Goods Info',
    headerStyle: { backgroundColor: C.surface },
    headerTintColor: C.textHead,
    headerTitleStyle: { fontWeight: '800' },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>What are you moving?</Text>
        
        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={[
              styles.card,
              selectedGoodsType === 'home' && styles.cardSelected,
            ]}
            onPress={() => setSelectedGoodsType('home')}
            activeOpacity={0.7}
          >
            <View style={styles.cardIconBg}>
              <Image
                source={{ uri: 'https://img.icons8.com/isometric/512/home.png' }}
                style={styles.cardImage}
              />
            </View>
            <Text style={[styles.cardText, selectedGoodsType === 'home' && styles.cardTextSelected]}>Home Shifting</Text>
            {selectedGoodsType === 'home' && <Icon name="checkmark-circle" size={20} color={C.primaryStandard} style={styles.checkIcon} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.card,
              selectedGoodsType === 'office' && styles.cardSelected,
            ]}
            onPress={() => setSelectedGoodsType('office')}
            activeOpacity={0.7}
          >
            <View style={styles.cardIconBg}>
              <Image
                source={require('../assets/office.png')}
                style={styles.cardImage}
              />
            </View>
            <Text style={[styles.cardText, selectedGoodsType === 'office' && styles.cardTextSelected]}>Office Shifting</Text>
            {selectedGoodsType === 'office' && <Icon name="checkmark-circle" size={20} color={C.primaryStandard} style={styles.checkIcon} />}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Special Care</Text>
        
        <View style={styles.fragileCard}>
          <View style={styles.fragileInfo}>
            <View style={styles.fragileIconBg}>
              <Icon name="warning-outline" size={20} color={C.primaryStandard} />
            </View>
            <View>
              <Text style={styles.fragileTitle}>Fragile Goods</Text>
              <Text style={styles.fragileSub}>Need extra protection for your items?</Text>
            </View>
          </View>
          
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                fragileGoods && styles.toggleActive,
              ]}
              onPress={() => setFragileGoods(true)}
            >
              <Text style={[styles.toggleText, fragileGoods && styles.toggleActiveText]}>Yes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                !fragileGoods && styles.toggleActive,
              ]}
              onPress={() => setFragileGoods(false)}
            >
              <Text style={[styles.toggleText, !fragileGoods && styles.toggleActiveText]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={handleNext} style={styles.nextBtn} activeOpacity={0.8}>
        <Text style={styles.nextBtnText}>Continue</Text>
        <Icon name="arrow-forward" size={18} color={C.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.textHead,
    marginBottom: 20,
    marginTop: 10,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  cardSelected: {
    borderColor: C.primaryStandard,
    backgroundColor: C.primaryLight,
  },
  cardIconBg: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  cardText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textBody,
    textAlign: 'center',
  },
  cardTextSelected: {
    color: C.primaryStandard,
  },
  checkIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  fragileCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: C.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  fragileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  fragileIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fragileTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textHead,
  },
  fragileSub: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: C.bg,
    borderRadius: 16,
    padding: 6,
    gap: 6,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleActive: {
    backgroundColor: C.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textMuted,
  },
  toggleActiveText: {
    color: C.primaryStandard,
  },
  nextBtn: {
    backgroundColor: C.primary,
    flexDirection: 'row',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 'auto',
    marginBottom: 30,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: C.white,
  },
});
