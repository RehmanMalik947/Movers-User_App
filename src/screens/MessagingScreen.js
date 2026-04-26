import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert, PermissionsAndroid, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, Send, InputToolbar } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AudioRecorderPlayer from 'react-native-nitro-sound';
import socketService from '../utils/SocketService';
import { chatApi } from '../api/apiService';
import { API_BASE_URL } from '../config/api';

const audioRecorderPlayer = AudioRecorderPlayer;

export default function MessagingScreen({ route, navigation }) {
    const { chatId, otherId, otherName, myId, myName, myRole } = route.params;
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordTime, setRecordTime] = useState('00:00');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        navigation.setOptions({ title: otherName });
        loadChatHistory();
        
        socketService.connect();
        socketService.joinRoom(chatId);

        socketService.onReceiveMessage((newMessage) => {
            const formattedMsg = formatMessageForGiftedChat(newMessage);
            setMessages(previousMessages => GiftedChat.append(previousMessages, formattedMsg));
        });

        socketService.onTyping((data) => {
            if (data.isTyping) {
                setIsTyping(true);
            } else {
                setIsTyping(false);
            }
        });

        socketService.onMessagesRead((data) => {
            // Update messages status locally
            setMessages(prev => prev.map(m => ({ ...m, received: true, pending: false })));
        });

        // Mark as read when entering
        socketService.markRead(chatId, myId);

        return () => {
            socketService.leaveRoom(chatId);
            socketService.removeListener('receive_message');
            socketService.removeListener('display_typing');
            socketService.removeListener('messages_read');
        };
    }, []);

    const loadChatHistory = async () => {
        try {
            const response = await chatApi.getHistory(chatId);
            const history = response.data.map(formatMessageForGiftedChat);
            setMessages(history.reverse());
        } catch (error) {
            console.error('History load error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatMessageForGiftedChat = (msg) => {
        const isMe = msg.senderId === myId;
        return {
            _id: msg.id,
            text: msg.messageType === 'text' ? msg.content : '',
            createdAt: new Date(msg.createdAt),
            user: {
                _id: msg.senderId,
                name: isMe ? myName : otherName,
            },
            audio: msg.messageType === 'voice' ? `${API_BASE_URL.replace('/api/', '')}${msg.voiceUrl}` : null,
            received: msg.status === 'read' || msg.status === 'delivered',
            sent: true,
        };
    };

    const onSend = useCallback((newMsgs = []) => {
        const msg = newMsgs[0];
        const messageData = {
            chatId,
            senderId: myId,
            senderType: myRole, // 'User', 'Driver', or 'TruckOwner'
            content: msg.text,
            messageType: 'text',
        };

        socketService.sendMessage(messageData);
        // We don't append manually here because receive_message will handle it for both sender and receiver
        // But if you want instant feedback, you can append it and filter it out when socket returns.
        // For simplicity, let's let socket handle the broadcast.
    }, []);

    // --- Voice Note Logic ---

    const startRecording = async () => {
        if (Platform.OS === 'android') {
            const grants = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            ]);
            if (grants['android.permission.RECORD_AUDIO'] !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert('Permission Denied', 'Microphone permission is required to send voice notes.');
                return;
            }
        }

        setIsRecording(true);
        const result = await audioRecorderPlayer.startRecorder();
        audioRecorderPlayer.addRecordBackListener((e) => {
            setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
        });
        console.log('Recording started:', result);
    };

    const stopRecording = async () => {
        setIsRecording(false);
        const result = await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
        setRecordTime('00:00');

        if (!result) return;

        // Upload and Send
        try {
            const formData = new FormData();
            formData.append('voice', {
                uri: Platform.OS === 'ios' ? result.replace('file://', '') : result,
                type: 'audio/m4a',
                name: 'voice.m4a',
            });

            const uploadRes = await chatApi.uploadVoice(formData);
            if (uploadRes.success) {
                socketService.sendMessage({
                    chatId,
                    senderId: myId,
                    senderType: myRole,
                    messageType: 'voice',
                    voiceUrl: uploadRes.voiceUrl,
                    voiceDuration: 0, // TODO: calculate duration properly
                });
            }
        } catch (error) {
            console.error('Voice upload error:', error);
            Alert.alert('Error', 'Failed to upload voice note.');
        }
    };

    // --- Custom Renderers ---

    const renderBubble = (props) => (
        <Bubble
            {...props}
            wrapperStyle={{
                right: { backgroundColor: '#E6A940' },
                left: { backgroundColor: '#fff' },
            }}
            textStyle={{
                right: { color: '#fff' },
                left: { color: '#2A2A2A' },
            }}
            renderTicks={(msg) => (
                msg.received && <Icon name="done-all" size={12} color="#4FC3F7" style={{ marginLeft: 5 }} />
            )}
        />
    );

    const renderMessageAudio = (props) => {
        const { currentMessage } = props;
        return (
            <View style={styles.audioContainer}>
                <TouchableOpacity onPress={() => playAudio(currentMessage.audio)}>
                    <Icon name="play-arrow" size={24} color={currentMessage.user._id === myId ? '#fff' : '#E6A940'} />
                </TouchableOpacity>
                <Text style={[styles.audioText, currentMessage.user._id === myId && { color: '#fff' }]}>Voice Note</Text>
            </View>
        );
    };

    const playAudio = async (url) => {
        await audioRecorderPlayer.startPlayer(url);
    };

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#E6A940" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            style={styles.container}
        >
            <GiftedChat
                messages={messages}
                onSend={onSend}
                user={{ _id: myId }}
                renderBubble={renderBubble}
                renderMessageAudio={renderMessageAudio}
                isTyping={isTyping}
                renderInputToolbar={(props) => (
                    <InputToolbar 
                        {...props} 
                        containerStyle={styles.inputToolbar}
                        renderAccessory={() => (
                            <TouchableOpacity 
                                onPress={isRecording ? stopRecording : startRecording}
                                style={[styles.recordButton, isRecording && styles.recordingActive]}
                            >
                                <Icon name={isRecording ? 'stop' : 'mic'} size={24} color={isRecording ? 'red' : '#666'} />
                                {isRecording && <Text style={styles.recordTimer}>{recordTime}</Text>}
                            </TouchableOpacity>
                        )}
                    />
                )}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    audioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        minWidth: 150,
    },
    audioText: {
        marginLeft: 10,
        fontSize: 14,
    },
    inputToolbar: {
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingHorizontal: 5,
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 44,
    },
    recordingActive: {
        backgroundColor: '#FFE5E5',
        borderRadius: 22,
    },
    recordTimer: {
        marginLeft: 5,
        color: 'red',
        fontWeight: 'bold',
    },
});
