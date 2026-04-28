import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, PermissionsAndroid, KeyboardAvoidingView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GiftedChat, Bubble, InputToolbar, Send, MessageText } from 'react-native-gifted-chat';
import { useRoute, useNavigation } from '@react-navigation/native';
import { chatApi } from '../api/apiService';
import Icon from 'react-native-vector-icons/Ionicons';
import socketService from '../utils/SocketService';
import { API_BASE_URL } from '../config/api';

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

// Audio recording is disabled for now as the package is not installed.
const audioRecorderPlayer = null;

export default function MessagingScreen({ route, navigation }) {
    const { chatId, otherId, otherName, myId, myName, myRole } = route.params;
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordTime, setRecordTime] = useState('00:00');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        navigation.setOptions({ 
            title: otherName,
            headerStyle: { backgroundColor: C.surface },
            headerTintColor: C.textHead,
            headerTitleStyle: { fontWeight: '700' },
        });
        loadChatHistory();
        
        socketService.connect();
        socketService.joinRoom(chatId);

        socketService.onReceiveMessage((newMessage) => {
            const formattedMsg = formatMessageForGiftedChat(newMessage);
            setMessages(previousMessages => GiftedChat.append(previousMessages, formattedMsg));
        });

        socketService.onTyping((data) => {
            setIsTyping(data.isTyping);
        });

        socketService.onMessagesRead((data) => {
            setMessages(prev => prev.map(m => ({ ...m, received: true, pending: false })));
        });

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
            senderType: myRole,
            content: msg.text,
            messageType: 'text',
        };
        socketService.sendMessage(messageData);
    }, []);

    const startRecording = async () => {
        if (Platform.OS === 'android') {
            const grants = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            ]);
            if (grants['android.permission.RECORD_AUDIO'] !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert('Permission Denied', 'Microphone permission is required.');
                return;
            }
        }

        setIsRecording(true);
        await audioRecorderPlayer.startRecorder();
        audioRecorderPlayer.addRecordBackListener((e) => {
            setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
        });
    };

    const stopRecording = async () => {
        setIsRecording(false);
        const result = await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
        setRecordTime('00:00');

        if (!result) return;

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
                    voiceDuration: 0,
                });
            }
        } catch (error) {
            console.error('Voice upload error:', error);
        }
    };

    const renderBubble = (props) => (
        <Bubble
            {...props}
            wrapperStyle={{
                right: { backgroundColor: C.primary, borderRadius: 18, borderBottomRightRadius: 4, padding: 4 },
                left: { backgroundColor: C.white, borderRadius: 18, borderBottomLeftRadius: 4, padding: 4 },
            }}
            textStyle={{
                right: { color: C.white, fontSize: 15, lineHeight: 20 },
                left: { color: C.textHead, fontSize: 15, lineHeight: 20 },
            }}
            renderTicks={(msg) => (
                msg.received && <Icon name="checkmark-done" size={14} color={C.primaryLight} style={{ marginRight: 8, marginBottom: 4 }} />
            )}
        />
    );

    const renderMessageAudio = (props) => {
        const { currentMessage } = props;
        const isMe = currentMessage.user._id === myId;
        return (
            <View style={[styles.audioContainer, isMe && styles.audioContainerMe]}>
                <TouchableOpacity onPress={() => audioRecorderPlayer.startPlayer(currentMessage.audio)}>
                    <View style={[styles.playIconBg, isMe ? { backgroundColor: C.white + '30' } : { backgroundColor: C.primaryLight }]}>
                        <Icon name="play" size={20} color={isMe ? C.white : C.primaryStandard} />
                    </View>
                </TouchableOpacity>
                <View style={styles.audioWaveform}>
                    <View style={[styles.waveBar, { height: 12, backgroundColor: isMe ? C.white : C.primaryStandard }]} />
                    <View style={[styles.waveBar, { height: 20, backgroundColor: isMe ? C.white : C.primaryStandard }]} />
                    <View style={[styles.waveBar, { height: 16, backgroundColor: isMe ? C.white : C.primaryStandard }]} />
                    <View style={[styles.waveBar, { height: 24, backgroundColor: isMe ? C.white : C.primaryStandard }]} />
                    <View style={[styles.waveBar, { height: 18, backgroundColor: isMe ? C.white : C.primaryStandard }]} />
                </View>
                <Text style={[styles.audioText, { color: isMe ? C.white : C.textMuted }]}>Voice Note</Text>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={C.primaryStandard} />
                <Text style={styles.loadingText}>Loading conversation...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={styles.container}
        >
            <GiftedChat
                messages={messages}
                onSend={onSend}
                user={{ _id: myId }}
                renderBubble={renderBubble}
                renderMessageAudio={renderMessageAudio}
                isTyping={isTyping}
                renderTime={() => null} // We'll use custom time if needed
                renderAvatar={null}
                alwaysShowSend
                renderSend={(props) => (
                    <Send {...props} containerStyle={styles.sendContainer}>
                        <View style={styles.sendBtn}>
                            <Icon name="send" size={18} color={C.white} />
                        </View>
                    </Send>
                )}
                renderInputToolbar={(props) => (
                    <InputToolbar 
                        {...props} 
                        containerStyle={styles.inputToolbar}
                        primaryStyle={styles.inputPrimary}
                        /* renderAccessory={() => (
                            <TouchableOpacity 
                                onPress={isRecording ? stopRecording : startRecording}
                                style={[styles.recordButton, isRecording && styles.recordingActive]}
                                activeOpacity={0.7}
                            >
                                <Icon name={isRecording ? 'stop-circle' : 'mic'} size={24} color={isRecording ? C.error : C.textMuted} />
                                {isRecording && <Text style={styles.recordTimer}>{recordTime}</Text>}
                            </TouchableOpacity>
                        )} */
                    />
                )}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: C.textMuted,
    },
    audioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        minWidth: 180,
        gap: 10,
    },
    audioContainerMe: {
        justifyContent: 'flex-end',
    },
    playIconBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    audioWaveform: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        flex: 1,
    },
    waveBar: {
        width: 3,
        borderRadius: 1.5,
        opacity: 0.6,
    },
    audioText: {
        fontSize: 11,
        fontWeight: '600',
    },
    inputToolbar: {
        backgroundColor: C.surface,
        borderTopWidth: 1,
        borderTopColor: C.border,
        paddingTop: 4,
    },
    inputPrimary: {
        alignItems: 'center',
    },
    sendContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    sendBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: C.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 44,
        gap: 8,
    },
    recordingActive: {
        backgroundColor: C.error + '15',
        borderRadius: 22,
        marginHorizontal: 10,
    },
    recordTimer: {
        color: C.error,
        fontWeight: '700',
        fontSize: 14,
    },
});
