# Postback Integration Guide

## Полная система интеграции с внешними трекерами

Данная система предоставляет полную интеграцию с популярными трекерами аффилейт-маркетинга, включая автоматическую отправку данных о кликах и конверсиях.

## 🎯 Поддерживаемые трекеры

### 1. Keitaro
```
URL: https://your-keitaro.com/api/v1/conversions?clickid={clickid}&status={status}&revenue={revenue}
Метод: GET
```

### 2. Binom
```
URL: https://your-binom.com/click.php?cnv_id={clickid}&payout={revenue}
Метод: GET
```

### 3. RedTrack
```
URL: https://your-redtrack.com/postback?clickid={clickid}&status={status}&sum={revenue}
Метод: GET
```

### 4. Voluum
```
URL: https://your-voluum.com/postback?cid={clickid}&payout={revenue}
Метод: GET
```

### 5. Произвольный трекер
```
URL: Настраиваемый URL с макросами
Метод: GET/POST
```

## 📊 Доступные макросы

| Макрос | Описание | Пример |
|--------|----------|--------|
| `{clickid}` | Уникальный ID клика | test_exact_data |
| `{status}` | Статус события | lead, deposit, conversion |
| `{revenue}` | Доход от конверсии | 25.50 |
| `{currency}` | Валюта | USD, EUR |
| `{partner_id}` | ID партнера | 04b06c87-c6cf-440f |
| `{offer_id}` | ID оффера | 7b537e40-05bc-4e5b |
| `{sub1}` - `{sub16}` | SubID параметры | campaign_A, source_direct |
| `{country}` | Страна пользователя | US, RU, DE |
| `{device}` | Тип устройства | desktop, mobile, tablet |
| `{utm_source}` | UTM источник | google, facebook |
| `{utm_campaign}` | UTM кампания | summer2024 |

## 🔧 API Endpoints

### Ручная отправка постбека
```bash
POST /api/track/postback/send
{
  "clickid": "test_exact_data",
  "event_type": "lead",
  "revenue": "50.00",
  "currency": "USD",
  "txid": "tx_12345"
}
```

### Тестирование трекера
```bash
POST /api/track/postback/test
{
  "tracker_url": "https://httpbin.org/get?clickid={clickid}&status={status}&revenue={revenue}",
  "method": "GET",
  "test_data": {
    "clickid": "test123",
    "status": "lead",
    "revenue": "25.00"
  }
}
```

## 🚀 Автоматические триггеры

### При клике (lp_click)
Система автоматически отправляет постбек при каждом клике по партнерской ссылке:
```javascript
{
  type: 'lp_click',
  clickId: 'unique_click_id',
  data: {
    clickid: 'unique_click_id',
    partner_id: 'partner_id',
    offer_id: 'offer_id',
    sub1: 'campaign_data',
    sub2: 'source_data',
    // ... все SubID и UTM параметры
  }
}
```

### При конверсии
Автоматическая отправка при событиях lead, deposit, conversion:
```javascript
{
  type: 'lead', // или deposit, conversion
  clickId: 'original_click_id',
  data: {
    clickid: 'original_click_id',
    status: 'lead',
    revenue: '25.50',
    currency: 'USD',
    txid: 'transaction_id'
  }
}
```

## 🎛️ Настройка через UI

### Создание профиля постбека
1. Перейдите в раздел "Настройки постбеков"
2. Нажмите "Добавить постбек"
3. Выберите тип трекера или укажите "Произвольный"
4. Введите URL с макросами
5. Выберите HTTP метод (GET/POST)
6. Включите профиль

### Тестирование
1. В карточке профиля нажмите кнопку "Тест"
2. Система отправит тестовые данные на ваш трекер
3. Результат отобразится в уведомлении

## 📈 Мониторинг и логи

### Просмотр логов
- Вкладка "Логи отправки" показывает все попытки доставки
- Цветовая индикация статусов (зеленый = успех, красный = ошибка)
- Время ответа и коды HTTP статусов
- Детали ошибок для диагностики

### Статусы доставки
- ✅ **Отправлен** - постбек успешно доставлен
- ❌ **Ошибка** - произошла ошибка при отправке
- ⏳ **Ожидание** - постбек в очереди на отправку
- 🚫 **Заблокирован** - заблокирован системой фрод-защиты

### Аналитика постбеков
Новая панель аналитики предоставляет детальную статистику:

#### Основные метрики
- **Success Rate**: Процент успешных доставок
- **Average Response Time**: Среднее время ответа в мс
- **Total Postbacks**: Общее количество отправленных постбеков
- **Failed Postbacks**: Количество неудачных попыток
- **Active Templates**: Количество активных шаблонов

#### API эндпоинт аналитики
```
GET /api/analytics/postback-analytics
```

Пример ответа:
```json
{
  "summary": {
    "totalPostbacks": 1250,
    "successfulPostbacks": 1180,
    "failedPostbacks": 70,
    "successRate": 94.4,
    "failureRate": 5.6,
    "avgResponseTime": 142,
    "activeTemplates": 12
  },
  "errorFrequency": [
    {"errorType": "Network Error", "count": 35, "percentage": 2.8},
    {"errorType": "Server Error", "count": 20, "percentage": 1.6},
    {"errorType": "Client Error", "count": 15, "percentage": 1.2}
  ]
}
```

#### Интеграция с дашбордом
```typescript
// Получение метрик для отображения в UI
const postbackMetrics = await fetch('/api/analytics/postback-analytics?dateFrom=2024-01-01&dateTo=2024-01-31')
  .then(res => res.json());

// Отображение в реальном времени
const { successRate, avgResponseTime, activeTemplates } = postbackMetrics.summary;
```

## 🔄 Retry логика

Система автоматически повторяет неудачные попытки с улучшенными настройками:

### Настройки повторов
- **Максимум попыток**: Настраиваемо (по умолчанию 3)
- **Экспоненциальная задержка**: 60 сек, 120 сек, 240 сек, etc.
- **Максимальная задержка**: 1 час
- **Timeout запроса**: 30 секунд
- **Детальное логирование**: Всех попыток и ошибок

### Конфигурация retry логики
```typescript
// Настройка параметров повторов
await PostbackService.retryFailedPostbacks({
  maxRetryAttempts: 5,        // максимум 5 попыток
  baseRetryDelay: 30,         // базовая задержка 30 сек
  maxRetryDelay: 1800,        // максимальная задержка 30 мин
  exponentialBackoff: true    // использовать экспоненциальный рост
});
```

## 🛡️ Система безопасности и защиты от фрода

### Автоматические проверки
Система интегрирована с модулем защиты от фрода:

- **IP-анализ**: Проверка подозрительных IP адресов
- **User-Agent анализ**: Обнаружение ботов и парсеров
- **Поведенческий анализ**: Множественные конверсии с одного IP
- **Геолокация**: Проверка корректности данных о стране
- **Скоринг рисков**: Комплексная оценка риска (0-100)

### Пороги блокировки
```typescript
// Событие будет заблокировано при риске >= 60
{
  riskScore: 75,
  reasons: ["Bot-like user agent", "Multiple conversions from same IP"],
  blocked: true
}
```

### Отключение проверок фрода
```typescript
// Для доверенных источников можно отключить проверки
await PostbackService.triggerPostbacks(event, {
  skipAntiFraud: true  // пропустить проверки безопасности
});
```

## 🛠️ Техническая реализация

### PostbackService
```typescript
class PostbackService {
  // Отправка всех активных постбеков для события
  static async triggerPostbacks(event: PostbackEvent): Promise<PostbackResult[]>
  
  // Отправка на конкретный внешний трекер
  static async sendExternalTrackerPostback(url: string, event: PostbackEvent): Promise<PostbackResult>
  
  // Замена макросов в URL
  static replaceMacros(template: string, data: Record<string, string>): string
}
```

### Интеграция в tracking.ts
```typescript
// При клике
const postbackEvent: PostbackEvent = {
  type: 'lp_click',
  clickId: clickid,
  data: { /* все данные клика */ }
};
PostbackService.triggerPostbacks(postbackEvent);

// При конверсии
const postbackEvent: PostbackEvent = {
  type: eventData.type,
  clickId: eventData.clickid,
  data: { /* данные конверсии */ }
};
PostbackService.triggerPostbacks(postbackEvent);
```

## 📋 Пример полной настройки

### 1. Настройка Keitaro
```
Название: Main Keitaro Tracker
URL: https://tracker.example.com/api/v1/conversions?clickid={clickid}&status={status}&revenue={revenue}&offer_id={offer_id}&partner_id={partner_id}&sub1={sub1}&sub2={sub2}
Метод: GET
События: lp_click, lead, deposit, conversion
```

### 2. Проверка интеграции
```bash
# Создание тестового клика
curl -G "http://localhost:5000/api/track/click" \
  -d "offer_id=OFFER_ID" \
  -d "partner_id=PARTNER_ID" \
  -d "sub1=test_campaign" \
  -d "sub2=test_source"

# Отправка тестовой конверсии
curl -X POST "http://localhost:5000/api/track/event" \
  -H "Content-Type: application/json" \
  -d '{
    "clickid": "generated_click_id",
    "type": "lead",
    "revenue": 25.00,
    "currency": "USD"
  }'
```

### 3. Мониторинг результатов
- Проверьте логи в UI: статус доставки, время ответа
- Убедитесь что данные поступают в ваш трекер
- При ошибках - проверьте URL и доступность трекера

## 🎯 Лучшие практики

1. **Тестирование**: Всегда тестируйте новые профили перед активацией
2. **Мониторинг**: Регулярно проверяйте логи доставки
3. **Резервирование**: Настройте несколько профилей для критически важных трекеров
4. **Безопасность**: Используйте HTTPS для всех постбек URL
5. **Производительность**: Постбеки отправляются асинхронно и не блокируют основной поток

## 🔧 Отладка

### Типичные проблемы
1. **Таймаут**: Увеличьте timeout в настройках профиля
2. **Неверный URL**: Проверьте корректность макросов
3. **HTTP ошибки**: Убедитесь что трекер доступен и принимает запросы
4. **Неполные данные**: Проверьте что все необходимые поля заполнены

### Логи для диагностики
```bash
# Проверка последних кликов
SELECT click_id, partner_id, sub_id_1, sub_id_2, sub_id_3 
FROM tracking_clicks 
ORDER BY created_at DESC LIMIT 10;

# Проверка постбек шаблонов
SELECT name, url, events, is_active 
FROM postback_templates 
WHERE is_active = true;
```

Система полностью готова к продуктивному использованию и обеспечивает надежную интеграцию с любыми внешними трекерами.