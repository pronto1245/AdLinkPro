// Быстрый скрипт для добавления тестовых креативов в базу
import { db } from './server/db.js';
import { creativeFiles } from './shared/schema.js';

async function addTestCreatives() {
  try {
    // Добавляем несколько тестовых креативов для оффера c35bffb0-89ba-4f69-8faf-eb62b0120acb
    const testCreatives = [
      {
        offerId: 'c35bffb0-89ba-4f69-8faf-eb62b0120acb',
        fileName: 'banner_300x250.jpg',
        originalName: 'Casino Banner 300x250.jpg',
        fileType: 'image',
        mimeType: 'image/jpeg',
        fileSize: 45678,
        filePath: '/fake/path/banner_300x250.jpg',
        publicUrl: 'https://example.com/banner_300x250.jpg',
        dimensions: '300x250',
        description: 'Основной баннер для казино',
        tags: ['banner', 'casino', '300x250'],
        uploadedBy: '0aab3721-0789-49c6-a08c-8dfdfe6f6ab6'
      },
      {
        offerId: 'c35bffb0-89ba-4f69-8faf-eb62b0120acb',
        fileName: 'promo_video.mp4',
        originalName: 'Casino Promo Video.mp4',
        fileType: 'video',
        mimeType: 'video/mp4',
        fileSize: 2456789,
        filePath: '/fake/path/promo_video.mp4',
        publicUrl: 'https://example.com/promo_video.mp4',
        dimensions: '1920x1080',
        duration: 30,
        description: 'Промо-видео для казино (30 сек)',
        tags: ['video', 'promo', 'casino'],
        uploadedBy: '0aab3721-0789-49c6-a08c-8dfdfe6f6ab6'
      }
    ];

    for (const creative of testCreatives) {
      const result = await db.insert(creativeFiles).values(creative).returning();
      console.log('Добавлен креатив:', result[0].fileName);
    }

    console.log('✓ Тестовые креативы добавлены');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка добавления креативов:', error);
    process.exit(1);
  }
}

addTestCreatives();