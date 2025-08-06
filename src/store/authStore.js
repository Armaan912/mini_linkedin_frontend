import { defineStore } from 'pinia';
import axios from '../lib/api/axios.js';

// Add the API functions that were imported from deleted files:
const loginUser = async (payload) => {
  const res = await axios.post('/auth/login', payload);
  return res.data;
};

const registerUser = async (payload) => {
  const res = await axios.post('/auth/register', payload);
  return res.data;
};

const getCurrentUser = async () => {
  const res = await axios.get('/users/me');
  return res.data;
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    async login(payload) {
      const res = await loginUser(payload);
      this.user = res.user;
      this.token = res.token;
      // Store token in localStorage
      localStorage.setItem('token', res.token);
    },

    async register(payload) {
      const res = await registerUser(payload);
      this.user = res.user;
      this.token = res.token;
      // Store token in localStorage
      localStorage.setItem('token', res.token);
    },

    async registerOnly(payload) {
      // Register without logging in - just return the response
      const res = await registerUser(payload);
      return res;
    },

    async loadUser() {
      if (this.token) {
        try {
          const user = await getCurrentUser();
          this.user = user;
        } catch (error) {
          console.error('Error loading user:', error);
          this.logout();
        }
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      // Remove token from localStorage
      localStorage.removeItem('token');
    },
  },
});
