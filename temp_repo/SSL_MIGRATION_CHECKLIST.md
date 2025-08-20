# Миграция на реальные SSL сертификаты

## Текущий статус
✅ Демо система работает
✅ Код для реальной интеграции готов  
✅ Зависимость `acme-client` установлена
✅ Папка для challenge файлов создана

## Пошаговый план миграции

### Этап 1: Подготовка инфраструктуры

1. **Настройка DNS и сервера**
   ```bash
   # Убедитесь что домены указывают на ваш сервер
   dig your-domain.com  # должен возвращать ваш IP
   ```

2. **Настройка веб-сервера (Nginx)**
   ```nginx
   # Добавить в конфигурацию Nginx
   location /.well-known/acme-challenge/ {
       root /path/to/your/app/public;
       try_files $uri =404;
   }
   ```

3. **Переменные окружения**
   ```env
   ENABLE_REAL_SSL=true
   LETSENCRYPT_CONTACT_EMAIL=admin@your-domain.com
   NODE_ENV=production
   ```

### Этап 2: Тестирование на staging

1. **Включить staging режим**
   ```env
   NODE_ENV=development  # использует staging Let's Encrypt
   ENABLE_REAL_SSL=true
   ```

2. **Добавить тестовый домен**
   - Должен быть реальный домен с правильными DNS записями
   - Тестировать на поддомене (например: test.your-domain.com)

3. **Проверить выдачу staging сертификата**

### Этап 3: Production режим

1. **Переключить на production**
   ```env
   NODE_ENV=production
   ENABLE_REAL_SSL=true
   ```

2. **Настроить cron для автообновления**
   ```bash
   # Добавить в crontab
   30 2 * * * cd /path/to/app && node scripts/renew-certificates.js
   ```

### Этап 4: Мониторинг

1. **Настроить уведомления**
   ```env
   SSL_WEBHOOK_URL=https://your-domain.com/api/ssl-notifications
   ```

2. **Проверить логи**
   ```bash
   tail -f logs/ssl.log
   ```

## Команды для быстрого переключения

**Включить реальные SSL:**
```bash
echo "ENABLE_REAL_SSL=true" >> .env
echo "NODE_ENV=production" >> .env
echo "LETSENCRYPT_CONTACT_EMAIL=admin@your-domain.com" >> .env
```

**Вернуться к демо:**
```bash
echo "ENABLE_REAL_SSL=false" >> .env
```

**Проверить статус:**
```bash
curl -X GET "http://localhost:5000/api/advertiser/profile/domains" \
  -H "Authorization: Bearer $TOKEN"
```

## Требования к доменам

- Реальный домен с валидными DNS записями
- A запись указывающая на ваш сервер
- Доступ к изменению DNS записей для верификации
- Порт 80 открыт для HTTP challenge

## Ограничения Let's Encrypt

**Rate Limits:**
- 50 сертификатов/неделю на домен
- 5 неудачных попыток/час
- 300 новых заказов/час на аккаунт

**Рекомендации:**
- Начинать с staging окружения
- Тестировать на ограниченном количестве доменов
- Настроить мониторинг ошибок

## Troubleshooting

**Ошибка HTTP-01 challenge:**
- Проверить доступность /.well-known/acme-challenge/
- Убедиться что домен указывает на правильный IP
- Проверить файрвол (порт 80 должен быть открыт)

**Ошибка DNS:**
- Подождать распространения DNS (до 24 часов)
- Проверить через разные DNS серверы

**Rate limit ошибки:**
- Переключиться на staging для тестов
- Подождать сброса лимитов (обычно 1 час)

## Costs

**Let's Encrypt:** Бесплатно
**VPS сервер:** ~$10/месяц
**DNS провайдер:** ~$5/месяц
**Мониторинг (опционально):** ~$5/месяц

**Итого:** ~$15-20/месяц для production инфраструктуры