// branding.js - Logo and Favicon Upload Functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeBranding();
});

// Initialize branding
function initializeBranding() {
    // Load current logo and favicon
    loadCurrentBranding();
    
    // Set up file input change events
    const logoUpload = document.getElementById('logoUpload');
    const faviconUpload = document.getElementById('faviconUpload');
    
    if (logoUpload) {
        logoUpload.addEventListener('change', function(e) {
            previewImage(e.target, 'logoPreview', 'logoFileName');
        });
    }
    
    if (faviconUpload) {
        faviconUpload.addEventListener('change', function(e) {
            previewImage(e.target, 'faviconPreview', 'faviconFileName');
        });
    }
}

// Load current branding
function loadCurrentBranding() {
    // Load logo from localStorage or default
    const savedLogo = localStorage.getItem('dashboardLogo');
    const savedFavicon = localStorage.getItem('dashboardFavicon');
    
    if (savedLogo) {
        updateLogo(savedLogo);
        updateLogoPreview(savedLogo, 'logoPreview', 'logoFileName', 'logo.png');
    }
    
    if (savedFavicon) {
        updateFavicon(savedFavicon);
        updateLogoPreview(savedFavicon, 'faviconPreview', 'faviconFileName', 'favicon.ico');
    }
}

// Preview image before upload
function previewImage(input, previewId, fileNameId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const preview = document.getElementById(previewId);
            const fileName = document.getElementById(fileNameId);
            
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
            
            if (fileName) {
                fileName.textContent = input.files[0].name;
            }
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// Update logo preview
function updateLogoPreview(imageSrc, previewId, fileNameId, defaultName) {
    const preview = document.getElementById(previewId);
    const fileName = document.getElementById(fileNameId);
    
    if (preview) {
        preview.src = imageSrc;
        preview.style.display = 'block';
    }
    
    if (fileName) {
        fileName.textContent = defaultName;
    }
}

// Upload logo
function uploadLogo() {
    const logoInput = document.getElementById('logoUpload');
    
    if (!logoInput || !logoInput.files[0]) {
        window.dashboard.showToast('Please select a logo image first.', 'warning');
        return;
    }
    
    const file = logoInput.files[0];
    
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
        window.dashboard.showToast('Please upload a valid image (PNG, JPG, JPEG, SVG).', 'danger');
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        window.dashboard.showToast('Logo size should be less than 2MB.', 'danger');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // Save to localStorage
        localStorage.setItem('dashboardLogo', e.target.result);
        
        // Update logo on the page
        updateLogo(e.target.result);
        
        // Show success message
        window.dashboard.showToast('Logo uploaded successfully!', 'success');
        
        // Update preview
        updateLogoPreview(e.target.result, 'logoPreview', 'logoFileName', file.name);
        
        // Reset file input
        logoInput.value = '';
    };
    
    reader.onerror = function() {
        window.dashboard.showToast('Error uploading logo. Please try again.', 'danger');
    };
    
    reader.readAsDataURL(file);
}

// Upload favicon
function uploadFavicon() {
    const faviconInput = document.getElementById('faviconUpload');
    
    if (!faviconInput || !faviconInput.files[0]) {
        window.dashboard.showToast('Please select a favicon image first.', 'warning');
        return;
    }
    
    const file = faviconInput.files[0];
    
    // Check if file is valid (ICO or PNG)
    const validTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
        window.dashboard.showToast('Please upload an ICO or PNG file for the favicon.', 'danger');
        return;
    }
    
    // Validate file size (max 100KB for favicon)
    if (file.size > 100 * 1024) {
        window.dashboard.showToast('Favicon size should be less than 100KB.', 'danger');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // Save to localStorage
        localStorage.setItem('dashboardFavicon', e.target.result);
        
        // Update favicon on the page
        updateFavicon(e.target.result);
        
        // Show success message
        window.dashboard.showToast('Favicon uploaded successfully!', 'success');
        
        // Update preview
        updateLogoPreview(e.target.result, 'faviconPreview', 'faviconFileName', file.name);
        
        // Reset file input
        faviconInput.value = '';
    };
    
    reader.onerror = function() {
        window.dashboard.showToast('Error uploading favicon. Please try again.', 'danger');
    };
    
    reader.readAsDataURL(file);
}

// Update logo on the page
function updateLogo(imageSrc) {
    // Update navbar logo
    const navbarLogo = document.getElementById('navbar-logo');
    const logoIcon = document.getElementById('logo-icon');
    
    if (navbarLogo) {
        navbarLogo.src = imageSrc;
        navbarLogo.classList.remove('d-none');
    }
    
    if (logoIcon) {
        logoIcon.style.display = 'none';
    }
    
    // Update logo on all pages
    const allNavbarLogos = document.querySelectorAll('#navbar-logo');
    allNavbarLogos.forEach(logo => {
        logo.src = imageSrc;
        logo.classList.remove('d-none');
    });
    
    const allLogoIcons = document.querySelectorAll('#logo-icon');
    allLogoIcons.forEach(icon => {
        icon.style.display = 'none';
    });
}

// Update favicon on the page
function updateFavicon(imageSrc) {
    // Remove existing favicon links
    const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
    existingFavicons.forEach(favicon => favicon.remove());
    
    // Create new favicon element
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/x-icon';
    favicon.href = imageSrc;
    document.head.appendChild(favicon);
    
    // Also add shortcut icon for older browsers
    const shortcutIcon = document.createElement('link');
    shortcutIcon.rel = 'shortcut icon';
    shortcutIcon.href = imageSrc;
    document.head.appendChild(shortcutIcon);
    
    // Force favicon refresh
    const forceReload = document.createElement('link');
    forceReload.rel = 'icon';
    forceReload.type = 'image/x-icon';
    forceReload.href = imageSrc + '?v=' + Date.now();
    document.head.appendChild(forceReload);
    
    // Update favicon in all tabs
    document.querySelectorAll('link[rel="icon"]').forEach(link => {
        link.href = imageSrc + '?v=' + Date.now();
    });
}

// Reset branding to default
function resetBranding() {
    if (confirm('Are you sure you want to reset to default branding?')) {
        localStorage.removeItem('dashboardLogo');
        localStorage.removeItem('dashboardFavicon');
        
        // Reset logo
        const navbarLogo = document.getElementById('navbar-logo');
        const logoIcon = document.getElementById('logo-icon');
        
        if (navbarLogo) {
            navbarLogo.classList.add('d-none');
        }
        
        if (logoIcon) {
            logoIcon.style.display = 'inline-block';
        }
        
        // Reset favicon to default
        const defaultFavicon = 'assets/favicon.ico';
        updateFavicon(defaultFavicon);
        
        // Reset previews
        const logoPreview = document.getElementById('logoPreview');
        const faviconPreview = document.getElementById('faviconPreview');
        
        if (logoPreview) {
            logoPreview.src = 'assets/logo.png';
        }
        
        if (faviconPreview) {
            faviconPreview.src = defaultFavicon;
        }
        
        // Reset file names
        const logoFileName = document.getElementById('logoFileName');
        const faviconFileName = document.getElementById('faviconFileName');
        
        if (logoFileName) {
            logoFileName.textContent = 'No logo uploaded';
        }
        
        if (faviconFileName) {
            faviconFileName.textContent = 'No favicon uploaded';
        }
        
        // Clear file inputs
        const logoUpload = document.getElementById('logoUpload');
        const faviconUpload = document.getElementById('faviconUpload');
        
        if (logoUpload) logoUpload.value = '';
        if (faviconUpload) faviconUpload.value = '';
        
        window.dashboard.showToast('Branding reset to default.', 'success');
    }
}

// Export functions
window.branding = {
    initializeBranding,
    uploadLogo,
    uploadFavicon,
    resetBranding,
    updateLogo,
    updateFavicon
};