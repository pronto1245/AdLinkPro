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
    const verificationRecord = `_platform-verify.${data.domain}`;

    const [customDomain] = await db
      .insert(customDomains)
      .values({
        advertiserId: data.advertiserId,
        domain: data.domain.toLowerCase(),
        type: data.type || 'cname',
        verificationValue,
        verificationRecord,
        status: 'pending',
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
  static async checkSSL(domain: string): Promise<{
    hasSSL: boolean;
    validUntil?: Date;
    issuer?: string;
  }> {
    // Простая проверка SSL (в продакшене нужно использовать полноценную библиотеку)
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