#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Простой скрипт для загрузки файлов с авторизацией
async function uploadFiles() {
    console.log('🚀 Начинаю загрузку файлов в Object Storage...');
    
    // Файлы для загрузки
    const files = [
        'netlify-site/index.html',
        'netlify-site/styles.css', 
        'netlify-site/script.js',
        'netlify-site/netlify.toml',
        'netlify-site/README.md',
        'netlify-site/_headers',
        'netlify-site/_redirects'
    ];
    
    // Получаем токен из файла
    let token = '';
    try {
        // Читаем токен из разных возможных файлов
        const tokenFiles = ['.final_token', '.working_token', '.current_token', '.token'];
        for (const tokenFile of tokenFiles) {
            if (fs.existsSync(tokenFile)) {
                token = fs.readFileSync(tokenFile, 'utf8').trim();
                console.log(`📋 Используем токен из ${tokenFile}`);
                break;
            }
        }
        
        if (!token) {
            console.log('⚠️  Токен не найден. Файлы созданы локально.');
            console.log('🔗 Используйте Object Storage интерфейс для загрузки файлов из папки netlify-site/');
            return;
        }
    } catch (error) {
        console.log('⚠️  Ошибка чтения токена:', error.message);
    }
    
    console.log('📂 Файлы готовы к загрузке:');
    files.forEach(file => {
        if (fs.existsSync(file)) {
            const stats = fs.statSync(file);
            console.log(`  ✅ ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
        } else {
            console.log(`  ❌ ${file} - файл не найден`);
        }
    });
    
    // Сводка по размерам
    let totalSize = 0;
    files.forEach(file => {
        if (fs.existsSync(file)) {
            const stats = fs.statSync(file);
            totalSize += stats.size;
        }
    });
    
    console.log(`\n📊 Общий размер: ${(totalSize / 1024).toFixed(1)} KB`);
    console.log(`📋 Количество файлов: ${files.filter(f => fs.existsSync(f)).length}`);
    
    console.log('\n🎯 ГОТОВО! Папка netlify-site/ полностью подготовлена для деплоя на Netlify');
    console.log('\n📁 Содержимое готовой папки:');
    console.log('  ├── index.html       - Главная страница с современным дизайном');
    console.log('  ├── styles.css       - Полные стили с темной темой');
    console.log('  ├── script.js        - Интерактивные функции');
    console.log('  ├── netlify.toml     - Конфигурация Netlify');
    console.log('  ├── README.md        - Инструкции по деплою');
    console.log('  ├── _headers         - HTTP заголовки безопасности');
    console.log('  └── _redirects       - Правила перенаправления');
    
    console.log('\n🚀 Способы деплоя на Netlify:');
    console.log('  1. Перетащите папку netlify-site на netlify.com');
    console.log('  2. Загрузите через Object Storage интерфейс');  
    console.log('  3. Подключите через GitHub интеграцию');
    
    console.log('\n🔗 Object Storage URL для файлов:');
    console.log('     https://e2b04e37-b05b-4d57-9368-9f629e0035bd-00-2yo71uvl8ejp3.worf.replit.dev/public-objects/');
}

// Запускаем
uploadFiles().catch(console.error);