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
  'JP': { code: 'JP', name: 'Япония', flag: '🇯🇵' },
  'KR': { code: 'KR', name: 'Южная Корея', flag: '🇰🇷' },
  'AU': { code: 'AU', name: 'Австралия', flag: '🇦🇺' },
  'MX': { code: 'MX', name: 'Мексика', flag: '🇲🇽' },
  'AR': { code: 'AR', name: 'Аргентина', flag: '🇦🇷' },
  'ES': { code: 'ES', name: 'Испания', flag: '🇪🇸' },
  'PT': { code: 'PT', name: 'Португалия', flag: '🇵🇹' },
  'NL': { code: 'NL', name: 'Нидерланды', flag: '🇳🇱' },
  'SE': { code: 'SE', name: 'Швеция', flag: '🇸🇪' },
  'NO': { code: 'NO', name: 'Норвегия', flag: '🇳🇴' },
  'DK': { code: 'DK', name: 'Дания', flag: '🇩🇰' },
  'FI': { code: 'FI', name: 'Финляндия', flag: '🇫🇮' },
  'PL': { code: 'PL', name: 'Польша', flag: '🇵🇱' },
  'CZ': { code: 'CZ', name: 'Чехия', flag: '🇨🇿' },
  'HU': { code: 'HU', name: 'Венгрия', flag: '🇭🇺' },
  'AT': { code: 'AT', name: 'Австрия', flag: '🇦🇹' },
  'CH': { code: 'CH', name: 'Швейцария', flag: '🇨🇭' },
  'BE': { code: 'BE', name: 'Бельгия', flag: '🇧🇪' },
  'IE': { code: 'IE', name: 'Ирландия', flag: '🇮🇪' },
  'IL': { code: 'IL', name: 'Израиль', flag: '🇮🇱' },
  'AE': { code: 'AE', name: 'ОАЭ', flag: '🇦🇪' },
  'SA': { code: 'SA', name: 'Саудовская Аравия', flag: '🇸🇦' },
  'TH': { code: 'TH', name: 'Таиланд', flag: '🇹🇭' },
  'VN': { code: 'VN', name: 'Вьетнам', flag: '🇻🇳' },
  'ID': { code: 'ID', name: 'Индонезия', flag: '🇮🇩' },
  'MY': { code: 'MY', name: 'Малайзия', flag: '🇲🇾' },
  'SG': { code: 'SG', name: 'Сингапур', flag: '🇸🇬' },
  'ZA': { code: 'ZA', name: 'ЮАР', flag: '🇿🇦' },
  'NG': { code: 'NG', name: 'Нигерия', flag: '🇳🇬' },
  'EG': { code: 'EG', name: 'Египет', flag: '🇪🇬' },
  'CL': { code: 'CL', name: 'Чили', flag: '🇨🇱' },
  'CO': { code: 'CO', name: 'Колумбия', flag: '🇨🇴' },
  'PE': { code: 'PE', name: 'Перу', flag: '🇵🇪' },
  'VE': { code: 'VE', name: 'Венесуэла', flag: '🇻🇪' },
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

export function parseCountries(countries: any): Country[] {
  if (!countries) {
    // Возвращаем дефолтные страны если данных нет
    return [
      { code: 'RU', name: 'Россия', flag: '🇷🇺' },
      { code: 'US', name: 'США', flag: '🇺🇸' },
      { code: 'DE', name: 'Германия', flag: '🇩🇪' }
    ];
  }

  // Если это строка, парсим как JSON или разбиваем по запятым
  if (typeof countries === 'string') {
    try {
      const parsed = JSON.parse(countries);
      if (Array.isArray(parsed)) {
        return parseCountries(parsed);
      }
    } catch {
      // Если не JSON, то может быть строка с кодами через запятую
      const codes = countries.split(',').map(c => c.trim()).filter(c => c);
      if (codes.length > 0) {
        return codes.map(code => getCountryInfo(code));
      }
    }
  }

  if (!Array.isArray(countries)) {
    return [
      { code: 'RU', name: 'Россия', flag: '🇷🇺' },
      { code: 'US', name: 'США', flag: '🇺🇸' }
    ];
  }
  
  // Если это простой массив строк (коды стран)
  if (countries.length > 0 && typeof countries[0] === 'string') {
    return countries.map(countryCode => getCountryInfo(countryCode));
  }
  
  // Если это массив объектов с полями code, flag, name
  return countries.map(country => {
    if (typeof country === 'object' && country.code) {
      return {
        code: country.code,
        name: country.name || getCountryName(country.code),
        flag: country.flag || getCountryFlag(country.code)
      };
    }
    return getCountryInfo(country.toString());
  });
}