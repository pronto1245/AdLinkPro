import React, { memo, useMemo, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Users, DollarSign, TrendingUp, UserCheck, Building2, Globe, Shield, BarChart3, Eye } from 'lucide-react';

interface AnalyticsData {
  date: string;
  uniques: number;
  cr_value: string;
  epc_value: string;
  registrations: number;
  deposits: number;
  geo: string;
  fraud_rejects: number;
  partner: string;
}

interface OptimizedAnalyticsTableProps {
  currentPage: number;
  onNavigateToPartner: (partnerId: string) => void;
  onNavigateToGeo: (geo: string) => void;
  onNavigateToFraud: (offerId: string) => void;
  dateFilter: string;
  offerId?: string;
}

// Мемоизированный компонент таблицы аналитики
const OptimizedAnalyticsTable = memo(({ 
  currentPage, 
  onNavigateToPartner, 
  onNavigateToGeo, 
  onNavigateToFraud,
  dateFilter,
  offerId 
}: OptimizedAnalyticsTableProps) => {
  
  // Генерируем данные только для текущей страницы (мемоизировано)
  const analyticsData = useMemo(() => {
    return Array.from({ length: 10 }, (_, index) => {
      const rowIndex = (currentPage - 1) * 10 + index;
      return {
        date: new Date(Date.now() - rowIndex * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
        uniques: Math.floor(Math.random() * 500) + 100 + rowIndex * 10,
        cr_value: `$${(Math.random() * 100 + 20 + rowIndex * 2).toFixed(2)}`,
        epc_value: `$${(Math.random() * 2 + 0.1 + rowIndex * 0.05).toFixed(3)}`,
        registrations: Math.floor(Math.random() * 80) + 20 + rowIndex * 5,
        deposits: Math.floor(Math.random() * 25) + 8 + rowIndex * 2,
        geo: `🇺🇸 US (${(Math.random() * 12 + 2).toFixed(1)}%)`,
        fraud_rejects: Math.floor(Math.random() * 20) + 1,
        partner: `П#${rowIndex + 1}`
      };
    });
  }, [currentPage]);

  // Мемоизированные обработчики клика
  const handlePartnerClick = useCallback((partnerId: string) => {
    onNavigateToPartner(partnerId);
  }, [onNavigateToPartner]);

  const handleGeoClick = useCallback((geo: string) => {
    onNavigateToGeo(geo);
  }, [onNavigateToGeo]);

  const handleFraudClick = useCallback(() => {
    if (offerId) {
      onNavigateToFraud(offerId);
    }
  }, [onNavigateToFraud, offerId]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Дата</TableHead>
          <TableHead>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Уники
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              CR$
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              EPC$
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-1">
              <UserCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              REG
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              DEP
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              GEO
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
              Фрод-Отклонение
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Партнер
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {analyticsData.map((row, index) => (
          <TableRow key={`${currentPage}-${index}`}>
            <TableCell className="font-medium">{row.date}</TableCell>
            <TableCell className="text-blue-600 dark:text-blue-400 font-medium">
              {row.uniques}
            </TableCell>
            <TableCell className="text-green-600 dark:text-green-400 font-medium">
              {row.cr_value}
            </TableCell>
            <TableCell className="text-purple-600 dark:text-purple-400 font-medium">
              {row.epc_value}
            </TableCell>
            <TableCell className="text-cyan-600 dark:text-cyan-400 font-medium">
              {row.registrations}
            </TableCell>
            <TableCell className="text-emerald-600 dark:text-emerald-400 font-medium">
              {row.deposits}
            </TableCell>
            <TableCell className="text-orange-600 dark:text-orange-400 font-medium">
              <button
                onClick={() => handleGeoClick('US')}
                className="flex items-center gap-1 hover:underline hover:bg-orange-50 dark:hover:bg-orange-900/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer group"
                title="Перейти к аналитике по гео"
              >
                <Globe className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                {row.geo}
                <BarChart3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
              </button>
            </TableCell>
            <TableCell className="text-red-600 dark:text-red-400 font-medium">
              <button
                onClick={handleFraudClick}
                className="flex items-center gap-1 hover:underline hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer group"
                title="Перейти к управлению фродом"
              >
                <Shield className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                {row.fraud_rejects}
                <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
              </button>
            </TableCell>
            <TableCell className="text-indigo-600 dark:text-indigo-400 font-medium">
              <button
                onClick={() => handlePartnerClick(row.partner)}
                className="flex items-center gap-1 hover:underline hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer group"
                title="Перейти к управлению партнером"
              >
                <Users className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                {row.partner}
                <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});

OptimizedAnalyticsTable.displayName = 'OptimizedAnalyticsTable';

export default OptimizedAnalyticsTable;