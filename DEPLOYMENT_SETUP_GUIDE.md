# Пошаговая инструкция: Deployment и Custom Domain

## Шаг 1: Создание Deployment

### 1.1 Нажмите кнопку Deploy
- В правом верхнем углу Replit нажмите кнопку **"Deploy"**
- Или используйте кнопку которая появилась в чате выше

### 1.2 Настройте Deployment
1. **Выберите тип**: Static Deployment или Reserved VM
2. **Название**: `setbet-arbit-production`
3. **Build Command**: `npm run build` (если нужно)
4. **Start Command**: `npm start`
5. **Port**: 5000

### 1.3 Получите домен deployment
После создания вы получите домен вида:
```
https://setbet-arbit-production--your-username.replit.app
```

## Шаг 2: Настройка Custom Domain через Deployment

### 2.1 В панели Deployment
1. Откройте созданный deployment
2. Перейдите в раздел **"Custom Domains"**
3. Нажмите **"Add Domain"**
4. Введите: `setbet-arbit.ru`

### 2.2 Получите DNS инструкции
Replit покажет вам точные DNS записи для настройки:
```
CNAME: setbet-arbit.ru → your-deployment.replit.app
```

## Шаг 3: Настройка DNS у регистратора

### 3.1 Зайдите в панель DNS вашего регистратора
- Найдите раздел "DNS Management" или "DNS Settings"
- Обычно находится в панели управления доменом

### 3.2 Удалите старые записи
Удалите текущие A записи для `setbet-arbit.ru`:
```
Удалить: A setbet-arbit.ru → 35.231.184.36
```

### 3.3 Добавьте CNAME запись
```
Тип: CNAME
Имя: @ (или setbet-arbit.ru)
Значение: your-deployment.replit.app
TTL: 300
```

### 3.4 Добавьте CNAME для www
```
Тип: CNAME
Имя: www
Значение: your-deployment.replit.app
TTL: 300
```

## Шаг 4: Проверка и активация

### 4.1 Дождитесь распространения DNS (5-30 минут)
Проверяйте командой:
```bash
nslookup setbet-arbit.ru
# Должен показать IP deployment домена
```

### 4.2 В панели Replit Deployment
- Нажмите **"Verify Domain"** 
- Replit проверит DNS настройки
- При успехе статус изменится на "Verified"

### 4.3 Активация SSL
- Replit автоматически получит Let's Encrypt сертификат
- Процесс занимает 2-5 минут
- Статус изменится на "SSL Active"

## Шаг 5: Проверка работы

### 5.1 Тестируйте редирект
```bash
# HTTP должен редиректить на HTTPS
curl -I http://setbet-arbit.ru
# Ответ: 301 Moved Permanently
# Location: https://setbet-arbit.ru

# HTTPS должен работать
curl -I https://setbet-arbit.ru
# Ответ: 200 OK
```

### 5.2 Проверьте в браузере
- Откройте http://setbet-arbit.ru
- Должен автоматически перейти на https://setbet-arbit.ru
- Зеленый замок SSL в адресной строке

## Альтернативный способ: Через Replit DNS

### Если у вас проблемы с регистратором

1. **Смените NS записи** у регистратора на Replit DNS
2. **Replit управляет DNS** автоматически
3. **Все настройки** делаются в панели Replit

Подробности в документации Replit Custom Domains.

## Troubleshooting

### Проблема: DNS не распространяется
**Решение**: 
- Проверьте TTL (должен быть 300 или меньше)
- Очистите DNS кеш: `sudo systemctl flush-dns`
- Подождите до 24 часов

### Проблема: SSL не активируется
**Решение**:
- Убедитесь что DNS правильно настроен
- Проверьте что домен доступен по HTTP
- Обратитесь в поддержку Replit

### Проблема: Редирект не работает
**Решение**:
- Проверьте что deployment запущен
- Убедитесь что код редиректа работает в development
- Проверьте логи deployment

## Результат

После выполнения всех шагов:
- ✅ `http://setbet-arbit.ru` → автоматический редирект на `https://`
- ✅ `https://setbet-arbit.ru` → работает с SSL сертификатом
- ✅ Стабильный IP через CNAME
- ✅ Автоматическое обновление SSL сертификата

---

**Время выполнения**: 30-60 минут (включая ожидание DNS)
**Сложность**: Средняя
**Поддержка**: Replit Support для вопросов по deployment