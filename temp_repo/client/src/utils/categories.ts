import { 
  Gamepad2, 
  Dices, 
  Heart, 
  TrendingUp, 
  Shield, 
  ShoppingCart, 
  Smartphone,
  Car,
  GraduationCap,
  Home,
  Plane,
  Utensils,
  Music,
  Camera,
  Briefcase,
  Package
} from "lucide-react";

interface CategoryProps {
  label: string;
  className: string;
  icon?: any;
}

const categoryMap: Record<string, CategoryProps> = {
  // Gambling & Gaming
  'gambling': {
    label: 'Гемблинг',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    icon: Dices
  },
  'gaming': {
    label: 'Игры',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    icon: Gamepad2
  },
  'casino': {
    label: 'Казино',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    icon: Dices
  },

  // Dating & Social
  'dating': {
    label: 'Знакомства',
    className: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
    icon: Heart
  },
  'social': {
    label: 'Социальные',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    icon: Heart
  },

  // Finance & Trading
  'finance': {
    label: 'Финансы',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    icon: TrendingUp
  },
  'trading': {
    label: 'Трейдинг',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
    icon: TrendingUp
  },
  'crypto': {
    label: 'Криптовалюта',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    icon: TrendingUp
  },

  // Software & Tools
  'software': {
    label: 'ПО',
    className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
    icon: Shield
  },
  'vpn': {
    label: 'VPN',
    className: 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300',
    icon: Shield
  },
  'antivirus': {
    label: 'Антивирус',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    icon: Shield
  },

  // E-commerce & Shopping
  'ecommerce': {
    label: 'E-commerce',
    className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300',
    icon: ShoppingCart
  },
  'shopping': {
    label: 'Покупки',
    className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
    icon: ShoppingCart
  },

  // Mobile & Apps
  'mobile': {
    label: 'Мобильные',
    className: 'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300',
    icon: Smartphone
  },
  'app': {
    label: 'Приложения',
    className: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/20 dark:text-fuchsia-300',
    icon: Smartphone
  },

  // Other categories
  'automotive': {
    label: 'Автомобили',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    icon: Car
  },
  'education': {
    label: 'Образование',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    icon: GraduationCap
  },
  'realestate': {
    label: 'Недвижимость',
    className: 'bg-brown-100 text-brown-800 dark:bg-brown-900/20 dark:text-brown-300',
    icon: Home
  },
  'travel': {
    label: 'Путешествия',
    className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300',
    icon: Plane
  },
  'food': {
    label: 'Еда',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
    icon: Utensils
  },
  'entertainment': {
    label: 'Развлечения',
    className: 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300',
    icon: Music
  },
  'photography': {
    label: 'Фотография',
    className: 'bg-lime-100 text-lime-800 dark:bg-lime-900/20 dark:text-lime-300',
    icon: Camera
  },
  'business': {
    label: 'Бизнес',
    className: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-300',
    icon: Briefcase
  }
};

export function getCategoryBadgeProps(category: string): CategoryProps {
  const normalizedCategory = category?.toLowerCase();
  return categoryMap[normalizedCategory] || {
    label: category || 'Другое',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    icon: Package
  };
}