import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/auth-context";
import { LanguageProvider } from "./contexts/language-context";
import { SidebarProvider } from "./contexts/sidebar-context";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/login";
import SuperAdminDashboard from "@/pages/super-admin/dashboard";
import SuperAdminUsers from "@/pages/super-admin/users";
import SuperAdminOffers from "@/pages/super-admin/offers";
import SuperAdminOffersManagement from "@/pages/super-admin/offers-management";
import SuperAdminOfferDetails from "@/pages/super-admin/offer-details";
import SuperAdminFinances from "@/pages/super-admin/finances";
import SuperAdminFraudAlerts from "@/pages/super-admin/fraud-alerts";
import SuperAdminSystemSettings from "@/pages/super-admin/system-settings";
import SuperAdminAuditLogs from "@/pages/super-admin/audit-logs";
import SuperAdminPostbacks from "@/pages/super-admin/postbacks-management";
import SuperAdminBlacklist from "@/pages/super-admin/blacklist-management";
import SuperAdminAnalytics from "@/pages/super-admin/analytics";
import SuperAdminSupport from "@/pages/super-admin/support";
import AdvertiserDashboard from "@/pages/advertiser/dashboard";
import AffiliateDashboard from "@/pages/affiliate/dashboard";
import { useAuth } from "./contexts/auth-context";

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Redirect to="/unauthorized" />;
  }
  
  return <>{children}</>;
}

function Router() {
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Super Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminUsers />
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
      <Route path="/admin/support">
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminSupport />
        </ProtectedRoute>
      </Route>
      
      {/* Advertiser Routes */}
      <Route path="/advertiser">
        <ProtectedRoute allowedRoles={['advertiser']}>
          <AdvertiserDashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Affiliate Routes */}
      <Route path="/affiliate">
        <ProtectedRoute allowedRoles={['affiliate']}>
          <AffiliateDashboard />
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
          </div>
        </div>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <SidebarProvider>
              <Toaster />
              <Router />
            </SidebarProvider>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
