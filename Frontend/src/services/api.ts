import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: string;
  profile?: {
    phoneNumber?: string;
    address?: string;
    courtId?: string;
    jurisdiction?: string[];
    barNumber?: string;
    specialization?: string[];
    yearsOfExperience?: number;
  };
}

export const auth = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      console.error('API login error:', error.response || error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },
  
  register: async (userData: RegisterData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      console.error('API register error:', error.response || error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      console.error('API getCurrentUser error:', error.response || error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  getLawyers: async () => {
    try {
      const response = await api.get('/auth/lawyers');
      return response.data;
    } catch (error: any) {
      console.error('API getLawyers error:', error.response || error);
      throw error;
    }
  },
};

// Analytics API functions
export const analytics = {
  getDashboard: async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      return response.data;
    } catch (error: any) {
      console.error('API getDashboard error:', error.response || error);
      throw error;
    }
  },

  getCourtPerformance: async (period = '30d') => {
    try {
      const response = await api.get(`/analytics/court-performance?period=${period}`);
      return response.data;
    } catch (error: any) {
      console.error('API getCourtPerformance error:', error.response || error);
      throw error;
    }
  },

  getCaseTrends: async (start?: string, end?: string) => {
    try {
      const params = new URLSearchParams();
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      const response = await api.get(`/analytics/case-trends?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('API getCaseTrends error:', error.response || error);
      throw error;
    }
  },

  getUserStats: async () => {
    try {
      const response = await api.get('/analytics/user-stats');
      return response.data;
    } catch (error: any) {
      console.error('API getUserStats error:', error.response || error);
      throw error;
    }
  },
};

// Cases API functions
export const cases = {
  getCases: async () => {
    try {
      const response = await api.get('/efiled-cases');
      return response.data;
    } catch (error: any) {
      console.error('API getCases error:', error.response || error);
      throw error;
    }
  },

  getCaseById: async (id: string) => {
    try {
      const response = await api.get(`/efiled-cases/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('API getCaseById error:', error.response || error);
      throw error;
    }
  },

  createCase: async (caseData: any) => {
    try {
      const response = await api.post('/efiled-cases', caseData);
      return response.data;
    } catch (error: any) {
      console.error('API createCase error:', error.response || error);
      throw error;
    }
  },

  updateCase: async (id: string, caseData: any) => {
    try {
      const response = await api.put(`/efiled-cases/${id}`, caseData);
      return response.data;
    } catch (error: any) {
      console.error('API updateCase error:', error.response || error);
      throw error;
    }
  },

  addDocument: async (id: string, docData: { title: string; fileUrl: string }) => {
    try {
      const response = await api.post(`/efiled-cases/${id}/documents`, docData);
      return response.data;
    } catch (error: any) {
      console.error('API addDocument error:', error.response || error);
      throw error;
    }
  },

  performAction: async (id: string, actionData: any) => {
    try {
      const response = await api.put(`/efiled-cases/${id}/action`, actionData);
      return response.data;
    } catch (error: any) {
      console.error('API performAction error:', error.response || error);
      throw error;
    }
  },
};

// Meetings API functions
export const meetings = {
  getMeetings: async () => {
    try {
      const response = await api.get('/meeting');
      return response.data;
    } catch (error: any) {
      console.error('API getMeetings error:', error.response || error);
      throw error;
    }
  },

  createMeeting: async (meetingData: any) => {
    try {
      const response = await api.post('/meeting', meetingData);
      return response.data;
    } catch (error: any) {
      console.error('API createMeeting error:', error.response || error);
      throw error;
    }
  },

  joinMeeting: async (meetingId: string) => {
    try {
      const response = await api.post(`/meeting/${meetingId}/join`);
      return response.data;
    } catch (error: any) {
      console.error('API joinMeeting error:', error.response || error);
      throw error;
    }
  },

  sendInvites: async (inviteData: any) => {
    try {
      const response = await api.post('/meeting/invite', inviteData);
      return response.data;
    } catch (error: any) {
      console.error('API sendInvites error:', error.response || error);
      throw error;
    }
  },
};