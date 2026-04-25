import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { chatApi } from '../../api/apiService';

const AIChatbotScreen = () => {
    const [messages, setMessages] = useState([
        { id: '1', text: "Hello! I am your AI Assistant for Movers App. How can I help you today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef();

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
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble, isError && styles.errorBubble]}>
                <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText, isError && styles.errorText]}>
                    {item.text}
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.chatContainer}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#0066FF" />
                    <Text style={styles.loadingText}>AI is typing...</Text>
                </View>
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Ask something..."
                    placeholderTextColor="#888"
                    value={input}
                    onChangeText={setInput}
                    multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading || !input.trim()}>
                    <Icon name="send" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    chatContainer: { padding: 15, flexGrow: 1, justifyContent: 'flex-end' },
    messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 20, marginBottom: 10 },
    userBubble: { alignSelf: 'flex-end', backgroundColor: '#0066FF', borderBottomRightRadius: 5 },
    aiBubble: { alignSelf: 'flex-start', backgroundColor: '#FFF', borderBottomLeftRadius: 5, borderWidth: 1, borderColor: '#E5E7EB' },
    errorBubble: { alignSelf: 'center', backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5' },
    messageText: { fontSize: 15, lineHeight: 22 },
    userText: { color: '#FFF' },
    aiText: { color: '#333' },
    errorText: { color: '#B91C1C' },
    loadingContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, alignSelf: 'flex-start', marginLeft: 15 },
    loadingText: { marginLeft: 5, color: '#666', fontStyle: 'italic' },
    inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
    textInput: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 15, paddingTop: 10, paddingBottom: 10, minHeight: 40, maxHeight: 100, color: '#333' },
    sendButton: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#0066FF', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});

export default AIChatbotScreen;
