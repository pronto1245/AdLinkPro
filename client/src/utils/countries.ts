// Mapping стран для отображения флагов и кодов
export const COUNTRIES: Record<string, { code: string; flag: string; name: string }> = {
  // Основные страны (по названию на русском/английском)
  'russia': { code: 'RU', flag: '🇷🇺', name: 'Russia' },
  'ukraine': { code: 'UA', flag: '🇺🇦', name: 'Ukraine' },
  'belarus': { code: 'BY', flag: '🇧🇾', name: 'Belarus' },
  'kazakhstan': { code: 'KZ', flag: '🇰🇿', name: 'Kazakhstan' },
  'turkey': { code: 'TR', flag: '🇹🇷', name: 'Turkey' },
  'germany': { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  'france': { code: 'FR', flag: '🇫🇷', name: 'France' },
  'italy': { code: 'IT', flag: '🇮🇹', name: 'Italy' },
  'spain': { code: 'ES', flag: '🇪🇸', name: 'Spain' },
  'poland': { code: 'PL', flag: '🇵🇱', name: 'Poland' },
  'czech republic': { code: 'CZ', flag: '🇨🇿', name: 'Czech Republic' },
  'hungary': { code: 'HU', flag: '🇭🇺', name: 'Hungary' },
  'romania': { code: 'RO', flag: '🇷🇴', name: 'Romania' },
  'bulgaria': { code: 'BG', flag: '🇧🇬', name: 'Bulgaria' },
  'greece': { code: 'GR', flag: '🇬🇷', name: 'Greece' },
  'serbia': { code: 'RS', flag: '🇷🇸', name: 'Serbia' },
  'croatia': { code: 'HR', flag: '🇭🇷', name: 'Croatia' },
  'slovenia': { code: 'SI', flag: '🇸🇮', name: 'Slovenia' },
  'slovakia': { code: 'SK', flag: '🇸🇰', name: 'Slovakia' },
  'lithuania': { code: 'LT', flag: '🇱🇹', name: 'Lithuania' },
  'latvia': { code: 'LV', flag: '🇱🇻', name: 'Latvia' },
  'estonia': { code: 'EE', flag: '🇪🇪', name: 'Estonia' },
  'finland': { code: 'FI', flag: '🇫🇮', name: 'Finland' },
  'sweden': { code: 'SE', flag: '🇸🇪', name: 'Sweden' },
  'norway': { code: 'NO', flag: '🇳🇴', name: 'Norway' },
  'denmark': { code: 'DK', flag: '🇩🇰', name: 'Denmark' },
  'netherlands': { code: 'NL', flag: '🇳🇱', name: 'Netherlands' },
  'belgium': { code: 'BE', flag: '🇧🇪', name: 'Belgium' },
  'austria': { code: 'AT', flag: '🇦🇹', name: 'Austria' },
  'switzerland': { code: 'CH', flag: '🇨🇭', name: 'Switzerland' },
  'portugal': { code: 'PT', flag: '🇵🇹', name: 'Portugal' },
  'ireland': { code: 'IE', flag: '🇮🇪', name: 'Ireland' },
  'united kingdom': { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  'canada': { code: 'CA', flag: '🇨🇦', name: 'Canada' },
  'united states': { code: 'US', flag: '🇺🇸', name: 'United States' },
  'mexico': { code: 'MX', flag: '🇲🇽', name: 'Mexico' },
  'brazil': { code: 'BR', flag: '🇧🇷', name: 'Brazil' },
  'argentina': { code: 'AR', flag: '🇦🇷', name: 'Argentina' },
  'chile': { code: 'CL', flag: '🇨🇱', name: 'Chile' },
  'colombia': { code: 'CO', flag: '🇨🇴', name: 'Colombia' },
  'peru': { code: 'PE', flag: '🇵🇪', name: 'Peru' },
  'venezuela': { code: 'VE', flag: '🇻🇪', name: 'Venezuela' },
  'japan': { code: 'JP', flag: '🇯🇵', name: 'Japan' },
  'china': { code: 'CN', flag: '🇨🇳', name: 'China' },
  'south korea': { code: 'KR', flag: '🇰🇷', name: 'South Korea' },
  'north korea': { code: 'KP', flag: '🇰🇵', name: 'North Korea' },
  'india': { code: 'IN', flag: '🇮🇳', name: 'India' },
  'thailand': { code: 'TH', flag: '🇹🇭', name: 'Thailand' },
  'vietnam': { code: 'VN', flag: '🇻🇳', name: 'Vietnam' },
  'indonesia': { code: 'ID', flag: '🇮🇩', name: 'Indonesia' },
  'malaysia': { code: 'MY', flag: '🇲🇾', name: 'Malaysia' },
  'singapore': { code: 'SG', flag: '🇸🇬', name: 'Singapore' },
  'philippines': { code: 'PH', flag: '🇵🇭', name: 'Philippines' },
  'australia': { code: 'AU', flag: '🇦🇺', name: 'Australia' },
  'new zealand': { code: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
  'israel': { code: 'IL', flag: '🇮🇱', name: 'Israel' },
  'saudi arabia': { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  'uae': { code: 'AE', flag: '🇦🇪', name: 'UAE' },
  'united arab emirates': { code: 'AE', flag: '🇦🇪', name: 'United Arab Emirates' },
  'egypt': { code: 'EG', flag: '🇪🇬', name: 'Egypt' },
  'morocco': { code: 'MA', flag: '🇲🇦', name: 'Morocco' },
  'south africa': { code: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  'nigeria': { code: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  'kenya': { code: 'KE', flag: '🇰🇪', name: 'Kenya' },
  'armenia': { code: 'AM', flag: '🇦🇲', name: 'Armenia' },
  'georgia': { code: 'GE', flag: '🇬🇪', name: 'Georgia' },
  'azerbaijan': { code: 'AZ', flag: '🇦🇿', name: 'Azerbaijan' },
  'uzbekistan': { code: 'UZ', flag: '🇺🇿', name: 'Uzbekistan' },
  'kyrgyzstan': { code: 'KG', flag: '🇰🇬', name: 'Kyrgyzstan' },
  'tajikistan': { code: 'TJ', flag: '🇹🇯', name: 'Tajikistan' },
  'turkmenistan': { code: 'TM', flag: '🇹🇲', name: 'Turkmenistan' },
  'moldova': { code: 'MD', flag: '🇲🇩', name: 'Moldova' },
  'albania': { code: 'AL', flag: '🇦🇱', name: 'Albania' },
  'algeria': { code: 'DZ', flag: '🇩🇿', name: 'Algeria' },
  'angola': { code: 'AO', flag: '🇦🇴', name: 'Angola' },
  'andorra': { code: 'AD', flag: '🇦🇩', name: 'Andorra' },
  'afghanistan': { code: 'AF', flag: '🇦🇫', name: 'Afghanistan' },
  'bangladesh': { code: 'BD', flag: '🇧🇩', name: 'Bangladesh' },
  'iran': { code: 'IR', flag: '🇮🇷', name: 'Iran' },
  'iraq': { code: 'IQ', flag: '🇮🇶', name: 'Iraq' },
  'jordan': { code: 'JO', flag: '🇯🇴', name: 'Jordan' },
  'kuwait': { code: 'KW', flag: '🇰🇼', name: 'Kuwait' },
  'lebanon': { code: 'LB', flag: '🇱🇧', name: 'Lebanon' },
  'oman': { code: 'OM', flag: '🇴🇲', name: 'Oman' },
  'pakistan': { code: 'PK', flag: '🇵🇰', name: 'Pakistan' },
  'qatar': { code: 'QA', flag: '🇶🇦', name: 'Qatar' },
  'syria': { code: 'SY', flag: '🇸🇾', name: 'Syria' },
  'yemen': { code: 'YE', flag: '🇾🇪', name: 'Yemen' },

  // ISO коды напрямую (двухбуквенные коды стран)
  'ru': { code: 'RU', flag: '🇷🇺', name: 'Russia' },
  'ua': { code: 'UA', flag: '🇺🇦', name: 'Ukraine' },
  'by': { code: 'BY', flag: '🇧🇾', name: 'Belarus' },
  'kz': { code: 'KZ', flag: '🇰🇿', name: 'Kazakhstan' },
  'tr': { code: 'TR', flag: '🇹🇷', name: 'Turkey' },
  'de': { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  'fr': { code: 'FR', flag: '🇫🇷', name: 'France' },
  'it': { code: 'IT', flag: '🇮🇹', name: 'Italy' },
  'es': { code: 'ES', flag: '🇪🇸', name: 'Spain' },
  'pl': { code: 'PL', flag: '🇵🇱', name: 'Poland' },
  'cz': { code: 'CZ', flag: '🇨🇿', name: 'Czech Republic' },
  'hu': { code: 'HU', flag: '🇭🇺', name: 'Hungary' },
  'ro': { code: 'RO', flag: '🇷🇴', name: 'Romania' },
  'bg': { code: 'BG', flag: '🇧🇬', name: 'Bulgaria' },
  'gr': { code: 'GR', flag: '🇬🇷', name: 'Greece' },
  'rs': { code: 'RS', flag: '🇷🇸', name: 'Serbia' },
  'hr': { code: 'HR', flag: '🇭🇷', name: 'Croatia' },
  'si': { code: 'SI', flag: '🇸🇮', name: 'Slovenia' },
  'sk': { code: 'SK', flag: '🇸🇰', name: 'Slovakia' },
  'lt': { code: 'LT', flag: '🇱🇹', name: 'Lithuania' },
  'lv': { code: 'LV', flag: '🇱🇻', name: 'Latvia' },
  'ee': { code: 'EE', flag: '🇪🇪', name: 'Estonia' },
  'fi': { code: 'FI', flag: '🇫🇮', name: 'Finland' },
  'se': { code: 'SE', flag: '🇸🇪', name: 'Sweden' },
  'no': { code: 'NO', flag: '🇳🇴', name: 'Norway' },
  'dk': { code: 'DK', flag: '🇩🇰', name: 'Denmark' },
  'nl': { code: 'NL', flag: '🇳🇱', name: 'Netherlands' },
  'be': { code: 'BE', flag: '🇧🇪', name: 'Belgium' },
  'at': { code: 'AT', flag: '🇦🇹', name: 'Austria' },
  'ch': { code: 'CH', flag: '🇨🇭', name: 'Switzerland' },
  'pt': { code: 'PT', flag: '🇵🇹', name: 'Portugal' },
  'ie': { code: 'IE', flag: '🇮🇪', name: 'Ireland' },
  'gb': { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  'ca': { code: 'CA', flag: '🇨🇦', name: 'Canada' },
  'us': { code: 'US', flag: '🇺🇸', name: 'United States' },
  'mx': { code: 'MX', flag: '🇲🇽', name: 'Mexico' },
  'br': { code: 'BR', flag: '🇧🇷', name: 'Brazil' },
  'ar': { code: 'AR', flag: '🇦🇷', name: 'Argentina' },
  'cl': { code: 'CL', flag: '🇨🇱', name: 'Chile' },
  'co': { code: 'CO', flag: '🇨🇴', name: 'Colombia' },
  'pe': { code: 'PE', flag: '🇵🇪', name: 'Peru' },
  've': { code: 'VE', flag: '🇻🇪', name: 'Venezuela' },
  'jp': { code: 'JP', flag: '🇯🇵', name: 'Japan' },
  'cn': { code: 'CN', flag: '🇨🇳', name: 'China' },
  'kr': { code: 'KR', flag: '🇰🇷', name: 'South Korea' },
  'kp': { code: 'KP', flag: '🇰🇵', name: 'North Korea' },
  'in': { code: 'IN', flag: '🇮🇳', name: 'India' },
  'th': { code: 'TH', flag: '🇹🇭', name: 'Thailand' },
  'vn': { code: 'VN', flag: '🇻🇳', name: 'Vietnam' },
  'id': { code: 'ID', flag: '🇮🇩', name: 'Indonesia' },
  'my': { code: 'MY', flag: '🇲🇾', name: 'Malaysia' },
  'sg': { code: 'SG', flag: '🇸🇬', name: 'Singapore' },
  'ph': { code: 'PH', flag: '🇵🇭', name: 'Philippines' },
  'au': { code: 'AU', flag: '🇦🇺', name: 'Australia' },
  'nz': { code: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
  'il': { code: 'IL', flag: '🇮🇱', name: 'Israel' },
  'sa': { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  'ae': { code: 'AE', flag: '🇦🇪', name: 'UAE' },
  'eg': { code: 'EG', flag: '🇪🇬', name: 'Egypt' },
  'ma': { code: 'MA', flag: '🇲🇦', name: 'Morocco' },
  'za': { code: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  'ng': { code: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  'ke': { code: 'KE', flag: '🇰🇪', name: 'Kenya' },
  'am': { code: 'AM', flag: '🇦🇲', name: 'Armenia' },
  'ge': { code: 'GE', flag: '🇬🇪', name: 'Georgia' },
  'az': { code: 'AZ', flag: '🇦🇿', name: 'Azerbaijan' },
  'uz': { code: 'UZ', flag: '🇺🇿', name: 'Uzbekistan' },
  'kg': { code: 'KG', flag: '🇰🇬', name: 'Kyrgyzstan' },
  'tj': { code: 'TJ', flag: '🇹🇯', name: 'Tajikistan' },
  'tm': { code: 'TM', flag: '🇹🇲', name: 'Turkmenistan' },
  'md': { code: 'MD', flag: '🇲🇩', name: 'Moldova' },
  'al': { code: 'AL', flag: '🇦🇱', name: 'Albania' },
  'dz': { code: 'DZ', flag: '🇩🇿', name: 'Algeria' },
  'ao': { code: 'AO', flag: '🇦🇴', name: 'Angola' },
  'ad': { code: 'AD', flag: '🇦🇩', name: 'Andorra' },
  'af': { code: 'AF', flag: '🇦🇫', name: 'Afghanistan' },
  'bd': { code: 'BD', flag: '🇧🇩', name: 'Bangladesh' },
  'ir': { code: 'IR', flag: '🇮🇷', name: 'Iran' },
  'iq': { code: 'IQ', flag: '🇮🇶', name: 'Iraq' },
  'jo': { code: 'JO', flag: '🇯🇴', name: 'Jordan' },
  'kw': { code: 'KW', flag: '🇰🇼', name: 'Kuwait' },
  'lb': { code: 'LB', flag: '🇱🇧', name: 'Lebanon' },
  'om': { code: 'OM', flag: '🇴🇲', name: 'Oman' },
  'pk': { code: 'PK', flag: '🇵🇰', name: 'Pakistan' },
  'qa': { code: 'QA', flag: '🇶🇦', name: 'Qatar' },
  'sy': { code: 'SY', flag: '🇸🇾', name: 'Syria' },
  'ye': { code: 'YE', flag: '🇾🇪', name: 'Yemen' },
};

// Функция для получения информации о стране
export function getCountryInfo(countryInput: string): { code: string; flag: string; name: string } | null {
  if (!countryInput) {
    return null;
  }

  const input = countryInput.toLowerCase().trim();
  
  // Прямое совпадение из COUNTRIES
  if (COUNTRIES[input]) {
    return COUNTRIES[input];
  }
  
  // Поиск по коду (если передан код напрямую)
  const inputUpper = input.toUpperCase();
  const countryByCode = Object.values(COUNTRIES).find(country => 
    country.code === inputUpper
  );
  if (countryByCode) {
    return countryByCode;
  }
  
  // Поиск по частичному совпадению названия
  const countryByPartialName = Object.entries(COUNTRIES).find(([key, country]) =>
    key.includes(input) || 
    country.name.toLowerCase().includes(input)
  );
  if (countryByPartialName) {
    return countryByPartialName[1];
  }
  
  // Если ничего не найдено, возвращаем с кодом как есть (но максимум 2 символа)
  const fallbackCode = input.length <= 2 ? inputUpper : inputUpper.slice(0, 2);
  return {
    code: fallbackCode,
    flag: '🏳️', // generic flag
    name: countryInput
  };
}

// Функция для форматирования списка стран
export function formatCountries(countries?: string[] | string): Array<{ code: string; flag: string; name: string }> {
  if (!countries) {
    return [];
  }

  // Если передана строка, разбиваем по запятой
  const countryList = typeof countries === 'string' 
    ? countries.split(',').map(c => c.trim()).filter(Boolean)
    : countries;

  return countryList.map(country => {
    const info = getCountryInfo(country);
    return info || {
      code: country.toUpperCase(),
      flag: '🏳️',
      name: country
    };
  });
}

// Экспорт списка всех стран для селекта
export const getAllCountries = (): Array<{ value: string; label: string; flag: string }> => {
  return Object.entries(COUNTRIES)
    .filter(([key]) => key.length === 2) // Только ISO коды
    .map(([key, country]) => ({
      value: country.code,
      label: `${country.flag} ${country.name}`,
      flag: country.flag
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};