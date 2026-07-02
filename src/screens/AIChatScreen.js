import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { aiApi } from '../api/apiService';

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

export default function AIChatScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      text: "Hello! I'm Movers AI, your virtual assistant. How can I help you with your booking, tracking, or pricing queries today?",
      role: 'model',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const userMsg = {
      id: `user-${Date.now()}`,
      text,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Map history for API
      const history = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await aiApi.chat(text, history);
      const reply = res.reply || res.data?.reply || 'I could not process that request.';

      const botMsg = {
        id: `bot-${Date.now()}`,
        text: reply.trim(),
        role: 'model',
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        text: 'Sorry, I am having trouble connecting right now. Please try again.',
        role: 'model',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowMine : styles.msgRowOther]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Icon name="sparkles" size={14} color="#fff" />
          </View>
        )}
        <View style={[
          styles.bubble,
          isUser ? styles.bubbleMine : styles.bubbleOther
        ]}>
          <Text style={[styles.msgText, isUser ? styles.msgTextMine : styles.msgTextOther]}>
            {item.text}
          </Text>
          <Text style={[styles.msgTime, isUser ? styles.msgTimeMine : styles.msgTimeOther]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={C.textHead} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Movers AI Assistant</Text>
          <View style={styles.onlineIndicatorWrap}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Always Active</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.msgList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {loading && (
          <View style={styles.loadingBubbleRow}>
            <View style={styles.botAvatar}>
              <Icon name="sparkles" size={14} color="#fff" />
            </View>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color={C.primaryStandard} />
            </View>
          </View>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Movers AI..."
            placeholderTextColor={C.textMuted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            <Icon name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitleWrap: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.textHead },
  onlineIndicatorWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.success },
  onlineText: { fontSize: 10, color: C.textMuted, fontWeight: '600' },

  msgList: { padding: 16, paddingBottom: 24 },
  msgRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end', gap: 8 },
  msgRowMine: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },

  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
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
  msgText: { fontSize: 14, lineHeight: 20 },
  msgTextMine: { color: '#fff', fontWeight: '500' },
  msgTextOther: { color: C.textBody },
  msgTime: { fontSize: 9, alignSelf: 'flex-end', marginTop: 4 },
  msgTimeMine: { color: 'rgba(255,255,255,0.7)' },
  msgTimeOther: { color: C.textMuted },

  loadingBubbleRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 16, alignItems: 'center' },
  loadingBubble: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: C.bg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
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
  },
  sendBtnDisabled: {
    backgroundColor: C.border,
  },
});
