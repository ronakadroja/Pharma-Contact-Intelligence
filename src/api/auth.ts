import axios from 'axios';
import type { LoginResponse, LoginCredentials } from '../types/auth';

const BASE_URL = 'https://3148-152-58-35-171.ngrok-free.app/api';

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
        const response = await axios.post<LoginResponse>(`${BASE_URL}/login`, credentials);

        if (response.data.success) {
            // Store the token
            localStorage.setItem('token', response.data.data.token);

            // Store user info if needed
            localStorage.setItem('user', JSON.stringify({
                email: response.data.data.email,
                role: response.data.data.role,
                credits: response.data.data.credits,
                name: response.data.data.name
            }));
        }

        return response.data;
    } catch (error) {
        throw error;
    }
}; 