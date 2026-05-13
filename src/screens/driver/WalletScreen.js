import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { walletApi } from '../../api/apiService';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

// ─── Premium Design Tokens ──────────────────────────────────────────────────────
const C = {
  primary: '#1847B1',
  primaryDark: '#0E2E7B',
  primaryLight: '#E8EFFD',
  bg: '#F3F4F6',
  surface: '#FFFFFF',
  textHead: '#111827',
  textBody: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  white: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
  jazz: '#CE1212', 
  easy: '#00A950',
};

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function WalletScreen() {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('topup');
    
    // Form States
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('EasyPaisa'); 
    const [mobileNumber, setMobileNumber] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [wRes, hRes] = await Promise.all([
                walletApi.getWallet(),
                walletApi.getHistory()
            ]);
            if (wRes.success) setWallet(wRes.wallet);
            if (hRes.success) setTransactions(hRes.transactions);
        } catch (error) {
            console.error('Wallet fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const handleAction = async () => {
        if (!amount || (activeTab === 'withdraw' && !mobileNumber)) {
            Alert.alert("Missing Information", "Please fill in all required fields to continue.");
            return;
        }

        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid amount greater than 0.");
            return;
        }

        if (activeTab === 'withdraw') {
            if (val > wallet?.balance) {
                Alert.alert("Insufficient Balance", "You don't have enough balance for this withdrawal.");
                return;
            }
            if (val < 500) {
                Alert.alert("Min Withdrawal", "The minimum withdrawal amount is Rs. 500.");
                return;
            }
        }

        setActionLoading(true);
        try {
            let res;
            if (activeTab === 'topup') {
                res = await walletApi.topup({ amount: val, method, transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase() });
            } else {
                res = await walletApi.requestWithdraw({ amount: val, method, mobileNumber });
            }

            if (res.success) {
                Alert.alert("Success", activeTab === 'topup' ? "Your wallet has been recharged!" : "Withdrawal request submitted.");
                setAmount('');
                setMobileNumber('');
                fetchData();
            } else {
                Alert.alert("Error", res.error || "Something went wrong.");
            }
        } catch (error) {
            Alert.alert("Connection Error", "Could not connect to the server.");
        } finally {
            setActionLoading(false);
        }
    };

    const renderTransaction = ({ item }) => (
        <View style={styles.txRow}>
            <View style={[styles.txIcon, { backgroundColor: item.type === 'credit' ? C.success + '15' : C.error + '15' }]}>
                <Icon 
                    name={item.type === 'credit' ? "add-circle-outline" : "remove-circle-outline"} 
                    size={24} 
                    color={item.type === 'credit' ? C.success : C.error} 
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.txDesc} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.txDate}>{new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.txAmount, { color: item.type === 'credit' ? C.success : C.error }]}>
                    {item.type === 'credit' ? '+' : '-'} {parseFloat(item.amount).toLocaleString()}
                </Text>
                <Text style={styles.txStatus}>{item.status.toUpperCase()}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={C.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => fetchData()}>
                    <Icon name="refresh-circle-outline" size={28} color={C.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Wallet</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
            >
                {/* Balance Card - Modern Gradient Look */}
                <View style={styles.balanceCard}>
                    <View style={styles.balHeader}>
                        <Icon name="wallet-outline" size={20} color={C.white + '90'} />
                        <Text style={styles.balLabel}>AVAILABLE BALANCE</Text>
                    </View>
                    <Text style={styles.balValue}>Rs. {parseFloat(wallet?.balance || 0).toLocaleString()}</Text>
                    
                    <View style={styles.cardFooter}>
                        <View style={styles.infoPill}>
                            <Icon name="information-circle" size={14} color={C.white} />
                            <Text style={styles.infoText}>10% commission applies to all jobs</Text>
                        </View>
                    </View>
                </View>

                {/* Tab Switcher - Segmented Control Style */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'topup' && styles.activeTab]}
                        onPress={() => setActiveTab('topup')}
                    >
                        <Icon name="cloud-upload-outline" size={18} color={activeTab === 'topup' ? C.primary : C.textMuted} />
                        <Text style={[styles.tabText, activeTab === 'topup' && styles.activeTabText]}>Top-up</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'withdraw' && styles.activeTab]}
                        onPress={() => setActiveTab('withdraw')}
                    >
                        <Icon name="cloud-download-outline" size={18} color={activeTab === 'withdraw' ? C.primary : C.textMuted} />
                        <Text style={[styles.tabText, activeTab === 'withdraw' && styles.activeTabText]}>Withdraw</Text>
                    </TouchableOpacity>
                </View>

                {/* Form Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{activeTab === 'topup' ? 'Recharge Wallet' : 'Withdraw Funds'}</Text>
                    
                    <View style={styles.methodRow}>
                        <TouchableOpacity 
                            style={[styles.methodBtn, method === 'EasyPaisa' && { borderColor: C.easy, backgroundColor: C.easy + '10' }]}
                            onPress={() => setMethod('EasyPaisa')}
                        >
                            <Icon name="checkmark-circle" size={16} color={method === 'EasyPaisa' ? C.easy : C.border} />
                            <Text style={[styles.methodText, method === 'EasyPaisa' && { color: C.easy }]}>EasyPaisa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.methodBtn, method === 'JazzCash' && { borderColor: C.jazz, backgroundColor: C.jazz + '10' }]}
                            onPress={() => setMethod('JazzCash')}
                        >
                            <Icon name="checkmark-circle" size={16} color={method === 'JazzCash' ? C.jazz : C.border} />
                            <Text style={[styles.methodText, method === 'JazzCash' && { color: C.jazz }]}>JazzCash</Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'topup' && (
                        <View style={styles.quickRow}>
                            {QUICK_AMOUNTS.map(amt => (
                                <TouchableOpacity 
                                    key={amt} 
                                    style={[styles.quickBtn, amount === String(amt) && styles.quickBtnActive]}
                                    onPress={() => setAmount(String(amt))}
                                >
                                    <Text style={[styles.quickText, amount === String(amt) && styles.quickTextActive]}>Rs. {amt}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {activeTab === 'withdraw' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="03xx xxxxxxx"
                                value={mobileNumber}
                                onChangeText={setMobileNumber}
                                keyboardType="phone-pad"
                                placeholderTextColor={C.textMuted}
                            />
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>AMOUNT (PKR)</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="Enter amount"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholderTextColor={C.textMuted}
                        />
                    </View>

                    <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: C.primary }]} 
                        onPress={handleAction}
                        disabled={actionLoading}
                    >
                        {actionLoading ? (
                            <ActivityIndicator color={C.white} />
                        ) : (
                            <>
                                <Text style={styles.actionBtnText}>
                                    {activeTab === 'topup' ? 'Confirm Recharge' : 'Confirm Withdrawal'}
                                </Text>
                                <Icon name="arrow-forward" size={18} color={C.white} style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* History Section */}
                <View style={styles.historyHeader}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <Icon name="time-outline" size={20} color={C.textMuted} />
                </View>
                
                {transactions.length === 0 ? (
                    <View style={styles.empty}>
                        <View style={styles.emptyIcon}>
                            <Icon name="document-text-outline" size={40} color={C.textMuted} />
                        </View>
                        <Text style={styles.emptyText}>No recent transactions found</Text>
                    </View>
                ) : (
                    transactions.map(item => <View key={item.id}>{renderTransaction({ item })}</View>)
                )}
                
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    scroll: { paddingHorizontal: 20, paddingTop: 10 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 15,
        backgroundColor: C.surface
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: C.textHead, letterSpacing: -0.5 },
    
    balanceCard: {
        backgroundColor: C.primary,
        borderRadius: 28,
        padding: 24,
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 12,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: C.white + '20',
    },
    balHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
    balLabel: { color: C.white + '80', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
    balValue: { color: C.white, fontSize: 36, fontWeight: '900', letterSpacing: -1 },
    cardFooter: { marginTop: 15 },
    infoPill: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6, 
        backgroundColor: C.white + '15', 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 20,
        alignSelf: 'flex-start'
    },
    infoText: { color: C.white, fontSize: 11, fontWeight: '600' },

    tabContainer: { 
        flexDirection: 'row', 
        backgroundColor: '#E5E7EB', 
        borderRadius: 16, 
        padding: 4, 
        marginBottom: 25 
    },
    tab: { 
        flex: 1, 
        flexDirection: 'row', 
        paddingVertical: 12, 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderRadius: 12,
        gap: 8
    },
    activeTab: { 
        backgroundColor: C.surface, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 4, 
        elevation: 2 
    },
    tabText: { fontSize: 14, fontWeight: '700', color: C.textMuted },
    activeTabText: { color: C.primary },

    section: { 
        backgroundColor: C.surface, 
        borderRadius: 28, 
        padding: 24, 
        marginBottom: 30,
        borderWidth: 1,
        borderColor: C.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2
    },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: C.textHead, marginBottom: 20 },
    
    methodRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    methodBtn: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingVertical: 14, 
        borderRadius: 16, 
        borderWidth: 1.5, 
        borderColor: C.border,
        gap: 10 
    },
    methodText: { fontWeight: '800', color: C.textBody, fontSize: 13 },

    quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    quickBtn: { 
        paddingHorizontal: 12, 
        paddingVertical: 10, 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: C.border,
        backgroundColor: C.bg
    },
    quickBtnActive: { backgroundColor: C.primaryLight, borderColor: C.primary },
    quickText: { fontSize: 12, fontWeight: '700', color: C.textBody },
    quickTextActive: { color: C.primary },

    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 11, fontWeight: '800', color: C.textMuted, marginBottom: 10, letterSpacing: 1 },
    input: {
        backgroundColor: C.bg,
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 16,
        color: C.textHead,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: C.border
    },
    actionBtn: {
        borderRadius: 18,
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    actionBtnText: { color: C.white, fontSize: 16, fontWeight: '800' },

    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
    txRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.surface,
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: C.border,
        gap: 12
    },
    txIcon: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    txDesc: { fontSize: 14, fontWeight: '700', color: C.textHead },
    txDate: { fontSize: 12, color: C.textMuted, marginTop: 3 },
    txAmount: { fontSize: 16, fontWeight: '900' },
    txStatus: { fontSize: 9, fontWeight: '800', color: C.textMuted, marginTop: 4, letterSpacing: 0.5 },

    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', marginBottom: 15, borderWidth: 1, borderColor: C.border },
    emptyText: { color: C.textMuted, fontSize: 14, fontWeight: '600' }
});
