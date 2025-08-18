import React from 'react';
import { Link } from 'wouter';
import './auth-ui.css';

export default function ForgotPassword() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string|null>(null);
  const [done, setDone] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError('Укажите электронную почту'); return; }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      setDone(true);
    } catch (e: any) {
      setError(e?.message || 'Не удалось отправить письмо');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <h1 className="auth-title">Письмо отправлено</h1>
          <div className="auth-success">
            Мы отправили инструкции по восстановлению пароля на {email}.
            Проверьте почту и следуйте шагам в письме.
          </div>
          <div className="auth-actions">
            <Link className="auth-btn" href="/login">Вернуться ко входу</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">Восстановление пароля</h1>
        <p className="auth-sub">Укажите email, на него придут инструкции</p>
        <form onSubmit={onSubmit}>
          <div className="auth-field">
            <label>Электронная почта *</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <div className="auth-actions">
            <button className="auth-btn" disabled={loading} type="submit">
              {loading ? 'Отправляем…' : 'Отправить инструкции'}
            </button>
            <Link className="link" href="/login">Отмена</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
