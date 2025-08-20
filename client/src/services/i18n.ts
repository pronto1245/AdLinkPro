import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from '@/locales/en.json';
import ruTranslations from '@/locales/ru.json';

export interface I18nConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  fallbackLanguage: string;
  namespace: string;
  storageKey: string;
}

export const defaultI18nConfig: I18nConfig = {
  defaultLanguage: 'ru',
  supportedLanguages: ['ru', 'en'],
  fallbackLanguage: 'ru',
  namespace: 'translation',
  storageKey: 'i18nextLng'
};

export class I18nService {
  private static instance: I18nService;
  private config: I18nConfig;
  private initialized = false;

  constructor(config: I18nConfig = defaultI18nConfig) {
    this.config = { ...defaultI18nConfig, ...config };
  }

  static getInstance(config?: I18nConfig): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService(config);
    }
    return I18nService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
          resources: {
            en: {
              [this.config.namespace]: enTranslations,
            },
            ru: {
              [this.config.namespace]: ruTranslations,
            },
          },
          lng: this.config.defaultLanguage,
          fallbackLng: this.config.fallbackLanguage,
          supportedLngs: this.config.supportedLanguages,
          
          debug: process.env.NODE_ENV === 'development',

          interpolation: {
            escapeValue: false, // React already escapes values
          },

          detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            lookupLocalStorage: this.config.storageKey,
            caches: ['localStorage'],
            checkWhitelist: false,
          },

          react: {
            bindI18n: 'languageChanged',
            bindI18nStore: '',
            transEmptyNodeValue: '',
            transSupportBasicHtmlNodes: true,
            transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'span'],
          },
        });

      this.initialized = true;
      console.debug('I18n service initialized with language:', i18n.language);
    } catch (error) {
      console.error('Failed to initialize I18n service:', error);
      throw error;
    }
  }

  getCurrentLanguage(): string {
    return i18n.language;
  }

  getSupportedLanguages(): string[] {
    return this.config.supportedLanguages;
  }

  async changeLanguage(language: string): Promise<void> {
    if (!this.config.supportedLanguages.includes(language)) {
      console.warn(`Language '${language}' is not supported`);
      return;
    }

    try {
      await i18n.changeLanguage(language);
      localStorage.setItem(this.config.storageKey, language);
      
      // Trigger custom event for language change
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language, previousLanguage: this.getCurrentLanguage() }
      }));

      console.debug('Language changed to:', language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }

  translate(key: string, defaultValue?: string, options?: any): string {
    return i18n.t(key, defaultValue, options);
  }

  translateWithNamespace(namespace: string, key: string, defaultValue?: string, options?: any): string {
    return i18n.t(`${namespace}:${key}`, defaultValue, options);
  }

  // Get language-specific formatting options
  getLanguageConfig(language: string = this.getCurrentLanguage()) {
    const configs = {
      ru: {
        dateFormat: 'dd.MM.yyyy',
        timeFormat: 'HH:mm',
        dateTimeFormat: 'dd.MM.yyyy HH:mm',
        numberFormat: {
          decimal: ',',
          thousands: ' ',
          currency: '₽'
        },
        rtl: false
      },
      en: {
        dateFormat: 'MM/dd/yyyy',
        timeFormat: 'h:mm a',
        dateTimeFormat: 'MM/dd/yyyy h:mm a',
        numberFormat: {
          decimal: '.',
          thousands: ',',
          currency: '$'
        },
        rtl: false
      }
    };

    return configs[language as keyof typeof configs] || configs.en;
  }

  // Format number according to current language
  formatNumber(value: number, options: Intl.NumberFormatOptions = {}): string {
    const language = this.getCurrentLanguage();
    return new Intl.NumberFormat(language, options).format(value);
  }

  // Format currency according to current language
  formatCurrency(value: number, currency: string = 'USD'): string {
    const language = this.getCurrentLanguage();
    const config = this.getLanguageConfig(language);
    
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol'
    }).format(value);
  }

  // Format date according to current language
  formatDate(date: Date | string | number, options: Intl.DateTimeFormatOptions = {}): string {
    const language = this.getCurrentLanguage();
    const dateObj = new Date(date);
    
    return new Intl.DateTimeFormat(language, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...options
    }).format(dateObj);
  }

  // Format relative time (e.g., "2 hours ago")
  formatRelativeTime(date: Date | string | number): string {
    const language = this.getCurrentLanguage();
    const dateObj = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  }

  // Check if translations are missing for current language
  getMissingTranslations(namespace: string = this.config.namespace): string[] {
    const currentLang = this.getCurrentLanguage();
    const fallbackLang = this.config.fallbackLanguage;
    
    const currentTranslations = i18n.getResourceBundle(currentLang, namespace) || {};
    const fallbackTranslations = i18n.getResourceBundle(fallbackLang, namespace) || {};
    
    const missing: string[] = [];
    
    const checkMissing = (obj: any, fallbackObj: any, prefix = '') => {
      Object.keys(fallbackObj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof fallbackObj[key] === 'object' && fallbackObj[key] !== null) {
          checkMissing(obj[key] || {}, fallbackObj[key], fullKey);
        } else if (!(key in obj) || obj[key] === '') {
          missing.push(fullKey);
        }
      });
    };
    
    checkMissing(currentTranslations, fallbackTranslations);
    return missing;
  }

  // Add translations dynamically
  addTranslations(language: string, namespace: string, translations: Record<string, any>): void {
    i18n.addResourceBundle(language, namespace, translations, true, true);
  }

  // Get all available translations for debugging
  getAllTranslations(language?: string, namespace?: string): Record<string, any> {
    const lang = language || this.getCurrentLanguage();
    const ns = namespace || this.config.namespace;
    return i18n.getResourceBundle(lang, ns) || {};
  }
}

// Create singleton instance
export const i18nService = I18nService.getInstance();

// Export commonly used functions for convenience
export const t = (key: string, defaultValue?: string, options?: any) => 
  i18nService.translate(key, defaultValue, options);

export const formatCurrency = (value: number, currency?: string) => 
  i18nService.formatCurrency(value, currency);

export const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => 
  i18nService.formatDate(date, options);

export const formatRelativeTime = (date: Date | string | number) => 
  i18nService.formatRelativeTime(date);

export const changeLanguage = (language: string) => 
  i18nService.changeLanguage(language);

export const getCurrentLanguage = () => 
  i18nService.getCurrentLanguage();

export default i18nService;