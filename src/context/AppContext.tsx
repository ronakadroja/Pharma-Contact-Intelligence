import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Contact, User, UserRole } from "../types";
import { login as apiLogin, logout as apiLogout } from "../api/auth";
import { isTokenValid } from "../utils/auth";

interface AppContextType {
    coins: number;
    setCoins: (coins: number) => void;
    myList: Contact[];
    addToMyList: (contact: Contact) => void;
    setMyList: (myList: Contact[] | ((prev: Contact[]) => Contact[])) => void;
    user: User | null;
    setUser: (user: User | null) => void;
    isAuthenticated: boolean;
    isLoggingOut: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [coins, setCoins] = useState(50);
    const [myList, setMyList] = useState<Contact[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Check for existing token and user data on app initialization
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                // Validate token first
                if (!isTokenValid(token)) {
                    console.log('Token has expired');
                    await logout();
                    setIsInitialized(true);
                    return;
                }

                try {
                    const userData = JSON.parse(storedUser);
                    setUser({
                        id: userData.id || '1',
                        email: userData.email,
                        role: userData.role.toLowerCase() as UserRole,
                        credits: parseInt(userData.credits || '0'),
                        name: userData.name,
                        phone_number: userData.phone_number || '',
                        company: userData.company || '',
                        country: userData.country || '',
                        status: userData.status || 'active',
                        createdAt: userData.createdAt || new Date().toISOString()
                    });
                    setCoins(parseInt(userData.credits || '0'));
                } catch (error) {
                    console.error('Error parsing stored user data:', error);
                    await logout(); // Clear invalid data
                }
            }
            setIsInitialized(true);
        };

        initializeAuth();
    }, []);

    const addToMyList = (contact: Contact) => {
        if (!myList.some((c) => c.id === contact.id)) {
            setMyList((prev) => [...prev, contact]);
        }
    };

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await apiLogin({ username, password });

            if (response.success && response.data && response.data.token) {
                const apiData = response.data;
                const userData = {
                    id: '1', // Since the API doesn't return ID, we'll use a default
                    email: apiData.email,
                    role: apiData.role.toLowerCase() as UserRole,
                    credits: parseInt(apiData.credits || '50'),
                    name: apiData.name,
                    phone_number: '',
                    company: '',
                    country: '',
                    status: 'active' as const,
                    createdAt: new Date().toISOString()
                };

                localStorage.setItem('token', apiData.token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setCoins(userData.credits);
                return true;
            }
            return false;
        } catch (error:any) {
            console.log(error);
                  throw new Error(error);
        }
    };

    const logout = async () => {
        setIsLoggingOut(true);
        try {
            await apiLogout();
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            // Clear all authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setCoins(0);
            setMyList([]);
            setIsLoggingOut(false);
        }
    };

    if (!isInitialized) {
        return null; // Or a loading spinner
    }

    return (
        <AppContext.Provider
            value={{
                coins,
                setCoins,
                myList,
                addToMyList,
                setMyList,
                user,
                setUser,
                isAuthenticated: !!user,
                isLoggingOut,
                login,
                logout
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
