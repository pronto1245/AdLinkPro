import React, { useMemo, useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface LazyTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: Array<{
    key: string;
    header: string;
    render?: (value: unknown, row: T) => React.ReactNode;
  }>;
  pageSize?: number;
  className?: string;
}

// Виртуализированная таблица для больших объемов данных
export function LazyTable<T = Record<string, unknown>>({ data, columns, pageSize = 50, className }: LazyTableProps<T>) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: pageSize });

  // Мемоизируем видимые строки
  const visibleData = useMemo(() => {
    return data.slice(visibleRange.start, visibleRange.end);
  }, [data, visibleRange]);

  // Обработчик скролла для ленивой загрузки
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
    
    if (scrollPercentage > 0.8 && visibleRange.end < data.length) {
      setVisibleRange(prev => ({
        start: prev.start,
        end: Math.min(prev.end + pageSize, data.length)
      }));
    }
  }, [data.length, pageSize, visibleRange.end]);

  return (
    <div className={`max-h-96 overflow-auto ${className}`} onScroll={handleScroll}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleData.map((row, index) => (
            <TableRow key={`${visibleRange.start + index}`}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render ? column.render((row as Record<string, unknown>)[column.key], row) : (row as Record<string, unknown>)[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {visibleRange.end < data.length && (
        <div className="text-center p-4 text-sm text-gray-500">
          Прокрутите вниз для загрузки еще {Math.min(pageSize, data.length - visibleRange.end)} записей
        </div>
      )}
    </div>
  );
}