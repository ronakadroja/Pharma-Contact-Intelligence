import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Contact, User, UserRole } from "../types";
import { login as apiLogin } from "../api/auth";
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
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
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

    // Check for existing token and user data on app initialization
    useEffect(() => {
        const initializeAuth = () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                // Validate token first
                if (!isTokenValid(token)) {
                    console.log('Token has expired');
                    logout();
                    setIsInitialized(true);
                    return;
                }

                try {
                    const userData = JSON.parse(storedUser);
                    setUser({
                        id: '1',
                        email: userData.email,
                        role: userData.role.toLowerCase() as UserRole,
                        credits: parseInt(userData.credits),
                        name: userData.name
                    });
                    setCoins(parseInt(userData.credits));
                } catch (error) {
                    console.error('Error parsing stored user data:', error);
                    logout(); // Clear invalid data
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

            if (response.success) {
                const userData = {
                    id: '1', // You might want to get this from the API
                    email: response.data.email,
                    role: response.data.role.toLowerCase() as UserRole,
                    credits: parseInt(response.data.credits),
                    name: response.data.name
                };

                setUser(userData);
                setCoins(userData.credits);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setCoins(0);
        setMyList([]);
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
                login,
                logout
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
