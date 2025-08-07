// Форматирование процента конверсии (CR)
export function formatCR(cr: number): string {
  return `${Math.ceil(cr * 100) / 100}%`;
}

// Форматирование валюты
export function formatCurrency(amount: number | string, currency: string = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'RUB': '₽',
    'GBP': '£'
  };
  
  const symbol = symbols[currency] || currency;
  return `${symbol}${num}`;
}

// Форматирование чисел с разделителями
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Форматирование размера файла
export function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
}

// Форматирование даты
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
}

// Форматирование времени
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}