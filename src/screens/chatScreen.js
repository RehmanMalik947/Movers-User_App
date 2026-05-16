import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
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
  }, [conversationId, user, myName]);

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

  const handleInputChange = (val) => {
    setInput(val);
    socketService.emitTyping(conversationId, myName, val.length > 0);
  };

  const isMine = (msg) => String(msg.senderId) === String(user?.id);

  const renderMessage = ({ item }) => {
    const mine = isMine(item);
    return (
      <View style={[styles.msgRow, mine ? styles.msgRowMine : styles.msgRowOther]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
          <Text style={[styles.msgText, mine ? styles.msgTextMine : styles.msgTextOther]}>{item.content}</Text>
          <View style={styles.msgMeta}>
            <Text style={[styles.msgTime, mine && styles.msgTimeMine]}>{formatMsgTime(item.createdAt)}</Text>
            {mine && (
              <Icon
                name={item.status === 'read' ? 'checkmark-done' : 'checkmark'}
                size={14}
                color={item.status === 'read' ? '#fff' : (mine ? '#ffffffcc' : C.textMuted)}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
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
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim()}
            activeOpacity={0.8}
          >
            <Icon name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
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
});
