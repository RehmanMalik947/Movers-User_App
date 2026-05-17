import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const apiService = axios.create({
    baseURL: API_BASE_URL, 
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add Auth Token
apiService.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Global Errors
apiService.interceptors.response.use(
    (response) => response.data,
    (error) => {
        let message = 'Something went wrong';
        
        if (error.response) {
            // Server responded with a status code out of 2xx range
            message = error.response.data?.message || error.response.data || error.message;
            console.error('API Error Response:', error.response.status, error.response.data);
        } else if (error.request) {
            // Request was made but no response was received
            message = 'No response from server. Check your network or IP address.';
            console.error('API Network Error:', error.message);
        } else {
            // Something happened in setting up the request
            message = error.message;
            console.error('API Setup Error:', error.message);
        }
        
        return Promise.reject(new Error(message));
    }
);

export const authApi = {
    login: (email, password) => apiService.post('auth/login', { email, password }),
    signup: (data) => apiService.post('auth/signup', data),
    getMe: () => apiService.get('auth/me'),
};

export const jobApi = {
    getAll: (params) => apiService.get('jobs', { params }),
    getMyJobs: (userId) => apiService.get('jobs', { params: { userId } }),
    getDriverJobs: (driverId) => apiService.get('jobs', { params: { driverId } }),
    getOne: (id) => apiService.get(`jobs/${id}`),
    getCategories: () => apiService.get('jobs/categories'),
    getBids: (jobId) => apiService.get(`jobs/${jobId}/bids`),
    acceptBid: (jobId, bidId) => apiService.patch(`jobs/${jobId}/bids/${bidId}/accept`),
    create: (data) => apiService.post('jobs', data),
    update: (id, data) => apiService.put(`jobs/${id}`, data),
    delete: (id) => apiService.delete(`jobs/${id}`),
};

export const ownerApi = {
    getTrucks: () => apiService.get('owner/trucks'),
    addTruck: (data) => apiService.post('owner/trucks', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateTruck: (id, data) => apiService.put(`owner/trucks/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteTruck: (id) => apiService.delete(`owner/trucks/${id}`),
    getDrivers: () => apiService.get('owner/drivers'),
    addDriver: (data) => apiService.post('owner/drivers', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateDriver: (id, data) => apiService.put(`owner/drivers/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteDriver: (id) => apiService.delete(`owner/drivers/${id}`),
    getCategories: () => apiService.get('owner/categories'),
    getAvailableJobs: () => apiService.get('owner/jobs'),
    getMyJobs: () => apiService.get('owner/my-jobs'),
    placeBid: (jobId, data) => apiService.post(`owner/jobs/${jobId}/bid`, data),
    assignDriver: (jobId, driverId) => apiService.patch(`owner/jobs/${jobId}/assign-driver`, { driver_id: driverId }),
};

export const reviewApi = {
    create: (data) => apiService.post('reviews', data),
    getJobReviews: (jobId) => apiService.get(`reviews/job/${jobId}`),
    getUserReviews: (userId, role) => apiService.get(`reviews/user/${userId}/${role}`),
    getDriverReviews: (driverId) => apiService.get(`reviews/driver/${driverId}`),
};

export const chatApi = {
  getConversations: (userId, role) => apiService.get(`chat/conversations/${userId}/${role}`),
  getMessages: (conversationId) => apiService.get(`chat/conversation/${conversationId}/messages`),
  startConversation: (participant1Id, participant2Id, type) => apiService.post('chat/conversation/start', { participant1Id, participant2Id, type }),
  markAsRead: (conversationId, readerId) => apiService.patch(`chat/conversation/${conversationId}/read`, { readerId }),
  getContacts: (userId, role) => apiService.get(`chat/contacts/${userId}/${role}`),
};

export const driverApi = {
    getProfile: () => apiService.get('drivers/profile'),
    toggleOnline: (is_online) => apiService.patch('drivers/toggle-online', { is_online }),
};

export const walletApi = {
    getWallet: () => apiService.get('/wallet'),
    getHistory: () => apiService.get('/wallet/history'),
    requestWithdraw: (data) => apiService.post('/wallet/withdraw', data),
    topup: (data) => apiService.post('/wallet/topup', data),
};

export default apiService;
