# Overview
This is an affiliate marketing platform designed to provide advertisers with intelligent offer management, real-time analytics, robust partner relationship tools, streamlined financial transactions, and advanced anti-fraud protection. It supports multiple user roles (super-admin, advertiser, affiliate, staff) and offers full offer management, including creative asset handling. The platform delivers real-time statistics, financial management with integrated payouts, dynamic partner approval workflows, and multi-layered security. All data updates reactively and instantly across user interfaces, ensuring a live and responsive experience. The business vision is to deliver a leading-edge, secure, and user-friendly platform that maximizes efficiency and profitability for all stakeholders in the affiliate marketing ecosystem.

# User Preferences
Preferred communication style: Simple, everyday language.

## Development Guidelines (КРИТИЧНО - всегда применять):
**РЕАКТИВНОСТЬ И ЖИВЫЕ ДАННЫЕ:**
- Все таблицы (офферы, статистика, финансы, креативы) ДОЛЖНЫ подтягивать данные с сервера
- Формы (регистрация, постбек, добавление реквизитов) ДОЛЖНЫ отправлять данные в API и получать реальные ответы
- Где API ещё нет — используй мок-серверы, но сразу оставляй структуру под продовые эндпоинты
- Логика ДОЛЖНА быть реактивной и живой — меняется статус оффера, падает CR — это видно в панели

**ФУНКЦИОНАЛЬНАЯ ПРИВЯЗКА:**
- Какие данные страница должна получать (откуда — API, endpoint, query params)
- Какие действия пользователь может выполнять (нажатия, фильтры, изменения, кнопки)
- Что должно обновляться / перерисовываться динамически
- Какие функции, хендлеры и вызовы должны быть уже подключены или зарезервированы под будущую логику
- Какие стороны завязаны на эту страницу (например, статистика, роли, офферы, финансы)
- НЕ делать "голую" вёрстку — страница должна быть сразу связана с реальными данными и действиями

## UI/UX Design Rules (ВАЖНО - соблюдать во всех будущих изменениях):
- Все кнопки с иконками ОБЯЗАТЕЛЬНО должны иметь атрибут title с подсказкой на русском языке
- Подсказки должны кратко описывать действие кнопки (например: "Копировать URL", "Удалить оффер", "Редактировать")
- Использовать цветовое кодирование иконок для разных действий (синий - копирование, зеленый - успех, красный - удаление, фиолетовый - просмотр)
- Hover-эффекты с соответствующими цветными фонами для улучшения UX
- Цветовое кодирование для ролей и статусов:
  - Роли: Супер-админ (фиолетовый), Рекламодатель (синий), Партнёр (зеленый), Сотрудник (оранжевый)
  - Рекламодатели: Привязан (индиго), Не привязан (серый)
  - Права доступа: Статистика (зеленый), Офферы (фиолетовый), Пользователи (синий), Финансы (желтый), API (красный)

# System Architecture

## Frontend
- **Framework**: React 18 with TypeScript and Vite.
- **UI/UX**: Shadcn/ui components on Radix UI, styled with Tailwind CSS (with CSS variables for theming and dark mode). Emphasizes a clean, intuitive interface with full-screen layouts, collapsible sidebars, and consistent font styling. Supports dark/light themes.
- **State Management**: React Query for server state management and caching.
- **Routing**: Wouter for client-side routing.
- **Authentication**: Context-based with JWT tokens.
- **Internationalization**: Custom language context supporting English and Russian.
- **Feature Specifications**: Comprehensive offer management with filtering, statistics, CRUD operations, mass actions, status management, and duplication. Includes country display with flags, geo-specific payout amounts, color-coded status indicators, and a category system. Supports drag-n-drop reordering, CSV import/export, bulk actions, A/B testing, and template management. Advertiser profiles include account, API access, custom domain, notifications, and security tabs. Real-time WebSocket notifications.
- **Creative Management System**: Role-based creative file management with ZIP archive upload/download, drag-n-drop interface, file validation, and cloud storage integration.
- **Tracking Links**: Ultra-short tracking link system with custom domains, 12-character `clickid` and 8-character `partner_id`. Supports partner sub-parameters. Links are hidden until approved access.

## Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **Database ORM**: Drizzle ORM for PostgreSQL.
- **Authentication**: JWT-based with bcrypt for password hashing.
- **File Storage**: Google Cloud Storage integration.
- **Core Functionality**: User, offer, and financial management, fraud detection, and a ticket system. Includes server-side performance optimizations like compression, helmet security, and rate limiting.

## Database Design
- **User Management**: Role-based system (super_admin, advertiser, affiliate, staff) with hierarchical ownership.
- **Offer System**: Flexible structure including categories, payout types, geo-targeting, antifraud methods, allowed applications, partner approval types, and detailed analytics.
- **Tracking**: Comprehensive tracking link system.
- **Financial**: Transaction management with multi-currency support and real financial calculations.
- **Security**: KYC status and fraud alerts with dependency validation for fraud rules.

## Role-Based Access Control
- **Super Admin (Owner)**: Full platform control.
- **Advertiser**: Manages own offers, partners, and campaigns with isolated access and white-label branding.
- **Affiliate**: Access to offers, tracking links, and statistics. Data isolation verified across roles.

## Anti-Fraud System
- AI-powered detection, real-time risk assessment, dynamic smart alerts, and real fraud rate calculation.
- Enhanced security features include IP blacklisting, rate limiting, login attempt protection, 2FA, real-time notifications, device monitoring with fingerprinting, and new device login notifications.
- Comprehensive audit logging.

## System-wide Features
- **Performance**: Server-side compression, helmet security, rate limiting, connection pooling, query caching, client-side debouncing, memoization, lazy loading.
- **Analytics**: Full integration of data from clicks, postbacks, offers, partners, fraud detection, financial, and CRM modules into comprehensive tables.
- **API Integrity**: All database tables and major API endpoints functional with proper HTTP responses and CRUD operations.
- **Postback System**: Complete external tracker integration with automatic postback delivery, macro replacement, retry logic, and monitoring. Supports Keitaro, Binom, RedTrack, Voluum, and custom tracker formats. Keitaro integration tested with subid and external_id parameters.
- **Automatic Partner Link Generation**: Smart link generation with unique parameters and role-based access control.
- **Real-time Event Tracking**: Automatic postback triggers on lp_click, lead, deposit, conversion events with full data preservation.
- **Postback Testing & Monitoring**: Built-in testing tools for validating tracker configurations and monitoring delivery success rates.
- **Keitaro Integration Status (2025-08-09)**: Postbacks successfully delivered to Keitaro with HTTP 200 responses. Correct format implemented: `?subid=REPLACE&status=REPLACE&payout=REPLACE` with proper parameter replacement. Both UUID and short click ID formats (like `3tuglu44rt`, `ktr8x9m2qw`) fully supported. System automatically replaces REPLACE placeholders with actual values: subid=clickId, status=1 for approved conversions, payout=revenue amount. Integration confirmed working with Keitaro receiving postbacks correctly.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database.
- **Drizzle Kit**: Database migration and schema management.

## Cloud Storage
- **Google Cloud Storage**: Primary solution for file storage.

## Frontend Libraries
- **Radix UI**: Accessible, unstyled UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **React Query**: Data synchronization for React.
- **Uppy**: Modular file uploader.
- **@dnd-kit**: For drag-n-drop functionality.

## Authentication & Security
- **JWT**: JSON Web Tokens for authentication.
- **bcrypt**: Password hashing.

## Runtime Dependencies
- **Express.js**: Web application framework for Node.js.
- **ws**: WebSocket library for real-time communication.
- **Zod**: TypeScript-first schema validation library.