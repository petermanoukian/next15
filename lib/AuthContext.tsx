'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';
import { auth, loadAuthenticatedUser } from './auth';
import type { User } from './auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: Error | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refreshUser = async () => {
        try {
            const userData = await loadAuthenticatedUser();
            setUser(userData);
            setError(null);
        } catch (err) {
            setUser(null);
            if (err instanceof Error) setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const hydrateUser = async () => {
            setLoading(true); // lock it
            const userData = await loadAuthenticatedUser();
            if (isMounted) {
                setUser(userData);
                setError(null);
                setLoading(false);
            }
        };

        hydrateUser(); // run once at startup

        return () => {
            isMounted = false;
        };
    }, []); // 👈 no dependency array, fire once only




    const login = async (email: string, password: string) => {
        try {
            const userData = await auth.login({ email, password });
            setUser(userData);
            setError(null);
        } catch (err) {
            if (err instanceof Error) throw err;
            throw new Error('Login failed');
        } finally {
            setLoading(false);
        }
    };

    
    const logout = async () => {
        try {
            await auth.logout();
            setUser(null);
        } catch (err) {
            if (err instanceof Error) throw err;
            throw new Error('Logout failed');
        }
    };


    return (
        <AuthContext.Provider
            value={{ user, loading, error, login, logout, refreshUser }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
