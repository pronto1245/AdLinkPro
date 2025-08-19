import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export default function SidebarDemo() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sidebar Demo</h1>
          <p className="text-muted-foreground">
            Sidebar component demonstration
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sidebar Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Sidebar demo functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}