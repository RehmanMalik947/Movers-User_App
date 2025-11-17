import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from 'react-native-paper';

const SetDateTimeScreen = () => {
  const [pickupDate, setPickupDate] = useState(new Date());
  const [dropoffDate, setDropoffDate] = useState(new Date());
  const [pickupTime, setPickupTime] = useState(new Date());
  const [dropoffTime, setDropoffTime] = useState(new Date());

  const [showPickupDate, setShowPickupDate] = useState(false);
  const [showPickupTime, setShowPickupTime] = useState(false);
  const [showDropoffDate, setShowDropoffDate] = useState(false);
  const [showDropoffTime, setShowDropoffTime] = useState(false);

  // Format date like "11 Feb 2025"
  const formatDate = (date) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };

  // Format time like "10:00 PM"
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Date & Time</Text>
      </View>

      {/* Pickup Section */}
      <Text style={styles.sectionTitle}>Pickup Date and Time</Text>

      <TouchableOpacity
        style={styles.dateContainer}
        onPress={() => setShowPickupDate(true)}
      >
        <Text style={styles.dateText}>{formatDate(pickupDate)}</Text>
        <Icon name="calendar" size={22} color="#000" />
      </TouchableOpacity>

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

      <Text style={styles.timeLabel}>Pick up Time</Text>
      <TouchableOpacity
        style={styles.timeBox}
        onPress={() => setShowPickupTime(true)}
      >
        <Text style={styles.timeText}>{formatTime(pickupTime)}</Text>
      </TouchableOpacity>

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

      {/* Drop-off Section */}
      <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
        Drop off Date and Time
      </Text>

      <TouchableOpacity
        style={styles.dateContainer}
        onPress={() => setShowDropoffDate(true)}
      >
        <Text style={styles.dateText}>{formatDate(dropoffDate)}</Text>
        <Icon name="calendar" size={22} color="#000" />
      </TouchableOpacity>

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

      <Text style={styles.timeLabel}>Drop off Time (optional)</Text>
      <TouchableOpacity
        style={styles.timeBox}
        onPress={() => setShowDropoffTime(true)}
      >
        <Text style={styles.timeText}>{formatTime(dropoffTime)}</Text>
      </TouchableOpacity>

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

      {/* Next Button */}
      <Button
        mode="contained"
        style={styles.nextButton}
        labelStyle={{ color: '#fff', fontSize: 16 }}
      >
        Next
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16, color: '#000' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 8 },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#E5E5E5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  dateText: { fontSize: 15, color: '#333' },
  timeLabel: { fontWeight: '700', color: '#000', marginBottom: 8, marginTop: 12 },
  timeBox: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  timeText: { fontSize: 15, color: '#000' },
  nextButton: {
    backgroundColor: '#DAAE58',
    borderRadius: 12,
    paddingVertical: 8,
    marginTop: 20,
    marginBottom: 40,
  },
});

export default SetDateTimeScreen;
