import acme from 'acme-client';
import crypto from 'crypto';
import { db } from '../db.js';
import { customDomains } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

export class LetsEncryptService {
  private static client: acme.Client | null = null;
  private static accountKey: Buffer | null = null;

  // Инициализация ACME клиента
  static async initializeClient(): Promise<void> {
    try {
      // Генерируем ключ аккаунта или загружаем существующий
      this.accountKey = await this.getOrCreateAccountKey();
      
      // Создаем ACME клиент (staging для тестов, production для реальных сертификатов)
      const directoryUrl = process.env.NODE_ENV === 'production' 
        ? acme.directory.letsencrypt.production
        : acme.directory.letsencrypt.staging;

      this.client = new acme.Client({
        directoryUrl,
        accountKey: this.accountKey
      });

      // Создаем аккаунт если его нет
      await this.createAccount();
      
      console.log('✅ Let\'s Encrypt ACME клиент инициализирован');
    } catch (error) {
      console.error('❌ Ошибка инициализации Let\'s Encrypt:', error);
      throw error;
    }
  }

  // Получаем или создаем ключ аккаунта
  private static async getOrCreateAccountKey(): Promise<Buffer> {
    const keyPath = process.env.LETSENCRYPT_ACCOUNT_KEY_PATH || './.letsencrypt/account.key';
    
    try {
      const fs = await import('fs/promises');
      return await fs.readFile(keyPath);
    } catch (error) {
      // Файл не существует, создаем новый ключ
      const accountKey = await acme.crypto.createPrivateKey();
      
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        await fs.mkdir(path.dirname(keyPath), { recursive: true });
        await fs.writeFile(keyPath, accountKey);
      } catch (writeError) {
        console.warn('Не удалось сохранить ключ аккаунта:', writeError);
      }
      
      return accountKey;
    }
  }

  // Создаем аккаунт Let's Encrypt
  private static async createAccount(): Promise<void> {
    if (!this.client) throw new Error('ACME клиент не инициализирован');

    try {
      await this.client.createAccount({
        termsOfServiceAgreed: true,
        contact: [
          `mailto:${process.env.LETSENCRYPT_CONTACT_EMAIL || 'admin@your-domain.com'}`
        ]
      });
      console.log('✅ Let\'s Encrypt аккаунт создан/подтвержден');
    } catch (error) {
      if (error.type === 'urn:ietf:params:acme:error:accountDoesNotExist') {
        console.log('ℹ️ Аккаунт уже существует');
      } else {
        throw error;
      }
    }
  }

  // Выдача реального SSL сертификата
  static async issueRealCertificate(domain: string, domainId: string): Promise<{
    success: boolean;
    certificate?: string;
    privateKey?: string;
    error?: string;
  }> {
    try {
      if (!this.client) {
        await this.initializeClient();
      }

      console.log(`🔒 Начинаем выдачу реального SSL сертификата для ${domain}`);

      // Обновляем статус на "выдается"
      await db
        .update(customDomains)
        .set({
          sslStatus: 'pending',
          sslErrorMessage: null,
          updatedAt: new Date()
        })
        .where(eq(customDomains.id, domainId));

      // Создаем заказ сертификата
      const order = await this.client!.createOrder({
        identifiers: [
          { type: 'dns', value: domain }
        ]
      });

      // Получаем авторизации
      const authorizations = await this.client!.getAuthorizations(order);
      
      for (const authz of authorizations) {
        // Выбираем HTTP-01 challenge
        const httpChallenge = authz.challenges.find(c => c.type === 'http-01');
        if (!httpChallenge) {
          throw new Error('HTTP-01 challenge не найден');
        }

        // Получаем ключ авторизации
        const keyAuthorization = await this.client!.getChallengeKeyAuthorization(httpChallenge);
        
        // Здесь нужно разместить файл на вашем сервере:
        // /.well-known/acme-challenge/{httpChallenge.token} -> keyAuthorization
        await this.deployChallengeFile(httpChallenge.token, keyAuthorization);

        // Уведомляем Let's Encrypt о готовности
        await this.client!.verifyChallenge(authz, httpChallenge);
        
        // Ждем подтверждения
        await this.client!.waitForValidStatus(authz);
        
        // Удаляем challenge файл
        await this.cleanupChallengeFile(httpChallenge.token);
      }

      // Генерируем CSR и ключ сертификата
      const [certificateKey, csr] = await acme.crypto.createCsr({
        commonName: domain
      });

      // Финализируем заказ
      await this.client!.finalizeOrder(order, csr);
      
      // Получаем сертификат
      const certificate = await this.client!.getCertificate(order);

      // Сохраняем сертификат в базу
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 90); // Let's Encrypt сертификаты на 90 дней

      await db
        .update(customDomains)
        .set({
          sslStatus: 'issued',
          sslCertificate: certificate,
          sslPrivateKey: certificateKey.toString(),
          sslValidUntil: validUntil,
          sslIssuer: 'Let\'s Encrypt',
          sslErrorMessage: null,
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(customDomains.id, domainId));

      console.log(`✅ Реальный SSL сертификат успешно выдан для ${domain}`);

      return {
        success: true,
        certificate,
        privateKey: certificateKey.toString()
      };

    } catch (error) {
      console.error(`❌ Ошибка выдачи SSL сертификата для ${domain}:`, error);
      
      // Обновляем статус на ошибку
      await db
        .update(customDomains)
        .set({
          sslStatus: 'failed',
          sslErrorMessage: error.message,
          updatedAt: new Date()
        })
        .where(eq(customDomains.id, domainId));

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Размещаем challenge файл на сервере
  private static async deployChallengeFile(token: string, keyAuthorization: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const challengeDir = path.join(process.cwd(), 'public', '.well-known', 'acme-challenge');
    const challengeFile = path.join(challengeDir, token);
    
    try {
      await fs.mkdir(challengeDir, { recursive: true });
      await fs.writeFile(challengeFile, keyAuthorization);
      console.log(`📁 Challenge файл размещен: ${challengeFile}`);
    } catch (error) {
      console.error('Ошибка размещения challenge файла:', error);
      throw error;
    }
  }

  // Удаляем challenge файл
  private static async cleanupChallengeFile(token: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const challengeFile = path.join(process.cwd(), 'public', '.well-known', 'acme-challenge', token);
    
    try {
      await fs.unlink(challengeFile);
      console.log(`🗑️ Challenge файл удален: ${challengeFile}`);
    } catch (error) {
      console.warn('Предупреждение: не удалось удалить challenge файл:', error);
    }
  }

  // Автоматическое обновление сертификатов
  static async renewCertificates(): Promise<void> {
    try {
      // Получаем сертификаты, которые истекают в течение 30 дней
      const expiringDate = new Date();
      expiringDate.setDate(expiringDate.getDate() + 30);

      const expiringDomains = await db
        .select()
        .from(customDomains)
        .where(
          and(
            eq(customDomains.sslStatus, 'issued'),
            lte(customDomains.sslValidUntil, expiringDate)
          )
        );

      console.log(`🔄 Найдено ${expiringDomains.length} сертификатов для обновления`);

      for (const domain of expiringDomains) {
        try {
          console.log(`🔄 Обновляем сертификат для ${domain.domain}`);
          await this.issueRealCertificate(domain.domain, domain.id);
          
          // Ждем между обновлениями чтобы не превысить rate limits
          await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
          console.error(`Ошибка обновления сертификата для ${domain.domain}:`, error);
        }
      }
    } catch (error) {
      console.error('Ошибка автоматического обновления сертификатов:', error);
    }
  }
}

// Экспортируем функцию для использования в cron задачах
export async function scheduledCertificateRenewal(): Promise<void> {
  console.log('🔄 Запуск планового обновления SSL сертификатов');
  await LetsEncryptService.renewCertificates();
}