# Быстрый чек-лист: Custom Domain + Редирект

## 📋 Что делать (по порядку):

### 1. Создать Deployment (5 мин)
- [ ] Нажать кнопку **Deploy** в Replit
- [ ] Выбрать Reserved VM или Static
- [ ] Название: `setbet-arbit-production`
- [ ] Запустить deployment

### 2. Добавить Custom Domain (2 мин)  
- [ ] В deployment → Custom Domains
- [ ] Add Domain: `setbet-arbit.ru`
- [ ] Скопировать CNAME запись от Replit

### 3. Настроить DNS (10 мин)
- [ ] Зайти в панель DNS регистратора
- [ ] Удалить старую A запись (35.231.184.36)
- [ ] Добавить CNAME: `setbet-arbit.ru → your-deployment.replit.app`
- [ ] TTL: 300 секунд

### 4. Проверить (15-30 мин)
- [ ] `nslookup setbet-arbit.ru` → показывает IP deployment
- [ ] В Replit нажать "Verify Domain" 
- [ ] Дождаться SSL Active
- [ ] Тест: `curl -I http://setbet-arbit.ru` → 301 redirect

## ✅ Результат:
- HTTP автоматически редиректит на HTTPS
- SSL сертификат работает  
- Стабильное подключение без смены IP

## ⚡ Время: ~30-45 минут

---
**Начинайте с шага 1!**