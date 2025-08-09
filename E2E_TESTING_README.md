# E2E Testing Suite

Комплексные end-to-end тесты для проверки всех компонентов системы affiliate платформы.

## Доступные тесты

### 1. `test-e2e-full-cycle.sh` - Полный цикл конверсий
```bash
./test-e2e-full-cycle.sh
```

**Что тестирует:**
- Создание события регистрации (initiated)
- Апрув регистрации через webhook
- Создание события покупки (initiated) 
- Апрув покупки через PSP webhook
- Прогрессия статусов: initiated → approved
- Постбек доставка на всех этапах

### 2. `test-antifraud-e2e.sh` - Антифрод система
```bash
./test-antifraud-e2e.sh
```

**Что тестирует:**
- Clean трафик (ok) - проходит везде
- Soft антифрод + approved - backup блокирует
- Soft антифрод + pending - проходит везде  
- Hard антифрод - блокирует все профили
- Статистика блокировок

### 3. `test-postback-delivery.sh` - Доставка постбеков
```bash
./test-postback-delivery.sh
```

**Что тестирует:**
- Keitaro формат: `?subid={clickId}&status={status}&payout={payout}`
- Binom формат: `?subid={clickId}&status=conversion&payout={payout}`
- Последовательные события (reg → purchase)
- Высокие суммы транзакций
- Webhook endpoints

### 4. `test-database-verification.sh` - Верификация БД
```bash
./test-database-verification.sh
```

**Что тестирует:**
- Консистентность данных в conversions
- Логи в postback_deliveries
- Обработка дубликатов tx_id
- Edge cases (невалидные данные)
- Foreign key relationships

### 5. `run-all-e2e-tests.sh` - Полный набор тестов
```bash
./run-all-e2e-tests.sh
```

**Запускает все тесты последовательно с итоговым отчетом.**

## Структура тестов

### Формат событий

**Регистрация:**
```json
{
  "type": "reg",
  "clickid": "C-1234567890",
  "txid": "R-1001"
}
```

**Покупка:**
```json
{
  "type": "purchase",
  "clickid": "C-1234567890", 
  "txid": "O-5001",
  "value": 49.90,
  "currency": "USD"
}
```

### Webhook апрувы

**Affiliate webhook:**
```json
{
  "type": "reg",
  "txid": "R-1001",
  "status": "approved",
  "payout": 5.00,
  "currency": "USD"
}
```

**PSP webhook:**
```json
{
  "type": "purchase",
  "txid": "O-5001", 
  "status": "approved",
  "amount": 49.90,
  "currency": "USD"
}
```

## Ожидаемое поведение

### Статусы конверсий
Статусы двигаются только "вверх":
- `initiated` → `pending` → `approved`
- `initiated` → `declined`

### Постбек доставка

**Когда срабатывает:**
- Purchase initiated → отправляется postback
- Purchase approved → отправляется postback
- Registration обычно не триггерит postback до approved

**Формат для Keitaro:**
```
GET /click.php?subid={clickId}&status=lead&payout={revenue}
GET /click.php?subid={clickId}&status=sale&payout={revenue}
```

### Антифрод блокировки

**Hard level:**
- Блокирует ВСЕ профили
- Логирует как `hard_af_blocked`

**Soft level:**
- Main профиль: пропускает
- Backup профиль с `softOnlyPending=true`: блокирует non-pending
- Логирует как `soft_af_non_pending_blocked`

## Мониторинг результатов

### API endpoints для проверки
```bash
# Статистика очередей
curl http://localhost:5000/api/queue/stats

# Создание события
curl -X POST http://localhost:5000/api/v3/event \
  -H "Content-Type: application/json" \
  -d '{"type":"purchase","clickid":"test","txid":"tx123","value":100}'

# Тест постбека
curl -X POST http://localhost:5000/api/v3/postback/test \
  -H "Content-Type: application/json" \
  -d '{"conversionId":"conv123","antifraudLevel":"soft"}'
```

### Логи в БД

**Таблица conversions:**
```sql
SELECT id, status, type, click_id, tx_id, revenue, currency, created_at, updated_at 
FROM conversions 
WHERE tx_id = 'your-tx-id';
```

**Таблица postback_deliveries:**
```sql
SELECT profile_name, success, error, http_status, attempt_count, created_at
FROM postback_deliveries 
WHERE conversion_id = 'your-conv-id'
ORDER BY created_at;
```

## Troubleshooting

### Частые проблемы

1. **Redis connection failed**
   - BullMQ не работает, но автономная обработка включена
   - Постбеки обрабатываются синхронно

2. **Postback delivery failed**
   - Проверьте URL трекеров в конфигурации
   - Убедитесь что endpoints доступны

3. **Status not updating**
   - Проверьте webhook endpoints
   - Убедитесь что tx_id совпадает

4. **Antifraud not blocking**
   - Проверьте antifraudLevel в запросе
   - Убедитесь что профили настроены правильно

### Отладка

**Включить детальные логи:**
```bash
export LOG_LEVEL=debug
npm run dev
```

**Проверить БД прямо:**
```bash
psql $DATABASE_URL -c "SELECT * FROM conversions ORDER BY created_at DESC LIMIT 10;"
```

## Интеграция в CI/CD

Добавьте в ваш pipeline:
```yaml
test:
  script:
    - npm run dev &
    - sleep 10
    - ./run-all-e2e-tests.sh
    - kill %1
```

## Метрики успеха

**Отличный результат:**
- Success rate > 90%
- Все антифрод тесты проходят
- Статусы обновляются корректно
- Нет ошибок в логах

**Приемлемый результат:**
- Success rate > 70%
- Основные сценарии работают
- Минимальные ошибки

**Требует внимания:**
- Success rate < 70%
- Критические ошибки
- Антифрод не работает