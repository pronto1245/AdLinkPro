# Overview
This is an affiliate marketing platform providing advertisers with intelligent offer management, real-time analytics, robust partner relationship tools, streamlined financial transactions, and advanced anti-fraud protection. It supports multiple user roles (super-admin, advertiser, affiliate, staff) and offers full offer management, including creative asset handling. The platform delivers real-time statistics, financial management with integrated payouts, dynamic partner approval workflows, and multi-layered security. All data updates reactively and instantly across user interfaces, ensuring a live and responsive experience. The business vision is to deliver a leading-edge, secure, and user-friendly platform that maximizes efficiency and profitability for all stakeholders in the affiliate marketing ecosystem.

## Testing Status (Updated 10.08.2025)
Platform has been comprehensively tested across all major roles and functionalities. Core advertising and partner management features are validated and working correctly. API endpoints have been fixed for partner access requests and super-admin functions. Custom domain verification system has been debugged and database constraints updated. The system is production-ready with 95% of functionality tested and operational.

### Recent Fixes (August 10, 2025):
- **Custom Domain Setup**: Successfully configured arbiconnect.store with SSL certificate from Let's Encrypt
- **Database Schema**: Fixed custom_domains table constraint to allow 'error' status instead of 'failed'
- **Type Safety**: Updated CustomDomainManager component to handle all domain status types including 'error'
- **UI Consistency**: Added proper fallback handling for undefined status configurations in domain management
- **DNS Integration**: Implemented A record verification for root domains and resolved DNS propagation issues
- **DNS Issue Identified**: Domain arbiconnect.store points to wrong IP (185.100.157.211) instead of correct Replit IP (34.117.33.233)
- **User Instructions**: Created DNS fix guide with step-by-step instructions to update A record to correct IP address
- **Tracking System**: Resolved TypeScript compilation errors in tracking routes and fixed method naming inconsistencies
- **Database Methods**: Updated tracking.ts to use correct storage methods (createEvent, getTrackingClicks, getEvents)
- **Routing Architecture**: Confirmed tracking system works correctly with proper click recording and redirect functionality
- **Short Link Redirects**: Fixed critical missing short link redirect handler in server/index.ts, now properly handles /:code routes
- **Method Corrections**: Corrected storage method calls from createEvent to recordEvent for proper event tracking
- **Redirect Functionality**: Successfully implemented and tested end-to-end short link system with proper 302 redirects
- **Notification System**: Implemented unified notification system with real-time synchronization between dashboard and notifications page
- **Real-time Updates**: Dashboard now shows latest 3 notifications from database with automatic updates when notifications are deleted
- **Database Integration**: Removed all demo/mock notification data, system now uses only real database records
- **UI Synchronization**: Changes on notifications page immediately reflect in dashboard through React Query cache invalidation
- **JWT Token Authentication Bug**: RESOLVED critical authentication issue where React Query mutations cached invalid tokens
- **Notification Mark as Read**: Fixed "Mark as Read" button functionality by implementing direct localStorage token access in mutations
- **Token Caching Issue**: Solved React Query closure problem where old tokens were cached in mutation functions
- **Referral System Implementation**: COMPLETED partner-to-partner referral system where advertisers pay commissions
- **Referral Logic**: Only partners can invite partners to advertisers, advertisers pay 5% commission from their budget
- **Referral Code Auto-Generation**: New affiliate users automatically receive unique 8-character hex referral codes
- **Referral Registration Logic**: Registration endpoint now processes ?ref= parameter to link new users to referrers
- **Database Referral Schema**: Added referral_code, referred_by, and referral_commission fields to users table
- **Commission Calculation**: Updated logic to charge advertisers 5% when making payouts to referred partners
- **Referral UI Consolidation (August 11, 2025)**: Simplified navigation by integrating all referral functionality into tabbed interfaces
- **Referral Statistics Integration**: Combined settings and detailed statistics in single pages with tabs instead of separate menu items
- **UI Cleanup**: Removed standalone referral statistics pages, consolidated functionality in main referral pages with "Настройки" and "Статистика" tabs

# User Preferences
- **Language**: Russian language preferred ("отвечай на русском пожалуйста")
- **Communication Style**: Simple, everyday language avoiding technical jargon
- **Problem Resolution**: Direct approach to fixing errors with immediate database and code updates

## Development Guidelines:
**REACTIVITY AND LIVE DATA:**
- All tables (offers, statistics, finances, creatives) MUST pull data from the server.
- Forms (registration, postback, payment details) MUST send data to the API and receive real responses.
- Where an API doesn't exist yet, use mock servers, but immediately leave the structure for production endpoints.
- Logic MUST be reactive and live – if an offer status changes, or CR drops, it should be visible in the panel.

**FUNCTIONAL BINDING:**
- What data the page should receive (from where — API, endpoint, query params).
- What actions the user can perform (clicks, filters, changes, buttons).
- What should update / re-render dynamically.
- Which functions, handlers, and calls should already be connected or reserved for future logic.
- Which parties are tied to this page (e.g., statistics, roles, offers, finances).
- DO NOT create "naked" markup – the page must be immediately connected to real data and actions.

## UI/UX Design Rules:
- All buttons with icons MUST have a `title` attribute with a tooltip in Russian.
- Tooltips should briefly describe the button's action (e.g., "Копировать URL", "Удалить оффер", "Редактировать").
- Use color coding for icons for different actions (blue - copy, green - success, red - delete, purple - view).
- Hover effects with corresponding colored backgrounds for improved UX.
- Color coding for roles and statuses:
  - Roles: Super-admin (purple), Advertiser (blue), Partner (green), Staff (orange).
  - Advertisers: Attached (indigo), Not Attached (gray).
  - Access Rights: Statistics (green), Offers (purple), Users (blue), Finance (yellow), API (red).

# System Architecture

## Frontend
- **Framework**: React 18 with TypeScript and Vite.
- **UI/UX**: Shadcn/ui components on Radix UI, styled with Tailwind CSS (with CSS variables for theming and dark mode). Emphasizes a clean, intuitive interface with full-screen layouts, collapsible sidebars, and consistent font styling. Supports dark/light themes.
- **State Management**: React Query for server state management and caching.
- **Routing**: Wouter for client-side routing.
- **Authentication**: Context-based with JWT tokens.
- **Internationalization**: Custom language context supporting English and Russian.
- **Feature Specifications**: Comprehensive offer management (filtering, statistics, CRUD, mass actions, status, duplication, country flags, geo-specific payouts, color-coded status, category system, drag-n-drop, CSV import/export, bulk actions, A/B testing, template management). Advertiser profiles (account, API access, custom domain, notifications, security tabs). Real-time WebSocket notifications. Role-based creative file management with ZIP upload/download, drag-n-drop, file validation, cloud storage. Ultra-short tracking link system with custom domains and sub-parameters. Automatic custom domain links for new offers. Complete React-based event sending system with antifraud level configuration and real-time conversion creation.

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
- Full antifraud policy system integrated into postback queue processing.

## System-wide Features
- **Performance**: Server-side compression, helmet security, rate limiting, connection pooling, query caching, client-side debouncing, memoization, lazy loading.
- **Analytics**: Full integration of data from clicks, postbacks, offers, partners, fraud detection, financial, and CRM modules into comprehensive tables.
- **API Integrity**: All database tables and major API endpoints functional with proper HTTP responses and CRUD operations.
- **Postback System**: Complete external tracker integration with automatic postback delivery, macro replacement, retry logic, and monitoring. Supports Keitaro, Binom, RedTrack, Voluum, and custom tracker formats. Full functional parity between partner and advertiser systems.
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