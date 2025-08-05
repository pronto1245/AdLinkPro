# АРХИТЕКТУРНЫЙ РЕВЬЮ: СИСТЕМА УПРАВЛЕНИЯ ОФФЕРАМИ

**Дата проверки:** 5 августа 2025  
**Проверил:** AI-Assistant  
**Версия системы:** 1.0  

## ОЦЕНКА АРХИТЕКТУРЫ

### ✅ ПОЛОЖИТЕЛЬНЫЕ АСПЕКТЫ

1. **Корректная схема базы данных:**
   - Таблица `offers` содержит все необходимые поля
   - Правильные связи через внешние ключи (`advertiserId` → `users.id`)
   - Использование JSONB для гибких структур (landingPages, geoPricing, trafficSources)

2. **Правильное разделение ролей:**
   - Super admin: доступ ко всем офферам
   - Advertiser: только свои офферы
   - Affiliate: офферы с одобрением или публичные
   - Staff: офферы своего владельца

3. **Полный набор API endpoints:**
   - CRUD операции: GET, POST, PUT, PATCH, DELETE
   - Массовые операции: bulk-activate, bulk-pause, bulk-delete
   - Импорт/экспорт функциональность

---

## ⚠️ ОБНАРУЖЕННЫЕ ПРОБЛЕМЫ

### 1. ИСТОЧНИКИ ДАННЫХ - КРИТИЧЕСКИЕ НЕСООТВЕТСТВИЯ

#### ✅ Корректная реализация: JOIN с таблицей users

**Метод getAllOffers() правильно реализован в storage.ts:**
```typescript
async getAllOffers(): Promise<(Offer & { advertiserName?: string })[]> {
  const offersWithAdvertisers = await db
    .select({
      ...offers,
      advertiserName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, 'Unknown')`,
    })
    .from(offers)
    .leftJoin(users, eq(offers.advertiserId, users.id))
    .orderBy(offers.createdAt);
  
  return offersWithAdvertisers;
}
```

**⚠️ Потенциальная проблема:** Метод `getOffers(advertiserId?)` не использует JOIN:
```typescript
async getOffers(advertiserId?: string): Promise<Offer[]> {
  if (advertiserId) {
    return await db.select().from(offers).where(eq(offers.advertiserId, advertiserId));
  }
  return await db.select().from(offers);
}
```

**Рекомендация:** Объединить логику или использовать getAllOffers() в API маршрутах

#### ❌ Проблема: Отсутствие связанных таблиц

**Отсутствующие таблицы в схеме:**
1. `offer_categories` - для категорий офферов
2. `traffic_sources` - для источников трафика
3. `offer_apps` - для типов приложений
4. `payouts` - для гео-привязанных выплат

**Текущее решение:** Все данные хранятся в JSONB полях в основной таблице `offers`

### 2. ФИЛЬТРАЦИЯ И ПОИСК

#### ❌ Проблема: Упрощенная фильтрация

**Текущая реализация в offers.tsx:**
```typescript
const filteredOffers = offers?.filter((offer: any) => {
  const matchesSearch = offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       offer.category.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesStatus = filterStatus === 'all' || offer.status === filterStatus;
  return matchesSearch && matchesStatus;
}) || [];
```

**Проблемы:**
- Фильтрация только по статусу, без других критериев
- Отсутствие фильтров по: рекламодателю, категории, источнику трафика, типу приложения
- Поиск только по названию и категории

### 3. ДЕЙСТВИЯ НАД ОФФЕРАМИ

#### ✅ Корректная реализация действий:

1. **Просмотр (👁):** Правильно привязан к `offer.id`
2. **Редактирование (✏️):** Корректная форма редактирования  
3. **Удаление (🗑):** Использует hard delete вместо soft delete

#### ⚠️ Рекомендация по удалению:

**Текущая реализация:**
```typescript
async deleteOffer(id: string): Promise<void> {
  await db.delete(offers).where(eq(offers.id, id));
}
```

**Рекомендуемая реализация (soft delete):**
```typescript
async deleteOffer(id: string): Promise<void> {
  await db
    .update(offers)
    .set({ 
      isArchived: true,
      status: 'archived'
    })
    .where(eq(offers.id, id));
}
```

### 4. ИМПОРТ/ЭКСПОРТ

#### ✅ Корректная реализация импорта:
- Валидация структуры массива
- Обработка ошибок для каждого оффера
- Правильный маппинг полей

#### ❌ Отсутствие экспорта:
- Нет endpoint'а для экспорта офферов
- Нет функциональности в UI

---

## 📊 СООТВЕТСТВИЕ ПОЛЕЙ UI И БАЗЫ ДАННЫХ

| Поле UI | Источник в БД | Статус |
|---------|--------------|--------|
| Название оффера | `offers.name` | ✅ Корректно |
| Рекламодатель | JOIN `users.firstName + lastName` по `offers.advertiserId` | ✅ Реализован в getAllOffers() |
| Категория | `offers.category` | ✅ Корректно |
| Выплата (по GEO) | `offers.geoPricing` (JSONB) | ⚠️ Нет отдельной таблицы payouts |
| Источники трафика | `offers.trafficSources` (JSONB) | ⚠️ Нет отдельной таблицы |
| Приложения | `offers.allowedApps` (JSONB) | ⚠️ Нет отдельной таблицы |
| Статус | `offers.status` | ✅ Корректно |
| Дата создания | `offers.createdAt` | ✅ Корректно |

---

## 🔧 РЕКОМЕНДАЦИИ ПО УЛУЧШЕНИЮ

### 1. КРИТИЧНЫЕ ИСПРАВЛЕНИЯ:

1. **Использовать getAllOffers() в API маршрутах вместо getOffers()**
2. **Реализовать расширенную фильтрацию**
3. **Добавить soft delete для офферов**
4. **Создать функциональность экспорта**

### 2. ДОПОЛНИТЕЛЬНЫЕ УЛУЧШЕНИЯ:

1. **Создать отдельные таблицы:**
   - `offer_categories` для управления категориями
   - `traffic_sources` для источников трафика
   - `offer_payouts` для гео-привязанных выплат

2. **Улучшить UI фильтрацию:**
   - Добавить фильтры по рекламодателю
   - Добавить фильтры по категории
   - Добавить фильтры по источнику трафика

### 3. ПРОИЗВОДИТЕЛЬНОСТЬ:

1. **Добавить индексы:**
   - На `offers.advertiserId`
   - На `offers.status`
   - На `offers.category`

2. **Реализовать пагинацию для больших списков офферов**

---

## 📝 ВЫВОД

**Общая оценка:** 7/10

**Архитектура имеет прочную основу, но требует доработки в части:**
- JOIN-запросов для получения связанных данных
- Расширенной системы фильтрации
- Нормализации некоторых JSONB полей в отдельные таблицы

**Приоритет исправлений:**
1. 🔴 Критично: Использовать getAllOffers() в API маршрутах
2. 🟡 Важно: Расширить систему фильтрации
3. 🟢 Желательно: Создать отдельные таблицы для категорий и источников трафика