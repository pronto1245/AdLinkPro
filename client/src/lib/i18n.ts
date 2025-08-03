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
    'in_progress': 'In Progress',
    'resolved': 'Resolved',
    'closed': 'Closed',

    // Time periods
    'today': 'Today',
    'yesterday': 'Yesterday',
    'last_7_days': 'Last 7 days',
    'last_30_days': 'Last 30 days',
    'last_90_days': 'Last 90 days',
    'this_month': 'This month',
    'last_month': 'Last month',
    'this_year': 'This year',
    'custom_range': 'Custom range',

    // Status messages
    'success': 'Success',
    'error': 'Error',
    'warning': 'Warning',
    'info': 'Info',
    'no_data': 'No data available',
    'no_results': 'No results found',
    'data_updated': 'Data updated successfully',
    'operation_completed': 'Operation completed successfully',
    'operation_failed': 'Operation failed',
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
    'logout': 'Выйти',
    'register': 'Регистрация',
    'username': 'Имя пользователя',
    'password': 'Пароль',
    'email': 'Email',
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
    'active': 'Активный',
    'inactive': 'Неактивный',
    'created': 'Создан',
    'updated': 'Обновлен',

    // Metrics
    'total_revenue': 'Общий доход',
    'active_partners': 'Активные партнеры',
    'active_offers': 'Активные офферы',
    'total_partners': 'Всего партнеров',
    'conversion_rate': 'Конверсия',
    'fraud_rate': 'Уровень фрода',
    'total_clicks': 'Всего кликов',
    'total_conversions': 'Всего конверсий',
    'total_earnings': 'Общий заработок',
    'average_cr': 'Средняя конверсия',
    'total_payout': 'Общие выплаты',

    // Dashboard
    'revenue_overview': 'Обзор доходов',
    'recent_activity': 'Последняя активность',
    'top_performers': 'Топ партнеры',
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
    'in_progress': 'В работе',
    'resolved': 'Решен',
    'closed': 'Закрыт',

    // Time periods
    'today': 'Сегодня',
    'yesterday': 'Вчера',
    'last_7_days': 'Последние 7 дней',
    'last_30_days': 'Последние 30 дней',
    'last_90_days': 'Последние 90 дней',
    'this_month': 'Этот месяц',
    'last_month': 'Прошлый месяц',
    'this_year': 'Этот год',
    'custom_range': 'Произвольный период',

    // Status messages
    'success': 'Успешно',
    'error': 'Ошибка',
    'warning': 'Предупреждение',
    'info': 'Информация',
    'no_data': 'Нет данных',
    'no_results': 'Результаты не найдены',
    'data_updated': 'Данные успешно обновлены',
    'operation_completed': 'Операция завершена успешно',
    'operation_failed': 'Операция не удалась',
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
    const translation = translations[lang]?.[key];
    
    if (translation) {
      return translation;
    }

    // Fallback to default language
    const fallbackTranslation = translations[this.fallbackLanguage]?.[key];
    if (fallbackTranslation) {
      return fallbackTranslation;
    }

    // Return the key if no translation found
    return key;
  }

  static getAvailableLanguages(): Array<{ code: string; name: string; flag: string }> {
    return [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    ];
  }

  static interpolate(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return values[key]?.toString() || match;
    });
  }

  static pluralize(key: string, count: number, language?: string): string {
    const lang = language || this.currentLanguage;
    
    // Simple pluralization for English
    if (lang === 'en') {
      const singular = this.translate(key, lang);
      if (count === 1) {
        return singular;
      }
      // Try to find plural form
      const pluralKey = `${key}_plural`;
      const plural = translations[lang]?.[pluralKey];
      return plural || `${singular}s`;
    }

    // Russian pluralization is more complex and would need additional logic
    // For now, just return the base translation
    return this.translate(key, lang);
  }
}

// Utility function for React components
export function useTranslation() {
  return {
    t: (key: string, values?: Record<string, string | number>) => {
      const translation = I18nService.translate(key);
      return values ? I18nService.interpolate(translation, values) : translation;
    },
    language: I18nService.getLanguage(),
    setLanguage: I18nService.setLanguage.bind(I18nService),
    availableLanguages: I18nService.getAvailableLanguages(),
  };
}
