import { useState } from "react";
import { cn } from "@/lib/utils";

interface OfferLogoProps {
  name: string;
  logo?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTooltip?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm", 
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg"
};

export function OfferLogo({ 
  name, 
  logo, 
  size = "md", 
  className, 
  showTooltip = false 
}: OfferLogoProps) {
  const [imageError, setImageError] = useState(false);
  
  // Получаем первые две буквы из названия оффера
  const getInitials = (offerName: string): string => {
    if (!offerName) return "??";
    
    // Удаляем спецсимволы и разбиваем на слова
    const words = offerName
      .replace(/[^\w\s\u0400-\u04FF]/g, '') // Оставляем только буквы, цифры, пробелы и кириллицу
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    if (words.length === 0) return "??";
    
    if (words.length === 1) {
      // Если одно слово, берем первые две буквы
      return words[0].substring(0, 2).toUpperCase();
    } else {
      // Если несколько слов, берем первую букву каждого из первых двух слов
      return (words[0][0] + words[1][0]).toUpperCase();
    }
  };

  // Если есть логотип и он не завалился - показываем картинку
  if (logo && !imageError) {
    return (
      <div 
        className={cn(
          "relative inline-flex items-center justify-center rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800",
          sizeClasses[size],
          className
        )}
        title={showTooltip ? name : undefined}
        data-testid="offer-logo-image"
      >
        <img
          src={logo}
          alt={`Логотип ${name}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
      </div>
    );
  }

  // Fallback - показываем первые две буквы названия
  const initials = getInitials(name);
  
  return (
    <div 
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg font-semibold",
        "bg-gradient-to-br from-blue-500 to-purple-600 text-white",
        "shadow-sm border border-gray-200 dark:border-gray-700",
        sizeClasses[size],
        className
      )}
      title={showTooltip ? name : undefined}
      data-testid="offer-logo-initials"
    >
      {initials}
    </div>
  );
}