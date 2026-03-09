import axios from 'axios';
import toast from 'react-hot-toast';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor — attach auth token ────────────────────────────────
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('laf_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor — normalize errors ────────────────────────────────
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            // Network error / server unreachable
            toast.error('Cannot reach server. Check your connection.');
            return Promise.reject(error);
        }

        const { status, data } = error.response;

        if (status === 401) {
            // Auto-clear stale token
            localStorage.removeItem('laf_token');
            localStorage.removeItem('laf_user');
            window.dispatchEvent(new Event('auth:logout'));
        }

        if (status === 429) {
            toast.error('You\'re doing that too fast. Please wait a moment.');
        }

        // Return the error with a normalized message
        const message = data?.message || 'Something went wrong';
        const enhancedError = new Error(message);
        enhancedError.status = status;
        enhancedError.errors = data?.errors || [];
        return Promise.reject(enhancedError);
    }
);

export default apiClient;
