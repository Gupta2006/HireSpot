import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { uploadWithProgress } from '../../services/api';
import { notify } from '../../services/notifications';
import ProfilePictureCard from '../../components/ProfilePictureCard';

export default function RecruiterProfile() {
  const { updateUser } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pictureProgress, setPictureProgress] = useState(0);

  const load = () => api.get('/profile/recruiter/me').then(({ data }) => setForm(data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile/recruiter/me', { name: form.name, company: form.company });
      updateUser({ name: form.name.trim(), company: form.company.trim() });
      notify('Company profile saved.', 'success');
      load();
    } catch { /* The shared API wrapper displays a clear error message. */ }
    finally { setSaving(false); }
  };

  const uploadPicture = async (file) => {
    const body = new FormData();
    body.append('profilePicture', file);
    setPictureProgress(0);
    try {
      const { data } = await uploadWithProgress('/uploads/profile-picture', body, setPictureProgress);
      setForm(current => ({ ...current, profilePicture: data.profilePicture }));
      notify('Profile picture uploaded.', 'success');
      return true;
    } catch { return false; }
    finally { setPictureProgress(0); }
  };

  const removePicture = async () => {
    try {
      await api.delete('/uploads/profile-picture');
      setForm(current => ({ ...current, profilePicture: '' }));
      notify('Profile picture removed.', 'success');
    } catch { /* The shared API wrapper displays a clear error message. */ }
  };

  if (!form) return <p className="text-slate-500">Loading company profile...</p>;
  return (
    <form onSubmit={save} className="card mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Company profile</h1>
        <p className="mt-1 text-sm text-slate-600">Keep your recruiter and company details up to date.</p>
      </div>
      <ProfilePictureCard picture={form.profilePicture} onUpload={uploadPicture} onRemove={removePicture} progress={pictureProgress} />
      <div>
        <label className="label" htmlFor="recruiter-name">Your name</label>
        <input id="recruiter-name" className="input" required maxLength={100} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label className="label" htmlFor="recruiter-email">Email</label>
        <input id="recruiter-email" className="input bg-slate-50" value={form.email} disabled />
      </div>
      <div>
        <label className="label" htmlFor="recruiter-company">Company name</label>
        <input id="recruiter-company" className="input" required maxLength={120} value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
      </div>
      <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
    </form>
  );
}
