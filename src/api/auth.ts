import type { LoginResponse, LoginCredentials, CreateUserPayload, CreateUserResponse, User, UsersResponse, PaginatedResponse } from '../types/auth';
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

export const getUsers = async (page: number = 1, perPage: number = 10, search: string = ''): Promise<UsersResponse> => {
    try {
        const params: { page: number; per_page: number; search?: string } = {
            page,
            per_page: perPage
        };

        // Add search parameter if provided
        if (search && search.trim() !== '') {
            params.search = search.trim();
        }

        const response = await api.get<UsersResponse>(getUserUrl('BASE'), { params });
        // Return the paginated response data
        return response;
    } catch (error) {
        console.error('Error fetching users:', error);
        if (error && typeof error === 'object' && 'isAxiosError' in error) {
            const axiosError = error as { response?: { status: number } };
            if (axiosError.response?.status === 401) {
                // If unauthorized, redirect to login
                window.location.href = '/login';
                // Return empty pagination response
                return {
                    current_page: 1,
                    data: [],
                    first_page_url: '',
                    from: 0,
                    last_page: 1,
                    last_page_url: '',
                    links: [],
                    next_page_url: null,
                    path: '',
                    per_page: perPage,
                    prev_page_url: null,
                    to: 0,
                    total: 0
                };
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
    status?: string;
    password?: string;
    subscription_start_date?: string;
    subscription_end_date?: string;
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

// User Profile API
export interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    company: string;
    credits: string;
    subscription_start_date: string | null;
    subscription_end_date: string | null;
    status: string;
}

export interface UserProfileResponse {
    success: boolean;
    data: UserProfile;
}

export const getUserProfile = async (): Promise<UserProfileResponse> => {
    try {
        const response = await api.get<UserProfileResponse>(getUserUrl('DETAIL'));
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw new Error('Failed to fetch user profile');
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