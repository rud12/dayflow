import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  /* ================= AUTH ================= */

  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  signup: async (data: any) => {
    const res = await api.post('/auth/signup', data);
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data;
  },

  updateProfile: async (data: any) => {
    const res = await api.put('/users/profile', data);
    return res.data;
  },

  /* ================= EMPLOYEES (FIX) ================= */

  // ✅ THIS IS WHAT Employees.tsx EXPECTS
  getEmployees: async (page = 1, limit = 10, search = '') => {
    const res = await api.get(
      `/employees?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    );
    return res.data;
  },

  /* ================= LEAVE ================= */

  getLeaveRequests: async (page = 1, limit = 10) => {
    const res = await api.get(`/leave?page=${page}&limit=${limit}`);
    return res.data;
  },

  createLeaveRequest: async (data: any) => {
    const res = await api.post('/leave', data);
    return res.data;
  },

  updateLeaveStatus: async (id: number, status: string, comment?: string) => {
    const res = await api.put(`/leave/${id}/status`, { status, comment });
    return res.data;
  },
};
