#!/usr/bin/env node

const http = require('http');

function checkDNS() {
  console.log('🔍 Проверяем setbet-arbit.ru...');
  
  const options = {
    hostname: 'setbet-arbit.ru',
    port: 80,
    path: '/.well-known/acme-challenge/test-new',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const expected = 'test-file-1754911014';
      if (data.trim() === expected) {
        console.log('🎉 DNS ОБНОВИЛСЯ! Запускаем SSL...');
        process.exit(0);
      } else {
        console.log(`⏳ DNS не готов. Получено: "${data.trim().substring(0, 30)}..."`);
      }
    });
  });

  req.on('error', (err) => {
    console.log(`⚠️ Ошибка: ${err.message}`);
  });

  req.on('timeout', () => {
    console.log('⏱️ Таймаут');
    req.destroy();
  });

  req.end();
}

console.log('🚀 Простая проверка DNS для setbet-arbit.ru');
checkDNS();