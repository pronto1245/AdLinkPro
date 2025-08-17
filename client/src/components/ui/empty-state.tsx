"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { 
  HelpCircle, 
  Database, 
  MessageCircle, 
  FileQuestion,
  ExternalLink,
  Mail,
  Phone,
  BookOpen
} from "lucide-react"

interface EmptyStateProps {
  type?: "no-data" | "help" | "faq" | "loading" | "error"
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  helpContent?: HelpContentProps
}

interface HelpContentProps {
  faqs?: Array<{
    question: string
    answer: string
  }>
  contacts?: {
    email?: string
    telegram?: string
    phone?: string
  }
  documentation?: Array<{
    title: string
    url: string
  }>
}

const defaultIcons = {
  "no-data": <Database className="h-8 w-8" />,
  "help": <HelpCircle className="h-8 w-8" />,
  "faq": <FileQuestion className="h-8 w-8" />,
  "loading": <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />,
  "error": <HelpCircle className="h-8 w-8" />
}

const defaultContent = {
  "no-data": {
    title: "Нет данных",
    description: "Данные пока не загружены или отсутствуют"
  },
  "help": {
    title: "Справка",
    description: "Здесь вы найдете полезную информацию и поддержку"
  },
  "faq": {
    title: "Часто задаваемые вопросы",
    description: "Ответы на популярные вопросы пользователей"
  },
  "loading": {
    title: "Загрузка...",
    description: "Пожалуйста, подождите"
  },
  "error": {
    title: "Произошла ошибка",
    description: "Что-то пошло не так, попробуйте еще раз"
  }
}

export function EmptyState({ 
  type = "no-data",
  title,
  description,
  icon,
  action,
  className,
  helpContent
}: EmptyStateProps) {
  const content = defaultContent[type]
  const defaultIcon = defaultIcons[type]

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4 text-muted-foreground">
          {icon || defaultIcon}
        </div>
        
        <CardTitle className="mb-2 text-lg">
          {title || content.title}
        </CardTitle>
        
        <CardDescription className="mb-6 text-sm max-w-md">
          {description || content.description}
        </CardDescription>

        {type === "help" && helpContent && (
          <div className="w-full max-w-2xl space-y-6">
            {/* FAQ Section */}
            {helpContent.faqs && helpContent.faqs.length > 0 && (
              <div className="text-left">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileQuestion className="h-4 w-4" />
                  Часто задаваемые вопросы
                </h3>
                <div className="space-y-4">
                  {helpContent.faqs.map((faq, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{faq.question}</h4>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Section */}
            {helpContent.contacts && (
              <>
                <Separator />
                <div className="text-left">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Связь с поддержкой
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {helpContent.contacts.email && (
                      <div className="flex items-center gap-2 p-3 border rounded-lg">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">{helpContent.contacts.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {helpContent.contacts.telegram && (
                      <div className="flex items-center gap-2 p-3 border rounded-lg">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Telegram</p>
                          <p className="text-sm text-muted-foreground">{helpContent.contacts.telegram}</p>
                        </div>
                      </div>
                    )}
                    
                    {helpContent.contacts.phone && (
                      <div className="flex items-center gap-2 p-3 border rounded-lg">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Телефон</p>
                          <p className="text-sm text-muted-foreground">{helpContent.contacts.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Documentation Section */}
            {helpContent.documentation && helpContent.documentation.length > 0 && (
              <>
                <Separator />
                <div className="text-left">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Документация
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {helpContent.documentation.map((doc, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{doc.title}</span>
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {action && (
          <Button 
            onClick={action.onClick}
            className="mt-4"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}