import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    verifyEmail: (email: string, otp: string) =>
        api.post('/auth/verify-email', { email, otp }),
    resendOTP: (email: string) =>
        api.post('/auth/resend-otp', { email }),
    forgotPassword: (email: string) =>
        api.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) =>
        api.post('/auth/reset-password', { token, password })
};

// User API
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    getUserByUsername: (username: string) => api.get(`/users/${username}`),
    updateProfile: (data: any) => api.put('/users/profile', data),
    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return api.post('/users/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    searchUsers: (query: string) => api.get(`/users/search/query?q=${query}`)
};

// Story API
export const storyAPI = {
    getStories: (params: any) => api.get('/stories', { params }),
    getStory: (id: string) => api.get(`/stories/${id}`),
    createStory: (data: FormData) => api.post('/stories', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    updateStory: (id: string, data: any) => api.put(`/stories/${id}`, data),
    deleteStory: (id: string) => api.delete(`/stories/${id}`),
    reactToStory: (id: string) => api.post(`/stories/${id}/react`),
    addComment: (id: string, text: string, parentId?: string) => api.post(`/stories/${id}/comment`, { text, parentId })
};

export default api;
