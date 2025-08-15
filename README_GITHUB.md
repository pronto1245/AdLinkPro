# AdLinkPro - Affiliate Marketing Platform

## 🚀 Overview
AdLinkPro is a comprehensive affiliate marketing platform built with modern technologies. It provides robust offer management, real-time analytics, anti-fraud protection, and streamlined financial operations for advertisers and affiliates.

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **React Query** for state management
- **Wouter** for routing

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **Drizzle ORM** for database operations
- **PostgreSQL** database
- **JWT** authentication
- **bcrypt** for password hashing

### Infrastructure
- **Neon Database** (Serverless PostgreSQL)
- **Google Cloud Storage** for file storage
- **Koyeb** for backend deployment
- **Netlify** for frontend deployment

## 📁 Project Structure

```
AdLinkPro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/          # Utilities and configurations
│   │   └── utils/        # Helper functions
│   └── public/           # Static assets
├── server/                # Express.js backend
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── index.ts          # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts         # Database schema (Drizzle)
├── migrations/           # Database migrations
└── scripts/             # Build and deployment scripts
```

## 🔧 Features

### For Advertisers
- **Offer Management**: Create, edit, and manage advertising offers
- **Partner Management**: Handle affiliate partnerships
- **Analytics Dashboard**: Real-time performance tracking
- **Anti-fraud Protection**: Advanced fraud detection systems
- **Custom Domains**: White-label solutions
- **API Access**: RESTful API for integrations

### For Affiliates/Partners
- **Offer Browsing**: Access to approved offers
- **Tracking Links**: Automated link generation
- **Performance Analytics**: Detailed statistics and reports
- **Payout Management**: Financial tracking and payments
- **Support System**: Ticket-based support

### System Features
- **Role-based Access Control**: Super admin, advertiser, affiliate roles
- **Real-time Notifications**: WebSocket-based updates
- **Multi-language Support**: English and Russian
- **Dark/Light Theme**: User preference themes
- **Responsive Design**: Mobile-first approach
- **File Upload**: Support for creatives and documents

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google Cloud Storage (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AdLinkPro.git
   cd AdLinkPro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   # Required
   DATABASE_URL="postgresql://username:password@localhost:5432/adlinkpro"
   JWT_SECRET="your-super-secure-jwt-secret-min-32-chars"
   SESSION_SECRET="your-session-secret-min-32-chars"
   
   # Optional Services
   SENDGRID_API_KEY="your-sendgrid-key"
   GOOGLE_CLOUD_PROJECT_ID="your-gcp-project"
   GOOGLE_CLOUD_STORAGE_BUCKET="your-bucket-name"
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 🎯 Deployment

### Backend (Koyeb)
1. Connect your GitHub repository to Koyeb
2. Set environment variables in Koyeb dashboard
3. Deploy from `main` branch

### Frontend (Netlify)
1. Connect repository to Netlify
2. Set build command: `npm run build:client`
3. Set publish directory: `client/dist`
4. Deploy

### Environment Variables for Production

**Backend (Koyeb):**
```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_production_jwt_secret
SESSION_SECRET=your_production_session_secret
NODE_ENV=production
PORT=8000
```

**Frontend (Netlify):**
```env
VITE_API_BASE_URL=https://your-koyeb-app.koyeb.app
```

## 📊 Database Schema

The platform uses PostgreSQL with the following main entities:

- **Users**: User accounts with role-based permissions
- **Offers**: Advertising offers with targeting and payouts
- **Tracking Links**: Generated affiliate links
- **Conversions**: Performance tracking data
- **Transactions**: Financial records
- **Notifications**: Real-time user notifications

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt encryption
- **CORS Protection**: Cross-origin request security  
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Parameterized queries

## 🧪 Testing

```bash
# Run tests (when available)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📝 API Documentation

### Authentication Endpoints
```
POST /api/auth/login     - User login
POST /api/auth/logout    - User logout  
GET  /api/auth/me        - Get current user
```

### Offer Management
```
GET    /api/advertiser/offers     - List offers
POST   /api/advertiser/offers     - Create offer
PUT    /api/advertiser/offers/:id - Update offer
DELETE /api/advertiser/offers/:id - Delete offer
```

### Analytics
```
GET /api/advertiser/dashboard     - Advertiser dashboard
GET /api/partner/dashboard        - Partner dashboard
GET /api/advertiser/analytics     - Detailed analytics
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact: support@adlinkpro.com

## 🔗 Links

- **Live Demo**: https://adlinkpro.netlify.app
- **API Documentation**: https://adlinkpro.koyeb.app/docs
- **Status Page**: https://status.adlinkpro.com

---

Built with ❤️ by the AdLinkPro Team