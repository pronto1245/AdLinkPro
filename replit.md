# Overview
This platform is a comprehensive affiliate marketing system designed for three user types: super admins, advertisers, and affiliates. It offers white-label capabilities, allowing advertisers to brand the interface for their partners. Key features include a multi-role dashboard with role-based access control, real-time analytics, financial management, fraud detection, and robust tracking. The system supports multiple languages (English and Russian), KYC verification, postback handling, and detailed statistics. Enhanced analytics include comprehensive metrics tracking: Уники (Unique Users), CR$ (Conversion Revenue), EPC$ (Earnings Per Click), REG (Registrations), DEP (Deposits), GEO (Geographic breakdown), Фрод-Отклонение (Fraud Rejects), and Партнер (Partners). The project aims to provide a powerful, customizable, and efficient solution for managing affiliate marketing campaigns, enhancing business vision with strong market potential for scalable growth.

## Security & Monitoring (Added Aug 4, 2025)
- **Enhanced Security**: IP blacklisting, rate limiting, login attempt protection with automatic blocking
- **2FA Integration**: Complete two-factor authentication system with email delivery
- **Real-time Notifications**: Automated email notifications for registrations, security events, fraud detection
- **Audit Logging**: Comprehensive audit trail with action tracking, IP logging, and success/failure recording
- **Fraud Detection**: Pattern recognition for suspicious activities, device tracking, VPN detection
- **Device Monitoring**: New device login notifications and device fingerprinting

## Performance Optimizations (Added Aug 4, 2025)
- **Server-side**: Added compression middleware, helmet security, rate limiting, and connection pooling
- **Database**: Implemented query caching system with TTL-based invalidation and optimized connection pooling
- **Client-side**: Added debouncing for search inputs, memoization for expensive calculations, lazy loading for large data sets
- **React Components**: Created optimized analytics table with virtualization support and smart re-rendering
- **Query Management**: Enhanced React Query configuration with intelligent retry logic and extended caching

## Platform Owner Dashboard (Completed Aug 4, 2025)
- **Real-time Analytics**: Complete dashboard with 6 key KPI cards showing active partners, offers, clicks, conversions, revenue, and fraud rates
- **Interactive Charts**: Line charts for traffic/conversions, area charts for revenue, pie charts for geo distribution
- **Live Activity Feed**: Real-time platform events with priority levels and timestamps
- **Quick Actions Panel**: Direct navigation to major platform functions
- **API Integration**: Full set of dashboard endpoints with authentication and real-time data
- **Responsive Design**: Adaptive layout with gradient backgrounds and color-coded metrics

# User Preferences
Preferred communication style: Simple, everyday language.

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
- **UI/UX**: Shadcn/ui components built on Radix UI for accessibility and consistency.
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode. Color coding is extensively used for traffic sources (e.g., Facebook/Instagram - blue) and offer categories (e.g., Gambling - red).
- **State Management**: React Query for server state management and caching.
- **Routing**: Wouter for lightweight client-side routing.
- **Authentication**: Context-based with JWT tokens.
- **Internationalization**: Custom language context supporting English and Russian.
- **Design Decisions**: Focus on a clean, intuitive interface with features like logo thumbnails, geo-pricing displays, comprehensive filtering, and modal-based editing for offers. UI elements like buttons feature icon-only designs with color-coding, hover effects, and tooltips for improved user experience.

## Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **Database ORM**: Drizzle ORM for PostgreSQL.
- **Authentication**: JWT-based with bcrypt for password hashing.
- **File Storage**: Google Cloud Storage integration.
- **Core Functionality**: Features user, offer, and financial management, fraud detection, and a ticket system. Express limits are increased to 50MB for large file uploads.

## Database Design
- **User Management**: Role-based system (super_admin, advertiser, affiliate, staff) with hierarchical ownership (ownerId).
- **Offer System**: Flexible structure with categories, payout types (CPA, CPS, CRL), geo-targeting, and detailed analytics.
- **Tracking**: Comprehensive tracking link system.
- **Financial**: Transaction management with multi-currency support.
- **Security**: KYC status and fraud alerts.

## Role-Based Access Control
- **Super Admin (Owner)**: Full platform control, including user, offer, and financial management.
- **Advertiser**: Manages own offers, partners, and campaigns, with isolated access and white-label branding customization.
- **Affiliate**: Access to offers, tracking links, and statistics.

## File Upload System
- **Storage**: Google Cloud Storage.
- **Interface**: Uppy.js for enhanced file upload experience. Supports creative assets, documents, and KYC files.

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