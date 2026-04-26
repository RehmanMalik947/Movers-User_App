import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { chatApi } from '../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatListScreen({ navigation }) {
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        setupUser();
        const unsubscribe = navigation.addListener('focus', () => {
             if(userId) loadChats(userId);
        });
        return unsubscribe;
    }, [userId]);

    const setupUser = async () => {
        try {
            const rawUser = await AsyncStorage.getItem('user');
            if (rawUser) {
                const user = JSON.parse(rawUser);
                setUserId(user.id);
                setUserInfo(user);
                loadChats(user.id);
            }
        } catch (error) {
            console.error('Setup user error:', error);
        }
    };

    const loadChats = async (id) => {
        try {
            const response = await chatApi.getMyChats(id);
            setChats(response.data);
        } catch (error) {
            console.error('Chat list load error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToChat = (item) => {
        const isParticipant1 = item.participant1Id === userId;
        const otherId = isParticipant1 ? item.participant2Id : item.participant1Id;
        const otherName = "Participant"; // TODO: In a real app, fetch names from participants if not in chat object

        navigation.navigate('Messaging', {
            chatId: item.id,
            otherId: otherId,
            otherName: otherName, // Simplified
            myId: userId,
            myName: userInfo.name,
            myRole: userInfo.role === 'customer' ? 'User' : userInfo.role === 'driver' ? 'Driver' : 'TruckOwner'
        });
    };

    const renderChatTile = ({ item }) => {
        const isParticipant1 = item.participant1Id === userId;
        const otherName = item.chatType === 'user-driver' 
            ? (isParticipant1 ? 'Driver' : 'Customer')
            : (isParticipant1 ? 'Truck Owner' : 'Driver');

        return (
            <TouchableOpacity style={styles.chatTile} onPress={() => navigateToChat(item)}>
                <View style={styles.avatarContainer}>
                    <Icon name="person" size={30} color="#999" />
                </View>
                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.chatName}>{otherName}</Text>
                        <Text style={styles.chatTime}>
                            {new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage || 'Start a conversation'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#E6A940" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>
            
            {chats.length === 0 ? (
                <View style={styles.emptyState}>
                    <Icon name="chat-bubble-outline" size={80} color="#DDD" />
                    <Text style={styles.emptyText}>No messages yet</Text>
                </View>
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={(item) => item.id}
                    renderItem={renderChatTile}
                    contentContainerStyle={styles.list}
                />
            )}

            <TouchableOpacity 
                style={styles.fab} 
                onPress={() => navigation.navigate('NewChat')}
            >
                <Icon name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2A2A2A',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        paddingBottom: 20,
    },
    chatTile: {
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F9F9F9',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    chatInfo: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    chatName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2A2A2A',
    },
    chatTime: {
        fontSize: 12,
        color: '#999',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#999',
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E6A940',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
});
