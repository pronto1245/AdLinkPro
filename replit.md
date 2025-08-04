# Overview
This platform is a comprehensive affiliate marketing system designed for three user types: super admins, advertisers, and affiliates. It offers white-label capabilities, allowing advertisers to brand the interface for their partners. Key features include a multi-role dashboard with role-based access control, real-time analytics, financial management, fraud detection, and robust tracking. The system supports multiple languages (English and Russian), KYC verification, postback handling, and detailed statistics. Enhanced analytics include comprehensive metrics tracking: Уники (Unique Users), CR$ (Conversion Revenue), EPC$ (Earnings Per Click), REG (Registrations), DEP (Deposits), GEO (Geographic breakdown), Фрод-Отклонение (Fraud Rejects), and Партнер (Partners). The project aims to provide a powerful, customizable, and efficient solution for managing affiliate marketing campaigns, enhancing business vision with strong market potential for scalable growth.

# User Preferences
Preferred communication style: Simple, everyday language.

## UI/UX Design Rules (ВАЖНО - соблюдать во всех будущих изменениях):
- Все кнопки с иконками ОБЯЗАТЕЛЬНО должны иметь атрибут title с подсказкой на русском языке
- Подсказки должны кратко описывать действие кнопки (например: "Копировать URL", "Удалить оффер", "Редактировать")
- Использовать цветовое кодирование иконок для разных действий (синий - копирование, зеленый - успех, красный - удаление, фиолетовый - просмотр)
- Hover-эффекты с соответствующими цветными фонами для улучшения UX

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