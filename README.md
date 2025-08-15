# AdLinkPro - Affiliate Marketing Platform

Production-ready affiliate marketing platform with advanced analytics and anti-fraud protection.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL + Drizzle ORM
- **Database**: Neon PostgreSQL (serverless)
- **Deployment**: Koyeb (backend) + Netlify (frontend)

## Features
- Multi-role system (Super Admin, Advertiser, Affiliate)
- Real-time analytics and tracking
- Advanced anti-fraud protection
- WebSocket notifications
- Responsive dark/light theme UI
- Complete API with JWT authentication

## Deployment

### Backend (Koyeb)
1. Create service from GitHub repository
2. Set environment variables:
   ```
   DATABASE_URL=your_neon_connection_string
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   NODE_ENV=production
   PORT=8000
   ```

### Frontend (Netlify)
1. Connect GitHub repository
2. Build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`
3. Environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend.koyeb.app
   NODE_VERSION=18
   ```

## Test Credentials
- Super Admin: `superadmin` / `password123`
- Advertiser: `advertiser1` / `password123`
- Affiliate: `test_affiliate` / `password123`

## Production URLs
- Frontend: https://adlinkpro.netlify.app
- Backend: https://adlinkpro.koyeb.app