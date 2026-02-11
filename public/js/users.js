// users.js - User Management
document.addEventListener('DOMContentLoaded', function() {
    if (!window.auth.protectPage()) return;
    
    const user = window.getUser();
    if (user && user.role === 'moderator') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
    
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
    
    loadUsers();
});

let currentPage = 1;
const itemsPerPage = 20;
let totalUsers = 0;

async function loadUsers() {
    try {
        const result = await window.api.getUsers(currentPage, itemsPerPage);
        totalUsers = result.total;
        
        const counter = document.getElementById('totalUsersCount');
        if (counter) counter.textContent = totalUsers;
        
        displayUsers(result.data);
        updatePagination(Math.ceil(totalUsers / itemsPerPage));
        
    } catch (error) {
        console.error('Failed to load users:', error);
        if (window.dashboard) window.dashboard.showToast('Error loading users', 'danger');
    }
}

function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">No users found</td></tr>';
        return;
    }
    
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        const statusBadge = user.isBanned ? 
            '<span class="badge bg-danger">Banned</span>' : 
            '<span class="badge bg-success">Active</span>';
        
        row.innerHTML = `
            <td>${index + 1 + (currentPage - 1) * itemsPerPage}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar me-2">
                        <i class="fas fa-user-circle fa-lg"></i>
                    </div>
                    <div>
                        <strong>${user.name}</strong><br>
                        <small class="text-muted">${user.id}</small>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${user.gender || 'N/A'}</td>
            <td>${user.age || 'N/A'}</td>
            <td>${statusBadge}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    ${user.isBanned ? 
                        `<button class="btn btn-outline-success" onclick="unbanUser('${user.id}')"><i class="fas fa-unlock"></i></button>` : 
                        `<button class="btn btn-outline-danger" onclick="banUserPrompt('${user.id}')"><i class="fas fa-ban"></i></button>`
                    }
                    <button class="btn btn-outline-danger admin-only" onclick="deleteUserPrompt('${user.id}')"><i class="fas fa-trash"></i></button>
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
    loadUsers();
};

window.banUserPrompt = async (id) => {
    const reason = prompt("Enter ban reason:");
    if (reason) {
        try {
            await window.api.banUser(id, reason);
            loadUsers();
            window.dashboard.showToast("User banned", "success");
        } catch (e) {
            window.dashboard.showToast(e.message, "danger");
        }
    }
};

window.unbanUser = async (id) => {
    if (confirm("Unban this user?")) {
        try {
            await window.api.unbanUser(id);
            loadUsers();
            window.dashboard.showToast("User unbanned", "success");
        } catch (e) {
            window.dashboard.showToast(e.message, "danger");
        }
    }
};

window.deleteUserPrompt = async (id) => {
    if (confirm("Are you sure you want to delete this user? This action is irreversible.")) {
        try {
            await window.api.deleteUser(id);
            loadUsers();
            window.dashboard.showToast("User deleted", "success");
        } catch (e) {
            window.dashboard.showToast(e.message, "danger");
        }
    }
};
