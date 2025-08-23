import { Router } from 'express';
import { getTranslations, getAvailableLanguages, translate, reloadTranslations } from '../middleware/i18n.js';

const router = Router();

// Get all translations for a specific language
router.get('/translations/:language', (req, res) => {
  const { language } = req.params;
  const availableLanguages = getAvailableLanguages();
  
  if (!availableLanguages.includes(language)) {
    return res.status(404).json({
      error: 'Language not found',
      availableLanguages
    });
  }
  
  const translations = getTranslations(language);
  
  res.json({
    language,
    translations,
    version: new Date().toISOString() // For cache busting
  });
});

// Get available languages
router.get('/languages', (req, res) => {
  const languages = getAvailableLanguages();
  res.json({
    languages,
    default: 'ru'
  });
});

// Translate a specific key
router.get('/translate/:key', (req, res) => {
  const { key } = req.params;
  const { lang = 'ru' } = req.query;
  
  const translation = translate(key, lang as string);
  
  res.json({
    key,
    language: lang,
    translation
  });
});

// Reload translations (development only)
router.post('/reload', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Only available in development mode' });
  }
  
  try {
    reloadTranslations();
    res.json({ message: 'Translations reloaded successfully' });
  } catch (_) {
    res.status(500).json({ 
      error: 'Failed to reload translations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check for i18n service
router.get('/health', (req, res) => {
  const languages = getAvailableLanguages();
  const isHealthy = languages.length > 0;
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    loadedLanguages: languages,
    timestamp: new Date().toISOString()
  });
});

export default router;