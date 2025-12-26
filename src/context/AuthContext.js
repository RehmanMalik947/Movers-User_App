import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockApi } from '../api/mockService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { id, name, role, ... }
    const [isLoading, setIsLoading] = useState(true);

    // Restore session
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
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
            const userData = await mockApi.login(email, password);
            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (name, email, phone, password, role) => {
        setIsLoading(true);
        try {
            const userData = await mockApi.signup(name, email, phone, password, role);
            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const logout = async () => {
        setIsLoading(true);
        try {
            await AsyncStorage.removeItem('user');
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
