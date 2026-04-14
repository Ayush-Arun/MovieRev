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

        window.addEventListener('auth_error', () => setUser(null));
        return () => window.removeEventListener('auth_error', () => setUser(null));
    }, []);

    const login = async (email, password) => {
        const sessionId = localStorage.getItem('cv_session_id');
        const res = await api.post('/auth/login', { email, password, session_id: sessionId });
        localStorage.setItem('access_token', res.data.access_token);
        localStorage.setItem('refresh_token', res.data.refresh_token);
        setUser(res.data.user);
    };

    const register = async (email, username, password, displayName) => {
        const sessionId = localStorage.getItem('cv_session_id');
        const res = await api.post('/auth/register', { email, username, password, display_name: displayName, session_id: sessionId });
        localStorage.setItem('access_token', res.data.access_token);
        localStorage.setItem('refresh_token', res.data.refresh_token);
        setUser(res.data.user);
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
        <AuthContext.Provider value={{ user, login, register, logout, loading, isAdmin: user?.role === 'admin' }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
