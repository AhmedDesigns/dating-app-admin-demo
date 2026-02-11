// dashboard.js - Dashboard and Statistics
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!window.auth.protectPage()) return;
    
    // Display user name
    const currentUser = window.getUser();
    if (currentUser && document.getElementById('userName')) {
        document.getElementById('userName').textContent = currentUser.name;
    }
    
    // Setup logout event
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.auth.logout();
        });
    }
    
    // Initialize dark mode
    if (window.darkMode) {
        window.darkMode.initializeDarkMode();
    }
    
    // Initialize branding
    if (window.branding) {
        window.branding.initializeBranding();
    }
    
    // Load dashboard data
    loadDashboardData();
    
    // Create charts (using static data for now as backend doesn't provide historical data yet)
    createCharts();
});

// Function to load dashboard data
async function loadDashboardData() {
    try {
        const stats = await window.api.getDashboardStats();
        
        // Update values on page
        const elements = {
            'totalUsers': stats.totalUsers,
            'dashboardTotalUsers': stats.totalUsers,
            'dashboardPendingReports': stats.pendingReports,
            'newReports': stats.pendingReports,
            'reportsBadge': stats.pendingReports,
            'dashboardTodayMatches': stats.totalMatches
        };

        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.textContent = formatNumber(value);
        }
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showToast('Error loading data', 'danger');
    }
}

// Function to create charts
function createCharts() {
    // User growth chart
    const usersCtx = document.getElementById('usersChart');
    if (!usersCtx) return;
    
    const usersChart = new Chart(usersCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'New Users',
                data: [5, 12, 8, 15, 10, 20, 18],
                borderColor: '#6a11cb',
                backgroundColor: 'rgba(106, 17, 203, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { 
                        font: { family: 'Inter' },
                        color: getComputedStyle(document.body).getPropertyValue('--text-color')
                    }
                }
            }
        }
    });
    
    window.usersChart = usersChart;
}

// Function to format numbers
function formatNumber(num) {
    if (num === undefined || num === null) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Function to show toast notifications
function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

// Export functions for use in other files
window.dashboard = {
    loadDashboardData,
    showToast,
    formatNumber
};
