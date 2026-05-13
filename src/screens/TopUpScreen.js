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

const PAYMENT_METHODS = [
  { id: 'EasyPaisa', label: 'EasyPaisa', icon: 'phone-portrait-outline' },
  { id: 'JazzCash', label: 'JazzCash', icon: 'phone-portrait-outline' },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function TopUpScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('EasyPaisa');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTopUp = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!mobileNumber || mobileNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await walletApi.topup({
        amount: numAmount,
        method: selectedMethod,
        transactionId: `TXN${Date.now()}`,
      });
      if (res.success) {
        Alert.alert('Success', `Rs. ${numAmount.toLocaleString()} added successfully!`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Top-up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color={C.textHead} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Top Up Wallet</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Amount Input */}
          <Text style={styles.label}>Enter Amount (PKR)</Text>
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
          </View>

          {/* Quick Amounts */}
          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[styles.quickBtn, parseFloat(amount) === amt && styles.quickBtnActive]}
                onPress={() => setAmount(amt.toString())}
              >
                <Text style={[styles.quickBtnText, parseFloat(amount) === amt && styles.quickBtnTextActive]}>Rs. {amt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Method */}
          <Text style={[styles.label, { marginTop: 24 }]}>Payment Method</Text>
          <View style={styles.methodRow}>
            {PAYMENT_METHODS.map((method) => (
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
          <Text style={[styles.label, { marginTop: 24 }]}>Account Mobile Number</Text>
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
            onPress={handleTopUp}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Add Funds</Text>
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
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  quickBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  quickBtnActive: { borderColor: C.primary, backgroundColor: C.primaryLight },
  quickBtnText: { fontSize: 12, fontWeight: '600', color: C.textBody },
  quickBtnTextActive: { color: C.primary },
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
    backgroundColor: C.primary,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
