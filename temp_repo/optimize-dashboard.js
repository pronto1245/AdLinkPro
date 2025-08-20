#!/usr/bin/env node

/**
 * Скрипт для оптимизации производительности дашборда
 * Проверяет время загрузки метрик и статистики
 */

const API_BASE = 'http://localhost:5000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBhYWIzNzIxLTA3ODktNDljNi1hMDhjLThkZmRmZTZmNmFiNiIsInVzZXJuYW1lIjoiYWR2ZXJ0aXNlcjEiLCJyb2xlIjoiYWR2ZXJ0aXNlciIsImFkdmVydGlzZXJJZCI6bnVsbCwiaWF0IjoxNzU0OTA0MjExLCJleHAiOjE3NTQ5OTA2MTF9.tKn8vP2kNR-XoN3yF3A10bxYsF4vMNKOF5l6H1E2nYY';

async function testPerformance() {
  console.log('🚀 Тестируем производительность дашборда...\n');

  const endpoints = [
    '/api/advertiser/dashboard-metrics',
    '/api/advertiser/live-statistics',
    '/api/notifications',
    '/api/advertiser/offers'
  ];

  for (const endpoint of endpoints) {
    const start = Date.now();
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      
      const end = Date.now();
      const loadTime = end - start;
      
      if (response.ok) {
        const data = await response.json();
        const dataSize = JSON.stringify(data).length;
        
        console.log(`✅ ${endpoint}`);
        console.log(`   Время загрузки: ${loadTime}ms`);
        console.log(`   Размер данных: ${(dataSize / 1024).toFixed(2)}KB`);
        
        if (loadTime > 100) {
          console.log(`   ⚠️ МЕДЛЕННО: ${loadTime}ms > 100ms`);
        }
        console.log('');
      } else {
        console.log(`❌ ${endpoint} - ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Ошибка: ${error.message}`);
    }
  }
}

testPerformance().catch(console.error);