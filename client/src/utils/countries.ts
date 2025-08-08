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

// Карта названий стран к кодам для конвертации
const countryNameToCode: Record<string, string> = {
  // Русские названия
  'россия': 'RU',
  'сша': 'US',
  'америка': 'US',
  'великобритания': 'GB',
  'англия': 'GB',
  'германия': 'DE',
  'франция': 'FR',
  'италия': 'IT',
  'казахстан': 'KZ',
  'украина': 'UA',
  'бразилия': 'BR',
  'индия': 'IN',
  'филиппины': 'PH',
  'канада': 'CA',
  'китай': 'CN',
  'турция': 'TR',
  'япония': 'JP',
  'южная корея': 'KR',
  'корея': 'KR',
  'австралия': 'AU',
  'мексика': 'MX',
  'аргентина': 'AR',
  'испания': 'ES',
  'португалия': 'PT',
  'нидерланды': 'NL',
  'швеция': 'SE',
  'норвегия': 'NO',
  'дания': 'DK',
  'финляндия': 'FI',
  'польша': 'PL',
  'чехия': 'CZ',
  'венгрия': 'HU',
  'австрия': 'AT',
  'швейцария': 'CH',
  'бельгия': 'BE',
  'ирландия': 'IE',
  'израиль': 'IL',
  'оаэ': 'AE',
  'саудовская аравия': 'SA',
  'таиланд': 'TH',
  'вьетнам': 'VN',
  'индонезия': 'ID',
  'малайзия': 'MY',
  'сингапур': 'SG',
  'юар': 'ZA',
  'нигерия': 'NG',
  'египет': 'EG',
  'чили': 'CL',
  'колумбия': 'CO',
  'перу': 'PE',
  'венесуэла': 'VE',
  
  // Английские названия
  'russia': 'RU',
  'united states': 'US',
  'usa': 'US',
  'america': 'US',
  'united kingdom': 'GB',
  'uk': 'GB',
  'britain': 'GB',
  'england': 'GB',
  'germany': 'DE',
  'france': 'FR',
  'italy': 'IT',
  'kazakhstan': 'KZ',
  'ukraine': 'UA',
  'brazil': 'BR',
  'india': 'IN',
  'philippines': 'PH',
  'canada': 'CA',
  'china': 'CN',
  'turkey': 'TR',
  'japan': 'JP',
  'south korea': 'KR',
  'korea': 'KR',
  'australia': 'AU',
  'mexico': 'MX',
  'argentina': 'AR',
  'spain': 'ES',
  'portugal': 'PT',
  'netherlands': 'NL',
  'sweden': 'SE',
  'norway': 'NO',
  'denmark': 'DK',
  'finland': 'FI',
  'poland': 'PL',
  'czech republic': 'CZ',
  'czechia': 'CZ',
  'hungary': 'HU',
  'austria': 'AT',
  'switzerland': 'CH',
  'belgium': 'BE',
  'ireland': 'IE',
  'israel': 'IL',
  'uae': 'AE',
  'united arab emirates': 'AE',
  'saudi arabia': 'SA',
  'thailand': 'TH',
  'vietnam': 'VN',
  'indonesia': 'ID',
  'malaysia': 'MY',
  'singapore': 'SG',
  'south africa': 'ZA',
  'nigeria': 'NG',
  'egypt': 'EG',
  'chile': 'CL',
  'colombia': 'CO',
  'peru': 'PE',
  'venezuela': 'VE',
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

// Функция для конвертации названия страны в код
export function getCountryCodeByName(name: string): string {
  if (!name) return '';
  
  // Если это уже код (2 буквы в верхнем регистре)
  if (name.length === 2 && name === name.toUpperCase()) {
    return name;
  }
  
  const normalizedName = name.toLowerCase().trim();
  return countryNameToCode[normalizedName] || name.toUpperCase();
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

  // Если это строка, парсим как JSON или разбиваем по запятым/пробелам
  if (typeof countries === 'string') {
    try {
      const parsed = JSON.parse(countries);
      if (Array.isArray(parsed)) {
        return parseCountries(parsed);
      }
    } catch {
      // Если не JSON, то может быть строка с названиями/кодами через запятую или пробелы
      const items = countries.split(/[,\s]+/).map(c => c.trim()).filter(c => c);
      if (items.length > 0) {
        return items.map(item => {
          // Пытаемся конвертировать название в код
          const code = getCountryCodeByName(item);
          return getCountryInfo(code);
        });
      }
    }
  }

  if (!Array.isArray(countries)) {
    return [
      { code: 'RU', name: 'Россия', flag: '🇷🇺' },
      { code: 'US', name: 'США', flag: '🇺🇸' }
    ];
  }
  
  // Если это простой массив строк (коды или названия стран)
  if (countries.length > 0 && typeof countries[0] === 'string') {
    return countries.map(item => {
      // Пытаемся конвертировать название в код
      const code = getCountryCodeByName(item);
      return getCountryInfo(code);
    });
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
    // Пытаемся конвертировать в код
    const code = getCountryCodeByName(country.toString());
    return getCountryInfo(code);
  });
}