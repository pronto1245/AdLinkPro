import React from 'react';
import { useLocation, Link } from 'wouter';
import { login as apiLogin, HOME as HOME_BY_ROLE } from '@/lib/auth';
import Brand from '@/components/Brand';
import './auth-ui.css';

type Props = { role?: 'partner' | 'advertiser' };

export default function Login({ role }: Props) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [, setLocation] = useLocation();

  const [forgotOpen, setForgotOpen] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [forgotError, setForgotError] = React.useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = React.useState(false);
  const [forgotDone, setForgotDone] = React.useState(false);

  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const next = params.get('next');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user } = await apiLogin({ email, password, otp: otp || undefined, role });
      const home = HOME_BY_ROLE[((role ?? (user as any)?.role) as any)] || '/';
      setLocation(next || home);
    } catch (e: any) {
      setError(e?.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  }

  async function onForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setForgotError(null);
    if (!forgotEmail.trim()) { setForgotError('Укажите электронную почту'); return; }
    setForgotLoading(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      setForgotDone(true);
    } catch (e: any) {
      setForgotError(e?.message || 'Не удалось отправить письмо');
    } finally {
      setForgotLoading(false);
    }
  }

  function closeForgot() {
    setForgotOpen(false);
    setForgotError(null);
    setForgotLoading(false);
    setForgotDone(false);
  }

  return (
    <div className="auth-wrap">
      <div>
        <Brand />
        <div className="auth-card">
          <h1 className="auth-title">
            {role === 'partner' ? 'Вход для партнёров' : role === 'advertiser' ? 'Вход для рекламодателей' : 'Вход в систему'}
          </h1>
          <p className="auth-sub">Введите данные, чтобы продолжить</p>

          <form onSubmit={onSubmit}>
            <div className="auth-field">
              <label>Email</label>
              <input autoFocus value={email} onChange={e => setEmail(e.target.value)} type="email" required />
            </div>
            <div className="auth-field">
              <label>Пароль</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',marginTop:-6,marginBottom:10}}>
              <button type="button" className="link" onClick={()=>setForgotOpen(true)}>Забыли пароль?</button>
            </div>
            <div className="auth-field">
              <label>Код 2FA (если требуется)</label>
              <input value={otp} onChange={e => setOtp(e.target.value)} inputMode="numeric" />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-actions">
              <button className="auth-btn" disabled={loading} type="submit">{loading ? 'Входим…' : 'Войти'}</button>
            </div>
          </form>

          <div className="auth-sub" style={{ textAlign: 'center', marginTop: 12 }}>Ещё нет аккаунта?</div>
          <div className="auth-ctas">
            <Link className="auth-btn outline" href="/register/partner">🤝 Стать партнёром</Link>
            <Link className="auth-btn outline" href="/register/advertiser">📄 Стать рекламодателем</Link>
          </div>
        </div>
      </div>

      {forgotOpen && (
        <div className="modal-backdrop" onClick={(e)=>{ if(e.target===e.currentTarget) closeForgot(); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="forgot-title">
            {!forgotDone ? (
              <>
                <h2 id="forgot-title">Восстановление пароля</h2>
                <p>Укажите email, на него придут инструкции</p>
                <form onSubmit={onForgotSubmit}>
                  <div className="auth-field">
                    <label>Электронная почта *</label>
                    <input type="email" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} required />
                  </div>
                  {forgotError && <div className="auth-error">{forgotError}</div>}
                  <div className="modal-actions">
                    <button type="button" className="auth-btn btn-ghost" onClick={closeForgot}>Отмена</button>
                    <button type="submit" className="auth-btn" disabled={forgotLoading}>
                      {forgotLoading ? 'Отправляем…' : 'Отправить'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 id="forgot-title">Письмо отправлено</h2>
                <div className="auth-success">
                  Мы отправили инструкции по восстановлению пароля на {forgotEmail}.
                  Проверьте почту и следуйте шагам в письме.
                </div>
                <div className="modal-actions">
                  <button type="button" className="auth-btn" onClick={closeForgot}>Закрыть</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
