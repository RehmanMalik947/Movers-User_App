import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { reviewApi } from '../api/apiService';

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
    white: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
};

export default function RateJobScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { jobId, toId, toRole, toName, myId, myRole, jobTitle } = route.params;

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Select Rating', 'Please select a star rating before submitting.');
            return;
        }
        setSubmitting(true);
        try {
            await reviewApi.create({
                job_id: jobId,
                from_id: myId,
                from_role: myRole,
                to_id: toId,
                to_role: toRole,
                rating,
                comment: comment.trim() || undefined,
            });
            Alert.alert(
                'Thank You!',
                `Your ${rating}-star review has been submitted.`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            const msg = error.message || '';
            if (msg.includes('already reviewed')) {
                Alert.alert('Already Reviewed', 'You have already submitted a review for this job.');
                navigation.goBack();
            } else {
                Alert.alert('Error', msg || 'Failed to submit review. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color={C.textHead} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rate Your Experience</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.personSection}>
                        <View style={styles.avatarCircle}>
                            <Icon name="person" size={40} color={C.primaryStandard} />
                        </View>
                        <Text style={styles.personName}>{toName || (toRole === 'driver' ? 'Driver' : 'Customer')}</Text>
                        <Text style={styles.jobLabel}>{jobTitle || 'Shipment'}</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.rateQuestion}>How was your experience?</Text>

                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setRating(star)}
                                    activeOpacity={0.7}
                                    style={styles.starBtn}
                                >
                                    <Icon
                                        name={star <= rating ? 'star' : 'star-outline'}
                                        size={44}
                                        color={star <= rating ? '#F59E0B' : C.border}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {rating > 0 && (
                            <Text style={styles.ratingLabel}>{ratingLabels[rating - 1]}</Text>
                        )}

                        <View style={styles.divider} />

                        <Text style={styles.commentLabel}>Share more details (optional)</Text>
                        <TextInput
                            style={styles.commentInput}
                            value={comment}
                            onChangeText={setComment}
                            placeholder="Tell us about your experience..."
                            placeholderTextColor={C.textMuted}
                            multiline
                            textAlignVertical="top"
                            maxLength={500}
                        />
                        <Text style={styles.charCount}>{comment.length}/500</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting || rating === 0}
                        activeOpacity={0.9}
                    >
                        {submitting ? (
                            <ActivityIndicator color={C.white} />
                        ) : (
                            <>
                                <Icon name="checkmark-circle" size={22} color={C.white} />
                                <Text style={styles.submitText}>Submit Review</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.skipBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
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
    scroll: { padding: 20, paddingBottom: 40, alignItems: 'center' },

    personSection: { alignItems: 'center', marginBottom: 24 },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: C.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    personName: { fontSize: 20, fontWeight: '800', color: C.textHead },
    jobLabel: { fontSize: 14, color: C.textMuted, marginTop: 4 },

    card: {
        backgroundColor: C.surface,
        borderRadius: 24,
        padding: 24,
        width: '100%',
        borderWidth: 1,
        borderColor: C.border,
        alignItems: 'center',
    },
    rateQuestion: { fontSize: 16, fontWeight: '700', color: C.textHead, marginBottom: 20 },
    starsContainer: { flexDirection: 'row', gap: 6, marginBottom: 12 },
    starBtn: { padding: 4 },
    ratingLabel: { fontSize: 16, fontWeight: '600', color: C.warning, marginTop: 4 },

    divider: { height: 1, backgroundColor: C.border, width: '100%', marginVertical: 20 },

    commentLabel: { fontSize: 14, fontWeight: '600', color: C.textBody, alignSelf: 'flex-start', marginBottom: 12 },
    commentInput: {
        width: '100%',
        minHeight: 100,
        backgroundColor: C.bg,
        borderRadius: 16,
        padding: 16,
        fontSize: 14,
        color: C.textHead,
        borderWidth: 1,
        borderColor: C.border,
    },
    charCount: { fontSize: 12, color: C.textMuted, alignSelf: 'flex-end', marginTop: 4 },

    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.primary,
        paddingVertical: 18,
        borderRadius: 20,
        width: '100%',
        marginTop: 24,
        gap: 10,
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitText: { color: C.white, fontSize: 18, fontWeight: '800' },

    skipBtn: { marginTop: 16, padding: 12 },
    skipText: { color: C.textMuted, fontSize: 15, fontWeight: '600' },
});
