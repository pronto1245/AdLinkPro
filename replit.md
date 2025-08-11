# Overview
This platform is an affiliate marketing solution designed to optimize offer management, provide real-time analytics, and streamline financial operations for advertisers and affiliates. It supports multiple user roles (super-admin, advertiser, affiliate, staff) with distinct functionalities, including comprehensive offer and creative asset management. The system ensures real-time data updates across all interfaces, offering a responsive and secure experience. Its vision is to be a leading-edge, secure, and user-friendly platform that enhances efficiency and profitability within the affiliate marketing ecosystem.

# User Preferences
- **Language**: Russian language preferred ("отвечай на русском пожалуйста")
- **Communication Style**: Simple, everyday language avoiding technical jargon
- **Problem Resolution**: Complete comprehensive code review and error fixing rather than individual issue reporting (August 11, 2025)
- **SSL Configuration**: Real SSL certificates only, no demo/simulation modes (August 11, 2025)
- **Telegram Integration**: Real bot @integracia7980_bot fully integrated and working (August 11, 2025)
- **Data Integrity**: COMPLETED - All demo data, test records, API tokens, and mock logic fully removed (August 11, 2025)
- **Dashboard Requirements**: COMPLETED - All dashboards use real PostgreSQL data with live API endpoints (August 11, 2025)
- **Error Handling**: COMPLETED - All critical system errors resolved including authentication, notifications, translations, and API endpoints (August 11, 2025)
- **Deployment Configuration**: COMPLETED - Completely rewrote environment validation logic to eliminate all process.exit calls and make all environment variables optional with safe defaults (August 11, 2025)
- **JWT_SECRET Validation**: COMPLETED - Removed all hardcoded JWT_SECRET validation, deleted conflicting server/utils/env.ts, unified all imports to use server/config/environment.ts with safe defaults (August 11, 2025)
- **Deployment Crash Loop**: COMPLETED - Fixed all required environment variables causing deployment failures, implemented production-safe defaults for JWT_SECRET and SESSION_SECRET, eliminated all process.exit calls from configuration validation (August 11, 2025)
- **GitHub Deployment**: COMPLETED - Created deployment configurations for Railway, Vercel, Netlify with GitHub Actions CI/CD workflow (August 11, 2025)

# System Architecture

## Frontend
- **Framework**: React 18 with TypeScript and Vite.
- **UI/UX**: Shadcn/ui components on Radix UI, styled with Tailwind CSS (with CSS variables for theming and dark mode). Features full-screen layouts, collapsible sidebars, consistent font styling, and dark/light theme support.
- **State Management**: React Query for server state management and caching.
- **Routing**: Wouter for client-side routing.
- **Authentication**: Context-based with JWT tokens.
- **Internationalization**: Custom language context supporting English and Russian.
- **Feature Specifications**: Comprehensive offer management (filtering, statistics, CRUD, mass actions, duplication, geo-specific payouts, category system, CSV import/export, bulk actions, A/B testing, template management). Advertiser profiles with account, API access, custom domain, notifications, and security tabs. Real-time WebSocket notifications. Role-based creative file management with ZIP upload/download, drag-n-drop, and file validation. Ultra-short tracking link system with custom domains and sub-parameters. Automatic custom domain links for new offers. React-based event sending system with antifraud level configuration and real-time conversion creation.

## Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **Database ORM**: Drizzle ORM for PostgreSQL.
- **Authentication**: JWT-based with bcrypt for password hashing.
- **File Storage**: Google Cloud Storage integration.
- **Core Functionality**: User, offer, and financial management, fraud detection, and a ticket system. Includes server-side performance optimizations like compression, helmet security, and rate limiting.

## Database Design
- **User Management**: Role-based system (super_admin, advertiser, affiliate, staff) with hierarchical ownership.
- **Offer System**: Flexible structure supporting categories, payout types, geo-targeting, antifraud methods, allowed applications, partner approval types, and detailed analytics.
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
- Full antifraud policy system integrated into postback queue processing.

## System-wide Features
- **Performance**: Server-side compression, helmet security, rate limiting, connection pooling, query caching, client-side debouncing, memoization, lazy loading.
- **Analytics**: Full integration of data from clicks, postbacks, offers, partners, fraud detection, financial, and CRM modules into comprehensive tables with real-time PostgreSQL data only.
- **API Integrity**: All database tables and major API endpoints functional with proper HTTP responses and CRUD operations using live PostgreSQL data.
- **Postback System**: Complete external tracker integration with automatic postback delivery, macro replacement, retry logic, and monitoring. Supports various tracker formats with live data.
- **Automatic Partner Link Generation**: Smart link generation with unique parameters and role-based access control.
- **Real-time Event Tracking**: Automatic postback triggers on lp_click, lead, deposit, conversion events with full data preservation in PostgreSQL.
- **Postback Testing & Monitoring**: Built-in testing tools for validating tracker configurations and monitoring delivery success rates.
- **Data Integrity**: Complete elimination of demo data - all systems use real-time PostgreSQL data, real DNS verification, real SSL certificates, and authentic blockchain integration requirements.
- **Live Dashboard System**: All role-based dashboards (advertiser, partner/affiliate, super-admin) implemented with real-time PostgreSQL data endpoints, eliminating all mock data, demo statistics, and placeholder values (August 11, 2025)

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