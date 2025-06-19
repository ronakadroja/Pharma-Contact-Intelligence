import axios from 'axios';

// Determine the base URL based on the environment
const getBaseUrl = () => {
    if (import.meta.env.MODE === 'development') {
        return '/api'; // This will be handled by Vite's proxy in development
    }
    // In production, use the actual API URL
    return 'https://3148-152-58-35-171.ngrok-free.app/api';
};

// Create axios instance with custom config
const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Response error:', error);
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error);
    }
);

export default api; 