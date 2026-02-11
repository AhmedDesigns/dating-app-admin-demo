// config.js - Application Configuration
const CONFIG = {
  // API Settings - Pointing to our real backend
  API_BASE_URL: '/api/admin',
  
  // JWT Settings
  TOKEN_KEY: 'admin_token',
  USER_KEY: 'love_connect_admin_user',
  
  // User Roles
  ROLES: {
    ADMIN: 'admin',
    MODERATOR: 'moderator'
  },
  
  // General App Settings
  APP_NAME: 'Love Connect Admin Demo',
  VERSION: '1.0.0'
};

// Get token from localStorage
function getToken() {
  return localStorage.getItem(CONFIG.TOKEN_KEY);
}

// Get user from localStorage
function getUser() {
  const user = localStorage.getItem(CONFIG.USER_KEY);
  return user ? JSON.parse(user) : null;
}

// Save auth data to localStorage
function setAuth(token, user) {
  localStorage.setItem(CONFIG.TOKEN_KEY, token);
  localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
}

// Clear auth data (logout)
function clearAuth() {
  localStorage.removeItem(CONFIG.TOKEN_KEY);
  localStorage.removeItem(CONFIG.USER_KEY);
}

// Export for use in other files
window.CONFIG = CONFIG;
window.getToken = getToken;
window.getUser = getUser;
window.setAuth = setAuth;
window.clearAuth = clearAuth;
