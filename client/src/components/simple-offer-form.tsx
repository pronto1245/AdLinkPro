import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';

export default function SimpleOfferForm({ onSuccess }: { onSuccess: () => void }) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'gambling',
    status: 'active',
    payoutType: 'cpa',
    currency: 'USD'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Simple form - submitting:', formData);
      
      const response = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      console.log('Simple form - response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Simple form - error:', errorText);
        alert(`Ошибка: ${errorText}`);
        return;
      }
      
      const result = await response.json();
      console.log('Simple form - success:', result);
      alert(`Оффер создан успешно! ID: ${result.id}`);
      onSuccess();
      
    } catch (error) {
      console.error('Simple form - catch error:', error);
      alert(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Название оффера</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Введите название оффера"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="category">Категория</Label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="gambling">Gambling</option>
          <option value="finance">Finance</option>
          <option value="dating">Dating</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Создание...' : 'Создать оффер'}
      </Button>
    </form>
  );
}