#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

/**
 * Clean up dead translation and i18n related files
 */

const filesToRemove = [
  // Backup files
  'client/src/lib/i18n.ts.backup',
  'client/src/lib/i18n_backup.ts',
  
  // Old translation files
  'client/public/locales/ru/translation.json',
  
  // Debug files  
  'client/src/debug_i18n.js',
  'missing_translations.txt',
  'missing_translations_report.json',
  
  // Any other backup files
  'client/src/locales/en.json.backup',
  'client/src/locales/ru.json.backup',
  'client/src/locales/en.json.bak',
  'client/src/locales/ru.json.bak'
];

const directoriesToCheck = [
  'client/public/locales',
  'client/src/lib/i18n-old',
  'client/src/translations-backup'
];

function cleanupFiles() {
  console.log('🧹 Cleaning up dead translation files...\n');
  
  let removedCount = 0;
  
  // Remove specific files
  filesToRemove.forEach(relativePath => {
    const fullPath = path.join(projectRoot, relativePath);
    
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`✅ Removed: ${relativePath}`);
        removedCount++;
      } catch (error) {
        console.error(`❌ Failed to remove ${relativePath}:`, error.message);
      }
    }
  });
  
  // Remove empty directories
  directoriesToCheck.forEach(relativePath => {
    const fullPath = path.join(projectRoot, relativePath);
    
    if (fs.existsSync(fullPath)) {
      try {
        const files = fs.readdirSync(fullPath);
        if (files.length === 0) {
          fs.rmdirSync(fullPath);
          console.log(`✅ Removed empty directory: ${relativePath}`);
          removedCount++;
        } else {
          console.log(`ℹ️  Directory not empty, skipping: ${relativePath}`);
        }
      } catch (error) {
        console.error(`❌ Failed to check/remove directory ${relativePath}:`, error.message);
      }
    }
  });
  
  console.log(`\n📊 Cleanup Summary:`);
  console.log(`   Files/directories removed: ${removedCount}`);
  console.log(`   Current translation files:`);
  console.log(`   ├── client/src/locales/en.json`);
  console.log(`   ├── client/src/locales/ru.json`);
  console.log(`   └── client/src/services/i18n.ts`);
  
  if (removedCount === 0) {
    console.log(`✨ No cleanup needed - all translation files are already clean!`);
  } else {
    console.log(`✨ Cleanup completed successfully!`);
  }
}

cleanupFiles();