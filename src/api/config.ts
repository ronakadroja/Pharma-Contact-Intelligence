import axios from 'axios';
import { CURRENT_API_CONFIG } from '../config/api.config';

// Create axios instance with custom config from our API configuration
const api = axios.create({
    baseURL: CURRENT_API_CONFIG.BASE_URL,
    timeout: CURRENT_API_CONFIG.TIMEOUT,
    headers: CURRENT_API_CONFIG.DEFAULT_HEADERS,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(CURRENT_API_CONFIG.AUTH.TOKEN_KEY);
        if (token && config.headers) {
            config.headers.Authorization = `${CURRENT_API_CONFIG.AUTH.TOKEN_PREFIX} ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(new Error(error.message ?? 'Request failed'));
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Response error:', error);
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem(CURRENT_API_CONFIG.AUTH.TOKEN_KEY);
            window.location.href = '/login';
        }
        console.log(error.response?.data);
        return Promise.reject(error.response?.data);
    }
);

export default api; 