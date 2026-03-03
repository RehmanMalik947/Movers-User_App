import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                const storedToken = await AsyncStorage.getItem('token');
                if (storedUser && storedToken) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error("Failed to load user", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await authApi.login(email, password);
            const { token, user: userData } = response;

            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('token', token);
            return userData;
        } catch (error) {
            console.error('Login failed:', error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (data) => {
        setIsLoading(true);
        try {
            const response = await authApi.signup(data);
            const { token, user: userData } = response;

            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('token', token);
            return userData;
        } catch (error) {
            console.error('Signup failed:', error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const logout = async () => {
        setIsLoading(true);
        try {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
