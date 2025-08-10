// This file is now deprecated - using react-i18next instead
// Keeping for backward compatibility during migration
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export function useLanguage(): LanguageContextType {
  const { i18n, t } = useTranslation();
  
  return {
    language: (i18n.language as Language) || 'ru',
    setLanguage: (lang: Language) => i18n.changeLanguage(lang),
    t: (key: string) => t(key)
  };
}
