// dark-mode.js - Universal Dark Mode Solution

console.log('🌙 Dark Mode JS loaded');


function initDarkMode() {
  console.log('🔄 Initializing dark mode...');
  
  const toggle = document.getElementById('darkModeToggle');
  if (!toggle) {
    console.error('❌ Dark mode toggle not found!');
    return;
  }
  

  const savedMode = localStorage.getItem('darkMode');
  console.log('📁 Saved mode:', savedMode);
  
  if (savedMode === 'dark') {
    console.log('🌙 Applying dark mode');
    applyDarkMode(true);
    toggle.checked = true;
  } else {
    console.log('☀️ Applying light mode');
    applyDarkMode(false);
    toggle.checked = false;
    if (!savedMode) localStorage.setItem('darkMode', 'light');
  }

  updateDarkModeIcon(toggle);
  

  toggle.addEventListener('change', function() {
    console.log('🔄 Toggle changed:', this.checked);
    applyDarkMode(this.checked);
    localStorage.setItem('darkMode', this.checked ? 'dark' : 'light');
    updateDarkModeIcon(this);
  });
  
  console.log('✅ Dark mode initialized');
}


function applyDarkMode(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
    

    applyDarkModeFixes();
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  }
}


function applyDarkModeFixes() {

  const cards = document.querySelectorAll('.card:not(.card-modern):not(.stat-card-modern)');
  cards.forEach(card => {
    if (!card.classList.contains('bg-gradient')) {
      card.style.backgroundColor = 'var(--card-bg)';
      card.style.borderColor = 'var(--border-color)';
      card.style.color = 'var(--text-color)';
    }
  });
  

  const secondaryTexts = document.querySelectorAll('.text-muted, .text-secondary');
  secondaryTexts.forEach(text => {
    text.style.color = '#94a3b8';
  });
  

  const filterButtons = document.querySelectorAll('.btn-outline-secondary');
  filterButtons.forEach(btn => {
    btn.style.borderColor = '#64748b';
    btn.style.color = '#94a3b8';
  });
  
  console.log('🔧 Applied dark mode fixes');
}


function updateDarkModeIcon(toggle) {
  const icon = toggle.nextElementSibling?.querySelector('i');
  if (!icon) return;
  
  if (toggle.checked) {
    icon.className = 'fas fa-sun';
    icon.style.color = '#FFD700';
    icon.parentElement.title = 'Switch to Light Mode';
  } else {
    icon.className = 'fas fa-moon';
    icon.style.color = '#B0B0B0';
    icon.parentElement.title = 'Switch to Dark Mode';
  }
}


document.addEventListener('DOMContentLoaded', initDarkMode);


window.addEventListener('load', function() {
  setTimeout(() => {
    const savedMode = localStorage.getItem('darkMode');
    const toggle = document.getElementById('darkModeToggle');
    
    if (toggle && savedMode) {
      const shouldBeDark = savedMode === 'dark';
      const isDark = document.body.classList.contains('dark-mode');
      
      if (shouldBeDark !== isDark) {
        console.log('⚠️ Correcting mode mismatch');
        applyDarkMode(shouldBeDark);
        toggle.checked = shouldBeDark;
        updateDarkModeIcon(toggle);
      }
    }
  }, 100);
});

window.darkMode = {
  init: initDarkMode,
  apply: applyDarkMode,
  updateIcon: updateDarkModeIcon
};