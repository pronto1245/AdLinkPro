import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Offer {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface User {
  id: string;
  name: string;
  role: string;
  [key: string]: unknown;
}

export default function TrackingUrlGenerator() {
  const { toast } = useToast();
  const [partnerId, setPartnerId] = useState('');
  const [offerId, setOfferId] = useState('');
  const [sub1, setSub1] = useState('');
  const [sub2, setSub2] = useState('');
  const [sub3, setSub3] = useState('');
  const [sub4, setSub4] = useState('');
  const [sub5, setSub5] = useState('');
  const [landingUrl, setLandingUrl] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');

  // Fetch offers for dropdown
  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ['/api/admin/offers'],
  });

  // Fetch users (partners) for dropdown
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const partners = users.filter(user => user.role === 'affiliate');

  const generateUrl = async () => {
    if (!partnerId || !offerId) {
      toast({
        title: 'Ошибка',
        description: 'Выберите партнёра и оффер',
        variant: 'destructive',
      });
      return;
    }

    try {
      const params = new URLSearchParams();
      if (sub1) {params.append('sub1', sub1);}
      if (sub2) {params.append('sub2', sub2);}
      if (sub3) {params.append('sub3', sub3);}
      if (sub4) {params.append('sub4', sub4);}
      if (sub5) {params.append('sub5', sub5);}
      if (landingUrl) {params.append('landing_url', landingUrl);}

      const response = await fetch(`/api/tracking-url/${partnerId}/${offerId}?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка генерации URL');
      }

      const data = await response.json();
      setGeneratedUrl(data.trackingUrl);

      toast({
        title: 'URL сгенерирован',
        description: data.instructions,
      });
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сгенерировать URL',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    toast({
      title: 'Скопировано',
      description: 'URL скопирован в буфер обмена',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Генератор tracking URL</CardTitle>
        <CardDescription>
          Создайте универсальную ссылку для партнёра с поддержкой макросов трекера
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="partner">Партнёр</Label>
            <Select value={partnerId} onValueChange={setPartnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите партнёра" />
              </SelectTrigger>
              <SelectContent>
                {partners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.email} ({partner.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="offer">Оффер</Label>
            <Select value={offerId} onValueChange={setOfferId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите оффер" />
              </SelectTrigger>
              <SelectContent>
                {offers.map((offer) => (
                  <SelectItem key={offer.id} value={offer.id}>
                    {offer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="sub1">Sub ID 1</Label>
            <Input
              id="sub1"
              value={sub1}
              onChange={(e) => setSub1(e.target.value)}
              placeholder="Например: facebook"
            />
          </div>
          <div>
            <Label htmlFor="sub2">Sub ID 2</Label>
            <Input
              id="sub2"
              value={sub2}
              onChange={(e) => setSub2(e.target.value)}
              placeholder="Например: campaign1"
            />
          </div>
          <div>
            <Label htmlFor="sub3">Sub ID 3</Label>
            <Input
              id="sub3"
              value={sub3}
              onChange={(e) => setSub3(e.target.value)}
              placeholder="Например: creative_a"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sub4">Sub ID 4</Label>
            <Input
              id="sub4"
              value={sub4}
              onChange={(e) => setSub4(e.target.value)}
              placeholder="Дополнительный sub"
            />
          </div>
          <div>
            <Label htmlFor="sub5">Sub ID 5</Label>
            <Input
              id="sub5"
              value={sub5}
              onChange={(e) => setSub5(e.target.value)}
              placeholder="Дополнительный sub"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="landingUrl">Landing URL (опционально)</Label>
          <Input
            id="landingUrl"
            value={landingUrl}
            onChange={(e) => setLandingUrl(e.target.value)}
            placeholder="https://example.com/landing"
          />
        </div>

        <Button onClick={generateUrl} className="w-full">
          Сгенерировать URL
        </Button>

        {generatedUrl && (
          <div className="space-y-2">
            <Label>Сгенерированный URL:</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={generatedUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
                title="Копировать URL"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => window.open(generatedUrl, '_blank')}
                title="Открыть URL"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              💡 Замените <code>{'{clickid}'}</code> на макрос вашего трекера для передачи уникального ID клика
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
