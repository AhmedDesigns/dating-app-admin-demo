// auth.js - Authentication and Authorization Management
// Login function
async function login(email, password) {
  const loginBtn = document.getElementById('loginBtn');
  const loginText = document.getElementById('loginText');
  const loginSpinner = document.getElementById('loginSpinner');
  const alertDiv = document.getElementById('loginAlert');
  
  // Show loading state
  loginBtn.disabled = true;
  if (loginText) loginText.textContent = 'Logging in...';
  if (loginSpinner) loginSpinner.classList.remove('d-none');
  if (alertDiv) alertDiv.classList.add('d-none');
  
  try {
    const data = await window.api.login(email, password);
    
    // Save auth data
    window.setAuth(data.token, data.user);
    
    // Redirect to Dashboard
    window.location.href = 'dashboard.html';
    
  } catch (error) {
    // Show error message
    if (alertDiv) {
      alertDiv.textContent = error.message || 'Login failed. Please check your credentials.';
      alertDiv.classList.remove('d-none');
    }
    
    // Reset button
    loginBtn.disabled = false;
    if (loginText) loginText.textContent = 'Login';
    if (loginSpinner) loginSpinner.classList.add('d-none');
  }
}

// Logout function
function logout() {
  window.clearAuth();
  window.location.href = 'login.html';
}

// Check if user is authenticated
function isAuthenticated() {
  return !!(window.getToken() && window.getUser());
}

// Protect pages (call this on every page)
function protectPage() {
  if (!isAuthenticated()) {
    if (!window.location.pathname.includes('login.html')) {
      window.location.href = 'login.html';
    }
    return false;
  }
  return true;
}

// Export functions for use in other files
window.auth = {
  login,
  logout,
  isAuthenticated,
  protectPage
};
