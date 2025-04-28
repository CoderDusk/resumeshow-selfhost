import { defineStore } from 'pinia';
import api from '../api/config';

export const useResumeStore = defineStore('resume', {
  state: () => ({
    resumeData: {},
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchResumeData(password = '') {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/api/resume', { password });

        if (response.data.success) {
          this.resumeData = response.data.data;
          this.isAuthenticated = response.data.isAuthenticated;
        } else {
          this.error = '获取简历数据失败';
        }
      } catch (error) {
        this.error = error.message || '网络请求失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearAuthentication() {
      this.isAuthenticated = false;
    },
  },
});
