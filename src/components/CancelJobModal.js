import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

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
  error: '#EF4444',
};

const PRESET_REASONS = [
  'Changed my plans',
  'Found another transport option',
  'Wrong pickup or dropoff address',
  'Posted by mistake',
  'Price / timing not suitable',
];

export default function CancelJobModal({ visible, onClose, onConfirm, loading }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const finalReason = useCustom ? customReason.trim() : selectedReason;

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    setUseCustom(false);
    onClose();
  };

  const handleConfirm = () => {
    if (finalReason.length < 3) return;
    onConfirm(finalReason);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <Icon name="close-circle-outline" size={24} color={C.error} />
            <Text style={styles.title}>Cancel Shipment</Text>
          </View>
          <Text style={styles.subtitle}>
            You can cancel only before accepting a bid. This job will be removed for all truck owners.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {PRESET_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonChip,
                  !useCustom && selectedReason === reason && styles.reasonChipActive,
                ]}
                onPress={() => {
                  setUseCustom(false);
                  setSelectedReason(reason);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.reasonText,
                    !useCustom && selectedReason === reason && styles.reasonTextActive,
                  ]}
                >
                  {reason}
                </Text>
                {!useCustom && selectedReason === reason && (
                  <Icon name="checkmark-circle" size={18} color={C.primaryStandard} />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.reasonChip, useCustom && styles.reasonChipActive]}
              onPress={() => {
                setUseCustom(true);
                setSelectedReason('');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.reasonText, useCustom && styles.reasonTextActive]}>
                Other reason
              </Text>
            </TouchableOpacity>

            {useCustom && (
              <TextInput
                style={styles.input}
                placeholder="Tell us why you're cancelling..."
                placeholderTextColor={C.textMuted}
                value={customReason}
                onChangeText={setCustomReason}
                multiline
                maxLength={300}
                textAlignVertical="top"
              />
            )}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.keepBtn} onPress={handleClose} disabled={loading}>
              <Text style={styles.keepBtnText}>Keep Shipment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelBtn, finalReason.length < 3 && styles.cancelBtnDisabled]}
              onPress={handleConfirm}
              disabled={loading || finalReason.length < 3}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <Text style={styles.cancelBtnText}>Confirm Cancel</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.5)' },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: C.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '800', color: C.textHead },
  subtitle: { fontSize: 13, color: C.textMuted, lineHeight: 18, marginBottom: 20 },
  scroll: { maxHeight: 320 },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
    backgroundColor: C.bg,
  },
  reasonChipActive: {
    borderColor: C.primaryStandard,
    backgroundColor: C.primaryLight,
  },
  reasonText: { fontSize: 14, fontWeight: '600', color: C.textHead, flex: 1 },
  reasonTextActive: { color: C.primaryStandard, fontWeight: '700' },
  input: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: C.textHead,
    backgroundColor: C.bg,
    marginBottom: 8,
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  keepBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  keepBtnText: { fontWeight: '700', color: C.textHead },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: C.error,
  },
  cancelBtnDisabled: { opacity: 0.5 },
  cancelBtnText: { fontWeight: '800', color: C.white },
});
