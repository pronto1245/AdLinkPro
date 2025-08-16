import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: 'en' | 'ru';
  setLanguage: (lang: 'en' | 'ru') => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'dashboard.title': 'Owner Dashboard',
    'dashboard.subtitle': 'Complete control panel for your affiliate platform',
    'dashboard.refresh': 'Refresh',
    'dashboard.period.today': 'Today',
    'dashboard.period.7days': '7 Days',
    'dashboard.period.30days': '30 Days', 
    'dashboard.period.90days': '90 Days',
    'dashboard.geo.all': 'All Regions',
    'dashboard.geo.russia': 'Russia',
    'dashboard.geo.usa': 'USA',
    'dashboard.geo.europe': 'Europe',
    'metrics.clicks': 'Clicks',
    'metrics.conversions': 'Conversions',
    'metrics.revenue': 'Revenue',
    'metrics.partners': 'Partners',
    'metrics.offers': 'Offers',
    'metrics.fraudBlocked': 'Fraud Blocked',
    'charts.clicksChart': 'Clicks Over Time',
    'charts.revenueChart': 'Revenue Analytics',
    'charts.conversionChart': 'Conversion Funnel',
    'charts.fraudChart': 'Fraud Detection',
    'charts.geoChart': 'Geographic Distribution',
    'charts.offersChart': 'Top Offers Performance',
    'dashboard.metrics.activePartners': 'Active Partners',
    'dashboard.metrics.activeOffers': 'Active Offers',
    'dashboard.metrics.todayClicks': 'Today Clicks',
    'dashboard.metrics.conversions': 'Conversions',
    'dashboard.metrics.platformRevenue': 'Platform Revenue',
    'dashboard.metrics.fraudRate': 'Fraud Rate',
    'dashboard.charts.trafficTitle': 'Traffic & Conversions',
    'dashboard.charts.trafficDesc': 'Real-time traffic analysis and conversion tracking',
    'dashboard.charts.revenueTitle': 'Revenue Analytics',
    'dashboard.charts.revenueDesc': 'Platform revenue breakdown by source',
    'dashboard.charts.geoTitle': 'Geographic Performance',
    'dashboard.charts.geoDesc': 'Click distribution by country and region'
  },
  ru: {
    'dashboard.title': 'Дашборд владельца',
    'dashboard.subtitle': 'Полная панель управления вашей партнерской платформой',
    'dashboard.refresh': 'Обновить',
    'dashboard.period.today': 'Сегодня',
    'dashboard.period.7days': '7 дней',
    'dashboard.period.30days': '30 дней',
    'dashboard.period.90days': '90 дней',
    'dashboard.geo.all': 'Все регионы',
    'dashboard.geo.russia': 'Россия',
    'dashboard.geo.usa': 'США',
    'dashboard.geo.europe': 'Европа',
    'metrics.clicks': 'Клики',
    'metrics.conversions': 'Конверсии',
    'metrics.revenue': 'Выручка',
    'metrics.partners': 'Партнеры',
    'metrics.offers': 'Офферы',
    'metrics.fraudBlocked': 'Фрод заблокирован',
    'charts.clicksChart': 'Клики по времени',
    'charts.revenueChart': 'Аналитика доходов',
    'charts.conversionChart': 'Воронка конверсий',
    'charts.fraudChart': 'Обнаружение фрода',
    'charts.geoChart': 'Географическое распределение', 
    'charts.offersChart': 'Топ офферы по производительности',
    'dashboard.metrics.activePartners': 'Активные партнеры',
    'dashboard.metrics.activeOffers': 'Активные офферы',
    'dashboard.metrics.todayClicks': 'Клики сегодня',
    'dashboard.metrics.conversions': 'Конверсии',
    'dashboard.metrics.platformRevenue': 'Доходы платформы',
    'dashboard.metrics.fraudRate': 'Уровень фрода',
    'dashboard.charts.trafficTitle': 'Трафик и конверсии',
    'dashboard.charts.trafficDesc': 'Анализ трафика и отслеживание конверсий в реальном времени',
    'dashboard.charts.revenueTitle': 'Аналитика доходов',
    'dashboard.charts.revenueDesc': 'Разбивка доходов платформы по источникам',
    'dashboard.charts.geoTitle': 'Географическая производительность',
    'dashboard.charts.geoDesc': 'Распределение кликов по странам и регионам'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'ru'>('ru');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}