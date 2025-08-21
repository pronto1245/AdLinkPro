import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load translation files
const localesDir = path.join(__dirname, '..', '..', 'client', 'src', 'locales');
const translations = new Map();

// Load translations on startup
function loadTranslations() {
  try {
    const enPath = path.join(localesDir, 'en.json');
    const ruPath = path.join(localesDir, 'ru.json');
    
    if (fs.existsSync(enPath)) {
      translations.set('en', JSON.parse(fs.readFileSync(enPath, 'utf8')));
    }
    
    if (fs.existsSync(ruPath)) {
      translations.set('ru', JSON.parse(fs.readFileSync(ruPath, 'utf8')));
    }
    
    console.log('Server-side translations loaded:', Array.from(translations.keys()));
  } catch (error) {
    console.error('Failed to load server translations:', error instanceof Error ? error.message : String(error));
  }
}

// Get nested value from translation object
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj);
}

// Translate function
export function translate(key: string, language: string = 'ru', defaultValue?: string): string {
  const translation = translations.get(language);
  if (!translation) {
    return defaultValue || key;
  }
  
  const value = getNestedValue(translation, key);
  if (value !== undefined) {
    return value;
  }
  
  // Fallback to default language (Russian)
  if (language !== 'ru') {
    const fallbackTranslation = translations.get('ru');
    if (fallbackTranslation) {
      const fallbackValue = getNestedValue(fallbackTranslation, key);
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
    }
  }
  
  return defaultValue || key;
}

// Express middleware for i18n
export function i18nMiddleware(req: any, res: any, next: any) {
  // Detect language from Accept-Language header, query param, or default to Russian
  const acceptLanguage = req.headers['accept-language'] || '';
  const queryLang = req.query.lang;
  
  let language = 'ru'; // Default to Russian
  
  if (queryLang && ['en', 'ru'].includes(queryLang)) {
    language = queryLang;
  } else if (acceptLanguage.includes('en')) {
    language = 'en';
  }
  
  // Add translation function to request object
  req.t = (key: string, defaultValue?: string) => translate(key, language, defaultValue);
  req.language = language;
  
  // Add to response locals for template engines
  res.locals.t = req.t;
  res.locals.language = language;
  
  next();
}

// Reload translations (useful for development)
export function reloadTranslations() {
  translations.clear();
  loadTranslations();
}

// Get available languages
export function getAvailableLanguages(): string[] {
  return Array.from(translations.keys());
}

// Get all translations for a language (for client-side initialization)
export function getTranslations(language: string): any {
  return translations.get(language) || {};
}

// Initialize translations on module load
loadTranslations();

// Export the translation map for direct access if needed
export { translations };