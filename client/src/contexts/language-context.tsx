import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    'dashboard': 'Dashboard',
    'users': 'Users',
    'offers': 'Offers',
    'finance': 'Finance',
    'postbacks': 'Postbacks',
    'analytics': 'Analytics',
    'support': 'Support',
    'settings': 'Settings',
    'welcome': 'Welcome back! Here\'s what\'s happening today.',
    'total_revenue': 'Total Revenue',
    'active_partners': 'Active Partners',
    'conversion_rate': 'Conversion Rate',
    'fraud_rate': 'Fraud Rate',
    'revenue_overview': 'Revenue Overview',
    'recent_activity': 'Recent Activity',
    'top_performers': 'Top Performing Partners',
    'recent_offers': 'Recent Offers',
    'create_offer': 'Create Offer',
    'login': 'Login',
    'username': 'Username',
    'password': 'Password',
    'email': 'Email',
    'sign_in': 'Sign In',
    'logout': 'Logout',
  },
  ru: {
    'dashboard': 'Панель управления',
    'users': 'Пользователи',
    'offers': 'Офферы',
    'finance': 'Финансы',
    'postbacks': 'Постбеки',
    'analytics': 'Аналитика',
    'support': 'Поддержка',
    'settings': 'Настройки',
    'welcome': 'Добро пожаловать! Вот что происходит сегодня.',
    'total_revenue': 'Общий доход',
    'active_partners': 'Активные партнеры',
    'conversion_rate': 'Конверсия',
    'fraud_rate': 'Уровень фрода',
    'revenue_overview': 'Обзор доходов',
    'recent_activity': 'Последняя активность',
    'top_performers': 'Топ партнеры',
    'recent_offers': 'Последние офферы',
    'create_offer': 'Создать оффер',
    'login': 'Вход',
    'username': 'Имя пользователя',
    'password': 'Пароль',
    'email': 'Email',
    'sign_in': 'Войти',
    'logout': 'Выйти',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
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
