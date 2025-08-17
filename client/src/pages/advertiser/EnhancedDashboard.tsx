import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Zap, 
  Search, 
  Plus, 
  Settings, 
  BookOpen, 
  HelpCircle, 
  Keyboard,
  Star,
  Bookmark,
  Bell,
  Filter,
  Download,
  Share,
  MoreHorizontal,
  ExternalLink,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Activity,
  Users,
  DollarSign,
  BarChart3,
  Shield,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Link as LinkIcon
} from 'lucide-react';
import { Link } from 'wouter';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
  shortcut?: string;
  color: string;
  featured?: boolean;
}

interface NavigationItem {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  isNew?: boolean;
}

interface HelpTip {
  id: string;
  title: string;
  content: string;
  category: 'getting-started' | 'analytics' | 'optimization' | 'troubleshooting';
  priority: 'high' | 'medium' | 'low';
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'create-offer',
    title: 'Создать оффер',
    description: 'Добавить новый рекламный оффер',
    icon: <Plus className="h-4 w-4" />,
    href: '/advertiser/create-offer',
    shortcut: 'Ctrl+N',
    color: 'bg-blue-500',
    featured: true
  },
  {
    id: 'view-analytics',
    title: 'Аналитика',
    description: 'Просмотреть детальную статистику',
    icon: <BarChart3 className="h-4 w-4" />,
    href: '/advertiser/analytics',
    shortcut: 'Ctrl+A',
    color: 'bg-green-500'
  },
  {
    id: 'business-reports',
    title: 'Бизнес-отчеты',
    description: 'Настроить автоматизированные отчеты',
    icon: <FileText className="h-4 w-4" />,
    href: '/advertiser/business-reports',
    color: 'bg-purple-500',
    featured: true
  },
  {
    id: 'antifraud',
    title: 'Антифрод',
    description: 'Мониторинг подозрительной активности',
    icon: <Shield className="h-4 w-4" />,
    href: '/advertiser/antifraud',
    shortcut: 'Ctrl+F',
    color: 'bg-orange-500'
  },
  {
    id: 'tracker-management',
    title: 'Трекеры',
    description: 'Управление внешними трекерами',
    icon: <Activity className="h-4 w-4" />,
    href: '/advertiser/tracker-management',
    color: 'bg-indigo-500',
    featured: true
  },
  {
    id: 'partner-management',
    title: 'Партнеры',
    description: 'Управление партнерской программой',
    icon: <Users className="h-4 w-4" />,
    href: '/advertiser/partners',
    shortcut: 'Ctrl+P',
    color: 'bg-teal-500'
  }
];

const NAVIGATION_SECTIONS: Record<string, NavigationItem[]> = {
  'Реклама': [
    {
      title: 'Мои офферы',
      description: 'Управление рекламными офферами',
      href: '/advertiser/offers',
      icon: <Target className="h-4 w-4" />,
      badge: '12'
    },
    {
      title: 'Заявки на доступ',
      description: 'Входящие заявки от партнеров',
      href: '/advertiser/access-requests',
      icon: <Bell className="h-4 w-4" />,
      badge: '3',
      isNew: true
    },
    {
      title: 'Креативы',
      description: 'Рекламные материалы',
      href: '/advertiser/creatives',
      icon: <Star className="h-4 w-4" />
    }
  ],
  'Аналитика': [
    {
      title: 'Дашборд',
      description: 'Основная аналитика',
      href: '/advertiser/dashboard',
      icon: <BarChart3 className="h-4 w-4" />
    },
    {
      title: 'Детальная аналитика',
      description: 'Расширенные отчеты',
      href: '/advertiser/analytics',
      icon: <Activity className="h-4 w-4" />
    },
    {
      title: 'Бизнес-отчеты',
      description: 'Автоматизированная отчетность',
      href: '/advertiser/business-reports',
      icon: <FileText className="h-4 w-4" />,
      isNew: true
    }
  ],
  'Безопасность': [
    {
      title: 'Антифрод',
      description: 'Защита от мошенничества',
      href: '/advertiser/antifraud',
      icon: <Shield className="h-4 w-4" />
    },
    {
      title: 'Аудит логи',
      description: 'История действий',
      href: '/advertiser/audit-logs',
      icon: <FileText className="h-4 w-4" />
    }
  ],
  'Интеграции': [
    {
      title: 'Трекеры',
      description: 'Внешние системы трекинга',
      href: '/advertiser/tracker-management',
      icon: <LinkIcon className="h-4 w-4" />,
      isNew: true
    },
    {
      title: 'Постбеки',
      description: 'Настройка уведомлений',
      href: '/advertiser/postbacks',
      icon: <RefreshCw className="h-4 w-4" />
    },
    {
      title: 'API доступ',
      description: 'Ключи и документация',
      href: '/advertiser/api',
      icon: <ExternalLink className="h-4 w-4" />
    }
  ]
};

const HELP_TIPS: HelpTip[] = [
  {
    id: 'getting-started-1',
    title: 'Начало работы',
    content: 'Создайте свой первый оффер и настройте базовые параметры для привлечения партнеров.',
    category: 'getting-started',
    priority: 'high'
  },
  {
    id: 'analytics-1',
    title: 'Настройка аналитики',
    content: 'Используйте бизнес-отчеты для автоматизации получения ключевых метрик.',
    category: 'analytics',
    priority: 'medium'
  },
  {
    id: 'optimization-1',
    title: 'Оптимизация конверсий',
    content: 'Анализируйте данные антифрод системы для повышения качества трафика.',
    category: 'optimization',
    priority: 'medium'
  },
  {
    id: 'troubleshooting-1',
    title: 'Решение проблем',
    content: 'Проверьте настройки трекеров если не приходят конверсии.',
    category: 'troubleshooting',
    priority: 'low'
  }
];

export default function EnhancedDashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [selectedHelpCategory, setSelectedHelpCategory] = useState<string>('getting-started');
  const [bookmarkedActions, setBookmarkedActions] = useState<string[]>(['create-offer', 'view-analytics']);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setShowQuickActions(true);
            break;
          case 'h':
            e.preventDefault();
            setShowHelpDialog(true);
            break;
          case '/':
            e.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
          case 'n':
            e.preventDefault();
            window.location.href = '/advertiser/create-offer';
            break;
          case 'a':
            e.preventDefault();
            window.location.href = '/advertiser/analytics';
            break;
          case 'f':
            e.preventDefault();
            window.location.href = '/advertiser/antifraud';
            break;
          case 'p':
            e.preventDefault();
            window.location.href = '/advertiser/partners';
            break;
        }
      }
      
      if (e.key === 'Escape') {
        setShowQuickActions(false);
        setShowHelpDialog(false);
        setShowKeyboardShortcuts(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickAction = (action: QuickAction) => {
    if (action.href) {
      window.location.href = action.href;
    } else if (action.action) {
      action.action();
    }
    setShowQuickActions(false);
  };

  const toggleBookmark = (actionId: string) => {
    setBookmarkedActions(prev => 
      prev.includes(actionId) 
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  const filteredActions = QUICK_ACTIONS.filter(action =>
    action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredActions = QUICK_ACTIONS.filter(action => action.featured);
  const bookmarkedActionsList = QUICK_ACTIONS.filter(action => bookmarkedActions.includes(action.id));

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Enhanced Header with Search and Quick Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Рекламодатель</h1>
            <p className="text-muted-foreground">Управляйте рекламными кампаниями эффективно</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-input"
                placeholder="Поиск функций (Ctrl+/)"
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Quick Actions Button */}
            <Dialog open={showQuickActions} onOpenChange={setShowQuickActions}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Zap className="h-4 w-4 mr-2" />
                  Быстрые действия
                  <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                    Ctrl+K
                  </kbd>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Быстрые действия</DialogTitle>
                  <DialogDescription>
                    Выберите действие для быстрого выполнения
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Search within actions */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск действий..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Bookmarked Actions */}
                  {bookmarkedActionsList.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Bookmark className="h-4 w-4" />
                        Избранное
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {bookmarkedActionsList.map((action) => (
                          <Button
                            key={action.id}
                            variant="outline"
                            className="justify-start h-auto p-3"
                            onClick={() => handleQuickAction(action)}
                          >
                            <div className={`w-8 h-8 rounded-lg ${action.color} text-white flex items-center justify-center mr-3`}>
                              {action.icon}
                            </div>
                            <div className="text-left">
                              <div className="text-sm font-medium">{action.title}</div>
                              {action.shortcut && (
                                <kbd className="text-xs text-muted-foreground">{action.shortcut}</kbd>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Actions */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Все действия</h4>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                      {filteredActions.map((action) => (
                        <div key={action.id} className="flex items-center">
                          <Button
                            variant="ghost"
                            className="justify-start h-auto p-3 flex-1"
                            onClick={() => handleQuickAction(action)}
                          >
                            <div className={`w-8 h-8 rounded-lg ${action.color} text-white flex items-center justify-center mr-3`}>
                              {action.icon}
                            </div>
                            <div className="text-left flex-1">
                              <div className="text-sm font-medium">{action.title}</div>
                              <div className="text-xs text-muted-foreground">{action.description}</div>
                              {action.shortcut && (
                                <kbd className="text-xs text-muted-foreground mt-1">{action.shortcut}</kbd>
                              )}
                            </div>
                            {action.featured && (
                              <Badge variant="secondary" className="ml-2">Рекомендуется</Badge>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(action.id);
                            }}
                          >
                            <Bookmark 
                              className={`h-4 w-4 ${bookmarkedActions.includes(action.id) ? 'fill-current' : ''}`} 
                            />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Help Button */}
            <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Помощь
                  <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                    Ctrl+H
                  </kbd>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Справка и руководства</DialogTitle>
                  <DialogDescription>
                    Полезные советы и инструкции для эффективной работы
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs value={selectedHelpCategory} onValueChange={setSelectedHelpCategory}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="getting-started">Начало работы</TabsTrigger>
                    <TabsTrigger value="analytics">Аналитика</TabsTrigger>
                    <TabsTrigger value="optimization">Оптимизация</TabsTrigger>
                    <TabsTrigger value="troubleshooting">Решение проблем</TabsTrigger>
                  </TabsList>
                  
                  {(['getting-started', 'analytics', 'optimization', 'troubleshooting'] as const).map((category) => (
                    <TabsContent key={category} value={category} className="space-y-4">
                      {HELP_TIPS.filter(tip => tip.category === category).map((tip) => (
                        <Card key={tip.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center justify-between">
                              {tip.title}
                              <Badge variant={tip.priority === 'high' ? 'default' : 'outline'}>
                                {tip.priority === 'high' ? 'Важно' : 
                                 tip.priority === 'medium' ? 'Полезно' : 'Дополнительно'}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{tip.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </DialogContent>
            </Dialog>

            {/* Keyboard shortcuts */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowKeyboardShortcuts(true)}
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Горячие клавиши</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Featured Quick Actions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredActions.map((action) => (
            <Card key={action.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <Link href={action.href!}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${action.color} text-white flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        {action.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(NAVIGATION_SECTIONS).map(([sectionTitle, items]) => (
            <Card key={sectionTitle}>
              <CardHeader>
                <CardTitle className="text-lg">{sectionTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{item.title}</span>
                            {item.isNew && <Badge variant="secondary" className="text-xs">Новое</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <Badge variant="outline" className="text-xs">{item.badge}</Badge>
                        )}
                        <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Быстрая статистика
                <Button variant="outline" size="sm" asChild>
                  <Link href="/advertiser/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Подробнее
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-muted-foreground">Активных офферов</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">87%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">€2.1K</div>
                  <div className="text-sm text-muted-foreground">Доход за месяц</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">45</div>
                  <div className="text-sm text-muted-foreground">Активных партнеров</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Уведомления
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-2 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Новая заявка на оффер</p>
                  <p className="text-xs text-muted-foreground">5 минут назад</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Конверсия одобрена</p>
                  <p className="text-xs text-muted-foreground">1 час назад</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-orange-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Подозрительная активность</p>
                  <p className="text-xs text-muted-foreground">2 часа назад</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Keyboard Shortcuts Dialog */}
        <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Горячие клавиши</DialogTitle>
              <DialogDescription>
                Используйте эти комбинации для быстрой навигации
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {[
                { key: 'Ctrl+K', description: 'Открыть быстрые действия' },
                { key: 'Ctrl+H', description: 'Открыть справку' },
                { key: 'Ctrl+/', description: 'Фокус на поиске' },
                { key: 'Ctrl+N', description: 'Создать новый оффер' },
                { key: 'Ctrl+A', description: 'Перейти к аналитике' },
                { key: 'Ctrl+F', description: 'Открыть антифрод' },
                { key: 'Ctrl+P', description: 'Управление партнерами' },
                { key: 'Esc', description: 'Закрыть диалоги' }
              ].map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{shortcut.description}</span>
                  <kbd className="px-2 py-1 bg-background border rounded text-xs font-mono">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowKeyboardShortcuts(false)}>
                Закрыть
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}