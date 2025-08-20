#!/usr/bin/env node

// Скрипт для автоматического обновления SSL сертификатов
// Запускать через cron каждый день

import { scheduledCertificateRenewal } from '../server/services/letsencrypt.js';

async function main() {
  console.log('🔄 Запуск планового обновления SSL сертификатов');
  console.log(`⏰ Время: ${new Date().toISOString()}`);
  
  try {
    await scheduledCertificateRenewal();
    console.log('✅ Обновление сертификатов завершено успешно');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка обновления сертификатов:', error);
    
    // Отправляем уведомление об ошибке (можно добавить email/slack)
    if (process.env.SSL_WEBHOOK_URL) {
      try {
        await fetch(process.env.SSL_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'ssl_renewal_error',
            error: error.message,
            timestamp: new Date().toISOString()
          })
        });
      } catch (webhookError) {
        console.error('Не удалось отправить webhook уведомление:', webhookError);
      }
    }
    
    process.exit(1);
  }
}

main();