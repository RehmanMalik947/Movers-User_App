import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { walletApi } from '../api/apiService';

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
  error: '#EF4444',
};

const WITHDRAW_METHODS = [
  { id: 'EasyPaisa', label: 'EasyPaisa', icon: 'phone-portrait-outline' },
  { id: 'JazzCash', label: 'JazzCash', icon: 'phone-portrait-outline' },
];

export default function WithdrawScreen({ navigation, route }) {
  const currentBalance = route.params?.balance || 0;
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('EasyPaisa');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (numAmount > currentBalance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }
    if (!mobileNumber || mobileNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await walletApi.requestWithdraw({
        amount: numAmount,
        method: selectedMethod,
        mobileNumber,
      });
      if (res.success) {
        Alert.alert('Success', `Withdrawal request of Rs. ${numAmount.toLocaleString()} submitted!`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  const maxWithdraw = () => setAmount(currentBalance.toString());

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color={C.textHead} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw Funds</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Balance Info */}
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>Rs. {currentBalance.toLocaleString()}</Text>
          </View>

          {/* Amount Input */}
          <Text style={styles.label}>Withdrawal Amount (PKR)</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySign}>Rs.</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={C.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <TouchableOpacity onPress={maxWithdraw}>
              <Text style={styles.maxText}>MAX</Text>
            </TouchableOpacity>
          </View>

          {/* Withdraw Method */}
          <Text style={[styles.label, { marginTop: 24 }]}>Withdraw To</Text>
          <View style={styles.methodRow}>
            {WITHDRAW_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodBtn, selectedMethod === method.id && styles.methodBtnActive]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <Icon name={method.icon} size={20} color={selectedMethod === method.id ? C.primary : C.textMuted} />
                <Text style={[styles.methodText, selectedMethod === method.id && styles.methodTextActive]}>{method.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Mobile Number */}
          <Text style={[styles.label, { marginTop: 24 }]}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="03XX-XXXXXXX"
            placeholderTextColor={C.textMuted}
            keyboardType="phone-pad"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            maxLength={11}
          />

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleWithdraw}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Withdraw Now</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.textHead },
  content: { padding: 20 },
  balanceInfo: {
    backgroundColor: C.primaryLight,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: { fontSize: 13, color: C.textMuted, fontWeight: '500' },
  balanceAmount: { fontSize: 28, fontWeight: '800', color: C.primary, marginTop: 4 },
  label: { fontSize: 14, fontWeight: '600', color: C.textBody, marginBottom: 10 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
  },
  currencySign: { fontSize: 22, fontWeight: '700', color: C.textHead, marginRight: 8 },
  amountInput: { flex: 1, fontSize: 24, fontWeight: '700', color: C.textHead, padding: 0 },
  maxText: { fontSize: 13, fontWeight: '800', color: C.primary, letterSpacing: 0.5 },
  methodRow: { flexDirection: 'row', gap: 12 },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  methodBtnActive: { borderColor: C.primary, backgroundColor: C.primaryLight },
  methodText: { fontSize: 14, fontWeight: '600', color: C.textMuted },
  methodTextActive: { color: C.primary },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    color: C.textHead,
  },
  submitBtn: {
    marginTop: 32,
    backgroundColor: C.error,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
