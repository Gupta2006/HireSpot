import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notify } from '../services/notifications';
import loginBackground from '../../assets/Login_background.png';

export default function Register() {
  const { register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: location.state?.role || 'candidate', company: '' });
  const [submitting, setSubmitting] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      notify('Registration successful.', 'success');
      navigate('/login', { state: { email: form.email } });
    } catch { /* The shared Fetch wrapper displays failed requests as notifications. */ }
    finally { setSubmitting(false); }
  };

  return (
    <main
      className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8 sm:px-6 sm:py-12 lg:py-16"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      <form onSubmit={handleSubmit} className="card mx-auto w-full max-w-md space-y-4 border-teal-100 bg-white/95 p-6 shadow-md backdrop-blur-sm sm:p-8">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <div>
          <label htmlFor="register-name" className="label">Name</label>
          <input id="register-name" name="name" required value={form.name} onChange={update} className="input" />
        </div>
        <div>
          <label htmlFor="register-email" className="label">Email</label>
          <input id="register-email" name="email" type="email" required value={form.email} onChange={update} className="input" />
        </div>
        <div>
          <label htmlFor="register-password" className="label">Password (min 6 characters)</label>
          <input id="register-password" name="password" type="password" required minLength={6} value={form.password} onChange={update} className="input" />
        </div>
        <div>
          <label htmlFor="register-role" className="label">I am a</label>
          <select id="register-role" name="role" value={form.role} onChange={update} className="input">
            <option value="candidate">Candidate</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </div>
        {form.role === 'recruiter' && (
          <div>
            <label htmlFor="register-company" className="label">Company name</label>
            <input id="register-company" name="company" required value={form.company} onChange={update} className="input" />
          </div>
        )}
        <button disabled={submitting} className="btn-primary w-full disabled:opacity-60">{submitting ? 'Creating account...' : 'Register'}</button>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
