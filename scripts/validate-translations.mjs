#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Translation validation and fixing script
 */

function loadTranslation(language) {
  const filePath = join(projectRoot, 'client', 'src', 'locales', `${language}.json`);
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function saveTranslation(language, data) {
  const filePath = join(projectRoot, 'client', 'src', 'locales', `${language}.json`);
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function findMissingKeys(source, target, prefix = '') {
  const missing = [];
  
  for (const key in source) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key] || typeof target[key] !== 'object') {
        missing.push({
          key: currentPath,
          value: source[key],
          type: 'object'
        });
      } else {
        missing.push(...findMissingKeys(source[key], target[key], currentPath));
      }
    } else {
      if (!(key in target) || target[key] === '' || target[key] === null) {
        missing.push({
          key: currentPath,
          value: source[key],
          type: 'string'
        });
      }
    }
  }
  
  return missing;
}

function setDeepValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

function countKeys(obj, prefix = '') {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key], prefix + key + '.');
    } else {
      count++;
    }
  }
  return count;
}

function main() {
  console.log('🌐 Translation Validation and Fixing Script');
  console.log('============================================\n');
  
  try {
    // Load translations
    const ruTranslations = loadTranslation('ru');
    const enTranslations = loadTranslation('en');
    
    console.log(`📊 Translation Statistics:`);
    console.log(`   Russian keys: ${countKeys(ruTranslations)}`);
    console.log(`   English keys: ${countKeys(enTranslations)}`);
    
    // Find missing translations
    const missingInEn = findMissingKeys(ruTranslations, enTranslations);
    const missingInRu = findMissingKeys(enTranslations, ruTranslations);
    
    console.log(`\n🔍 Missing Translations:`);
    console.log(`   Missing in English: ${missingInEn.length}`);
    console.log(`   Missing in Russian: ${missingInRu.length}`);
    
    // Auto-fix missing translations with placeholders
    if (missingInEn.length > 0) {
      console.log(`\n🔧 Fixing English translations...`);
      const updatedEnTranslations = { ...enTranslations };
      
      missingInEn.forEach(({ key, value, type }) => {
        if (type === 'string') {
          // For missing English translations, use the Russian value as placeholder
          // In a real scenario, you'd want to translate these properly
          setDeepValue(updatedEnTranslations, key, `[EN] ${value}`);
          console.log(`   Added: ${key} = "[EN] ${value}"`);
        }
      });
      
      saveTranslation('en', updatedEnTranslations);
    }
    
    if (missingInRu.length > 0) {
      console.log(`\n🔧 Fixing Russian translations...`);
      const updatedRuTranslations = { ...ruTranslations };
      
      missingInRu.forEach(({ key, value, type }) => {
        if (type === 'string') {
          // For missing Russian translations, use the English value as placeholder
          setDeepValue(updatedRuTranslations, key, `[RU] ${value}`);
          console.log(`   Added: ${key} = "[RU] ${value}"`);
        }
      });
      
      saveTranslation('ru', updatedRuTranslations);
    }
    
    if (missingInEn.length === 0 && missingInRu.length === 0) {
      console.log(`\n✅ All translations are complete!`);
    } else {
      console.log(`\n✅ Translation files updated with placeholders.`);
      console.log(`📝 Please review and translate the [EN] and [RU] prefixed entries.`);
    }
    
    // Generate missing translations report
    if (missingInEn.length > 0 || missingInRu.length > 0) {
      const report = {
        generatedAt: new Date().toISOString(),
        summary: {
          totalRussianKeys: countKeys(ruTranslations),
          totalEnglishKeys: countKeys(enTranslations),
          missingInEnglish: missingInEn.length,
          missingInRussian: missingInRu.length
        },
        missingInEnglish: missingInEn.map(m => m.key),
        missingInRussian: missingInRu.map(m => m.key)
      };
      
      writeFileSync(
        join(projectRoot, 'missing_translations_report.json'), 
        JSON.stringify(report, null, 2)
      );
      console.log(`\n📄 Detailed report saved to: missing_translations_report.json`);
    }
    
  } catch (error) {
    console.error('❌ Error validating translations:', error.message);
    process.exit(1);
  }
}

main();