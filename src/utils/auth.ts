interface DecodedToken {
    exp: number;
    // Add other token payload fields if needed
}

export const isTokenValid = (token: string): boolean => {
    try {
        // Get the payload part of the JWT token
        const base64Payload = token.split('.')[1];
        const payload = JSON.parse(atob(base64Payload)) as DecodedToken;

        // Check if token has expired
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp > currentTime;
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
};

export const encodePassword = (password: string): string => {
    return btoa(password);
}; 