const fallbackAppURL = 'https://next15-bkki.vercel.app';
const fallbackBackendURL = 'https://corporatehappinessaward.com/next15-laravel-public/';
const fallbackBackendURL2 = 'https://corporatehappinessaward.com/next15-laravel-public/';

export const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || fallbackAppURL;
export const APP_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || fallbackBackendURL;

if (typeof window !== 'undefined') {
  console.log('✅ APP_BASE_URL resolved to:', APP_BASE_URL);
  console.log('✅ APP_API_URL resolved to:', APP_API_URL);
}
