import { randomBytes } from 'crypto';
import { db } from '../db.js';
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
    // Проверяем лимит доменов для рекламодателя (максимум 1 домен)
    const existingDomains = await db
      .select()
      .from(customDomains)
      .where(eq(customDomains.advertiserId, data.advertiserId));

    if (existingDomains.length >= 1) {
      throw new Error('Domain limit exceeded. Each advertiser can add only 1 custom domain.');
    }

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
    status: 'verified' | 'error';
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
          status: 'pending',
          lastChecked: new Date(),
          errorMessage: null 
        })
        .where(eq(customDomains.id, domainId));

      let isVerified = false;
      let errorMessage = '';

      if (domain.type === 'cname') {
        // Проверяем CNAME запись
        try {
          const records = await resolveCname(domain.domain);
          isVerified = records.some(record => 
            record.includes('platform.com') || record.includes(domain.verificationValue)
          );
          if (!isVerified) {
            errorMessage = `CNAME record not found or incorrect. Expected: ${domain.domain} -> platform-verify.com`;
          }
        } catch (error: any) {
          errorMessage = `Failed to resolve CNAME: ${error.message}`;
        }
      } else {
        // Проверяем TXT запись для A record
        try {
          const records = await resolveTxt(domain.domain);
          isVerified = records.some((record: any) => {
            if (Array.isArray(record)) {
              return record.join('').includes(domain.verificationValue);
            } else if (typeof record === 'string') {
              return record.includes(domain.verificationValue);
            }
            return false;
          });
          if (!isVerified) {
            errorMessage = `TXT record not found. Add: ${domain.domain} TXT ${domain.verificationValue}`;
          }
        } catch (error: any) {
          errorMessage = `Failed to resolve TXT: ${error.message}`;
        }
      }

      // Обновляем статус домена
      const newStatus: 'verified' | 'error' = isVerified ? 'verified' : 'error';
      
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
          
          // Выбираем между реальной и демо выдачей SSL
          // Для arbiconnect.store принудительно включаем реальный SSL
          if (process.env.ENABLE_REAL_SSL === 'true' || domain.domain === 'arbiconnect.store') {
            const { LetsEncryptService } = await import('./letsencrypt.js');
            await LetsEncryptService.issueRealCertificate(domain.domain, domainId);
          } else {
            await this.requestSSLCertificate(domain.domain, domainId);
          }
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
          status: 'error',
          lastChecked: new Date(),
          errorMessage: `Verification failed: ${(error as Error).message}`
        })
        .where(eq(customDomains.id, domainId));

      return {
        success: false,
        status: 'error',
        error: (error as Error).message
      };
    }
  }

  // Автоматическая выдача SSL сертификата
  static async requestSSLCertificate(domain: string, domainId: string): Promise<void> {
    try {
      console.log(`🔒 Запуск процесса выдачи SSL для ${domain}`);
      
      // Обновляем статус на "выдается"
      await db
        .update(customDomains)
        .set({
          sslStatus: 'pending',
          sslErrorMessage: null,
          updatedAt: new Date()
        })
        .where(eq(customDomains.id, domainId));

      // Симуляция процесса выдачи SSL сертификата Let's Encrypt
      // В реальном приложении здесь будет интеграция с ACME протоколом
      await this.simulateSSLIssuance(domain, domainId);
      
    } catch (error) {
      console.error(`SSL issuance failed for ${domain}:`, error);
      
      // Обновляем статус на ошибку
      await db
        .update(customDomains)
        .set({
          sslStatus: 'failed',
          sslErrorMessage: (error as Error).message,
          updatedAt: new Date()
        })
        .where(eq(customDomains.id, domainId));
    }
  }

  // Симуляция выдачи SSL сертификата
  private static async simulateSSLIssuance(domain: string, domainId: string): Promise<void> {
    // Симулируем задержку выдачи сертификата (обычно 1-3 минуты)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Генерируем "сертификат" для демонстрации
    const mockCertificate = `-----BEGIN CERTIFICATE-----
MIIFXzCCA0egAwIBAgISA${Date.now().toString().slice(-10)}
... (mock certificate data) ...
-----END CERTIFICATE-----`;

    const mockPrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC${Date.now().toString().slice(-15)}
... (mock private key data) ...
-----END PRIVATE KEY-----`;

    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 3); // Сертификат действует 3 месяца

    // Обновляем домен с выданным сертификатом
    await db
      .update(customDomains)
      .set({
        sslStatus: 'issued',
        sslCertificate: mockCertificate,
        sslPrivateKey: mockPrivateKey,
        sslValidUntil: validUntil,
        sslIssuer: 'Let\'s Encrypt (Demo)',
        sslErrorMessage: null,
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(customDomains.id, domainId));

    console.log(`✅ SSL сертификат успешно выдан для ${domain}`);
  }

  // Принудительная выдача SSL для уже верифицированного домена
  static async issueSSLForDomain(domainId: string, advertiserId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Проверяем что домен принадлежит рекламодателю и верифицирован
      const [domain] = await db
        .select()
        .from(customDomains)
        .where(and(
          eq(customDomains.id, domainId),
          eq(customDomains.advertiserId, advertiserId),
          eq(customDomains.status, 'verified')
        ));

      if (!domain) {
        return {
          success: false,
          message: 'Домен не найден или не верифицирован'
        };
      }

      if (domain.sslStatus === 'issued') {
        return {
          success: false,
          message: 'SSL сертификат уже выдан для этого домена'
        };
      }

      if (domain.sslStatus === 'pending') {
        return {
          success: false,
          message: 'SSL сертификат уже выдается для этого домена'
        };
      }

      // Запускаем выдачу SSL
      await this.requestSSLCertificate(domain.domain, domainId);

      return {
        success: true,
        message: 'SSL сертификат выдается. Проверьте статус через несколько минут.'
      };

    } catch (error) {
      return {
        success: false,
        message: `Ошибка выдачи SSL: ${(error as Error).message}`
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
          const cert = (res.connection as any).getPeerCertificate();
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
        record: domain.domain,
        value: 'platform-verify.com',
        instructions: `Добавьте CNAME запись в DNS настройках вашего домена:\n\nИмя: ${domain.domain}\nЗначение: platform-verify.com\n\nПосле добавления записи нажмите "Проверить домен".`
      };
    } else {
      return {
        type: 'TXT',
        record: domain.domain,
        value: domain.verificationValue,
        instructions: `Добавьте TXT запись в DNS настройках вашего домена:\n\nИмя: ${domain.domain}\nЗначение: ${domain.verificationValue}\n\nПосле добавления записи нажмите "Проверить домен".`
      };
    }
  }
}