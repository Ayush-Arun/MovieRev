import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext();

// Pure helper — normalize snake_case API response to camelCase
const normalizeUser = (u) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    displayName: u.display_name || u.displayName || '',
    avatarUrl: u.avatar_url || u.avatarUrl || '',
    role: u.role,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (!localStorage.getItem('cv_session_id')) {
            localStorage.setItem('cv_session_id', uuidv4());
        }

        const loadUser = async () => {
            if (localStorage.getItem('access_token')) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(normalizeUser(res.data));
                } catch (e) {
                    // Handled by axios interceptor — clears tokens on auth failure
                }
            }
            setLoading(false);
        };
        loadUser();

        const handleAuthError = () => setUser(null);
        window.addEventListener('auth_error', handleAuthError);
        return () => window.removeEventListener('auth_error', handleAuthError);
    }, []);

    const login = async (email, password) => {
        const sessionId = localStorage.getItem('cv_session_id');
        const res = await api.post('/auth/login', { email, password, session_id: sessionId });
        localStorage.setItem('access_token', res.data.access_token);
        localStorage.setItem('refresh_token', res.data.refresh_token);
        setUser(normalizeUser(res.data.user));
    };

    const register = async (email, username, password, displayName) => {
        const sessionId = localStorage.getItem('cv_session_id');
        const res = await api.post('/auth/register', { email, username, password, display_name: displayName, session_id: sessionId });
        return res;
    };
    
    const verifyOtp = async (email, otp) => {
        return await api.post('/auth/verify-otp', { email, otp });
    };

    const resendOtp = async (email) => {
        return await api.post('/auth/resend-otp', { email });
    };

    const forgotPassword = async (email) => {
        return await api.post('/auth/forgot-password', { email });
    };

    const resetPassword = async (email, otp, newPassword) => {
        return await api.post('/auth/reset-password', { email, otp, newPassword: newPassword });
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout', { refresh_token: localStorage.getItem('refresh_token') });
        } catch(e) {}
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verifyOtp, resendOtp, forgotPassword, resetPassword, logout, loading, isAdmin: user?.role === 'admin' }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
