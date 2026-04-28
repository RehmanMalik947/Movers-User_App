import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

// ─── Design Tokens - Matching Login Screen ─────────────────────────────────────────
const C = {
  primary: '#1847B1', // Deep navy blue
  primaryStandard: '#2260D9', // Standard primary blue
  primaryLight: '#E8EFFD', // Light blue tint
  bg: '#F8FAFC', // Cool Gray Background
  surface: '#FFFFFF', // White
  surfaceAlt: '#F8FAFC', // Light background
  textHead: '#0F172A', // Dark text
  textBody: '#334155', // Body text
  textMuted: '#64748B', // Muted text
  textLink: '#2260D9', // Standard blue for links
  border: '#E2E8F0', // Border color
  divider: '#E2E8F0', // Divider color
  white: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

const STATUS_STEPS = [
  {
    label: 'Order Placed',
    completed: true,
    date: 'Today, 10:30 AM',
    icon: 'cart-outline',
  },
  {
    label: 'Picked Up',
    completed: true,
    date: 'Today, 12:15 PM',
    icon: 'cube-outline',
  },
  {
    label: 'In Transit',
    completed: true,
    date: 'Today, 1:45 PM',
    icon: 'car-outline',
  },
  {
    label: 'Out for Delivery',
    completed: false,
    date: 'Est. Today, 4:30 PM',
    icon: 'location-outline',
  },
  {
    label: 'Delivered',
    completed: false,
    date: 'Est. Today, 5:00 PM',
    icon: 'checkmark-circle-outline',
  },
];

export default function TrackOrderScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getCurrentStepIndex = () => {
    for (let i = 0; i < STATUS_STEPS.length; i++) {
      if (!STATUS_STEPS[i].completed) return i;
    }
    return STATUS_STEPS.length;
  };

  const currentStep = getCurrentStepIndex();
  const progressPercentage = (currentStep / STATUS_STEPS.length) * 100;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={22} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Order</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        {/* Progress Bar */}
        <Animated.View
          style={[
            styles.progressSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Delivery Progress</Text>
            <Text style={styles.progressPercent}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressSubtext}>
            {STATUS_STEPS[currentStep]?.label || 'Order Complete'} • Estimated
            delivery by 5:00 PM
          </Text>
        </Animated.View>

        {/* Order Info Card */}
        <Animated.View
          style={[
            styles.orderCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.orderHeader}>
            <View style={styles.orderBadge}>
              <MaterialIcon
                name="local-shipping"
                size={16}
                color={C.primaryStandard}
              />
            </View>
            <Text style={styles.orderLabel}>Order #MOV-12345</Text>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.orderDetailRow}>
              <View style={styles.detailIconBg}>
                <Icon
                  name="location-outline"
                  size={14}
                  color={C.primaryStandard}
                />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Pickup Location</Text>
                <Text style={styles.detailValue}>Mall 1, Gulberg, Lahore</Text>
              </View>
            </View>

            <View style={styles.orderDetailRow}>
              <View style={styles.detailIconBg}>
                <Icon name="flag-outline" size={14} color={C.primaryStandard} />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Delivery Location</Text>
                <Text style={styles.detailValue}>Johar Town, Lahore</Text>
              </View>
            </View>

            <View style={styles.dividerLine} />

            <View style={styles.orderDetailRow}>
              <View style={styles.detailIconBg}>
                <Icon name="car-outline" size={14} color={C.primaryStandard} />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Vehicle</Text>
                <Text style={styles.detailValue}>
                  Medium Truck • Capacity 3 Tons
                </Text>
              </View>
            </View>

            <View style={styles.orderDetailRow}>
              <View style={styles.detailIconBg}>
                <Icon name="time-outline" size={14} color={C.primaryStandard} />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Estimated Delivery</Text>
                <Text style={styles.detailValue}>Today, 5:00 PM</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Tracking Timeline */}
        <Animated.View
          style={[
            styles.timelineSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Status</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View Details</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeline}>
            {STATUS_STEPS.map((step, idx) => (
              <View key={step.label} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineIcon,
                      step.completed && styles.timelineIconCompleted,
                      idx === currentStep &&
                        !step.completed &&
                        styles.timelineIconCurrent,
                    ]}
                  >
                    {step.completed ? (
                      <Icon name="checkmark" size={12} color={C.white} />
                    ) : idx === currentStep ? (
                      <View style={styles.pulsingDot} />
                    ) : (
                      <View style={styles.emptyDot} />
                    )}
                  </View>
                  {idx !== STATUS_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        step.completed && styles.timelineLineCompleted,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      step.completed && styles.timelineLabelCompleted,
                      idx === currentStep &&
                        !step.completed &&
                        styles.timelineLabelCurrent,
                    ]}
                  >
                    {step.label}
                  </Text>
                  <Text style={styles.timelineDate}>{step.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Map Placeholder */}
        <Animated.View
          style={[
            styles.mapSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Location</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAllText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapPlaceholder}>
            <View style={styles.mapOverlay}>
              <View style={styles.mapIconBg}>
                <Icon name="map-outline" size={32} color={C.primaryStandard} />
              </View>
              <Text style={styles.mapPlaceholderText}>Live Map View</Text>
              <Text style={styles.mapSubtext}>
                Driver location will appear here
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Contact Support Button */}
        <Animated.View
          style={[
            styles.supportSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity style={styles.supportButton} activeOpacity={0.8}>
            <Icon
              name="chatbubble-ellipses-outline"
              size={18}
              color={C.white}
            />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.callButton} activeOpacity={0.8}>
            <Icon name="call-outline" size={18} color={C.primaryStandard} />
            <Text style={styles.callButtonText}>Call Driver</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 12,
    marginBottom: 20,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.white,
    letterSpacing: 0.5,
  },

  // Progress Section
  progressSection: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textHead,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
    color: C.primaryStandard,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: C.primaryLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: C.primaryStandard,
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: C.textMuted,
  },

  // Order Card
  orderCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: C.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  orderBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orderLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textHead,
  },
  orderDetails: {
    padding: 16,
  },
  orderDetailRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  detailIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: C.textHead,
  },
  dividerLine: {
    height: 1,
    backgroundColor: C.divider,
    marginVertical: 12,
  },

  // Timeline Section
  timelineSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textHead,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primaryStandard,
  },
  timeline: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 30,
    marginRight: 12,
  },
  timelineIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surface,
  },
  timelineIconCompleted: {
    backgroundColor: C.success,
    borderColor: C.success,
  },
  timelineIconCurrent: {
    borderColor: C.primaryStandard,
    backgroundColor: C.primaryLight,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.primaryStandard,
  },
  emptyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.border,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: C.border,
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: C.success,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: C.textMuted,
    marginBottom: 2,
  },
  timelineLabelCompleted: {
    fontWeight: '600',
    color: C.textHead,
  },
  timelineLabelCurrent: {
    fontWeight: '700',
    color: C.primaryStandard,
  },
  timelineDate: {
    fontSize: 11,
    color: C.textMuted,
  },

  // Map Section
  mapSection: {
    marginBottom: 24,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: 20,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
  },
  mapOverlay: {
    alignItems: 'center',
  },
  mapIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapPlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textHead,
    marginBottom: 4,
  },
  mapSubtext: {
    fontSize: 12,
    color: C.textMuted,
  },

  // Support Section
  supportSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.white,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.surface,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.primaryStandard,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.primaryStandard,
  },
  bottomPadding: {
    height: 20,
    bottom: 40,
  },
});
