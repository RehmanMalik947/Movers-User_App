import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { chatApi } from '../api/apiService';
import socketService from '../utils/SocketService';
import Icon from 'react-native-vector-icons/Ionicons';

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
};

const VoiceMessageBubble = ({ content, mine }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const durationSec = parseInt(content.split(':')[1]) || 5;

  const togglePlay = () => {
    if (isPlaying) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const startTime = Date.now() - (progress * durationSec * 1000);
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / (durationSec * 1000);
        if (elapsed >= 1) {
          setProgress(1);
          setIsPlaying(false);
          clearInterval(intervalRef.current);
        } else {
          setProgress(elapsed);
        }
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatProgressTime = () => {
    const elapsedSec = Math.floor(progress * durationSec);
    return `0:${elapsedSec < 10 ? '0' : ''}${elapsedSec}`;
  };

  return (
    <View style={styles.voiceContainer}>
      <TouchableOpacity onPress={togglePlay} style={[styles.playBtn, { backgroundColor: mine ? 'rgba(255,255,255,0.2)' : 'rgba(34,96,217,0.1)' }]} activeOpacity={0.7}>
        <Icon name={isPlaying ? "pause" : "play"} size={22} color={mine ? "#fff" : C.primaryStandard} />
      </TouchableOpacity>
      <View style={styles.voiceBody}>
        <View style={styles.waveformContainer}>
          {[12, 18, 10, 24, 16, 20, 14, 26, 18, 12, 16, 22, 14, 10, 18, 12].map((height, i) => {
            const barProgress = i / 16;
            const isFilled = progress >= barProgress;
            return (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    height: height,
                    backgroundColor: isFilled
                      ? (mine ? "#fff" : C.primaryStandard)
                      : (mine ? "#ffffff55" : "#cbd5e1"),
                  },
                ]}
              />
            );
          })}
        </View>
        <Text style={[styles.durationText, mine ? styles.textWhiteMuted : { color: C.textMuted }]}>
          {isPlaying ? `${formatProgressTime()} / ${content}` : content}
        </Text>
      </View>
    </View>
  );
};

function formatDateHeader(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

function formatMsgTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { conversationId, otherId, otherName } = route.params;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingText, setTypingText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimer = useRef(null);
  const flatListRef = useRef(null);

  const myRole = user?.role || 'User';
  const myName = user?.name || 'Me';

  const loadMessages = useCallback(async () => {
    try {
      const res = await chatApi.getMessages(conversationId);
      setMessages(res?.data || []);
    } catch (err) {
      console.error('Load messages error:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    const init = async () => {
      await socketService.connect();
      socketService.joinConversation(conversationId);
      await loadMessages();
      socketService.markRead(conversationId, user?.id);
    };
    init();

    return () => {
      socketService.markRead(conversationId, user?.id);
      socketService.leaveConversation(conversationId);
      socketService.removeListener('receive_message');
      socketService.removeListener('display_typing');
      socketService.removeListener('messages_read');
      socketService.removeListener('message_deleted');
    };
  }, [conversationId, loadMessages]);

  useEffect(() => {
    socketService.onReceiveMessage((msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          if (String(msg.senderId) === String(user?.id)) {
            const tempIdx = prev.findIndex(
              (m) => m.id.startsWith('temp-') && String(m.senderId) === String(user?.id) && m.content === msg.content
            );
            if (tempIdx !== -1) {
              const updated = [...prev];
              updated[tempIdx] = { ...msg, status: 'sent' };
              return updated;
            }
          }
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        if (String(msg.senderId) !== String(user?.id)) {
          socketService.markRead(conversationId, user?.id);
        }
      }
    });

    socketService.onTyping(({ senderName, isTyping }) => {
      if (senderName !== myName) {
        setTypingText(isTyping ? `${senderName} is typing...` : '');
      }
    });

    socketService.onMessagesRead(({ readerId }) => {
      if (String(readerId) !== String(user?.id)) {
        setMessages((prev) => prev.map((m) =>
          String(m.senderId) === String(user?.id) && m.status !== 'read' ? { ...m, status: 'read' } : m
        ));
      }
    });

    socketService.onMessageDeleted(({ id }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, content: 'This message was deleted', messageType: 'text' } : m
        )
      );
    });
  }, [conversationId, user, myName]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    recordingTimer.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const cancelRecording = () => {
    if (recordingTimer.current) clearInterval(recordingTimer.current);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const sendVoiceMessage = async () => {
    if (recordingSeconds === 0) {
      cancelRecording();
      return;
    }
    if (recordingTimer.current) clearInterval(recordingTimer.current);
    setIsRecording(false);
    
    const duration = `0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`;
    setRecordingSeconds(0);

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      conversationId,
      senderId: user?.id,
      senderRole: myRole,
      senderName: myName,
      content: duration,
      messageType: 'voice',
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    const sent = socketService.sendMessage({
      conversationId,
      senderId: user?.id,
      senderRole: myRole,
      senderName: myName,
      content: duration,
      messageType: 'voice',
    });

    if (!sent) {
      try {
        await chatApi.getMessages(conversationId);
      } catch (e) {
        console.error('Send fallback error:', e);
      }
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      conversationId,
      senderId: user?.id,
      senderRole: myRole,
      senderName: myName,
      content: text,
      messageType: 'text',
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    const sent = socketService.sendMessage({
      conversationId,
      senderId: user?.id,
      senderRole: myRole,
      senderName: myName,
      content: text,
    });

    if (!sent) {
      try {
        await chatApi.getMessages(conversationId);
      } catch (e) {
        console.error('Send fallback error:', e);
      }
    }
  };

  const handleMessageLongPress = (item) => {
    const mine = isMine(item);
    if (!mine || item.content === 'This message was deleted') return;

    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            socketService.deleteMessage(item.id, conversationId);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === item.id ? { ...m, content: 'This message was deleted', messageType: 'text' } : m
              )
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleInputChange = (val) => {
    setInput(val);
    socketService.emitTyping(conversationId, myName, val.length > 0);
  };

  const isMine = (msg) => String(msg.senderId) === String(user?.id);

  const renderMessage = ({ item, index }) => {
    const mine = isMine(item);
    const isVoice = item.messageType === 'voice';
    const isDeleted = item.content === 'This message was deleted';

    let showDateSeparator = false;
    let dateStr = '';
    
    if (item.createdAt) {
      const currentDate = new Date(item.createdAt);
      if (index === 0) {
        showDateSeparator = true;
      } else {
        const prevMessage = messages[index - 1];
        if (prevMessage?.createdAt) {
          const prevDate = new Date(prevMessage.createdAt);
          if (currentDate.toDateString() !== prevDate.toDateString()) {
            showDateSeparator = true;
          }
        }
      }

      if (showDateSeparator) {
        dateStr = formatDateHeader(currentDate);
      }
    }

    return (
      <View style={styles.messageGroupContainer}>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateSeparatorLine} />
            <Text style={styles.dateSeparatorText}>{dateStr}</Text>
            <View style={styles.dateSeparatorLine} />
          </View>
        )}
        <View style={[styles.msgRow, mine ? styles.msgRowMine : styles.msgRowOther]}>
          <TouchableOpacity
            activeOpacity={mine && !isDeleted ? 0.8 : 1}
            onLongPress={() => handleMessageLongPress(item)}
            delayLongPress={500}
            style={[
              styles.bubble,
              mine ? styles.bubbleMine : styles.bubbleOther,
              isVoice && styles.voiceBubble,
              isDeleted && (mine ? styles.bubbleMineDeleted : styles.bubbleOtherDeleted),
            ]}
          >
            {isDeleted ? (
              <View style={styles.deletedContainer}>
                <Icon name="ban" size={16} color={mine ? 'rgba(255,255,255,0.6)' : C.textMuted} />
                <Text style={[styles.msgTextDeleted, mine ? styles.msgTextMineDeleted : styles.msgTextOtherDeleted]}>
                  This message was deleted
                </Text>
              </View>
            ) : isVoice ? (
              <VoiceMessageBubble content={item.content} mine={mine} />
            ) : (
              <Text style={[styles.msgText, mine ? styles.msgTextMine : styles.msgTextOther]}>{item.content}</Text>
            )}
            <View style={styles.msgMeta}>
              <Text style={[styles.msgTime, mine && styles.msgTimeMine]}>{formatMsgTime(item.createdAt)}</Text>
              {mine && !isDeleted && (
                <Icon
                  name={item.status === 'read' ? 'checkmark-done' : 'checkmark'}
                  size={14}
                  color={item.status === 'read' ? '#fff' : (mine ? '#ffffffcc' : C.textMuted)}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={C.textHead} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherName || 'Chat'}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={C.primaryStandard} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.msgList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
              </View>
            }
          />
        )}

        {typingText ? (
          <Text style={styles.typingText}>{typingText}</Text>
        ) : null}

        {isRecording ? (
          <View style={[styles.inputBar, styles.recordingBar]}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                Recording... 0:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds}
              </Text>
            </View>
            <View style={styles.recordingActions}>
              <TouchableOpacity onPress={cancelRecording} style={styles.cancelBtn}>
                <Icon name="trash" size={20} color={C.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={sendVoiceMessage} style={styles.sendVoiceBtn}>
                <Icon name="checkmark" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={handleInputChange}
              placeholder="Type a message..."
              placeholderTextColor={C.textMuted}
              multiline
              maxLength={1000}
            />
            {input.trim().length > 0 ? (
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={sendMessage}
                activeOpacity={0.8}
              >
                <Icon name="send" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.sendBtn, styles.micBtn]}
                onPress={startRecording}
                activeOpacity={0.8}
              >
                <Icon name="mic" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { marginLeft: 8, flex: 1 },
  headerName: { fontSize: 17, fontWeight: '700', color: C.textHead },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  msgList: { padding: 16, paddingBottom: 8 },
  msgRow: { marginBottom: 12, flexDirection: 'row' },
  msgRowMine: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleMine: {
    backgroundColor: C.primaryStandard,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: C.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  msgText: { fontSize: 15, lineHeight: 20 },
  msgTextMine: { color: '#fff' },
  msgTextOther: { color: C.textBody },
  msgMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 },
  msgTime: { fontSize: 11, color: C.textMuted },
  msgTimeMine: { color: '#ffffffcc' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: C.textMuted, fontSize: 14 },
  typingText: { paddingHorizontal: 20, paddingBottom: 4, fontSize: 12, color: C.textMuted, fontStyle: 'italic' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  input: {
    flex: 1,
    backgroundColor: C.bg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: C.textHead,
    borderWidth: 1,
    borderColor: C.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primaryStandard,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: { backgroundColor: C.border },
  micBtn: {
    backgroundColor: C.primary,
  },
  recordingBar: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FDA4AF',
    borderTopWidth: 1.5,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E11D48',
  },
  recordingText: {
    fontSize: 15,
    color: '#9F1239',
    fontWeight: '600',
  },
  recordingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendVoiceBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 200,
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceBody: {
    flex: 1,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 28,
  },
  waveBar: {
    width: 2.5,
    borderRadius: 1,
  },
  durationText: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  textWhiteMuted: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageGroupContainer: {
    width: '100%',
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '600',
  },
  deletedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  msgTextDeleted: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  msgTextMineDeleted: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  msgTextOtherDeleted: {
    color: C.textMuted,
  },
  bubbleMineDeleted: {
    backgroundColor: 'rgba(34, 96, 217, 0.4)',
    borderBottomRightRadius: 4,
  },
  bubbleOtherDeleted: {
    backgroundColor: C.bg,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
});
