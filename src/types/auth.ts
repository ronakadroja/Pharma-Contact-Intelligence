export interface LoginResponse {
    success: boolean;
    data: {
        token: string;
        email: string;
        role: string;
        credits: string;
        name: string;
    };
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone_number: string;
    company: string;
    country: string;
    role: string;
    credits: number;
    status: string;
    subscription_start_date?: string;
    subscription_end_date?: string;
    createdAt?: string;
}

export interface CreateUserPayload {
    name: string;
    email: string;
    password: string;
    phone_number: string;
    company: string;
    country: string;
    role: string;
    credits: string;
    status: string;
    subscription_start_date?: string;
    subscription_end_date?: string;
}

export interface CreateUserResponse {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface UpdateUserPayload {
    name?: string;
    email?: string;
    password?: string;
    phone_number?: string;
    company?: string;
    country?: string;
    role?: string;
    credits?: string;
    status?: string;
    subscription_start_date?: string;
    subscription_end_date?: string;
}