# 🔧 КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ ИНТЕГРАЦИЙ

## 🎯 ПЛАН ДЕЙСТВИЙ

### 1. ИСПРАВЛЕНИЕ apiRequest SIGNATURE
**Проблема**: apiRequest вызывается с неправильной сигнатурой в 20+ файлах

**Правильная сигнатура**:
```typescript
apiRequest(url: string, method: string = 'GET', body?: any, customHeaders?: Record<string, string>)
```

### 2. ИСПРАВЛЕНИЕ i18n ПАРАМЕТРОВ
**Проблема**: t() функция получает лишние параметры

### 3. ДОБАВЛЕНИЕ ОТСУТСТВУЮЩИХ ФУНКЦИЙ
**Проблема**: setupTokenRefresh не определена

---

## 🛠️ ИСПРАВЛЕНИЯ

### TopNavigation.tsx - setupTokenRefresh