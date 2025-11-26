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

    // Configure axios defaults for credentials
    axios.defaults.withCredentials = true;

    // Setup axios interceptor to handle 401 responses
    useEffect(() => {
        const responseInterceptor = axios.interceptors.response.use(
            response => response,
            error => {
                // Only silence 401s for optional endpoints used to check status
                if (error.response?.status === 401) {
                    const url = error.config?.url || '';

                    // Treat unauthenticated as "not registered" / "not organiser" only for these checks
                    if (url.includes('/registrations/check') || url.includes('/is-organiser')) {
                        return Promise.resolve({ data: { isRegistered: false, isOrganiser: false } });
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    const checkAuth = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/me`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.data && response.data.user) {
                setUser(response.data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            // Silently fail - user just not logged in
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
