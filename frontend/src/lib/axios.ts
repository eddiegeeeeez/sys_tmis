import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Adjust key if needed (e.g., 'jwt', 'accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Endpoints that legitimately return 401 for wrong credentials (not expired sessions).
// These must NOT trigger a global logout — the calling component handles the error itself.
const AUTH_VERIFY_URLS = ['/auth/verify-password', '/auth/login'];

// Add a response interceptor to handle errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const requestUrl: string = error.config?.url ?? '';
        const isCredentialCheck = AUTH_VERIFY_URLS.some(u => requestUrl.includes(u));

        if (error.response?.status === 401 && !isCredentialCheck) {
            // Token expired or invalid — clear session and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
