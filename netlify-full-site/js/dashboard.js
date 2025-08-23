// Dashboard-specific functionality

// Real-time updates simulation
let updateInterval;

function initDashboard() {
    startRealTimeUpdates();
    initPerformanceMetrics();
    updateLastActivity();
}

function startRealTimeUpdates() {
    updateInterval = setInterval(() => {
        updateLiveStats();
        updateActivityFeed();
        updateNotifications();
    }, 30000); // Update every 30 seconds
}

function stopRealTimeUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
}

function updateLiveStats() {
    // Simulate live data updates
    const stats = [
        { selector: '.stat-number[data-target="1247"]', min: 1200, max: 1300 },
        { selector: '.stat-number[data-target="89.4"]', min: 80, max: 95, decimal: true },
        { selector: '.stat-number[data-target="23"]', min: 20, max: 30 },
        { selector: '.stat-number[data-target="12"]', min: 10, max: 15 }
    ];
    
    stats.forEach(stat => {
        const element = document.querySelector(stat.selector);
        if (element) {
            const currentValue = parseFloat(element.textContent.replace(/[^\d.]/g, ''));
            const change = (Math.random() - 0.5) * 10; // Random change
            let newValue = Math.max(stat.min, Math.min(stat.max, currentValue + change));
            
            if (stat.decimal) {
                newValue = newValue.toFixed(1);
            } else {
                newValue = Math.floor(newValue);
            }
            
            element.textContent = stat.decimal ? newValue : newValue.toLocaleString();
        }
    });
}

function updateActivityFeed() {
    const activities = [
        {
            icon: 'success',
            text: 'Новая конверсия по офферу "Casino Royal"',
            time: 'только что',
            value: '+$' + (Math.random() * 50 + 10).toFixed(2)
        },
        {
            icon: 'info', 
            text: 'Клик по офферу "Crypto Investment"',
            time: '1 минуту назад',
            value: null
        },
        {
            icon: 'success',
            text: 'Постбэк успешно доставлен',
            time: '3 минуты назад',
            value: null
        }
    ];
    
    // Add new activity to the top
    const activityList = document.getElementById('activityList');
    if (activityList && Math.random() > 0.7) { // 30% chance to add new activity
        const newActivity = activities[Math.floor(Math.random() * activities.length)];
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item';
        activityElement.style.opacity = '0';
        activityElement.innerHTML = `
            <div class="activity-icon ${newActivity.icon}">${getActivityIcon(newActivity.icon)}</div>
            <div class="activity-content">
                <div class="activity-text">${newActivity.text}</div>
                <div class="activity-time">${newActivity.time}</div>
            </div>
            ${newActivity.value ? `<div class="activity-value">${newActivity.value}</div>` : ''}
        `;
        
        activityList.insertBefore(activityElement, activityList.firstChild);
        
        // Animate in
        setTimeout(() => {
            activityElement.style.opacity = '1';
            activityElement.style.animation = 'slideInLeft 0.3s ease';
        }, 100);
        
        // Remove oldest if more than 5
        const items = activityList.querySelectorAll('.activity-item');
        if (items.length > 5) {
            items[items.length - 1].remove();
        }
    }
}

function updateNotifications() {
    // Simulate new notifications
    if (Math.random() > 0.9) { // 10% chance
        const notifications = [
            'Новый партнер ожидает одобрения',
            'Превышен лимит кликов по офферу',
            'Обнаружена подозрительная активность',
            'Успешно доставлено 50 постбэков'
        ];
        
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        showNotification(randomNotification, 'info');
    }
}

function initPerformanceMetrics() {
    // Calculate performance metrics
    const metrics = {
        clickThroughRate: 2.4,
        conversionRate: 1.84,
        averagePayout: 23.50,
        totalRevenue: 1247.89
    };
    
    // Update performance indicators
    updatePerformanceIndicators(metrics);
}

function updatePerformanceIndicators(metrics) {
    // This would update performance charts and indicators
    console.log('Performance metrics updated:', metrics);
}

function updateLastActivity() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Update any "last updated" timestamps
    const lastUpdated = document.querySelectorAll('.last-updated');
    lastUpdated.forEach(element => {
        element.textContent = `Обновлено в ${timeString}`;
    });
}

// Advanced filtering and search
function initAdvancedFiltering() {
    const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="Поиск"]');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', debounce(function(e) {
            const searchTerm = e.target.value.toLowerCase();
            performAdvancedSearch(searchTerm);
        }, 300));
    });
}

function performAdvancedSearch(term) {
    // Advanced search logic for multiple data types
    const searchableElements = document.querySelectorAll('[data-searchable]');
    
    searchableElements.forEach(element => {
        const content = element.textContent.toLowerCase();
        const isMatch = content.includes(term) || term === '';
        
        const row = element.closest('tr, .card, .item');
        if (row) {
            row.style.display = isMatch ? '' : 'none';
        }
    });
}

// Export functionality
function exportData(type) {
    const exportTypes = {
        'offers': exportOffers,
        'partners': exportPartners,
        'analytics': exportAnalytics,
        'activity': exportActivity
    };
    
    const exportFunction = exportTypes[type];
    if (exportFunction) {
        exportFunction();
    }
}

function exportOffers() {
    const offers = [];
    const rows = document.querySelectorAll('#offersTableBody tr:not([style*="display: none"])');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        offers.push({
            id: cells[1].textContent.trim(),
            name: row.querySelector('.offer-name').textContent.trim(),
            category: row.querySelector('.category-tag').textContent.trim(),
            payout: row.querySelector('.payout').textContent.trim(),
            cr: row.querySelector('.cr-rate').textContent.trim(),
            status: row.querySelector('.status-badge').textContent.trim()
        });
    });
    
    downloadCSV(offers, 'offers_export.csv');
}

function exportAnalytics() {
    const analytics = {
        totalClicks: document.querySelector('.stat-number[data-target="1247"]').textContent,
        totalRevenue: document.querySelector('.stat-number[data-target="89.4"]').textContent,
        conversions: document.querySelector('.stat-number[data-target="23"]').textContent,
        activeOffers: document.querySelector('.stat-number[data-target="12"]').textContent,
        exportDate: new Date().toLocaleString('ru-RU')
    };
    
    const data = [Object.keys(analytics), Object.values(analytics)];
    downloadCSV(data, 'analytics_export.csv');
}

function exportActivity() {
    const activities = [];
    const items = document.querySelectorAll('.activity-item');
    
    items.forEach(item => {
        activities.push({
            text: item.querySelector('.activity-text').textContent,
            time: item.querySelector('.activity-time').textContent,
            value: item.querySelector('.activity-value')?.textContent || ''
        });
    });
    
    downloadCSV(activities, 'activity_export.csv');
}

function downloadCSV(data, filename) {
    let csvContent = '';
    
    if (Array.isArray(data[0])) {
        // Array of arrays format
        csvContent = data.map(row => row.join(',')).join('\n');
    } else {
        // Array of objects format
        const headers = Object.keys(data[0]);
        csvContent = headers.join(',') + '\n';
        csvContent += data.map(item => 
            headers.map(header => item[header] || '').join(',')
        ).join('\n');
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    window.URL.revokeObjectURL(url);
    showNotification(`Файл ${filename} загружен`);
}

// Keyboard shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Only trigger if not in an input field
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            switch(e.key) {
                case '1':
                    showSection('dashboard');
                    break;
                case '2':
                    showSection('offers');
                    break;
                case '3':
                    showSection('partners');
                    break;
                case '4':
                    showSection('analytics');
                    break;
                case '5':
                    showSection('postback');
                    break;
                case 'Escape':
                    closeModal();
                    break;
            }
        }
    });
}

// Data persistence in localStorage
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to save to localStorage:', e);
    }
}

function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.warn('Failed to load from localStorage:', e);
        return defaultValue;
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (currentSection === 'dashboard') {
        initDashboard();
    }
    
    initAdvancedFiltering();
    initKeyboardShortcuts();
});

// Cleanup when leaving dashboard
window.addEventListener('beforeunload', function() {
    stopRealTimeUpdates();
});

// Fetch dashboard data (if needed by external code)
function fetchDashboard() {
    // Initialize dashboard data loading
    initDashboard();
    
    // This function can be extended to fetch data from API if needed
    console.log('Dashboard data fetched and initialized');
    
    // Return a promise for consistency with async operations
    return Promise.resolve({
        success: true,
        message: 'Dashboard initialized successfully'
    });
}

// Export functions
window.initDashboard = initDashboard;
window.fetchDashboard = fetchDashboard;
window.exportData = exportData;
window.downloadCSV = downloadCSV;