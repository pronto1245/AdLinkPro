import React from 'react';
import { useLocation, Link } from 'wouter';
import { register as apiRegister } from '@/lib/auth';
import './auth-ui.css';

type Role = 'partner' | 'advertiser';
type Props = { role?: Role };

const CONTACT_PLACEHOLDER: Record<'telegram'|'whatsapp'|'phone'|'site', string> = {
  telegram: '@username',
  whatsapp: '+7 999 123-45-67',
  phone: '+7 999 123-45-67',
  site: 'https://your-site.com',
};

export default function RegisterUnified({ role }: Props) {
  const [, setLocation] = useLocation();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');

  const [contactType, setContactType] =
    React.useState<keyof typeof CONTACT_PLACEHOLDER>('telegram');
  const [contactValue, setContactValue] = React.useState('');

  const [company, setCompany] = React.useState('');
  const [agreeTos, setAgreeTos] = React.useState(false);
  const [agreePrivacy, setAgreePrivacy] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const title =
    role === 'partner' ? 'Регистрация партнёра' :
    role === 'advertiser' ? 'Регистрация рекламодателя' :
    'Регистрация';

  function validate(): string | null {
    if (!name.trim()) return 'Укажите имя';
    if (!email.trim()) return 'Укажите электронную почту';
    if (!password) return 'Укажите пароль';
    if (password.length < 6) return 'Пароль должен быть не короче 6 символов';
    if (password !== confirm) return 'Пароли не совпадают';
    if (!contactValue.trim()) return 'Укажите контакт для связи';
    if (role === 'advertiser' && !company.trim()) return 'Укажите название компании';
    if (role === 'advertiser' && !agreeTos) return 'Необходимо согласиться с условиями обслуживания';
    if (role === 'advertiser' && !agreePrivacy) return 'Необходимо согласиться с политикой конфиденциальности';
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setError(null);
    setLoading(true);
    try {
      const payload: any = {
        role,
        name,
        email,
        password,
        contactType,
        contactValue,
        company: role === 'advertiser' ? company : undefined,
        agreeTos: role === 'advertiser' ? agreeTos : undefined,
        agreePrivacy: role === 'advertiser' ? agreePrivacy : undefined,
      };
      await apiRegister(payload);
      await new Promise(r => setTimeout(r, 300));
      setSuccess(true);
    } catch (e: any) {
      setError(e?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <h1 className="auth-title">Заявка отправлена</h1>
          <div className="auth-success">
            Ваша регистрация прошла успешно, с Вами свяжется наш менеджер для активации аккаунта
            в течение 24 часов. Письмо с подтверждением отправлено на {email}.
          </div>
          <div className="auth-actions">
            <Link className="auth-btn" href={role === 'advertiser' ? '/login/advertiser' : '/login/partner'}>
              Перейти ко входу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">{title}</h1>
        <p className="auth-sub">Все поля обязательны для заполнения</p>

        {!role && (
          <div style={{display:'flex',gap:8,marginBottom:12,justifyContent:'center'}}>
            <Link className="auth-btn" href="/register/partner">Я партнёр</Link>
            <Link className="auth-btn" href="/register/advertiser">Я рекламодатель</Link>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="auth-field">
            <label>Имя *</label>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="auth-field">
            <label>Электронная почта *</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
          </div>

          <div className="auth-field">
            <label>Пароль *</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
          </div>

          <div className="auth-field">
            <label>Подтверждение пароля *</label>
            <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" required />
          </div>

          <div className="auth-field">
            <label>Тип контакта *</label>
            <select value={contactType} onChange={e => setContactType(e.target.value as any)}>
              <option value="telegram">Telegram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Телефон</option>
              <option value="site">Сайт</option>
            </select>
          </div>

          <div className="auth-field">
            <label>Контакт *</label>
            <input
              value={contactValue}
              onChange={e => setContactValue(e.target.value)}
              placeholder={CONTACT_PLACEHOLDER[contactType]}
              required
            />
          </div>

          {role === 'advertiser' && (
            <>
              <div className="auth-field">
                <label>Компания *</label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="ООО Ваша компания" required />
              </div>
              <div className="auth-field checkbox-field">
                <input id="tos" type="checkbox" checked={agreeTos} onChange={e => setAgreeTos(e.target.checked)} />
                <label htmlFor="tos">Я согласен с <a href="#" onClick={e => e.preventDefault()}>условиями обслуживания</a> *</label>
              </div>
              <div className="auth-field checkbox-field">
                <input id="pp" type="checkbox" checked={agreePrivacy} onChange={e => setAgreePrivacy(e.target.checked)} />
                <label htmlFor="pp">Я согласен с <a href="#" onClick={e => e.preventDefault()}>политикой конфиденциальности</a> *</label>
              </div>
            </>
          )}

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-actions">
            <button className="auth-btn" disabled={loading} type="submit">
              {loading ? 'Отправляем…' : 'Зарегистрироваться'}
            </button>
            <Link className="link" href={role === 'advertiser' ? '/login/advertiser' : '/login/partner'}>Уже есть аккаунт? Войти</Link>
          </div>

          <div className="auth-actions" style={{marginTop:8,justifyContent:'center'}}>
            {role === 'advertiser' ? (
              <Link className="link" href="/register/partner">Регистрация партнёра</Link>
            ) : (
              <Link className="link" href="/register/advertiser">Регистрация рекламодателя</Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
