export interface Translation {
  [key: string]: string;
}

export interface Translations {
  [language: string]: Translation;
}

export const translations: Translations = {
  en: {
    // Navigation
    'dashboard': 'Dashboard',
    'users': 'Users',
    'offers': 'Offers',
    'finance': 'Finance',
    'postbacks': 'Postbacks',
    'analytics': 'Analytics',
    'support': 'Support',
    'settings': 'Settings',
    'anti_fraud': 'Anti-Fraud',
    'integrations': 'Integrations',

    // Common
    'welcome': 'Welcome back! Here\'s what\'s happening today.',
    'loading': 'Loading...',
    'search': 'Search...',
    'cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'create': 'Create',
    'update': 'Update',
    'view_all': 'View all',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
    'refresh': 'Refresh',
    'export': 'Export',
    'import': 'Import',

    // Authentication
    'login': 'Login',
    'logout': 'Logout',
    'register': 'Register',
    'username': 'Username',
    'password': 'Password',
    'email': 'Email',
    'sign_in': 'Sign In',
    'sign_up': 'Sign Up',
    'forgot_password': 'Forgot Password',
    'remember_me': 'Remember me',

    // User Management
    'first_name': 'First Name',
    'last_name': 'Last Name',
    'company': 'Company',
    'phone': 'Phone',
    'country': 'Country',
    'language': 'Language',
    'timezone': 'Timezone',
    'currency': 'Currency',
    'role': 'Role',
    'status': 'Status',
    'active': 'Active',
    'inactive': 'Inactive',
    'created': 'Created',
    'updated': 'Updated',

    // Metrics
    'total_revenue': 'Total Revenue',
    'active_partners': 'Active Partners',
    'active_offers': 'Active Offers',
    'total_partners': 'Total Partners',
    'conversion_rate': 'Conversion Rate',
    'fraud_rate': 'Fraud Rate',
    'total_clicks': 'Total Clicks',
    'total_conversions': 'Total Conversions',
    'total_earnings': 'Total Earnings',
    'average_cr': 'Average CR',
    'total_payout': 'Total Payout',

    // Dashboard
    'revenue_overview': 'Revenue Overview',
    'recent_activity': 'Recent Activity',
    'top_performers': 'Top Performing Partners',
    'recent_offers': 'Recent Offers',
    'system_status': 'System Status & Alerts',
    'performance_overview': 'Performance Overview',
    'quick_actions': 'Quick Actions',

    // Offers
    'create_offer': 'Create Offer',
    'offer_name': 'Offer Name',
    'offer_description': 'Offer Description',
    'category': 'Category',
    'payout': 'Payout',
    'payout_type': 'Payout Type',
    'landing_page': 'Landing Page',
    'tracking_url': 'Tracking URL',
    'restrictions': 'Restrictions',
    'kyc_required': 'KYC Required',
    'private_offer': 'Private Offer',
    'geo_targeting': 'Geo Targeting',
    'traffic_sources': 'Traffic Sources',

    // Statistics
    'clicks': 'Clicks',
    'unique_clicks': 'Unique Clicks',
    'leads': 'Leads',
    'conversions': 'Conversions',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'pending': 'Pending',
    'revenue': 'Revenue',
    'earnings': 'Earnings',
    'epc': 'EPC',
    'cr': 'CR',
    'ctr': 'CTR',

    // Tracking
    'tracking_links': 'Tracking Links',
    'tracking_code': 'Tracking Code',
    'generate_link': 'Generate Link',
    'sub_id': 'Sub ID',
    'source': 'Source',
    'campaign': 'Campaign',
    'medium': 'Medium',

    // Finance
    'balance': 'Balance',
    'transactions': 'Transactions',
    'deposits': 'Deposits',
    'withdrawals': 'Withdrawals',
    'payouts': 'Payouts',
    'commission': 'Commission',
    'invoice': 'Invoice',
    'payment_method': 'Payment Method',
    'amount': 'Amount',
    'reference': 'Reference',

    // Support
    'tickets': 'Tickets',
    'create_ticket': 'Create Ticket',
    'subject': 'Subject',
    'message': 'Message',
    'priority': 'Priority',
    'assigned_to': 'Assigned To',
    'open': 'Open',
    'closed': 'Closed',
    'resolved': 'Resolved',

    // Status messages
    'success': 'Success',
    'error': 'Error',
    'warning': 'Warning',
    'info': 'Information',
    'operation_completed': 'Operation completed successfully',
    'data_updated': 'Data updated successfully',
    'data_deleted': 'Data deleted successfully',
    'data_created': 'Data created successfully',

    // Time periods
    'today': 'Today',
    'yesterday': 'Yesterday',
    'last_7_days': 'Last 7 days',
    'last_30_days': 'Last 30 days',
    'this_month': 'This month',
    'last_month': 'Last month',
    'this_year': 'This year',
    'last_year': 'Last year',
    'custom': 'Custom',

    // Admin specific
    'super_admin': 'Super Admin',
    'advertiser': 'Advertiser',
    'affiliate': 'Affiliate',
    'staff': 'Staff',
    'add_user': 'Add User',
    'edit_user': 'Edit User',
    'delete_user': 'Delete User',
    'approve_user': 'Approve User',
    'block_user': 'Block User',
    'unblock_user': 'Unblock User',
    'no_users_found': 'No users found',
    'no_offers_found': 'No offers found',
    'total_users': 'Total Users',
    'pending_approvals': 'Pending Approvals',
    'fraud_alerts_count': 'Fraud Alerts',
    'system_health': 'System Health',
    'overview': 'Overview',
    'financial_management': 'Financial Management',
    'transaction_monitoring': 'Transaction Monitoring',
    'payout_management': 'Payout Management',
    'commission_tracking': 'Commission Tracking',
    'suspicious_activity': 'Suspicious Activity',
    'fraud_prevention': 'Fraud Prevention',
    'risk_assessment': 'Risk Assessment',
    'security_alerts': 'Security Alerts',
    
    // Offer management specific
    'manage_all_offers_platform': 'Manage all offers across the platform',
    'all_statuses': 'All Statuses',
    'draft': 'Draft',
    'moderation_status': 'Moderation Status',
    'needs_revision': 'Needs Revision',
    'all_categories': 'All Categories',
    'dating': 'Dating',
    'gaming': 'Gaming',
    'health': 'Health',
    'all_advertisers': 'All Advertisers',
    'all_countries': 'All Countries',
    'archived': 'Archived',
    'blocked': 'Blocked',
    'actions': 'Actions',
    'details': 'Details',
    'creatives': 'Creatives',
    'history': 'History',
    'no_restrictions': 'No restrictions',
    'no_creatives_available': 'No creatives available',
    'no_history_available': 'No history available',
    'edit_offer': 'Edit Offer',
    'edit_offer_details': 'Edit offer details and settings',
    'enter_fraud_restrictions': 'Enter fraud restrictions',
    'smartlink_enabled': 'SmartLink Enabled',
    'block_offer': 'Block Offer',
    'enter_blocked_reason': 'Enter blocked reason',
    'moderate_offer': 'Moderate Offer',
    'approve': 'Approve',
    'reject': 'Reject',
    'archive': 'Archive',
    'comment': 'Comment',
    'enter_moderation_comment': 'Enter moderation comment',
  },
  ru: {
    // Navigation
    'dashboard': 'Панель управления',
    'users': 'Пользователи',
    'offers': 'Офферы',
    'finance': 'Финансы',
    'postbacks': 'Постбеки',
    'analytics': 'Аналитика',
    'support': 'Поддержка',
    'settings': 'Настройки',
    'anti_fraud': 'Антифрод',
    'integrations': 'Интеграции',

    // Common
    'welcome': 'Добро пожаловать! Вот что происходит сегодня.',
    'loading': 'Загрузка...',
    'search': 'Поиск...',
    'cancel': 'Отмена',
    'save': 'Сохранить',
    'delete': 'Удалить',
    'edit': 'Редактировать',
    'create': 'Создать',
    'update': 'Обновить',
    'view_all': 'Показать все',
    'back': 'Назад',
    'next': 'Далее',
    'previous': 'Предыдущий',
    'refresh': 'Обновить',
    'export': 'Экспорт',
    'import': 'Импорт',

    // Authentication
    'login': 'Вход',
    'logout': 'Выход',
    'register': 'Регистрация',
    'username': 'Имя пользователя',
    'password': 'Пароль',
    'email': 'Электронная почта',
    'sign_in': 'Войти',
    'sign_up': 'Зарегистрироваться',
    'forgot_password': 'Забыли пароль',
    'remember_me': 'Запомнить меня',

    // User Management
    'first_name': 'Имя',
    'last_name': 'Фамилия',
    'company': 'Компания',
    'phone': 'Телефон',
    'country': 'Страна',
    'language': 'Язык',
    'timezone': 'Часовой пояс',
    'currency': 'Валюта',
    'role': 'Роль',
    'status': 'Статус',
    'active': 'Активен',
    'inactive': 'Неактивен',
    'created': 'Создан',
    'updated': 'Обновлен',

    // Metrics
    'total_revenue': 'Общая выручка',
    'active_partners': 'Активные партнеры',
    'active_offers': 'Активные офферы',
    'total_partners': 'Всего партнеров',
    'conversion_rate': 'Конверсия',
    'fraud_rate': 'Уровень фрода',
    'total_clicks': 'Всего кликов',
    'total_conversions': 'Всего конверсий',
    'total_earnings': 'Общий заработок',
    'average_cr': 'Средний CR',
    'total_payout': 'Общие выплаты',

    // Dashboard
    'revenue_overview': 'Обзор доходов',
    'recent_activity': 'Последняя активность',
    'top_performers': 'Лучшие партнеры',
    'recent_offers': 'Последние офферы',
    'system_status': 'Состояние системы и уведомления',
    'performance_overview': 'Обзор производительности',
    'quick_actions': 'Быстрые действия',

    // Offers
    'create_offer': 'Создать оффер',
    'offer_name': 'Название оффера',
    'offer_description': 'Описание оффера',
    'category': 'Категория',
    'payout': 'Выплата',
    'payout_type': 'Тип выплаты',
    'landing_page': 'Лендинг',
    'tracking_url': 'URL трекинга',
    'restrictions': 'Ограничения',
    'kyc_required': 'KYC обязателен',
    'private_offer': 'Приватный оффер',
    'geo_targeting': 'Гео таргетинг',
    'traffic_sources': 'Источники трафика',

    // Statistics
    'clicks': 'Клики',
    'unique_clicks': 'Уникальные клики',
    'leads': 'Лиды',
    'conversions': 'Конверсии',
    'approved': 'Подтверждено',
    'rejected': 'Отклонено',
    'pending': 'В ожидании',
    'revenue': 'Доход',
    'earnings': 'Заработок',
    'epc': 'EPC',
    'cr': 'CR',
    'ctr': 'CTR',

    // Tracking
    'tracking_links': 'Трекинговые ссылки',
    'tracking_code': 'Код трекинга',
    'generate_link': 'Создать ссылку',
    'sub_id': 'Sub ID',
    'source': 'Источник',
    'campaign': 'Кампания',
    'medium': 'Канал',

    // Finance
    'balance': 'Баланс',
    'transactions': 'Транзакции',
    'deposits': 'Пополнения',
    'withdrawals': 'Выводы',
    'payouts': 'Выплаты',
    'commission': 'Комиссия',
    'invoice': 'Счет',
    'payment_method': 'Способ оплаты',
    'amount': 'Сумма',
    'reference': 'Ссылка',

    // Support
    'tickets': 'Тикеты',
    'create_ticket': 'Создать тикет',
    'subject': 'Тема',
    'message': 'Сообщение',
    'priority': 'Приоритет',
    'assigned_to': 'Назначен',
    'open': 'Открыт',
    'closed': 'Закрыт',
    'resolved': 'Решен',

    // Status messages
    'success': 'Успех',
    'error': 'Ошибка',
    'warning': 'Предупреждение',
    'info': 'Информация',
    'operation_completed': 'Операция выполнена успешно',
    'data_updated': 'Данные обновлены успешно',
    'data_deleted': 'Данные удалены успешно',
    'data_created': 'Данные созданы успешно',

    // Time periods
    'today': 'Сегодня',
    'yesterday': 'Вчера',
    'last_7_days': 'Последние 7 дней',
    'last_30_days': 'Последние 30 дней',
    'this_month': 'Этот месяц',
    'last_month': 'Прошлый месяц',
    'this_year': 'Этот год',
    'last_year': 'Прошлый год',
    'custom': 'Настраиваемый',

    // Admin specific
    'super_admin': 'Супер Админ',
    'advertiser': 'Рекламодатель',
    'affiliate': 'Партнер',
    'staff': 'Сотрудник',
    'add_user': 'Добавить пользователя',
    'edit_user': 'Редактировать пользователя',
    'delete_user': 'Удалить пользователя',
    'approve_user': 'Одобрить пользователя',
    'block_user': 'Заблокировать пользователя',
    'unblock_user': 'Разблокировать пользователя',
    'no_users_found': 'Пользователи не найдены',
    'no_offers_found': 'Офферы не найдены',
    'total_users': 'Всего пользователей',
    'pending_approvals': 'Ожидают одобрения',
    'fraud_alerts_count': 'Фрод уведомления',
    'system_health': 'Здоровье системы',
    'overview': 'Обзор',
    'financial_management': 'Финансовое управление',
    'transaction_monitoring': 'Мониторинг транзакций',
    'payout_management': 'Управление выплатами',
    'commission_tracking': 'Отслеживание комиссий',
    'suspicious_activity': 'Подозрительная активность',
    'fraud_prevention': 'Предотвращение мошенничества',
    'risk_assessment': 'Оценка рисков',
    'security_alerts': 'Уведомления безопасности',
    
    // Offer management specific
    'manage_all_offers_platform': 'Управление всеми офферами на платформе',
    'all_statuses': 'Все статусы',
    'draft': 'Черновик',
    'moderation_status': 'Статус модерации',
    'needs_revision': 'Требует доработки',
    'all_categories': 'Все категории',
    'dating': 'Знакомства',
    'gaming': 'Игры',
    'health': 'Здоровье',
    'all_advertisers': 'Все рекламодатели',
    'all_countries': 'Все страны',
    'archived': 'Архивный',
    'blocked': 'Заблокирован',
    'actions': 'Действия',
    'details': 'Детали',
    'creatives': 'Креативы',
    'history': 'История',
    'no_restrictions': 'Нет ограничений',
    'no_creatives_available': 'Креативы не доступны',
    'no_history_available': 'История не доступна',
    'edit_offer': 'Редактировать оффер',
    'edit_offer_details': 'Редактировать детали и настройки оффера',
    'enter_fraud_restrictions': 'Введите ограничения по фроду',
    'smartlink_enabled': 'SmartLink включен',
    'block_offer': 'Заблокировать оффер',
    'enter_blocked_reason': 'Введите причину блокировки',
    'moderate_offer': 'Модерировать оффер',
    'approve': 'Одобрить',
    'reject': 'Отклонить',
    'archive': 'Архивировать',
    'comment': 'Комментарий',
    'enter_moderation_comment': 'Введите комментарий модерации',
  },
};

export class I18nService {
  private static currentLanguage = 'en';
  private static fallbackLanguage = 'en';

  static setLanguage(language: string): void {
    if (translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('language', language);
    }
  }

  static getLanguage(): string {
    return this.currentLanguage;
  }

  static loadSavedLanguage(): void {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      this.currentLanguage = savedLanguage;
    }
  }

  static translate(key: string, language?: string): string {
    const lang = language || this.currentLanguage;
    const translation = translations[lang]?.[key] || translations[this.fallbackLanguage]?.[key];
    return translation || key;
  }

  static getAvailableLanguages(): string[] {
    return Object.keys(translations);
  }

  static getLanguageName(code: string): string {
    const names: { [key: string]: string } = {
      'en': 'English',
      'ru': 'Русский'
    };
    return names[code] || code;
  }
}

export const t = (key: string, language?: string): string => {
  return I18nService.translate(key, language);
};