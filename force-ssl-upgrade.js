#!/usr/bin/env node

// Принудительное обновление SSL для arbiconnect.store

import fetch from 'node-fetch';
import fs from 'fs';

async function forceSSLUpgrade() {
  try {
    const token = fs.readFileSync('.current_token', 'utf8').trim();
    
    console.log('🔄 Принудительное обновление SSL для arbiconnect.store...');
    
    const response = await fetch('http://localhost:5000/api/advertiser/profile/domains/94cacae2-3984-4cc2-8ece-86702b4bc4ac/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log('📊 Результат верификации:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Домен успешно верифицирован, SSL должен обновиться автоматически');
    } else {
      console.log('❌ Ошибка верификации:', result.error);
    }
    
    // Проверяем статус домена
    setTimeout(async () => {
      try {
        const statusResponse = await fetch('http://localhost:5000/api/advertiser/profile/domains', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const domains = await statusResponse.json();
        const arbiDomain = domains.find(d => d.domain === 'arbiconnect.store');
        
        if (arbiDomain) {
          console.log('🏠 Статус домена arbiconnect.store:');
          console.log('   - Статус:', arbiDomain.status);
          console.log('   - SSL статус:', arbiDomain.sslStatus);
          console.log('   - SSL издатель:', arbiDomain.sslIssuer);
          console.log('   - Действителен до:', arbiDomain.sslValidUntil);
        }
      } catch (error) {
        console.error('Ошибка проверки статуса:', error.message);
      }
    }, 5000);
    
  } catch (error) {
    console.error('💥 Ошибка:', error.message);
  }
}

forceSSLUpgrade();