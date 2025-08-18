"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./dialog"
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "./tabs"
import { Button } from "./button"
import { Input } from "./input"
import { Badge } from "./badge"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { ScrollArea } from "./scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible"
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  Video,
  FileText,
  Lightbulb,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FAQItem {
  id: string
  question: string
  answer: React.ReactNode
  category: string
  tags: string[]
}

interface TutorialItem {
  id: string
  title: string
  description: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  steps: string[]
  videoUrl?: string
}

interface GuideItem {
  id: string
  title: string
  description: string
  content: React.ReactNode
  category: string
}

const defaultFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'Как создать новый оффер?',
    answer: (
      <div>
        <p>Для создания нового оффера:</p>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Перейдите на страницу "Мои офферы"</li>
          <li>Нажмите кнопку "+ Создать оффер"</li>
          <li>Заполните основную информацию об оффере</li>
          <li>Настройте ссылки и таргетинг</li>
          <li>Сохраните оффер</li>
        </ol>
      </div>
    ),
    category: 'offers',
    tags: ['создание', 'оффер', 'новый']
  },
  {
    id: '2',
    question: 'Почему кнопка "Сохранить" недоступна?',
    answer: (
      <div>
        <p>Кнопка "Сохранить" может быть недоступна по следующим причинам:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Не заполнены обязательные поля</li>
          <li>Данные уже сохраняются</li>
          <li>Недостаточно прав доступа</li>
          <li>Ошибка валидации формы</li>
        </ul>
      </div>
    ),
    category: 'interface',
    tags: ['кнопка', 'сохранить', 'недоступна', 'форма']
  },
  {
    id: '3',
    question: 'Как настроить постбеки?',
    answer: (
      <div>
        <p>Для настройки постбеков:</p>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Откройте раздел "Управление постбеками"</li>
          <li>Нажмите "Добавить постбек"</li>
          <li>Выберите оффер и событие</li>
          <li>Укажите URL для отправки данных</li>
          <li>Протестируйте постбек</li>
        </ol>
      </div>
    ),
    category: 'postbacks',
    tags: ['постбек', 'настройка', 'URL', 'событие']
  }
]

const defaultTutorials: TutorialItem[] = [
  {
    id: '1',
    title: 'Начало работы с AdLinkPro',
    description: 'Пошаговое руководство для новых пользователей',
    duration: '10 мин',
    difficulty: 'beginner',
    steps: [
      'Регистрация и вход в систему',
      'Настройка профиля',
      'Создание первого оффера',
      'Получение ссылок для трафика',
      'Просмотр статистики'
    ]
  },
  {
    id: '2',
    title: 'Продвинутый таргетинг',
    description: 'Настройка сложных условий таргетинга',
    duration: '15 мин',
    difficulty: 'advanced',
    steps: [
      'Геотаргетинг по странам и городам',
      'Настройка устройств и браузеров',
      'Временной таргетинг',
      'Использование SubID параметров',
      'A/B тестирование офферов'
    ]
  }
]

const defaultGuides: GuideItem[] = [
  {
    id: '1',
    title: 'API Документация',
    description: 'Подробное описание API эндпоинтов',
    content: (
      <div className="space-y-4">
        <h4 className="font-semibold">Основные эндпоинты:</h4>
        <div className="space-y-2">
          <div className="p-3 bg-muted rounded-md">
            <code>GET /api/offers</code> - Получить список офферов
          </div>
          <div className="p-3 bg-muted rounded-md">
            <code>POST /api/offers</code> - Создать новый оффер
          </div>
          <div className="p-3 bg-muted rounded-md">
            <code>GET /api/statistics</code> - Получить статистику
          </div>
        </div>
      </div>
    ),
    category: 'api'
  }
]

interface HelpCenterProps {
  faqs?: FAQItem[]
  tutorials?: TutorialItem[]
  guides?: GuideItem[]
  onClose?: () => void
}

const HelpCenter: React.FC<HelpCenterProps> = ({
  faqs = defaultFAQs,
  tutorials = defaultTutorials,
  guides = defaultGuides,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('faq')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const filteredFAQs = useMemo(() => {
    if (!searchTerm) return faqs
    return faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [faqs, searchTerm])

  const faqCategories = useMemo(() => {
    const categories = [...new Set(faqs.map(faq => faq.category))]
    return categories
  }, [faqs])

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Центр помощи</h2>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по часто задаваемым вопросам..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Уроки
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Руководства
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="mt-6">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ничего не найдено по запросу "{searchTerm}"</p>
                </div>
              ) : (
                filteredFAQs.map((faq) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Collapsible
                      open={expandedFAQ === faq.id}
                      onOpenChange={(open) => setExpandedFAQ(open ? faq.id : null)}
                    >
                      <Card className="overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base text-left">
                                {faq.question}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {faq.category}
                                </Badge>
                                {expandedFAQ === faq.id ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </div>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            <div className="text-muted-foreground">
                              {faq.answer}
                            </div>
                            <div className="flex gap-1 mt-3">
                              {faq.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tutorials" className="mt-6">
          <ScrollArea className="h-[600px] pr-4">
            <div className="grid gap-4 md:grid-cols-2">
              {tutorials.map((tutorial) => (
                <motion.div
                  key={tutorial.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base mb-2">
                            {tutorial.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {tutorial.description}
                          </p>
                        </div>
                        <Badge
                          variant={
                            tutorial.difficulty === 'beginner' ? 'default' :
                            tutorial.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                          }
                          className="ml-2"
                        >
                          {tutorial.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {tutorial.duration}
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Шаги:</h5>
                          <ol className="list-decimal list-inside text-sm space-y-1">
                            {tutorial.steps.map((step, index) => (
                              <li key={index} className="text-muted-foreground">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                        <Button size="sm" className="w-full">
                          <Video className="h-4 w-4 mr-2" />
                          Начать урок
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="guides" className="mt-6">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {guides.map((guide) => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base mb-2">
                            {guide.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {guide.description}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {guide.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {guide.content}
                      <Button size="sm" variant="outline" className="mt-4">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Подробнее
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Help button component for navigation
interface HelpButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
}

const HelpButton: React.FC<HelpButtonProps> = ({ 
  className, 
  variant = 'ghost' 
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm" className={cn("gap-2", className)}>
          <HelpCircle className="h-4 w-4" />
          Помощь
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="sr-only">Центр помощи</DialogTitle>
        </DialogHeader>
        <HelpCenter />
      </DialogContent>
    </Dialog>
  )
}

export { HelpCenter, HelpButton, type FAQItem, type TutorialItem, type GuideItem }