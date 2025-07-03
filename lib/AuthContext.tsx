'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from './auth';
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
            //console.log('AuthContext - Refreshing user data');
            const userData = await auth.user();
            //console.log('AuthContext - User data received:', userData);
            //console.log('AuthContext - is_admin value:', userData?.is_admin);
            //console.log('AuthContext - is_admin type:', typeof userData?.is_admin);
            setUser(userData);
            setError(null);
        } catch (err) {
            //console.log('AuthContext - Error refreshing user:', err);
            setUser(null);
            if (err instanceof Error) {
                setError(" Line 36 the error is " , err);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            //console.log('AuthContext - Attempting login');
            const userData = await auth.login({ email, password });
            //console.log('AuthContext - Login successful, user data:', userData);
            setUser(userData);
            setError(null);
            setLoading(false);
        } catch (err) {
            //console.log('AuthContext - Login error:', err);
            if (err instanceof Error) {
                throw err;
            }
            throw new Error('Login failed');
        }
    };

    const logout = async () => {
        try {
            await auth.logout();
            setUser(null);
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            }
            throw new Error('Logout failed');
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, error, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 