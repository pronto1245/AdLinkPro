import { pgEnum } from "drizzle-orm/pg-core";

// User and Authentication Enums
export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'advertiser', 'partner', 'manager']);
export const auditActionEnum = pgEnum('audit_action', ['login', 'logout', 'create', 'update', 'delete', 'view', 'access_denied']);

// Offer and Access Enums
export const offerStatusEnum = pgEnum('offer_status', ['draft', 'pending', 'approved', 'rejected', 'paused', 'archived']);
export const accessRequestStatusEnum = pgEnum('access_request_status', ['pending', 'approved', 'rejected']);

// Transaction and Financial Enums
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'processing', 'completed', 'failed', 'cancelled']);
export const walletTypeEnum = pgEnum('wallet_type', ['hot', 'cold', 'external']);
export const walletStatusEnum = pgEnum('wallet_status', ['active', 'inactive', 'suspended', 'locked']);
export const cryptoCurrencyEnum = pgEnum('crypto_currency', ['BTC', 'ETH', 'USDT', 'USDC', 'TRX', 'LTC']);

// System and Support Enums
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'in_progress', 'pending_user', 'resolved', 'closed']);
export const domainStatusEnum = pgEnum('domain_status', ['pending', 'active', 'inactive', 'suspended', 'expired']);
export const domainTypeEnum = pgEnum('domain_type', ['main', 'redirect', 'tracking', 'landing']);

// Postback and Tracking Enums (centralized to avoid duplication)
export const postbackStatusEnum = pgEnum('postback_status', ['pending', 'active', 'inactive', 'disabled']);
export const ownerScopeEnum = pgEnum('owner_scope', ['owner', 'advertiser', 'partner']);
export const postbackScopeTypeEnum = pgEnum('postback_scope_type', ['global', 'campaign', 'offer', 'flow']);
export const postbackMethodEnum = pgEnum('postback_method', ['GET', 'POST']);
export const postbackIdParamEnum = pgEnum('postback_id_param', ['subid', 'clickid']);
export const deliveryStatusEnum = pgEnum('delivery_status', ['pending', 'success', 'failed', 'retrying']);
export const eventTypeEnum = pgEnum('event_type', ['open', 'lp_click', 'reg', 'deposit', 'sale', 'lead', 'lp_leave']);