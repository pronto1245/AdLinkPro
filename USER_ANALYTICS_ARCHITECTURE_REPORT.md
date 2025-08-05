# Отчет по архитектуре аналитики пользователей

## Анализ источников данных

### 1. ОСНОВНЫЕ МЕТРИКИ

#### Всего пользователей  
- **Источник**: `users` таблица
- **Запрос**: `SELECT COUNT(*) FROM users`
- **Endpoint**: `/api/admin/analytics/users`
- **Фильтрация**: по роли (role)

#### Активные за 24ч
- **Источник**: `users.last_login_at`
- **Запрос**: `SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '24 hours'`
- **ПРОБЛЕМА**: ❌ Не реализовано, возвращает mock данные

#### Новые пользователи
- **Источник**: `users.created_at`  
- **Запрос**: `SELECT COUNT(*) FROM users WHERE created_at >= startDate`
- **Фильтрация**: по периоду (7d, 30d, 90d)

#### Фрод-алерты
- **Источник**: `fraud_alerts` таблица
- **Запрос**: `SELECT COUNT(*) FROM fraud_alerts WHERE created_at >= startDate`
- **Endpoint**: `/api/admin/analytics/fraud`

### 2. ГРАФИКИ И ДИАГРАММЫ

#### Распределение по ролям
- **Источник**: `users.role`
- **Запрос**: `SELECT role, COUNT(*) FROM users GROUP BY role`
- **Статус**: ✅ Работает корректно

#### Активность пользователей (тренды)
- **Проблема**: ❌ Используются mock данные
- **Должно быть**: реальные данные из `users.last_login_at` или таблицы логов

#### Новые регистрации (тренды)  
- **Проблема**: ❌ Используются mock данные
- **Должно быть**: `SELECT DATE(created_at), COUNT(*) FROM users GROUP BY DATE(created_at)`

#### География пользователей
- **Проблема**: ❌ Используются mock данные  
- **Должно быть**: реальные данные из `users.country`

### 3. СОБЫТИЯ БЕЗОПАСНОСТИ

#### Источники для безопасности:
- **fraud_alerts**: подозрительная активность
- **audit_logs**: действия пользователей (если реализованы)
- **device_tracking**: новые устройства
- **ip_analysis**: анализ IP адресов

#### Типы событий:
- **Suspicious Login**: смена IP/устройства
- **Duplicate Conversion**: дублирование конверсий
- **Geo Anomaly**: активность из запрещенных регионов
- **Velocity Alerts**: превышение лимитов активности

### 4. ЭКСПОРТ ДАННЫХ

#### Endpoint: `/api/admin/analytics/export`
- **Форматы**: CSV, Excel, JSON
- **Параметры**: format, period, role
- **ПРОБЛЕМА**: ❌ Не реализован метод exportAnalytics в storage

## КРИТИЧЕСКИЕ ПРОБЛЕМЫ

### 1. ❌ Mock данные вместо реальных источников

#### В getUserAnalyticsDetailed:
```javascript
// НЕПРАВИЛЬНО - mock данные
const activityTrend = Array.from({ length: 7 }, (_, i) => {
  return {
    date: date.toISOString().split('T')[0],
    active24h: Math.floor(Math.random() * 100) + 50,
    active7d: Math.floor(Math.random() * 200) + 100
  };
});

// ДОЛЖНО БЫТЬ - реальные данные из БД
const activityTrend = await db
  .select({
    date: sql`DATE(last_login_at)`,
    count: count()
  })
  .from(users)
  .where(gte(users.lastLoginAt, startDate))
  .groupBy(sql`DATE(last_login_at)`);
```

### 2. ❌ Отсутствующие методы в storage
- `exportAnalytics` - не реализован
- `getFraudAnalytics` - может отсутствовать

### 3. ❌ Неточные источники данных
- География пользователей показывает фиктивные страны
- Тренды активности генерируются случайно
- События безопасности не связаны с реальными алертами

### 4. ⚠️ Архитектурные недочеты
- Нет разделения между активностью (logins) и действиями (clicks)
- Отсутствует логирование пользовательских действий
- Нет связи между IP адресами и географией

## ТЕКУЩЕЕ СОСТОЯНИЕ ДАННЫХ

### Реальные данные в системе:
- **6 пользователей**: 2 super_admin, 1 advertiser, 2 affiliate, 1 staff
- **1 активный за 24ч**: только superadmin имеет last_login_at
- **6 новых за 7 дней**: все зарегистрированы недавно
- **4 страны**: RU, US, DE, GB
- **3 фрод-алерта**: реальные записи в fraud_alerts

### Данные для исправления:
```sql
-- Реальная активность по дням
SELECT 
  DATE(last_login_at) as date,
  COUNT(*) as active_users
FROM users 
WHERE last_login_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(last_login_at);

-- Реальная география
SELECT 
  country,
  COUNT(*) as user_count
FROM users 
WHERE country IS NOT NULL
GROUP BY country;

-- Реальные регистрации по дням  
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_registrations
FROM users 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)  
GROUP BY DATE(created_at);
```

## РЕКОМЕНДАЦИИ

### 1. Исправить источники данных
- Заменить все mock данные на реальные SQL запросы
- Реализовать отсутствующие методы в storage
- Добавить логирование пользовательской активности

### 2. Улучшить безопасность
- Связать фрод-алерты с реальными событиями
- Добавить детекцию подозрительной активности
- Реализовать мониторинг IP и устройств

### 3. Расширить метрики
- Добавить метрики производительности
- Реализовать A/B тестирование показателей
- Создать прогнозирование трендов

### 4. Исправить экспорт
- Реализовать метод exportAnalytics
- Добавить форматирование для Excel
- Включить фильтры в экспорт

## СТАТУС КОМПОНЕНТОВ

✅ **Работает с реальными данными:**
- Подсчет общего количества пользователей
- Фильтрация по ролям  
- Новые регистрации за период
- Распределение по ролям

❌ **Использует mock данные:**
- Тренды активности пользователей
- География пользователей  
- Графики регистраций по дням
- События безопасности

⚠️ **Частично работает:**
- Активные за 24ч (данные есть, но логика неполная)
- Фрод-алерты (данные есть, но не детализированы)
- Экспорт (API есть, метод отсутствует)