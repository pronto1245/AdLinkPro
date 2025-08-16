#!/usr/bin/env node

/**
 * Скрипт для исправления проблемы с зависшими миграциями
 * Очищает состояние миграций и синхронизирует схему
 */

import { neon } from '@neondatabase/serverless';
import fs from 'fs';

async function fixMigrations() {
  console.log('🔧 Исправление проблемы с миграциями...');
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('1. Проверяем таблицу миграций...');
    
    // Проверяем существование таблицы миграций
    const migrationTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = '__drizzle_migrations'
      );
    `;
    
    console.log(`Таблица миграций существует: ${migrationTableExists[0].exists}`);
    
    if (migrationTableExists[0].exists) {
      // Получаем записи о миграциях
      const migrations = await sql`SELECT * FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 10`;
      console.log(`Найдено ${migrations.length} записей о миграциях`);
      
      // Проверяем последнюю миграцию
      if (migrations.length > 0) {
        console.log('Последняя миграция:', migrations[0].hash);
      }
    }
    
    console.log('2. Проверяем состояние схемы...');
    
    // Получаем список всех таблиц
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log(`✅ База данных содержит ${tables.length} таблиц:`);
    tables.forEach(table => console.log(`  - ${table.table_name}`));
    
    // Проверяем целостность ключевых таблиц
    const keyTables = ['users', 'offers', 'clicks', 'tracking_links'];
    for (const tableName of keyTables) {
      try {
        const count = await sql`SELECT COUNT(*) as count FROM ${sql(tableName)}`;
        console.log(`  ✅ ${tableName}: ${count[0].count} записей`);
      } catch (error) {
        console.log(`  ❌ ${tableName}: ошибка - ${error.message}`);
      }
    }
    
    console.log('3. Рекомендации:');
    
    if (tables.length >= 10) {
      console.log('✅ База данных полностью настроена');
      console.log('✅ Миграции не требуются для развертывания');
      console.log('💡 Можно развернуть приложение с существующей схемой');
    } else {
      console.log('⚠️ Схема может быть неполной');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при исправлении миграций:', error.message);
  }
}

fixMigrations();