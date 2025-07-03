import axios from 'axios';

console.log('axios.ts file');

const fallbackBackend = 'https://corporatehappinessaward.com/next15-laravel-public/';
const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || fallbackBackend;

console.log('✅ Axios baseURL resolved to:', backendURL);

const api = axios.create({
  baseURL: backendURL,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});


if (typeof window !== 'undefined') {
  api.interceptors.request.use(
    (config) => {
      const token = document.cookie
        .split(';')
        .find((cookie) => cookie.trim().startsWith('XSRF-TOKEN='));

      if (token) {
        const csrfToken = decodeURIComponent(token.split('=')[1]);
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 419) {
        try {
          await api.get('/sanctum/csrf-cookie');

          const token = document.cookie
            .split(';')
            .find((cookie) => cookie.trim().startsWith('XSRF-TOKEN='));

          if (token) {
            const csrfToken = decodeURIComponent(token.split('=')[1]);
            error.config.headers['X-XSRF-TOKEN'] = csrfToken;
          }

          return api.request(error.config);
        } catch (retryError) {
          return Promise.reject(retryError);
        }
      }

      return Promise.reject(error);
    }
  );
}

export default api;
