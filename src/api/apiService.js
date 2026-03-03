import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for API - Using local IP for physical devices or localhost for emulator
// Replace with your machine's local IP if testing on a physical device
const BASE_URL = 'http://192.168.100.4:3000/api'; // Standard Android Emulator Localhost IP

const apiService = axios.create({
    baseURL: BASE_URL,
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
        const message = error.response?.data?.message || 'Something went wrong';
        console.error('API Error:', message);
        return Promise.reject(new Error(message));
    }
);

export const authApi = {
    login: (email, password) => apiService.post('/auth/login', { email, password }),
    signup: (data) => apiService.post('/auth/signup', data),
    getMe: () => apiService.get('/auth/me'),
};

export const jobApi = {
    getAll: () => apiService.get('/jobs'),
    getOne: (id) => apiService.get(`/jobs/${id}`),
    create: (data) => apiService.post('/jobs', data),
    update: (id, data) => apiService.put(`/jobs/${id}`, data),
    delete: (id) => apiService.delete(`/jobs/${id}`),
};

export default apiService;
