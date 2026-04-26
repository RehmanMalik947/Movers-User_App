import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { chatApi } from '../api/apiService';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

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
        <TouchableOpacity style={styles.partnerTile} onPress={() => handleSelectPartner(item)}>
            <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.partnerInfo}>
                <Text style={styles.partnerName}>{item.name}</Text>
                <Text style={styles.partnerRole}>{item.type.toUpperCase()}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select User</Text>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : partners.length === 0 ? (
                <View style={styles.emptyState}>
                    <Icon name="people-outline" size={80} color="#DDD" />
                    <Text style={styles.emptyText}>No available users to chat with.</Text>
                    <Text style={styles.emptySub}>
                        {currentUser.role === 'customer' ? 'Drivers will appear here once assigned to your jobs.' : 'Add drivers to your profile to chat with them.'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={partners}
                    keyExtractor={(item) => `${item.id}-${item.type}`}
                    renderItem={renderPartner}
                    contentContainerStyle={styles.list}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    headerTitle: { fontSize: 20, fontWeight: '700', marginLeft: 16, color: '#333' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { paddingBottom: 20 },
    partnerTile: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F9F9F9', alignItems: 'center' },
    avatarContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    partnerInfo: { flex: 1 },
    partnerName: { fontSize: 16, fontWeight: '600', color: '#333' },
    partnerRole: { fontSize: 11, color: '#999', marginTop: 2, fontWeight: '700' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { marginTop: 10, fontSize: 16, color: '#666', fontWeight: '600' },
    emptySub: { marginTop: 5, fontSize: 14, color: '#999', textAlign: 'center' },
});
