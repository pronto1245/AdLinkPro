import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, BarChart3, DollarSign, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Fetch real offer count from API
  const { data: offers = [] } = useQuery({
    queryKey: ['/api/partner/offers'],
    enabled: !!user
  });

  // Fetch real dashboard data
  const { data: dashboardData } = useQuery({
    queryKey: ['/api/partner/dashboard'],
    enabled: !!user
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.partnerTitle')}</h1>
        <p className="text-muted-foreground">{t('dashboard.welcome')}, {user?.firstName} {user?.lastName}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('offers.title')}</CardTitle>
            <ExternalLink className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Array.isArray(offers) ? offers.length : 0}</div>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
              {t('dashboard.available')} {t('offers.title').toLowerCase()}
            </p>
            <Link href="/affiliate/offers">
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white shadow-md" data-testid="button-view-offers">
                {t('navigation.offers')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white dark:from-green-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">{t('navigation.statistics')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{(dashboardData as any)?.metrics?.totalClicks || 0}</div>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">
              {t('dashboard.totalClicks')} 
            </p>
            <Button className="w-full mt-4 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 shadow-md" variant="outline" data-testid="button-view-stats">
              {t('navigation.statistics')}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">{t('dashboard.revenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">${(dashboardData as any)?.metrics?.revenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
              {t('dashboard.todayRevenue')}
            </p>
            <Button className="w-full mt-4 border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 shadow-md" variant="outline" data-testid="button-view-payments">
              {t('navigation.finances')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
        <CardHeader>
          <CardTitle className="text-purple-700 dark:text-purple-300">{t('dashboard.quickActions')}</CardTitle>
          <CardDescription className="text-purple-600/70 dark:text-purple-400/70">
            {t('dashboard.welcomeMessage')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background">
            <div>
              <h3 className="font-medium text-indigo-700 dark:text-indigo-300">{t('dashboard.findNewOffers')}</h3>
              <p className="text-sm text-indigo-600/70 dark:text-indigo-400/70">
                {t('dashboard.goToOffers')}
              </p>
            </div>
            <Link href="/affiliate/offers">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" data-testid="button-get-links">
                {t('offers.title')}
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between p-4 border-2 border-pink-200 dark:border-pink-800 rounded-lg bg-gradient-to-r from-pink-50 to-white dark:from-pink-950/20 dark:to-background">
            <div>
              <h3 className="font-medium text-pink-700 dark:text-pink-300">{t('dashboard.checkStatistics')}</h3>
              <p className="text-sm text-pink-600/70 dark:text-pink-400/70">
                {t('dashboard.viewDetailedStats')}
              </p>
            </div>
            <Link href="/affiliate/offers">
              <Button className="border-pink-500 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/20 shadow-md" variant="outline" data-testid="button-custom-generator">
                {t('navigation.statistics')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}