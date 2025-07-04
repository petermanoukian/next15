import api from '@/lib/axios';

let csrfInitialized = false;
let csrfInitializationPromise: Promise<void> | null = null;

const initializeCsrf = async () => {
    if (csrfInitialized) {
        return;
    }

    // If there's already an initialization in progress, return that promise
    if (csrfInitializationPromise) {
        return csrfInitializationPromise;
    }

    csrfInitializationPromise = (async () => {
        try {
            //const response = await api.get('/sanctum/csrf-cookie');
            const cleanPath = 'api/sanctum/csrf-cookie'; // strip leading slash
            const fullUrl = api.defaults.baseURL + cleanPath;  
            const response = await api.get(fullUrl, { withCredentials: true });
            console.log('response' , response);

            csrfInitialized = true;
        } catch (error) {
            console.error('❌ CSRF initialization failed:', error);
            throw error;
        } finally {
            csrfInitializationPromise = null;
        }
    })();

    return csrfInitializationPromise;
};

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    is_admin: 'superadmin' | 'admin' | 'orduser' | null;
}

export const login = async (email: string, password: string) => {
    await initializeCsrf();
    return api.post('/api/login', { email, password });
};

export const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    await initializeCsrf();
    return api.post('/api/register', { name, email, password, password_confirmation });
};

export const logout = async () => {
    await initializeCsrf();
    csrfInitialized = false; // Reset CSRF state after logout
    cachedUser = null;
    return api.post('/api/logout');
};

export const getUser = async () => {
    await initializeCsrf();
    //console.log('auth.ts - Fetching user data');
    try {
        
        const cleanPath = 'api/user'; // strip leading slash
        const fullUrl = api.defaults.baseURL + cleanPath;
        const response = await api.get(fullUrl)
        //const response = await api.get('/api/user');
        //console.log('auth.ts - User data response:', response.data);
        // The /api/user endpoint returns { user: {...} }
        return response.data.user;
    } catch (error) {
        //console.log('auth.ts - Error fetching user:', error);
        throw error;
    }
};

export const auth = {
    async csrf() {
        await initializeCsrf();
    },

    async login({ email, password }: LoginCredentials) {
        //console.log('auth.ts - Attempting login');
        await this.csrf();
        const response = await login(email, password);
        //console.log('auth.ts - Login response:', response.data);
        // Login endpoint returns { message: '...', user: {...} }
        return response.data.user;
    },

    async logout() {
        return logout();
    },

    async user() {
        const userData = await getUser();
        //console.log('auth.ts - Processed user data:', userData);
        return userData;
    },

    async register(data: LoginCredentials & { name: string }) {
        await this.csrf();
        return register(data.name, data.email, data.password, data.password);
    },
}; 


export let cachedUser: User | null = null;

export const loadAuthenticatedUser = async (): Promise<User | null> => {
    if (cachedUser !== null) return cachedUser;

    try {
        await initializeCsrf(); // only if not already done
        const userData = await getUser();
        cachedUser = userData;
        return userData;
    } catch (error) {
        cachedUser = null;
        return null;
    }
};


