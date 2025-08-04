import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/i18n';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('ru'); // Default to Russian

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru')) {
      setLanguageState(savedLanguage);
    } else {
      // Set default language based on browser or user preference
      setLanguageState('ru');
      localStorage.setItem('language', 'ru');
    }
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    // Try to get the translation for the current language
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    
    // Fallback to English if available
    if (language !== 'en' && translations['en'] && translations['en'][key]) {
      return translations['en'][key];
    }
    
    // Return the key itself if no translation found
    return key;
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
