# Отчет по архитектуре управления ролями

## Анализ источников данных и связей

### 1. СТРУКТУРА ТАБЛИЦ

#### custom_roles таблица
- **id**: UUID первичный ключ
- **name**: Название роли
- **description**: Описание роли  
- **permissions**: JSONB массив разрешений
- **advertiser_id**: Связь с рекламодателем (NULL = глобальная роль)
- **ip_restrictions**: JSONB ограничения по IP
- **geo_restrictions**: JSONB географические ограничения  
- **time_restrictions**: JSONB временные ограничения
- **is_active**: Статус активности роли
- **created_by**: Кто создал роль
- **created_at/updated_at**: Временные метки

#### user_role_assignments таблица
- **user_id**: Связь с пользователем
- **custom_role_id**: Связь с кастомной ролью
- **assigned_by**: Кто назначил роль
- **is_active**: Активность назначения
- **expires_at**: Дата истечения роли

### 2. СВЯЗИ С ДРУГИМИ МОДУЛЯМИ

#### Связь с пользователями:
```sql
-- Количество пользователей с ролью
SELECT cr.name, COUNT(ura.user_id) as user_count
FROM custom_roles cr
LEFT JOIN user_role_assignments ura ON cr.id = ura.custom_role_id AND ura.is_active = true
GROUP BY cr.id, cr.name;
```

#### Связь с рекламодателями:
```sql
-- Роли привязанные к рекламодателям
SELECT cr.name, u.username as advertiser_name
FROM custom_roles cr
JOIN users u ON cr.advertiser_id = u.id
WHERE cr.advertiser_id IS NOT NULL;
```

### 3. ДОСТУПНЫЕ РАЗРЕШЕНИЯ

Система поддерживает следующие категории разрешений:
- **Аналитика**: view_statistics
- **Офферы**: manage_offers  
- **Пользователи**: manage_users
- **Финансы**: access_finances
- **API**: manage_postbacks
- **Безопасность**: view_fraud_alerts
- **Система**: manage_system

### 4. API ENDPOINTS И ФУНКЦИОНАЛЬНОСТЬ

#### GET /api/admin/roles
- **Параметры**: search, scope (global/advertiser/all)
- **Фильтрация**: по названию, области действия
- **Сортировка**: по названию, дате создания
- **Возвращает**: список ролей с количеством назначенных пользователей

#### POST /api/admin/roles
- **Создание**: новой роли с разрешениями и ограничениями
- **Валидация**: уникальности названия в рамках области
- **Аудит**: запись действия в логи

#### PATCH /api/admin/roles/:id
- **Обновление**: разрешений, ограничений, статуса
- **Проверка**: прав доступа на редактирование
- **Уведомления**: пользователям при изменении их ролей

#### DELETE /api/admin/roles/:id
- **Soft Delete**: роль помечается как неактивная
- **Cascade**: деактивация всех назначений роли
- **Проверка**: нельзя удалить роли с активными пользователями

### 5. ТЕКУЩИЕ ПРОБЛЕМЫ В АРХИТЕКТУРЕ

#### ❌ Отсутствующие API endpoints
```javascript
// В routes.ts НЕ НАЙДЕНЫ endpoints:
app.get('/api/admin/roles', ...)         // Получение списка ролей
app.post('/api/admin/roles', ...)        // Создание роли
app.patch('/api/admin/roles/:id', ...)   // Обновление роли  
app.delete('/api/admin/roles/:id', ...)  // Удаление роли
```

#### ❌ Отсутствующие методы в storage
```typescript
// В storage.ts НЕ РЕАЛИЗОВАНЫ методы:
getRoles(filters?: any): Promise<CustomRole[]>
createRole(role: InsertCustomRole): Promise<CustomRole>
updateRole(id: string, data: Partial<InsertCustomRole>): Promise<CustomRole>
deleteRole(id: string): Promise<void>
getRoleAssignments(roleId: string): Promise<UserRoleAssignment[]>
assignRoleToUser(userId: string, roleId: string): Promise<void>
```

#### ❌ Неполная типизация
В shared/schema.ts отсутствуют:
- `InsertCustomRole` тип
- `SelectCustomRole` тип  
- `InsertUserRoleAssignment` тип
- Relations между таблицами ролей

### 6. АРХИТЕКТУРНЫЕ ПРОБЛЕМЫ ФРОНТЕНДА

#### Использование хардкодированных данных:
```typescript
// В roles-management.tsx используются моки:
const availablePermissions: Permission[] = [
  { id: 'view_statistics', name: 'Просмотр статистики', ... }
  // Эти данные должны приходить из API
];
```

#### Отсутствие реальных API вызовов:
- Компонент делает запросы к `/api/admin/roles`, но endpoints не реализованы
- Мутации создания/обновления/удаления не работают  
- Фильтрация происходит только на клиенте

### 7. ИНТЕГРАЦИЯ С МОДУЛЯМИ БЕЗОПАСНОСТИ

#### IP ограничения:
- **ip_restrictions**: должны интегрироваться с модулем логирования входов
- **Проверка**: при каждом входе пользователя
- **Логика**: блокировка доступа при несоответствии IP

#### Географические ограничения:
- **geo_restrictions**: интеграция с GeoIP сервисами
- **Антифрод**: уведомления при входе из запрещенных стран
- **Логика**: автоматическая блокировка сессий

#### Временные ограничения:
- **time_restrictions**: контроль времени доступа
- **Формат**: `{"allowed_hours": [9, 10, 11, ..., 17], "timezone": "UTC"}`
- **Интеграция**: с модулем сессий и аудита

### 8. СОСТОЯНИЕ ДАННЫХ ДЛЯ ТЕСТИРОВАНИЯ

#### Добавлены тестовые роли:
- **Manager**: глобальная роль с полными правами
- **Analyst**: роль только для просмотра статистики  
- **Partner Manager**: роль рекламодателя для управления партнерами

#### Проверка связей:
```sql
-- Роли по областям действия
SELECT 
  CASE WHEN advertiser_id IS NULL THEN 'Глобальная' ELSE 'Рекламодателя' END as scope,
  COUNT(*) as count
FROM custom_roles 
GROUP BY advertiser_id IS NULL;
```

### 9. НЕОБХОДИМЫЕ ИСПРАВЛЕНИЯ

#### 1. Реализовать API endpoints в routes.ts
#### 2. Добавить методы в storage.ts для CRUD операций с ролями
#### 3. Создать правильную типизацию в schema.ts
#### 4. Исправить фронтенд компонент для работы с реальными API
#### 5. Добавить интеграцию с модулями безопасности
#### 6. Реализовать аудит изменений ролей
#### 7. Добавить валидацию и проверки прав доступа

## КРИТИЧЕСКИЕ НЕДОСТАТКИ

### ❌ Backend полностью не реализован
- Нет API endpoints для ролей
- Отсутствуют методы в storage
- Нет валидации и проверок безопасности

### ❌ Frontend работает с моками
- Хардкодированные разрешения
- Фейковые API вызовы  
- Отсутствие реальной фильтрации

### ❌ Нет интеграции с безопасностью
- IP/Geo ограничения не проверяются
- Временные лимиты не работают
- Отсутствует аудит действий

## СТАТУС КОМПОНЕНТОВ

✅ **База данных**: таблицы созданы, схема корректна
✅ **Типизация**: базовые типы определены
❌ **API**: endpoints не реализованы  
❌ **Storage**: методы отсутствуют
❌ **Frontend**: работает с моками
❌ **Безопасность**: интеграция отсутствует
❌ **Аудит**: логирование не настроено