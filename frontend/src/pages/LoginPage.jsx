import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Message } from 'primereact/message';
import { API_BASE } from '../api/client';
import { authApi } from '../api/resources';
import { useAuth } from '../state/AuthContext.jsx';

//IMPORT FUNGSI FIREBASE
import { loginDenganGoogle } from '../firebase';


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
      .catch(() => setGoogleEnabled(true)); // utk allow firebase testing
  }, []);

  if (user) return <Navigate to="/" replace />;

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

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

  //FUNGSI HANDLER UNTUK BUTANG GOOGLE FIREBASE
  async function handleFirebaseGoogleLogin(event) {
    event.preventDefault(); // Elak form daripada auto-submit
    setError('');
    setBusy(true);
    try {
      const firebaseUser = await loginDenganGoogle();
      console.log("Berjaya dapat Firebase User:", firebaseUser);
      
      // NOTA: Lepas dapat data firebaseUser (seperti token/email), korang biasanya kena hantar token ni 
      // ke backend korang atau panggil fungsi login dari AuthContext (cth: `await loginWithFirebase(firebaseUser)`)
      // supaya global state `user` dalam web app korang dikemas kini.
      
    } catch (err) {
      setError(err.message || 'Firebase Google authentication failed.');
    } finally {
      setBusy(false);
    }
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
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign up</button>
        </div>

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
          
          {/* TUKAR BUTANG DARIPADA LINK BACKEND KEPADA FUNGSI FIREBASE */}
          {googleEnabled ? (
            <Button 
              type="button" 
              className="google-button p-button-outlined" 
              onClick={handleFirebaseGoogleLogin}
              loading={busy}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#fff', color: '#444', border: '1px solid #ccc' }}
            >
              <i className="pi pi-google" style={{ color: '#4285F4' }} /> Continue with Google (Firebase)
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
