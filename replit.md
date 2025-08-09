# Overview
This is a comprehensive affiliate marketing platform designed to empower advertisers with intelligent offer management, real-time analytics, robust partner relationship tools, streamlined financial transactions, and advanced anti-fraud protection. The platform supports multiple user roles (super-admin, advertiser, affiliate, staff) and provides full offer management capabilities, including creative asset handling. It delivers real-time statistics, financial management with integrated payouts, dynamic partner approval workflows, and multi-layered security. All data, from status changes to conversion rates and fraud alerts, updates reactively and instantly across all user interfaces, ensuring a live and responsive experience. The business vision is to provide a leading-edge, secure, and user-friendly platform that maximizes efficiency and profitability for all stakeholders in the affiliate marketing ecosystem.

# Recent Changes (Updated: 2025-08-09)
✅ **Tracking Database Infrastructure**: Created tracking_clicks table in PostgreSQL with real data structure for comprehensive analytics. Added 10 test records with clicks and conversions for demonstration.
✅ **Partner Analytics API**: Updated partner analytics endpoint to use real tracking data from database instead of mock data. Fixed column reference issues and SQL queries.
✅ **Data Display Enhancement**: Changed Overview tab to show individual clicks instead of aggregated data. All tabs now return proper clickId, country, and IP fields for complete transparency.
✅ **Click Transparency**: Each analytics tab (Overview, Geography, Devices, Sources, SubID, Details) now displays authentic tracking data with conversion tracking and revenue calculation.
✅ **Database Schema**: Simplified tracking schema to avoid foreign key conflicts and use direct SQL queries for reliable data access.
✅ **Error Resolution**: Fixed "column does not exist" errors by removing complex schema dependencies and using proven database structure.
✅ **Real Revenue Tracking**: Partner analytics correctly calculates total revenue ($68.50), conversion rate (40%), and earnings per click from actual database records.
✅ **UI Enhancement**: Added color-coded icons to all analytics tabs: Обзор (blue BarChart3), География (green Globe), Устройства (purple Monitor), Источники (orange Search), SubID (teal Target), Детали (indigo Eye).
✅ **Analytics Tab Navigation**: All 6 analytics tabs have proper visual identification with themed colors and descriptive icons for better user experience.
✅ **Advanced Pagination System**: Implemented full pagination with previous/next arrows, clickable page numbers (1,2,3,4,5), and record count display across all analytics tabs.
✅ **Authorization Fix**: Resolved token inconsistency between localStorage formats (token/auth_token) preventing statistics page access and login redirects.
✅ **White Background Design**: Applied clean white background styling to statistics page for improved visual presentation and user experience.
✅ **Complete Statistics Platform**: Partner analytics system fully functional with real-time data, comprehensive filtering, multi-tab navigation, and professional UI/UX.
✅ **Postback System Fix**: Replaced broken affiliate postback module with fully functional version adapted from advertiser module. Fixed white non-functional delete buttons by implementing working React Query mutations and proper authentication.
✅ **PostbacksNew Component**: Created new PostbacksNew.tsx component with working CRUD operations, proper API integration, and reliable delete functionality.
✅ **Token Management**: Resolved localStorage token inconsistencies and authentication issues preventing postback operations.
✅ **API Verification**: All postback API endpoints (GET, POST, PUT, DELETE) verified working with proper authentication and error handling.
✅ **End-to-End Tracking Test**: Successfully tested complete tracking flow for offer "Bonobono 888" from partner click to conversion and postback delivery to Keitaro tracker.
✅ **Database Tracking Integration**: Confirmed tracking_clicks table structure and successfully created test clicks with sub_1="final_test", sub_2="bonobono", sub_3="888" parameters.
✅ **Conversion Tracking**: Verified conversion flow by updating click status from "click" to "deposit" with revenue tracking ($35.50 test conversion recorded).
✅ **Postback Delivery Verification**: Confirmed successful postback delivery to Keitaro endpoint (HTTP 200 response in 0.21s) with proper parameter mapping.
✅ **Partner Statistics Integration**: Test tracking data properly displays in partner analytics with all sub-parameters preserved and revenue calculations accurate.
✅ **Postback Persistence Fix**: Fixed critical issue where partner postbacks were only stored in memory and disappeared on logout. Implemented proper database storage for postback profiles with user-specific isolation.
✅ **Database Postback Storage**: Partner postbacks now save to PostgreSQL `postback_profiles` table with proper authentication and ownership tracking per user ID.
✅ **Session Persistence Verification**: Confirmed postbacks persist between user sessions - logout/login cycles maintain all user-created postback configurations permanently.
✅ **User Isolation**: Each partner sees only their own postback profiles, with demo profiles shown only when user has no custom postbacks created.

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
- **UI/UX**: Shadcn/ui components on Radix UI, styled with Tailwind CSS (with CSS variables for theming and dark mode). Emphasizes a clean, intuitive interface with full-screen layouts, collapsible sidebars, and consistent font styling.
- **Theme System**: Complete dark/light theme support implemented for all roles with context-based theming.
- **State Management**: React Query for server state management and caching.
- **Routing**: Wouter for client-side routing.
- **Authentication**: Context-based with JWT tokens.
- **Internationalization**: Custom language context supporting English and Russian.
- **Feature Specifications**: Comprehensive offer management with filtering, statistics, CRUD operations, mass actions, status management, and duplication. Includes country display with flags and geo-specific payout amounts, color-coded status indicators (Active, Paused, Archive, Draft), and category system with distinct badges. Enhanced CR formatting. Compact interface with drag-n-drop reordering, CSV import/export, bulk actions, A/B testing, and template management. Advertiser profile includes tabs for account, API access, custom domain (with DNS verification), notifications, and security. Real-time WebSocket notifications.
- **Creative Management System**: Role-based creative file management supporting ZIP archive upload/download, drag-n-drop interface, file validation, and cloud storage integration. Role-specific offer details pages with access controls.
- **Tracking Links**: Ultra-short tracking link system where partners receive clean links with custom domains and 12-character `clickid` plus 8-character `partner_id`, hiding original landing URLs until approval. Partners can add sub-parameters. Links are hidden until approved access. Format: `https://domain.com/path?clickid=04b043297lz9&partner_id=04b06c87`

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
- **Postback System**: Complete external tracker integration with automatic postback delivery, macro replacement (clickid, status, revenue, SubIDs), retry logic, and monitoring. Supports Keitaro, Binom, RedTrack, Voluum, and custom tracker formats.
- **Automatic Partner Link Generation**: Smart link generation with unique parameters and role-based access control.
- **Real-time Event Tracking**: Automatic postback triggers on lp_click, lead, deposit, conversion events with full data preservation.
- **Postback Testing & Monitoring**: Built-in testing tools for validating tracker configurations and monitoring delivery success rates.

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