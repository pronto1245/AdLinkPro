import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { i18nService } from "@/services/i18n";

export function LanguageToggle() {
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18nService.getCurrentLanguage());

  useEffect(() => {
    // Listen for language change events
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  const changeLanguage = async (lng: string) => {
    try {
      await i18nService.changeLanguageWithServerSync(lng);
      setCurrentLanguage(lng);
    } catch (error) {
      console.error('Failed to change language:', error);
      // Fallback to basic language change
      await i18nService.changeLanguage(lng);
      setCurrentLanguage(lng);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" title={t('language.select', 'Select language')}>
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => changeLanguage("ru")}
          className={currentLanguage === 'ru' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇷🇺</span>
          {t('language.russian', 'Русский')}
          {currentLanguage === 'ru' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage("en")}
          className={currentLanguage === 'en' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇺🇸</span>
          {t('language.english', 'English')}
          {currentLanguage === 'en' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}