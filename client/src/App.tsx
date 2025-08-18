import SuperAdmin from "@/pages/super-admin/SuperAdminDashboard";
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

// Partner (Affiliate)
const PartnerDash   = lazy(() => import('@/pages/partner/PartnerDashboard'));
const PartnerOffers = lazy(() => import('@/pages/partner/Offers'));
const PartnerStats  = lazy(() => import('@/pages/affiliate/Statistics'));
const PartnerFin    = lazy(() => import('@/pages/affiliate/Finances'));
const PartnerPosts  = lazy(() => import('@/pages/affiliate/Postbacks'));
const PartnerProf   = lazy(() => import('@/pages/partner/PartnerProfile'));
const PartnerNotifs = lazy(() => import('@/pages/affiliate/PartnerNotifications'));

// Owner
const OwnerDash     = lazy(() => import('@/pages/owner/OwnerDashboard'));
const OwnerUsers    = lazy(() => import('@/pages/owner/Users'));
const OwnerSettings = lazy(() => import('@/pages/owner/Settings'));

// Super Admin
const SuperAdminDash   = lazy(() => import('@/pages/super-admin/dashboard'));
const SuperAdminUsers  = lazy(() => import('@/pages/super-admin/users-management'));
const SuperAdminOffers = lazy(() => import('@/pages/super-admin/offers'));
const SuperAdminAnalyt = lazy(() => import('@/pages/super-admin/analytics'));

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
        {/* Алиасы старых URL */}
      <Route path="/debug" component={() => <div style={{padding:24,color:"#fff"}}>DEBUG OK</div>} />
        <Route path="/dashboard/partner" component={() => <Redirect to="/dash" />} />
        {/* Fix: Remove self-redirecting routes that cause infinite loops */}
        <Route path="/" component={() => <Redirect to="/login" />} />

        <Route path="/login/partner" component={LoginPartner} />
        <Route path="/login/advertiser" component={LoginAdvertiser} />
        <Route path="/login" component={Login} />

        <Route path="/register/partner" component={RegisterPartner} />
        <Route path="/register/advertiser" component={RegisterAdvertiser} />
        <Route path="/register" component={RegisterUnified} />

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

        <ProtectedRoute path="/dash" roles={['partner']} component={PartnerDash} />
        <ProtectedRoute path="/dash/offers" roles={['partner']} component={withLayout(PartnerOffers)} />
        <ProtectedRoute path="/dash/statistics" roles={['partner']} component={withLayout(PartnerStats)} />
        <ProtectedRoute path="/dash/finances" roles={['partner']} component={withLayout(PartnerFin)} />
        <ProtectedRoute path="/dash/postbacks" roles={['partner']} component={withLayout(PartnerPosts)} />
        <ProtectedRoute path="/dash/profile" roles={['partner']} component={withLayout(PartnerProf)} />
        <ProtectedRoute path="/dash/notifications" roles={['partner']} component={withLayout(PartnerNotifs)} />

        <ProtectedRoute path="/dashboard/owner" roles={['owner']} component={withLayout(OwnerDash)} />
        <ProtectedRoute path="/dashboard/owner/users" roles={['owner']} component={withLayout(OwnerUsers)} />
        <ProtectedRoute path="/dashboard/owner/settings" roles={['owner']} component={withLayout(OwnerSettings)} />

        <ProtectedRoute path="/dashboard/super-admin" roles={['super_admin']} component={withLayout(SuperAdminDash)} />
        <ProtectedRoute path="/dashboard/super-admin/users" roles={['super_admin']} component={withLayout(SuperAdminUsers)} />
        <ProtectedRoute path="/dashboard/super-admin/offers" roles={['super_admin']} component={withLayout(SuperAdminOffers)} />
        <ProtectedRoute path="/dashboard/super-admin/analytics" roles={['super_admin']} component={withLayout(SuperAdminAnalyt)} />

        <Route path="/unauthorized" component={Unauthorized} />
        <Route component={() => <Redirect to="/login" />} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return <Router />;
}
