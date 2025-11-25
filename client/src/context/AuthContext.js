import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const checkAuth = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/me`, {
                withCredentials: true
            });
            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email, password) => {
        const response = await axios.post(`${API_URL}/auth/login`, 
            { email, password },
            { withCredentials: true }
        );
        setUser(response.data.user);
        return response.data;
    };

    const register = async (name, email, password, role) => {
        const response = await axios.post(`${API_URL}/auth/register`, {
            name,
            email,
            password,
            role
        });
        return response.data;
    };

    const verifyOTP = async (email, otp) => {
        const response = await axios.post(`${API_URL}/auth/verify-otp`, 
            { email, otp },
            { withCredentials: true }
        );
        setUser(response.data.user);
        return response.data;
    };

    const resendOTP = async (email) => {
        const response = await axios.post(`${API_URL}/auth/resend-otp`, { email });
        return response.data;
    };

    const logout = async () => {
        try {
            await axios.post(`${API_URL}/auth/logout`, {}, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        verifyOTP,
        resendOTP,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};