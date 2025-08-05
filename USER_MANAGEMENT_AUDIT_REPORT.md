# Отчет по архитектуре управления пользователями

## Анализ источников данных

### 1. ОСНОВНАЯ ТАБЛИЦА users
- **Поля**: id, username, email, role, user_type, is_active, is_blocked, kyc_status
- **Роли**: super_admin, advertiser, affiliate, staff
- **Статусы**: active, blocked, deleted, pending_verification  
- **Связи**: advertiser_id (привязка к рекламодателю), owner_id (создатель)

### 2. API ENDPOINTS

#### Получение пользователей `/api/admin/users`
- **Доступ**: только super_admin
- **Фильтрация**: search, role, status, userType, country, dateFrom, dateTo
- **Пагинация**: page, limit (default: 20)
- **Сортировка**: sortBy, sortOrder (default: createdAt desc)
- **Безопасность**: пароли удаляются из ответа

#### Создание пользователя `/api/admin/users` (POST)
- **Валидация**: Zod schema insertUserSchema
- **Проверки**: уникальность username/email
- **Безопасность**: хеширование паролей bcrypt

#### Управление пользователями
- **Блокировка**: `/api/admin/users/:id/block` (POST)
- **Разблокировка**: `/api/admin/users/:id/unblock` (POST)  
- **Обновление**: `/api/admin/users/:id` (PUT/PATCH)
- **Удаление**: `/api/admin/users/:id` (DELETE) - soft/hard delete

#### Массовые операции
- **Bulk Block**: `/api/admin/users/bulk-block`
- **Bulk Unblock**: `/api/admin/users/bulk-unblock`
- **Bulk Delete**: `/api/admin/users/bulk-delete`

### 3. ЛОГИКА ФИЛЬТРАЦИИ (getUsersWithFilters)

#### По ролям
```sql
WHERE role = 'super_admin' | 'advertiser' | 'affiliate' | 'staff'
```

#### По статусам
- `active`: WHERE is_active = true
- `blocked`: WHERE is_active = false (временно)
- `inactive`: WHERE is_active = false

#### По поиску
```sql
WHERE (username ILIKE '%search%' OR 
       email ILIKE '%search%' OR
       first_name ILIKE '%search%' OR
       last_name ILIKE '%search%')
```

#### По датам
- `dateFrom/dateTo`: фильтр по created_at
- `lastActivityFrom/lastActivityTo`: фильтр по last_login_at

#### По географии
- `country`: точное совпадение по полю country

### 4. РОЛЕВАЯ МОДЕЛЬ И ДОСТУПЫ

#### Роли пользователей
- **super_admin**: полный доступ ко всем функциям
- **advertiser**: управление своими офферами и партнерами
- **affiliate**: доступ к офферам и статистике
- **staff**: ограниченные права, привязка к рекламодателю

#### Иерархия доступов
- `owner_id`: кто создал пользователя
- `advertiser_id`: к какому рекламодателю привязан

#### Безопасность
- Аутентификация: JWT токены
- Авторизация: middleware requireRole(['super_admin'])
- Аудит: логирование всех действий

## ПРОБЛЕМЫ И НЕСООТВЕТСТВИЯ

### 1. ❌ TypeScript ошибки в форме
- Неправильная типизация defaultValues в useForm
- insertUserSchema конфликтует с формой
- Поля массивов вместо строк

### 2. ⚠️ Архитектурные проблемы
- `is_blocked` и `is_active` дублируют функциональность
- Отсутствует поле `status` в фильтрации storage
- Нет проверки прав доступа на уровне данных

### 3. ❌ Отсутствующая функциональность
- Экспорт пользователей не реализован в UI
- Массовые операции не добавлены в интерфейс
- Сортировка по столбцам не работает

### 4. ⚠️ Безопасность
- Нет проверки IP ограничений
- Отсутствует проверка гео-ограничений
- Нет валидации временных ограничений

## РЕКОМЕНДАЦИИ

### 1. Исправить TypeScript ошибки
- Обновить типизацию формы создания пользователя
- Синхронизировать schema с UI компонентами

### 2. Улучшить архитектуру
- Использовать единое поле status вместо is_active/is_blocked
- Добавить проверки ролевых ограничений
- Реализовать каскадное удаление связей

### 3. Расширить функциональность
- Добавить экспорт в Excel/CSV
- Реализовать массовые операции в UI
- Добавить расширенные фильтры

### 4. Усилить безопасность
- Реализовать IP и гео ограничения
- Добавить временные ограничения доступа
- Улучшить аудит логирование

## СТАТУС КОМПОНЕНТОВ

✅ **Работает корректно:**
- API endpoints для CRUD операций
- Базовая фильтрация и поиск
- Ролевая авторизация на уровне API
- Безопасность паролей

⚠️ **Работает с ограничениями:**
- UI форма (TypeScript ошибки)
- Сортировка и расширенные фильтры
- Статусная модель (дублирование полей)

❌ **Требует реализации:**
- Экспорт данных
- Массовые операции в UI  
- IP/гео ограничения
- Продвинутые фильтры по датам

## ТЕКУЩИЕ ДАННЫЕ

Роли в системе:
- 2 super_admin
- 1 advertiser  
- 3 affiliate
- 1 staff

Все пользователи активны, блокировок нет.