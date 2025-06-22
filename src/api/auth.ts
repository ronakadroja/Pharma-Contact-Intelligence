import type { LoginResponse, LoginCredentials, CreateUserPayload, CreateUserResponse, User } from '../types/auth';
import api from './config';
import { getAuthUrl, getUserUrl } from './utils';

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
        const response = await api.post<LoginResponse>(getAuthUrl('LOGIN'), credentials);
        // Store the token after successful login
        if (response.data?.success && response.data?.data?.token) {
            localStorage.setItem('token', response.data.data.token);
            // Don't store user here, let AppContext handle it
        }
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
        await api.post(getAuthUrl('LOGOUT'));
    } finally {
        // Always clear all auth data on logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export const createUser = async (userData: CreateUserPayload): Promise<CreateUserResponse> => {
    try {
        const response = await api.post<CreateUserResponse>(getUserUrl('CREATE'), userData);
        return response.data;
    } catch (error: any) {
        console.error('Error creating user:', error);
        // Re-throw the original Axios error to preserve response data and status codes
        // This allows the UserCreationForm to handle the specific error scenarios
        throw error;
    }
};

export const getUsers = async (): Promise<User[]> => {
    try {
        const response = await api.get<{ data: User[] }>(getUserUrl('BASE'));
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
    await api.delete(getUserUrl('DELETE', userId));
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
        const response = await api.put<User>(getUserUrl('UPDATE', userId), userData);
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        // Re-throw the original Axios error to preserve response data and status codes
        // This allows the UserCreationForm to handle the specific error scenarios
        throw error;
    }
};

export const updateUserStatus = async (userId: string, status: 'active' | 'inactive'): Promise<void> => {
    try {
        await api.patch(getUserUrl('STATUS', userId), { status });
    } catch (error) {
        console.error('Error updating user status:', error);
        throw new Error('Failed to update user status');
    }
};

export const updateUserRole = async (userId: string, role: string): Promise<void> => {
    try {
        await api.patch(getUserUrl('ROLE', userId), { role });
    } catch (error) {
        console.error('Error updating user role:', error);
        throw new Error('Failed to update user role');
    }
};