// Status normalization for conversion events
const ORDER = ['initiated','pending','approved','declined','refunded','chargeback'] as const;
export type Status = typeof ORDER[number];

/**
 * Normalizes conversion status based on business rules
 * @param prev - Previous status
 * @param next - New status to apply
 * @param type - Conversion type (reg or purchase)
 * @returns Normalized status
 */
export function normalize(prev: Status|undefined, next: Status, type: 'reg'|'purchase'): Status {
  // If no previous status, accept new status
  if (!prev) {return next;}

  // Registration cannot be refunded or charged back
  if (type === 'reg' && (next === 'refunded' || next === 'chargeback')) {return prev;}

  // Refunds and chargebacks only apply to approved purchases
  if (next === 'refunded' || next === 'chargeback') {return prev === 'approved' ? next : prev;}

  // Status can only move forward in the order, never backward
  const pi = ORDER.indexOf(prev);
  const ni = ORDER.indexOf(next);
  return ni >= pi ? next : prev;
}

/**
 * Gets human-readable status description
 */
export function getStatusDescription(status: Status, lang: 'en' | 'ru' = 'en'): string {
  const descriptions = {
    en: {
      initiated: 'Initiated',
      pending: 'Pending Review',
      approved: 'Approved',
      declined: 'Declined',
      refunded: 'Refunded',
      chargeback: 'Chargeback'
    },
    ru: {
      initiated: 'Инициирован',
      pending: 'На рассмотрении',
      approved: 'Одобрен',
      declined: 'Отклонен',
      refunded: 'Возврат',
      chargeback: 'Чарджбек'
    }
  };

  return descriptions[lang][status];
}

/**
 * Determines if status transition is valid
 */
export function isValidTransition(from: Status, to: Status, type: 'reg'|'purchase'): boolean {
  const normalized = normalize(from, to, type);
  return normalized === to;
}

/**
 * Gets allowed next statuses for current status
 */
export function getAllowedNextStatuses(current: Status, type: 'reg'|'purchase'): Status[] {
  const currentIndex = ORDER.indexOf(current);
  const allowed: Status[] = [];

  for (let i = currentIndex; i < ORDER.length; i++) {
    const status = ORDER[i];

    // Skip refunded/chargeback for registration
    if (type === 'reg' && (status === 'refunded' || status === 'chargeback')) {
      continue;
    }

    // Refunded/chargeback only allowed from approved
    if ((status === 'refunded' || status === 'chargeback') && current !== 'approved') {
      continue;
    }

    allowed.push(status);
  }

  return allowed;
}

/**
 * Converts external status to internal status
 */
export function mapExternalStatus(externalStatus: string, source: 'keitaro' | 'affiliate' | 'psp'): Status {
  const mappings: Record<string, Record<string, Status>> = {
    keitaro: {
      'lead': 'approved',
      'sale': 'approved',
      'trash': 'declined',
      'pending': 'pending'
    },
    affiliate: {
      'approved': 'approved',
      'declined': 'declined',
      'pending': 'pending',
      'hold': 'pending'
    },
    psp: {
      'success': 'approved',
      'failed': 'declined',
      'pending': 'pending',
      'refunded': 'refunded',
      'chargeback': 'chargeback',
      'reversed': 'chargeback'
    }
  };

  const sourceMapping = mappings[source];
  if (!sourceMapping) {return 'pending';}

  const mapped = sourceMapping[externalStatus.toLowerCase()];
  return mapped || 'pending';
}

export { ORDER };
