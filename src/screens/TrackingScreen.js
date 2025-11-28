import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const STATUS_STEPS = [
  { label: 'Order Placed', completed: true },
  { label: 'Picked Up', completed: true },
  { label: 'In Transit', completed: false },
  { label: 'Out for Delivery', completed: false },
  { label: 'Delivered', completed: false },
];

export default function app() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Order</Text>
          <View style={{ width: 24 }} /> {/* placeholder for spacing */}
        </View>

        {/* Order Info Card */}
        <View style={styles.orderCard}>
          <Text style={styles.orderLabel}>Order #12345</Text>
          <Text style={styles.orderDetail}>Pickup: Mall 1, Gulberg, Lahore</Text>
          <Text style={styles.orderDetail}>Delivery: Johar Town, Lahore</Text>
          <Text style={styles.orderDetail}>Vehicle: Medium Truck</Text>
          <Text style={styles.orderDetail}>Estimated Delivery: Today, 5:00 PM</Text>
        </View>

        {/* Tracking Timeline */}
        <Text style={styles.sectionTitle}>Order Status</Text>
        <View style={styles.timeline}>
          {STATUS_STEPS.map((step, idx) => (
            <View key={step.label} style={styles.timelineRow}>
              <View style={styles.timelineIconWrapper}>
                <View
                  style={[
                    styles.timelineIcon,
                    step.completed && styles.timelineIconCompleted,
                  ]}
                >
                  {step.completed && <Icon name="check" size={16} color="#fff" />}
                </View>
                {idx !== STATUS_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      STATUS_STEPS[idx + 1].completed && styles.timelineLineCompleted,
                    ]}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.timelineLabel,
                  step.completed && { fontWeight: '700', color: '#2A2A2A' },
                ]}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Map Placeholder */}
        <Text style={styles.sectionTitle}>Map</Text>
        <View style={styles.mapPlaceholder}>
          <Text style={{ color: '#999' }}>Map goes here</Text>
        </View>

        {/* Contact Support Button */}
        <TouchableOpacity style={styles.supportButton}>
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6A940',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },

  orderCard: {
    backgroundColor: '#FDF1D9',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0E8D6',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  orderLabel: { fontSize: 16, fontWeight: '700', marginBottom: 6, color: '#2A2A2A' },
  orderDetail: { fontSize: 14, color: '#555', marginBottom: 2 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2A2A2A', marginBottom: 12 },

  timeline: { marginBottom: 24 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  timelineIconWrapper: { alignItems: 'center', width: 30 },
  timelineIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DAAE58',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  timelineIconCompleted: { backgroundColor: '#DAAE58', borderColor: '#DAAE58' },
  timelineLine: { width: 2, height: 40, backgroundColor: '#E6A940', marginTop: -2 },
  timelineLineCompleted: { backgroundColor: '#DAAE58' },
  timelineLabel: { marginLeft: 12, fontSize: 14, color: '#999' },

  mapPlaceholder: {
    height: 180,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0E8D6',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  supportButton: {
    backgroundColor: '#E6A940',
    paddingVertical: 14,
    marginBottom:29,
    borderRadius: 18,
    alignItems: 'center',
  },
  supportButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
