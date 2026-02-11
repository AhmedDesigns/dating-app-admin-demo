// photos.js - Photo Management
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!window.auth.protectPage()) return;
    
    // Display user name
    const currentUser = window.auth.getCurrentUser();
    document.getElementById('userName').textContent = currentUser.name;
    
    // Setup logout event
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        window.auth.logout();
    });
    
    // Setup search and filter events
    document.getElementById('searchInput').addEventListener('input', debounce(loadPhotos, 500));
    document.getElementById('statusFilter').addEventListener('change', loadPhotos);
    document.getElementById('timeFilter').addEventListener('change', loadPhotos);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    document.getElementById('showPending').addEventListener('click', () => filterByStatus('pending'));
    document.getElementById('showApproved').addEventListener('click', () => filterByStatus('approved'));
    document.getElementById('showRejected').addEventListener('click', () => filterByStatus('rejected'));
    
    // Load photos
    loadPhotos();
});

// Variables for photo management
let currentPage = 1;
const itemsPerPage = 12;
let totalPhotos = 0;
let currentPhotoId = null;
let selectedPhotos = new Set();

// Function to load photos
async function loadPhotos() {
    try {
        // Show loading spinner
        document.getElementById('loadingSpinner').classList.remove('d-none');
        document.getElementById('photosContainer').innerHTML = '';
        
        // Collect filter criteria
        const searchTerm = document.getElementById('searchInput').value;
        const status = document.getElementById('statusFilter').value;
        const timeFilter = document.getElementById('timeFilter').value;
        
        // Simulate fetching data from API
        await simulateAPICall(1000);
        
        // Generate mock photos
        const mockPhotos = generateMockPhotos(48);
        
        // Apply filtering
        let filteredPhotos = mockPhotos;
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredPhotos = filteredPhotos.filter(photo => 
                photo.userName.toLowerCase().includes(term)
            );
        }
        
        if (status && status !== 'all') {
            filteredPhotos = filteredPhotos.filter(photo => photo.status === status);
        }
        
        if (timeFilter !== 'all') {
            const now = new Date();
            let cutoffDate;
            
            switch(timeFilter) {
                case 'today':
                    cutoffDate = new Date(now.setDate(now.getDate() - 1));
                    break;
                case 'week':
                    cutoffDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
            }
            
            filteredPhotos = filteredPhotos.filter(photo => 
                new Date(photo.uploadedAt) >= cutoffDate
            );
        }
        
        // Update statistics
        updateStats(mockPhotos);
        
        // Save data
        totalPhotos = filteredPhotos.length;
        
        // Calculate pages
        const totalPages = Math.ceil(totalPhotos / itemsPerPage);
        
        // Extract photos for current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pagePhotos = filteredPhotos.slice(startIndex, endIndex);
        
        // Display photos
        displayPhotos(pagePhotos);
        
        // Update pagination
        updatePagination(totalPages);
        
        // Hide loading spinner
        document.getElementById('loadingSpinner').classList.add('d-none');
        
    } catch (error) {
        console.error('Failed to load photos:', error);
        window.dashboard.showToast('Error loading photos', 'danger');
        document.getElementById('loadingSpinner').classList.add('d-none');
    }
}

// Function to update statistics
function updateStats(photos) {
    const pending = photos.filter(p => p.status === 'pending').length;
    const approvedToday = photos.filter(p => 
        p.status === 'approved' && 
        new Date(p.reviewedAt).toDateString() === new Date().toDateString()
    ).length;
    const rejectedToday = photos.filter(p => 
        p.status === 'rejected' && 
        new Date(p.reviewedAt).toDateString() === new Date().toDateString()
    ).length;
    const total = photos.length;
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('approvedToday').textContent = approvedToday;
    document.getElementById('rejectedToday').textContent = rejectedToday;
    document.getElementById('totalPhotos').textContent = total;
}

// Function to display photos
function displayPhotos(photos) {
    const container = document.getElementById('photosContainer');
    container.innerHTML = '';
    
    if (photos.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-images fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No photos found</h5>
                <p class="text-muted">No photos match your search criteria</p>
            </div>
        `;
        return;
    }
    
    photos.forEach(photo => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-lg-3 mb-4';
        
        // Determine status badge
        let statusBadge = '';
        if (photo.status === 'pending') {
            statusBadge = '<span class="badge bg-warning photo-status">Pending</span>';
        } else if (photo.status === 'approved') {
            statusBadge = '<span class="badge bg-success photo-status">Approved</span>';
        } else {
            statusBadge = '<span class="badge bg-danger photo-status">Rejected</span>';
        }
        
        col.innerHTML = `
            <div class="card photo-card">
                <div class="photo-image" style="background-image: url('${photo.url}')">
                    ${statusBadge}
                    <div class="form-check" style="position: absolute; top: 10px; left: 10px;">
                        <input class="form-check-input photo-checkbox" type="checkbox" 
                               value="${photo.id}" ${photo.status !== 'pending' ? 'disabled' : ''}
                               onchange="togglePhotoSelection(${photo.id}, this.checked)">
                    </div>
                </div>
                <div class="user-info">
                    <div class="d-flex align-items-center">
                        <div class="avatar-sm me-2">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div>
                            <h6 class="mb-0">${photo.userName}</h6>
                            <small class="text-muted">ID: ${photo.userId}</small>
                        </div>
                    </div>
                    <div class="photo-meta mt-2">
                        <small><i class="fas fa-calendar me-1"></i>${formatDate(photo.uploadedAt)}</small>
                    </div>
                </div>
                <div class="photo-actions">
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-sm btn-success" onclick="approvePhotoPrompt(${photo.id})" 
                                ${photo.status !== 'pending' ? 'disabled' : ''}>
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="rejectPhotoPrompt(${photo.id})" 
                                ${photo.status !== 'pending' ? 'disabled' : ''}>
                            <i class="fas fa-times"></i> Reject
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="viewPhotoDetails(${photo.id})">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(col);
    });
}

// Function to toggle photo selection
function togglePhotoSelection(photoId, isSelected) {
    if (isSelected) {
        selectedPhotos.add(photoId);
    } else {
        selectedPhotos.delete(photoId);
    }
    
    updateBulkSelectUI();
}

// Function to update bulk select UI
function updateBulkSelectUI() {
    const bulkContainer = document.getElementById('bulkSelectContainer');
    const selectedCount = document.getElementById('selectedCount');
    
    if (selectedPhotos.size > 0) {
        bulkContainer.classList.remove('d-none');
        selectedCount.textContent = selectedPhotos.size;
    } else {
        bulkContainer.classList.add('d-none');
    }
}

// Function to view photo details
async function viewPhotoDetails(photoId) {
    try {
        currentPhotoId = photoId;
        
        // Simulate fetching photo data
        const mockPhotos = generateMockPhotos(1);
        const photo = mockPhotos[0];
        photo.id = photoId;
        
        // Update modal content
        const content = document.getElementById('photoDetailsContent');
        content.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <img src="${photo.url}" class="img-fluid rounded photo-modal-image" alt="User photo">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h6>User Information</h6>
                            <div class="d-flex align-items-center mb-3">
                                <div class="avatar me-3">
                                    <i class="fas fa-user-circle fa-2x"></i>
                                </div>
                                <div>
                                    <h5 class="mb-0">${photo.userName}</h5>
                                    <p class="text-muted mb-0">ID: ${photo.userId}</p>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <strong>Status:</strong>
                                <p>
                                    ${photo.status === 'pending' ? 
                                        '<span class="badge bg-warning">Pending Review</span>' : 
                                     photo.status === 'approved' ? 
                                        '<span class="badge bg-success">Approved</span>' : 
                                        '<span class="badge bg-danger">Rejected</span>'}
                                </p>
                            </div>
                            
                            <div class="mb-3">
                                <strong>Uploaded:</strong>
                                <p>${formatDate(photo.uploadedAt)}</p>
                            </div>
                            
                            ${photo.reviewedAt ? `
                                <div class="mb-3">
                                    <strong>Reviewed:</strong>
                                    <p>${formatDate(photo.reviewedAt)}</p>
                                </div>
                            ` : ''}
                            
                            ${photo.reviewNotes ? `
                                <div class="mb-3">
                                    <strong>Review Notes:</strong>
                                    <p class="alert alert-info">${photo.reviewNotes}</p>
                                </div>
                            ` : ''}
                            
                            <div class="mb-3">
                                <strong>Photo Information:</strong>
                                <ul class="list-unstyled">
                                    <li><i class="fas fa-camera me-2"></i> Resolution: ${photo.resolution || 'Unknown'}</li>
                                    <li><i class="fas fa-file-image me-2"></i> Format: ${photo.format || 'JPEG'}</li>
                                    <li><i class="fas fa-weight me-2"></i> Size: ${photo.size || '2.4 MB'}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('photoDetailsModal'));
        modal.show();
        
    } catch (error) {
        console.error('Failed to load photo details:', error);
        window.dashboard.showToast('Error loading photo details', 'danger');
    }
}

// Function to approve photo prompt
function approvePhotoPrompt(photoId) {
    if (!confirm('Are you sure you want to approve this photo?')) return;
    
    approvePhoto(photoId);
}

// Function to approve photo
async function approvePhoto(photoId) {
    try {
        // Simulate approving photo
        await simulateAPICall(800);
        
        window.dashboard.showToast('Photo approved successfully', 'success');
        
        // Remove from selected photos
        selectedPhotos.delete(photoId);
        
        // Refresh photo list
        loadPhotos();
        
        // Close modal if open
        const modal = bootstrap.Modal.getInstance(document.getElementById('photoDetailsModal'));
        if (modal) modal.hide();
        
    } catch (error) {
        console.error('Failed to approve photo:', error);
        window.dashboard.showToast('Error approving photo', 'danger');
    }
}

// Function to reject photo prompt
function rejectPhotoPrompt(photoId = null) {
    if (photoId) {
        currentPhotoId = photoId;
    }
    
    document.getElementById('rejectPhotoId').value = currentPhotoId;
    document.getElementById('rejectReason').value = 'inappropriate';
    document.getElementById('customReason').value = '';
    document.getElementById('notifyUser').checked = true;
    
    const modal = new bootstrap.Modal(document.getElementById('rejectPhotoModal'));
    modal.show();
}

// Function to confirm photo rejection
async function confirmReject() {
    const photoId = document.getElementById('rejectPhotoId').value;
    const reason = document.getElementById('rejectReason').value;
    const customReason = document.getElementById('customReason').value;
    const notifyUser = document.getElementById('notifyUser').checked;
    
    try {
        // Simulate rejecting photo
        await simulateAPICall(800);
        
        let message = 'Photo rejected successfully';
        if (notifyUser) {
            message += ' and user notified';
        }
        
        window.dashboard.showToast(message, 'success');
        
        // Remove from selected photos
        selectedPhotos.delete(parseInt(photoId));
        
        // Close modals and refresh
        bootstrap.Modal.getInstance(document.getElementById('rejectPhotoModal')).hide();
        bootstrap.Modal.getInstance(document.getElementById('photoDetailsModal')).hide();
        
        loadPhotos();
        
    } catch (error) {
        console.error('Failed to reject photo:', error);
        window.dashboard.showToast('Error rejecting photo', 'danger');
    }
}

// Function for bulk approve
async function bulkApprove() {
    if (selectedPhotos.size === 0) {
        // If nothing selected, ask if they want to approve all pending
        if (!confirm('No photos selected. Approve all pending photos on this page?')) return;
        
        // Select all pending photos on current page
        document.querySelectorAll('.photo-checkbox:not(:disabled)').forEach(checkbox => {
            checkbox.checked = true;
            selectedPhotos.add(parseInt(checkbox.value));
        });
        
        updateBulkSelectUI();
        
        if (selectedPhotos.size === 0) {
            window.dashboard.showToast('No pending photos to approve', 'warning');
            return;
        }
    }
    
    if (!confirm(`Are you sure you want to approve ${selectedPhotos.size} selected photos?`)) return;
    
    try {
        // Simulate bulk approval
        await simulateAPICall(1500);
        
        window.dashboard.showToast(`${selectedPhotos.size} photos approved successfully`, 'success');
        
        // Clear selection and refresh
        selectedPhotos.clear();
        updateBulkSelectUI();
        loadPhotos();
        
    } catch (error) {
        console.error('Failed to bulk approve photos:', error);
        window.dashboard.showToast('Error bulk approving photos', 'danger');
    }
}

// Function to bulk approve selected
function bulkApproveSelected() {
    if (selectedPhotos.size === 0) {
        window.dashboard.showToast('Please select photos first', 'warning');
        return;
    }
    
    if (!confirm(`Approve ${selectedPhotos.size} selected photos?`)) return;
    
    // Approve each selected photo
    selectedPhotos.forEach(photoId => {
        approvePhoto(photoId);
    });
    
    // Clear selection
    selectedPhotos.clear();
    updateBulkSelectUI();
}

// Function to bulk reject selected
function bulkRejectSelected() {
    if (selectedPhotos.size === 0) {
        window.dashboard.showToast('Please select photos first', 'warning');
        return;
    }
    
    if (!confirm(`Reject ${selectedPhotos.size} selected photos?`)) return;
    
    // For simplicity, reject first one and prompt for reason
    const firstPhotoId = Array.from(selectedPhotos)[0];
    selectedPhotos.delete(firstPhotoId);
    rejectPhotoPrompt(firstPhotoId);
}

// Helper functions
function updatePagination(totalPages) {
    const pagination = document.getElementById('photosPagination');
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>`;
    pagination.appendChild(prevLi);
    
    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
        pagination.appendChild(li);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>`;
    pagination.appendChild(nextLi);
}

function changePage(page) {
    currentPage = page;
    selectedPhotos.clear();
    updateBulkSelectUI();
    loadPhotos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterByStatus(status) {
    document.getElementById('statusFilter').value = status;
    currentPage = 1;
    selectedPhotos.clear();
    updateBulkSelectUI();
    loadPhotos();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'pending';
    document.getElementById('timeFilter').value = 'today';
    currentPage = 1;
    selectedPhotos.clear();
    updateBulkSelectUI();
    loadPhotos();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function simulateAPICall(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

function generateMockPhotos(count) {
    const photos = [];
    const users = [
        { id: 1, name: 'Ahmed Mohamed' },
        { id: 2, name: 'Sara Khalid' },
        { id: 3, name: 'Mohammed Ali' },
        { id: 4, name: 'Fatima Said' },
        { id: 5, name: 'Khalid Abdullah' },
        { id: 6, name: 'Nora Hassan' }
    ];
    
    const statuses = ['pending', 'approved', 'rejected'];
    
    for (let i = 1; i <= count; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        photos.push({
            id: i,
            userId: user.id,
            userName: user.name,
            url: `https://picsum.photos/400/300?random=${i}`,
            status: status,
            uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
            reviewedAt: status !== 'pending' ? new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString() : null,
            reviewNotes: status !== 'pending' ? (status === 'approved' ? 'Photo meets guidelines' : 'Inappropriate content') : null,
            resolution: '1920x1080',
            format: 'JPEG',
            size: '2.4 MB'
        });
    }
    
    return photos;
}