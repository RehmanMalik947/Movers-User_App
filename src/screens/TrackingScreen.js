import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { jobApi, chatApi } from '../api/apiService';
import {
  formatElapsedTime,
  getStatusLabel,
  getTrackingSteps,
  isActiveStatus,
  normalizeStatus,
} from '../utils/jobStatus';

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

const getCoordsFromAddress = (address, type) => {
  const normalized = (address || '').toLowerCase();
  
  if (type === 'pickup') {
    if (normalized.includes('gulberg') || normalized.includes('mall 1')) {
      return { latitude: 31.5126, longitude: 74.3524 };
    }
    if (normalized.includes('cantt') || normalized.includes('cantonment')) {
      return { latitude: 31.5034, longitude: 74.3986 };
    }
    if (normalized.includes('dha') || normalized.includes('defence')) {
      return { latitude: 31.4805, longitude: 74.4690 };
    }
    // Default fallback pickup
    return { latitude: 31.5204, longitude: 74.3587 };
  } else {
    // Dropoff
    if (normalized.includes('johar town') || normalized.includes('johar')) {
      return { latitude: 31.4697, longitude: 74.2728 };
    }
    if (normalized.includes('iqbal town') || normalized.includes('allama iqbal')) {
      return { latitude: 31.5118, longitude: 74.2965 };
    }
    if (normalized.includes('dha') || normalized.includes('defence')) {
      return { latitude: 31.4805, longitude: 74.4690 };
    }
    // Default fallback dropoff (slightly shifted from pickup to show a route)
    return { latitude: 31.4800, longitude: 74.3200 };
  }
};

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
];

export default function TrackOrderScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const jobId = route.params?.jobId;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusSteps, setStatusStepsList] = useState([]);
  const [elapsed, setElapsed] = useState('00:00:00');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const startAnimations = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
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
  };

  const fetchJobDetails = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      if (jobId) {
        const res = await jobApi.getOne(jobId);
        const fetchedJob = res?.data ?? res;
        if (fetchedJob) {
          setJob(fetchedJob);
          setStatusStepsList(getTrackingSteps(fetchedJob));
        }
      } else {
        // Find latest active job from my jobs
        const res = await jobApi.getMyJobs(user.id);
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const activeJob = list.find((j) => isActiveStatus(j.status));
        if (activeJob) {
          setJob(activeJob);
          setStatusStepsList(getTrackingSteps(activeJob));
        } else {
          setJob(null);
        }
      }
    } catch (err) {
      console.error('Fetch job tracking error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [jobId, user]);

  useEffect(() => {
    fetchJobDetails();
    startAnimations();
  }, [fetchJobDetails]);

  // Polling every 5 seconds for status updates
  useEffect(() => {
    const timer = setInterval(() => {
      fetchJobDetails(true);
    }, 5000);
    return () => clearInterval(timer);
  }, [fetchJobDetails]);

  // Live elapsed timer when delivery is in progress
  useEffect(() => {
    if (normalizeStatus(job?.status) === 'in-progress' && job?.startedAt) {
      const tick = () => setElapsed(formatElapsedTime(job.startedAt));
      tick();
      const t = setInterval(tick, 1000);
      return () => clearInterval(t);
    }
    setElapsed('00:00:00');
  }, [job?.status, job?.startedAt]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchJobDetails();
  };

  const handleChatWithDriver = async () => {
    if (!job || !job.driverId) {
      Alert.alert('Notice', 'Driver is not assigned to this shipment yet.');
      return;
    }
    try {
      const res = await chatApi.startConversation(user.id, job.driverId, 'user-driver');
      if (res.success) {
        navigation.navigate('Messages', {
          screen: 'Chat',
          params: {
            conversationId: res.data.id,
            otherId: job.driverId,
            otherName: job.driverName || 'Driver',
          },
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Could not start chat with driver');
    }
  };

  const handleCallDriver = () => {
    if (!job || !job.driverId) {
      Alert.alert('Notice', 'Driver is not assigned to this shipment yet.');
      return;
    }
    Alert.alert(
      'Contact Driver',
      `Driver: ${job.driverName || 'Driver'}\nPhone: +92 300 1234567`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Chat Now', onPress: handleChatWithDriver },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primaryStandard} />
          <Text style={styles.loadingText}>Fetching shipment live status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrapper}>
              <Icon name="cube-outline" size={50} color={C.primaryStandard} />
            </View>
            <Text style={styles.noActiveTitle}>No Active Shipments</Text>
            <Text style={styles.noActiveSub}>You don't have any shipments currently in progress to track. Book a new mover to get started!</Text>
            <TouchableOpacity style={styles.reloadBtn} onPress={handleRefresh}>
              <Icon name="refresh" size={18} color={C.white} style={{marginRight: 8}}/>
              <Text style={styles.reloadBtnText}>Refresh Status</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate coordinates
  const pickupCoords = getCoordsFromAddress(job.pickupLocation || job.pickup, 'pickup');
  const dropoffCoords = getCoordsFromAddress(job.deliveryLocation || job.dropoff, 'dropoff');
  const jobStatus = normalizeStatus(job.status);

  let driverCoords = null;
  if (isActiveStatus(job.status) || jobStatus === 'completed') {
    if (jobStatus === 'assigned') {
      driverCoords = {
        latitude: pickupCoords.latitude + 0.01,
        longitude: pickupCoords.longitude + 0.01,
      };
    } else if (jobStatus === 'arrived_at_pickup') {
      driverCoords = pickupCoords;
    } else if (jobStatus === 'completed') {
      driverCoords = dropoffCoords;
    } else {
      driverCoords = {
        latitude: (pickupCoords.latitude + dropoffCoords.latitude) / 2,
        longitude: (pickupCoords.longitude + dropoffCoords.longitude) / 2,
      };
    }
  }

  const currentStepIdx = statusSteps.findIndex(s => !s.completed);
  const currentStep = currentStepIdx === -1 ? statusSteps.length : currentStepIdx;
  const progressPercentage = (currentStep / statusSteps.length) * 100;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
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
          <TouchableOpacity onPress={handleRefresh} style={styles.backButton}>
            <Icon name="refresh" size={22} color={C.white} />
          </TouchableOpacity>
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
            {getStatusLabel(job.status)} • Goods: {job.goodsType || 'Goods'}
          </Text>
          {jobStatus === 'in-progress' && job.startedAt && (
            <View style={styles.elapsedRow}>
              <Icon name="time-outline" size={14} color={C.primaryStandard} />
              <Text style={styles.elapsedText}>In transit for {elapsed}</Text>
            </View>
          )}
        </Animated.View>

        {/* Live Location Map */}
        <Animated.View
          style={[
            styles.mapSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Route Map</Text>
          </View>

          <View style={styles.mapPlaceholder}>
            <MapView
              style={{ flex: 1, width: '100%', height: 200 }}
              provider={PROVIDER_GOOGLE}
              region={{
                latitude: (pickupCoords.latitude + dropoffCoords.latitude) / 2,
                longitude: (pickupCoords.longitude + dropoffCoords.longitude) / 2,
                latitudeDelta: Math.abs(pickupCoords.latitude - dropoffCoords.latitude) * 2 || 0.08,
                longitudeDelta: Math.abs(pickupCoords.longitude - dropoffCoords.longitude) * 2 || 0.08,
              }}
              customMapStyle={mapStyle}
              scrollEnabled={true}
              zoomEnabled={true}
            >
              {/* Pickup Marker */}
              <Marker coordinate={pickupCoords} title="Pickup" description={job.pickupLocation || job.pickup}>
                <View style={styles.customMapMarkerPickup}>
                  <Icon name="location" size={24} color={C.success} />
                </View>
              </Marker>

              {/* Dropoff Marker */}
              <Marker coordinate={dropoffCoords} title="Delivery" description={job.deliveryLocation || job.dropoff}>
                <View style={styles.customMapMarkerDropoff}>
                  <Icon name="flag" size={24} color={C.error} />
                </View>
              </Marker>

              {/* Driver Marker */}
              {driverCoords && (
                <Marker coordinate={driverCoords} title="Driver Position" description={job.driverName || 'Captain'}>
                  <View style={styles.customMapMarkerDriver}>
                    <Icon name="car" size={26} color={C.primary} />
                  </View>
                </Marker>
              )}

              {/* Polyline connecting them */}
              <Polyline
                coordinates={[pickupCoords, dropoffCoords]}
                strokeColor={C.primaryStandard}
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            </MapView>
          </View>
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
            <Text style={styles.orderLabel} numberOfLines={1}>Order #{job.id || 'MOV-12345'}</Text>
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
                <Text style={styles.detailValue} numberOfLines={2}>{job.pickupLocation || job.pickup}</Text>
              </View>
            </View>

            <View style={styles.orderDetailRow}>
              <View style={styles.detailIconBg}>
                <Icon name="flag-outline" size={14} color={C.primaryStandard} />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Delivery Location</Text>
                <Text style={styles.detailValue} numberOfLines={2}>{job.deliveryLocation || job.dropoff}</Text>
              </View>
            </View>

            <View style={styles.dividerLine} />

            <View style={styles.orderDetailRow}>
              <View style={styles.detailIconBg}>
                <Icon name="car-outline" size={14} color={C.primaryStandard} />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Truck Category & Fare</Text>
                <Text style={styles.detailValue}>
                  {job.truckType || job.vehicleType || 'Standard Truck'} • Rs. {job.fare ? job.fare.toLocaleString() : 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.orderDetailRow}>
              <View style={styles.detailIconBg}>
                <Icon name="time-outline" size={14} color={C.primaryStandard} />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Requested Date</Text>
                <Text style={styles.detailValue}>{job.requestedDate ? new Date(job.requestedDate).toDateString() : 'N/A'}</Text>
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
          </View>

          <View style={styles.timeline}>
            {statusSteps.map((step, idx) => (
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
                  {idx !== statusSteps.length - 1 && (
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

        {/* Contact Support Button */}
        <Animated.View
          style={[
            styles.supportSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity style={styles.supportButton} onPress={handleChatWithDriver} activeOpacity={0.8}>
            <Icon
              name="chatbubble-ellipses-outline"
              size={18}
              color={C.white}
            />
            <Text style={styles.supportButtonText}>Chat with Driver</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.callButton} onPress={handleCallDriver} activeOpacity={0.8}>
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
    paddingBottom: 24,
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
  elapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: C.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  elapsedText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primaryStandard,
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: C.bg,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    color: C.textBody,
  },
  noActiveTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.textHead,
    marginBottom: 8,
  },
  noActiveSub: {
    fontSize: 15,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyIconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  reloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primaryStandard,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: C.primaryStandard,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  reloadBtnText: {
    color: C.white,
    fontWeight: '700',
    fontSize: 16,
  },
  customMapMarkerPickup: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.success,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customMapMarkerDropoff: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.error,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customMapMarkerDriver: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: C.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});
