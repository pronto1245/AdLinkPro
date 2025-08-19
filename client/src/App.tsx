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

// Partner (Affiliate) - Use existing pages only
const AffiliateOffers = lazy(() => import('@/pages/partner/PartnerOffers'));
const AffiliateStats  = lazy(() => import('@/pages/affiliate/Statistics'));
const AffiliateFin    = lazy(() => import('@/pages/affiliate/Finances'));
const AffiliatePosts  = lazy(() => import('@/pages/affiliate/Postbacks'));
const AffiliateNotifs = lazy(() => import('@/pages/affiliate/PartnerNotifications'));

// Owner
const OwnerDash     = lazy(() => import('@/pages/owner/OwnerDashboard'));

// Super Admin  
const SuperAdminDash   = lazy(() => import('@/pages/super-admin/dashboard'));
const SuperAdminUsers  = lazy(() => import('@/pages/super-admin/users-management-old'));

// Staff
const StaffDash = lazy(() => import('@/pages/staff/StaffDashboard'));

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
        <ProtectedRoute path="/dashboard/advertiser/access-requests" roles={['advertiser']} component={withLayout(AdvertiserOffers)} />
        <ProtectedRoute path="/dashboard/advertiser/referrals" roles={['advertiser']} component={withLayout(AdvertiserOffers)} />
        <ProtectedRoute path="/dashboard/advertiser/antifraud" roles={['advertiser']} component={withLayout(AdvertiserAntiFraud)} />
        <ProtectedRoute path="/dashboard/advertiser/documents" roles={['advertiser']} component={withLayout(AdvertiserOffers)} />

        {/* Affiliate Dashboard Routes - Standardized to /dashboard/affiliate */}
        <ProtectedRoute path="/dashboard/affiliate/offers" roles={['partner', 'affiliate']} component={withLayout(AffiliateOffers)} />
        <ProtectedRoute path="/dashboard/affiliate/statistics" roles={['partner', 'affiliate']} component={withLayout(AffiliateStats)} />
        <ProtectedRoute path="/dashboard/affiliate/finances" roles={['partner', 'affiliate']} component={withLayout(AffiliateFin)} />
        <ProtectedRoute path="/dashboard/affiliate/postbacks" roles={['partner', 'affiliate']} component={withLayout(AffiliatePosts)} />
        <ProtectedRoute path="/dashboard/affiliate/notifications" roles={['partner', 'affiliate']} component={withLayout(AffiliateNotifs)} />
        <ProtectedRoute path="/dashboard/affiliate/access-requests" roles={['partner', 'affiliate']} component={withLayout(AffiliateOffers)} />

        {/* Partner Dashboard Routes - Dedicated partner routes */}
        <ProtectedRoute path="/dashboard/partner" roles={['partner']} component={withLayout(OwnerDash)} />
        <ProtectedRoute path="/dashboard/partner/offers" roles={['partner']} component={withLayout(AffiliateOffers)} />
        <ProtectedRoute path="/dashboard/partner/statistics" roles={['partner']} component={withLayout(AffiliateStats)} />
        <ProtectedRoute path="/dashboard/partner/finances" roles={['partner']} component={withLayout(AffiliateFin)} />
        <ProtectedRoute path="/dashboard/partner/postbacks" roles={['partner']} component={withLayout(AffiliatePosts)} />
        <ProtectedRoute path="/dashboard/partner/notifications" roles={['partner']} component={withLayout(AffiliateNotifs)} />

        {/* Owner Dashboard Routes */}
        <ProtectedRoute path="/dashboard/owner" roles={['owner']} component={withLayout(OwnerDash)} />

        {/* Super Admin Dashboard Routes */}
        <ProtectedRoute path="/dashboard/super-admin" roles={['super_admin']} component={withLayout(SuperAdminDash)} />
        <ProtectedRoute path="/dashboard/super-admin/users" roles={['super_admin']} component={withLayout(SuperAdminUsers)} />

        {/* Staff Dashboard Routes */}
        <ProtectedRoute path="/dashboard/staff" roles={['staff']} component={withLayout(StaffDash)} />

        {/* Error and fallback routes */}
        <Route path="/unauthorized" component={Unauthorized} />
        <Route component={() => <Redirect to="/login" />} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return <Router />;
}
