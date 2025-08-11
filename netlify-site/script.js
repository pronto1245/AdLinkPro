// Modern JavaScript for the landing page

// Theme management
let currentTheme = localStorage.getItem('theme') || 'light';

function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
        toggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    }
}

// Animated counters
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const start = 0;
        const increment = target / (duration / 16); // 60 FPS
        
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format the number
            if (target === 99.9) {
                counter.textContent = current.toFixed(1);
            } else {
                counter.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    });
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Trigger counter animation when hero is visible
                if (entry.target.classList.contains('hero-stats')) {
                    animateCounters();
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .tech-category, .hero-stats').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Navigation scroll effect
function initNavbarEffects() {
    let lastScrollY = window.scrollY;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Hide/show navbar based on scroll direction
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        // Add background opacity based on scroll
        const opacity = Math.min(currentScrollY / 100, 0.95);
        if (currentTheme === 'light') {
            navbar.style.background = `rgba(255, 255, 255, ${opacity})`;
        } else {
            navbar.style.background = `rgba(26, 32, 44, ${opacity})`;
        }
        
        lastScrollY = currentScrollY;
    });
}

// Demo functionality
function showDemo() {
    // Create a modal or redirect to demo
    const modal = createModal({
        title: 'Демо платформы',
        content: `
            <div class="demo-modal">
                <h3>🚀 Основные возможности:</h3>
                <ul>
                    <li>✅ Управление офферами с реальными данными</li>
                    <li>✅ Система ролей и авторизации</li>
                    <li>✅ Real-time аналитика и уведомления</li>
                    <li>✅ Интеграция с Object Storage</li>
                    <li>✅ Постбэк система для трекеров</li>
                    <li>✅ Антифрод система</li>
                </ul>
                <p><strong>Технические детали:</strong></p>
                <ul>
                    <li>🗄️ PostgreSQL база данных</li>
                    <li>🔐 JWT авторизация</li>
                    <li>📁 Google Cloud Storage</li>
                    <li>⚡ React + TypeScript</li>
                    <li>🔄 WebSocket real-time</li>
                </ul>
                <div class="demo-buttons">
                    <button onclick="window.open('https://e2b04e37-b05b-4d57-9368-9f629e0035bd-00-2yo71uvl8ejp3.worf.replit.dev', '_blank')" class="btn btn-primary">
                        Открыть платформу
                    </button>
                </div>
            </div>
        `
    });
}

function showTech() {
    const modal = createModal({
        title: 'Технический стек',
        content: `
            <div class="tech-modal">
                <div class="tech-grid">
                    <div class="tech-item">
                        <h4>Frontend</h4>
                        <p>React 18, TypeScript, Shadcn/ui, Tailwind CSS, React Query, Wouter</p>
                    </div>
                    <div class="tech-item">
                        <h4>Backend</h4>
                        <p>Node.js, Express, Drizzle ORM, PostgreSQL, JWT, bcrypt, WebSocket</p>
                    </div>
                    <div class="tech-item">
                        <h4>Инфраструктура</h4>
                        <p>Google Cloud Storage, Neon Database, Telegram Bot, SSL, Netlify Deploy</p>
                    </div>
                    <div class="tech-item">
                        <h4>Object Storage</h4>
                        <p>Bucket: replit-objstore-6b899733-6fa6-40a7-a433-b8bbe153777d</p>
                        <p>Публичные файлы: /public/ • Приватные: /.private/</p>
                    </div>
                </div>
                <div class="deployment-info">
                    <h4>🚀 Готов к деплою на:</h4>
                    <div class="deploy-platforms">
                        <span class="platform">Netlify</span>
                        <span class="platform">Railway</span>
                        <span class="platform">Vercel</span>
                        <span class="platform">Heroku</span>
                    </div>
                </div>
            </div>
        `
    });
}

// Modal system
function createModal({ title, content }) {
    // Remove existing modal
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHTML = `
        <div class="modal-overlay" onclick="closeModal(event)">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add modal styles
    if (!document.querySelector('#modal-styles')) {
        const styles = `
            <style id="modal-styles">
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(5px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }
                
                .modal-content {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    animation: slideIn 0.3s ease;
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .modal-header h2 {
                    margin: 0;
                    color: var(--text-primary);
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--text-muted);
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                }
                
                .modal-close:hover {
                    background: var(--bg-accent);
                    color: var(--text-primary);
                }
                
                .modal-body {
                    padding: 1.5rem;
                }
                
                .demo-modal ul, .tech-modal ul {
                    list-style: none;
                    margin: 1rem 0;
                }
                
                .demo-modal li, .tech-modal li {
                    padding: 0.5rem 0;
                    color: var(--text-secondary);
                }
                
                .tech-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                    margin: 1rem 0;
                }
                
                .tech-item {
                    background: var(--bg-secondary);
                    padding: 1rem;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                }
                
                .tech-item h4 {
                    color: var(--accent-color);
                    margin-bottom: 0.5rem;
                }
                
                .deployment-info {
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--border-color);
                }
                
                .deploy-platforms {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    margin-top: 0.5rem;
                }
                
                .platform {
                    background: var(--accent-color);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 16px;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                
                .demo-buttons {
                    margin-top: 1.5rem;
                    text-align: center;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideIn {
                    from { transform: scale(0.9) translateY(-20px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

// Add fadeOut animation
const additionalStyles = `
    <style>
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    </style>
`;
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initScrollAnimations();
    initSmoothScrolling();
    initNavbarEffects();
    
    // Add some interactive effects
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.borderColor = 'var(--accent-color)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.borderColor = 'var(--border-color)';
        });
    });
    
    // Easter egg: Konami code
    let konamiCode = [];
    const expectedCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    
    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.keyCode);
        konamiCode = konamiCode.slice(-expectedCode.length);
        
        if (konamiCode.join(',') === expectedCode.join(',')) {
            createModal({
                title: '🎉 Секретный режим активирован!',
                content: `
                    <div style="text-align: center;">
                        <h3>Вы нашли пасхалку!</h3>
                        <p>🚀 Платформа работает на полную мощность!</p>
                        <p>Object Storage Bucket: replit-objstore-6b899733-6fa6-40a7-a433-b8bbe153777d</p>
                        <p>Статус: ✅ Готова к production деплою</p>
                        <button onclick="window.open('https://e2b04e37-b05b-4d57-9368-9f629e0035bd-00-2yo71uvl8ejp3.worf.replit.dev/file-upload-test', '_blank')" class="btn btn-primary">
                            Тестировать Object Storage
                        </button>
                    </div>
                `
            });
        }
    });
    
    console.log('🚀 Affiliate Marketing Platform - Ready for Netlify Deploy!');
    console.log('📁 Object Storage: replit-objstore-6b899733-6fa6-40a7-a433-b8bbe153777d');
    console.log('🌐 Site loaded and interactive');
});

// Global functions for window access
window.toggleTheme = toggleTheme;
window.showDemo = showDemo;
window.showTech = showTech;
window.closeModal = closeModal;