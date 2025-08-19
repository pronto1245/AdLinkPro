#!/bin/bash

# 🧹 CLEANUP SCRIPT - Remove Dead Modules and Files
# This script removes identified dead, demo, and backup files

echo "🧹 Starting cleanup of dead modules and files..."

# Remove demo pages
echo "🎭 Removing demo pages..."
rm -f client/src/pages/SidebarDemo.tsx
rm -f client/src/pages/UpdateToken.tsx
rm -f sidebar-demo.html
rm -f top-navigation-demo.html
rm -f demo.html

# Remove stub dashboard files
echo "🏗️ Removing stub dashboard files..."
rm -f client/src/pages/dash/Advertiser.tsx
rm -f client/src/pages/dash/Partner.tsx
rm -f client/src/pages/dash/SuperAdmin.tsx
rm -f client/src/pages/dash/Owner.tsx

# Remove backup files
echo "💾 Removing backup files..."
rm -f client/src/App.tsx.bak*
rm -f client/src/main.tsx.bak*
rm -f client/src/services/auth.ts.bak*
rm -f client/src/pages/auth/login.tsx.bak*
rm -f client/src/components/Brand.tsx.bak*
rm -f server/index.ts.bak*
rm -f dist/index.js.bak*
rm -f Dockerfile.bak
rm -f storage_backup.ts

# Remove problematic i18n backup file
echo "🌐 Removing problematic i18n backup..."
rm -f client/src/lib/i18n_backup.ts

# Remove legacy auth files
echo "🔐 Removing legacy auth files..."
rm -f client/src/pages/auth/LoginLegacy.tsx

# Remove stub super-admin pages that duplicate functionality
echo "👨‍💼 Removing stub super-admin pages..."
rm -f client/src/pages/super-admin/analytics.tsx
rm -f client/src/pages/super-admin/offers.tsx
rm -f client/src/pages/super-admin/postback-management.tsx
rm -f client/src/pages/super-admin/users-management.tsx

# Remove empty stub partner pages
echo "🤝 Removing stub partner pages..."
rm -f client/src/pages/partner/PartnerDashboard.tsx
rm -f client/src/pages/partner/PartnerProfile.tsx
rm -f client/src/pages/partner/Offers.tsx

# Remove empty owner pages
echo "👑 Removing empty owner pages..."
rm -f client/src/pages/owner/Settings.tsx
rm -f client/src/pages/owner/Users.tsx

echo "✅ Cleanup completed!"
echo "📊 Summary:"
echo "  - Demo pages: removed"
echo "  - Stub dashboards: removed"
echo "  - Backup files: removed"
echo "  - Legacy files: removed"
echo "  - Duplicate pages: removed"
echo ""
echo "🔄 Next steps:"
echo "  1. Review remaining files"
echo "  2. Update routing to remove references to deleted files"
echo "  3. Run npm run check to verify no new errors"