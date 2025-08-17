СКОПИРУЙТЕ ЭТОТ ТЕКСТ И СОХРАНИТЕ КАК README.md

# Affiliate Marketing Platform - Netlify Deploy

Готовая к деплою статическая версия платформы партнерского маркетинга.

## 🚀 Быстрый деплой на Netlify

1. Скачайте все файлы из этой папки
2. Перейдите на [netlify.com](https://netlify.com)
3. Перетащите папку с файлами на интерфейс Netlify
4. Ваш сайт будет автоматически развернут!

## 📁 Структура файлов

```
├── index.html          # Главная страница
├── styles.css          # Основные стили
├── script.js           # JavaScript функциональность  
├── netlify.toml        # Конфигурация Netlify
├── _headers            # HTTP заголовки безопасности
├── _redirects          # Правила перенаправления
└── README.md           # Эта инструкция
```

## ⚡ Возможности

- **Responsive дизайн** - адаптивная верстка для всех устройств
- **Темная/светлая тема** - переключение по кнопке в навигации
- **Анимации** - плавные переходы и эффекты
- **PWA-ready** - готовность к работе как приложение
- **SEO-оптимизированный** - метатеги и структура
- **Безопасность** - CSP заголовки и защита

## 🔧 Техническая информация

### Frontend Stack:
- Чистый HTML5, CSS3, JavaScript ES6+
- CSS переменные для темизации
- Intersection Observer API для анимаций
- Local Storage для сохранения настроек

### Object Storage Integration:
- **Bucket ID**: `replit-objstore-6b899733-6fa6-40a7-a433-b8bbe153777d`
- **Публичные файлы**: `/public/` директория
- **Приватные файлы**: `/.private/` директория

### Оригинальная платформа:
- React 18 + TypeScript
- Node.js + Express backend
- PostgreSQL + Drizzle ORM
- JWT авторизация + WebSocket
- Google Cloud Storage

## 🌐 После деплоя

После успешного деплоя ваш сайт будет доступен по URL вида:
`https://your-site-name.netlify.app`

### Настройка кастомного домена:
1. В панели Netlify перейдите в Domain Settings
2. Добавьте ваш домен
3. Настройте DNS записи согласно инструкциям

## 🔗 Полезные ссылки

- [Netlify Documentation](https://docs.netlify.com/)
- [Object Storage Guide](https://docs.replit.com/storage/object-storage)
- [Original Platform](https://e2b04e37-b05b-4d57-9368-9f629e0035bd-00-2yo71uvl8ejp3.worf.replit.dev)

## 📞 Поддержка

Если возникнут вопросы по деплою или настройке, обратитесь к документации Netlify или в поддержку.

---

✅ **Статус**: Готово к production деплою  
🗄️ **База данных**: PostgreSQL (Neon)  
📁 **Хранилище**: Google Cloud Storage  
🔐 **Авторизация**: JWT + bcryptjs  
🚀 **Деплой**: Netlify, Railway, Vercel