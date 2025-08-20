#!/usr/bin/env node

// Скрипт для принудительного обновления SSL сертификата arbiconnect.store на реальный Let's Encrypt

import { LetsEncryptService } from './server/services/letsencrypt.js';

async function upgradeSSL() {
  try {
    console.log('🔄 Инициализируем Let\'s Encrypt для arbiconnect.store...');
    
    // Инициализируем сервис
    await LetsEncryptService.initialize();
    
    console.log('🔒 Запускаем выдачу реального SSL сертификата...');
    
    // Запускаем выдачу реального сертификата
    const result = await LetsEncryptService.issueRealCertificate(
      'arbiconnect.store',
      '94cacae2-3984-4cc2-8ece-86702b4bc4ac'
    );
    
    if (result.success) {
      console.log('✅ Реальный SSL сертификат успешно выдан!');
      console.log('🔐 Сертификат от:', result.issuer);
      console.log('📅 Действителен до:', result.validUntil);
    } else {
      console.log('❌ Ошибка выдачи SSL:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error.message);
  }
}

// Запускаем только если вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  upgradeSSL();
}