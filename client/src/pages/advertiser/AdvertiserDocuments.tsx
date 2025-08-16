import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { apiRequest, queryClient } from '../../lib/queryClient';
import {
  FileText,
  Download,
  Search,
  Copy,
  MessageSquare,
  ExternalLink,
  Code,
  Link2,
  Webhook,
  Users,
  Shield,
  Globe,
  BarChart3,
  CreditCard,
  BookOpen,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';

interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  updated: string;
  icon?: React.ComponentType<any>;
  examples?: CodeExample[];
  subsections?: SubSection[];
}

interface CodeExample {
  title: string;
  code: string;
  language: string;
  description: string;
}

interface SubSection {
  id: string;
  title: string;
  content: string;
  examples?: CodeExample[];
}

interface FeedbackData {
  sectionId: string;
  rating: number;
  comment: string;
  isHelpful: boolean;
}

export default function AdvertiserDocuments() {
  const [activeSection, setActiveSection] = useState('tracking');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackForm, setFeedbackForm] = useState<Record<string, FeedbackData>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['tracking']));
  const { toast } = useToast();

  // Data fetching
  const { data: documentationSections, isLoading } = useQuery({
    queryKey: ['/api/advertiser/documentation'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/advertiser/documentation');
        return response as DocumentationSection[];
      } catch (error) {
        // Тихо обрабатываем ошибки загрузки документации
        return [] as DocumentationSection[];
      }
    }
  });

  // Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async (feedback: FeedbackData) => {
      return await apiRequest(`/api/advertiser/documentation/${feedback.sectionId}/feedback`, 'POST', feedback);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Отзыв отправлен",
        description: "Спасибо за ваш отзыв о документации!"
      });
      // Clear feedback form for this section
      setFeedbackForm(prev => ({
        ...prev,
        [variables.sectionId]: {
          sectionId: variables.sectionId,
          rating: 0,
          comment: '',
          isHelpful: false
        }
      }));
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить отзыв",
        variant: "destructive"
      });
    }
  });

  // PDF Download mutation
  const downloadPdfMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/advertiser/documentation/download-pdf', 'POST');
    },
    onSuccess: (response: any) => {
      if (response.url) {
        window.open(response.url, '_blank');
      }
      toast({
        title: "Загрузка начата",
        description: "PDF-версия документации будет загружена"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить PDF",
        variant: "destructive"
      });
    }
  });

  // Mock documentation data with full content
  const mockDocumentationData: DocumentationSection[] = [
    {
      id: 'tracking',
      title: 'Трек-ссылки',
      icon: Link2,
      content: 'Структура и использование трекинговых ссылок для отслеживания трафика',
      updated: '2025-08-06T12:00:00Z',
      examples: [
        {
          title: 'Базовая трек-ссылка',
          code: 'https://track.example.com/click?offer_id=123&partner_id=456&click_id={click_id}',
          language: 'url',
          description: 'Основная структура трек-ссылки с обязательными параметрами'
        },
        {
          title: 'Ссылка с дополнительными параметрами',
          code: 'https://track.example.com/click?offer_id=123&partner_id=456&click_id={click_id}&sub1={sub1}&sub2={sub2}&source=google',
          language: 'url',
          description: 'Трек-ссылка с дополнительными параметрами для детализации'
        }
      ],
      subsections: [
        {
          id: 'parameters',
          title: 'Обязательные параметры',
          content: `
            • offer_id - идентификатор оффера
            • partner_id - идентификатор партнера  
            • click_id - уникальный идентификатор клика
          `
        },
        {
          id: 'optional',
          title: 'Дополнительные параметры',
          content: `
            • sub1, sub2, sub3, sub4, sub5 - пользовательские параметры
            • source - источник трафика
            • campaign - идентификатор кампании
          `
        }
      ]
    },
    {
      id: 'postbacks',
      title: 'Постбэки',
      icon: Webhook,
      content: 'Настройка и использование постбэков для получения уведомлений о конверсиях',
      updated: '2025-08-06T12:00:00Z',
      examples: [
        {
          title: 'Базовый постбэк',
          code: 'https://advertiser.com/postback?click_id={click_id}&status={status}&sum={sum}',
          language: 'url',
          description: 'Основной формат постбэка с базовыми макросами'
        },
        {
          title: 'Расширенный постбэк',
          code: 'https://advertiser.com/postback?click_id={click_id}&status={status}&sum={sum}&goal={goal}&partner_id={partner_id}&offer_id={offer_id}&timestamp={timestamp}',
          language: 'url',
          description: 'Постбэк с дополнительными данными'
        }
      ],
      subsections: [
        {
          id: 'macros',
          title: 'Поддерживаемые макросы',
          content: `
            • {click_id} - ID клика
            • {status} - статус конверсии (approved, rejected, pending)
            • {sum} - сумма выплаты
            • {goal} - цель конверсии
            • {partner_id} - ID партнера
            • {offer_id} - ID оффера
            • {timestamp} - время конверсии
          `
        }
      ]
    },
    {
      id: 'api',
      title: 'API-документация',
      icon: Code,
      content: 'Полная документация по REST API для интеграции с платформой',
      updated: '2025-08-06T12:00:00Z',
      examples: [
        {
          title: 'Авторизация',
          code: `curl -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  https://api.platform.com/api/advertiser/stats`,
          language: 'bash',
          description: 'Пример авторизации с Bearer Token'
        },
        {
          title: 'Получение статистики',
          code: `curl -X GET \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  "https://api.platform.com/api/advertiser/stats?from=2025-08-01&to=2025-08-06"`,
          language: 'bash',
          description: 'Получение статистики за период'
        }
      ]
    },
    {
      id: 'partners',
      title: 'Работа с партнёрами',
      icon: Users,
      content: 'Управление партнёрами, модерация заявок и настройка выплат',
      updated: '2025-08-06T12:00:00Z',
      subsections: [
        {
          id: 'approval',
          title: 'Одобрение партнёров',
          content: `
            1. Перейдите в раздел "Партнёры"
            2. Найдите заявку в статусе "На рассмотрении"
            3. Проверьте данные партнёра
            4. Нажмите "Одобрить" или "Отклонить"
          `
        }
      ]
    },
    {
      id: 'antifraud',
      title: 'Антифрод-система',
      icon: Shield,
      content: 'Настройка и мониторинг системы защиты от мошеннического трафика',
      updated: '2025-08-06T12:00:00Z',
      subsections: [
        {
          id: 'metrics',
          title: 'Отслеживаемые метрики',
          content: `
            • IP-адреса и географическое расположение
            • Частота кликов с одного устройства
            • Паттерны поведения пользователей
            • Качество трафика и конверсий
          `
        }
      ]
    },
    {
      id: 'domains',
      title: 'Домены и HTTPS',
      icon: Globe,
      content: 'Настройка кастомных доменов и SSL-сертификатов',
      updated: '2025-08-06T12:00:00Z',
      examples: [
        {
          title: 'CNAME запись',
          code: 'track.yourdomain.com CNAME track.platform.com',
          language: 'dns',
          description: 'Пример настройки CNAME записи в DNS'
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Аналитика',
      icon: BarChart3,
      content: 'Интерпретация отчётов и ключевые метрики эффективности',
      updated: '2025-08-06T12:00:00Z',
      subsections: [
        {
          id: 'metrics',
          title: 'Ключевые метрики',
          content: `
            • CR (Conversion Rate) - коэффициент конверсии
            • EPC (Earnings Per Click) - доход с клика  
            • ROI (Return on Investment) - возврат инвестиций
            • CTR (Click Through Rate) - кликабельность
          `
        }
      ]
    },
    {
      id: 'finances',
      title: 'Финансы и выплаты',
      icon: CreditCard,
      content: 'Управление балансом, настройка реквизитов и отчёты по выплатам',
      updated: '2025-08-06T12:00:00Z',
      subsections: [
        {
          id: 'payouts',
          title: 'Настройка выплат',
          content: `
            1. Перейдите в раздел "Финансы" 
            2. Добавьте реквизиты для выплат
            3. Установите минимальную сумму выплаты
            4. Выберите периодичность выплат
          `
        }
      ]
    }
  ];

  // Use mock data if API data is not available
  const sections = documentationSections || mockDocumentationData;

  // Filter sections by search query
  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Скопировано",
        description: "Код скопирован в буфер обмена"
      });
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать в буфер обмена",
        variant: "destructive"
      });
    }
  };

  // Submit feedback
  const handleSubmitFeedback = (sectionId: string) => {
    const feedback = feedbackForm[sectionId];
    if (!feedback || feedback.rating === 0) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, поставьте оценку",
        variant: "destructive"
      });
      return;
    }

    feedbackMutation.mutate(feedback);
  };

  // Update feedback form
  const updateFeedback = (sectionId: string, updates: Partial<FeedbackData>) => {
    setFeedbackForm(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        sectionId,
        rating: 0,
        comment: '',
        isHelpful: false,
        ...updates
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Документация</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Полное руководство по использованию платформы
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => downloadPdfMutation.mutate()}
              disabled={downloadPdfMutation.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {downloadPdfMutation.isPending ? 'Загрузка...' : 'Скачать PDF'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-4">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Поиск в документации..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-documentation"
              />
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {filteredSections.map((section) => {
                const Icon = section.icon || FileText;
                const isActive = activeSection === section.id;
                const isExpanded = expandedSections.has(section.id);

                return (
                  <div key={section.id}>
                    <button
                      onClick={() => {
                        setActiveSection(section.id);
                        if (isExpanded) {
                          setExpandedSections(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(section.id);
                            return newSet;
                          });
                        } else {
                          setExpandedSections(prev => new Set(prev).add(section.id));
                        }
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                        isActive 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      data-testid={`nav-section-${section.id}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 font-medium">{section.title}</span>
                      {section.subsections && section.subsections.length > 0 && (
                        <div className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                          {section.subsections.length}
                        </div>
                      )}
                    </button>
                    
                    {/* Subsections */}
                    {isExpanded && section.subsections && (
                      <div className="ml-8 mt-1 space-y-1">
                        {section.subsections.map((subsection) => (
                          <button
                            key={subsection.id}
                            onClick={() => {
                              const element = document.getElementById(`subsection-${subsection.id}`);
                              element?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full text-left p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                            data-testid={`nav-subsection-${subsection.id}`}
                          >
                            {subsection.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Help Button */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => {
                  // Navigate to support page
                  window.location.href = '/advertiser/support';
                }}
                data-testid="button-help-support"
              >
                <HelpCircle className="w-4 h-4" />
                Нужна помощь?
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {filteredSections.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ничего не найдено
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Попробуйте изменить поисковый запрос
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSections.map((section) => {
              if (section.id !== activeSection) return null;
              
              const Icon = section.icon || FileText;
              
              return (
                <div key={section.id} className="space-y-6">
                  {/* Section Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{section.title}</CardTitle>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {section.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              Обновлено: {new Date(section.updated).toLocaleDateString('ru-RU')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Code Examples */}
                  {section.examples && section.examples.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="w-5 h-5" />
                          Примеры кода
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {section.examples.map((example, index) => (
                          <div key={index} className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{example.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {example.description}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(example.code)}
                                data-testid={`copy-example-${index}`}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="p-4 bg-gray-900 text-gray-100 overflow-x-auto">
                              <code className="text-sm font-mono whitespace-pre">
                                {example.code}
                              </code>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Subsections */}
                  {section.subsections && section.subsections.map((subsection) => (
                    <Card key={subsection.id} id={`subsection-${subsection.id}`}>
                      <CardHeader>
                        <CardTitle className="text-xl">{subsection.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose dark:prose-invert max-w-none">
                          <pre className="whitespace-pre-wrap text-sm">
                            {subsection.content}
                          </pre>
                        </div>
                        
                        {/* Subsection Examples */}
                        {subsection.examples && subsection.examples.length > 0 && (
                          <div className="mt-6 space-y-4">
                            <h4 className="font-semibold">Примеры:</h4>
                            {subsection.examples.map((example, index) => (
                              <div key={index} className="border rounded-lg overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b flex items-center justify-between">
                                  <span className="font-medium">{example.title}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(example.code)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="p-4 bg-gray-900 text-gray-100 overflow-x-auto">
                                  <code className="text-sm font-mono">
                                    {example.code}
                                  </code>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {/* Feedback Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Оценить раздел
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Помогла ли вам эта документация?
                        </p>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => updateFeedback(section.id, { rating })}
                              className={`p-1 rounded ${
                                (feedbackForm[section.id]?.rating || 0) >= rating
                                  ? 'text-yellow-500'
                                  : 'text-gray-300 hover:text-yellow-400'
                              }`}
                              data-testid={`rating-${section.id}-${rating}`}
                            >
                              <Star className="w-5 h-5 fill-current" />
                            </button>
                          ))}
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                            {feedbackForm[section.id]?.rating || 0}/5
                          </span>
                        </div>
                      </div>

                      <div>
                        <Textarea
                          placeholder="Оставьте комментарий или предложение..."
                          value={feedbackForm[section.id]?.comment || ''}
                          onChange={(e) => updateFeedback(section.id, { comment: e.target.value })}
                          className="min-h-[100px]"
                          data-testid={`feedback-comment-${section.id}`}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`helpful-${section.id}`}
                            checked={feedbackForm[section.id]?.isHelpful || false}
                            onChange={(e) => updateFeedback(section.id, { isHelpful: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            data-testid={`helpful-checkbox-${section.id}`}
                          />
                          <label 
                            htmlFor={`helpful-${section.id}`}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          >
                            Этот раздел был полезен
                          </label>
                        </div>
                        
                        <Button
                          onClick={() => handleSubmitFeedback(section.id)}
                          disabled={feedbackMutation.isPending}
                          data-testid={`submit-feedback-${section.id}`}
                        >
                          {feedbackMutation.isPending ? 'Отправка...' : 'Отправить отзыв'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}