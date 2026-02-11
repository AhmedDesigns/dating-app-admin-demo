// settings.js - Settings Management

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!window.auth.protectPage()) return;
    
    // Check permissions - only full admin can access settings
    const user = window.auth.getCurrentUser();
    if (user.role !== window.auth.CONFIG.ROLES.ADMIN) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Display user name
    document.getElementById('userName').textContent = user.name;
    
    // Setup logout event
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        window.auth.logout();
    });
    
    // Initialize dark mode
    if (window.darkMode) {
        window.darkMode.initializeDarkMode();
    }
    
    // Initialize branding
    if (window.branding) {
        window.branding.initializeBranding();
    }
    
    // Load settings
    loadSettings();
    
    // Load admin list
    loadAdmins();

    // Handle hash in URL to open specific tab
    const hash = window.location.hash;
    if (hash) {
        const tabTriggerEl = document.querySelector(`button[data-bs-target="${hash}"]`);
        if (tabTriggerEl) {
            const tab = new bootstrap.Tab(tabTriggerEl);
            tab.show();
        }
    }
});

// Function to load settings
async function loadSettings() {
    try {
        // Simulate fetching settings from API
        const mockSettings = {
            appName: 'Dating App',
            appVersion: '1.0.0',
            supportEmail: 'support@datingapp.com',
            maxPhotosPerUser: 6,
            matchRadius: 50,
            minAge: 18,
            maxAge: 70,
            enableAutoMatch: true,
            enableEmailNotifications: true,
            enablePushNotifications: true,
            notificationSound: 'default',
            notificationSchedule: 'instant',
            requireEmailVerification: true,
            requirePhoneVerification: false,
            sessionTimeout: 60,
            maxLoginAttempts: 5,
            apiBaseUrl: 'https://api.datingapp.com/v1',
            apiRateLimit: 100,
            apiTimeout: 30,
            apiLogLevel: 'info',
            enableApiLogging: true,
            logSensitiveData: false,
            logRetentionDays: 30,
            publicApiKey: 'pk_test_123456789',
            secretApiKey: 'sk_test_987654321'
        };
        
        // Populate forms
        document.getElementById('appName').value = mockSettings.appName;
        document.getElementById('appVersion').value = mockSettings.appVersion;
        document.getElementById('supportEmail').value = mockSettings.supportEmail;
        document.getElementById('maxPhotosPerUser').value = mockSettings.maxPhotosPerUser;
        document.getElementById('matchRadius').value = mockSettings.matchRadius;
        document.getElementById('minAge').value = mockSettings.minAge;
        document.getElementById('maxAge').value = mockSettings.maxAge;
        document.getElementById('enableAutoMatch').checked = mockSettings.enableAutoMatch;
        document.getElementById('enableEmailNotifications').checked = mockSettings.enableEmailNotifications;
        document.getElementById('enablePushNotifications').checked = mockSettings.enablePushNotifications;
        document.getElementById('notificationSound').value = mockSettings.notificationSound;
        document.getElementById('notificationSchedule').value = mockSettings.notificationSchedule;
        document.getElementById('requireEmailVerification').checked = mockSettings.requireEmailVerification;
        document.getElementById('requirePhoneVerification').checked = mockSettings.requirePhoneVerification;
        document.getElementById('sessionTimeout').value = mockSettings.sessionTimeout;
        document.getElementById('maxLoginAttempts').value = mockSettings.maxLoginAttempts;
        document.getElementById('apiBaseUrl').value = mockSettings.apiBaseUrl;
        document.getElementById('apiRateLimit').value = mockSettings.apiRateLimit;
        document.getElementById('apiTimeout').value = mockSettings.apiTimeout;
        document.getElementById('publicApiKey').value = mockSettings.publicApiKey;
        document.getElementById('secretApiKey').value = mockSettings.secretApiKey;
        document.getElementById('apiLogLevel').value = mockSettings.apiLogLevel;
        document.getElementById('enableApiLogging').checked = mockSettings.enableApiLogging;
        document.getElementById('logSensitiveData').checked = mockSettings.logSensitiveData;
        document.getElementById('logRetentionDays').value = mockSettings.logRetentionDays;
        
    } catch (error) {
        console.error('Failed to load settings:', error);
        window.dashboard.showToast('Error loading settings', 'danger');
    }
}

// Function to save general settings
async function saveGeneralSettings() {
    try {
        // Collect data from form
        const settings = {
            appName: document.getElementById('appName').value,
            appVersion: document.getElementById('appVersion').value,
            supportEmail: document.getElementById('supportEmail').value,
            maxPhotosPerUser: parseInt(document.getElementById('maxPhotosPerUser').value),
            matchRadius: parseInt(document.getElementById('matchRadius').value),
            minAge: parseInt(document.getElementById('minAge').value),
            maxAge: parseInt(document.getElementById('maxAge').value),
            enableAutoMatch: document.getElementById('enableAutoMatch').checked,
            enableEmailNotifications: document.getElementById('enableEmailNotifications').checked,
            enablePushNotifications: document.getElementById('enablePushNotifications').checked,
            notificationSound: document.getElementById('notificationSound').value,
            notificationSchedule: document.getElementById('notificationSchedule').value,
            requireEmailVerification: document.getElementById('requireEmailVerification').checked,
            requirePhoneVerification: document.getElementById('requirePhoneVerification').checked,
            sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
            maxLoginAttempts: parseInt(document.getElementById('maxLoginAttempts').value)
        };
        
        // Validate data
        if (settings.minAge >= settings.maxAge) {
            window.dashboard.showToast('Minimum age must be less than maximum age', 'warning');
            return;
        }
        
        // Simulate saving settings
        await simulateAPICall(1000);
        
        window.dashboard.showToast('General settings saved successfully', 'success');
        
    } catch (error) {
        console.error('Failed to save settings:', error);
        window.dashboard.showToast('Error saving settings', 'danger');
    }
}

// Function to save terms of service
async function saveTerms() {
    try {
        const terms = {
            language: document.getElementById('termsLanguage').value,
            title: document.getElementById('termsTitle').value,
            content: document.getElementById('termsContent').value,
            lastUpdated: new Date().toISOString()
        };
        
        // Validate content
        if (!terms.title.trim() || !terms.content.trim()) {
            window.dashboard.showToast('Please fill all fields', 'warning');
            return;
        }
        
        // Simulate saving terms
        await simulateAPICall(800);
        
        window.dashboard.showToast('Terms of service saved successfully', 'success');
        
    } catch (error) {
        console.error('Failed to save terms:', error);
        window.dashboard.showToast('Error saving terms', 'danger');
    }
}

// Function to save privacy policy
async function savePrivacy() {
    try {
        const privacy = {
            language: document.getElementById('privacyLanguage').value,
            title: document.getElementById('privacyTitle').value,
            content: document.getElementById('privacyContent').value,
            lastUpdated: new Date().toISOString()
        };
        
        // Validate content
        if (!privacy.title.trim() || !privacy.content.trim()) {
            window.dashboard.showToast('Please fill all fields', 'warning');
            return;
        }
        
        // Simulate saving privacy policy
        await simulateAPICall(800);
        
        window.dashboard.showToast('Privacy policy saved successfully', 'success');
        
    } catch (error) {
        console.error('Failed to save privacy policy:', error);
        window.dashboard.showToast('Error saving privacy policy', 'danger');
    }
}

// Function to load admins
async function loadAdmins() {
    try {
        // Simulate fetching admins
        const mockAdmins = [
            {
                id: 1,
                name: 'System Admin',
                email: 'admin@datingapp.com',
                role: 'admin',
                status: 'active',
                lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                name: 'Moderator User',
                email: 'moderator@datingapp.com',
                role: 'moderator',
                status: 'active',
                lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        displayAdmins(mockAdmins);
        
    } catch (error) {
        console.error('Failed to load admins:', error);
        window.dashboard.showToast('Error loading admin list', 'danger');
    }
}

// Function to display admins
function displayAdmins(admins) {
    const tbody = document.getElementById('adminsTableBody');
    tbody.innerHTML = '';
    
    admins.forEach(admin => {
        const row = document.createElement('tr');
        
        // Determine role badge
        const roleBadge = admin.role === 'admin' ? 
            '<span class="badge bg-primary">Admin</span>' : 
            '<span class="badge bg-secondary">Moderator</span>';
        
        // Determine status badge
        const statusBadge = admin.status === 'active' ? 
            '<span class="badge bg-success">Active</span>' : 
            '<span class="badge bg-danger">Inactive</span>';
        
        row.innerHTML = `
            <td>${admin.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar me-2">
                        <i class="fas fa-user-circle fa-lg"></i>
                    </div>
                    <div>
                        <strong>${admin.name}</strong>
                    </div>
                </div>
            </td>
            <td>${admin.email}</td>
            <td>${roleBadge}</td>
            <td>${statusBadge}</td>
            <td>${formatTimeAgo(admin.lastActive)}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button type="button" class="btn btn-outline-warning" onclick="editAdmin(${admin.id})" ${admin.id === 1 ? 'disabled' : ''}>
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-outline-danger" onclick="deleteAdminPrompt(${admin.id})" ${admin.id === 1 ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Function to add new admin
async function addNewAdmin() {
    const name = document.getElementById('newAdminName').value;
    const email = document.getElementById('newAdminEmail').value;
    const role = document.getElementById('newAdminRole').value;
    const password = document.getElementById('newAdminPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
        window.dashboard.showToast('Please fill all required fields', 'warning');
        return;
    }
    
    if (password !== confirmPassword) {
        window.dashboard.showToast('Passwords do not match', 'warning');
        return;
    }
    
    if (password.length < 8) {
        window.dashboard.showToast('Password must be at least 8 characters', 'warning');
        return;
    }
    
    try {
        // Simulate adding admin
        await simulateAPICall(1000);
        
        window.dashboard.showToast('Admin added successfully', 'success');
        
        // Close modal and refresh list
        bootstrap.Modal.getInstance(document.getElementById('addAdminModal')).hide();
        loadAdmins();
        
        // Clear form
        document.getElementById('newAdminName').value = '';
        document.getElementById('newAdminEmail').value = '';
        document.getElementById('newAdminPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
    } catch (error) {
        console.error('Failed to add admin:', error);
        window.dashboard.showToast('Error adding admin', 'danger');
    }
}

// Function to delete admin
async function deleteAdminPrompt(adminId) {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    
    try {
        // Simulate deleting admin
        await simulateAPICall(800);
        
        window.dashboard.showToast('Admin deleted successfully', 'success');
        loadAdmins();
        
    } catch (error) {
        console.error('Failed to delete admin:', error);
        window.dashboard.showToast('Error deleting admin', 'danger');
    }
}

// Function to toggle API key visibility
function toggleApiKey(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Function to copy to clipboard
function copyToClipboard(inputId) {
    const input = document.getElementById(inputId);
    input.select();
    document.execCommand('copy');
    
    window.dashboard.showToast('Copied to clipboard', 'success');
}

// Function to test API connection
async function testApiConnection() {
    const endpoint = document.getElementById('testEndpoint').value;
    
    try {
        // Simulate API test
        await simulateAPICall(1500);
        
        const resultDiv = document.getElementById('testResult');
        resultDiv.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            Connection successful to ${endpoint}
        `;
        resultDiv.className = 'alert alert-success';
        resultDiv.classList.remove('d-none');
        
    } catch (error) {
        const resultDiv = document.getElementById('testResult');
        resultDiv.innerHTML = `
            <i class="fas fa-times-circle me-2"></i>
            Connection failed: ${error.message}
        `;
        resultDiv.className = 'alert alert-danger';
        resultDiv.classList.remove('d-none');
    }
}

// Function to save API settings
async function saveApiSettings() {
    try {
        const settings = {
            apiBaseUrl: document.getElementById('apiBaseUrl').value,
            apiRateLimit: parseInt(document.getElementById('apiRateLimit').value),
            apiTimeout: parseInt(document.getElementById('apiTimeout').value),
            apiLogLevel: document.getElementById('apiLogLevel').value,
            enableApiLogging: document.getElementById('enableApiLogging').checked,
            logSensitiveData: document.getElementById('logSensitiveData').checked,
            logRetentionDays: parseInt(document.getElementById('logRetentionDays').value)
        };
        
        // Validate data
        if (!settings.apiBaseUrl.trim()) {
            window.dashboard.showToast('API Base URL is required', 'warning');
            return;
        }
        
        // Simulate saving API settings
        await simulateAPICall(1000);
        
        window.dashboard.showToast('API settings saved successfully', 'success');
        
    } catch (error) {
        console.error('Failed to save API settings:', error);
        window.dashboard.showToast('Error saving API settings', 'danger');
    }
}

// Function to save all settings
async function saveAllSettings() {
    await saveGeneralSettings();
    await saveApiSettings();
}

// Helper functions
function simulateAPICall(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

function formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
        return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hours ago`;
    } else if (diffDays < 30) {
        return `${diffDays} days ago`;
    } else {
        return new Date(dateString).toLocaleDateString('en-US');
    }
}

// Preview functions for terms and privacy
function previewTerms() {
    const content = document.getElementById('termsContent').value;
    window.open().document.write(`
        <html>
        <head>
            <title>Terms of Service Preview</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="container mt-5">
            <div class="card">
                <div class="card-header">
                    <h2>${document.getElementById('termsTitle').value}</h2>
                </div>
                <div class="card-body">
                    ${content.replace(/\n/g, '<br>')}
                </div>
            </div>
        </body>
        </html>
    `);
}

function previewPrivacy() {
    const content = document.getElementById('privacyContent').value;
    window.open().document.write(`
        <html>
        <head>
            <title>Privacy Policy Preview</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="container mt-5">
            <div class="card">
                <div class="card-header">
                    <h2>${document.getElementById('privacyTitle').value}</h2>
                </div>
                <div class="card-body">
                    ${content.replace(/\n/g, '<br>')}
                </div>
            </div>
        </body>
        </html>
    `);
}

// Reset functions
function resetTerms() {
    if (confirm('Reset terms of service to default?')) {
        document.getElementById('termsTitle').value = 'Terms of Service';
        document.getElementById('termsContent').value = `# Terms of Service\n\n## 1. Acceptance\nBy using this app, you agree to these terms.\n\n## 2. Requirements\n- Must be 18 years or older\n- Provide accurate information\n- One account per user\n\n## 3. Behavior\n- Respect all users\n- No inappropriate content\n- Maintain privacy\n- Report unacceptable behavior\n\nLast updated: ${new Date().toLocaleDateString('en-US')}`;
    }
}

function resetPrivacy() {
    if (confirm('Reset privacy policy to default?')) {
        document.getElementById('privacyTitle').value = 'Privacy Policy';
        document.getElementById('privacyContent').value = `# Privacy Policy\n\n## 1. Information We Collect\nWe collect information to improve your experience:\n- Personal information (name, age, gender)\n- Location information\n- Photos and content you share\n- Device and browser information\n\n## 2. How We Use Information\nWe use your information to:\n- Provide app services\n- Improve user experience\n- Communicate updates\n- Protect app security\n\nLast updated: ${new Date().toLocaleDateString('en-US')}`;
    }
}