#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Automated translation completion script
 * Replaces placeholders with proper translations
 */

const translations = {
  'en': {
    // Auth translations
    'login': 'Sign In',
    'username': 'Username', 
    'email': 'Email',
    'password': 'Password',
    'sign_in': 'Sign In',
    
    // Sidebar translations
    'sidebar.systemSettings': 'System Settings',
    'sidebar.support': 'Support',
    'sidebar.myOffersDesc': 'Offer Management',
    'sidebar.receivedOffers': 'Received Offers',
    'sidebar.receivedOffersDesc': 'Offers from Suppliers',
    'sidebar.partners': 'Partners',
    'sidebar.partnersDesc': 'Partner Management',
    'sidebar.accessRequests': 'Access Requests',
    'sidebar.accessRequestsDesc': 'Process partner access requests to offers',
    'sidebar.finances': 'Finances',
    'sidebar.financesDesc': 'Financial Operations',
    'sidebar.teamMode': 'Team Mode',
    'sidebar.teamModeDesc': 'Team management and access rights',
    'sidebar.antifraud': 'Anti-fraud',
    'sidebar.antifraudDesc': 'Fraud traffic protection system',
    'sidebar.analytics': 'Analytics',
    'sidebar.analyticsDesc': 'Detailed analytics and reports',
    'sidebar.postbacks': 'Postbacks',
    'sidebar.postbacksDesc': 'Tracker integration settings',
    'sidebar.profile': 'Profile',
    'sidebar.profileDesc': 'Profile Settings',
    'sidebar.documents': 'Documents',
    'sidebar.documentsDesc': 'Document Management',
    
    // Users translations
    'users.editUser': 'Edit User',
    'users.deleteUser': 'Delete User',
    'users.username': 'Username',
    'users.role': 'Role',
    'users.userType': 'Type',
    'users.accountName': 'Account Name',
    'users.registrationDate': 'Registration Date',
    'users.lastLogin': 'Last Login',
    'users.linkedAdvertiser': 'Linked Advertiser',
    'users.actions': 'Actions',
    'users.administrator': 'Administrator',
    
    // Creatives translations
    'creatives.subtitle': 'Banners, landing pages, pre-landings and text materials for your campaigns',
    'creatives.searchPlaceholder': 'Search creatives...',
    'creatives.allTypes': 'All Types',
    'creatives.banner': 'Banners',
    'creatives.prelanding': 'Pre-landings',
    'creatives.text': 'Text Materials',
    'creatives.video': 'Video',
    'creatives.bannerType': 'Banner',
    'creatives.landingType': 'Landing',
    'creatives.prelandingType': 'Pre-landing',
    'creatives.textType': 'Text',
    'creatives.videoType': 'Video',
    
    // Auth extended
    'auth.loginSubtitle': 'Enter your credentials to sign in',
    'auth.register': 'Register',
    'auth.registerSubtitle': 'Create a new account',
    'auth.confirmPassword': 'Confirm Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.company': 'Company',
    'auth.phone': 'Phone',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.noAccount': 'No account?',
    'auth.loginHere': 'Sign in here',
    'auth.registerHere': 'Register here'
  },
  'ru': {
    'auth.sign_in': 'Войти',
    'creatives.banners': 'Баннеры'
  }
};

function loadTranslation(language) {
  const filePath = join(projectRoot, 'client', 'src', 'locales', `${language}.json`);
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function saveTranslation(language, data) {
  const filePath = join(projectRoot, 'client', 'src', 'locales', `${language}.json`);
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
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

function getDeepValue(obj, path) {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (!current || typeof current !== 'object' || !(key in current)) {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
}

function fixPlaceholders(data, language) {
  const fixedData = JSON.parse(JSON.stringify(data));
  const translationsForLang = translations[language] || {};
  let fixedCount = 0;
  
  function traverseAndFix(obj, prefix = '') {
    for (const key in obj) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        traverseAndFix(obj[key], fullPath);
      } else if (typeof obj[key] === 'string') {
        // Check if it's a placeholder
        if (obj[key].startsWith(`[${language.toUpperCase()}] `)) {
          // Try to find a proper translation
          if (translationsForLang[fullPath]) {
            obj[key] = translationsForLang[fullPath];
            console.log(`   Fixed: ${fullPath} = "${translationsForLang[fullPath]}"`);
            fixedCount++;
          }
        }
      }
    }
  }
  
  traverseAndFix(fixedData);
  return { data: fixedData, fixedCount };
}

function main() {
  console.log('🔧 Translation Completion Script');
  console.log('================================\n');
  
  try {
    // Load and fix English translations
    console.log('📝 Fixing English translations...');
    const enData = loadTranslation('en');
    const { data: fixedEnData, fixedCount: enFixed } = fixPlaceholders(enData, 'en');
    
    if (enFixed > 0) {
      saveTranslation('en', fixedEnData);
      console.log(`✅ Fixed ${enFixed} English translations`);
    } else {
      console.log('ℹ️ No English translations to fix');
    }
    
    // Load and fix Russian translations
    console.log('\n📝 Fixing Russian translations...');
    const ruData = loadTranslation('ru');
    const { data: fixedRuData, fixedCount: ruFixed } = fixPlaceholders(ruData, 'ru');
    
    if (ruFixed > 0) {
      saveTranslation('ru', fixedRuData);
      console.log(`✅ Fixed ${ruFixed} Russian translations`);
    } else {
      console.log('ℹ️ No Russian translations to fix');
    }
    
    console.log('\n✨ Translation completion finished!');
    
  } catch (error) {
    console.error('❌ Error completing translations:', error.message);
    process.exit(1);
  }
}

main();