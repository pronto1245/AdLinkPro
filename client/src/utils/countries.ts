interface Country {
  code: string;
  name: string;
  flag: string;
}

const countries: Record<string, Country> = {
  'RU': { code: 'RU', name: 'Россия', flag: '🇷🇺' },
  'US': { code: 'US', name: 'США', flag: '🇺🇸' },
  'GB': { code: 'GB', name: 'Великобритания', flag: '🇬🇧' },
  'DE': { code: 'DE', name: 'Германия', flag: '🇩🇪' },
  'FR': { code: 'FR', name: 'Франция', flag: '🇫🇷' },
  'IT': { code: 'IT', name: 'Италия', flag: '🇮🇹' },
  'KZ': { code: 'KZ', name: 'Казахстан', flag: '🇰🇿' },
  'UA': { code: 'UA', name: 'Украина', flag: '🇺🇦' },
  'BR': { code: 'BR', name: 'Бразилия', flag: '🇧🇷' },
  'IN': { code: 'IN', name: 'Индия', flag: '🇮🇳' },
  'PH': { code: 'PH', name: 'Филиппины', flag: '🇵🇭' },
  'CA': { code: 'CA', name: 'Канада', flag: '🇨🇦' },
  'CN': { code: 'CN', name: 'Китай', flag: '🇨🇳' },
  'TR': { code: 'TR', name: 'Турция', flag: '🇹🇷' },
};

export function getCountryName(code: string): string {
  return countries[code]?.name || code;
}

export function getCountryFlag(code: string): string {
  return countries[code]?.flag || '🌍';
}

export function getCountryInfo(code: string): Country {
  return countries[code] || { code, name: code, flag: '🌍' };
}

export function formatCountries(countries: any): string {
  if (!countries || !Array.isArray(countries)) {
    return 'Все ГЕО';
  }
  
  // Если это простой массив строк (коды стран)
  if (typeof countries[0] === 'string') {
    return countries.map(countryCode => {
      const countryName = getCountryName(countryCode);
      const flag = getCountryFlag(countryCode);
      return `${flag} ${countryName}`;
    }).join(', ');
  }
  
  // Если это массив объектов с полями code, flag, name
  return countries.map(country => {
    if (typeof country === 'object' && country.code) {
      const countryName = country.name || getCountryName(country.code);
      const flag = country.flag || getCountryFlag(country.code);
      return `${flag} ${countryName}`;
    }
    return country.toString();
  }).join(', ');
}