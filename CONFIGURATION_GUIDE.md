# Конфигурация системы

## Обязательные переменные окружения

### База данных
```env
DATABASE_URL=postgresql://username:password@host:5432/database_name
REDIS_URL=redis://localhost:6379
```

### Безопасность
```env
JWT_SECRET=your-strong-jwt-secret-here
SESSION_SECRET=your-session-secret-here
```

### Трекеры (Keitaro, Binom, RedTrack, Voluum)
```env
KEITARO_ENDPOINT=https://your-keitaro-domain.com/click.php
KEITARO_TOKEN=your-keitaro-api-token

BINOM_ENDPOINT=https://your-binom-domain.com/click.php
BINOM_TOKEN=your-binom-api-token

REDTRACK_ENDPOINT=https://your-redtrack-domain.com/postback
REDTRACK_TOKEN=your-redtrack-api-token

VOLUUM_ENDPOINT=https://your-voluum-domain.com/postback
VOLUUM_TOKEN=your-voluum-api-token
```

### Google Cloud Storage (для креативов)
```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

### Email (SendGrid)
```env
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
```

## Настройка в Replit

1. Откройте панель Secrets в Replit
2. Добавьте необходимые переменные окружения
3. Система автоматически их подхватит при перезапуске

## Файлы конфигурации

- `config.example.env` - пример всех переменных
- `server/config/environment.ts` - типизированная конфигурация
- Система автоматически валидирует критические настройки при запуске

## Валидация конфигурации

При запуске система проверяет:
- ✅ DATABASE_URL установлен
- ✅ JWT_SECRET не дефолтный в продакшене
- ✅ SESSION_SECRET не дефолтный в продакшене

## Режимы работы

### Development
- Использует дефолтные значения для безопасности
- Rate limiting отключен
- Подробное логирование

### Production
- Требует все секреты
- Rate limiting включен
- Минимальное логирование

## Интеграция с трекерами

### Keitaro
Формат постбека: `?subid={clickId}&status={status}&payout={payout}`

### Binom
Формат постбека: `?subid={clickId}&status=conversion&payout={payout}`

### RedTrack
Стандартный REST API с JSON payload

### Voluum
Стандартный REST API с JSON payload

## Антифрод настройки

```env
ANTIFRAUD_ENABLED=true
ANTIFRAUD_LOG_LEVEL=info
```

- `hard` - блокирует все профили
- `soft` - блокирует только backup профили для non-pending статусов
- `ok` - пропускает везде

## Постбек настройки

```env
POSTBACK_RETRY_ATTEMPTS=5
POSTBACK_RETRY_DELAY=1000
POSTBACK_TIMEOUT=10000
```

## Мониторинг

Статистика доступна через `/api/queue/stats`:
- Количество успешных/неуспешных доставок
- Статистика блокировок антифрода
- Производительность очередей