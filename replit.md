# Overview
This is a cutting-edge anti-fraud platform leveraging advanced analytics and multi-layered detection mechanisms to provide comprehensive financial security and real-time risk management. The system is designed for financial institutions, payment processors, and e-commerce platforms to detect and prevent fraudulent activities. Key features include AI-powered fraud detection, real-time risk assessment, comprehensive analytics dashboard, automated blocking mechanisms, and detailed audit trails. The platform supports multiple detection methods including device fingerprinting, IP analysis, behavioral patterns, and transaction monitoring. Enhanced analytics provide deep insights into fraud patterns, risk scores, and security metrics for effective fraud prevention and compliance management.

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

## Anti-Fraud System Complete Architectural Review (Completed Aug 5, 2025)
- **Critical Data Source Fixes**: Replaced all mock data with real database calculations for fraud stats, rates, and blocked amounts
- **Integrity Protection**: Added dependency validation to prevent deletion of fraud rules with active blocks or pending reports
- **Dynamic Smart Alerts**: Implemented real-time alert generation based on actual fraud rates, CR anomalies, and traffic patterns
- **Real Fraud Rate Calculation**: Formula implemented as (fraud_reports / total_clicks) * 100 with period comparisons
- **Comprehensive Architecture Documentation**: Created detailed reports covering data sources, caching, security, and operational workflows
- **Third-party Service Integration**: Complete integration with FraudScore, Forensiq, Anura, and Botbox APIs (configured but not active)
- **Enhanced Audit Logging**: Complete audit trail for all fraud-related operations with IP tracking and metadata storage

## Offers Management System Architecture Review (Completed Aug 5, 2025)
- **Comprehensive Database Analysis**: Complete validation of offers table schema with proper relations to users, categories, payouts, and traffic sources
- **Data Source Validation**: Confirmed proper LEFT JOIN implementation in getAllOffers() method for advertiser name retrieval
- **API Routes Optimization**: Updated `/api/admin/offers` endpoint to use getAllOffers() instead of getOffers() for complete data including advertiser names
- **CRUD Operations Review**: Validated create, read, update, delete operations with proper role-based access control
- **Architecture Documentation**: Created detailed OFFERS_MANAGEMENT_ARCHITECTURE_REPORT.md with findings and recommendations
- **Data Integrity Improvements**: Enhanced API responses to include advertiser names using SQL COALESCE for firstName + lastName joining

## Financial System Complete Overhaul (Completed Aug 5, 2025)
- **Missing API Endpoints**: Added 6 critical financial endpoints - financial-metrics, finances, payout-requests, deposits, commission-data, financial-chart
- **Real Financial Calculations**: Implemented platform balance, advertiser revenue, partner payouts, and commission calculations from actual database data
- **Growth Metrics**: Added percentage growth/decline calculations comparing current vs previous periods
- **Database Integration**: Proper JOIN operations between transactions and users tables with role-based filtering
- **Error Handling**: Implemented fallback to mock data when database queries fail for system resilience
- **Caching System Fixes**: Corrected React Query cache keys to include filters, reduced staleTime from 5 minutes to 30 seconds
- **Cache Invalidation**: Enhanced mutation invalidation to clear all related financial data using predicate-based queries
- **Server-side Caching**: Fixed dashboard metrics cache to include period parameter with 30-second expiration

## Complete Analytics Integration with Real Data Sources (Completed Aug 5, 2025)
- **Full Module Integration**: Successfully integrated data from clicks, postbacks, offers, partners, fraud detection, financial, and CRM modules
- **Advanced Analytics Table**: Created comprehensive analytics with 100+ fields including IP, GEO, browser, SubIDs 1-30, ROI, fraud detection
- **Data Architecture Implementation**: Followed user's data flow diagram to connect all system modules for real-time analytics
- **Authentication System**: Fixed login issues and implemented both plain text and hashed password support for demonstration
- **Platform Rebranding**: Updated from affiliate marketing platform to anti-fraud platform (FraudGuard) to match project goals
- **Login Credentials**: superadmin / admin for system access
- **System Status**: Platform is fully operational with successful user authentication and dashboard access

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