# Анализ архитектуры потока данных для аналитики

## Поток данных от клика до аналитики

### 1. ИСХОДНЫЕ СТРАНИЦЫ И СОБЫТИЯ

**Источники трафика:**
- Внешние трафик-источники (Facebook, Google Ads, партнерские сети)
- Прямой трафик на лендинги
- Email кампании
- Реферальные ссылки

**Первичные точки входа:**
```
GET /click?partner_id={id}&offer_id={id}&clickid={external_clickid}&sub1={}&sub2={}...
```

### 2. ОТСЛЕЖИВАНИЕ КЛИКОВ

**Таблица: `tracking_clicks`**
- ✅ Сохраняет clickId (уникальный внутренний)
- ✅ IP, UserAgent, Referer, Country, Device, Browser, OS
- ✅ SubID 1-5 от внешних источников
- ✅ partnerId, offerId, trackingLinkId
- ✅ Статус конверсии

**Процесс:**
1. Внешний трафик → `/click` endpoint
2. Генерируется внутренний clickId
3. Данные сохраняются в `tracking_clicks`
4. Редирект на лендинг оффера

### 3. СОБЫТИЯ КОНВЕРСИИ

**Постбеки (Postbacks):**
- Регистрации (lead)
- Депозиты (ftd - first time deposit)
- Повторные депозиты 
- Отклонения (reject)
- Подтверждения (approve)

**Таблицы:**
- `postbacks` - настройки постбеков
- `postback_logs` - история отправки
- `statistics` - агрегированная статистика

### 4. ТЕКУЩИЕ ПРОБЛЕМЫ В ПОТОКЕ ДАННЫХ

#### 🔴 КРИТИЧЕСКИЕ НЕДОСТАТКИ:

1. **Отсутствует связь клик → конверсия:**
   - `tracking_clicks` имеет поле `conversionData`, но не используется
   - Нет прямой связи между clickId и конверсионными событиями
   - PostbackLogs не связаны с исходными кликами

2. **Аналитика использует mock данные:**
   - `getAnalyticsData()` возвращает фиктивные данные
   - Нет реального агрегирования из `tracking_clicks` + `postback_logs`

3. **Недостающие поля в tracking_clicks:**
   - SubID 6-30 (аналитика показывает 30 полей)
   - Fraud detection результаты
   - Bot detection данные
   - ROI, CR, EPC расчеты

#### 🟡 ДОПОЛНИТЕЛЬНЫЕ ПРОБЛЕМЫ:

4. **Отсутствует таблица событий:**
   - Нужна `conversion_events` для связи кликов и конверсий
   
5. **Нет real-time обновлений:**
   - Статистика не обновляется при получении постбеков

6. **Недостаточная детализация:**
   - Нет сохранения данных о лендингах
   - Отсутствует информация о времени на сайте
   - Нет данных о пути пользователя

### 5. РЕКОМЕНДУЕМЫЕ ИСПРАВЛЕНИЯ

#### Таблица событий конверсии:
```sql
CREATE TABLE conversion_events (
  id VARCHAR PRIMARY KEY,
  click_id VARCHAR REFERENCES tracking_clicks(click_id),
  event_type VARCHAR, -- 'lead', 'ftd', 'deposit', 'approve', 'reject'
  event_data JSONB,
  revenue DECIMAL,
  payout DECIMAL,
  external_id VARCHAR, -- ID из внешней системы
  created_at TIMESTAMP
);
```

#### Обновление tracking_clicks:
```sql
ALTER TABLE tracking_clicks ADD COLUMN:
  sub_id_6 TEXT, sub_id_7 TEXT, ... sub_id_30 TEXT,
  fraud_score INTEGER,
  is_bot BOOLEAN,
  vpn_detected BOOLEAN,
  landing_page_time INTEGER,
  conversion_probability DECIMAL
```

#### Реальная аналитика:
- Заменить mock данные на JOIN запросы
- Агрегировать из tracking_clicks + conversion_events
- Добавить real-time расчеты ROI, CR, EPC

### 6. МОДУЛИ ТРЕБУЮЩИЕ ИНТЕГРАЦИИ

1. **Fraud Detection Service** → tracking_clicks.fraud_score
2. **Bot Detection Service** → tracking_clicks.is_bot  
3. **GEO Service** → tracking_clicks.country
4. **Device/Browser Detection** → tracking_clicks.device/browser
5. **Landing Page Tracker** → tracking_clicks.landing_page_time
6. **Conversion Attribution** → conversion_events
7. **Revenue Calculator** → real-time ROI/CR/EPC

### 7. ИСТОЧНИКИ ДАННЫХ В АНАЛИТИКЕ

#### 🟢 ЧТО РАБОТАЕТ:
- **Tracking System**: `/click` endpoint сохраняет данные в `tracking_clicks`
- **Postback System**: Технически настроен для получения конверсий
- **Statistics Table**: Содержит агрегированные данные по кликам/конверсиям
- **Dashboard Metrics**: Используют реальные данные из `statistics` и `users` таблиц

#### 🔴 ЧТО НЕ РАБОТАЕТ:

1. **Аналитика (100+ полей) = MOCK ДАННЫЕ**
   - Метод: `storage.getAdminAnalytics()` (строка 3033)
   - Возвращает Array.from({ length: 100 }) с фиктивными данными
   - SubID 1-30, GEO, Device data - все генерируется случайно

2. **Отсутствует интеграция с реальными источниками:**
   - `tracking_clicks` → Analytics (НЕТ СВЯЗИ)
   - `postback_logs` → Analytics (НЕТ СВЯЗИ)  
   - `statistics` → Analytics (НЕТ СВЯЗИ)

3. **Недостающие модули:**
   - Fraud Detection сервис
   - Bot Detection сервис
   - GEO определение по IP
   - Device/Browser парсинг UserAgent

### 8. ПЛАН ИСПРАВЛЕНИЯ

#### Фаза 1: Замена mock данных на реальные
```javascript
// Заменить storage.getAdminAnalytics() на реальный JOIN:
SELECT 
  tc.clickId, tc.ip, tc.country, tc.device, tc.browser,
  tc.subId1, tc.subId2, tc.subId3, tc.subId4, tc.subId5,
  pl.eventType, pl.responseStatus,
  s.clicks, s.conversions, s.revenue
FROM tracking_clicks tc
LEFT JOIN postback_logs pl ON tc.clickId = pl.clickId  
LEFT JOIN statistics s ON tc.partnerId = s.partnerId AND tc.offerId = s.offerId
```

#### Фаза 2: Добавление недостающих полей
```sql
ALTER TABLE tracking_clicks ADD COLUMNS:
  sub_id_6 TO sub_id_30,
  fraud_score INTEGER,
  is_bot BOOLEAN,
  vpn_detected BOOLEAN,
  mobile_carrier TEXT,
  connection_type TEXT
```

#### Фаза 3: Интеграция внешних сервисов
- IP → GEO определение
- UserAgent → Device/Browser/OS
- Fraud detection API
- Bot detection API

### 9. МОДУЛИ ТРЕБУЮЩИЕ ИНТЕГРАЦИИ

1. **GEO Service**: IP → Country, City, ISP
2. **UserAgent Parser**: UserAgent → Device/Browser/OS 
3. **Fraud Detection**: IP/Device → Risk Score
4. **Bot Detection**: Patterns → Bot Flag
5. **Mobile Carrier Detection**: IP → Carrier Name
6. **VPN Detection**: IP → VPN Flag
7. **Connection Type Detection**: IP → WiFi/Mobile/Desktop

### 10. ФИНАЛЬНЫЙ СТАТУС

❌ **Аналитика = 100% MOCK ДАННЫЕ** 
❌ **Нет связи между модулями**
❌ **SubID 6-30 не сохраняются**
❌ **Fraud/Bot detection не интегрированы**
✅ **Базовый tracking кликов работает**
✅ **Dashboard показывает реальные метрики**
✅ **Постбеки технически настроены**

**КРИТИЧЕСКИ ВАЖНО**: Вся аналитическая система показывает фиктивные данные и требует полной переработки для работы с реальными источниками данных.