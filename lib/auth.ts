import api from '@/lib/axios';

let csrfInitialized = false;
let csrfInitPromise: Promise<void> | null = null;

const initializeCsrf = async (): Promise<void> => {
    if (csrfInitialized) return;
    if (csrfInitPromise) return csrfInitPromise;

    csrfInitPromise = (async () => {
        try {
            const fullUrl = `${api.defaults.baseURL}api/sanctum/csrf-cookie`;
            const res = await api.get(fullUrl, { withCredentials: true });
            console.log('🔐 CSRF initialized:', res.data?.message || res.status);
            csrfInitialized = true;
        } catch (error) {
            console.error('❌ CSRF initialization failed:', error);
            throw error;
        } finally {
            csrfInitPromise = null;
        }
    })();

    return csrfInitPromise;
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

// 🔒 Login
export const login = async (email: string, password: string) => {
    await initializeCsrf();
    const fullUrl = `${api.defaults.baseURL}api/login`;
    const res = await api.post(fullUrl, { email, password });
    return res.data.user;
};

// 🧾 Register
export const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
) => {
    await initializeCsrf();
    const fullUrl = `${api.defaults.baseURL}api/register`;
    const res = await api.post(fullUrl, {
        name,
        email,
        password,
        password_confirmation,
    });
    return res.data.user;
};

// 🚪 Logout
/*
export const logout = async () => {
    await initializeCsrf();
    const fullUrl = `${api.defaults.baseURL}api/logout`;
    csrfInitialized = false;
    cachedUser = null;
    return api.post(fullUrl);
};
*/
export const logout = async () => {
    await initializeCsrf();
    const fullUrl = `${api.defaults.baseURL}api/logout`;

    try {
        await api.post(fullUrl, null, { withCredentials: true });
    } catch (err) {
        console.warn('Logout request error (can ignore if 401):', err);
    }

    csrfInitialized = false;
    cachedUser = null; // 🔥 THIS IS IMPORTANT
};




// 👤 Fetch authenticated user
/*
export const getUser = async (): Promise<User> => {
    await initializeCsrf();
    const fullUrl = `${api.defaults.baseURL}api/user`;
    const res = await api.get(fullUrl);
    return res.data.user || res.data;
};
*/
export const getUser = async (): Promise<User | null> => {
  try {
    await initializeCsrf();
    const fullUrl = `${api.defaults.baseURL}api/user`;
    const res = await api.get(fullUrl);
    return res.data.user || res.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return null; // 🔥 no user — session destroyed
    }
    throw error;
  }
};



// 🧠 Cached singleton access
export let cachedUser: User | null = null;

/*
export const loadAuthenticatedUser = async (): Promise<User | null> => {
    if (cachedUser) return cachedUser;

    try {
        const user = await getUser();
        cachedUser = user;
        return user;
    } catch (err) {
        cachedUser = null;
        return null;
    }
};
*/
/*
export const loadAuthenticatedUser = async (): Promise<User | null> => {
  try {
    const user = await getUser();
    cachedUser = user;
    return user;
  } catch (err) {
    cachedUser = null;
    return null;
  }
};
*/
export const loadAuthenticatedUser = async (): Promise<User | null> => {
  try {
    const user = await getUser();
    cachedUser = user;
    return user;
  } catch (err) {
    cachedUser = null;
    return null;
  }
};




// 🔧 Auth module wrapper
export const auth = {
    async csrf() {
        await initializeCsrf();
    },
    async login(credentials: LoginCredentials) {
        return login(credentials.email, credentials.password);
    },
    async logout() {
        return logout();
    },
    async user() {
        return getUser();
    },
    async register(data: LoginCredentials & { name: string }) {
        return register(data.name, data.email, data.password, data.password);
    },
};
