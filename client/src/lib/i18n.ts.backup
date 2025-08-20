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

// Force Russian language in localStorage
if (!localStorage.getItem('i18nextLng')) {
  localStorage.setItem('i18nextLng', 'ru');
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru', // Force Russian as default language
    fallbackLng: 'ru',
    debug: false, // Disable debug to reduce console noise

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