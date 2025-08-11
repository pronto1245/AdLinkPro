import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// DATABASE_URL проверяется автоматически при подключении к PostgreSQL
// В Replit DATABASE_URL устанавливается автоматически при создании PostgreSQL сервиса

// Оптимизированное подключение к БД с пулингом
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // максимум соединений в пуле
  idleTimeoutMillis: 30000, // таймаут неактивных соединений
  connectionTimeoutMillis: 10000, // таймаут подключения
});

export const db = drizzle({ client: pool, schema });

// Простое кеширование для часто используемых запросов
export class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  set(key: string, data: any, ttlMs: number = 300000): void { // 5 минут по умолчанию
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const queryCache = new QueryCache();