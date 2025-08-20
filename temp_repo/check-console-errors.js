// Скрипт для проверки ошибок в браузерной консоли
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const errors = [];
  
  // Перехватываем все ошибки консоли
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`CONSOLE ERROR: ${msg.text()}`);
    }
  });
  
  // Перехватываем сетевые ошибки
  page.on('response', (response) => {
    if (response.status() >= 400) {
      errors.push(`NETWORK ERROR: ${response.url()} - ${response.status()}`);
    }
  });
  
  try {
    await page.goto('http://localhost:5000');
    await page.waitForTimeout(3000); // Ждём загрузки
    
    // Тестируем различные страницы
    const pages = [
      '/',
      '/login', 
      '/super-admin/dashboard',
      '/advertiser/dashboard',
      '/partner/dashboard'
    ];
    
    for (const path of pages) {
      try {
        await page.goto(`http://localhost:5000${path}`);
        await page.waitForTimeout(2000);
        console.log(`✅ Страница ${path} загружена без критических ошибок`);
      } catch (e) {
        errors.push(`PAGE ERROR: ${path} - ${e.message}`);
      }
    }
    
  } catch (error) {
    errors.push(`GENERAL ERROR: ${error.message}`);
  }
  
  await browser.close();
  
  if (errors.length === 0) {
    console.log('✅ Ошибки в консоли не обнаружены');
  } else {
    console.log('❌ Найдены ошибки:');
    errors.forEach(error => console.log(error));
  }
})();
