import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Message } from 'primereact/message';
import { authApi } from '../api/resources';
import { useAuth } from '../state/AuthContext.jsx';

export default function LoginPage() {
  const { user, login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    authApi.config()
      .then((data) => setGoogleEnabled(data.googleOAuthEnabled))
      .catch(() => setGoogleEnabled(true)); // Untuk allow testing/fallback
  }, []);

  // Tangkap error daripada URL jika Passport Google Callback gagal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'google') {
      setError('Pautan Google melalui Passport.js gagal. Sila cuba lagi.');
    }
  }, []);

  if (user) return <Navigate to="/" replace />;

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  // PINTU 1: LOGIN/SIGNUP BIASA (EMEL + PASSWORD)
  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await signup(form);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  }

  // PINTU 2: LOGIK BARU GOOGLE LOGIN (HALA KE PASSPORT.JS BACKEND)
  function handlePassportGoogleLogin(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    
    // Aliran Komersial: Tolak browser terus ke endpoint googleStart di backend
    // Sila pastikan port (contoh: 5000) sepadan dengan port server Node.js korang
    window.location.href = 'http://localhost:5000/api/auth/google';
  }

  return (
    <main className="login-screen">
      <section className="login-hero">
        <p className="eyebrow">Carter Bank Loyalty</p>
        <h1>Redeem points for rewards that keep customers coming back.</h1>
        <p>Browse vouchers, spend points, and download a coupon PDF with unique codes and QR verification.</p>
      </section>

      <Card className="login-card">
        <div className="segmented">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign up</button>
        </div>

        {/* Form untuk Pintu 1 */}
        <form onSubmit={submit} className="form-stack">
          {error && <Message severity="error" text={error} />}
          <label>
            Email
            <InputText value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </label>
          {mode === 'signup' && (
            <label>
              Username
              <InputText value={form.username} onChange={(e) => update('username', e.target.value)} required />
            </label>
          )}
          <label>
            Password
            <Password value={form.password} onChange={(e) => update('password', e.target.value)} feedback={mode === 'signup'} toggleMask required />
          </label>
          
          <Button type="submit" label={mode === 'login' ? 'Login' : 'Create account'} icon="pi pi-lock" loading={busy} />
          
          {/* Pembahagi visual */}
          <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

          {/* Butang Google (Pintu 2) - Styling Asal Mengekalkan Nama Firebase Untuk Visual */}
          {googleEnabled ? (
            <Button 
              type="button" 
              className="google-button p-button-outlined" 
              onClick={handlePassportGoogleLogin} // <-- Memanggil fungsi Passport
              loading={busy}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#fff', color: '#444', border: '1px solid #ccc', width: '100%' }}
            >
              <i className="pi pi-google" style={{ color: '#4285F4' }} /> Continue with Google
            </Button>
          ) : (
            <Message severity="info" text="Google login is ready in code. Add Google credentials in backend .env to enable it." />
          )}
          
          <p className="demo-note">Demo accounts after seeding: user@carter.test / admin@carter.test, password: password123</p>
        </form>
      </Card>
    </main>
  );
}