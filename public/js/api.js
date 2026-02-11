// api.js - API Service for Backend Communication
class API {
  constructor() {
    this.baseURL = window.CONFIG.API_BASE_URL;
  }
  
  // General request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = window.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
      ...options,
      headers
    };
    
    try {
      const response = await fetch(url, config);
      
      if (response.status === 401 || response.status === 403) {
        // If we are not on login page, redirect to login
        if (!window.location.pathname.includes('login.html')) {
          window.clearAuth();
          window.location.href = 'login.html';
        }
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Request failed: ${response.status}`);
      }
      
      return data;
      
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
  
  // Authentication
  async login(email, password) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }
  
  // User Management
  async getUsers(page = 1, limit = 20) {
    return this.request(`/users?page=${page}&limit=${limit}`);
  }
  
  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }
  
  async banUser(id, reason) {
    return this.request(`/users/${id}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }
  
  async unbanUser(id) {
    return this.request(`/users/${id}/unban`, {
      method: 'POST'
    });
  }
  
  // Report Management
  async getReports(page = 1, limit = 20) {
    return this.request(`/reports?page=${page}&limit=${limit}`);
  }
  
  async resolveReport(id, action, note = '') {
    return this.request(`/reports/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action, note })
    });
  }
  
  // Statistics
  async getDashboardStats() {
    return this.request('/stats/dashboard');
  }

  // Password Recovery
  async forgotPassword(email) {
    const url = `/api/auth/forgot-password`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to request reset');
    return data;
  }

  async resetPassword(email, code, newPassword) {
    const url = `/api/auth/reset-password`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to reset password');
    return data;
  }
}

// Create single instance of API
window.api = new API();
