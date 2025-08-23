#!/usr/bin/env tsx
/**
 * Скрипт для ручной выдачи SSL сертификата
 * Использование: npm run ssl:issue setbet-arbit.ru
 */

import { LetsEncryptService } from '../services/letsencrypt.js';
import { db } from '../db.js';
import { customDomains } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

async function issueCertificateForDomain(domain: string) {
  try {
    console.log(`🚀 Начинаем выдачу SSL сертификата для домена: ${domain}`);
    
    // Находим домен в базе
    const [domainRecord] = await db
      .select()
      .from(customDomains)
      .where(eq(customDomains.domain, domain))
      .limit(1);
    
    if (!domainRecord) {
      throw new Error(`Домен ${domain} не найден в базе данных`);
    }
    
    if (domainRecord.status !== 'verified') {
      throw new Error(`Домен ${domain} не верифицирован. Статус: ${domainRecord.status}`);
    }
    
    console.log(`✅ Домен найден в базе. ID: ${domainRecord.id}`);
    
    // Выдаем SSL сертификат
    const result = await LetsEncryptService.issueCertificate(domain, domainRecord.id);
    
    if (result.success) {
      console.log(`🎉 SSL сертификат успешно выдан для ${domain}!`);
      console.log(`📋 Сертификат действителен до: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()}`);
    } else {
      console.error(`❌ Ошибка выдачи SSL: ${result.error}`);
      process.exit(1);
    }
    
  } catch (_) {
    console.error('❌ Критическая ошибка:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Получаем домен из аргументов командной строки
const domain = process.argv[2];

if (!domain) {
  console.error('❌ Укажите домен для выдачи SSL сертификата');
  console.log('Использование: npm run ssl:issue <domain>');
  console.log('Пример: npm run ssl:issue setbet-arbit.ru');
  process.exit(1);
}

// Запускаем процесс
issueCertificateForDomain(domain)
  .then(() => {
    console.log('✅ Скрипт завершен успешно');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Скрипт завершен с ошибкой:', error);
    process.exit(1);
  });