import SuperAdmin from "@/pages/super-admin/dashboard";
import React, { Suspense, lazy } from 'react';
import { Switch, Route, Redirect } from 'wouter';
import { useTranslation } from 'react-i18next';

import Login from '@/pages/auth/login';
import RegisterUnified from '@/pages/auth/RegisterUnified';
import { LoginPartner, LoginAdvertiser, RegisterPartner, RegisterAdvertiser } from '@/pages/LoginVariants';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AuthRedirector from '@/components/auth/AuthRedirector';
import Unauthorized from '@/pages/Unauthorized';

import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import SidebarLayout from '@/components/layout/SidebarLayout';
import SidebarDemo from '@/components/SidebarDemo';

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

// Partner (Affiliate) - Updated to use consistent /dashboard/affiliate prefix
const AffiliateDash   = lazy(() => import('@/pages/partner/PartnerDashboard'));
const AffiliateOffers = lazy(() => import('@/pages/partner/Offers'));
const AffiliateStats  = lazy(() => import('@/pages/affiliate/Statistics'));
const AffiliateFin    = lazy(() => import('@/pages/affiliate/Finances'));
const AffiliatePosts  = lazy(() => import('@/pages/affiliate/Postbacks'));
const AffiliateProf   = lazy(() => import('@/pages/partner/PartnerProfile'));
const AffiliateNotifs = lazy(() => import('@/pages/affiliate/PartnerNotifications'));

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

// Helpers
const withLayout = (C: React.ComponentType<any>) => function Wrapped() {
  return (
    <RoleBasedLayout>
      <C />
    </RoleBasedLayout>
  );
};

const withSidebar = (C: React.ComponentType<any>) => function Wrapped() {
  return (
    <SidebarLayout>
      <C />
    </SidebarLayout>
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

        <Route path="/register/partner" component={RegisterPartner} />
        <Route path="/register/advertiser" component={RegisterAdvertiser} />
        <Route path="/register" component={RegisterUnified} />

        {/* Advertiser Dashboard Routes */}
        <ProtectedRoute path="/dashboard/advertiser" roles={['advertiser']} component={withSidebar(AdvertiserDash)} />
        <ProtectedRoute path="/dashboard/advertiser/offers" roles={['advertiser']} component={withSidebar(AdvertiserOffers)} />
        <ProtectedRoute path="/dashboard/advertiser/reports" roles={['advertiser']} component={withSidebar(AdvertiserReports)} />
        <ProtectedRoute path="/dashboard/advertiser/partners" roles={['advertiser']} component={withSidebar(AdvertiserPartners)} />
        <ProtectedRoute path="/dashboard/advertiser/profile" roles={['advertiser']} component={withSidebar(AdvertiserProfile)} />
        <ProtectedRoute path="/dashboard/advertiser/notifications" roles={['advertiser']} component={withSidebar(AdvertiserNotifs)} />
        <ProtectedRoute path="/dashboard/advertiser/team" roles={['advertiser']} component={withSidebar(AdvertiserTeam)} />
        <ProtectedRoute path="/dashboard/advertiser/postbacks" roles={['advertiser']} component={withSidebar(AdvertiserPostbacks)} />
        <ProtectedRoute path="/dashboard/advertiser/analytics" roles={['advertiser']} component={withSidebar(AdvertiserAnalytics)} />
        <ProtectedRoute path="/dashboard/advertiser/finances" roles={['advertiser']} component={withSidebar(AdvertiserFinances)} />
        <ProtectedRoute path="/dashboard/advertiser/anti-fraud" roles={['advertiser']} component={withSidebar(AdvertiserAntiFraud)} />
        <ProtectedRoute path="/dashboard/advertiser/access-requests" roles={['advertiser']} component={withSidebar(AdvertiserOffers)} />
        <ProtectedRoute path="/dashboard/advertiser/referrals" roles={['advertiser']} component={withSidebar(AdvertiserOffers)} />
        <ProtectedRoute path="/dashboard/advertiser/antifraud" roles={['advertiser']} component={withSidebar(AdvertiserAntiFraud)} />
        <ProtectedRoute path="/dashboard/advertiser/documents" roles={['advertiser']} component={withSidebar(AdvertiserOffers)} />

        {/* Affiliate Dashboard Routes - Standardized to /dashboard/affiliate */}
        <ProtectedRoute path="/dashboard/affiliate" roles={['partner', 'affiliate']} component={withSidebar(AffiliateDash)} />
        <ProtectedRoute path="/dashboard/affiliate/offers" roles={['partner', 'affiliate']} component={withSidebar(AffiliateOffers)} />
        <ProtectedRoute path="/dashboard/affiliate/statistics" roles={['partner', 'affiliate']} component={withSidebar(AffiliateStats)} />
        <ProtectedRoute path="/dashboard/affiliate/finances" roles={['partner', 'affiliate']} component={withSidebar(AffiliateFin)} />
        <ProtectedRoute path="/dashboard/affiliate/postbacks" roles={['partner', 'affiliate']} component={withSidebar(AffiliatePosts)} />
        <ProtectedRoute path="/dashboard/affiliate/profile" roles={['partner', 'affiliate']} component={withSidebar(AffiliateProf)} />
        <ProtectedRoute path="/dashboard/affiliate/notifications" roles={['partner', 'affiliate']} component={withSidebar(AffiliateNotifs)} />
        <ProtectedRoute path="/dashboard/affiliate/access-requests" roles={['partner', 'affiliate']} component={withSidebar(AffiliateOffers)} />
        <ProtectedRoute path="/dashboard/affiliate/links" roles={['partner', 'affiliate']} component={withSidebar(AffiliateOffers)} />
        <ProtectedRoute path="/dashboard/affiliate/creatives" roles={['partner', 'affiliate']} component={withSidebar(AffiliateOffers)} />
        <ProtectedRoute path="/dashboard/affiliate/team" roles={['partner', 'affiliate']} component={withSidebar(AffiliateOffers)} />
        <ProtectedRoute path="/dashboard/affiliate/referrals" roles={['partner', 'affiliate']} component={withSidebar(AffiliateOffers)} />
        <ProtectedRoute path="/dashboard/affiliate/security" roles={['partner', 'affiliate']} component={withSidebar(AffiliateOffers)} />
        <ProtectedRoute path="/dashboard/affiliate/documents" roles={['partner', 'affiliate']} component={withSidebar(AffiliateOffers)} />

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

        {/* Legacy route compatibility - redirect old /dash routes to new /dashboard/affiliate */}
        <Route path="/dash" component={() => <Redirect to="/dashboard/affiliate" />} />
        <Route path="/dash/*" component={() => <Redirect to="/dashboard/affiliate" />} />

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
