import React, { useState, useRef } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const DUMMY_MESSAGES = [
  { id: '1', text: 'Hello! Your shipment has been picked up.', fromUser: false },
  { id: '2', text: 'Great! When will it reach the destination?', fromUser: true },
  { id: '3', text: 'It will be delivered by 5 PM today.', fromUser: false },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef();

  const sendMessage = () => {
    if (inputText.trim() === '') return;
    const newMessage = {
      id: (messages.length + 1).toString(),
      text: inputText,
      fromUser: true,
    };
    setMessages([...messages, newMessage]);
    setInputText('');
    setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Chat</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.fromUser ? styles.userBubble : styles.supportBubble,
            ]}
          >
            <Text style={[styles.messageText, item.fromUser && { color: '#fff' }]}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {/* Input Box */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputWrapper}
      >
        <TextInput
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Icon name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6A940',
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginHorizontal:16,
    borderRadius: 14,
    marginBottom: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: '#E6A940',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  supportBubble: {
    backgroundColor: '#FDF1D9',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 14,
    color: '#2A2A2A',
  },

  inputWrapper: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0E8D6',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#DAAE58',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
