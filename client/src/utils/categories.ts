// Цветовое кодирование категорий офферов
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border?: string }> = {
  // Игровые категории
  'casino': { bg: 'bg-purple-500', text: 'text-white' },
  'betting': { bg: 'bg-orange-500', text: 'text-white' },
  'poker': { bg: 'bg-red-600', text: 'text-white' },
  'slots': { bg: 'bg-pink-500', text: 'text-white' },
  'sports': { bg: 'bg-green-600', text: 'text-white' },
  'esports': { bg: 'bg-cyan-500', text: 'text-white' },
  'lottery': { bg: 'bg-yellow-500', text: 'text-white' },
  
  // Финансовые категории
  'finance': { bg: 'bg-blue-600', text: 'text-white' },
  'crypto': { bg: 'bg-amber-500', text: 'text-white' },
  'forex': { bg: 'bg-emerald-600', text: 'text-white' },
  'trading': { bg: 'bg-indigo-600', text: 'text-white' },
  'investment': { bg: 'bg-teal-600', text: 'text-white' },
  'banking': { bg: 'bg-slate-600', text: 'text-white' },
  
  // Технические категории
  'mobile': { bg: 'bg-violet-500', text: 'text-white' },
  'dating': { bg: 'bg-rose-500', text: 'text-white' },
  'adult': { bg: 'bg-red-700', text: 'text-white' },
  'health': { bg: 'bg-green-500', text: 'text-white' },
  'beauty': { bg: 'bg-pink-400', text: 'text-white' },
  'diet': { bg: 'bg-lime-500', text: 'text-white' },
  'education': { bg: 'bg-blue-500', text: 'text-white' },
  
  // Потребительские категории
  'shopping': { bg: 'bg-orange-400', text: 'text-white' },
  'fashion': { bg: 'bg-fuchsia-500', text: 'text-white' },
  'travel': { bg: 'bg-sky-500', text: 'text-white' },
  'food': { bg: 'bg-red-500', text: 'text-white' },
  'auto': { bg: 'bg-gray-600', text: 'text-white' },
  'real estate': { bg: 'bg-stone-600', text: 'text-white' },
  'insurance': { bg: 'bg-blue-700', text: 'text-white' },
  
  // Технические и веб
  'software': { bg: 'bg-gray-700', text: 'text-white' },
  'saas': { bg: 'bg-indigo-500', text: 'text-white' },
  'hosting': { bg: 'bg-slate-500', text: 'text-white' },
  'vpn': { bg: 'bg-emerald-500', text: 'text-white' },
  'antivirus': { bg: 'bg-red-600', text: 'text-white' },
  
  // Развлечения
  'streaming': { bg: 'bg-purple-600', text: 'text-white' },
  'gaming': { bg: 'bg-cyan-600', text: 'text-white' },
  'music': { bg: 'bg-pink-600', text: 'text-white' },
  'news': { bg: 'bg-gray-500', text: 'text-white' },
  
  // Услуги
  'delivery': { bg: 'bg-yellow-600', text: 'text-white' },
  'taxi': { bg: 'bg-yellow-500', text: 'text-black' },
  'utilities': { bg: 'bg-blue-400', text: 'text-white' },
  'telecom': { bg: 'bg-purple-400', text: 'text-white' },
  
  // Русские названия категорий
  'казино': { bg: 'bg-purple-500', text: 'text-white' },
  'ставки': { bg: 'bg-orange-500', text: 'text-white' },
  'покер': { bg: 'bg-red-600', text: 'text-white' },
  'слоты': { bg: 'bg-pink-500', text: 'text-white' },
  'спорт': { bg: 'bg-green-600', text: 'text-white' },
  'киберспорт': { bg: 'bg-cyan-500', text: 'text-white' },
  'лотерея': { bg: 'bg-yellow-500', text: 'text-white' },
  'финансы': { bg: 'bg-blue-600', text: 'text-white' },
  'криптовалюта': { bg: 'bg-amber-500', text: 'text-white' },
  'форекс': { bg: 'bg-emerald-600', text: 'text-white' },
  'трейдинг': { bg: 'bg-indigo-600', text: 'text-white' },
  'инвестиции': { bg: 'bg-teal-600', text: 'text-white' },
  'банкинг': { bg: 'bg-slate-600', text: 'text-white' },
  'мобильные': { bg: 'bg-violet-500', text: 'text-white' },
  'знакомства': { bg: 'bg-rose-500', text: 'text-white' },
  'взрослые': { bg: 'bg-red-700', text: 'text-white' },
  'здоровье': { bg: 'bg-green-500', text: 'text-white' },
  'красота': { bg: 'bg-pink-400', text: 'text-white' },
  'диеты': { bg: 'bg-lime-500', text: 'text-white' },
  'образование': { bg: 'bg-blue-500', text: 'text-white' },
  'покупки': { bg: 'bg-orange-400', text: 'text-white' },
  'мода': { bg: 'bg-fuchsia-500', text: 'text-white' },
  'путешествия': { bg: 'bg-sky-500', text: 'text-white' },
  'еда': { bg: 'bg-red-500', text: 'text-white' },
  'авто': { bg: 'bg-gray-600', text: 'text-white' },
  'недвижимость': { bg: 'bg-stone-600', text: 'text-white' },
  'страхование': { bg: 'bg-blue-700', text: 'text-white' },
  'софт': { bg: 'bg-gray-700', text: 'text-white' },
  'хостинг': { bg: 'bg-slate-500', text: 'text-white' },
  'впн': { bg: 'bg-emerald-500', text: 'text-white' },
  'антивирус': { bg: 'bg-red-600', text: 'text-white' },
  'стриминг': { bg: 'bg-purple-600', text: 'text-white' },
  'игры': { bg: 'bg-cyan-600', text: 'text-white' },
  'музыка': { bg: 'bg-pink-600', text: 'text-white' },
  'новости': { bg: 'bg-gray-500', text: 'text-white' },
  'доставка': { bg: 'bg-yellow-600', text: 'text-white' },
  'такси': { bg: 'bg-yellow-500', text: 'text-black' },
  'коммунальные': { bg: 'bg-blue-400', text: 'text-white' },
  'телеком': { bg: 'bg-purple-400', text: 'text-white' }
};

// Функция для получения цвета категории
export function getCategoryColor(category: string): { bg: string; text: string } {
  const normalizedCategory = category?.toLowerCase().trim();
  return CATEGORY_COLORS[normalizedCategory] || { bg: 'bg-gray-500', text: 'text-white' };
}

// Функция для создания Badge с цветом категории
export function getCategoryBadgeProps(category: string) {
  const colors = getCategoryColor(category);
  return {
    className: `${colors.bg} ${colors.text} hover:opacity-90 transition-opacity`
  };
}