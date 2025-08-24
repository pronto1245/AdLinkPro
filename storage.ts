export class CustomDomainService {
  async verifyCustomDomain(advertiserId: string, domainId: string): Promise<any> {
    console.log("Verifying domain", domainId, "for", advertiserId);
    return true;
  }
}

import { DatabaseStorage } from './adapters/database-storage';
export const storage = new DatabaseStorage();
