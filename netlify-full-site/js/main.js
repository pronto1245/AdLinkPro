// Import unified theme utility
const ThemeUtils = window.ThemeUtils;

// Main application state
let currentSection = 'dashboard';
let currentLanguage = localStorage.getItem('language') || 'ru';

// Localization for theme messages
const messages = {
    ru: {
        themeChanged: 'Тема изменена на',
        lightTheme: 'светлую',
        darkTheme: 'темную',
        systemTheme: 'системную',
        lightThemeButton: 'Светлая тема',
        darkThemeButton: 'Темная тема',
        systemThemeButton: 'Системная тема',
        languageChanged: 'Язык изменен на',
        russian: 'русский',
        english: 'English'
    },
    en: {
        themeChanged: 'Theme changed to',
        lightTheme: 'light',
        darkTheme: 'dark',
        systemTheme: 'system',
        lightThemeButton: 'Light Theme',
        darkThemeButton: 'Dark Theme',  
        systemThemeButton: 'System Theme',
        languageChanged: 'Language changed to',
        russian: 'русский',
        english: 'English'
    }
};

function t(key) {
    return messages[currentLanguage]?.[key] || messages.ru[key] || key;
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Load theme utils first
    const script = document.createElement('script');
    script.src = '/shared/theme-utils.js';
    script.onload = function() {
        initTheme();
        initNavigation();
        initUserMenu();
        showSection('dashboard');
        initOffersManagement();
        animateCounters();
        loadActivityFeed();
        initCharts();
    };
    script.onerror = function() {
        // Fallback to basic theme initialization
        console.warn('Failed to load theme utils, using fallback');
        initThemeBasic();
        initNavigation();
        initUserMenu();
        showSection('dashboard');
        initOffersManagement();
        animateCounters();
        loadActivityFeed();
        initCharts();
    };
    document.head.appendChild(script);
});

// Theme Management with unified utility
function initTheme() {
    if (window.ThemeUtils) {
        const result = window.ThemeUtils.initTheme(true); // Use data-theme attribute
        updateThemeIcon();
        window.ThemeUtils.enableThemeTransitions();
    } else {
        initThemeBasic();
    }
}

// Fallback theme initialization
function initThemeBasic() {
    const savedTheme = localStorage.getItem('app-theme') || localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme === 'system' ? 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
        savedTheme);
    updateThemeIcon();
}

function toggleTheme() {
    if (window.ThemeUtils) {
        const resolvedTheme = window.ThemeUtils.toggleTheme(true);
        updateThemeIcon();
        
        const themeInfo = window.ThemeUtils.getThemeInfo();
        const themeKey = themeInfo.preference === 'system' ? 'systemTheme' : 
                        (resolvedTheme === 'dark' ? 'darkTheme' : 'lightTheme');
        
        showNotification(t('themeChanged') + ' ' + t(themeKey));
    } else {
        // Fallback toggle
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('app-theme', newTheme);
        updateThemeIcon();
        showNotification(t('themeChanged') + ' ' + t(newTheme === 'dark' ? 'darkTheme' : 'lightTheme'));
    }
}

function updateThemeIcon() {
    const buttons = document.querySelectorAll('[onclick="toggleTheme()"]');
    buttons.forEach(btn => {
        if (window.ThemeUtils) {
            const themeInfo = window.ThemeUtils.getThemeInfo();
            const resolved = themeInfo.resolved;
            const icon = resolved === 'light' ? '🌙' : '☀️';
            const text = resolved === 'light' ? t('darkThemeButton') : t('lightThemeButton');
            btn.innerHTML = `${icon} ${text}`;
        } else {
            // Fallback
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const icon = currentTheme === 'light' ? '🌙' : '☀️';
            const text = currentTheme === 'light' ? t('darkThemeButton') : t('lightThemeButton');
            btn.innerHTML = `${icon} ${text}`;
        }
    });
}

// Language Management
function toggleLanguage() {
    currentLanguage = currentLanguage === 'ru' ? 'en' : 'ru';
    localStorage.setItem('language', currentLanguage);
    updateLanguageContent();
    showNotification('Язык изменен на ' + (currentLanguage === 'ru' ? 'русский' : 'English'));
}

function updateLanguageContent() {
    // This would normally update all text content based on language
    // For demo purposes, we'll just show a notification
    console.log('Language updated to:', currentLanguage);
}

// Navigation Management
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a[onclick*="showSection"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('onclick').match(/showSection\('(.+?)'\)/)[1];
            showSection(section);
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.animation = 'fadeInUp 0.5s ease forwards';
    }
    
    currentSection = sectionName;
    
    // Update page title
    const titles = {
        'dashboard': 'Дашборд',
        'offers': 'Управление офферами',
        'partners': 'Партнеры',
        'analytics': 'Аналитика и отчеты',
        'postback': 'Настройка постбэков'
    };
    
    document.title = `${titles[sectionName] || sectionName} - Affiliate Pro`;
}

// User Menu Management
function initUserMenu() {
    document.addEventListener('click', function(e) {
        const userDropdown = document.getElementById('userDropdown');
        const userAvatar = document.querySelector('.user-avatar');
        
        if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('active');
}

function showProfile() {
    showModal('Профиль пользователя', `
        <div class="profile-form">
            <div class="form-group">
                <label>Имя пользователя:</label>
                <input type="text" value="advertiser1" readonly>
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" value="advertiser@example.com">
            </div>
            <div class="form-group">
                <label>Роль:</label>
                <input type="text" value="Рекламодатель" readonly>
            </div>
            <div class="form-group">
                <label>Дата регистрации:</label>
                <input type="text" value="15.01.2024" readonly>
            </div>
            <div class="form-group">
                <label>Последний вход:</label>
                <input type="text" value="11.08.2025 18:05" readonly>
            </div>
            <button class="btn btn-primary" onclick="saveProfile()">💾 Сохранить изменения</button>
        </div>
    `);
}

function saveProfile() {
    showNotification('Профиль успешно обновлен');
    closeModal();
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        showNotification('Выход из системы...');
        setTimeout(() => {
            // Simulate logout
            window.location.reload();
        }, 1000);
    }
}

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 16);
        
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (target % 1 !== 0) {
                counter.textContent = current.toFixed(1);
            } else {
                counter.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    });
}

// Activity Feed
function loadActivityFeed() {
    const activities = [
        {
            icon: 'success',
            text: 'Новая конверсия по офферу "Casino Royal"',
            time: '2 минуты назад',
            value: '+$15.50'
        },
        {
            icon: 'info',
            text: 'Клик по офферу "Crypto Investment"',
            time: '5 минут назад',
            value: null
        },
        {
            icon: 'warning',
            text: 'Подозрительная активность обнаружена',
            time: '10 минут назад',
            value: null
        },
        {
            icon: 'success',
            text: 'Новый партнер зарегистрировался',
            time: '1 час назад',
            value: null
        },
        {
            icon: 'info',
            text: 'Постбэк успешно доставлен',
            time: '2 часа назад',
            value: null
        }
    ];
    
    const activityList = document.getElementById('activityList');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.icon}">${getActivityIcon(activity.icon)}</div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
                ${activity.value ? `<div class="activity-value">${activity.value}</div>` : ''}
            </div>
        `).join('');
    }
}

function getActivityIcon(type) {
    const icons = {
        success: '✅',
        info: '🔗',
        warning: '⚠️'
    };
    return icons[type] || '📄';
}

function refreshActivity() {
    const activityList = document.getElementById('activityList');
    activityList.style.opacity = '0.5';
    
    setTimeout(() => {
        loadActivityFeed();
        activityList.style.opacity = '1';
        showNotification('Активность обновлена');
    }, 1000);
}

// Modal Management
function showModal(title, content) {
    const overlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    overlay.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.remove('active');
    
    // Restore body scroll
    document.body.style.overflow = '';
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification if it doesn't exist
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1rem;
            box-shadow: var(--shadow-lg);
            z-index: 10001;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.style.transform = 'translateX(0)';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
    }, 3000);
}

// Error Handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showNotification('Произошла ошибка. Обновите страницу.', 'error');
});

// Export functions for global access
window.showSection = showSection;
window.toggleTheme = toggleTheme;
window.toggleLanguage = toggleLanguage;
window.toggleUserMenu = toggleUserMenu;
window.showProfile = showProfile;
window.logout = logout;
window.refreshActivity = refreshActivity;
window.showModal = showModal;
window.closeModal = closeModal;
window.showNotification = showNotification;