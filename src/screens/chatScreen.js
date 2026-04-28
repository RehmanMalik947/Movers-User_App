import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { chatApi } from '../api/apiService';

const { width } = Dimensions.get('window');

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
  warning: '#F59E0B',
};

export default function ChatScreen({ navigation }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hello! I am your MoversApp AI Assistant. How can I help you with your moving or trucking needs today?",
      fromUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Convert current messages into Gemini history format
  const buildHistory = (msgs) => {
    return msgs.map(m => ({
      role: m.fromUser ? 'user' : 'model',
      text: m.text,
    })).slice(-10);
  };

  const sendMessage = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      fromUser: true,
      timestamp: new Date(),
    };

    const currentHistory = buildHistory(messages);
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatApi.askAi(currentInput, currentHistory);
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.reply || "I'm sorry, I couldn't process that. Please try again.",
        fromUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Error: Could not connect to AI service. Please check your internet or try again later.",
        fromUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  const renderMessage = ({ item }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View
        style={[
          styles.messageWrapper,
          item.fromUser ? styles.userWrapper : styles.botWrapper,
        ]}
      >
        {!item.fromUser && (
          <View style={styles.botAvatar}>
            <Icon name="planet-outline" size={22} color={C.primaryStandard} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            item.fromUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          <Text style={[styles.messageText, item.fromUser && styles.userMessageText]}>
            {item.text}
          </Text>
          <Text style={[styles.timestamp, item.fromUser && styles.userTimestamp]}>
            {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color={C.textHead} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Icon name="planet-outline" size={22} color={C.primaryStandard} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Movers AI Assistant</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>Online • Ready to help</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
          <Icon name="ellipsis-vertical" size={20} color={C.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={renderMessage}
        showsVerticalScrollIndicator={false}
      />

      {/* Typing Indicator */}
      {isLoading && (
        <View style={styles.typingContainer}>
          <View style={styles.typingBubble}>
            <View style={styles.typingDot} />
            <View style={[styles.typingDot, styles.typingDotDelay]} />
            <View style={[styles.typingDot, styles.typingDotDelayLong]} />
            <Text style={styles.typingText}>AI is thinking</Text>
          </View>
        </View>
      )}

      {/* Input Box */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
              <Icon name="add-outline" size={24} color={C.textMuted} />
            </TouchableOpacity>
            
            <TextInput
              placeholder="Ask anything about moving..."
              placeholderTextColor={C.textMuted}
              value={inputText}
              onChangeText={setInputText}
              style={styles.input}
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity 
              onPress={sendMessage} 
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.8}
            >
              <Icon name="send" size={18} color={C.white} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.inputHint}>
            Powered by AI • Get instant help with your moving needs
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.textHead,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: C.textMuted,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Message List
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
    maxWidth: width - 100,
  },
  userWrapper: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  botWrapper: {
    alignSelf: 'flex-start',
  },
  botAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 6,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: C.primary,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: C.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: C.textBody,
  },
  userMessageText: {
    color: C.white,
  },
  timestamp: {
    fontSize: 10,
    color: C.textMuted,
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },

  // Typing Indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.primaryStandard,
    opacity: 0.4,
  },
  typingDotDelay: {
    opacity: 0.6,
  },
  typingDotDelayLong: {
    opacity: 0.8,
  },
  typingText: {
    fontSize: 12,
    color: C.textMuted,
    marginLeft: 8,
    fontStyle: 'italic',
  },

  // Input Area
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: C.bg,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.textHead,
    maxHeight: 100,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: C.textMuted,
    shadowOpacity: 0,
  },
  inputHint: {
    fontSize: 10,
    color: C.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});