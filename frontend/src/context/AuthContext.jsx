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
                } catch {
                    // Handled by axios interceptor
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
        const res = await api.post('/auth/login', { email, password, sessionId });
        localStorage.setItem('access_token', res.data.accessToken);
        localStorage.setItem('refresh_token', res.data.refreshToken);
        setUser(res.data.user);
    };

    const register = async (email, username, password, displayName) => {
        const sessionId = localStorage.getItem('cv_session_id');
        const res = await api.post('/auth/register', { email, username, password, displayName, sessionId });
        localStorage.setItem('access_token', res.data.accessToken);
        localStorage.setItem('refresh_token', res.data.refreshToken);
        setUser(res.data.user);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout', { refreshToken: localStorage.getItem('refresh_token') });
        } catch {
            // ignore logout errors from stale/expired tokens
        }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, isAdmin: user?.role === 'admin' }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
