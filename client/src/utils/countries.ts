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
  'GR': { code: 'GR', name: 'Греция', flag: '🇬🇷' },
  'HR': { code: 'HR', name: 'Хорватия', flag: '🇭🇷' },
  'BG': { code: 'BG', name: 'Болгария', flag: '🇧🇬' },
  'RO': { code: 'RO', name: 'Румыния', flag: '🇷🇴' },
  'RS': { code: 'RS', name: 'Сербия', flag: '🇷🇸' },
  'LT': { code: 'LT', name: 'Литва', flag: '🇱🇹' },
  'LV': { code: 'LV', name: 'Латвия', flag: '🇱🇻' },
  'EE': { code: 'EE', name: 'Эстония', flag: '🇪🇪' },
  'SI': { code: 'SI', name: 'Словения', flag: '🇸🇮' },
  'SK': { code: 'SK', name: 'Словакия', flag: '🇸🇰' },
  'CY': { code: 'CY', name: 'Кипр', flag: '🇨🇾' },
  'MT': { code: 'MT', name: 'Мальта', flag: '🇲🇹' },
  'IS': { code: 'IS', name: 'Исландия', flag: '🇮🇸' },
  'LU': { code: 'LU', name: 'Люксембург', flag: '🇱🇺' },
  'MC': { code: 'MC', name: 'Монако', flag: '🇲🇨' },
  'AD': { code: 'AD', name: 'Андорра', flag: '🇦🇩' },
  'LI': { code: 'LI', name: 'Лихтенштейн', flag: '🇱🇮' },
  'SM': { code: 'SM', name: 'Сан-Марино', flag: '🇸🇲' },
  'VA': { code: 'VA', name: 'Ватикан', flag: '🇻🇦' },
  'MA': { code: 'MA', name: 'Марокко', flag: '🇲🇦' },
  'TN': { code: 'TN', name: 'Тунис', flag: '🇹🇳' },
  'DZ': { code: 'DZ', name: 'Алжир', flag: '🇩🇿' },
  'LY': { code: 'LY', name: 'Ливия', flag: '🇱🇾' },
  'SD': { code: 'SD', name: 'Судан', flag: '🇸🇩' },
  'ET': { code: 'ET', name: 'Эфиопия', flag: '🇪🇹' },
  'KE': { code: 'KE', name: 'Кения', flag: '🇰🇪' },
  'TZ': { code: 'TZ', name: 'Танзания', flag: '🇹🇿' },
  'UG': { code: 'UG', name: 'Уганда', flag: '🇺🇬' },
  'RW': { code: 'RW', name: 'Руанда', flag: '🇷🇼' },
  'GH': { code: 'GH', name: 'Гана', flag: '🇬🇭' },
  'CI': { code: 'CI', name: 'Кот-д\'Ивуар', flag: '🇨🇮' },
  'SN': { code: 'SN', name: 'Сенегал', flag: '🇸🇳' },
  'CM': { code: 'CM', name: 'Камерун', flag: '🇨🇲' },
  'IR': { code: 'IR', name: 'Иран', flag: '🇮🇷' },
  'IQ': { code: 'IQ', name: 'Ирак', flag: '🇮🇶' },
  'JO': { code: 'JO', name: 'Иордания', flag: '🇯🇴' },
  'LB': { code: 'LB', name: 'Ливан', flag: '🇱🇧' },
  'SY': { code: 'SY', name: 'Сирия', flag: '🇸🇾' },
  'YE': { code: 'YE', name: 'Йемен', flag: '🇾🇪' },
  'OM': { code: 'OM', name: 'Оман', flag: '🇴🇲' },
  'QA': { code: 'QA', name: 'Катар', flag: '🇶🇦' },
  'KW': { code: 'KW', name: 'Кувейт', flag: '🇰🇼' },
  'BH': { code: 'BH', name: 'Бахрейн', flag: '🇧🇭' },
  'AF': { code: 'AF', name: 'Афганистан', flag: '🇦🇫' },
  'PK': { code: 'PK', name: 'Пакистан', flag: '🇵🇰' },
  'BD': { code: 'BD', name: 'Бангладеш', flag: '🇧🇩' },
  'LK': { code: 'LK', name: 'Шри-Ланка', flag: '🇱🇰' },
  'NP': { code: 'NP', name: 'Непал', flag: '🇳🇵' },
  'MM': { code: 'MM', name: 'Мьянма', flag: '🇲🇲' },
  'KH': { code: 'KH', name: 'Камбоджа', flag: '🇰🇭' },
  'LA': { code: 'LA', name: 'Лаос', flag: '🇱🇦' },
  'MN': { code: 'MN', name: 'Монголия', flag: '🇲🇳' },
  'KP': { code: 'KP', name: 'Северная Корея', flag: '🇰🇵' },
  'TW': { code: 'TW', name: 'Тайвань', flag: '🇹🇼' },
  'HK': { code: 'HK', name: 'Гонконг', flag: '🇭🇰' },
  'MO': { code: 'MO', name: 'Макао', flag: '🇲🇴' },
  'NZ': { code: 'NZ', name: 'Новая Зеландия', flag: '🇳🇿' },
  'FJ': { code: 'FJ', name: 'Фиджи', flag: '🇫🇯' },
  'PG': { code: 'PG', name: 'Папуа Новая Гвинея', flag: '🇵🇬' },
  'EC': { code: 'EC', name: 'Эквадор', flag: '🇪🇨' },
  'BO': { code: 'BO', name: 'Боливия', flag: '🇧🇴' },
  'PY': { code: 'PY', name: 'Парагвай', flag: '🇵🇾' },
  'UY': { code: 'UY', name: 'Уругвай', flag: '🇺🇾' },
  'GY': { code: 'GY', name: 'Гайана', flag: '🇬🇾' },
  'SR': { code: 'SR', name: 'Суринам', flag: '🇸🇷' },
  'GF': { code: 'GF', name: 'Французская Гвиана', flag: '🇬🇫' },
  'CU': { code: 'CU', name: 'Куба', flag: '🇨🇺' },
  'JM': { code: 'JM', name: 'Ямайка', flag: '🇯🇲' },
  'HT': { code: 'HT', name: 'Гаити', flag: '🇭🇹' },
  'DO': { code: 'DO', name: 'Доминиканская Республика', flag: '🇩🇴' },
  'PR': { code: 'PR', name: 'Пуэрто-Рико', flag: '🇵🇷' },
  'CR': { code: 'CR', name: 'Коста-Рика', flag: '🇨🇷' },
  'PA': { code: 'PA', name: 'Панама', flag: '🇵🇦' },
  'NI': { code: 'NI', name: 'Никарагуа', flag: '🇳🇮' },
  'HN': { code: 'HN', name: 'Гондурас', flag: '🇭🇳' },
  'GT': { code: 'GT', name: 'Гватемала', flag: '🇬🇹' },
  'BZ': { code: 'BZ', name: 'Белиз', flag: '🇧🇿' },
  'SV': { code: 'SV', name: 'Сальвадор', flag: '🇸🇻' },
  'AO': { code: 'AO', name: 'Ангола', flag: '🇦🇴' },
  'AL': { code: 'AL', name: 'Албания', flag: '🇦🇱' },
  'AM': { code: 'AM', name: 'Армения', flag: '🇦🇲' },
  'AZ': { code: 'AZ', name: 'Азербайджан', flag: '🇦🇿' },
  'GE': { code: 'GE', name: 'Грузия', flag: '🇬🇪' },
  'MD': { code: 'MD', name: 'Молдова', flag: '🇲🇩' },
  'BA': { code: 'BA', name: 'Босния и Герцеговина', flag: '🇧🇦' },
  'MK': { code: 'MK', name: 'Северная Македония', flag: '🇲🇰' },
  'ME': { code: 'ME', name: 'Черногория', flag: '🇲🇪' },
  'XK': { code: 'XK', name: 'Косово', flag: '🇽🇰' },
  'BY': { code: 'BY', name: 'Беларусь', flag: '🇧🇾' },
  'UZ': { code: 'UZ', name: 'Узбекистан', flag: '🇺🇿' },
  'KG': { code: 'KG', name: 'Кыргызстан', flag: '🇰🇬' },
  'TJ': { code: 'TJ', name: 'Таджикистан', flag: '🇹🇯' },
  'TM': { code: 'TM', name: 'Туркменистан', flag: '🇹🇲' },
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
  'греция': 'GR',
  
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
  'украина': 'UA',
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
  'greece': 'GR',
  'czech': 'CZ',
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
  
  // Дополнительные страны
  'croatia': 'HR',
  'хорватия': 'HR',
  'bulgaria': 'BG',
  'болгария': 'BG',
  'romania': 'RO',
  'румыния': 'RO',
  'serbia': 'RS',
  'сербия': 'RS',
  'lithuania': 'LT',
  'литва': 'LT',
  'latvia': 'LV',
  'латвия': 'LV',
  'estonia': 'EE',
  'эстония': 'EE',
  'slovenia': 'SI',
  'словения': 'SI',
  'slovakia': 'SK',
  'словакия': 'SK',
  'cyprus': 'CY',
  'кипр': 'CY',
  'malta': 'MT',
  'мальта': 'MT',
  'iceland': 'IS',
  'исландия': 'IS',
  'luxembourg': 'LU',
  'люксембург': 'LU',
  'monaco': 'MC',
  'монако': 'MC',
  'andorra': 'AD',
  'андорра': 'AD',
  'liechtenstein': 'LI',
  'лихтенштейн': 'LI',
  'san marino': 'SM',
  'сан-марино': 'SM',
  'vatican': 'VA',
  'ватикан': 'VA',
  'morocco': 'MA',
  'марокко': 'MA',
  'tunisia': 'TN',
  'тунис': 'TN',
  'алжир': 'DZ',
  'libya': 'LY',
  'ливия': 'LY',
  'sudan': 'SD',
  'судан': 'SD',
  'ethiopia': 'ET',
  'эфиопия': 'ET',
  'kenya': 'KE',
  'кения': 'KE',
  'tanzania': 'TZ',
  'танзания': 'TZ',
  'uganda': 'UG',
  'уганда': 'UG',
  'rwanda': 'RW',
  'руанда': 'RW',
  'ghana': 'GH',
  'гана': 'GH',
  'ivory coast': 'CI',
  'кот-д\'ивуар': 'CI',
  'senegal': 'SN',
  'сенегал': 'SN',
  'cameroon': 'CM',
  'камерун': 'CM',
  'iran': 'IR',
  'иран': 'IR',
  'iraq': 'IQ',
  'ирак': 'IQ',
  'jordan': 'JO',
  'иордания': 'JO',
  'lebanon': 'LB',
  'ливан': 'LB',
  'syria': 'SY',
  'сирия': 'SY',
  'yemen': 'YE',
  'йемен': 'YE',
  'oman': 'OM',
  'оман': 'OM',
  'qatar': 'QA',
  'катар': 'QA',
  'kuwait': 'KW',
  'кувейт': 'KW',
  'bahrain': 'BH',
  'бахрейн': 'BH',
  'afghanistan': 'AF',
  'афганистан': 'AF',
  'pakistan': 'PK',
  'пакистан': 'PK',
  'bangladesh': 'BD',
  'бангладеш': 'BD',
  'sri lanka': 'LK',
  'шри-ланка': 'LK',
  'nepal': 'NP',
  'непал': 'NP',
  'myanmar': 'MM',
  'мьянма': 'MM',
  'cambodia': 'KH',
  'камбоджа': 'KH',
  'laos': 'LA',
  'лаос': 'LA',
  'mongolia': 'MN',
  'монголия': 'MN',
  'north korea': 'KP',
  'северная корея': 'KP',
  'taiwan': 'TW',
  'тайвань': 'TW',
  'hong kong': 'HK',
  'гонконг': 'HK',
  'macau': 'MO',
  'макао': 'MO',
  'new zealand': 'NZ',
  'новая зеландия': 'NZ',
  'fiji': 'FJ',
  'фиджи': 'FJ',
  'papua new guinea': 'PG',
  'папуа новая гвинея': 'PG',
  'ecuador': 'EC',
  'эквадор': 'EC',
  'bolivia': 'BO',
  'боливия': 'BO',
  'paraguay': 'PY',
  'парагвай': 'PY',
  'uruguay': 'UY',
  'уругвай': 'UY',
  'guyana': 'GY',
  'гайана': 'GY',
  'suriname': 'SR',
  'суринам': 'SR',
  'french guiana': 'GF',
  'французская гвиана': 'GF',
  'cuba': 'CU',
  'куба': 'CU',
  'jamaica': 'JM',
  'ямайка': 'JM',
  'haiti': 'HT',
  'гаити': 'HT',
  'dominican republic': 'DO',
  'доминиканская республика': 'DO',
  'puerto rico': 'PR',
  'пуэрто-рико': 'PR',
  'costa rica': 'CR',
  'коста-рика': 'CR',
  'panama': 'PA',
  'панама': 'PA',
  'nicaragua': 'NI',
  'никарагуа': 'NI',
  'honduras': 'HN',
  'гондурас': 'HN',
  'guatemala': 'GT',
  'гватемала': 'GT',
  'belize': 'BZ',
  'белиз': 'BZ',
  'el salvador': 'SV',
  'сальвадор': 'SV',
  
  // Дополнительные африканские страны
  'angola': 'AO',
  'ангола': 'AO',
  'albania': 'AL',
  'албания': 'AL',
  'армения': 'AM',
  'azerbaijan': 'AZ',
  'азербайджан': 'AZ',
  'georgia': 'GE',
  'грузия': 'GE',
  'moldova': 'MD',
  'молдова': 'MD',
  'bosnia': 'BA',
  'босния': 'BA',
  'north macedonia': 'MK',
  'македония': 'MK',
  'montenegro': 'ME',
  'черногория': 'ME',
  'kosova': 'XK',
  'kosovo': 'XK',
  'косово': 'XK',
  'belarus': 'BY',
  'беларусь': 'BY',
  'uzbekistan': 'UZ',
  'узбекистан': 'UZ',
  'kyrgyzstan': 'KG',
  'кыргызстан': 'KG',
  'tajikistan': 'TJ',
  'таджикистан': 'TJ',
  'turkmenistan': 'TM',
  'туркменистан': 'TM',
};

export function getCountryName(input: string): string {
  if (!input) return '';
  
  // Сначала попробуем использовать как код
  if (countries[input.toUpperCase()]) {
    return countries[input.toUpperCase()].name;
  }
  
  // Затем попробуем конвертировать название в код
  const countryCode = getCountryCodeByName(input);
  if (countryCode && countries[countryCode]) {
    return countries[countryCode].name;
  }
  
  return input;
}

export function getCountryFlag(input: string): string {
  if (!input) return '🌍';
  
  // Сначала попробуем использовать как код
  if (countries[input.toUpperCase()]) {
    return countries[input.toUpperCase()].flag;
  }
  
  // Затем попробуем конвертировать название в код
  const countryCode = getCountryCodeByName(input);
  if (countryCode && countries[countryCode]) {
    return countries[countryCode].flag;
  }
  
  return '🌍';
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
  
  // Точное совпадение
  const exactCode = countryNameToCode[normalizedName];
  if (exactCode) {
    return exactCode;
  }
  
  // Пытаемся найти частичное совпадение
  for (const [countryName, countryCode] of Object.entries(countryNameToCode)) {
    if (countryName.includes(normalizedName) || normalizedName.includes(countryName)) {
      return countryCode;
    }
  }
  
  // Специальная обработка для популярных стран
  const specialCases: Record<string, string> = {
    'france': 'FR',
    'франция': 'FR',
    'turkey': 'TR', 
    'турция': 'TR'
  };
  
  const specialCode = specialCases[normalizedName];
  if (specialCode) {
    return specialCode;
  }
  
  // Если ничего не найдено, возвращаем как есть в верхнем регистре (максимум 2 символа)
  return name.toUpperCase().substring(0, 2);
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