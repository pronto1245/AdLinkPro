import { db } from '../db';
import { creativeFiles, creativeSets, creativeSetFiles } from '../../shared/schema';
import { offers } from '../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import archiver from 'archiver';
import { Response } from 'express';
import { randomUUID } from 'crypto';

export class CreativeService {
  // Получить все креативы для оффера
  async getOfferCreatives(offerId: string) {
    const creativesData = await db
      .select()
      .from(creativeFiles)
      .where(and(
        eq(creativeFiles.offerId, offerId),
        eq(creativeFiles.isActive, true)
      ))
      .orderBy(desc(creativeFiles.createdAt));

    return creativesData;
  }

  // Сохранить информацию о загруженном файле
  async saveCreativeFile(data: {
    offerId: string;
    fileName: string;
    originalName: string;
    fileType: string;
    mimeType: string;
    fileSize: number;
    filePath: string;
    publicUrl?: string;
    dimensions?: string;
    duration?: number;
    description?: string;
    tags?: string[];
    uploadedBy: string;
  }) {
    const [file] = await db
      .insert(creativeFiles)
      .values({
        offerId: data.offerId,
        fileName: data.fileName,
        originalName: data.originalName,
        fileType: data.fileType,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        filePath: data.filePath,
        publicUrl: data.publicUrl,
        dimensions: data.dimensions,
        duration: data.duration,
        description: data.description,
        tags: data.tags || [],
        uploadedBy: data.uploadedBy,
        isActive: true
      })
      .returning();

    return file;
  }

  // Создать набор креативов
  async createCreativeSet(data: {
    offerId: string;
    name: string;
    description?: string;
    version?: string;
    isDefault?: boolean;
    createdBy: string;
  }) {
    const [set] = await db
      .insert(creativeSets)
      .values({
        id: randomUUID(),
        ...data,
      })
      .returning();

    return set;
  }

  // Добавить файл в набор
  async addFileToSet(setId: string, fileId: string, displayOrder = 0) {
    const [relation] = await db
      .insert(creativeSetFiles)
      .values({
        id: randomUUID(),
        setId,
        fileId,
        displayOrder,
      })
      .returning();

    return relation;
  }

  // Создать ZIP архив с креативами для скачивания
  async createCreativeArchive(offerId: string, res: Response) {
    const creatives = await this.getOfferCreatives(offerId);

    if (creatives.length === 0) {
      throw new Error('Креативы не найдены');
    }

    // Получаем информацию об оффере
    const [offer] = await db
      .select()
      .from(offers)
      .where(eq(offers.id, offerId));

    if (!offer) {
      throw new Error('Оффер не найден');
    }

    // Устанавливаем заголовки для ZIP
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="creatives-${offer.name}-${offerId}.zip"`);

    // Создаем ZIP архив
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('error', (err: any) => {
      console.error('Archive error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Ошибка при создании архива' });
      }
    });

    archive.pipe(res);

    // Группируем файлы по типам (исправляем доступ к свойствам)
    const imageFiles = creatives.filter(c => c.fileType && c.fileType.startsWith('image'));
    const videoFiles = creatives.filter(c => c.fileType && c.fileType.startsWith('video'));
    const documentFiles = creatives.filter(c => c.fileType && c.fileType.includes('document'));

    // Создаем README файл
    const readmeContent = `CREATIVE PACK FOR ${offer.name}
Offer ID: ${offerId}
Generated: ${new Date().toISOString()}

СОДЕРЖИМОЕ АРХИВА:
- ${imageFiles.length} изображений
- ${videoFiles.length} видео
- ${documentFiles.length} документов

СТРУКТУРА ПАПОК:
/images/ - баннеры, логотипы, изображения
/videos/ - видео-креативы, анимации
/documents/ - инструкции, брендбуки, спецификации

ИСПОЛЬЗОВАНИЕ:
1. Все материалы готовы к использованию
2. Соблюдайте брендинг-гайдлайны
3. Тестируйте креативы перед запуском кампаний
4. При вопросах обращайтесь к рекламодателю

Контакты: support@platform.com`;

    archive.append(readmeContent, { name: 'README.txt' });

    // Для демонстрации добавляем описания файлов
    // В реальной системе здесь будут настоящие файлы из object storage
    imageFiles.forEach((creative, index) => {
      const fileInfo = `Файл: ${creative.originalName}
Тип: ${creative.mimeType}
Размер: ${creative.fileSize} байт
Разрешение: ${creative.dimensions || 'Не указано'}
Описание: ${creative.description || 'Без описания'}
Теги: ${creative.tags?.join(', ') || 'Нет тегов'}
Загружен: ${creative.createdAt}

ДЕМО: В реальной системе здесь будет файл изображения.
Для получения оригинального файла используйте путь: ${creative.filePath}`;

      archive.append(fileInfo, { name: `images/${creative.originalName}.info.txt` });
    });

    videoFiles.forEach((creative, index) => {
      const fileInfo = `Файл: ${creative.originalName}
Тип: ${creative.mimeType}
Размер: ${creative.fileSize} байт
Разрешение: ${creative.dimensions || 'Не указано'}
Длительность: ${creative.duration ? `${creative.duration} секунд` : 'Не указано'}
Описание: ${creative.description || 'Без описания'}
Теги: ${creative.tags?.join(', ') || 'Нет тегов'}
Загружен: ${creative.createdAt}

ДЕМО: В реальной системе здесь будет видео файл.
Для получения оригинального файла используйте путь: ${creative.filePath}`;

      archive.append(fileInfo, { name: `videos/${creative.originalName}.info.txt` });
    });

    documentFiles.forEach((creative, index) => {
      const fileInfo = `Файл: ${creative.originalName}
Тип: ${creative.mimeType}
Размер: ${creative.fileSize} байт
Описание: ${creative.description || 'Без описания'}
Теги: ${creative.tags?.join(', ') || 'Нет тегов'}
Загружен: ${creative.createdAt}

ДЕМО: В реальной системе здесь будет документ.
Для получения оригинального файла используйте путь: ${creative.filePath}`;

      archive.append(fileInfo, { name: `documents/${creative.originalName}.info.txt` });
    });

    // Обновляем счетчик скачиваний
    await this.incrementDownloadCount(offerId);

    archive.finalize();
  }

  // Увеличить счетчик скачиваний
  async incrementDownloadCount(offerId: string) {
    await db
      .update(creativeSets)
      .set({
        downloadCount: sql`${creativeSets.downloadCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(creativeSets.offerId, offerId));
  }

  // Получить статистику по креативам
  async getCreativeStats(offerId: string) {
    const stats = await db
      .select({
        totalFiles: sql<number>`count(*)`,
        totalSize: sql<number>`sum(${creativeFiles.fileSize})`,
        imageCount: sql<number>`count(*) filter (where ${creativeFiles.fileType} = 'image')`,
        videoCount: sql<number>`count(*) filter (where ${creativeFiles.fileType} = 'video')`,
        documentCount: sql<number>`count(*) filter (where ${creativeFiles.fileType} = 'document')`,
      })
      .from(creativeFiles)
      .where(and(
        eq(creativeFiles.offerId, offerId),
        eq(creativeFiles.isActive, true)
      ));

    return stats[0];
  }
}
