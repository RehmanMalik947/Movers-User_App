import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { chatApi, driverApi, jobApi } from '../../api/apiService';
import { useAuth } from '../../context/AuthContext';
import {
  DRIVER_STEPS,
  formatElapsedTime,
  getDriverAction,
  getStatusColor,
  getStatusLabel,
  getStepIndex,
  normalizeStatus,
} from '../../utils/jobStatus';

const C = {
  primary: '#1847B1',
  primaryStandard: '#2260D9',
  primaryLight: '#E8EFFD',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  textHead: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

export default function ActiveJobScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { jobId } = route.params;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [elapsed, setElapsed] = useState('00:00:00');
  const { user: currentUser } = useAuth();
  const timerRef = useRef(null);

  const loadJob = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await jobApi.getOne(jobId);
      if (res.success) {
        setJob(res.data);
      } else if (!silent) {
        Alert.alert('Error', 'Could not load job');
      }
    } catch {
      if (!silent) Alert.alert('Error', 'Could not load job');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [jobId]);

  useFocusEffect(
    useCallback(() => {
      loadJob();
      const poll = setInterval(() => loadJob(true), 8000);
      return () => clearInterval(poll);
    }, [loadJob])
  );

  useEffect(() => {
    const status = normalizeStatus(job?.status);
    if (status === 'in-progress' && job?.startedAt) {
      const tick = () => setElapsed(formatElapsedTime(job.startedAt));
      tick();
      timerRef.current = setInterval(tick, 1000);
      return () => clearInterval(timerRef.current);
    }
    setElapsed('00:00:00');
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [job?.status, job?.startedAt]);

  const handleStatusAction = async (action) => {
    setUpdating(true);
    try {
      let res;
      if (action === 'arrive') res = await driverApi.arriveAtPickup(jobId);
      else if (action === 'start') res = await driverApi.startJob(jobId);
      else if (action === 'complete') res = await driverApi.completeJob(jobId);

      if (res?.success) {
        setJob(res.data);
        const messages = {
          arrive: 'Customer has been notified that you arrived!',
          start: 'Delivery started — timer is running.',
          complete: 'Great job! Delivery marked as complete.',
        };
        Alert.alert('Success', messages[action]);
      } else {
        Alert.alert('Error', res?.error || 'Could not update status');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleChatWithCustomer = async () => {
    const customerId = job.customer_id || job.userId;
    if (!customerId) {
      Alert.alert('Notice', 'Customer information not found.');
      return;
    }
    setUpdating(true);
    try {
      const res = await chatApi.startConversation(currentUser.id, customerId, 'user-driver');
      if (res.success) {
        navigation.navigate('Messages', {
          screen: 'Chat',
          params: {
            conversationId: res.data.id,
            otherId: customerId,
            otherName: job.customer_name || job.userName || 'Customer',
          },
        });
      }
    } catch {
      Alert.alert('Error', 'Could not start chat');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primaryStandard} />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.center}>
        <Icon name="alert-circle-outline" size={50} color={C.border} />
        <Text style={styles.emptyText}>Job not found</Text>
      </View>
    );
  }

  const action = getDriverAction(job.status);
  const isCompleted = normalizeStatus(job.status) === 'completed';
  const currentStep = getStepIndex(job.status);
  const statusColor = getStatusColor(job.status);
  const inTransit = normalizeStatus(job.status) === 'in-progress';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color={C.textHead} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Shipment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(job.status)}
            </Text>
          </View>
          <Text style={styles.title}>{job.title || 'Shipment'}</Text>
        </View>

        {/* Progress Stepper */}
        <View style={styles.stepperCard}>
          <Text style={styles.cardTitle}>Delivery Progress</Text>
          <View style={styles.stepperRow}>
            {DRIVER_STEPS.map((step, idx) => {
              const done = idx <= currentStep;
              const active = idx === currentStep && !isCompleted;
              return (
                <View key={step.key} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      done && styles.stepCircleDone,
                      active && styles.stepCircleActive,
                    ]}
                  >
                    {done && !active ? (
                      <Icon name="checkmark" size={14} color={C.white} />
                    ) : (
                      <Icon name={step.icon} size={14} color={active ? C.primaryStandard : C.textMuted} />
                    )}
                  </View>
                  <Text style={[styles.stepLabel, active && styles.stepLabelActive]} numberOfLines={1}>
                    {step.label}
                  </Text>
                  {idx < DRIVER_STEPS.length - 1 && (
                    <View style={[styles.stepLine, done && styles.stepLineDone]} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Live Timer */}
        {inTransit && (
          <View style={styles.timerCard}>
            <Icon name="time-outline" size={28} color={C.primaryStandard} />
            <View style={styles.timerInfo}>
              <Text style={styles.timerLabel}>Elapsed Time</Text>
              <Text style={styles.timerValue}>{elapsed}</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Route Details</Text>

          <View style={styles.routeRow}>
            <View style={[styles.iconCircle, { backgroundColor: C.success + '15' }]}>
              <Icon name="location" size={18} color={C.success} />
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.label}>Pickup</Text>
              <Text style={styles.val}>{job.pickupLocation || job.pickup}</Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routeRow}>
            <View style={[styles.iconCircle, { backgroundColor: C.error + '15' }]}>
              <Icon name="flag" size={18} color={C.error} />
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.label}>Dropoff</Text>
              <Text style={styles.val}>{job.deliveryLocation || job.dropoff}</Text>
            </View>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Icon name="cash-outline" size={16} color={C.primaryStandard} />
            <Text style={styles.metaText}>Rs. {(job.fare || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.metaChip}>
            <Icon name="cube-outline" size={16} color={C.primaryStandard} />
            <Text style={styles.metaText}>{job.goodsType || 'Goods'}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={handleChatWithCustomer}
            disabled={updating}
            activeOpacity={0.8}
          >
            <Icon name="chatbubble-ellipses-outline" size={22} color={C.primaryStandard} />
            <Text style={styles.chatButtonText}>Chat with Customer</Text>
          </TouchableOpacity>

          {action ? (
            <TouchableOpacity
              style={[styles.bigBtn, { backgroundColor: action.color }]}
              onPress={() => handleStatusAction(action.action)}
              disabled={updating}
              activeOpacity={0.9}
            >
              {updating ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <>
                  <Icon name={action.icon} size={24} color={C.white} style={{ marginRight: 10 }} />
                  <View style={styles.btnTextWrap}>
                    <Text style={styles.btnText}>{action.label}</Text>
                    <Text style={styles.btnSubtext}>{action.sublabel}</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
          ) : isCompleted ? (
            <View>
              <View style={styles.completedBox}>
                <Icon name="checkmark-done-circle" size={30} color={C.white} />
                <Text style={styles.completedText}>Delivery Completed</Text>
              </View>
              <TouchableOpacity
                style={styles.rateBtn}
                onPress={() =>
                  navigation.navigate('RateJob', {
                    jobId,
                    toId: job.userId || job.customer_id,
                    toRole: 'customer',
                    toName: job.customer_name || job.userName || 'Customer',
                    myId: currentUser?.id,
                    myRole: 'driver',
                    jobTitle: job.title,
                  })
                }
                activeOpacity={0.9}
              >
                <Icon name="star-outline" size={22} color={C.warning} />
                <Text style={styles.rateBtnText}>Rate Customer</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.textHead },
  scroll: { padding: 20 },

  statusSection: { marginBottom: 20, alignItems: 'center' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
    gap: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
  title: { fontSize: 22, fontWeight: '800', color: C.textHead, textAlign: 'center' },

  stepperCard: {
    backgroundColor: C.surface,
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  stepperRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  stepItem: { flex: 1, alignItems: 'center', position: 'relative' },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.bg,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleDone: { backgroundColor: C.success, borderColor: C.success },
  stepCircleActive: { borderColor: C.primaryStandard, backgroundColor: C.primaryLight },
  stepLabel: { fontSize: 9, color: C.textMuted, fontWeight: '600', textAlign: 'center' },
  stepLabelActive: { color: C.primaryStandard, fontWeight: '800' },
  stepLine: {
    position: 'absolute',
    top: 15,
    left: '60%',
    width: '80%',
    height: 2,
    backgroundColor: C.border,
    zIndex: -1,
  },
  stepLineDone: { backgroundColor: C.success },

  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primaryLight,
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: C.primaryStandard + '30',
  },
  timerInfo: { flex: 1 },
  timerLabel: { fontSize: 12, color: C.textMuted, fontWeight: '600' },
  timerValue: { fontSize: 28, fontWeight: '800', color: C.primary, letterSpacing: 1 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.error + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.error },
  liveText: { fontSize: 11, fontWeight: '800', color: C.error },

  card: {
    backgroundColor: C.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.textHead, marginBottom: 16 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeInfo: { flex: 1 },
  routeLine: { height: 20, width: 1, backgroundColor: C.border, marginLeft: 18, marginVertical: 4 },
  label: { fontSize: 12, color: C.textMuted, marginBottom: 2 },
  val: { fontSize: 15, color: C.textHead, fontWeight: '600' },

  metaRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metaChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.surface,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  metaText: { fontSize: 13, fontWeight: '700', color: C.textHead },

  actionsContainer: { gap: 14, marginBottom: 40 },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.primaryStandard,
    gap: 10,
  },
  chatButtonText: { color: C.primaryStandard, fontWeight: '700', fontSize: 16 },
  bigBtn: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  btnTextWrap: { flex: 1 },
  btnText: { color: C.white, fontSize: 17, fontWeight: '800' },
  btnSubtext: { color: C.white + 'CC', fontSize: 12, marginTop: 2, fontWeight: '500' },

  completedBox: {
    backgroundColor: C.success,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  completedText: { color: C.white, fontWeight: '800', fontSize: 18 },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: C.warning,
    gap: 10,
    marginTop: 12,
  },
  rateBtnText: { color: C.warning, fontWeight: '800', fontSize: 16 },
  emptyText: { color: C.textMuted, fontSize: 16, fontWeight: '500' },
});
