import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { queryClient } from '@/lib/queryClient';

interface OfferFormProps {
  onClose: () => void;
}

export default function OfferFormSimple({ onClose }: OfferFormProps) {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      const data = {
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        payoutType: formData.get('payoutType') as string,
        currency: formData.get('currency') as string,
        status: formData.get('status') as string,
        description_ru: formData.get('description_ru') as string || '',
        description_en: formData.get('description_en') as string || '',
        antifraudEnabled: true,
        autoApprovePartners: false
      };

      console.log('Sending data:', data);

      const response = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      alert('Оффер создан: ' + result.name);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка создания оффера: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Название *</label>
        <input 
          name="name" 
          type="text" 
          required 
          className="w-full p-2 border rounded" 
          placeholder="Введите название оффера" 
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Категория *</label>
        <select name="category" required className="w-full p-2 border rounded">
          <option value="gambling">Gambling</option>
          <option value="finance">Finance</option>
          <option value="dating">Dating</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Тип выплаты</label>
          <select name="payoutType" className="w-full p-2 border rounded">
            <option value="cpa">CPA</option>
            <option value="cps">CPS</option>
            <option value="cpl">CPL</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Валюта</label>
          <select name="currency" className="w-full p-2 border rounded">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="RUB">RUB</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Статус</label>
        <select name="status" className="w-full p-2 border rounded">
          <option value="active">Активный</option>
          <option value="draft">Черновик</option>
          <option value="paused">Приостановлен</option>
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Описание (RU)</label>
          <textarea 
            name="description_ru" 
            className="w-full p-2 border rounded" 
            placeholder="Описание на русском"
            rows={3}
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Описание (EN)</label>
          <textarea 
            name="description_en" 
            className="w-full p-2 border rounded" 
            placeholder="Description in English"
            rows={3}
          ></textarea>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Создание...' : 'Создать оффер'}
        </Button>
      </div>
    </form>
  );
}