import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';
import ru from '../locales/ru.json';

const resources = {
  en: {
    translation: en,
  },
  ru: {
    translation: ru,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });

export default i18n;

// Debug logging for i18n
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('i18n debug - current language:', i18n.language);
    console.log('i18n debug - common.refresh translation:', i18n.t('common.refresh'));
    console.log('i18n debug - all loaded resources:', i18n.store.data);
  });
}