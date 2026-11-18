import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notify } from '../services/notifications';
import loginBackground from '../../assets/Login_background.png';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      notify('Login successful.', 'success');
      navigate(`/${user.role}`); // each role has its own dashboard
    } catch { /* The shared Fetch wrapper displays failed requests as notifications. */ }
    finally { setSubmitting(false); }
  };

  return (
    <main
      className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8 sm:px-6 sm:py-12 lg:py-16"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      <form onSubmit={handleSubmit} className="card mx-auto w-full max-w-md space-y-4 border-teal-100 bg-white/95 p-6 shadow-md backdrop-blur-sm sm:p-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <div>
            <label htmlFor="login-email" className="label">Email</label>
            <input id="login-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          </div>
          <div>
            <label htmlFor="login-password" className="label">Password</label>
            <input id="login-password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
          </div>
          <button disabled={submitting} className="btn-primary w-full disabled:opacity-60">{submitting ? 'Signing in...' : 'Login'}</button>
          <Link to="/register" className="btn-outline w-full">
            Register
          </Link>
      </form>
    </main>
  );
}
