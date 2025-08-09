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

## 🔄 Retry логика

Система автоматически повторяет неудачные попытки:
- Максимум 3 попытки на постбек
- Экспоненциальная задержка между попытками
- Timeout 30 секунд на запрос
- Логирование всех попыток

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