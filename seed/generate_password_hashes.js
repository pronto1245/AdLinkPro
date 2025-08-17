#!/usr/bin/env node

/**
 * Helper script для генерации bcrypt хэшей паролей
 * Используется для создания SQL команд для прямой вставки в базу данных
 */

const bcrypt = require('bcrypt');

// Пароли из требований
const passwords = [
  { label: 'Super Admin (77GeoDav=)', password: '77GeoDav=' },
  { label: 'Advertiser (7787877As)', password: '7787877As' },
  { label: 'Affiliate (7787877As)', password: '7787877As' }
];

console.log('🔐 Генерация bcrypt хэшей для паролей...\n');

// Генерируем хэши асинхронно
async function generateHashes() {
  for (const item of passwords) {
    try {
      const hash = await bcrypt.hash(item.password, 10);
      console.log(`${item.label}:`);
      console.log(`  Пароль: ${item.password}`);
      console.log(`  Хэш:    ${hash}`);
      console.log('');
    } catch (error) {
      console.error(`❌ Ошибка генерации хэша для ${item.label}:`, error);
    }
  }
  
  console.log('✅ Генерация завершена!\n');
  console.log('💡 Скопируйте хэши и используйте их в SQL командах для создания пользователей.');
}

generateHashes();