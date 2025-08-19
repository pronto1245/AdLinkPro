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
    console.log(`🔍 Начинаем верификацию домена ID: ${domainId}`);
    
    const [domain] = await db
      .select()
      .from(customDomains)
      .where(eq(customDomains.id, domainId));

    if (!domain) {
      throw new Error('Domain not found');
    }

    console.log(`📋 Домен найден: ${domain.domain} (${domain.type})`);

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

      console.log(`⏳ Статус обновлен на pending для ${domain.domain}`);

      // Реальная DNS проверка домена
      const dns = await import('dns').then(m => m.promises);
      let isVerified = false;
      let errorMessage = '';

      try {
        if (domain.type === 'cname') {
          // Проверяем CNAME запись
          const cnameRecords = await dns.resolveCname(domain.domain);
          const expectedCname = `${domain.domain}.arbiconnect.app`;
          isVerified = cnameRecords.some(record => record.includes('arbiconnect.app'));
          console.log(`🔍 CNAME проверка для ${domain.domain}: ${isVerified ? 'SUCCESS' : 'FAILED'}`);
        } else if (domain.type === 'a_record') {
          // Проверяем A запись
          const aRecords = await dns.resolve4(domain.domain);
          const expectedIp = process.env.SERVER_IP || '0.0.0.0';
          isVerified = aRecords.includes(expectedIp);
          console.log(`🔍 A-record проверка для ${domain.domain}: ${isVerified ? 'SUCCESS' : 'FAILED'}`);
        }
        
        if (!isVerified) {
          errorMessage = `DNS запись не найдена или неверная для ${domain.type}`;
        }
      } catch (error: any) {
        console.error(`❌ DNS ошибка для ${domain.domain}:`, error.message);
        isVerified = false;
        errorMessage = error.message;
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

      console.log(`🎯 Финальный статус: ${newStatus} для ${domain.domain}`);

      return {
        success: isVerified,
        status: newStatus,
        error: errorMessage || undefined
      };
    } catch (error: any) {
      console.error(`❌ Ошибка верификации ${domain.domain}:`, error.message);
      
      // Обновляем статус на ошибку
      await db
        .update(customDomains)
        .set({ 
          status: 'error',
          isActive: false,
          lastChecked: new Date(),
          errorMessage: error.message
        })
        .where(eq(customDomains.id, domainId));

      return {
        success: false,
        status: 'error',
        error: error.message
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

      // Реальная интеграция с Let's Encrypt с обработкой таймаутов
      const { LetsEncryptService } = await import('./letsencrypt.js');
      
      // Запускаем процесс с агрессивным таймаутом
      const sslPromise = LetsEncryptService.issueCertificate(domain, domainId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SSL process timeout after 90 seconds')), 90000)
      );
      
      try {
        await Promise.race([sslPromise, timeoutPromise]);
        console.log(`✅ SSL процесс завершен успешно для ${domain}`);
      } catch (error) {
        console.error(`❌ SSL процесс прерван для ${domain}:`, error instanceof Error ? error.message : String(error));
        throw error;
      }
      
    } catch (error: any) {
      console.error(`SSL issuance failed for ${domain}:`, error);
      
      // Обновляем статус на ошибку
      await db
        .update(customDomains)
        .set({
          sslStatus: 'failed',
          sslErrorMessage: error?.message || 'SSL error',
          updatedAt: new Date()
        })
        .where(eq(customDomains.id, domainId));
    }
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
    } catch (error: any) {
      console.error('SSL check failed:', error?.message);
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