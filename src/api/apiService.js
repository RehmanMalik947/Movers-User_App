import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for API - Using local IP for physical devices or localhost for emulator
// Replace with your machine's local IP if testing on a physical device
const BASE_URL = 'http://192.168.100.31:5001/api/'; // Added trailing slash for correct Axios resolution

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
    getAll: () => apiService.get('jobs'),
    getOne: (id) => apiService.get(`jobs/${id}`),
    create: (data) => apiService.post('jobs', data),
    update: (id, data) => apiService.put(`jobs/${id}`, data),
    delete: (id) => apiService.delete(`jobs/${id}`),
};

export default apiService;
