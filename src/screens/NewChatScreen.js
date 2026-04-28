import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { chatApi } from '../api/apiService';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

// ─── Design Tokens - Matching Login Screen ─────────────────────────────────────────
const C = {
  primary: '#1847B1',        // Deep navy blue
  primaryStandard: '#2260D9', // Standard primary blue
  primaryLight: '#E8EFFD',    // Light blue tint
  bg: '#F8FAFC',              // Cool Gray Background
  surface: '#FFFFFF',         // White
  surfaceAlt: '#F8FAFC',      // Light background
  textHead: '#0F172A',        // Dark text
  textBody: '#334155',        // Body text
  textMuted: '#64748B',       // Muted text
  textLink: '#2260D9',        // Standard blue for links
  border: '#E2E8F0',          // Border color
  divider: '#E2E8F0',         // Divider color
  white: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
};

export default function NewChatScreen({ navigation }) {
    const [partners, setPartners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        loadPartners();
    }, []);

    const loadPartners = async () => {
        try {
            const role = currentUser.role === 'customer' ? 'User' : currentUser.role === 'driver' ? 'Driver' : 'TruckOwner';
            const response = await chatApi.getAvailablePartners(currentUser.id, role);
            setPartners(response.data || []);
        } catch (error) {
            console.error('Partners load error:', error);
            Alert.alert('Error', 'Could not load available contacts.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPartner = async (partner) => {
        try {
            const myRole = currentUser.role === 'customer' ? 'User' : currentUser.role === 'driver' ? 'Driver' : 'TruckOwner';
            const chatRes = await chatApi.startChat(currentUser.id, partner.id, partner.chatType);
            
            if (chatRes.success) {
                navigation.replace('Messaging', {
                    chatId: chatRes.data.id,
                    otherId: partner.id,
                    otherName: partner.name,
                    myId: currentUser.id,
                    myName: currentUser.name,
                    myRole: myRole
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Could not start chat');
        }
    };

    const renderPartner = ({ item }) => (
        <TouchableOpacity 
            style={styles.partnerTile} 
            onPress={() => handleSelectPartner(item)}
            activeOpacity={0.7}
        >
            <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.partnerInfo}>
                <Text style={styles.partnerName}>{item.name}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.partnerRole}>{item.type.toUpperCase()}</Text>
                </View>
            </View>
            <Icon name="chevron-forward" size={18} color={C.textMuted} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Icon name="arrow-back" size={24} color={C.textHead} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Select User</Text>
                    <View style={{ width: 40 }} />
                </View>

                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={C.primaryStandard} />
                        <Text style={styles.loadingText}>Fetching available contacts...</Text>
                    </View>
                ) : partners.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBg}>
                            <Icon name="people-outline" size={50} color={C.primaryStandard} />
                        </View>
                        <Text style={styles.emptyText}>No users available</Text>
                        <Text style={styles.emptySub}>
                            {currentUser.role === 'customer' 
                                ? 'Drivers will appear here once assigned to your jobs.' 
                                : 'Add drivers to your profile to chat with them.'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={partners}
                        keyExtractor={(item) => `${item.id}-${item.type}`}
                        renderItem={renderPartner}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />
                )}
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
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: C.textHead, letterSpacing: -0.3 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    loadingText: { fontSize: 14, color: C.textMuted },
    list: { padding: 16, paddingBottom: 40 },
    partnerTile: { 
        flexDirection: 'row', 
        padding: 16, 
        backgroundColor: C.surface,
        borderRadius: 18,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: C.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarContainer: { 
        width: 48, 
        height: 48, 
        borderRadius: 16, 
        backgroundColor: C.primaryLight, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 14 
    },
    avatarText: { color: C.primaryStandard, fontSize: 18, fontWeight: '700' },
    partnerInfo: { flex: 1 },
    partnerName: { fontSize: 16, fontWeight: '700', color: C.textHead },
    roleBadge: {
        backgroundColor: C.bg,
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: 4,
    },
    partnerRole: { fontSize: 10, color: C.textMuted, fontWeight: '800', letterSpacing: 0.5 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: C.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyText: { fontSize: 18, color: C.textHead, fontWeight: '700', marginBottom: 8 },
    emptySub: { fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 20 },
});
