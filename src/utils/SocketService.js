import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

// Create a socket URL by removing /api/ from the base URL
const SOCKET_URL = API_BASE_URL.replace('/api/', '');

class SocketService {
    socket = null;

    connect() {
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinRoom(chatId) {
        if (this.socket) {
            this.socket.emit('join_room', chatId);
        }
    }

    leaveRoom(chatId) {
        if (this.socket) {
            this.socket.emit('leave_room', chatId);
        }
    }

    sendMessage(messageData) {
        if (this.socket) {
            this.socket.emit('send_message', messageData);
        }
    }

    onReceiveMessage(callback) {
        if (this.socket) {
            this.socket.on('receive_message', callback);
        }
    }

    onTyping(callback) {
        if (this.socket) {
            this.socket.on('display_typing', callback);
        }
    }

    emitTyping(chatId, senderName, isTyping) {
        if (this.socket) {
            this.socket.emit('typing', { chatId, senderName, isTyping });
        }
    }

    markRead(chatId, readerId, messageId = null) {
        if (this.socket) {
            this.socket.emit('mark_read', { chatId, readerId, messageId });
        }
    }

    onMessagesRead(callback) {
        if (this.socket) {
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
