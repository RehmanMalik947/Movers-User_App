import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { walletApi } from '../api/apiService';

const { width } = Dimensions.get('window');

const C = {
  primary: '#1847B1',
  primaryDark: '#0F3A8A',
  primaryStandard: '#2260D9',
  primaryLight: '#E8EFFD',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  textHead: '#0F172A',
  textBody: '#334155',
  textMuted: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
};

const TX_ICONS = {
  topup: { name: 'add-circle', color: C.success, bg: C.successLight },
  withdrawal: { name: 'cash-outline', color: C.error, bg: C.errorLight },
  commission: { name: 'trending-down', color: C.warning, bg: C.warningLight },
  credit: { name: 'arrow-down-circle', color: C.success, bg: C.successLight },
  debit: { name: 'arrow-up-circle', color: C.error, bg: C.errorLight },
};

function getTxConfig(tx) {
  if (tx.type === 'credit' && tx.description?.toLowerCase().includes('top-up')) return TX_ICONS.topup;
  if (tx.type === 'debit' && tx.description?.toLowerCase().includes('withdrawal')) return TX_ICONS.withdrawal;
  if (tx.type === 'debit' && parseFloat(tx.adminCommission) > 0) return TX_ICONS.commission;
  if (tx.type === 'debit') return TX_ICONS.debit;
  return TX_ICONS.credit;
}

function getTxLabel(tx) {
  if (tx.description?.toLowerCase().includes('top-up')) return 'Top-up';
  if (tx.description?.toLowerCase().includes('withdrawal')) return 'Withdrawal';
  if (parseFloat(tx.adminCommission) > 0) return 'Commission Deducted';
  if (tx.type === 'credit') return 'Earning';
  if (tx.type === 'debit') return 'Payment';
  return tx.description || 'Transaction';
}

function groupTransactions(txns) {
  const groups = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const thisWeek = new Date(today.getTime() - today.getDay() * 86400000);

  txns.forEach((tx) => {
    const d = new Date(tx.createdAt);
    let key;
    if (d >= today) key = 'Today';
    else if (d >= yesterday) key = 'Yesterday';
    else if (d >= thisWeek) key = 'This Week';
    else key = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });
  return groups;
}

function Skeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonCard} />
      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 20 }}>
        <View style={[styles.skeletonBtn, { flex: 1 }]} />
        <View style={[styles.skeletonBtn, { flex: 1 }]} />
      </View>
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <View style={[styles.skeletonLine, { width: 140, marginBottom: 16 }]} />
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.skeletonRow} />
        ))}
      </View>
    </View>
  );
}

export default function WalletScreen({ navigation }) {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadWalletData();
    }, [])
  );

  const loadWalletData = async () => {
    try {
      const [walletRes, txRes] = await Promise.all([
        walletApi.getWallet(),
        walletApi.getHistory(),
      ]);
      if (walletRes.success) setWallet(walletRes.wallet);
      if (txRes.success) setTransactions(txRes.transactions || []);
    } catch (error) {
      console.error('Wallet load error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  const balance = wallet ? parseFloat(wallet.balance) : 0;
  const totalEarned = wallet ? parseFloat(wallet.totalEarned) : 0;
  const totalWithdrawn = wallet ? parseFloat(wallet.totalWithdrawn) : 0;

  const groupedTxns = useMemo(() => groupTransactions(transactions), [transactions]);
  const sectionKeys = Object.keys(groupedTxns);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const renderTransaction = ({ item }) => {
    const cfg = getTxConfig(item);
    return (
      <View style={styles.txItem}>
        <View style={[styles.txIconBg, { backgroundColor: cfg.bg }]}>
          <Icon name={cfg.name} size={20} color={cfg.color} />
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txDesc}>{getTxLabel(item)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.txDate}>{formatDate(item.createdAt)}</Text>
            {item.status === 'pending' && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            )}
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.txAmount, { color: cfg.color }]}>
            {item.type === 'credit' ? '+' : '-'}Rs. {parseFloat(item.amount).toLocaleString()}
          </Text>
          {parseFloat(item.adminCommission) > 0 && (
            <Text style={styles.commissionText}>Commission: Rs. {parseFloat(item.adminCommission).toLocaleString()}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderSectionHeader = (sectionKey) => (
    <Text key={sectionKey} style={styles.sectionHeader}>{sectionKey}</Text>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Wallet</Text>
          </View>
          <Skeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Wallet</Text>
            <Text style={styles.headerSub}>Manage your earnings</Text>
          </View>
          <TouchableOpacity style={styles.historyIcon} onPress={() => {}}>
            <Icon name="receipt-outline" size={22} color={C.primaryStandard} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primaryStandard]} tintColor={C.primaryStandard} />}
          ListHeaderComponent={() => (
            <>
              {/* Balance Card */}
              <View style={styles.balanceCard}>
                <View style={styles.balanceTop}>
                  <View>
                    <Text style={styles.balanceLabel}>Current Balance</Text>
                    <Text style={styles.balanceAmount}>Rs. {balance.toLocaleString()}</Text>
                  </View>
                  <View style={styles.balanceChip}>
                    <View style={styles.chipDot} />
                    <Text style={styles.chipText}>Active</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.balanceStats}>
                  <View style={styles.statBox}>
                    <View style={styles.statIconRow}>
                      <Icon name="arrow-down-circle" size={14} color={C.success} />
                      <Text style={[styles.statValue, { color: C.success }]}>Rs. {totalEarned.toLocaleString()}</Text>
                    </View>
                    <Text style={styles.statLabel}>Total Earned</Text>
                  </View>
                  <View style={styles.statVr} />
                  <View style={styles.statBox}>
                    <View style={styles.statIconRow}>
                      <Icon name="arrow-up-circle" size={14} color={C.error} />
                      <Text style={[styles.statValue, { color: C.error }]}>Rs. {totalWithdrawn.toLocaleString()}</Text>
                    </View>
                    <Text style={styles.statLabel}>Total Withdrawn</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('TopUp')} activeOpacity={0.85}>
                  <View style={[styles.actionIconBg, { backgroundColor: C.successLight }]}>
                    <Icon name="add-circle" size={28} color={C.success} />
                  </View>
                  <Text style={styles.actionLabel}>Top Up</Text>
                  <Text style={styles.actionDesc}>Add funds to wallet</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Withdraw', { balance })} activeOpacity={0.85}>
                  <View style={[styles.actionIconBg, { backgroundColor: C.errorLight }]}>
                    <Icon name="cash-outline" size={28} color={C.error} />
                  </View>
                  <Text style={styles.actionLabel}>Withdraw</Text>
                  <Text style={styles.actionDesc}>Transfer to your account</Text>
                </TouchableOpacity>
              </View>

              {/* Transactions Header */}
              <View style={styles.txSectionHeader}>
                <Text style={styles.txSectionTitle}>Transaction History</Text>
                <Text style={styles.txCount}>{transactions.length} entries</Text>
              </View>

              {sectionKeys.length === 0 && (
                <View style={styles.emptyTx}>
                  <View style={styles.emptyIconBg}>
                    <Icon name="receipt-outline" size={44} color={C.primaryStandard} />
                  </View>
                  <Text style={styles.emptyTitle}>No Transactions</Text>
                  <Text style={styles.emptySub}>Your transaction history will appear here</Text>
                </View>
              )}
            </>
          )}
          stickyHeaderIndices={[]}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={() => sectionKeys.length > 0 && <View style={{ height: 24 }} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.textHead, letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: C.textMuted, marginTop: 2, fontWeight: '500' },
  historyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Balance Card
  balanceCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 24,
    padding: 24,
    backgroundColor: C.primaryDark,
    shadowColor: C.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500', letterSpacing: 0.3, marginBottom: 4 },
  balanceAmount: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: -1.5 },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.success },
  chipText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 20 },
  balanceStats: { flexDirection: 'row' },
  statBox: { flex: 1 },
  statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500', letterSpacing: 0.2 },
  statVr: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 16 },

  // Action Buttons
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionLabel: { fontSize: 15, fontWeight: '700', color: C.textHead, marginBottom: 3 },
  actionDesc: { fontSize: 10, color: C.textMuted, fontWeight: '500', textAlign: 'center' },

  // Transactions
  txSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 28,
    marginBottom: 14,
  },
  txSectionTitle: { fontSize: 17, fontWeight: '700', color: C.textHead, letterSpacing: -0.3 },
  txCount: { fontSize: 12, color: C.textMuted, fontWeight: '500' },
  listContent: { paddingBottom: 24 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textMuted,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  txIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: '600', color: C.textHead, marginBottom: 3 },
  txDate: { fontSize: 11, color: C.textMuted, fontWeight: '500' },
  txAmount: { fontSize: 15, fontWeight: '700' },
  commissionText: { fontSize: 10, color: C.textMuted, marginTop: 2, fontWeight: '500' },
  pendingBadge: {
    backgroundColor: C.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingText: { fontSize: 9, fontWeight: '700', color: C.warning },

  // Empty State
  emptyTx: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 40 },
  emptyIconBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.textHead, marginBottom: 6 },
  emptySub: { fontSize: 13, color: C.textMuted, textAlign: 'center', lineHeight: 18 },

  // Skeleton
  skeletonContainer: { paddingTop: 20 },
  skeletonCard: {
    marginHorizontal: 16,
    height: 180,
    borderRadius: 24,
    backgroundColor: C.border,
    opacity: 0.5,
  },
  skeletonBtn: { height: 100, borderRadius: 18, backgroundColor: C.border, opacity: 0.4 },
  skeletonLine: { height: 18, borderRadius: 9, backgroundColor: C.border, opacity: 0.4 },
  skeletonRow: {
    height: 68,
    borderRadius: 16,
    backgroundColor: C.border,
    opacity: 0.3,
    marginBottom: 8,
  },
});
