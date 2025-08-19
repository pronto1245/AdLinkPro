import SuperAdmin from "@/pages/super-admin/dashboard";
import React, { Suspense, lazy } from 'react';
import { Switch, Route, Redirect } from 'wouter';
import { useTranslation } from 'react-i18next';

import Login from '@/pages/auth/login';
import Logout from '@/pages/auth/logout';
import RegisterUnified from '@/pages/auth/RegisterUnified';
import { LoginPartner, LoginAdvertiser, RegisterPartner, RegisterAdvertiser } from '@/pages/LoginVariants';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AuthRedirector from '@/components/auth/AuthRedirector';
import Unauthorized from '@/pages/Unauthorized';

import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import WebSocketManager from '@/components/WebSocketManager';

// Advertiser
const AdvertiserDash      = lazy(() => import('@/pages/advertiser/AdvertiserDashboard'));
const AdvertiserOffers    = lazy(() => import('@/pages/advertiser/AdvertiserOffers'));
const AdvertiserReports   = lazy(() => import('@/pages/advertiser/Reports'));
const AdvertiserPartners  = lazy(() => import('@/pages/advertiser/AdvertiserPartners'));
const AdvertiserProfile   = lazy(() => import('@/pages/advertiser/AdvertiserProfile'));
const AdvertiserNotifs    = lazy(() => import('@/pages/advertiser/AdvertiserNotifications'));
const AdvertiserTeam      = lazy(() => import('@/pages/advertiser/TeamManagement'));
const AdvertiserPostbacks = lazy(() => import('@/pages/advertiser/Postbacks'));
const AdvertiserAnalytics = lazy(() => import('@/pages/advertiser/AdvertiserAnalytics'));
const AdvertiserFinances  = lazy(() => import('@/pages/advertiser/AdvertiserFinances'));
const AdvertiserAntiFraud = lazy(() => import('@/pages/advertiser/AntiFraud'));

// Additional advertiser specialized components
const AdvertiserAccessRequests = lazy(() => import('@/pages/advertiser/AdvertiserAccessRequests'));
const AdvertiserReferrals = lazy(() => import('@/pages/advertiser/ReferralStats'));
const AdvertiserDocuments = lazy(() => import('@/pages/advertiser/AdvertiserDocuments'));

// Partner (Affiliate) - Updated to use consistent /dashboard/affiliate prefix
const AffiliateDash   = lazy(() => import('@/pages/partner/PartnerDashboard'));
const AffiliateOffers = lazy(() => import('@/pages/partner/Offers'));
const AffiliateStats  = lazy(() => import('@/pages/affiliate/Statistics'));
const AffiliateFin    = lazy(() => import('@/pages/affiliate/Finances'));
const AffiliatePosts  = lazy(() => import('@/pages/affiliate/Postbacks'));
const AffiliateProf   = lazy(() => import('@/pages/partner/PartnerProfile'));
const AffiliateNotifs = lazy(() => import('@/pages/affiliate/PartnerNotifications'));

// Additional specialized affiliate components
const AffiliateLinks = lazy(() => import('@/pages/affiliate/TrackingLinks'));
const AffiliateCreatives = lazy(() => import('@/pages/affiliate/CreativesAndTools'));
const AffiliateTeam = lazy(() => import('@/pages/affiliate/TeamManagement'));
const AffiliateReferrals = lazy(() => import('@/pages/affiliate/ReferralSystem'));
const AffiliateSecurity = lazy(() => import('@/pages/affiliate/SecuritySettings'));
const AffiliateDocuments = lazy(() => import('@/pages/affiliate/DocumentsManager'));

// Owner
const OwnerDash     = lazy(() => import('@/pages/owner/OwnerDashboard'));
const OwnerUsers    = lazy(() => import('@/pages/owner/Users'));
const OwnerSettings = lazy(() => import('@/pages/owner/Settings'));

// Super Admin
const SuperAdminDash   = lazy(() => import('@/pages/super-admin/dashboard'));
const SuperAdminUsers  = lazy(() => import('@/pages/super-admin/users-management'));
const SuperAdminOffers = lazy(() => import('@/pages/super-admin/offers'));
const SuperAdminAnalyt = lazy(() => import('@/pages/super-admin/analytics'));

// Staff
const StaffDash = lazy(() => import('@/pages/staff/StaffDashboard'));

// Demo
const SidebarDemo = lazy(() => import('@/pages/SidebarDemo'));

// Helpers
const withLayout = (C: React.ComponentType<any>) => function Wrapped() {
  return (
    <RoleBasedLayout>
      <C />
    </RoleBasedLayout>
  );
};

function Router() {
  const { i18n } = useTranslation();
  React.useEffect(() => {
    if (i18n.language !== 'ru') i18n.changeLanguage('ru');
  }, [i18n]);

  return (
    <Suspense fallback={<div style={{padding:24}}>Загрузка…</div>}>
      <Switch>
        <Route path="/debug" component={() => <div style={{padding:24,color:"#fff"}}>DEBUG OK</div>} />
        
        {/* Root redirect to login */}
        <Route path="/" component={() => <Redirect to="/login" />} />

        {/* Authentication routes */}
        <Route path="/login/partner" component={LoginPartner} />
        <Route path="/login/advertiser" component={LoginAdvertiser} />
        <Route path="/login" component={Login} />
        <Route path="/logout" component={Logout} />

        <Route path="/register/partner" component={RegisterPartner} />
        <Route path="/register/advertiser" component={RegisterAdvertiser} />
        <Route path="/register" component={RegisterUnified} />

        {/* Advertiser Dashboard Routes */}
        <ProtectedRoute path="/dashboard/advertiser" roles={['advertiser']} component={withLayout(AdvertiserDash)} />
        <ProtectedRoute path="/dashboard/advertiser/offers" roles={['advertiser']} component={withLayout(AdvertiserOffers)} />
        <ProtectedRoute path="/dashboard/advertiser/reports" roles={['advertiser']} component={withLayout(AdvertiserReports)} />
        <ProtectedRoute path="/dashboard/advertiser/partners" roles={['advertiser']} component={withLayout(AdvertiserPartners)} />
        <ProtectedRoute path="/dashboard/advertiser/profile" roles={['advertiser']} component={withLayout(AdvertiserProfile)} />
        <ProtectedRoute path="/dashboard/advertiser/notifications" roles={['advertiser']} component={withLayout(AdvertiserNotifs)} />
        <ProtectedRoute path="/dashboard/advertiser/team" roles={['advertiser']} component={withLayout(AdvertiserTeam)} />
        <ProtectedRoute path="/dashboard/advertiser/postbacks" roles={['advertiser']} component={withLayout(AdvertiserPostbacks)} />
        <ProtectedRoute path="/dashboard/advertiser/analytics" roles={['advertiser']} component={withLayout(AdvertiserAnalytics)} />
        <ProtectedRoute path="/dashboard/advertiser/finances" roles={['advertiser']} component={withLayout(AdvertiserFinances)} />
        <ProtectedRoute path="/dashboard/advertiser/anti-fraud" roles={['advertiser']} component={withLayout(AdvertiserAntiFraud)} />
        <ProtectedRoute path="/dashboard/advertiser/access-requests" roles={['advertiser']} component={withLayout(AdvertiserAccessRequests)} />
        <ProtectedRoute path="/dashboard/advertiser/referrals" roles={['advertiser']} component={withLayout(AdvertiserReferrals)} />
        <ProtectedRoute path="/dashboard/advertiser/antifraud" roles={['advertiser']} component={withLayout(AdvertiserAntiFraud)} />
        <ProtectedRoute path="/dashboard/advertiser/documents" roles={['advertiser']} component={withLayout(AdvertiserDocuments)} />

        {/* Affiliate Dashboard Routes - Standardized to /dashboard/affiliate */}
        <ProtectedRoute path="/dashboard/affiliate" roles={['partner', 'affiliate']} component={withLayout(AffiliateDash)} />
        <ProtectedRoute path="/dashboard/affiliate/offers" roles={['partner', 'affiliate']} component={withLayout(AffiliateOffers)} />
        <ProtectedRoute path="/dashboard/affiliate/statistics" roles={['partner', 'affiliate']} component={withLayout(AffiliateStats)} />
        <ProtectedRoute path="/dashboard/affiliate/finances" roles={['partner', 'affiliate']} component={withLayout(AffiliateFin)} />
        <ProtectedRoute path="/dashboard/affiliate/postbacks" roles={['partner', 'affiliate']} component={withLayout(AffiliatePosts)} />
        <ProtectedRoute path="/dashboard/affiliate/profile" roles={['partner', 'affiliate']} component={withLayout(AffiliateProf)} />
        <ProtectedRoute path="/dashboard/affiliate/notifications" roles={['partner', 'affiliate']} component={withLayout(AffiliateNotifs)} />
        <ProtectedRoute path="/dashboard/affiliate/access-requests" roles={['partner', 'affiliate']} component={withLayout(AffiliateOffers)} />
        <ProtectedRoute path="/dashboard/affiliate/links" roles={['partner', 'affiliate']} component={withLayout(AffiliateLinks)} />
        <ProtectedRoute path="/dashboard/affiliate/creatives" roles={['partner', 'affiliate']} component={withLayout(AffiliateCreatives)} />
        <ProtectedRoute path="/dashboard/affiliate/team" roles={['partner', 'affiliate']} component={withLayout(AffiliateTeam)} />
        <ProtectedRoute path="/dashboard/affiliate/referrals" roles={['partner', 'affiliate']} component={withLayout(AffiliateReferrals)} />
        <ProtectedRoute path="/dashboard/affiliate/security" roles={['partner', 'affiliate']} component={withLayout(AffiliateSecurity)} />
        <ProtectedRoute path="/dashboard/affiliate/documents" roles={['partner', 'affiliate']} component={withLayout(AffiliateDocuments)} />

        {/* Partner Dashboard Routes - Dedicated partner routes */}
        <ProtectedRoute path="/dashboard/partner" roles={['partner']} component={withLayout(AffiliateDash)} />
        <ProtectedRoute path="/dashboard/partner/offers" roles={['partner']} component={withLayout(AffiliateOffers)} />
        <ProtectedRoute path="/dashboard/partner/statistics" roles={['partner']} component={withLayout(AffiliateStats)} />
        <ProtectedRoute path="/dashboard/partner/finances" roles={['partner']} component={withLayout(AffiliateFin)} />
        <ProtectedRoute path="/dashboard/partner/postbacks" roles={['partner']} component={withLayout(AffiliatePosts)} />
        <ProtectedRoute path="/dashboard/partner/profile" roles={['partner']} component={withLayout(AffiliateProf)} />
        <ProtectedRoute path="/dashboard/partner/notifications" roles={['partner']} component={withLayout(AffiliateNotifs)} />
        <ProtectedRoute path="/dashboard/partner/links" roles={['partner']} component={withLayout(AffiliateLinks)} />
        <ProtectedRoute path="/dashboard/partner/creatives" roles={['partner']} component={withLayout(AffiliateCreatives)} />
        <ProtectedRoute path="/dashboard/partner/team" roles={['partner']} component={withLayout(AffiliateTeam)} />
        <ProtectedRoute path="/dashboard/partner/referrals" roles={['partner']} component={withLayout(AffiliateReferrals)} />
        <ProtectedRoute path="/dashboard/partner/security" roles={['partner']} component={withLayout(AffiliateSecurity)} />
        <ProtectedRoute path="/dashboard/partner/documents" roles={['partner']} component={withLayout(AffiliateDocuments)} />

        {/* Owner Dashboard Routes */}
        <ProtectedRoute path="/dashboard/owner" roles={['owner']} component={withLayout(OwnerDash)} />
        <ProtectedRoute path="/dashboard/owner/users" roles={['owner']} component={withLayout(OwnerUsers)} />
        <ProtectedRoute path="/dashboard/owner/settings" roles={['owner']} component={withLayout(OwnerSettings)} />

        {/* Super Admin Dashboard Routes */}
        <ProtectedRoute path="/dashboard/super-admin" roles={['super_admin']} component={withLayout(SuperAdminDash)} />
        <ProtectedRoute path="/dashboard/super-admin/users" roles={['super_admin']} component={withLayout(SuperAdminUsers)} />
        <ProtectedRoute path="/dashboard/super-admin/offers" roles={['super_admin']} component={withLayout(SuperAdminOffers)} />
        <ProtectedRoute path="/dashboard/super-admin/analytics" roles={['super_admin']} component={withLayout(SuperAdminAnalyt)} />

        {/* Staff Dashboard Routes */}
        <ProtectedRoute path="/dashboard/staff" roles={['staff']} component={withLayout(StaffDash)} />

        {/* Demo Route - Available to all authenticated users */}
        <ProtectedRoute path="/sidebar-demo" roles={['partner', 'affiliate', 'advertiser', 'owner', 'super_admin', 'staff']} component={withLayout(SidebarDemo)} />

        {/* Error and fallback routes */}
        <Route path="/unauthorized" component={Unauthorized} />
        <Route component={() => <Redirect to="/login" />} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <>
      <WebSocketManager />
      <Router />
    </>
  );
}
