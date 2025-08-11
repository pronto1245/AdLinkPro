// Charts and Analytics
function initCharts() {
    drawClicksChart();
    drawConversionsChart();
}

function drawClicksChart() {
    const canvas = document.getElementById('clicksChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Sample data for the week
    const data = [120, 150, 180, 160, 200, 250, 180];
    const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    // Set styles
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color') + '20';
    ctx.lineWidth = 3;
    
    // Calculate dimensions
    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Find max value for scaling
    const maxValue = Math.max(...data);
    
    // Draw grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw data line
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
    data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted');
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    labels.forEach((label, index) => {
        const x = padding + (chartWidth / (labels.length - 1)) * index;
        ctx.fillText(label, x, height - 20);
    });
    
    // Draw values
    ctx.textAlign = 'left';
    for (let i = 0; i <= 5; i++) {
        const value = Math.round((maxValue / 5) * (5 - i));
        const y = padding + (chartHeight / 5) * i + 5;
        ctx.fillText(value.toString(), 10, y);
    }
}

function drawConversionsChart() {
    const canvas = document.getElementById('conversionsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Sample data
    const data = [
        { name: 'Casino Royal', value: 12, color: '#ef4444' },
        { name: 'Crypto Bot', value: 8, color: '#f59e0b' },
        { name: 'Dating Premium', value: 5, color: '#ec4899' },
        { name: 'Finance Pro', value: 3, color: '#10b981' }
    ];
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    let startAngle = 0;
    
    // Draw pie chart
    data.forEach(item => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();
        
        // Draw label
        const labelAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
        const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
        
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.value.toString(), labelX, labelY);
        
        startAngle += sliceAngle;
    });
    
    // Draw legend
    const legendY = height - 60;
    let legendX = 20;
    
    data.forEach(item => {
        // Color box
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, legendY, 12, 12);
        
        // Label
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(item.name, legendX + 18, legendY + 9);
        
        legendX += 80;
    });
}

// Partners Management
function showInvitePartnerModal() {
    showModal('Пригласить партнера', `
        <div class="invite-partner-form">
            <div class="form-group">
                <label>Email партнера:</label>
                <input type="email" placeholder="partner@example.com" id="partnerEmail">
            </div>
            <div class="form-group">
                <label>Имя партнера:</label>
                <input type="text" placeholder="Имя Фамилия" id="partnerName">
            </div>
            <div class="form-group">
                <label>Персональное сообщение:</label>
                <textarea rows="4" placeholder="Приглашение к сотрудничеству..." id="inviteMessage">Здравствуйте! Приглашаю вас к сотрудничеству на нашей партнерской платформе.</textarea>
            </div>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                <button class="btn btn-primary" onclick="sendInvitation()">📧 Отправить приглашение</button>
            </div>
        </div>
    `);
}

function sendInvitation() {
    const email = document.getElementById('partnerEmail').value;
    const name = document.getElementById('partnerName').value;
    const message = document.getElementById('inviteMessage').value;
    
    if (!email || !name) {
        showNotification('Заполните обязательные поля', 'error');
        return;
    }
    
    // Simulate sending invitation
    showNotification('Приглашение отправлено');
    closeModal();
    
    // Add to partners list
    setTimeout(() => {
        const partnersGrid = document.querySelector('.partners-grid');
        if (partnersGrid) {
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
            const newPartner = document.createElement('div');
            newPartner.className = 'partner-card';
            newPartner.innerHTML = `
                <div class="partner-avatar">
                    <span class="avatar-text">${initials}</span>
                </div>
                <div class="partner-info">
                    <h3>${name}</h3>
                    <span class="partner-email">${email}</span>
                    <span class="partner-status pending">Приглашен</span>
                </div>
                <div class="partner-stats">
                    <div class="stat">
                        <span class="stat-label">Клики</span>
                        <span class="stat-value">0</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Конверсии</span>
                        <span class="stat-value">0</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Заработок</span>
                        <span class="stat-value">$0</span>
                    </div>
                </div>
                <div class="partner-actions">
                    <button class="btn btn-sm" onclick="viewPartner('${email}')">👁️ Просмотр</button>
                    <button class="btn btn-sm" onclick="contactPartner('${email}')">💬 Связаться</button>
                </div>
            `;
            partnersGrid.appendChild(newPartner);
        }
    }, 1000);
}

function viewPartner(partnerId) {
    showModal('Информация о партнере', `
        <div class="partner-details">
            <div class="partner-profile">
                <div class="profile-header">
                    <div class="partner-avatar large">
                        <span class="avatar-text">JD</span>
                    </div>
                    <div class="profile-info">
                        <h3>John Doe</h3>
                        <span class="partner-email">john@example.com</span>
                        <span class="partner-status active">Активен</span>
                    </div>
                </div>
            </div>
            
            <div class="partner-metrics">
                <h4>Статистика за все время:</h4>
                <div class="metrics-grid">
                    <div class="metric-item">
                        <span class="metric-value">1,247</span>
                        <span class="metric-label">Клики</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-value">23</span>
                        <span class="metric-label">Конверсии</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-value">1.84%</span>
                        <span class="metric-label">CR</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-value">$567</span>
                        <span class="metric-label">Доход</span>
                    </div>
                </div>
            </div>
            
            <div class="partner-offers">
                <h4>Активные офферы:</h4>
                <ul class="offers-list">
                    <li>Casino Royal Premium - 8 кликов</li>
                    <li>Crypto Investment Bot - 12 кликов</li>
                    <li>Dating Premium - 3 клика</li>
                </ul>
            </div>
        </div>
        <style>
            .partner-details .profile-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--border-color);
            }
            .partner-details .partner-avatar.large {
                width: 80px;
                height: 80px;
                font-size: 1.5rem;
            }
            .partner-details .metrics-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                margin: 1rem 0;
            }
            .partner-details .metric-item {
                text-align: center;
                padding: 1rem;
                background: var(--bg-secondary);
                border-radius: 8px;
                border: 1px solid var(--border-color);
            }
            .partner-details .metric-value {
                display: block;
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--accent-color);
                margin-bottom: 0.25rem;
            }
            .partner-details .metric-label {
                font-size: 0.875rem;
                color: var(--text-muted);
            }
            .partner-details .offers-list {
                list-style: none;
                margin: 1rem 0;
            }
            .partner-details .offers-list li {
                padding: 0.5rem 0;
                border-bottom: 1px solid var(--border-color);
            }
            .partner-details .offers-list li:last-child {
                border-bottom: none;
            }
        </style>
    `);
}

function contactPartner(partnerId) {
    showModal('Связаться с партнером', `
        <div class="contact-form">
            <div class="form-group">
                <label>Тема сообщения:</label>
                <input type="text" placeholder="Введите тему" id="messageSubject">
            </div>
            <div class="form-group">
                <label>Сообщение:</label>
                <textarea rows="5" placeholder="Ваше сообщение..." id="messageText"></textarea>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="copyToEmail"> 
                    Отправить копию на email
                </label>
            </div>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                <button class="btn btn-primary" onclick="sendMessage('${partnerId}')">📧 Отправить</button>
            </div>
        </div>
    `);
}

function sendMessage(partnerId) {
    const subject = document.getElementById('messageSubject').value;
    const text = document.getElementById('messageText').value;
    
    if (!subject || !text) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    showNotification('Сообщение отправлено');
    closeModal();
}

function exportPartners() {
    showNotification('Экспорт партнеров начат...');
    
    // Simulate export
    setTimeout(() => {
        const data = [
            ['Имя', 'Email', 'Статус', 'Клики', 'Конверсии', 'Доход'],
            ['John Doe', 'john@example.com', 'Активен', '1247', '23', '$567']
        ];
        
        const csv = data.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'partners_export.csv';
        a.click();
        
        window.URL.revokeObjectURL(url);
        showNotification('Экспорт завершен');
    }, 1500);
}

// Analytics and Reports
function exportReport() {
    showModal('Экспорт отчета', `
        <div class="export-form">
            <div class="form-group">
                <label>Тип отчета:</label>
                <select id="reportType">
                    <option value="full">Полный отчет</option>
                    <option value="offers">Только офферы</option>
                    <option value="partners">Только партнеры</option>
                    <option value="conversions">Только конверсии</option>
                </select>
            </div>
            <div class="form-group">
                <label>Период:</label>
                <select id="reportPeriod">
                    <option value="today">Сегодня</option>
                    <option value="week">За неделю</option>
                    <option value="month">За месяц</option>
                    <option value="custom">Выбрать даты</option>
                </select>
            </div>
            <div class="form-group">
                <label>Формат:</label>
                <select id="reportFormat">
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                </select>
            </div>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                <button class="btn btn-primary" onclick="generateReport()">📊 Создать отчет</button>
            </div>
        </div>
    `);
}

function generateReport() {
    const type = document.getElementById('reportType').value;
    const period = document.getElementById('reportPeriod').value;
    const format = document.getElementById('reportFormat').value;
    
    showNotification('Создание отчета...');
    closeModal();
    
    setTimeout(() => {
        showNotification(`Отчет создан и отправлен на email в формате ${format.toUpperCase()}`);
    }, 2000);
}

// Postback Management
function testPostback() {
    showModal('Тестирование постбэка', `
        <div class="postback-test">
            <div class="form-group">
                <label>Тестовые данные:</label>
                <textarea rows="8" readonly id="testData">{
    "click_id": "test_123456",
    "offer_id": "1001",
    "payout": "25.00",
    "currency": "USD",
    "event_type": "conversion",
    "timestamp": "${new Date().toISOString()}"
}</textarea>
            </div>
            <div class="form-group">
                <label>URL для тестирования:</label>
                <input type="url" value="https://tracker.example.com/postback" readonly id="testUrl">
            </div>
            <div class="test-results" id="testResults" style="display: none;">
                <h4>Результат теста:</h4>
                <div class="result-item">
                    <span class="result-label">Статус:</span>
                    <span class="result-value success">✅ Успешно</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Время ответа:</span>
                    <span class="result-value">234ms</span>
                </div>
                <div class="result-item">
                    <span class="result-label">HTTP код:</span>
                    <span class="result-value">200 OK</span>
                </div>
            </div>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="closeModal()">Закрыть</button>
                <button class="btn btn-primary" onclick="runPostbackTest()">🧪 Запустить тест</button>
            </div>
        </div>
        <style>
            .postback-test .result-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid var(--border-color);
            }
            .postback-test .result-item:last-child {
                border-bottom: none;
            }
            .postback-test .result-value.success {
                color: var(--success-color);
            }
        </style>
    `);
}

function runPostbackTest() {
    const resultsDiv = document.getElementById('testResults');
    showNotification('Запуск теста...');
    
    // Simulate test
    setTimeout(() => {
        resultsDiv.style.display = 'block';
        showNotification('Тест постбэка завершен успешно');
    }, 1500);
}

// Export functions for global access
window.showInvitePartnerModal = showInvitePartnerModal;
window.sendInvitation = sendInvitation;
window.viewPartner = viewPartner;
window.contactPartner = contactPartner;
window.sendMessage = sendMessage;
window.exportPartners = exportPartners;
window.exportReport = exportReport;
window.generateReport = generateReport;
window.testPostback = testPostback;
window.runPostbackTest = runPostbackTest;

// Redraw charts on theme change
document.addEventListener('DOMContentLoaded', function() {
    // Redraw charts when theme changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                setTimeout(() => {
                    initCharts();
                }, 100);
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
});