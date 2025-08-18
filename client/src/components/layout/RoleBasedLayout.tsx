import React from "react";

function getRoleFromToken(): 'partner'|'advertiser'|'owner'|'super_admin'|null {
  try {
    const raw = localStorage.getItem('token') || '';
    const payload = JSON.parse(atob(raw.split('.')[1] || ''));
    const r = String(payload.role || '').toLowerCase();
    const map: Record<string,string> = {
      partner: 'partner',
      advertiser: 'advertiser',
      owner: 'owner',
      'super admin': 'super_admin',
      super_admin: 'super_admin',
      superadmin: 'super_admin'
    };
    return (map[r] as any) || null;
  } catch { return null; }
}

const link = (href: string, label: string) => (
  <a href={href} style={{padding:'8px 10px', borderRadius:8, border:'1px solid #374151', textDecoration:'none', color:'#e5e7eb'}}>
    {label}
  </a>
);

export default function RoleBasedLayout({ children }: { children: React.ReactNode }) {
  const role = getRoleFromToken();

  return (
    <div style={{minHeight:'100vh', background:'#0b0f1a', color:'#e5e7eb', display:'grid', gridTemplateRows:'auto 1fr'}}>
      <header style={{display:'flex', alignItems:'center', gap:12, padding:'14px 18px', borderBottom:'1px solid #1f2937', position:'sticky', top:0, background:'#0b0f1a'}}>
        <img src="/logo.png" alt="Affilix.Click" width={28} height={28} style={{borderRadius:6}} />
        <div style={{fontWeight:700}}>Affilix.Click</div>
        <div style={{marginLeft:'auto', display:'flex', gap:8}}>
          {!role && link('/login', 'Войти')}
          {role === 'partner' && <>
            {link('/dashboard/partner', 'Дашборд')}
            {link('/dashboard/partner/offers', 'Офферы')}
            {link('/dashboard/partner/statistics', 'Статистика')}
            {link('/dashboard/partner/finances', 'Финансы')}
            {link('/dashboard/partner/profile', 'Профиль')}
          </>}
          {role === 'advertiser' && <>
            {link('/dashboard/advertiser', 'Дашборд')}
            {link('/dashboard/advertiser/offers', 'Офферы')}
            {link('/dashboard/advertiser/reports', 'Отчёты')}
            {link('/dashboard/advertiser/partners', 'Партнёры')}
            {link('/dashboard/advertiser/profile', 'Профиль')}
          </>}
          {role === 'owner' && <>
            {link('/dashboard/owner', 'Дашборд')}
            {link('/dashboard/owner/users', 'Пользователи')}
            {link('/dashboard/owner/settings', 'Настройки')}
          </>}
          {role === 'super_admin' && <>
            {link('/dashboard/super-admin', 'Дашборд')}
            {link('/dashboard/super-admin/users', 'Пользователи')}
            {link('/dashboard/super-admin/offers', 'Офферы')}
            {link('/dashboard/super-admin/analytics', 'Аналитика')}
          </>}
        </div>
      </header>

      <main style={{padding:20}}>
        {children}
      </main>
    </div>
  );
}
