#!/bin/bash
# AdLinkPro Complete Deployment Script
# Универсальный скрипт развертывания для всех платформ

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции логирования
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка операционной системы
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            OS="debian"
            PKG_MANAGER="apt"
        elif [ -f /etc/redhat-release ]; then
            OS="rhel"
            PKG_MANAGER="yum"
        else
            OS="linux"
            PKG_MANAGER="unknown"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        PKG_MANAGER="brew"
    else
        OS="unknown"
        PKG_MANAGER="unknown"
    fi
    log_info "Обнаружена ОС: $OS"
}

# Проверка прав sudo
check_sudo() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "Скрипт запущен от root. Рекомендуется использовать sudo при необходимости."
    else
        if ! sudo -n true 2>/dev/null; then
            log_info "Для продолжения потребуются права sudo"
        fi
    fi
}

# Установка Node.js
install_nodejs() {
    log_info "Установка Node.js 20 LTS..."
    
    case $OS in
        "debian")
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        "rhel")
            curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
            sudo yum install -y nodejs npm
            ;;
        "macos")
            if command -v brew >/dev/null 2>&1; then
                brew install node@20
            else
                log_error "Homebrew не найден. Установите Node.js вручную."
                exit 1
            fi
            ;;
        *)
            log_error "Неподдерживаемая ОС для автоустановки Node.js"
            exit 1
            ;;
    esac
    
    # Проверка установки
    if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        NPM_VERSION=$(npm --version)
        log_success "Node.js установлен: $NODE_VERSION"
        log_success "npm установлен: $NPM_VERSION"
    else
        log_error "Ошибка установки Node.js"
        exit 1
    fi
}

# Установка PostgreSQL
install_postgresql() {
    log_info "Установка PostgreSQL..."
    
    case $OS in
        "debian")
            sudo apt update
            sudo apt install -y postgresql postgresql-contrib
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
            ;;
        "rhel")
            sudo yum install -y postgresql-server postgresql-contrib
            sudo postgresql-setup initdb
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
            ;;
        "macos")
            brew install postgresql@15
            brew services start postgresql@15
            ;;
        *)
            log_error "Неподдерживаемая ОС для автоустановки PostgreSQL"
            exit 1
            ;;
    esac
    
    log_success "PostgreSQL установлен"
}

# Установка Nginx
install_nginx() {
    log_info "Установка Nginx..."
    
    case $OS in
        "debian")
            sudo apt install -y nginx
            sudo systemctl start nginx
            sudo systemctl enable nginx
            ;;
        "rhel")
            sudo yum install -y nginx
            sudo systemctl start nginx
            sudo systemctl enable nginx
            ;;
        "macos")
            brew install nginx
            brew services start nginx
            ;;
        *)
            log_error "Неподдерживаемая ОС для автоустановки Nginx"
            exit 1
            ;;
    esac
    
    log_success "Nginx установлен"
}

# Установка PM2
install_pm2() {
    log_info "Установка PM2..."
    
    if command -v npm >/dev/null 2>&1; then
        sudo npm install -g pm2
        log_success "PM2 установлен"
    else
        log_error "npm не найден. Установите Node.js сначала."
        exit 1
    fi
}

# Создание пользователя для приложения
create_app_user() {
    log_info "Создание пользователя приложения..."
    
    if ! id "adlinkpro" &>/dev/null; then
        case $OS in
            "debian"|"rhel")
                sudo adduser --system --group adlinkpro
                ;;
            "macos")
                sudo dscl . -create /Users/adlinkpro
                sudo dscl . -create /Users/adlinkpro UserShell /bin/bash
                sudo dscl . -create /Users/adlinkpro RealName "AdLinkPro System User"
                ;;
        esac
        log_success "Пользователь adlinkpro создан"
    else
        log_info "Пользователь adlinkpro уже существует"
    fi
    
    # Создание директорий
    sudo mkdir -p /var/www/adlinkpro
    sudo chown adlinkpro:adlinkpro /var/www/adlinkpro 2>/dev/null || sudo chown adlinkpro /var/www/adlinkpro
}

# Клонирование репозитория
clone_repository() {
    log_info "Клонирование репозитория AdLinkPro..."
    
    if [ ! -d "/var/www/adlinkpro/.git" ]; then
        cd /var/www/adlinkpro
        
        # Запрос URL репозитория
        read -p "Введите URL GitHub репозитория: " REPO_URL
        if [ -z "$REPO_URL" ]; then
            REPO_URL="https://github.com/pronto1245/AdLinkPro.git"
            log_info "Используется URL по умолчанию: $REPO_URL"
        fi
        
        sudo -u adlinkpro git clone "$REPO_URL" .
        log_success "Репозиторий клонирован"
    else
        log_info "Репозиторий уже существует, обновляем..."
        cd /var/www/adlinkpro
        sudo -u adlinkpro git pull origin main
        log_success "Репозиторий обновлен"
    fi
}

# Установка зависимостей проекта
install_dependencies() {
    log_info "Установка зависимостей проекта..."
    
    cd /var/www/adlinkpro
    sudo -u adlinkpro npm install
    log_success "Зависимости установлены"
}

# Сборка проекта
build_project() {
    log_info "Сборка проекта..."
    
    cd /var/www/adlinkpro
    sudo -u adlinkpro npm run build
    log_success "Проект собран"
}

# Настройка базы данных
setup_database() {
    log_info "Настройка базы данных..."
    
    # Генерация пароля для БД
    DB_PASSWORD=$(openssl rand -base64 32)
    
    # Создание базы данных и пользователя
    sudo -u postgres psql << EOF
CREATE DATABASE adlinkpro;
CREATE USER adlinkpro_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE adlinkpro TO adlinkpro_user;
GRANT ALL ON SCHEMA public TO adlinkpro_user;
\q
EOF
    
    log_success "База данных настроена"
    echo "DB_PASSWORD=$DB_PASSWORD" >> /tmp/adlinkpro_secrets
}

# Создание конфигурационного файла
create_env_file() {
    log_info "Создание .env файла..."
    
    # Генерация секретов
    JWT_SECRET=$(openssl rand -base64 64)
    SESSION_SECRET=$(openssl rand -base64 64)
    
    # Запрос домена
    read -p "Введите домен для приложения (например: adlinkpro.com): " DOMAIN
    if [ -z "$DOMAIN" ]; then
        DOMAIN="localhost"
        log_warning "Используется localhost как домен"
    fi
    
    # Создание .env файла
    cat << EOF > /var/www/adlinkpro/.env
NODE_ENV=production
PORT=5000
DOMAIN=$DOMAIN

# База данных
DATABASE_URL=postgresql://adlinkpro_user:$DB_PASSWORD@localhost:5432/adlinkpro

# Секреты безопасности
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET

# Опциональные переменные (добавьте свои ключи)
SENDGRID_API_KEY=
VOLUUM_TOKEN=
KEITARO_TOKEN=
BINOM_TOKEN=
REDTRACK_TOKEN=
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_STORAGE_BUCKET=
TELEGRAM_BOT_TOKEN=
EOF
    
    sudo chown adlinkpro:adlinkpro /var/www/adlinkpro/.env 2>/dev/null || sudo chown adlinkpro /var/www/adlinkpro/.env
    sudo chmod 600 /var/www/adlinkpro/.env
    
    # Сохранение секретов
    echo "JWT_SECRET=$JWT_SECRET" >> /tmp/adlinkpro_secrets
    echo "SESSION_SECRET=$SESSION_SECRET" >> /tmp/adlinkpro_secrets
    echo "DOMAIN=$DOMAIN" >> /tmp/adlinkpro_secrets
    
    log_success ".env файл создан"
}

# Инициализация базы данных
init_database() {
    log_info "Инициализация базы данных..."
    
    cd /var/www/adlinkpro
    sudo -u adlinkpro npm run db:push
    log_success "База данных инициализирована"
}

# Настройка PM2
setup_pm2() {
    log_info "Настройка PM2..."
    
    # Создание PM2 конфигурации
    cat << 'EOF' > /var/www/adlinkpro/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'adlinkpro',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    log_file: '/var/log/adlinkpro/app.log',
    out_file: '/var/log/adlinkpro/out.log',
    error_file: '/var/log/adlinkpro/error.log',
    max_memory_restart: '1G',
    restart_delay: 4000,
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git'],
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF
    
    sudo chown adlinkpro:adlinkpro /var/www/adlinkpro/ecosystem.config.js 2>/dev/null || sudo chown adlinkpro /var/www/adlinkpro/ecosystem.config.js
    
    # Создание директории для логов
    sudo mkdir -p /var/log/adlinkpro
    sudo chown adlinkpro:adlinkpro /var/log/adlinkpro 2>/dev/null || sudo chown adlinkpro /var/log/adlinkpro
    
    # Запуск приложения
    cd /var/www/adlinkpro
    sudo -u adlinkpro pm2 start ecosystem.config.js --env production
    sudo -u adlinkpro pm2 save
    
    # Настройка автозапуска
    sudo pm2 startup
    sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u adlinkpro --hp /home/adlinkpro
    
    log_success "PM2 настроен и приложение запущено"
}

# Настройка Nginx
setup_nginx() {
    log_info "Настройка Nginx..."
    
    # Создание конфигурации Nginx
    cat << EOF > /etc/nginx/sites-available/adlinkpro
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Редирект на HTTPS (будет настроен после SSL)
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket поддержка
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Логи
    access_log /var/log/nginx/adlinkpro_access.log;
    error_log /var/log/nginx/adlinkpro_error.log;
}
EOF
    
    # Активация сайта
    if [ -d "/etc/nginx/sites-enabled" ]; then
        sudo ln -sf /etc/nginx/sites-available/adlinkpro /etc/nginx/sites-enabled/
    fi
    
    # Проверка конфигурации
    sudo nginx -t
    
    # Перезапуск Nginx
    sudo systemctl reload nginx
    
    log_success "Nginx настроен"
}

# Установка SSL сертификата
install_ssl() {
    log_info "Установка SSL сертификата..."
    
    if [ "$DOMAIN" != "localhost" ]; then
        # Установка Certbot
        case $OS in
            "debian")
                sudo apt install -y certbot python3-certbot-nginx
                ;;
            "rhel")
                sudo yum install -y certbot python3-certbot-nginx
                ;;
            *)
                log_warning "Автоустановка SSL недоступна для этой ОС"
                return
                ;;
        esac
        
        # Получение сертификата
        read -p "Установить SSL сертификат для $DOMAIN? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN"
            
            # Настройка автообновления
            (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
            
            log_success "SSL сертификат установлен"
        fi
    else
        log_warning "SSL не настроен для localhost"
    fi
}

# Создание скриптов управления
create_management_scripts() {
    log_info "Создание скриптов управления..."
    
    # Скрипт старта
    cat << 'EOF' > /var/www/adlinkpro/start.sh
#!/bin/bash
cd /var/www/adlinkpro
sudo -u adlinkpro pm2 start ecosystem.config.js --env production
sudo systemctl start nginx
sudo systemctl start postgresql
echo "AdLinkPro запущен"
EOF
    
    # Скрипт остановки
    cat << 'EOF' > /var/www/adlinkpro/stop.sh
#!/bin/bash
cd /var/www/adlinkpro
sudo -u adlinkpro pm2 stop all
echo "AdLinkPro остановлен"
EOF
    
    # Скрипт перезапуска
    cat << 'EOF' > /var/www/adlinkpro/restart.sh
#!/bin/bash
cd /var/www/adlinkpro
sudo -u adlinkpro pm2 restart all
sudo systemctl reload nginx
echo "AdLinkPro перезапущен"
EOF
    
    # Скрипт обновления
    cat << 'EOF' > /var/www/adlinkpro/update.sh
#!/bin/bash
echo "Создание бекапа..."
sudo -u postgres pg_dump -U adlinkpro_user -h localhost adlinkpro > backup_$(date +%Y%m%d_%H%M%S).sql

echo "Обновление кода..."
cd /var/www/adlinkpro
sudo -u adlinkpro git pull origin main
sudo -u adlinkpro npm install
sudo -u adlinkpro npm run build

echo "Применение миграций..."
sudo -u adlinkpro npm run db:push

echo "Перезапуск приложения..."
sudo -u adlinkpro pm2 restart all

echo "Обновление завершено"
EOF
    
    # Скрипт бекапа
    cat << 'EOF' > /var/www/adlinkpro/backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/adlinkpro"

mkdir -p $BACKUP_DIR

# Бекап базы данных
sudo -u postgres pg_dump -U adlinkpro_user -h localhost adlinkpro > $BACKUP_DIR/db_backup_$DATE.sql

# Бекап файлов приложения
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/adlinkpro --exclude=/var/www/adlinkpro/node_modules

# Удаление старых бекапов (старше 7 дней)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF
    
    # Установка прав на выполнение
    sudo chmod +x /var/www/adlinkpro/*.sh
    sudo chown adlinkpro:adlinkpro /var/www/adlinkpro/*.sh 2>/dev/null || sudo chown adlinkpro /var/www/adlinkpro/*.sh
    
    log_success "Скрипты управления созданы"
}

# Проверка статуса сервисов
check_services() {
    log_info "Проверка статуса сервисов..."
    
    # Проверка приложения
    if curl -f -s http://localhost:5000/api/health >/dev/null 2>&1; then
        log_success "Приложение AdLinkPro работает"
    else
        log_error "Приложение AdLinkPro не отвечает"
    fi
    
    # Проверка базы данных
    if sudo -u postgres psql -U adlinkpro_user -d adlinkpro -c "SELECT 1;" >/dev/null 2>&1; then
        log_success "База данных PostgreSQL работает"
    else
        log_error "База данных PostgreSQL недоступна"
    fi
    
    # Проверка Nginx
    if sudo nginx -t >/dev/null 2>&1; then
        log_success "Nginx настроен корректно"
    else
        log_error "Ошибка конфигурации Nginx"
    fi
    
    # Проверка PM2
    if sudo -u adlinkpro pm2 status | grep -q "online"; then
        log_success "PM2 управляет процессами"
    else
        log_error "PM2 не запущен или нет процессов"
    fi
}

# Вывод информации о завершении
show_completion_info() {
    log_success "🎉 Развертывание AdLinkPro завершено!"
    echo ""
    log_info "📋 Информация о развертывании:"
    echo "  🌐 URL приложения: http://$DOMAIN"
    if [ "$DOMAIN" != "localhost" ]; then
        echo "  🔒 HTTPS URL: https://$DOMAIN"
    fi
    echo "  📊 Порт приложения: 5000"
    echo "  🗂️ Директория: /var/www/adlinkpro"
    echo ""
    log_info "🔐 Учетные данные для тестирования:"
    echo "  Super Admin: superadmin / admin123"
    echo "  Advertiser:  advertiser1 / advertiser123"
    echo "  Partner:     partner1 / partner123"
    echo ""
    log_info "🛠️ Команды управления:"
    echo "  Запуск:      /var/www/adlinkpro/start.sh"
    echo "  Остановка:   /var/www/adlinkpro/stop.sh"
    echo "  Перезапуск:  /var/www/adlinkpro/restart.sh"
    echo "  Обновление:  /var/www/adlinkpro/update.sh"
    echo "  Бекап:       /var/www/adlinkpro/backup.sh"
    echo ""
    log_info "📊 Мониторинг:"
    echo "  Логи PM2:    sudo -u adlinkpro pm2 logs"
    echo "  Статус PM2:  sudo -u adlinkpro pm2 status"
    echo "  Логи Nginx:  sudo tail -f /var/log/nginx/adlinkpro_*.log"
    echo ""
    
    if [ -f "/tmp/adlinkpro_secrets" ]; then
        log_warning "🔑 Сохраните секреты из файла /tmp/adlinkpro_secrets"
        cat /tmp/adlinkpro_secrets
        echo ""
        log_warning "Удалите файл после сохранения: rm /tmp/adlinkpro_secrets"
    fi
}

# Главная функция
main() {
    echo "🚀 AdLinkPro - Автоматическое развертывание"
    echo "============================================="
    echo ""
    
    detect_os
    check_sudo
    
    log_info "Начинаем развертывание AdLinkPro..."
    
    # Проверка зависимостей и установка
    command -v node >/dev/null 2>&1 || install_nodejs
    command -v psql >/dev/null 2>&1 || install_postgresql
    command -v nginx >/dev/null 2>&1 || install_nginx
    command -v pm2 >/dev/null 2>&1 || install_pm2
    
    # Настройка приложения
    create_app_user
    clone_repository
    install_dependencies
    build_project
    
    # Настройка сервисов
    setup_database
    create_env_file
    init_database
    setup_pm2
    setup_nginx
    install_ssl
    
    # Создание скриптов управления
    create_management_scripts
    
    # Проверка развертывания
    sleep 10  # Ждем запуска сервисов
    check_services
    
    # Вывод информации
    show_completion_info
}

# Запуск основной функции
main "$@"