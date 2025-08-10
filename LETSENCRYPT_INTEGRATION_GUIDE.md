# Интеграция с реальным Let's Encrypt

## Требования для реальной выдачи SSL сертификатов

### 1. Установка зависимостей

```bash
npm install acme-client
```

### 2. Переменные окружения

Добавьте в ваш `.env` файл:

```env
# Let's Encrypt настройки
LETSENCRYPT_CONTACT_EMAIL=admin@your-domain.com
LETSENCRYPT_ACCOUNT_KEY_PATH=./.letsencrypt/account.key
NODE_ENV=production  # для production сертификатов, или staging для тестов

# DNS провайдер (если используете DNS-01 challenge)
CLOUDFLARE_API_KEY=your-cloudflare-api-key
CLOUDFLARE_EMAIL=your-email@domain.com

# Webhook для уведомлений
SSL_WEBHOOK_URL=https://your-domain.com/api/ssl-notifications
```

### 3. Конфигурация веб-сервера

#### Nginx конфигурация:
```nginx
server {
    listen 80;
    server_name your-domain.com *.your-domain.com;
    
    # ACME challenge для Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri =404;
    }
    
    # Редирект на HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your-domain.com *.your-domain.com;
    
    # SSL сертификаты (будут автоматически обновляться)
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_private_key /etc/ssl/private/your-domain.key;
    
    # Настройки SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Структура файлов

```
project/
├── .letsencrypt/
│   ├── account.key        # Ключ аккаунта Let's Encrypt
│   └── certificates/      # Папка для сертификатов
├── public/
│   └── .well-known/
│       └── acme-challenge/ # Challenge файлы
└── server/
    └── services/
        ├── letsencrypt.ts  # Новый сервис
        └── customDomains.ts
```

### 5. Изменения в коде

Замените метод `simulateSSLIssuance` в `customDomains.ts`:

```typescript
// Вместо симуляции используем реальную выдачу
private static async issueRealSSL(domain: string, domainId: string): Promise<void> {
  const { LetsEncryptService } = await import('./letsencrypt.js');
  await LetsEncryptService.issueRealCertificate(domain, domainId);
}
```

### 6. Настройка cron задач

Добавьте автоматическое обновление сертификатов:

```bash
# Обновление каждый день в 2:30 утра
30 2 * * * /usr/bin/node /path/to/your/app/scripts/renew-certificates.js
```

Создайте файл `scripts/renew-certificates.js`:
```javascript
import { scheduledCertificateRenewal } from '../server/services/letsencrypt.js';

async function main() {
  try {
    await scheduledCertificateRenewal();
    console.log('Обновление сертификатов завершено');
  } catch (error) {
    console.error('Ошибка обновления сертификатов:', error);
    process.exit(1);
  }
}

main();
```

### 7. DNS настройки

Для каждого домена нужно:

1. **A запись** или **CNAME запись** указывающая на ваш сервер
2. **TXT запись** для верификации (автоматически проверяется)

Пример DNS записей:
```
example.com.        A      1.2.3.4
track.example.com.  CNAME  your-server.com.
```

### 8. Rate Limits Let's Encrypt

**Staging окружение** (для тестов):
- Нет строгих ограничений
- Используется для разработки

**Production окружение**:
- 50 сертификатов в неделю на домен
- 300 новых заказов в час на аккаунт
- 5 неудачных попыток в час

### 9. Мониторинг и уведомления

Настройте мониторинг для:
- Срока действия сертификатов
- Успешности обновлений
- Ошибок выдачи

### 10. Безопасность

- Храните приватные ключи в безопасности
- Используйте HTTPS для всех соединений
- Регулярно обновляйте зависимости
- Логируйте все операции с сертификатами

## Процесс интеграции

1. **Тестирование на staging**:
   ```env
   NODE_ENV=development
   ```

2. **Переход на production**:
   ```env
   NODE_ENV=production
   ```

3. **Обновление customDomains.ts**:
   Замените вызов `simulateSSLIssuance` на `LetsEncryptService.issueRealCertificate`

4. **Тестирование**:
   - Добавьте тестовый домен
   - Проверьте DNS записи
   - Запустите выдачу сертификата
   - Проверьте HTTPS соединение

## Отладка

Логи Let's Encrypt помогут при отладке:
```bash
tail -f /var/log/letsencrypt/letsencrypt.log
```

Проверка сертификата:
```bash
openssl x509 -in certificate.crt -text -noout
```

Проверка соединения:
```bash
curl -I https://your-domain.com
```

## Стоимость

- Let's Encrypt - **бесплатно**
- DNS провайдер - от $5/месяц
- VPS сервер - от $10/месяц
- Мониторинг - опционально

**Готовность к production**: Код готов, нужно только подключить зависимости и настроить инфраструктуру.