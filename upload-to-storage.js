// Скрипт для загрузки файла в Object Storage
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadFileToStorage() {
  try {
    // 1. Получаем upload URL
    const uploadResponse = await fetch('http://localhost:5000/api/objects/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Failed to get upload URL: ${uploadResponse.status}`);
    }
    
    const { uploadURL } = await uploadResponse.json();
    console.log('✅ Upload URL получен:', uploadURL);
    
    // 2. Читаем файл
    const filePath = path.join(__dirname, 'public', 'test-site.html');
    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не найден: ${filePath}`);
    }
    
    const fileContent = fs.readFileSync(filePath);
    console.log('✅ Файл прочитан, размер:', fileContent.length, 'байт');
    
    // 3. Загружаем файл
    const uploadFileResponse = await fetch(uploadURL, {
      method: 'PUT',
      body: fileContent,
      headers: {
        'Content-Type': 'text/html'
      }
    });
    
    if (!uploadFileResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadFileResponse.status}`);
    }
    
    console.log('✅ Файл успешно загружен в Object Storage!');
    console.log('🌐 URL файла:', uploadURL.split('?')[0]);
    
    // 4. Устанавливаем ACL как публичный файл
    const normalizedPath = uploadURL.split('?')[0].replace(/^https:\/\/[^\/]+/, '');
    console.log('📄 Нормализованный путь:', normalizedPath);
    
    return uploadURL;
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    return null;
  }
}

// Запускаем только если файл вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  uploadFileToStorage();
}

export { uploadFileToStorage };