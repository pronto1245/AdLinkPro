// Offers Management
let selectedOffers = new Set();

function initOffersManagement() {
    initOfferFiltering();
    initBulkActions();
    initOfferSelection();
}

// Filtering
function initOfferFiltering() {
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter'); 
    const searchFilter = document.getElementById('searchFilter');
    
    [categoryFilter, statusFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', filterOffers);
        }
    });
    
    if (searchFilter) {
        searchFilter.addEventListener('input', debounce(filterOffers, 300));
    }
}

function filterOffers() {
    const category = document.getElementById('categoryFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    const search = document.getElementById('searchFilter')?.value.toLowerCase() || '';
    
    const rows = document.querySelectorAll('#offersTableBody tr');
    
    rows.forEach(row => {
        const rowCategory = row.getAttribute('data-category');
        const rowStatus = row.getAttribute('data-status');
        const offerName = row.querySelector('.offer-name')?.textContent.toLowerCase() || '';
        
        const matchesCategory = !category || rowCategory === category;
        const matchesStatus = !status || rowStatus === status;
        const matchesSearch = !search || offerName.includes(search);
        
        if (matchesCategory && matchesStatus && matchesSearch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    updateVisibleRowCount();
}

function updateVisibleRowCount() {
    const totalRows = document.querySelectorAll('#offersTableBody tr').length;
    const visibleRows = document.querySelectorAll('#offersTableBody tr:not([style*="display: none"])').length;
    
    // Update counter if exists
    const counter = document.querySelector('.table-counter');
    if (counter) {
        counter.textContent = `Показано ${visibleRows} из ${totalRows} офферов`;
    }
}

// Bulk Actions
function initBulkActions() {
    const checkboxes = document.querySelectorAll('.offer-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkActions);
    });
}

function initOfferSelection() {
    const checkboxes = document.querySelectorAll('.offer-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const offerId = this.closest('tr').getAttribute('data-offer-id');
            if (this.checked) {
                selectedOffers.add(offerId);
            } else {
                selectedOffers.delete(offerId);
            }
            updateBulkActions();
        });
    });
}

function toggleAllOffers(masterCheckbox) {
    const checkboxes = document.querySelectorAll('.offer-checkbox');
    const isChecked = masterCheckbox.checked;
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
        const offerId = checkbox.closest('tr').getAttribute('data-offer-id');
        
        if (isChecked) {
            selectedOffers.add(offerId);
        } else {
            selectedOffers.delete(offerId);
        }
    });
    
    updateBulkActions();
}

function updateBulkActions() {
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.getElementById('selectedCount');
    
    if (selectedOffers.size > 0) {
        bulkActions.style.display = 'flex';
        selectedCount.textContent = selectedOffers.size;
    } else {
        bulkActions.style.display = 'none';
    }
}

function bulkAction(action) {
    if (selectedOffers.size === 0) {
        showNotification('Выберите офферы для выполнения действия', 'warning');
        return;
    }
    
    const actions = {
        'activate': 'активировать',
        'pause': 'приостановить', 
        'delete': 'удалить'
    };
    
    const actionText = actions[action];
    const confirmMessage = `Вы уверены, что хотите ${actionText} ${selectedOffers.size} оффер(ов)?`;
    
    if (confirm(confirmMessage)) {
        // Simulate bulk action
        selectedOffers.forEach(offerId => {
            const row = document.querySelector(`tr[data-offer-id="${offerId}"]`);
            if (row) {
                const statusBadge = row.querySelector('.status-badge');
                if (statusBadge && action !== 'delete') {
                    statusBadge.className = `status-badge ${action === 'activate' ? 'active' : 'paused'}`;
                    statusBadge.textContent = action === 'activate' ? 'Активный' : 'На паузе';
                    row.setAttribute('data-status', action === 'activate' ? 'active' : 'paused');
                } else if (action === 'delete') {
                    row.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => row.remove(), 300);
                }
            }
        });
        
        showNotification(`${selectedOffers.size} оффер(ов) успешно ${actionText}(ы)`);
        selectedOffers.clear();
        updateBulkActions();
        
        // Reset master checkbox
        const masterCheckbox = document.querySelector('th input[type="checkbox"]');
        if (masterCheckbox) {
            masterCheckbox.checked = false;
        }
    }
}

// Individual Offer Actions
function editOffer(offerId) {
    showModal('Редактировать оффер', `
        <div class="offer-edit-form">
            <div class="form-group">
                <label>Название оффера:</label>
                <input type="text" value="Casino Royal Premium" id="offerName">
            </div>
            <div class="form-group">
                <label>Описание:</label>
                <textarea id="offerDesc" rows="3">Премиум казино с бонусами</textarea>
            </div>
            <div class="form-group">
                <label>Категория:</label>
                <select id="offerCategory">
                    <option value="casino" selected>Казино</option>
                    <option value="crypto">Криптовалюта</option>
                    <option value="dating">Знакомства</option>
                    <option value="finance">Финансы</option>
                </select>
            </div>
            <div class="form-group">
                <label>Payout ($):</label>
                <input type="number" value="25.00" step="0.01" id="offerPayout">
            </div>
            <div class="form-group">
                <label>URL оффера:</label>
                <input type="url" value="https://casino-royal.com" id="offerUrl">
            </div>
            <div class="form-group">
                <label>Статус:</label>
                <select id="offerStatus">
                    <option value="active" selected>Активный</option>
                    <option value="paused">На паузе</option>
                    <option value="stopped">Остановлен</option>
                </select>
            </div>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                <button class="btn btn-primary" onclick="saveOffer(${offerId})">💾 Сохранить</button>
            </div>
        </div>
    `);
}

function saveOffer(offerId) {
    const name = document.getElementById('offerName').value;
    const desc = document.getElementById('offerDesc').value;
    const category = document.getElementById('offerCategory').value;
    const payout = document.getElementById('offerPayout').value;
    const status = document.getElementById('offerStatus').value;
    
    // Update the table row
    const row = document.querySelector(`tr[data-offer-id="${offerId}"]`);
    if (row) {
        row.querySelector('.offer-name').textContent = name;
        row.querySelector('.offer-desc').textContent = desc;
        row.querySelector('.category-tag').textContent = getCategoryDisplayName(category);
        row.querySelector('.category-tag').className = `category-tag ${category}`;
        row.querySelector('.payout').textContent = `$${payout}`;
        row.querySelector('.status-badge').textContent = getStatusDisplayName(status);
        row.querySelector('.status-badge').className = `status-badge ${status}`;
        
        row.setAttribute('data-category', category);
        row.setAttribute('data-status', status);
    }
    
    showNotification('Оффер успешно обновлен');
    closeModal();
}

function copyOffer(offerId) {
    showModal('Создать копию оффера', `
        <div class="copy-offer-form">
            <div class="form-group">
                <label>Название нового оффера:</label>
                <input type="text" value="Casino Royal Premium (копия)" id="copyOfferName">
            </div>
            <div class="form-group">
                <label>Изменить payout:</label>
                <input type="number" value="25.00" step="0.01" id="copyOfferPayout">
            </div>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                <button class="btn btn-primary" onclick="createOfferCopy(${offerId})">📋 Создать копию</button>
            </div>
        </div>
    `);
}

function createOfferCopy(originalOfferId) {
    const name = document.getElementById('copyOfferName').value;
    const payout = document.getElementById('copyOfferPayout').value;
    
    // Simulate creating a copy by adding a new row
    const originalRow = document.querySelector(`tr[data-offer-id="${originalOfferId}"]`);
    const newRow = originalRow.cloneNode(true);
    const newId = Date.now(); // Simple ID generation
    
    newRow.setAttribute('data-offer-id', newId);
    newRow.querySelector('.offer-id').textContent = `#${1000 + parseInt(newId.toString().slice(-3))}`;
    newRow.querySelector('.offer-name').textContent = name;
    newRow.querySelector('.payout').textContent = `$${payout}`;
    
    // Update action buttons
    const actionButtons = newRow.querySelector('.action-buttons');
    actionButtons.innerHTML = `
        <button class="btn btn-sm btn-icon" onclick="editOffer(${newId})" title="Редактировать">✏️</button>
        <button class="btn btn-sm btn-icon" onclick="copyOffer(${newId})" title="Копировать">📋</button>
        <button class="btn btn-sm btn-icon" onclick="viewStats(${newId})" title="Статистика">📊</button>
        <button class="btn btn-sm btn-icon danger" onclick="deleteOffer(${newId})" title="Удалить">🗑️</button>
    `;
    
    // Add to table
    document.getElementById('offersTableBody').appendChild(newRow);
    
    showNotification('Копия оффера создана');
    closeModal();
}

function viewStats(offerId) {
    showModal('Статистика оффера', `
        <div class="offer-stats">
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Клики:</span>
                    <span class="stat-value">1,247</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Конверсии:</span>
                    <span class="stat-value">23</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">CR:</span>
                    <span class="stat-value">1.84%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Доход:</span>
                    <span class="stat-value">$575</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">EPC:</span>
                    <span class="stat-value">$0.46</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Активные партнеры:</span>
                    <span class="stat-value">8</span>
                </div>
            </div>
            <div class="chart-placeholder" style="margin-top: 2rem; height: 200px; background: var(--bg-secondary); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
                График конверсий за последние 30 дней
            </div>
        </div>
        <style>
            .offer-stats .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            .offer-stats .stat-item {
                display: flex;
                justify-content: space-between;
                padding: 0.75rem;
                background: var(--bg-secondary);
                border-radius: 8px;
                border: 1px solid var(--border-color);
            }
            .offer-stats .stat-label {
                color: var(--text-muted);
                font-size: 0.875rem;
            }
            .offer-stats .stat-value {
                font-weight: 600;
                color: var(--text-primary);
            }
        </style>
    `);
}

function deleteOffer(offerId) {
    if (confirm('Вы уверены, что хотите удалить этот оффер? Это действие нельзя отменить.')) {
        const row = document.querySelector(`tr[data-offer-id="${offerId}"]`);
        if (row) {
            row.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                row.remove();
                showNotification('Оффер удален');
                updateVisibleRowCount();
            }, 300);
        }
    }
}

function showCreateOfferModal() {
    showModal('Создать новый оффер', `
        <div class="create-offer-form">
            <div class="form-group">
                <label>Название оффера:</label>
                <input type="text" placeholder="Введите название" id="newOfferName">
            </div>
            <div class="form-group">
                <label>Описание:</label>
                <textarea placeholder="Краткое описание оффера" rows="3" id="newOfferDesc"></textarea>
            </div>
            <div class="form-group">
                <label>Категория:</label>
                <select id="newOfferCategory">
                    <option value="">Выберите категорию</option>
                    <option value="casino">Казино</option>
                    <option value="crypto">Криптовалюта</option>
                    <option value="dating">Знакомства</option>
                    <option value="finance">Финансы</option>
                </select>
            </div>
            <div class="form-group">
                <label>Payout ($):</label>
                <input type="number" placeholder="0.00" step="0.01" id="newOfferPayout">
            </div>
            <div class="form-group">
                <label>URL оффера:</label>
                <input type="url" placeholder="https://example.com" id="newOfferUrl">
            </div>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                <button class="btn btn-primary" onclick="createNewOffer()">✨ Создать оффер</button>
            </div>
        </div>
    `);
}

function createNewOffer() {
    const name = document.getElementById('newOfferName').value;
    const desc = document.getElementById('newOfferDesc').value;
    const category = document.getElementById('newOfferCategory').value;
    const payout = document.getElementById('newOfferPayout').value;
    const url = document.getElementById('newOfferUrl').value;
    
    if (!name || !category || !payout) {
        showNotification('Заполните обязательные поля', 'error');
        return;
    }
    
    const newId = Date.now();
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-offer-id', newId);
    newRow.setAttribute('data-category', category);
    newRow.setAttribute('data-status', 'active');
    
    newRow.innerHTML = `
        <td><input type="checkbox" class="offer-checkbox"></td>
        <td><span class="offer-id">#${1000 + parseInt(newId.toString().slice(-3))}</span></td>
        <td>
            <div class="offer-info">
                <span class="offer-name">${name}</span>
                <span class="offer-desc">${desc}</span>
            </div>
        </td>
        <td><span class="category-tag ${category}">${getCategoryDisplayName(category)}</span></td>
        <td><span class="payout">$${payout}</span></td>
        <td><span class="cr-rate">0.0%</span></td>
        <td><span class="status-badge active">Активный</span></td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-sm btn-icon" onclick="editOffer(${newId})" title="Редактировать">✏️</button>
                <button class="btn btn-sm btn-icon" onclick="copyOffer(${newId})" title="Копировать">📋</button>
                <button class="btn btn-sm btn-icon" onclick="viewStats(${newId})" title="Статистика">📊</button>
                <button class="btn btn-sm btn-icon danger" onclick="deleteOffer(${newId})" title="Удалить">🗑️</button>
            </div>
        </td>
    `;
    
    document.getElementById('offersTableBody').appendChild(newRow);
    
    // Add event listener for new checkbox
    const newCheckbox = newRow.querySelector('.offer-checkbox');
    newCheckbox.addEventListener('change', function() {
        if (this.checked) {
            selectedOffers.add(newId.toString());
        } else {
            selectedOffers.delete(newId.toString());
        }
        updateBulkActions();
    });
    
    showNotification('Новый оффер создан');
    closeModal();
}

function importOffers() {
    showModal('Импорт офферов', `
        <div class="import-form">
            <div class="form-group">
                <label>Выберите CSV файл:</label>
                <input type="file" accept=".csv" id="importFile">
                <small class="form-hint">Файл должен содержать колонки: название, описание, категория, payout, URL</small>
            </div>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                <button class="btn btn-primary" onclick="processImport()">📁 Импортировать</button>
            </div>
        </div>
    `);
}

function processImport() {
    const file = document.getElementById('importFile').files[0];
    if (!file) {
        showNotification('Выберите файл для импорта', 'error');
        return;
    }
    
    // Simulate import process
    showNotification('Импорт начат...');
    closeModal();
    
    setTimeout(() => {
        showNotification('Импорт завершен: добавлено 5 офферов');
    }, 2000);
}

// Helper functions
function getCategoryDisplayName(category) {
    const names = {
        'casino': 'Казино',
        'crypto': 'Криптовалюта', 
        'dating': 'Знакомства',
        'finance': 'Финансы'
    };
    return names[category] || category;
}

function getStatusDisplayName(status) {
    const names = {
        'active': 'Активный',
        'paused': 'На паузе',
        'stopped': 'Остановлен'
    };
    return names[status] || status;
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

// Export functions for global access
window.filterOffers = filterOffers;
window.toggleAllOffers = toggleAllOffers;
window.bulkAction = bulkAction;
window.editOffer = editOffer;
window.saveOffer = saveOffer;
window.copyOffer = copyOffer;
window.createOfferCopy = createOfferCopy;
window.viewStats = viewStats;
window.deleteOffer = deleteOffer;
window.showCreateOfferModal = showCreateOfferModal;
window.createNewOffer = createNewOffer;
window.importOffers = importOffers;
window.processImport = processImport;