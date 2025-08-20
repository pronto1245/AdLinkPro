// Unified team management types for both affiliate and advertiser teams

export interface TeamMember {
  id: string;
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: TeamRole;
  permissions: TeamPermissions | string[];
  restrictions?: TeamRestrictions;
  subIdPrefix?: string; // For affiliate teams
  isActive: boolean;
  status: 'active' | 'inactive' | 'blocked';
  telegramNotifications?: boolean;
  telegramUserId?: string;
  lastActivity: string;
  createdAt: string;
  createdBy: string;
}

export type TeamRole = 
  // Affiliate roles
  | 'buyer' 
  | 'analyst' 
  | 'manager'
  // Advertiser roles  
  | 'financier'
  | 'support';

// Advertiser-style permissions (object-based)
export interface TeamPermissions {
  manageOffers?: boolean;
  managePartners?: boolean;
  viewStatistics?: boolean;
  financialOperations?: boolean;
  postbacksApi?: boolean;
  // Affiliate-specific permissions (kept for compatibility)
  view_offers?: boolean;
  generate_links?: boolean;
  view_creatives?: boolean;
  view_payouts?: boolean;
  manage_team?: boolean;
}

export interface TeamRestrictions {
  ipWhitelist: string[];
  geoRestrictions: string[];
  timeRestrictions: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
    workingDays: number[];
  };
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  result: 'success' | 'failed' | 'warning';
}

// Form data interfaces
export interface CreateAffiliateTeamMemberData {
  email: string;
  username: string;
  password: string;
  role: 'buyer' | 'analyst' | 'manager';
  permissions: string[];
  subIdPrefix: string;
}

export interface CreateAdvertiserTeamMemberData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'manager' | 'analyst' | 'financier' | 'support';
  permissions: TeamPermissions;
  restrictions: TeamRestrictions;
  telegramNotifications: boolean;
  telegramUserId?: string;
}

// Role configurations
export const AFFILIATE_ROLE_PERMISSIONS = {
  buyer: {
    name: 'Байер',
    color: 'bg-blue-100 text-blue-800',
    permissions: ['view_offers', 'generate_links', 'view_statistics'],
    defaultPermissions: ['view_offers', 'generate_links', 'view_statistics']
  },
  analyst: {
    name: 'Аналитик', 
    color: 'bg-green-100 text-green-800',
    permissions: ['view_offers', 'view_statistics', 'view_creatives'],
    defaultPermissions: ['view_offers', 'view_statistics', 'view_creatives']
  },
  manager: {
    name: 'Менеджер',
    color: 'bg-purple-100 text-purple-800',
    permissions: ['view_offers', 'generate_links', 'view_statistics', 'view_creatives', 'manage_team'],
    defaultPermissions: ['view_offers', 'generate_links', 'view_statistics', 'view_creatives', 'manage_team']
  }
} as const;

export const ADVERTISER_DEFAULT_PERMISSIONS = {
  manager: {
    manageOffers: true,
    managePartners: true,
    viewStatistics: true,
    financialOperations: false,
    postbacksApi: false
  },
  analyst: {
    manageOffers: false,
    managePartners: false,
    viewStatistics: true,
    financialOperations: false,
    postbacksApi: false
  },
  financier: {
    manageOffers: false,
    managePartners: false,
    viewStatistics: false,
    financialOperations: true,
    postbacksApi: false
  },
  support: {
    manageOffers: true,
    managePartners: false,
    viewStatistics: true,
    financialOperations: false,
    postbacksApi: true
  }
} as const;

export const ADVERTISER_ROLE_LABELS = {
  manager: 'Менеджер',
  analyst: 'Аналитик',
  financier: 'Финансист',
  support: 'Техподдержка'
} as const;

export const ADVERTISER_ROLE_COLORS = {
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  analyst: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  financier: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  support: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
} as const;

export const AVAILABLE_AFFILIATE_PERMISSIONS = [
  { id: 'view_offers', name: 'Просмотр офферов', description: 'Доступ к списку офферов' },
  { id: 'generate_links', name: 'Генерация ссылок', description: 'Создание трекинговых ссылок' },
  { id: 'view_statistics', name: 'Статистика', description: 'Просмотр статистики и отчётов' },
  { id: 'view_creatives', name: 'Креативы', description: 'Доступ к креативам и материалам' },
  { id: 'view_payouts', name: 'Выплаты', description: 'Просмотр информации о выплатах' },
  { id: 'manage_team', name: 'Управление командой', description: 'Добавление и управление участниками' }
] as const;