import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { AuthProvider } from "./contexts/auth-context";

import { SidebarProvider } from "./contexts/sidebar-context";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "@/components/NotificationToast";
import { NotificationProvider as PushNotificationProvider } from "./components/ui/notification-provider";
import { WebSocketManager } from "@/components/WebSocketManager";
import RoleBasedLayout from "./components/layout/RoleBasedLayout";
import NotFound from "./pages/NotFound";
import Dashboard from "@/pages/super-admin/dashboard";
import SuperAdminUsers from "@/pages/super-admin/users";
import SuperAdminUsersManagement from "@/pages/super-admin/users-management";
import RolesManagement from "@/pages/super-admin/roles-management";
import SuperAdminOffers from "@/pages/super-admin/offers";
import SuperAdminOffersManagement from "@/pages/super-admin/offers-management";
import SuperAdminOfferDetails from "@/pages/super-admin/offer-details";
import SuperAdminFinances from "@/pages/super-admin/finances";
import SuperAdminFraudAlerts from "@/pages/super-admin/fraud-alerts";
import PostbacksPage from "@/pages/super-admin/postbacks";
import SuperAdminSystemSettings from "@/pages/super-admin/system-settings";
import SuperAdminAuditLogs from "@/pages/super-admin/audit-logs";
import SuperAdminPostbacks from "@/pages/super-admin/postbacks-management";
import SuperAdminBlacklist from "@/pages/super-admin/blacklist-management";
import SuperAdminAnalytics from "@/pages/super-admin/analytics";
import AnalyticsNew from "@/pages/super-admin/analytics-new";
import PartnerOffers from '@/pages/affiliate/PartnerOffers';
import AffiliateOffers from '@/pages/affiliate/AffiliateOffers';
import OfferDetails from '@/pages/affiliate/OfferDetails';

import SuperAdminSupport from "@/pages/super-admin/support";
import UserAnalytics from "@/pages/super-admin/user-analytics";
import PostbackManagementSuperAdmin from "@/pages/super-admin/postback-management";
import AdvertiserDashboardOld from "@/pages/advertiser/simple-dashboard";
import AdvertiserProfile from '@/pages/advertiser/AdvertiserProfile';
import AdvertiserFinances from '@/pages/advertiser/AdvertiserFinances';
import AdvertiserOffers from '@/pages/advertiser/AdvertiserOffers';
import AdvertiserOffersSimple from '@/pages/advertiser/AdvertiserOffers_SIMPLE';
import AdvertiserPartners from '@/pages/advertiser/AdvertiserPartners';
import AffiliateDashboard from "@/pages/affiliate/simple-dashboard";
import AffiliateTeamManagement from "@/pages/affiliate/TeamManagement";
import PostbackManagementAffiliate from "@/pages/affiliate/PostbackManagement";
import PostbackSettings from "@/pages/affiliate/PostbackSettings";
import PartnerNotifications from "./pages/affiliate/PartnerNotifications";
import { AdvertiserDashboard } from "@/pages/advertiser/AdvertiserDashboard";
import OfferManagement from "@/pages/advertiser/OfferManagement";
import CreateOffer from "@/pages/advertiser/CreateOffer";
import AdvertiserOfferDetails from "@/pages/advertiser/OfferDetails";
import EditOffer from "@/pages/advertiser/EditOffer";
import MyOffers from "@/pages/advertiser/MyOffers";
import MyOffersDragDrop from "@/pages/advertiser/MyOffersDragDrop";
import ReceivedOffers from "@/pages/advertiser/ReceivedOffers";
import Finance from "@/pages/advertiser/Finance";
// Removed: Analytics - functionality merged into AdvertiserAnalytics
import { AdvertiserAnalytics } from "@/pages/advertiser/AdvertiserAnalytics";
// Removed: LiveAnalytics and AntiFraudAnalytics - functionality merged
import AdvertiserTeamManagement from "@/pages/advertiser/TeamManagement";
import AntiFraud from "@/pages/advertiser/AntiFraud";
import AdvertiserDocuments from "@/pages/advertiser/AdvertiserDocuments";
import PartnerDashboard from "@/pages/affiliate/PartnerDashboard";
import PartnerProfile from "@/pages/affiliate/PartnerProfile";
import PartnerSettings from "@/pages/affiliate/PartnerSettings";
import AdvertiserAccessRequests from '@/pages/advertiser/AdvertiserAccessRequests';
import AdvertiserNotifications from '@/pages/advertiser/AdvertiserNotifications';
import ReferralStats from '@/pages/advertiser/ReferralStats';
import ReferralSystemFixed from '@/pages/affiliate/ReferralSystemFixed';
import ReferralProgram from '@/pages/advertiser/ReferralProgram';
import FileUploadTest from '@/pages/FileUploadTest';


import { PartnerLayout } from "@/components/partner/PartnerLayout";
import Statistics from "@/pages/affiliate/Statistics";
import PartnerLiveAnalytics from "@/pages/affiliate/PartnerLiveAnalytics";
import Finances from "@/pages/affiliate/Finances";
import AccessRequests from "@/pages/partner/AccessRequests";
import { useAuth } from "./contexts/auth-context";
import * as React from 'react';
import Login from "@/pages/auth/login";
import UpdateToken from "@/pages/UpdateToken";
import AdvertiserPostbacks from '@/pages/advertiser/Postbacks';
import AdvertiserPostbackSettings from '@/pages/advertiser/AdvertiserPostbackSettings';
import PostbackProfiles from '@/pages/advertiser/PostbackProfiles';
import AffiliatePostbacks from '@/pages/affiliate/Postbacks';
import PostbacksNew from '@/pages/affiliate/PostbacksNew';
import { EventTesting } from '@/pages/EventTesting';
import '@/lib/i18n'; // Initialize i18next
import { useTranslation } from 'react-i18next';


function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  console.log('ProtectedRoute debug:', {
    userRole: user.role,
    allowedRoles,
    includes: allowedRoles.includes(user.role),
    path: window.location.pathname
  });
  
  if (!allowedRoles.includes(user.role)) {
    console.log('REDIRECTING TO UNAUTHORIZED - Role mismatch');
    return <Redirect to="/unauthorized" />;
  }
  
  console.log('ACCESS GRANTED - Rendering component');
  return <>{children}</>;
}

function Router() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  
  // Force Russian language on app load
  React.useEffect(() => {
    if (i18n.language !== 'ru') {
      i18n.changeLanguage('ru');
    }
  }, [i18n]);
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/login/:role" component={Login} />
      
      {/* Super Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/super-admin/dashboard">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminUsersManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users-management">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminUsersManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/super-admin/users-management">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminUsersManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/roles">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <RolesManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/user-analytics">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <UserAnalytics />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/OffersManagement">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminOffersManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/OfferDetails/:id">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminOfferDetails />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/finances">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminFinances />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/fraud-alerts">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminFraudAlerts />
        </ProtectedRoute>
      </Route>


      <Route path="/super-admin/postbacks">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <PostbacksPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/system-settings">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminSystemSettings />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/audit-logs">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminAuditLogs />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/postbacks">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminPostbacks />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/blacklist">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminBlacklist />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/analytics">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminAnalytics />
        </ProtectedRoute>
      </Route>
      <Route path="/super-admin/analytics">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <AnalyticsNew />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/postbacks">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <PostbackManagementSuperAdmin />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/support">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminSupport />
        </ProtectedRoute>
      </Route>
      
      {/* Advertiser Routes - ТЗ2 Implementation - Specific routes first */}
      <Route path="/advertiser/profile">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <AdvertiserProfile />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/documents">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout key="advertiser-documents">
            <AdvertiserDocuments />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/finances">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <AdvertiserFinances />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/finance">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <Finance />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/offers/new">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <CreateOffer />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/create">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <CreateOffer />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/offers/:id/edit">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <EditOffer />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/offers/manage">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <OfferManagement />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/offers/:id">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <AdvertiserOfferDetails />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      

      
      <Route path="/advertiser/offers">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <AdvertiserOffers />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/offers-drag">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <MyOffersDragDrop />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/received-offers">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <ReceivedOffers />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/access-requests">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <AdvertiserAccessRequests />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/notifications">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <AdvertiserNotifications />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/referrals">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <ReferralProgram />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      

      
      <Route path="/advertiser/analytics">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <AdvertiserAnalytics />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/postbacks">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <AdvertiserPostbackSettings />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/advertiser/postback-profiles">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <PostbackProfiles />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>

      {/* Removed: live-analytics, antifraud-analytics, analytics-old - functionality merged into main pages */}
      
      <Route path="/advertiser/team">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout key="advertiser-team">
            <AdvertiserTeamManagement />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/partners">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <AdvertiserPartners />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/antifraud">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout key="advertiser-antifraud">
            <AntiFraud />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      

      
      <Route path="/advertiser/dashboard">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <AdvertiserDashboard />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <RoleBasedLayout>
            <AdvertiserDashboard />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      {/* Affiliate Routes - Specific routes first */}
      <Route path="/affiliate/offers/:id">
        <ProtectedRoute allowedRoles={['affiliate']}>
          <PartnerLayout>
            <OfferDetails />
          </PartnerLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/affiliate/statistics">
        <ProtectedRoute allowedRoles={['affiliate']}>
          <PartnerLayout>
            <Statistics />
          </PartnerLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/affiliate/live-analytics">
        <ProtectedRoute allowedRoles={['affiliate']}>
          <PartnerLayout>
            <PartnerLiveAnalytics />
          </PartnerLayout>
        </ProtectedRoute>
      </Route>
      

      
      <Route path="/affiliate/finances">
        <ProtectedRoute allowedRoles={['affiliate']}>
          <PartnerLayout>
            <Finances />
          </PartnerLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/affiliate/offers">
        <ProtectedRoute allowedRoles={['affiliate']}>
          <PartnerLayout>
            <PartnerOffers />
          </PartnerLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/affiliate/access-requests">
        <ProtectedRoute allowedRoles={['affiliate']}>
          <PartnerLayout>
            <AccessRequests />
          </PartnerLayout>
        </ProtectedRoute>
      </Route>
      

      

      
      <Route path="/affiliate/team">
        <ProtectedRoute allowedRoles={['affiliate']}>
          <PartnerLayout>
            <AffiliateTeamManagement />
          </PartnerLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/affiliate/referrals">
        <ProtectedRoute allowedRoles={['affiliate']}>
          <PartnerLayout>
            <ReferralSystemFixed />
          </PartnerLayout>
        </ProtectedRoute>
      </Route>
      

      
      <Route path="/affiliate/notifications">
        <ProtectedRoute allowedRoles={['affiliate']}>
          <PartnerLayout>
            <PartnerNotifications />
          </PartnerLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/affiliate/postbacks">
        <ProtectedRoute allowedRoles={['affiliate']}>
          <PartnerLayout>
            <PostbacksNew />
          </PartnerLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/affiliate/profile">
        <ProtectedRoute allowedRoles={['affiliate']}>
          <PartnerLayout>
            <PartnerProfile />
          </PartnerLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/affiliate/settings">
        <ProtectedRoute allowedRoles={['affiliate']}>
          <PartnerLayout>
            <PartnerSettings />
          </PartnerLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/affiliate/dashboard">
        <ProtectedRoute allowedRoles={['affiliate']}>
          <PartnerLayout>
            <PartnerDashboard />
          </PartnerLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/affiliate">
        <ProtectedRoute allowedRoles={['affiliate']}>
          <PartnerLayout>
            <PartnerDashboard />
          </PartnerLayout>
        </ProtectedRoute>
      </Route>
      
      {/* Default redirect based on role */}
      <Route path="/">
        {!user ? (
          <Redirect to="/login" />
        ) : user.role === 'super_admin' ? (
          <Redirect to="/admin" />
        ) : user.role === 'advertiser' ? (
          <Redirect to="/advertiser" />
        ) : user.role === 'affiliate' ? (
          <Redirect to="/affiliate" />
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
      
      <Route path="/unauthorized">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-bold">Debug Info:</h3>
              <p>Current URL: {window.location.href}</p>
              <p>Pathname: {window.location.pathname}</p>
              <p>This page should not be displayed if you have proper access.</p>
            </div>
          </div>
        </div>
      </Route>
      
      {/* Event Testing Routes */}
      <Route path="/admin/events">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <EventTesting />
        </ProtectedRoute>
      </Route>
      
      <Route path="/advertiser/events">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <EventTesting />
        </ProtectedRoute>
      </Route>
      
      <Route path="/affiliate/events">
        <ProtectedRoute allowedRoles={['affiliate']}>
          <PartnerLayout>
            <EventTesting />
          </PartnerLayout>
        </ProtectedRoute>
      </Route>
      
      {/* File Upload Test Routes */}
      <Route path="/file-upload-test">
        <ProtectedRoute allowedRoles={['super_admin', 'advertiser', 'affiliate']}>
          <RoleBasedLayout>
            <FileUploadTest />
          </RoleBasedLayout>
        </ProtectedRoute>
      </Route>
      
      {/* Utility routes */}
      <Route path="/update-token" component={UpdateToken} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light">
            <AuthProvider>
              <NotificationProvider>
                <PushNotificationProvider>
                  <SidebarProvider>
                    <Toaster />
                    <WebSocketManager />
                    <Router />
                  </SidebarProvider>
                </PushNotificationProvider>
              </NotificationProvider>
            </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
