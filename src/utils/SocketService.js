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

        const SOCKET_URL_CLEAN = SOCKET_URL.endsWith('/') ? SOCKET_URL.slice(0, -1) : SOCKET_URL;

        this.socket = io(SOCKET_URL_CLEAN, {
            transports: ['polling', 'websocket'],
            auth: { token: `Bearer ${token}` },
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        this.socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
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

    joinRoom(chatId) {
        if (this.socket?.connected) {
            this.socket.emit('join_room', chatId);
        } else {
            const tryJoin = () => {
                if (this.socket?.connected) {
                    this.socket.emit('join_room', chatId);
                    this.socket.off('connect', tryJoin);
                }
            };
            this.socket?.on('connect', tryJoin);
        }
    }

    leaveRoom(chatId) {
        if (this.socket?.connected) {
            this.socket.emit('leave_room', chatId);
        }
    }

    sendMessage(messageData) {
        if (this.socket?.connected) {
            this.socket.emit('send_message', messageData);
            return true;
        }
        console.warn('Socket not connected, message not sent');
        return false;
    }

    onReceiveMessage(callback) {
        if (this.socket) {
            this.socket.off('receive_message');
            this.socket.on('receive_message', callback);
        }
    }

    onTyping(callback) {
        if (this.socket) {
            this.socket.off('display_typing');
            this.socket.on('display_typing', callback);
        }
    }

    emitTyping(chatId, senderName, isTyping) {
        if (this.socket?.connected) {
            this.socket.emit('typing', { chatId, senderName, isTyping });
        }
    }

    markRead(chatId, readerId, messageId = null) {
        if (this.socket?.connected) {
            this.socket.emit('mark_read', { chatId, readerId, messageId });
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

    getSocketId() {
        return this.socket?.id ?? null;
    }
}

const socketService = new SocketService();
export default socketService;
