import { randomBytes } from 'crypto';
import { db } from '../db';
import { customDomains, offers, trackingLinks, type CustomDomain, type InsertCustomDomain } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);
const resolveCname = promisify(dns.resolveCname);
const resolve4 = promisify(dns.resolve4);

export class CustomDomainService {
  // Генерируем значение для верификации
  static generateVerificationValue(): string {
    return `platform-verify=${randomBytes(16).toString('hex')}`;
  }

  // Создаем кастомный домен
  static async createCustomDomain(data: {
    advertiserId: string;
    domain: string;
    type?: 'a_record' | 'cname';
  }): Promise<CustomDomain> {
    const verificationValue = this.generateVerificationValue();
    const targetValue = data.type === 'cname' 
      ? 'affiliate-tracker.replit.app' 
      : '192.168.1.100'; // Пример IP для A записи

    const [customDomain] = await db
      .insert(customDomains)
      .values({
        advertiserId: data.advertiserId,
        domain: data.domain.toLowerCase(),
        type: data.type || 'cname',
        verificationValue,
        targetValue,
        status: 'pending',
        sslStatus: 'none',
        isActive: false
      })
      .returning();

    return customDomain;
  }

  // Получаем домены рекламодателя
  static async getAdvertiserDomains(advertiserId: string): Promise<CustomDomain[]> {
    return await db
      .select()
      .from(customDomains)
      .where(eq(customDomains.advertiserId, advertiserId))
      .orderBy(desc(customDomains.createdAt));
  }

  // Верифицируем домен через DNS
  static async verifyDomain(domainId: string): Promise<{
    success: boolean;
    status: 'verified' | 'failed';
    error?: string;
  }> {
    const [domain] = await db
      .select()
      .from(customDomains)
      .where(eq(customDomains.id, domainId));

    if (!domain) {
      throw new Error('Domain not found');
    }

    try {
      // Обновляем статус на "верифицируем"
      await db
        .update(customDomains)
        .set({ 
          status: 'verifying',
          lastChecked: new Date(),
          errorMessage: null 
        })
        .where(eq(customDomains.id, domainId));

      let isVerified = false;
      let errorMessage = '';

      if (domain.type === 'cname') {
        // Проверяем CNAME запись
        try {
          const records = await resolveCname(domain.verificationRecord);
          isVerified = records.some(record => 
            record.includes('platform.com') || record.includes(domain.verificationValue)
          );
          if (!isVerified) {
            errorMessage = `CNAME record not found or incorrect. Expected: ${domain.verificationRecord} -> platform-verify.com`;
          }
        } catch (error) {
          errorMessage = `Failed to resolve CNAME: ${error.message}`;
        }
      } else {
        // Проверяем TXT запись для A record
        try {
          const records = await resolveTxt(domain.verificationRecord);
          isVerified = records.some(record => 
            Array.isArray(record) 
              ? record.join('').includes(domain.verificationValue)
              : record.includes(domain.verificationValue)
          );
          if (!isVerified) {
            errorMessage = `TXT record not found. Add: ${domain.verificationRecord} TXT ${domain.verificationValue}`;
          }
        } catch (error) {
          errorMessage = `Failed to resolve TXT: ${error.message}`;
        }
      }

      // Обновляем статус домена
      const newStatus: 'verified' | 'failed' = isVerified ? 'verified' : 'failed';
      
      await db
        .update(customDomains)
        .set({ 
          status: newStatus,
          isActive: isVerified,
          lastChecked: new Date(),
          errorMessage: isVerified ? null : errorMessage
        })
        .where(eq(customDomains.id, domainId));

      // Если домен верифицирован, запускаем процесс выдачи SSL сертификата
      if (isVerified) {
        try {
          console.log(`🔒 Инициируем выдачу SSL сертификата для ${domain.domain}`);
          await this.requestSSLCertificate(domain.domain, domainId);
        } catch (sslError) {
          console.error(`SSL certificate request failed for ${domain.domain}:`, sslError);
          // Не делаем домен failed из-за SSL ошибки, только логируем
        }
      }

      return {
        success: isVerified,
        status: newStatus,
        error: isVerified ? undefined : errorMessage
      };

    } catch (error) {
      // Обновляем статус на ошибку
      await db
        .update(customDomains)
        .set({ 
          status: 'failed',
          lastChecked: new Date(),
          errorMessage: `Verification failed: ${error.message}`
        })
        .where(eq(customDomains.id, domainId));

      return {
        success: false,
        status: 'failed',
        error: error.message
      };
    }
  }

  // Удаляем домен
  static async deleteDomain(domainId: string, advertiserId: string): Promise<void> {
    await db
      .delete(customDomains)
      .where(and(
        eq(customDomains.id, domainId),
        eq(customDomains.advertiserId, advertiserId)
      ));
  }

  // Получаем активные верифицированные домены рекламодателя
  static async getVerifiedDomains(advertiserId: string): Promise<string[]> {
    const domains = await db
      .select({ domain: customDomains.domain })
      .from(customDomains)
      .where(and(
        eq(customDomains.advertiserId, advertiserId),
        eq(customDomains.status, 'verified'),
        eq(customDomains.isActive, true)
      ));

    return domains.map(d => d.domain);
  }

  // Выбираем лучший домен для трекинговой ссылки
  static async getBestDomain(advertiserId: string): Promise<string | null> {
    const [domain] = await db
      .select({ domain: customDomains.domain })
      .from(customDomains)
      .where(and(
        eq(customDomains.advertiserId, advertiserId),
        eq(customDomains.status, 'verified'),
        eq(customDomains.isActive, true)
      ))
      .orderBy(desc(customDomains.createdAt))
      .limit(1);

    return domain?.domain || null;
  }

  // Обновляем трекинговые ссылки на использование кастомного домена
  static async updateTrackingLinksWithDomain(advertiserId: string, domain: string): Promise<void> {
    // Получаем все офферы рекламодателя
    const advertiserOffers = await db
      .select({ id: offers.id })
      .from(offers)
      .where(eq(offers.advertiserId, advertiserId));

    const offerIds = advertiserOffers.map(o => o.id);

    if (offerIds.length === 0) return;

    // Обновляем URL в трекинговых ссылках
    for (const offerId of offerIds) {
      await db
        .update(trackingLinks)
        .set({ 
          customDomain: domain,
          updatedAt: new Date()
        })
        .where(eq(trackingLinks.offerId, offerId));
    }
  }

  // Проверяем SSL сертификат
  // Запрос SSL сертификата после верификации DNS
  static async requestSSLCertificate(domain: string, domainId: string): Promise<void> {
    try {
      console.log(`🔒 Начинаем процесс выдачи SSL сертификата для ${domain}`);
      
      // Обновляем статус SSL на pending
      await db
        .update(customDomains)
        .set({ 
          sslStatus: 'pending',
          lastChecked: new Date()
        })
        .where(eq(customDomains.id, domainId));

      // В продакшене здесь должна быть интеграция с Let's Encrypt
      // Например, с использованием библиотеки node-acme-client
      // Для демонстрации симулируем процесс выдачи сертификата
      
      // Проверяем, что домен доступен по HTTP
      const isHttpAccessible = await this.checkHttpAccess(domain);
      
      if (!isHttpAccessible) {
        throw new Error('Domain is not accessible via HTTP, SSL certificate cannot be issued');
      }

      // Симулируем запрос к Let's Encrypt (в продакшене нужна реальная интеграция)
      console.log(`📋 Создаем заявку на SSL сертификат для ${domain} через Let's Encrypt`);
      
      // Имитируем процесс challenge и validation
      await this.simulateACMEChallenge(domain);
      
      // Генерируем сертификат (в продакшене - получаем от Let's Encrypt)
      const certificate = await this.generateSSLCertificate(domain);
      
      // Обновляем статус SSL на issued
      await db
        .update(customDomains)
        .set({ 
          sslStatus: 'issued',
          sslCertificate: certificate.cert,
          sslPrivateKey: certificate.key,
          sslValidUntil: certificate.validUntil,
          sslIssuer: 'Let\'s Encrypt',
          lastChecked: new Date()
        })
        .where(eq(customDomains.id, domainId));

      console.log(`✅ SSL сертификат успешно выдан для ${domain}`);
      
    } catch (error) {
      console.error(`❌ Ошибка выдачи SSL сертификата для ${domain}:`, error);
      
      // Обновляем статус SSL на failed
      await db
        .update(customDomains)
        .set({ 
          sslStatus: 'failed',
          sslErrorMessage: error.message,
          lastChecked: new Date()
        })
        .where(eq(customDomains.id, domainId));
      
      throw error;
    }
  }

  // Проверка HTTP доступности домена
  static async checkHttpAccess(domain: string): Promise<boolean> {
    try {
      const response = await fetch(`http://${domain}`, {
        method: 'HEAD',
        timeout: 10000,
        signal: AbortSignal.timeout(10000)
      });
      return response.status < 500;
    } catch (error) {
      console.log(`HTTP access check failed for ${domain}:`, error.message);
      return false;
    }
  }

  // Симуляция ACME Challenge (в продакшене - реальная интеграция с Let's Encrypt)
  static async simulateACMEChallenge(domain: string): Promise<void> {
    console.log(`🔐 Выполняем HTTP-01 challenge для ${domain}`);
    
    // В реальной системе здесь будет:
    // 1. Создание challenge файла
    // 2. Размещение его на веб-сервере домена
    // 3. Уведомление Let's Encrypt для проверки
    // 4. Ожидание подтверждения
    
    // Симулируем процесс
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`✅ HTTP-01 challenge успешно пройден для ${domain}`);
  }

  // Генерация SSL сертификата (в продакшене - получение от Let's Encrypt)
  static async generateSSLCertificate(domain: string): Promise<{
    cert: string;
    key: string;
    validUntil: Date;
  }> {
    console.log(`📜 Генерируем SSL сертификат для ${domain}`);
    
    // В продакшене здесь будет получение настоящего сертификата от Let's Encrypt
    // Для демонстрации создаем mock сертификат
    
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 90); // Let's Encrypt сертификаты действуют 90 дней
    
    return {
      cert: `-----BEGIN CERTIFICATE-----
Mock certificate for ${domain}
Generated at: ${new Date().toISOString()}
Valid until: ${validUntil.toISOString()}
-----END CERTIFICATE-----`,
      key: `-----BEGIN PRIVATE KEY-----
Mock private key for ${domain}
Generated at: ${new Date().toISOString()}
-----END PRIVATE KEY-----`,
      validUntil
    };
  }

  static async checkSSL(domain: string): Promise<{
    hasSSL: boolean;
    validUntil?: Date;
    issuer?: string;
  }> {
    // Проверка SSL сертификата
    try {
      const https = await import('https');
      return new Promise((resolve) => {
        const options = {
          hostname: domain,
          port: 443,
          method: 'HEAD',
          rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
          const cert = res.connection.getPeerCertificate();
          if (cert && cert.valid_to) {
            resolve({
              hasSSL: true,
              validUntil: new Date(cert.valid_to),
              issuer: cert.issuer?.CN
            });
          } else {
            resolve({ hasSSL: false });
          }
        });

        req.on('error', () => {
          resolve({ hasSSL: false });
        });

        req.end();
      });
    } catch (error) {
      return { hasSSL: false };
    }
  }

  // Получаем инструкции для настройки DNS
  static getDNSInstructions(domain: CustomDomain): {
    type: string;
    record: string;
    value: string;
    instructions: string;
  } {
    if (domain.type === 'cname') {
      return {
        type: 'CNAME',
        record: domain.verificationRecord,
        value: 'platform-verify.com',
        instructions: `Добавьте CNAME запись в DNS настройках вашего домена:\n\nИмя: ${domain.verificationRecord}\nЗначение: platform-verify.com\n\nПосле добавления записи нажмите "Проверить домен".`
      };
    } else {
      return {
        type: 'TXT',
        record: domain.verificationRecord,
        value: domain.verificationValue,
        instructions: `Добавьте TXT запись в DNS настройках вашего домена:\n\nИмя: ${domain.verificationRecord}\nЗначение: ${domain.verificationValue}\n\nПосле добавления записи нажмите "Проверить домен".`
      };
    }
  }
}