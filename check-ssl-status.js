#!/usr/bin/env node

// Быстрая проверка SSL статуса
import { db } from './server/db.js';
import { customDomains } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function checkSSLStatus() {
  try {
    console.log('🔍 Проверяем SSL статус в базе данных...');
    
    const domain = await db
      .select()
      .from(customDomains)
      .where(eq(customDomains.domain, 'setbet-arbit.ru'))
      .limit(1);
    
    if (domain.length === 0) {
      console.log('❌ Домен не найден в базе');
      return;
    }
    
    const d = domain[0];
    console.log('📊 Текущий статус:');
    console.log(`   Домен: ${d.domain}`);
    console.log(`   Статус: ${d.status}`);
    console.log(`   SSL Статус: ${d.sslStatus}`);
    console.log(`   SSL Эмитент: ${d.sslIssuer || 'не установлен'}`);
    console.log(`   Действует до: ${d.sslValidUntil || 'не установлен'}`);
    console.log(`   Ошибка: ${d.sslErrorMessage || 'нет'}`);
    console.log(`   Активен: ${d.isActive}`);
    console.log(`   Обновлен: ${d.updatedAt}`);
    
    // Проверяем, нужно ли обновить статус
    if (d.sslStatus === 'pending') {
      console.log('');
      console.log('⚠️ SSL статус "pending" - возможно процесс завис');
      console.log('💡 Рекомендуется перезапустить процесс выдачи SSL');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  process.exit(0);
}

checkSSLStatus();