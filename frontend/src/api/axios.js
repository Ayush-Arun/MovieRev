import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const rs = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refresh_token: refreshToken });
                const { access_token: accessToken, refresh_token: newRefresh } = rs.data;
                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('refresh_token', newRefresh);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (_error) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.dispatchEvent(new Event('auth_error'));
                return Promise.reject(_error);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
