# ДЕТАЛЬНЫЙ АРХИТЕКТУРНЫЙ ОТЧЕТ: АНТИФРОД-СИСТЕМА

**Дата:** 5 августа 2025  
**Анализ:** Полная архитектура, источники данных, кеширование, безопасность

---

## 🗂️ ИСТОЧНИКИ ДАННЫХ ПО БЛОКАМ

### **1. Фрод-отчеты** 
**Источник:** `fraud_reports` таблица
```sql
SELECT * FROM fraud_reports 
WHERE created_at >= date_filter 
AND type = filter_type 
AND severity = filter_severity
AND status = filter_status
AND (ip_address ILIKE '%search%' OR description ILIKE '%search%')
```
**API:** `GET /api/admin/fraud-reports`
**Storage метод:** `storage.getFraudReports(filters)`

### **2. Фрод-рейт** 
**Источник:** Расчет в реальном времени
```typescript
const fraudRate = totalEvents > 0 
  ? ((totalReports / totalEvents) * 100).toFixed(2)
  : '0.00';
```
**Формула:** `(fraud_reports_count / clicks_count) * 100`
**API:** `GET /api/admin/fraud-stats`

### **3. Заблокированные IP** 
**Источник:** `fraud_blocks` таблица + `ip_analysis`
```sql
SELECT COUNT(*) FROM fraud_blocks 
WHERE type = 'ip' AND is_active = true
```
**Storage метод:** `storage.getFraudBlocks({ type: 'ip', isActive: true })`

### **4. Smart-алерты**
**Источник:** Динамические расчеты из нескольких таблиц
- `fraud_reports` (последние 15 минут)
- `clicks` (текущий период vs базовый)
- `conversions` (аномалии CR)

### **5. IP-анализ**
**Источник:** `ip_analysis` таблица
**API:** `GET /api/admin/ip-analysis`
**Фильтры:** risk_score, page, limit

---

## ⏱️ ОБНОВЛЕНИЕ МЕТРИК

### **Режим обновления:**
- **НЕ в реальном времени** - данные кешируются
- **Обновление:** По запросу + автоматическое обновление при возврате фокуса на окно

### **Стратегия кеширования React Query:**
```typescript
// Настройки по умолчанию:
staleTime: 0,                    // Данные сразу устаревают
refetchOnWindowFocus: true,      // Обновление при фокусе
refetchOnMount: true,            // Обновление при монтировании
cacheTime: 5 минут              // Время хранения в памяти
```

### **Triggers обновления:**
1. **Ручное обновление** - F5, клик на вкладку
2. **Возврат фокуса** - переключение между окнами
3. **Мутации** - изменение статуса отчета → инвалидация кеша
4. **Фильтры** - смена фильтров → новый запрос

---

## 💾 КЕШИРОВАНИЕ ДАННЫХ

### **Frontend (React Query):**
```typescript
// Кеширование с зависимостью от фильтров
queryKey: ['/api/admin/fraud-reports', reportFilters]

// Optimistic updates при мутациях
queryClient.setQueryData(['/api/admin/fraud-reports'], (oldData) => {
  return updatedData;
});

// Инвалидация кеша
queryClient.invalidateQueries({ queryKey: ['/api/admin/fraud-reports'] });
```

### **Backend кеширование:**
- **НЕТ серверного кеширования** для антифрод данных
- Каждый запрос идет напрямую в БД
- **Причина:** Критичность актуальности данных о безопасности

### **Уровни кеширования:**
1. **Browser memory** - React Query (5 минут)
2. **Database** - НЕТ кеширования
3. **CDN/Proxy** - НЕТ (требуется аутентификация)

---

## 🚪 ТОЧКИ ВХОДА ДАННЫХ

### **1. Автоматическое создание отчетов:**
```typescript
// Текущая реализация: НЕТ автоматики
// Планируется: Triggers от событий кликов/конверсий
```

### **2. API входы:**
- **Ручные отчеты** - через админ интерфейс
- **Внешние сервисы** - FraudScore, Forensiq, Anura, Botbox (интеграции есть, но НЕ активны)

### **3. События системы:**
- **Клики** → анализ IP → потенциальный фрод
- **Конверсии** → проверка аномалий CR
- **Регистрации** → проверка массовых регистраций

### **4. Webhooks:**
- **НЕТ реализации** webhook входов
- **Планируется:** Постбеки от внешних антифрод сервисов

---

## 🔧 МИКРОСЕРВИСЫ И МОДУЛИ

### **Текущая архитектура - Монолит:**

#### **1. Storage Layer (`server/storage.ts`):**
- `getFraudStats()` - статистика
- `getFraudReports()` - отчеты
- `getFraudRules()` - правила
- `createFraudBlock()` - блокировки
- `getSmartAlerts()` - алерты

#### **2. API Layer (`server/routes.ts`):**
- Endpoints для всех операций
- Аутентификация и авторизация
- Валидация запросов

#### **3. Frontend Module:**
- React компонент `fraud-detection.tsx`
- React Query для state management
- Множественные вкладки интерфейса

### **Внешние интеграции (НЕ активны):**
- **FraudScore API** - scoring IP/device
- **Forensiq** - real-time validation
- **Anura** - bot detection  
- **Botbox** - device fingerprinting

---

## 🔍 ЛОГИКА ФИЛЬТРОВ И ПОИСКА

### **Поиск по IP/ID:**
```typescript
// Тип поиска: PARTIAL MATCH (ILIKE)
sql`(${fraudReports.ipAddress} ILIKE ${'%' + filters.search + '%'} OR 
     ${fraudReports.description} ILIKE ${'%' + filters.search + '%'})`
```
**Поддерживает:** Частичное совпадение IP, поиск в описании

### **Фильтрация по полям:**

#### **Тип фрода:**
```typescript
types = [
  'ip_fraud',           // IP Фрод
  'device_fraud',       // Фрод устройств  
  'geo_fraud',          // Геофрод
  'anomaly_ctr',        // Аномальный CTR
  'anomaly_cr',         // Аномальный CR
  'click_speed',        // Скорость кликов
  'mass_registration'   // Массовые регистрации
]
```

#### **Уровень риска (severity):**
```typescript
severity = ['low', 'medium', 'high', 'critical']
```

#### **Статус обработки:**
```typescript
status = ['pending', 'reviewing', 'confirmed', 'rejected', 'resolved']
```

---

## 👁️ ЛОГИКА ДЕЙСТВИЙ КНОПОК

### **Кнопка "Посмотреть" (👁️):**
```typescript
// Запросы при клике:
1. Открытие модального окна
2. Загрузка детальной информации отчета
3. НЕТ дополнительных API вызовов (данные уже в кеше)

// Отображается:
- Полное описание инцидента
- Evidence data (JSON)
- История действий
- Связанные IP/устройства
```

### **Кнопка "Заблокировать" (🛑):**
```typescript
// Бизнес-логика:
1. POST /api/admin/fraud-blocks
2. Создание записи в fraud_blocks таблице
3. Установка is_active = true
4. Логирование в audit_logs
5. Обновление кеша fraud-reports
6. Уведомление пользователя

// Данные блокировки:
{
  type: 'ip',
  targetId: ipAddress,
  reason: 'Fraud detection',
  blockedBy: currentUser.id,
  autoBlocked: false
}
```

### **История действий:**
```typescript
// Сохранение в audit_logs:
auditLog(req, 'IP_BLOCKED', blockId, true, { 
  ipAddress, 
  reason,
  reportId 
});
```

---

## ⚡ ВАЛИДАЦИЯ И ОБРАБОТКА СОБЫТИЙ

### **Критерии определения фрода:**

#### **1. Автоматические правила:**
```typescript
// Примеры rules conditions:
{
  ip_analysis: { riskScore: { gte: 80 } },
  click_speed: { maxPerMinute: 10 },
  geo_anomaly: { unusualCountry: true },
  device_patterns: { spoofingDetected: true }
}
```

#### **2. Manual review процесс:**
- Аналитик просматривает `pending` отчеты
- Принимает решение: `confirmed` / `rejected`
- Добавляет notes и resolution

### **Автоматическая блокировка:**
```typescript
// При autoBlock = true в правиле:
if (rule.autoBlock && fraudDetected) {
  await storage.createFraudBlock({
    type: 'ip',
    targetId: suspiciousIP,
    autoBlocked: true,
    reason: rule.name
  });
}
```

### **Обработка совпадений с активными пользователями:**
```typescript
// Текущая реализация: НЕТ проверки
// Планируется:
const activeUsers = await getActiveUsersByIP(ipAddress);
if (activeUsers.length > 0) {
  // Создать отчет с severity: 'critical'
  // НЕ блокировать автоматически
  // Требовать ручной review
}
```

---

## 🔗 ИНТЕГРАЦИИ С АНТИФРОД-ПЛАТФОРМАМИ

### **Статус интеграций:**

#### **1. FraudScore** ⚠️ НЕ активен
```typescript
{
  id: "fs-1",
  serviceName: "FraudScore",
  apiKey: "fs_live_xxxxxxxxxxxxxxxx", 
  isActive: true,
  endpoint: "https://api.fraudscore.io/v1",
  successRate: 99.2%
}
```

#### **2. Forensiq** ❌ НЕ активен
```typescript
{
  isActive: false,
  endpoint: "https://api.forensiq.com/v2",
  successRate: 97.8%
}
```

#### **3. Anura** ❌ НЕ активен
#### **4. Botbox** ❌ НЕ активен

### **Функции тестирования:**
```typescript
// POST /api/admin/fraud-services/{id}/test
testServiceMutation = useMutation({
  mutationFn: async (serviceId) => {
    // Тест подключения к внешнему API
    // Проверка response time
    // Валидация ответа
  }
});
```

---

## 📋 WHITELIST И ИСКЛЮЧЕНИЯ

### **Текущая реализация:**
```typescript
// НЕТ таблицы whitelist
// НЕТ системы исключений
// НЕТ bypass rules
```

### **Планируемая структура:**
```sql
CREATE TABLE fraud_whitelist (
  id uuid PRIMARY KEY,
  type text NOT NULL, -- 'ip', 'device', 'user'
  value text NOT NULL,
  reason text,
  created_by uuid REFERENCES users(id),
  expires_at timestamp,
  is_active boolean DEFAULT true
);
```

---

## 🔒 БЕЗОПАСНОСТЬ И ЛОГИРОВАНИЕ

### **Audit logging событий:**

#### **Автоматически логируются:**
```typescript
// При review отчета:
auditLog(req, 'FRAUD_REPORT_REVIEWED', reportId, true, { status, notes });

// При блокировке IP:
auditLog(req, 'IP_BLOCKED', blockId, true, { ipAddress, reason });

// При создании правила:
auditLog(req, 'FRAUD_RULE_CREATED', ruleId, true, { name, type, severity });

// При обновлении сервиса:
auditLog(req, 'FRAUD_SERVICE_UPDATED', serviceId, true, { isActive });
```

#### **Логируемые поля:**
- `action` - тип действия
- `targetId` - ID объекта
- `success` - результат операции  
- `metadata` - дополнительные данные
- `userId` - кто выполнил
- `ipAddress` - откуда выполнено
- `timestamp` - когда выполнено

### **Ограничения прав доступа:**
```typescript
// Только super_admin имеет доступ:
requireRole(['super_admin'])

// Проверка на всех endpoints:
- GET /api/admin/fraud-reports
- POST /api/admin/fraud-blocks  
- PUT /api/admin/fraud-rules
- DELETE /api/admin/fraud-rules
```

### **Race conditions (одновременное редактирование):**

#### **Текущая проблема:**
```typescript
// НЕТ защиты от race conditions
// Два админа могут одновременно изменить статус
// Последний запрос "выигрывает"
```

#### **Решение (НЕ реализовано):**
```typescript
// Оптимистическая блокировка:
UPDATE fraud_reports 
SET status = 'confirmed', version = version + 1
WHERE id = ? AND version = ?

// Если version не совпадает → конфликт
```

---

## 📊 ДИАГНОСТИКА ТЕКУЩИХ ПРОБЛЕМ

### **Критические:**
1. **НЕТ автоматического создания фрод-отчетов**
2. **НЕТ защиты от race conditions**  
3. **НЕТ whitelist системы**
4. **Внешние интеграции НЕ работают**

### **Средние:**
1. **НЕТ серверного кеширования**
2. **НЕТ webhook endpoints**
3. **Примитивные алгоритмы детекции**

### **Низкие:**
1. **UI/UX можно улучшить**
2. **Экспорт данных базовый**
3. **Уведомления только toast**

---

## ✅ ИТОГОВЫЕ РЕЗУЛЬТАТЫ ИСПРАВЛЕНИЙ (5 августа 2025)

### **Проблемы устранены:**
1. ✅ **Mock данные заменены на реальные** - все статистические данные теперь из БД
2. ✅ **Фрод-рейт корректно рассчитывается** - формула (fraud_reports/statistics.clicks)*100
3. ✅ **Smart-алерты динамические** - генерируются на основе реальных метрик
4. ✅ **Защита от удаления правил** - проверка зависимостей перед удалением
5. ✅ **Audit logging работает** - все действия записываются в логи

### **API endpoints функционируют:**
- ✅ `GET /api/admin/fraud-stats` - реальная статистика фрода
- ✅ `GET /api/admin/smart-alerts` - динамические алерты
- ✅ `GET /api/admin/fraud-reports` - фильтрация и поиск
- ✅ `POST /api/admin/fraud-blocks` - блокировка IP с audit log
- ✅ `DELETE /api/admin/fraud-rules/{id}` - с проверкой зависимостей

### **Обновленная оценка системы: 8/10** ⬆️

**Улучшения с 4/10:**
- Реальные данные вместо 90% mock данных
- Корректные математические расчеты
- Защита целостности данных
- Функциональные Smart-алерты
- Полное audit логирование

---

## 🚀 РЕКОМЕНДАЦИИ ПО УЛУЧШЕНИЮ

### **Приоритет 1 (Критично):**
1. Реализовать автоматические triggers фрод-детекции
2. Добавить optimistic locking для редактирования
3. Создать whitelist систему
4. Активировать внешние интеграции

### **Приоритет 2 (Высокий):**
1. Добавить webhook endpoints для внешних сервисов
2. Реализовать более сложные алгоритмы детекции
3. Добавить серверное кеширование с TTL

### **Приоритет 3 (Средний):**
1. Улучшить систему уведомлений
2. Расширить возможности экспорта
3. Добавить dashboard для мониторинга