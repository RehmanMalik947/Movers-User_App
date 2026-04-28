import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { setDate, setTime } from '../redux/slices/locationSlice';
import { useNavigation } from '@react-navigation/native';

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

const SetDateTimeScreen = () => {
  const [pickupDate, setPickupDate] = useState(new Date());
  const [pickupTime, setPickupTime] = useState(new Date());
  const [dropoffDate, setDropoffDate] = useState(new Date());
  const [dropoffTime, setDropoffTime] = useState(new Date());

  const [showPickupDate, setShowPickupDate] = useState(false);
  const [showPickupTime, setShowPickupTime] = useState(false);
  const [showDropoffDate, setShowDropoffDate] = useState(false);
  const [showDropoffTime, setShowDropoffTime] = useState(false);

  const formatDate = (date) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const PickerButton = ({ label, value, icon, onPress }) => (
    <View style={styles.pickerWrapper}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <TouchableOpacity style={styles.pickerBtn} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.pickerLeft}>
          <View style={styles.pickerIconBg}>
            <Icon name={icon} size={20} color={C.primaryStandard} />
          </View>
          <Text style={styles.pickerValue}>{value}</Text>
        </View>
        <Icon name="chevron-down" size={16} color={C.textMuted} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Schedule</Text>
          <PickerButton 
            label="Pickup Date" 
            value={formatDate(pickupDate)} 
            icon="calendar" 
            onPress={() => setShowPickupDate(true)} 
          />
          <PickerButton 
            label="Pickup Time" 
            value={formatTime(pickupTime)} 
            icon="time" 
            onPress={() => setShowPickupTime(true)} 
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Drop-off Schedule (Optional)</Text>
          <PickerButton 
            label="Drop-off Date" 
            value={formatDate(dropoffDate)} 
            icon="calendar-outline" 
            onPress={() => setShowDropoffDate(true)} 
          />
          <PickerButton 
            label="Drop-off Time" 
            value={formatTime(dropoffTime)} 
            icon="time-outline" 
            onPress={() => setShowDropoffTime(true)} 
          />
        </View>

        {showPickupDate && (
          <DateTimePicker
            value={pickupDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowPickupDate(false);
              if (selectedDate) setPickupDate(selectedDate);
            }}
          />
        )}
        {showPickupTime && (
          <DateTimePicker
            value={pickupTime}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowPickupTime(false);
              if (selectedTime) setPickupTime(selectedTime);
            }}
          />
        )}
        {showDropoffDate && (
          <DateTimePicker
            value={dropoffDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDropoffDate(false);
              if (selectedDate) setDropoffDate(selectedDate);
            }}
          />
        )}
        {showDropoffTime && (
          <DateTimePicker
            value={dropoffTime}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowDropoffTime(false);
              if (selectedTime) setDropoffTime(selectedTime);
            }}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} activeOpacity={0.8}>
          <Text style={styles.nextBtnText}>Continue</Text>
          <Icon name="arrow-forward" size={18} color={C.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 24 },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.textHead,
    marginBottom: 20,
  },
  pickerWrapper: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
    marginBottom: 8,
    marginLeft: 4,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  pickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickerIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerValue: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textHead,
  },
  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginVertical: 24,
  },
  footer: {
    padding: 24,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
  nextBtn: {
    backgroundColor: C.primary,
    flexDirection: 'row',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextBtnText: {
    color: C.white,
    fontWeight: '800',
    fontSize: 16,
  },
});

export default SetDateTimeScreen;
