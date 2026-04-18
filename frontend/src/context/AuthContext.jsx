import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Init Guest Session
        if (!localStorage.getItem('cv_session_id')) {
            localStorage.setItem('cv_session_id', uuidv4());
        }

        const loadUser = async () => {
            if (localStorage.getItem('access_token')) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch (e) {
                    // Handled by axios interceptor
                }
            }
            setLoading(false);
        };
        loadUser();

        // Listen for auth errors (token expired etc.)
        const onAuthError = () => setUser(null);
        window.addEventListener('auth_error', onAuthError);

        // Listen for successful OTP verification
        const onAuthVerified = async () => {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data);
            } catch (e) {}
        };
        window.addEventListener('auth_verified', onAuthVerified);

        return () => {
            window.removeEventListener('auth_error', onAuthError);
            window.removeEventListener('auth_verified', onAuthVerified);
        };
    }, []);

    // Returns the API response so AuthModal can detect otp_required
    const login = async (email, password) => {
        const sessionId = localStorage.getItem('cv_session_id');
        const res = await api.post('/auth/login', { email, password, sessionId });

        // otp_required: unverified account — don't save tokens yet
        if (res.data.status === 'otp_required') {
            return res.data; // { status, email, message }
        }

        localStorage.setItem('access_token', res.data.access_token);
        localStorage.setItem('refresh_token', res.data.refresh_token);
        setUser(res.data.user);
        return res.data;
    };

    // Returns the API response so AuthModal can detect otp_required
    const register = async (email, username, password, displayName) => {
        const sessionId = localStorage.getItem('cv_session_id');
        const res = await api.post('/auth/register', { email, username, password, displayName, sessionId });

        // otp_required: always after registration
        if (res.data.status === 'otp_required') {
            return res.data; // { status, email, message }
        }

        // In case backend returns tokens directly (future-proof)
        localStorage.setItem('access_token', res.data.access_token);
        localStorage.setItem('refresh_token', res.data.refresh_token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout', { refresh_token: localStorage.getItem('refresh_token') });
        } catch (e) {}
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    const deleteAccount = async () => {
        try {
            await api.delete('/auth/me');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            alert('Account permanently deleted.');
        } catch (e) {
            console.error('Failed to delete account', e);
            alert('Failed to delete account');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, deleteAccount, loading, isAdmin: user?.role === 'admin' }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
