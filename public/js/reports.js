// reports.js - Report Management
document.addEventListener('DOMContentLoaded', function() {
    if (!window.auth.protectPage()) return;
    
    const user = window.getUser();
    if (user && document.getElementById('userName')) {
        document.getElementById('userName').textContent = user.name;
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.auth.logout();
        });
    }
    
    loadReports();
});

let currentPage = 1;
const itemsPerPage = 20;
let totalReports = 0;

async function loadReports() {
    try {
        const result = await window.api.getReports(currentPage, itemsPerPage);
        totalReports = result.total;
        
        const counter = document.getElementById('totalReportsCount');
        if (counter) counter.textContent = totalReports;
        
        displayReports(result.data);
        updatePagination(Math.ceil(totalReports / itemsPerPage));
        
    } catch (error) {
        console.error('Failed to load reports:', error);
        if (window.dashboard) window.dashboard.showToast('Error loading reports', 'danger');
    }
}

function displayReports(reports) {
    const tbody = document.getElementById('reportsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (!reports || reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">No reports found</td></tr>';
        return;
    }
    
    reports.forEach((report, index) => {
        const row = document.createElement('tr');
        let statusBadge = '';
        if (report.status === 'pending') {
            statusBadge = '<span class="badge bg-warning">Pending</span>';
        } else if (report.status === 'resolved') {
            statusBadge = '<span class="badge bg-success">Resolved</span>';
        } else {
            statusBadge = '<span class="badge bg-secondary">Dismissed</span>';
        }
        
        row.innerHTML = `
            <td>${index + 1 + (currentPage - 1) * itemsPerPage}</td>
            <td><span class="badge bg-info">Report</span></td>
            <td>${report.reporterId}</td>
            <td>${report.reportedUserId}</td>
            <td>${report.reason}</td>
            <td>${statusBadge}</td>
            <td>${new Date(report.createdAt).toLocaleDateString()}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    ${report.status === 'pending' ? `
                        <button class="btn btn-outline-success" onclick="resolveReport('${report.id}', 'resolved')"><i class="fas fa-check"></i></button>
                        <button class="btn btn-outline-danger" onclick="resolveReport('${report.id}', 'dismissed')"><i class="fas fa-times"></i></button>
                    ` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination || totalPages <= 1) return;
    pagination.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
        pagination.appendChild(li);
    }
}

window.changePage = (page) => {
    currentPage = page;
    loadReports();
};

window.resolveReport = async (id, action) => {
    const note = prompt(`Enter note for ${action}:`);
    try {
        await window.api.resolveReport(id, action, note || '');
        loadReports();
        window.dashboard.showToast(`Report ${action}`, "success");
    } catch (e) {
        window.dashboard.showToast(e.message, "danger");
    }
};
