# 🌐 AdLinkPro Translation System Documentation

## Overview

The AdLinkPro translation system has been completely redesigned and unified to provide a robust, scalable, and developer-friendly internationalization solution. This system supports both client-side and server-side translations with comprehensive tooling.

## 🏗️ Architecture

### Client-Side (`client/src/services/i18n.ts`)
- **Unified Service**: Single point of configuration and control
- **Event-Driven**: Reactive UI updates through custom events
- **Server Sync**: Dynamic translation loading from backend
- **Type Safety**: Full TypeScript support with proper typing
- **Advanced Features**: Currency, date, and relative time formatting

### Server-Side (`server/middleware/i18n.ts` + `server/routes/i18n.ts`)
- **Middleware**: Automatic language detection and translation context
- **API Endpoints**: RESTful endpoints for dynamic translation loading
- **Health Checks**: Translation system monitoring
- **Hot Reload**: Development-time translation reloading

## 🚀 Usage Examples

### Client-Side Translation

```typescript
import { t, i18nService, changeLanguage } from '@/services/i18n';

// Basic translation
const welcomeText = t('dashboard.welcome', 'Welcome!');

// With interpolation
const greeting = t('dashboard.greeting', 'Hello {{name}}!', { name: 'John' });

// Change language with UI reactivity
await changeLanguage('en');

// Format currency
const price = i18nService.formatCurrency(1234.56, 'USD'); // $1,234.56

// Format dates
const date = i18nService.formatDate(new Date()); // 25.12.2023 (RU) or 12/25/2023 (EN)

// Relative time
const timeAgo = i18nService.formatRelativeTime(new Date(Date.now() - 3600000)); // "1 hour ago"
```

### React Component Integration

```tsx
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/ui/language-toggle';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <LanguageToggle />
    </div>
  );
}
```

### Server-Side Translation

```typescript
import express from 'express';
import { i18nMiddleware } from './middleware/i18n.js';

const app = express();

// Apply i18n middleware
app.use(i18nMiddleware);

app.get('/api/welcome', (req, res) => {
  const message = req.t('dashboard.welcome', 'Welcome!');
  res.json({ message, language: req.language });
});
```

## 🛠️ Developer Tools

### NPM Scripts

```bash
# Validate and fix missing translations
npm run i18n:validate

# Complete translations with proper values
npm run i18n:complete

# Clean up dead/backup files
npm run i18n:cleanup

# Run all i18n maintenance tasks
npm run i18n:all
```

### API Endpoints

```bash
# Get all translations for a language
GET /api/i18n/translations/en

# Get available languages
GET /api/i18n/languages

# Translate a specific key
GET /api/i18n/translate/dashboard.welcome?lang=en

# Health check
GET /api/i18n/health

# Reload translations (dev only)
POST /api/i18n/reload
```

## 📁 File Structure

```
client/src/
├── locales/
│   ├── en.json          # English translations (379 keys)
│   └── ru.json          # Russian translations (379 keys)
├── services/
│   └── i18n.ts          # Unified i18n service
└── components/ui/
    └── language-toggle.tsx  # Language switcher component

server/
├── middleware/
│   └── i18n.ts          # Server-side middleware
└── routes/
    └── i18n.ts          # API endpoints

scripts/
├── validate-translations.mjs   # Validation tool
├── complete-translations.mjs   # Completion tool
└── cleanup-i18n.mjs           # Cleanup tool
```

## 🔧 Configuration

### Default Configuration
```typescript
const defaultI18nConfig = {
  defaultLanguage: 'ru',        // Default to Russian
  supportedLanguages: ['ru', 'en'], // Supported languages
  fallbackLanguage: 'ru',       // Fallback language
  namespace: 'translation',     // Translation namespace
  storageKey: 'i18nextLng'     // LocalStorage key
};
```

### Advanced Configuration
```typescript
// Custom configuration
const customConfig = {
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ru', 'de'],
  fallbackLanguage: 'en',
  namespace: 'custom',
  storageKey: 'myapp-lang'
};

const customI18nService = I18nService.getInstance(customConfig);
```

## 🎯 Best Practices

### 1. Translation Keys
Use descriptive, hierarchical keys:
```json
{
  "dashboard": {
    "welcome": "Welcome to your dashboard",
    "stats": {
      "clicks": "Total Clicks",
      "conversions": "Conversions"
    }
  }
}
```

### 2. Fallback Values
Always provide fallback values:
```typescript
const text = t('some.key', 'Default text if key is missing');
```

### 3. Event Handling
Listen for language changes in components:
```typescript
useEffect(() => {
  const handleLanguageChange = (event: CustomEvent) => {
    console.log('Language changed to:', event.detail.language);
    // Handle UI updates
  };

  window.addEventListener('languageChanged', handleLanguageChange);
  return () => window.removeEventListener('languageChanged', handleLanguageChange);
}, []);
```

### 4. Server-Side Detection
The middleware automatically detects language from:
1. Query parameter: `?lang=en`
2. Accept-Language header
3. Falls back to Russian

## 🐛 Troubleshooting

### Common Issues

**1. Translations not updating in UI**
- Ensure components are using `useTranslation` hook
- Check if `LanguageToggle` component is triggering events
- Verify translation files are loaded correctly

**2. Missing translations showing as keys**
- Run `npm run i18n:validate` to check for missing keys
- Use `npm run i18n:complete` to add missing translations

**3. Server-side translations not working**
- Ensure i18n middleware is applied before routes
- Check translation files are accessible by server
- Verify API endpoints are properly mounted

### Debug Mode
Enable debug logging in development:
```typescript
// In client-side service
process.env.NODE_ENV === 'development' // Enables debug logs

// Check browser console for i18n debug messages
```

## 🔄 Migration Guide

### From Old System
If migrating from the old dual-system setup:

1. Remove old `lib/i18n.ts` import from `main.tsx` ✅ Done
2. Update components to use new service ✅ Done  
3. Run validation tools ✅ Done
4. Test language switching ✅ Done

### Adding New Languages

1. Create translation file: `client/src/locales/de.json`
2. Add to configuration: `supportedLanguages: ['ru', 'en', 'de']`
3. Update language switcher component
4. Run validation: `npm run i18n:validate`

## 🌟 Features Summary

- ✅ **Zero Translation Gaps**: 379 complete translations in both languages
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Event-Driven Updates**: Reactive UI without page reload
- ✅ **Server-Side Support**: Complete backend integration
- ✅ **Advanced Formatting**: Currency, dates, relative time
- ✅ **Developer Tools**: Comprehensive validation and maintenance scripts
- ✅ **Fallback System**: Graceful degradation when translations fail
- ✅ **Performance Optimized**: Efficient nested lookups and caching
- ✅ **Hot Reload**: Development-time translation updates
- ✅ **Clean Architecture**: Unified, maintainable codebase

The translation system is now production-ready and provides a solid foundation for AdLinkPro's internationalization needs.