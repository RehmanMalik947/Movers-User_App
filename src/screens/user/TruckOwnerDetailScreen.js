import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { truckOwnerApi, jobApi } from '../../api/apiService';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/StarRating';

const C = {
  primary: '#1847B1',
  primaryStandard: '#2260D9',
  primaryLight: '#E8EFFD',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  textHead: '#0F172A',
  textBody: '#334155',
  textMuted: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
};

export default function TruckOwnerDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { ownerId, jobId } = route.params || {};

  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadOwner();
  }, [ownerId]);

  const loadOwner = async () => {
    setLoading(true);
    try {
      const res = await truckOwnerApi.getOne(ownerId);
      setOwner(res?.data ?? null);
    } catch {
      setOwner(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (jobId) {
      setSending(true);
      try {
        await jobApi.inviteOwner(jobId, ownerId);
        Alert.alert('Request Sent', `Your job request was sent to ${owner.display_name}.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch (error) {
        Alert.alert('Error', error.message || 'Could not send request');
      } finally {
        setSending(false);
      }
      return;
    }

    try {
      const res = await jobApi.getMyActiveJobs(user.id);
      const list = res?.data ?? [];
      if (list.length > 0) {
        const pendingJob = list.find((j) => j.status === 'pending');
        if (pendingJob) {
          Alert.alert(
            'Send to this owner?',
            `Invite ${owner.display_name} to bid on your current job?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Send Request',
                onPress: async () => {
                  setSending(true);
                  try {
                    await jobApi.inviteOwner(pendingJob.id, ownerId);
                    Alert.alert('Request Sent', `Invitation sent to ${owner.display_name}.`);
                  } catch (error) {
                    Alert.alert('Error', error.message || 'Could not send request');
                  } finally {
                    setSending(false);
                  }
                },
              },
            ]
          );
          return;
        }
        Alert.alert('Active Job', 'Cancel your current job before sending a new request.');
        return;
      }
    } catch {
      // continue to create job
    }

    navigation.navigate('CreateJob', {
      targetOwnerId: ownerId,
      targetOwnerName: owner.display_name,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primaryStandard} />
      </View>
    );
  }

  if (!owner) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Truck owner not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={C.textHead} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Owner Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(owner.display_name || 'O').charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{owner.display_name}</Text>
          {owner.business_name && owner.business_name !== owner.name ? (
            <Text style={styles.subName}>{owner.name}</Text>
          ) : null}
          <View style={styles.ratingRow}>
            <StarRating rating={owner.average_rating || owner.rating} size={18} />
            <Text style={styles.reviewLabel}>{owner.total_reviews} reviews</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{owner.truck_count ?? owner.trucks?.length ?? 0}</Text>
              <Text style={styles.statLabel}>Trucks</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{owner.driver_count || 0}</Text>
              <Text style={styles.statLabel}>Drivers</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{owner.total_reviews || 0}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
          {owner.address ? (
            <View style={styles.infoRow}>
              <Icon name="location-outline" size={16} color={C.primaryStandard} />
              <Text style={styles.infoText}>{owner.address}</Text>
            </View>
          ) : null}
          {owner.phone ? (
            <View style={styles.infoRow}>
              <Icon name="call-outline" size={16} color={C.primaryStandard} />
              <Text style={styles.infoText}>{owner.phone}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Fleet</Text>
        {owner.trucks?.length ? (
          owner.trucks.map((truck) => (
            <View key={truck.id} style={styles.truckCard}>
              <View style={styles.truckIcon}>
                <Icon name="bus" size={22} color={C.primaryStandard} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.truckReg}>{truck.registration_number}</Text>
                <Text style={styles.truckMeta}>
                  {truck.category?.name || 'Truck'}
                  {truck.model ? ` • ${truck.model}` : ''}
                  {truck.capacity_kg ? ` • ${truck.capacity_kg} kg` : ''}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptySection}>No active trucks listed</Text>
        )}

        <Text style={styles.sectionTitle}>Reviews</Text>
        {owner.reviews?.length ? (
          owner.reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <StarRating rating={review.rating} size={14} showValue={false} />
                <Text style={styles.reviewDate}>
                  {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                </Text>
              </View>
              {review.comment ? (
                <Text style={styles.reviewComment}>{review.comment}</Text>
              ) : (
                <Text style={styles.reviewCommentMuted}>No written comment</Text>
              )}
              <Text style={styles.reviewFrom}>
                {review.from_role === 'customer' ? 'Customer' : review.from_role}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.noReviews}>
            <Icon name="star-outline" size={36} color={C.border} />
            <Text style={styles.emptySection}>No reviews yet</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.ctaBtn, sending && styles.ctaDisabled]}
        onPress={handleSendRequest}
        disabled={sending}
        activeOpacity={0.9}
      >
        {sending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="paper-plane" size={20} color="#fff" />
            <Text style={styles.ctaText}>
              {jobId ? 'Send Job Request' : 'Request Quote from Owner'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: C.textMuted, fontSize: 16 },
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
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.textHead },
  scroll: { padding: 20, paddingBottom: 100 },
  profileCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: C.primaryStandard },
  name: { fontSize: 22, fontWeight: '800', color: C.textHead, textAlign: 'center' },
  subName: { fontSize: 14, color: C.textMuted, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  reviewLabel: { fontSize: 13, color: C.textMuted, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', marginTop: 20, width: '100%' },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: C.primaryStandard },
  statLabel: { fontSize: 11, color: C.textMuted, marginTop: 2, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, alignSelf: 'stretch' },
  infoText: { flex: 1, fontSize: 14, color: C.textBody },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: C.textHead, marginBottom: 12 },
  truckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  truckIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  truckReg: { fontSize: 15, fontWeight: '700', color: C.textHead },
  truckMeta: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  reviewCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewDate: { fontSize: 11, color: C.textMuted },
  reviewComment: { fontSize: 14, color: C.textBody, lineHeight: 20 },
  reviewCommentMuted: { fontSize: 13, color: C.textMuted, fontStyle: 'italic' },
  reviewFrom: { fontSize: 11, color: C.textMuted, marginTop: 8, fontWeight: '600', textTransform: 'capitalize' },
  emptySection: { fontSize: 14, color: C.textMuted, marginBottom: 20 },
  noReviews: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  ctaBtn: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  ctaDisabled: { opacity: 0.7 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
