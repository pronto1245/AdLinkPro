#!/usr/bin/env node

/**
 * Скрипт мониторинга DNS и автоматического запуска SSL
 * Проверяет когда домен setbet-arbit.ru начнет возвращать наш ACME handler
 * и автоматически запускает выдачу SSL сертификата
 */

const http = require('http');

const DOMAIN = 'setbet-arbit.ru';
const TEST_PATH = '/.well-known/acme-challenge/test-new';
const EXPECTED_RESPONSE = 'test-file-1754911014';
const CHECK_INTERVAL = 30000; // 30 секунд
const MAX_ATTEMPTS = 120; // 60 минут общего времени

let attempts = 0;

function checkDNSAndTriggerSSL() {
  attempts++;
  
  console.log(`🔍 Проверка ${attempts}/${MAX_ATTEMPTS}: Тестируем DNS для ${DOMAIN}...`);
  
  const options = {
    hostname: DOMAIN,
    port: 80,
    path: TEST_PATH,
    method: 'GET',
    timeout: 10000
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📡 Ответ с ${DOMAIN}: "${data.trim()}"`);
      
      if (data.trim() === EXPECTED_RESPONSE) {
        console.log(`🎉 DNS ОБНОВИЛСЯ! Домен ${DOMAIN} теперь указывает на наш сервер!`);
        console.log(`🔒 Запускаем выдачу SSL сертификата...`);
        
        // Запускаем curl для активации SSL
        const { spawn } = require('child_process');
        const curl = spawn('curl', [
          '-X', 'POST',
          '-H', 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          'http://localhost:5000/api/advertiser/profile/domains/a032b338-cc91-4756-ae8d-fb564be9653e/ssl'
        ]);
        
        curl.on('close', (code) => {
          console.log(`✅ SSL процесс запущен (код: ${code})`);
          console.log(`⏳ Ждите 2-3 минуты для выдачи сертификата...`);
          process.exit(0);
        });
        
        return;
      }
      
      if (attempts >= MAX_ATTEMPTS) {
        console.log(`❌ DNS не обновился за ${MAX_ATTEMPTS} попыток. Проверьте настройки DNS.`);
        process.exit(1);
      }
      
      console.log(`⏳ DNS еще не обновился. Следующая проверка через 30 секунд...`);
      setTimeout(checkDNSAndTriggerSSL, CHECK_INTERVAL);
    });
  });

  req.on('error', (err) => {
    console.log(`⚠️ Ошибка подключения к ${DOMAIN}: ${err.message}`);
    
    if (attempts >= MAX_ATTEMPTS) {
      console.log(`❌ DNS не обновился за ${MAX_ATTEMPTS} попыток.`);
      process.exit(1);
    }
    
    console.log(`⏳ Повторная проверка через 30 секунд...`);
    setTimeout(checkDNSAndTriggerSSL, CHECK_INTERVAL);
  });

  req.on('timeout', () => {
    console.log(`⏱️ Таймаут подключения к ${DOMAIN}`);
    req.destroy();
    
    if (attempts >= MAX_ATTEMPTS) {
      console.log(`❌ DNS не обновился за ${MAX_ATTEMPTS} попыток.`);
      process.exit(1);
    }
    
    setTimeout(checkDNSAndTriggerSSL, CHECK_INTERVAL);
  });

  req.end();
}

console.log(`🚀 Запуск мониторинга DNS для ${DOMAIN}`);
console.log(`📡 Ждем когда домен начнет возвращать: "${EXPECTED_RESPONSE}"`);
console.log(`⏰ Проверка каждые ${CHECK_INTERVAL/1000} секунд, максимум ${MAX_ATTEMPTS} попыток`);

checkDNSAndTriggerSSL();