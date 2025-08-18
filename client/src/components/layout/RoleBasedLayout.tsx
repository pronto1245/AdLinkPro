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
            {link('/dash/partner', 'Дашборд')}
            {link('/dash/partner/offers', 'Офферы')}
            {link('/dash/partner/statistics', 'Статистика')}
            {link('/dash/partner/finances', 'Финансы')}
            {link('/dash/partner/profile', 'Профиль')}
          </>}
          {role === 'advertiser' && <>
            {link('/dash/advertiser', 'Дашборд')}
            {link('/dash/advertiser/offers', 'Офферы')}
            {link('/dash/advertiser/reports', 'Отчёты')}
            {link('/dash/advertiser/partners', 'Партнёры')}
            {link('/dash/advertiser/profile', 'Профиль')}
          </>}
          {role === 'owner' && <>
            {link('/dash/owner', 'Дашборд')}
            {link('/dash/owner/users', 'Пользователи')}
            {link('/dash/owner/settings', 'Настройки')}
          </>}
          {role === 'super_admin' && <>
            {link('/dash/super-admin', 'Дашборд')}
            {link('/dash/super-admin/users', 'Пользователи')}
            {link('/dash/super-admin/offers', 'Офферы')}
            {link('/dash/super-admin/analytics', 'Аналитика')}
          </>}
        </div>
      </header>

      <main style={{padding:20}}>
        {children}
      </main>
    </div>
  );
}
