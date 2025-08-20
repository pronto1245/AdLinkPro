# Быстрая настройка реальных SSL сертификатов

## Что нужно от вас (один раз):

### 1. Домен + DNS
```bash
# Добавьте в DNS панели вашего домена:
A    your-domain.com      → 1.2.3.4 (IP вашего сервера)
A    *.your-domain.com    → 1.2.3.4 (для всех поддоменов)
```

### 2. Настройка сервера
```bash
# На вашем сервере:
sudo ufw allow 80
sudo ufw allow 443
```

### 3. Переменные окружения
```bash
# В файле .env:
echo "ENABLE_REAL_SSL=true" >> .env
echo "LETSENCRYPT_CONTACT_EMAIL=admin@your-domain.com" >> .env
echo "NODE_ENV=production" >> .env
```

### 4. Перезапуск приложения
```bash
npm run dev
```

## Проверка что все работает:

1. **DNS проверка:**
   ```bash
   dig your-domain.com  # должен показать ваш IP
   ```

2. **Добавить домен в систему:**
   ```bash
   curl -X POST "http://localhost:5000/api/advertiser/profile/domains" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"domain": "your-domain.com"}'
   ```

3. **SSL автоматически выдастся** после верификации домена

## Стоимость:
- Let's Encrypt SSL: **БЕСПЛАТНО**
- Домен: ~$12/год
- VPS: ~$60/год
- **Итого: ~$72/год**

## Troubleshooting:

**Ошибка "Domain not accessible":**
- Проверьте DNS: `dig your-domain.com`
- Убедитесь что порт 80 открыт
- Подождите распространения DNS (до 24 часов)

**Ошибка "Challenge failed":**
- Проверьте что файлы доступны: `curl http://your-domain.com/.well-known/acme-challenge/test`
- Проверьте права доступа к папке `public/`

**Rate limit ошибки:**
- Временно установите `NODE_ENV=development` для staging тестов
- Подождите час для сброса лимитов

## Альтернативы (если нет своего сервера):

1. **Cloudflare Pages + Workers** (бесплатно)
2. **Vercel** (бесплатно для некоммерческих проектов)  
3. **Netlify** (бесплатно с ограничениями)

Все эти платформы предоставляют SSL автоматически!