import axios from 'axios';
import type { LoginResponse, LoginCredentials, CreateUserPayload, CreateUserResponse, User } from '../types/auth';

// In development, the API requests will go through the Vite proxy
const BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    },
    // Set withCredentials to false since we're using token-based auth
    withCredentials: false
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if it's an Axios error
        if (error && typeof error === 'object' && 'isAxiosError' in error) {
            const axiosError = error as { response?: { status: number; data?: { message?: string } } };

            if (!axiosError.response) {
                // Check if it's a CORS or network error
                if (error.message === 'Network Error') {
                    console.error('CORS or Network Error:', error);
                    throw new Error('Unable to connect to the server. Please try again later.');
                }
                throw new Error('Network error. Please check your connection.');
            }

            // Handle specific error cases
            switch (axiosError.response.status) {
                case 401:
                    // Clear token if unauthorized
                    localStorage.removeItem('token');
                    throw new Error('Unauthorized. Please log in again.');
                case 403:
                    throw new Error('You do not have permission to perform this action.');
                case 404:
                    throw new Error('The requested resource was not found.');
                case 500:
                    throw new Error('Server error. Please try again later.');
                default:
                    throw new Error(axiosError.response.data?.message || 'An error occurred. Please try again.');
            }
        }

        throw new Error('An unexpected error occurred');
    }
);

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
        const response = await api.post<LoginResponse>('/login', credentials);
        // Store the token after successful login
        localStorage.setItem('token', response.data?.data?.token);
        localStorage.setItem('user', JSON.stringify(response.data?.data?.user));
        return response.data;
    } catch (error) {
        if (error && typeof error === 'object' && 'isAxiosError' in error) {
            const axiosError = error as { response?: { status: number } };
            if (axiosError.response?.status === 401) {
                throw new Error('Invalid email or password');
            }
        }
        throw new Error('Failed to login. Please try again.');
    }
};

export const logout = async (): Promise<void> => {
    try {
        await api.post('/logout');
    } finally {
        // Always clear token on logout
        localStorage.removeItem('token');
    }
};

export const createUser = async (userData: CreateUserPayload): Promise<CreateUserResponse> => {
    try {
        const response = await api.post<CreateUserResponse>('/users', userData);
        return response.data;
    } catch (error) {
        if (error && typeof error === 'object' && 'isAxiosError' in error) {
            const axiosError = error as { response?: { status: number } };
            if (axiosError.response?.status === 409) {
                throw new Error('User with this email already exists');
            }
            if (axiosError.response?.status === 400) {
                throw new Error('Invalid user data provided');
            }
        }
        throw new Error('Failed to create user. Please try again.');
    }
};

export const getUsers = async (): Promise<User[]> => {
    try {
        const response = await api.get<{ data: User[] }>('/users');
        // Ensure we're returning the array of users from the response
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        console.error('Error fetching users:', error);
        if (error && typeof error === 'object' && 'isAxiosError' in error) {
            const axiosError = error as { response?: { status: number } };
            if (axiosError.response?.status === 401) {
                // If unauthorized, redirect to login
                window.location.href = '/login';
                return [];
            }
        }
        throw new Error('Failed to fetch users. Please try again.');
    }
};

export const deleteUser = async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
};

export interface UpdateUserPayload {
    name?: string;
    email?: string;
    phone_number?: string;
    company?: string;
    country?: string;
    role?: string;
    credits?: string;
}

export const updateUser = async (userId: string, userData: UpdateUserPayload): Promise<User> => {
    try {
        const response = await api.put<User>(`/users/${userId}`, userData);
        return response.data;
    } catch (error) {
        if (error && typeof error === 'object' && 'isAxiosError' in error) {
            const axiosError = error as { response?: { status: number } };
            if (axiosError.response?.status === 409) {
                throw new Error('User with this email already exists');
            }
            if (axiosError.response?.status === 400) {
                throw new Error('Invalid user data provided');
            }
            if (axiosError.response?.status === 404) {
                throw new Error('User not found');
            }
        }
        throw new Error('Failed to update user. Please try again.');
    }
};

export const updateUserStatus = async (userId: string, status: 'active' | 'inactive'): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/users/${userId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error('Failed to update user status');
        }
    } catch (error) {
        throw error;
    }
};

export const updateUserRole = async (userId: string, role: string): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/users/${userId}/role`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ role })
        });

        if (!response.ok) {
            throw new Error('Failed to update user role');
        }
    } catch (error) {
        throw error;
    }
}; 