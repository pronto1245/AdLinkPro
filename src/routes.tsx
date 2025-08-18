import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import withLayout from './withLayout';
import StaffDash from '@/components/StaffDash';

// Lazy load the report component
const SystemCompletionReport = lazy(() => import('@/components/reports/SystemCompletionReport'));

export const Routes = () => (
  <>
    {/* Demo and Report Routes */}
    <Route path="/report" component={() => {
      return <SystemCompletionReport />;
    }} />

    {/* Role-based Access for Staff */}
    <ProtectedRoute path="/dashboard/staff" roles={['staff']} component={withLayout(StaffDash)} />
  </>
);
