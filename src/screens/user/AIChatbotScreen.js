import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { chatApi } from '../../api/apiService';

// ─── Design Tokens ───────────────────────────────────────────────────────────────
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
  white: '#FFFFFF',
  error: '#EF4444',
  success: '#10B981',
};

const AIChatbotScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([
        { id: '1', text: "Hello! I am your AI Assistant for Movers App. How can I help you today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userText = input.trim();
        const userMessage = { id: Date.now().toString(), text: userText, sender: 'user' };
        
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await chatApi.askAi(userText);
            if (response.success) {
                const aiMessage = { id: (Date.now() + 1).toString(), text: response.reply, sender: 'ai' };
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error("AI Chat Error:", error);
            const errorMessage = { id: (Date.now() + 1).toString(), text: "Sorry, I am having trouble connecting right now. Please try again later.", sender: 'error' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isUser = item.sender === 'user';
        const isError = item.sender === 'error';

        return (
            <View style={[styles.messageRow, isUser ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
                {!isUser && (
                    <View style={styles.aiAvatar}>
                        <Icon name="sparkles" size={12} color={C.white} />
                    </View>
                )}
                <View style={[
                    styles.messageBubble, 
                    isUser ? styles.userBubble : styles.aiBubble, 
                    isError && styles.errorBubble
                ]}>
                    <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText, isError && styles.errorText]}>
                        {item.text}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color={C.textHead} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>AI Assistant</Text>
                    <View style={styles.onlineBadge}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineText}>Always Active</Text>
                    </View>
                </View>
            </View>

            <Animated.View style={[styles.chatBody, { opacity: fadeAnim }]}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                />

                {loading && (
                    <View style={styles.loadingContainer}>
                        <View style={styles.aiBubble}>
                            <ActivityIndicator size="small" color={C.primaryStandard} />
                        </View>
                    </View>
                )}
            </Animated.View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type your question..."
                            placeholderTextColor={C.textMuted}
                            value={input}
                            onChangeText={setInput}
                            multiline
                        />
                        <TouchableOpacity 
                            style={[styles.sendButton, (!input.trim() || loading) && styles.disabledBtn]} 
                            onPress={sendMessage} 
                            disabled={loading || !input.trim()}
                        >
                            <Icon name="send" size={20} color={C.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 12, 
        backgroundColor: C.surface,
        borderBottomWidth: 1,
        borderBottomColor: C.border 
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: C.textHead },
    onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.success },
    onlineText: { fontSize: 11, color: C.textMuted, fontWeight: '600' },

    chatBody: { flex: 1 },
    listContent: { padding: 20, paddingBottom: 30 },
    messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16, gap: 8 },
    aiAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.primaryStandard, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 20 },
    userBubble: { backgroundColor: C.primary, borderBottomRightRadius: 4 },
    aiBubble: { backgroundColor: C.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: C.border },
    errorBubble: { alignSelf: 'center', backgroundColor: C.error + '10', borderWidth: 1, borderColor: C.error + '30' },
    messageText: { fontSize: 15, lineHeight: 22 },
    userText: { color: C.white, fontWeight: '500' },
    aiText: { color: C.textBody, fontWeight: '500' },
    errorText: { color: C.error, fontSize: 13, textAlign: 'center' },

    loadingContainer: { paddingHorizontal: 20, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
    
    inputWrapper: { padding: 16, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border },
    inputContainer: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: C.border },
    textInput: { flex: 1, fontSize: 15, color: C.textHead, maxHeight: 100, paddingVertical: 8 },
    sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primaryStandard, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
    disabledBtn: { backgroundColor: C.border },
});

export default AIChatbotScreen;
