# Seed Script для создания реальных пользователей

Этот скрипт автоматически создает пользователей для всех трех ролей системы AdLinkPro.

## Описание

Скрипт создает следующих пользователей:

- **Super Admin**: 9791207@gmail.com, пароль: 77GeoDav=, роль: super_admin
- **Advertiser**: 6484488@gmail.co, пароль: 7787877As, роль: advertiser  
- **Affiliate**: pablota096@gmail.com, пароль: 7787877As, роль: affiliate

## Использование

### Базовое использование

```bash
node seed/create_real_users.js
```

### С кастомным BASE_URL

```bash
BASE_URL=https://your-api-domain.com node seed/create_real_users.js
```

## Требования

- Node.js с поддержкой fetch API (Node.js 18+)
- Запущенный сервер AdLinkPro с endpoint `/api/auth/register`
- Настроенная база данных PostgreSQL

## Поведение скрипта

1. **Проверка доступности API** - скрипт сначала проверяет, доступен ли сервер
2. **Создание пользователей** - отправляет POST запросы на `/api/auth/register`
3. **Обработка ошибок** - предоставляет детальную информацию об ошибках
4. **Альтернативные решения** - если endpoint недоступен, показывает способы решения

## Альтернативные способы создания пользователей

### 1. Через переменные окружения

Установите переменные окружения:

```bash
export OWNER_EMAIL=9791207@gmail.com
export OWNER_PASSWORD=77GeoDav=
export ADVERTISER_EMAIL=6484488@gmail.co
export ADVERTISER_PASSWORD=7787877As
export PARTNER_EMAIL=pablota096@gmail.com
export PARTNER_PASSWORD=7787877As
export ALLOW_SEED=1
```

Затем вызовите dev endpoint:

```bash
curl -X POST http://localhost:5000/api/dev/seed-users \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 2. Через SQL команды

Выполните SQL команды в PostgreSQL:

```sql
-- Super Admin
INSERT INTO users (email, username, role, password_hash, created_at) VALUES
  ('9791207@gmail.com', 'superadmin_georgy', 'SUPER_ADMIN', '$2b$10$[BCRYPT_HASH]', NOW());

-- Advertiser  
INSERT INTO users (email, username, role, password_hash, created_at) VALUES
  ('6484488@gmail.co', 'advertiser_alex', 'ADVERTISER', '$2b$10$[BCRYPT_HASH]', NOW());

-- Affiliate
INSERT INTO users (email, username, role, password_hash, created_at) VALUES
  ('pablota096@gmail.com', 'affiliate_pablo', 'AFFILIATE', '$2b$10$[BCRYPT_HASH]', NOW());
```

**Примечание**: Замените `[BCRYPT_HASH]` на реальный bcrypt хэш пароля.

### Генерация bcrypt хэшей

Для генерации хэшей паролей используйте Node.js:

```javascript
const bcrypt = require('bcrypt');

// Для пароля "77GeoDav="
bcrypt.hash('77GeoDav=', 10, (err, hash) => {
  console.log('Hash for 77GeoDav=:', hash);
});

// Для пароля "7787877As"
bcrypt.hash('7787877As', 10, (err, hash) => {
  console.log('Hash for 7787877As:', hash);
});
```

## Структура ответа

При успешном выполнении скрипт выведет:

```
🎉 Все пользователи созданы успешно!
```

При ошибках будет показана детальная информация и возможные решения.

## Настройка полной системы регистрации

Для использования endpoint'а `/api/auth/register` убедитесь, что:

1. В `server/index.ts` вызывается функция `registerRoutes()`
2. Настроена база данных PostgreSQL
3. Установлена переменная окружения `JWT_SECRET`
4. Сервер запущен в режиме разработки или продакшн

## Безопасность

⚠️ **Внимание**: Этот скрипт создает пользователей с реальными email адресами и паролями. Используйте только в среде разработки или с соответствующими мерами безопасности.

## Логирование

Скрипт выводит подробную информацию о процессе создания:

- ✅ Успешные операции
- ❌ Ошибки и их описание  
- 💡 Советы по решению проблем
- 📊 Итоговая статистика

## Поддержка

При возникновении проблем проверьте:

1. Доступность сервера на указанном BASE_URL
2. Наличие endpoint'а `/api/auth/register`
3. Подключение к базе данных
4. Логи сервера для дополнительной диагностики