// Keitaro tracker integration with official API parameters
import { PostbackTask } from './enqueue';

/**
 * Official Keitaro postback parameters mapping
 */
export interface KeitaroPostbackParams {
  subid: string;           // Required: click ID (subid)
  status: string;          // Required: conversion status
  payout?: string;         // Optional: payout amount
  currency?: string;       // Optional: currency code
  txid?: string;           // Optional: transaction ID
  revenue?: string;        // Optional: revenue amount (alias for payout)
  external_id?: string;    // Optional: external transaction ID
  click_id?: string;       // Optional: click identifier (alias for subid)
  conversion_id?: string;  // Optional: conversion identifier
}

/**
 * Keitaro status mappings for different conversion types
 */
export const KEITARO_STATUS_MAP = {
  reg: {
    initiated: 'lead',
    pending: 'lead',
    approved: 'lead',
    declined: 'reject',
    refunded: 'reject',
    chargeback: 'reject'
  },
  purchase: {
    initiated: 'sale',
    pending: 'sale',
    approved: 'sale',
    declined: 'reject',
    refunded: 'refund',
    chargeback: 'chargeback'
  }
} as const;

/**
 * Keitaro parameter template for GET requests
 */
export const KEITARO_PARAMS_TEMPLATE = {
  subid: '{{clickid}}',
  status: '{{status_mapped}}',
  payout: '{{revenue}}',
  currency: '{{currency}}',
  txid: '{{txid}}'
} as const;

/**
 * Build Keitaro-compatible postback URL
 */
export function buildKeitaroPostbackUrl(
  baseUrl: string,
  task: PostbackTask,
  mappedStatus: string,
  authToken?: string
): string {
  const url = new URL(baseUrl);
  
  // Standard Keitaro parameters
  const params: KeitaroPostbackParams = {
    subid: task.clickid,
    status: mappedStatus,
    payout: task.revenue ?? '0',
    currency: task.currency ?? 'USD',
    txid: task.txid,
    external_id: task.txid,
    click_id: task.clickid,
    conversion_id: task.conversionId
  };

  // Add all parameters to URL
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  // Add authentication token if provided
  if (authToken) {
    url.searchParams.set('auth_token', authToken);
  }

  return url.toString();
}

/**
 * Map internal status to Keitaro status
 */
export function mapStatusForKeitaro(
  internalStatus: string,
  conversionType: 'reg' | 'purchase'
): string {
  const statusMap = KEITARO_STATUS_MAP[conversionType];
  return statusMap[internalStatus as keyof typeof statusMap] ?? 'reject';
}

/**
 * Validate Keitaro postback response
 */
export function validateKeitaroResponse(responseBody: string, responseCode: number): {
  success: boolean;
  message: string;
} {
  // Keitaro typically returns:
  // - HTTP 200 with 'OK' for successful postbacks
  // - HTTP 404 for invalid clicks
  // - HTTP 400 for malformed requests
  
  if (responseCode === 200) {
    const body = responseBody.trim().toLowerCase();
    if (body === 'ok' || body === '1' || body === 'success') {
      return { success: true, message: 'Postback accepted by Keitaro' };
    } else {
      return { success: false, message: `Unexpected response: ${responseBody}` };
    }
  }
  
  if (responseCode === 404) {
    return { success: false, message: 'Click not found in Keitaro' };
  }
  
  if (responseCode === 400) {
    return { success: false, message: 'Invalid postback parameters' };
  }
  
  return { success: false, message: `HTTP ${responseCode}: ${responseBody}` };
}

/**
 * Get Keitaro postback profile templates
 */
export function getKeitaroProfileTemplates() {
  return [
    {
      name: 'Keitaro Standard (GET)',
      method: 'GET',
      endpointUrl: 'https://{{domain}}/click.php',
      paramsTemplate: KEITARO_PARAMS_TEMPLATE,
      statusMap: KEITARO_STATUS_MAP,
      authQueryKey: 'auth_token',
      authHeaderName: null,
      description: 'Standard Keitaro postback via GET parameters'
    },
    {
      name: 'Keitaro with Bearer Auth',
      method: 'GET', 
      endpointUrl: 'https://{{domain}}/api/v1/conversions',
      paramsTemplate: KEITARO_PARAMS_TEMPLATE,
      statusMap: KEITARO_STATUS_MAP,
      authQueryKey: null,
      authHeaderName: 'Authorization',
      description: 'Keitaro API with Bearer token authentication'
    },
    {
      name: 'Keitaro Legacy Format',
      method: 'GET',
      endpointUrl: 'https://{{domain}}/postback',
      paramsTemplate: {
        click_id: '{{clickid}}',
        conversion_status: '{{status_mapped}}',
        revenue: '{{revenue}}',
        currency_code: '{{currency}}'
      },
      statusMap: KEITARO_STATUS_MAP,
      authQueryKey: 'token',
      authHeaderName: null,
      description: 'Legacy Keitaro postback format'
    }
  ];
}

/**
 * Generate test postback for Keitaro
 */
export function generateKeitaroTestPostback(domain: string, authToken?: string): {
  url: string;
  expectedResponse: string;
  testData: PostbackTask;
} {
  const testData: PostbackTask = {
    conversionId: `test_${Date.now()}`,
    advertiserId: '1',
    partnerId: '2',
    clickid: `test_${Math.random().toString(36).substr(2, 9)}`,
    type: 'purchase',
    txid: `tx_test_${Date.now()}`,
    status: 'approved',
    revenue: '100.00',
    currency: 'USD',
    antifraudLevel: 'ok'
  };

  const url = buildKeitaroPostbackUrl(
    `https://${domain}/click.php`,
    testData,
    'sale',
    authToken
  );

  return {
    url,
    expectedResponse: 'OK',
    testData
  };
}