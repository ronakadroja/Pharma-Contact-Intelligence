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