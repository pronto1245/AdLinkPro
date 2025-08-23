import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { parseCountries } from '@/utils/countries';

interface GeoDisplayProps {
  countries: string[];
  geoTargeting?: string[];
  payout?: number;
  currency?: string;
  offerId?: string;
  payoutByGeo?: Record<string, number>;
}

interface CountryPayout {
  code: string;
  name: string;
  flag: string;
  payout: number;
  currency: string;
}

const GeoDisplay: React.FC<GeoDisplayProps> = ({ 
  countries, 
  geoTargeting, 
  payout = 0, 
  currency = 'USD',
  offerId: _offerId,
  payoutByGeo 
}) => {
  const [showModal, setShowModal] = useState(false);
  
  const allCountries = parseCountries(countries || geoTargeting || []);
  const visibleCountries = allCountries.slice(0, 2);
  const thirdCountry = allCountries[2];
  const remainingCount = allCountries.length - 3;
  
  // Получаем выплаты по странам из данных оффера
  const getCountryPayouts = (): CountryPayout[] => {
    
    return allCountries.map(country => {
      // Преобразуем код страны в полное название для поиска в payoutByGeo
      const countryNameMap: { [key: string]: string } = {
        'AF': 'afghanistan',
        'AL': 'albania', 
        'DZ': 'algeria',
        'AD': 'andorra',
        'AO': 'angola',
        'AM': 'armenia',
        'AR': 'argentina',
        'AU': 'australia',
        'AT': 'austria',
        'AZ': 'azerbaijan',
        'BH': 'bahrain',
        'BD': 'bangladesh',
        'BY': 'belarus',
        'BE': 'belgium',
        'BR': 'brazil',
        'BG': 'bulgaria',
        'CA': 'canada',
        'CN': 'china',
        'CO': 'colombia',
        'HR': 'croatia',
        'CZ': 'czech',
        'DK': 'denmark',
        'EG': 'egypt',
        'EE': 'estonia',
        'FI': 'finland',
        'FR': 'france',
        'DE': 'germany',
        'GR': 'greece',
        'HU': 'hungary',
        'IS': 'iceland',
        'IN': 'india',
        'ID': 'indonesia',
        'IR': 'iran',
        'IQ': 'iraq',
        'IE': 'ireland',
        'IL': 'israel',
        'IT': 'italy',
        'JP': 'japan',
        'JO': 'jordan',
        'KZ': 'kazakhstan',
        'KE': 'kenya',
        'KW': 'kuwait',
        'LV': 'latvia',
        'LB': 'lebanon',
        'LT': 'lithuania',
        'LU': 'luxembourg',
        'MY': 'malaysia',
        'MX': 'mexico',
        'MD': 'moldova',
        'MC': 'monaco',
        'MA': 'morocco',
        'NL': 'netherlands',
        'NZ': 'new_zealand',
        'NO': 'norway',
        'PK': 'pakistan',
        'PE': 'peru',
        'PH': 'philippines',
        'PL': 'poland',
        'PT': 'portugal',
        'QA': 'qatar',
        'RO': 'romania',
        'RU': 'russia',
        'SA': 'saudi_arabia',
        'RS': 'serbia',
        'SG': 'singapore',
        'SK': 'slovakia',
        'SI': 'slovenia',
        'ZA': 'south_africa',
        'KR': 'south_korea',
        'ES': 'spain',
        'LK': 'sri_lanka',
        'SE': 'sweden',
        'CH': 'switzerland',
        'TH': 'thailand',
        'TR': 'turkey',
        'UA': 'ukraine',
        'AE': 'united_arab_emirates',
        'GB': 'united_kingdom',
        'US': 'united_states',
        'VN': 'vietnam'
      };
      
      const countryKey = countryNameMap[country.code] || country.code.toLowerCase();
      
      // Ищем выплату для этой страны в payoutByGeo
      const countryPayout = payoutByGeo?.[countryKey] || 
                           payoutByGeo?.[country.code.toLowerCase()] || 
                           payoutByGeo?.[country.code.toUpperCase()] ||
                           payoutByGeo?.[country.name.toLowerCase()];
      
      const finalPayout = countryPayout || payout;
      
      return {
        ...country,
        payout: finalPayout,
        currency: currency
      };
    });
  };

  return (
    <>
      <div className="flex items-center gap-1 flex-wrap max-w-32">
        {/* Первые 2 страны */}
        {visibleCountries.map((country, index) => (
          <div 
            key={`country-${index}`} 
            className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800"
          >
            <span className="text-sm" title={country.name}>{country.flag}</span>
            <span className="text-xs font-mono font-semibold text-blue-700 dark:text-blue-300">
              {country.code}
            </span>
          </div>
        ))}
        
        {/* Третья страна с индикатором остальных */}
        {thirdCountry && (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800">
              <span className="text-sm" title={thirdCountry.name}>{thirdCountry.flag}</span>
              <span className="text-xs font-mono font-semibold text-blue-700 dark:text-blue-300">
                {thirdCountry.code}
              </span>
            </div>
            
            {remainingCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowModal(true)}
                title={`Показать все ${allCountries.length} стран`}
              >
                +{remainingCount}
              </Button>
            )}
          </div>
        )}
        
        {/* Если всего 3 страны, но нет кнопки +X */}
        {allCountries.length === 3 && !remainingCount && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowModal(true)}
            title="Показать детали по странам"
          >
            ⚡
          </Button>
        )}
      </div>

      {/* Модальное окно с полным списком стран */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Гео-таргетинг ({allCountries.length} стран)</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Подробная информация по странам и выплатам для данного оффера
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {getCountryPayouts().map((country, index) => (
              <div 
                key={`modal-country-${index}`}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{country.flag}</span>
                  <div>
                    <div className="font-medium text-sm">{country.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{country.code}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-green-600 dark:text-green-400">
                    ${country.payout}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {country.currency}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Общая сумма:</span>
              <span className="text-green-600 dark:text-green-400">
                ${Number(getCountryPayouts().reduce((sum, country) => sum + (Number(country.payout) || 0), 0)).toFixed(2)} {currency}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GeoDisplay;