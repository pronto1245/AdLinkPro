# Overview
This anti-fraud platform provides comprehensive financial security and real-time risk management for financial institutions, payment processors, and e-commerce. Key capabilities include AI-powered fraud detection, real-time risk assessment, analytics dashboards, automated blocking, and detailed audit trails. It supports device fingerprinting, IP analysis, behavioral patterns, and transaction monitoring to offer deep insights into fraud patterns, risk scores, and security metrics for effective prevention and compliance. The platform, rebranded as FraudGuard, is fully operational with robust security features, performance optimizations, and comprehensive integration across all modules.

# User Preferences
Preferred communication style: Simple, everyday language.

## Development Guidelines (КРИТИЧНО - всегда применять):
При выполнении вёрстки страницы обязательно сразу предусматривать и привязывать всю функциональную логику:
- Какие данные страница должна получать (откуда — API, endpoint, query params)
- Какие действия пользователь может выполнять (нажатия, фильтры, изменения, кнопки)
- Что должно обновляться / перерисовываться динамически
- Какие функции, хендлеры и вызовы должны быть уже подключены или зарезервированы под будущую логику
- Какие стороны завязаны на эту страницу (например, статистика, роли, офферы, финансы)
- НЕ делать "голую" вёрстку — страница должна быть сразу связана с реальными данными и действиями, даже если используются мок-данные временно

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
- **UI/UX**: Shadcn/ui components on Radix UI, styled with Tailwind CSS (with CSS variables for theming and dark mode). Features extensive color coding for traffic sources and offer categories. UI elements include icon-only designs with color-coding, hover effects, and tooltips.
- **State Management**: React Query for server state management and caching.
- **Routing**: Wouter for client-side routing.
- **Authentication**: Context-based with JWT tokens.
- **Internationalization**: Custom language context supporting English and Russian.
- **Design Decisions**: Clean, intuitive interface with features like logo thumbnails, geo-pricing, comprehensive filtering, and modal-based editing. Optimized analytics tables with virtualization and smart re-rendering.

## Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **Database ORM**: Drizzle ORM for PostgreSQL.
- **Authentication**: JWT-based with bcrypt for password hashing.
- **File Storage**: Google Cloud Storage integration.
- **Core Functionality**: User, offer, and financial management, fraud detection, and a ticket system. Server-side performance optimizations include compression middleware, helmet security, and rate limiting.

## Database Design
- **User Management**: Role-based system (super_admin, advertiser, affiliate, staff) with hierarchical ownership.
- **Offer System**: Flexible structure with categories, payout types, geo-targeting, and detailed analytics.
- **Tracking**: Comprehensive tracking link system.
- **Financial**: Transaction management with multi-currency support. Real financial calculations based on actual database data, with proper caching and invalidation strategies.
- **Security**: KYC status and fraud alerts.
- **Integrity**: Dependency validation to prevent deletion of fraud rules with active blocks.

## Role-Based Access Control
- **Super Admin (Owner)**: Full platform control.
- **Advertiser**: Manages own offers, partners, and campaigns with isolated access and white-label branding.
- **Affiliate**: Access to offers, tracking links, and statistics. Data isolation verified across roles.

## File Upload System
- **Storage**: Google Cloud Storage.
- **Interface**: Uppy.js for enhanced file upload.

## Anti-Fraud System
- AI-powered detection, real-time risk assessment, dynamic smart alerts, real fraud rate calculation based on (fraud_reports / total_clicks) * 100.
- Enhanced security features like IP blacklisting, rate limiting, login attempt protection, 2FA, and real-time notifications.
- Comprehensive audit logging for all fraud-related operations.
- Device monitoring with fingerprinting and new device login notifications.

## System-wide Features
- **Performance**: Server-side compression, helmet security, rate limiting, connection pooling, query caching, client-side debouncing, memoization, lazy loading.
- **Analytics**: Full integration of data from clicks, postbacks, offers, partners, fraud detection, financial, and CRM modules into comprehensive tables with 100+ fields.
- **API Integrity**: All 44 database tables and major API endpoints functional with proper HTTP responses and CRUD operations.
- **Postback System**: Persistent storage of postback templates in PostgreSQL, with full API functionality.
- **Automatic Partner Link Generation**: Smart link generation with unique parameters and role-based access control.

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

## Authentication & Security
- **JWT**: JSON Web Tokens for authentication.
- **bcrypt**: Password hashing.

## Runtime Dependencies
- **Express.js**: Web application framework for Node.js.
- **ws**: WebSocket library for real-time communication.
- **Zod**: TypeScript-first schema validation library.

## Third-party Fraud Services (Configured, not active)
- **FraudScore**
- **Forensiq**
- **Anura**
- **Botbox**