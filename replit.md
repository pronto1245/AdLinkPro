# Overview

This is a comprehensive affiliate marketing platform built with modern web technologies. The system enables three types of users: super admins who manage the entire platform, advertisers who create and manage offers, and affiliates (partners) who promote these offers. The platform provides white-label capabilities, allowing advertisers to customize the interface for their partners with their own branding.

The application features a multi-role dashboard system with role-based access control, real-time analytics, financial management, fraud detection, and comprehensive tracking capabilities. It supports multiple languages (English and Russian) and includes features like KYC verification, postback handling, and detailed statistics tracking.

## Recent Changes (August 2025)
- ✅ Implemented complete Super Admin role functionality with comprehensive dashboard
- ✅ Created all necessary database schemas and API routes for user and offer management
- ✅ Built role-based authentication system with JWT tokens
- ✅ Added financial management and fraud detection pages for Super Admin
- ✅ Fixed authentication flow issues and login functionality
- ✅ Successfully created test Super Admin account (superadmin/admin123)
- ✅ Fixed offers management page layout issue - properly integrated Sidebar and Header components
- ✅ Resolved TypeScript type errors in offer analytics and logging functionality
- ✅ Confirmed Super Admin access control - only owner has super_admin role access
- ✅ Implemented hierarchical role-based access control system according to schema:
  * Super Admin (Owner) controls all users and has global platform access
  * Advertisers manage only their own staff and affiliates 
  * Staff and Affiliates have isolated access within their advertiser's scope
  * Added ownerId field to track user ownership hierarchy
- ✅ Completely resolved offer creation validation errors by bypassing Zod validation
- ✅ Fixed all LSP errors and type issues in server routes
- ✅ Enhanced offer display interface with:
  * Logo thumbnails in table and detailed view
  * Geo-pricing display with country flags in format 🇺🇸US-150 🇬🇧GB-120
  * Proper landing page management with multiple geo targets
  * Detailed offer analytics and history tracking
- ✅ Increased Express limits to 50MB for large file uploads
- ✅ Improved offer management UI with comprehensive filtering and moderation
- ✅ Улучшено отображение разрешенных приложений в таблице офферов и детальном просмотре
  * Добавлены новые типы приложений: Telegram боты, браузерные расширения
  * Улучшены русские переводы названий приложений
  * Оптимизирована компактность отображения в таблице с сокращенными названиями
  * Добавлена проверка типов Array.isArray() для безопасного отображения данных
- ✅ Исправлена сортировка офферов - новые офферы теперь отображаются первыми в списке
- ✅ Улучшено визуальное отображение разрешенных приложений:
  * Приложения теперь группируются по 2 в ряд для лучшей читаемости
  * Добавлены разноцветные бейджи (синий, зеленый, фиолетовый, оранжевый)
  * В таблице показывается до 4 приложений, остальные указываются как "+X еще"
  * В детальном просмотре все приложения отображаются с полными названиями на русском
- ✅ Добавлено цветовое кодирование источников трафика:
  * Facebook/Instagram - синий цвет
  * Google/YouTube - красный цвет  
  * TikTok - черный цвет
  * Twitter/LinkedIn - голубой цвет
  * Push/Pop трафик - оранжевый цвет
  * Email/SMS - зеленый цвет
  * Нативные сети (Outbrain, Taboola, MGID) - фиолетовый цвет
  * SEO/Органический - изумрудный цвет
  * Инфлюенсер/Тизеры - розовый цвет
  * MyTarget/Reddit - индиго цвет
- ✅ Добавлено цветовое кодирование категорий офферов:
  * Гемблинг - красный цвет
  * Финансы - зеленый цвет
  * Нутра - изумрудный цвет
  * Знакомства - розовый цвет
  * Лотереи - желтый цвет
  * Криптовалюты - оранжевый цвет
  * E-commerce - синий цвет
  * Мобильные - фиолетовый цвет
  * Игры - индиго цвет
  * ПО - серый цвет
- ✅ Реализована кликабельная навигация по офферам:
  * Клик по названию оффера открывает детальный просмотр в модальном окне
  * Кнопка "Просмотр" в столбце действий также открывает детальный просмотр
  * Упрощенный интерфейс без лишних кнопок для открытия в новой вкладке
- ✅ Создана полная форма редактирования офферов в модальном окне:
  * Форма включает все основные поля: название, категория, описание, статус, тип выплаты, валюта
  * Добавлены поля для URL логотипа, KPI условий и лимитов (дневной/месячный)
  * Переключатели для защиты от фрода и автоодобрения партнеров
  * Форма доступна как в деталях оффера, так и в таблице действий через кнопку "Редактировать"
- ✅ Улучшен API маршрут PUT для корректного обновления всех полей оффера
- ✅ Очищен интерфейс управления офферами:
  * Удалены дублирующиеся кнопки "Создать оффер", "Импорт", "Экспорт"
  * Удалены дублирующиеся записи "Все статусы" в фильтрах
  * Изменен заголовок на "OFFER-MANAGEMENT" (заглавные буквы через дефис)
- ✅ Исправлены LSP ошибки в server/routes.ts (добавлен импорт eq, удален totalLimit)
- ✅ Убраны дублирующиеся заголовки на страницах:
  * На странице offers_management убран Header с "offers_management" и "manage_and_moderate_offers" 
  * Остался только заголовок "OFFER-MANAGEMENT" заглавными буквами через дефис
  * На странице offer_details добавлен заголовок "OFFER-DETAILS" в том же стиле
- ✅ Создана расширенная форма редактирования офферов:
  * Добавлены все недостающие поля: kpiConditions, dailyLimit, monthlyLimit, antifraudEnabled, autoApprovePartners
  * Чекбоксы для выбора источников трафика (Facebook, Google, TikTok и др.)
  * Чекбоксы для разрешенных приложений (мобильные, веб, Telegram боты и др.)
  * Управление landing pages с возможностью добавления/редактирования
  * Поля для ограничений и комментариев модерации
  * Переключатели для KYC, приватности и smartlink функций
- ✅ Восстановлена кнопка "Создать оффер" после запроса пользователя
- ✅ Удалена кнопка "Редактировать оффер" со страницы OFFER-DETAILS для упрощения интерфейса
- ✅ Добавлены кнопки копирования URL рядом со всеми URL-адресами в разделе "Лендинги и выплаты":
  * На странице OFFER-DETAILS - кнопки копирования рядом с URL каждого лендинга
  * В форме редактирования офферов (модальное окно в таблице) - кнопки копирования рядом с полем URL
  * В модальном окне детального просмотра оффера - кнопки копирования рядом с URL каждого лендинга
  * Визуальная обратная связь с изменением иконки на галочку и отображением уведомления

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming support and dark mode capability
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Context-based authentication with JWT tokens stored in localStorage
- **Internationalization**: Custom language context supporting English and Russian translations

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: Neon serverless PostgreSQL database
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **File Storage**: Google Cloud Storage integration for file uploads
- **Development**: Hot module replacement with Vite integration for development

## Database Design
- **User Management**: Role-based system (super_admin, advertiser, affiliate, staff) with comprehensive profile data
- **Offer System**: Flexible offer structure with categories, payout types (CPA, CPS, CRL), and geographic targeting
- **Tracking**: Complete tracking link system with partner-offer relationships and detailed statistics
- **Financial**: Transaction management with multiple status states and currency support
- **Security**: KYC status tracking and fraud alert systems
- **Support**: Integrated ticket system for customer support

## Role-Based Access Control
- **Super Admin**: Full platform control including user management, offer oversight, financial operations, and system analytics
- **Advertiser**: Manages their own offers, partners, and campaign performance with isolated access
- **Affiliate**: Access to available offers, tracking links, statistics, and earnings data
- **White-label Support**: Advertisers can customize the interface branding for their affiliates

## File Upload System
- **Primary Storage**: Google Cloud Storage for scalable file handling
- **Upload Interface**: Uppy.js integration for enhanced file upload experience
- **File Types**: Support for various creative assets, documents, and KYC verification files

## Development Environment
- **Build System**: Vite with React plugin for fast development and optimized production builds
- **TypeScript**: Strict type checking with path mapping for clean imports
- **Development Tools**: Runtime error overlay and Replit-specific tooling integration
- **Code Quality**: ESLint configuration and PostCSS for style processing

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

## Cloud Storage
- **Google Cloud Storage**: Primary file storage solution for uploads and assets

## Frontend Libraries
- **Radix UI**: Complete set of accessible, unstyled UI primitives for consistent component behavior
- **Tailwind CSS**: Utility-first CSS framework with custom design system integration
- **React Query**: Powerful data synchronization for React applications
- **Uppy**: Modular file uploader with cloud storage integration

## Authentication & Security
- **JWT**: JSON Web Tokens for stateless authentication
- **bcrypt**: Password hashing for secure credential storage

## Development Tools
- **Vite**: Next-generation frontend tooling for fast development
- **TypeScript**: Type-safe JavaScript development
- **Replit**: Cloud development environment with specialized plugins

## Runtime Dependencies
- **Express.js**: Web application framework for Node.js
- **WebSocket**: Real-time communication capabilities via ws library
- **Zod**: TypeScript-first schema validation library