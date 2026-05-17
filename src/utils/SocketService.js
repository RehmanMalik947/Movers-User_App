import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const SOCKET_URL = API_BASE_URL.replace('/api/', '');

class SocketService {
  socket = null;

  async connect() {
    if (this.socket?.connected) return;
    if (this.socket) {
      this.socket.connect();
      return;
    }

    const token = await AsyncStorage.getItem('token');
    const cleanUrl = SOCKET_URL.endsWith('/') ? SOCKET_URL.slice(0, -1) : SOCKET_URL;

    this.socket = io(cleanUrl, {
      transports: ['polling', 'websocket'],
      auth: { token: `Bearer ${token}` },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => console.log('Socket connected'));
    this.socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason));
    this.socket.on('connect_error', (error) => console.error('Socket error:', error.message));
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(id) {
    if (this.socket?.connected) {
      this.socket.emit('join_conversation', id);
    } else {
      const tryJoin = () => {
        if (this.socket?.connected) {
          this.socket.emit('join_conversation', id);
          this.socket.off('connect', tryJoin);
        }
      };
      this.socket?.on('connect', tryJoin);
    }
  }

  leaveConversation(id) {
    if (this.socket?.connected) {
      this.socket.emit('leave_conversation', id);
    }
  }

  sendMessage(data) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', data);
      return true;
    }
    return false;
  }

  deleteMessage(id, conversationId) {
    if (this.socket?.connected) {
      this.socket.emit('delete_message', { id, conversationId });
      return true;
    }
    return false;
  }

  onMessageDeleted(callback) {
    if (this.socket) {
      this.socket.off('message_deleted');
      this.socket.on('message_deleted', callback);
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.off('receive_message');
      this.socket.on('receive_message', callback);
    }
  }

  emitTyping(conversationId, senderName, isTyping) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { conversationId, senderName, isTyping });
    }
  }

  onTyping(callback) {
    if (this.socket) {
      this.socket.off('display_typing');
      this.socket.on('display_typing', callback);
    }
  }

  markRead(conversationId, readerId) {
    if (this.socket?.connected) {
      this.socket.emit('mark_read', { conversationId, readerId });
    }
  }

  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.off('messages_read');
      this.socket.on('messages_read', callback);
    }
  }

  removeListener(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

const socketService = new SocketService();
export default socketService;
