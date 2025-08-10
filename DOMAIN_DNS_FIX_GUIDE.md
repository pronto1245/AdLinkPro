# Инструкция по исправлению DNS настроек домена arbiconnect.store

## Проблема
Домен `arbiconnect.store` указывает на неправильный IP адрес `34.75.255.94` (другой сервер), в то время как Replit workspace находится на `34.117.33.233`.

## Диагностика
```bash
# Текущий DNS
$ nslookup arbiconnect.store
Name: arbiconnect.store
Address: 34.75.255.94  ❌ НЕПРАВИЛЬНО (другой сервер)

# Правильный DNS для Replit
$ nslookup workspace--karaterezzas.replit.app  
Name: workspace--karaterezzas.replit.app
Address: 34.117.33.233  ✅ ПРАВИЛЬНО
```

## Что происходит сейчас
- `34.75.255.94/yQQZgm` → возвращает текст `ヾ(*ФωФ)βyё βyё☆彡` (другой сервер)
- `34.117.33.233/yQQZgm` → правильный редирект 302 на tracker

## Решение

### 1. Обновить A запись в DNS
В панели управления доменом (у регистратора) изменить:
- **Тип записи**: A
- **Имя**: @ (корень домена)
- **Значение**: `34.117.33.233` (вместо `34.75.255.94`)
- **TTL**: 300 (5 минут)

### 2. Проверить после обновления
```bash
# Проверка DNS
nslookup arbiconnect.store

# Проверка редиректа
curl -I "https://arbiconnect.store/yQQZgm?clickid=00023dddgv5u&partner_id=0002gv5u"
```

### 3. Ожидаемый результат
После обновления DNS короткая ссылка должна работать:
- `https://arbiconnect.store/yQQZgm` → редирект 302 на `https://example-tracker.com/click`

## Время распространения DNS
DNS изменения могут занять от 5 минут до 24 часов для полного распространения по всему миру.

## Статус SSL сертификата
SSL сертификат уже настроен для домена `arbiconnect.store` через Let's Encrypt и действителен до 2025-11-10.