import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { notify } from '../../services/notifications';

const emptyForm = { title: '', description: '', skills: '', location: '', workMode: 'hybrid', minExp: 0, ctcMin: '', ctcMax: '', deadline: '' };

// Used for both creating (/jobs/create) and editing (/jobs/:id/edit)
export default function JobForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get('/jobs/mine').then((res) => {
      const job = res.data.find((j) => j._id === id);
      if (!job) return navigate('/recruiter/jobs');
      setForm({
        title: job.title, description: job.description, skills: job.skills.join(', '), location: job.location,
        workMode: job.workMode, minExp: job.minExp, ctcMin: job.ctcRange.min, ctcMax: job.ctcRange.max,
        deadline: job.deadline.slice(0, 10),
      });
    }).catch(() => {});
  }, [id, navigate]);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      title: form.title, description: form.description, location: form.location, workMode: form.workMode,
      minExp: form.minExp, deadline: form.deadline, skills: form.skills.split(','),
      ctcRange: { min: form.ctcMin, max: form.ctcMax },
    };
    try {
      if (id) await api.patch(`/jobs/${id}`, payload);
      else await api.post('/jobs', payload);
      notify(id ? 'Job updated successfully.' : 'Job posted successfully.', 'success');
      navigate('/recruiter/jobs');
    } catch { /* The shared Fetch wrapper displays a clear alert for failed requests. */ }
    finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="card grid gap-4 sm:grid-cols-2">
      <h1 className="text-2xl font-bold sm:col-span-2">{id ? 'Edit Job' : 'Post a Job'}</h1>
      <div className="sm:col-span-2"><label className="label">Job title</label><input name="title" required value={form.title} onChange={update} className="input" /></div>
      <div className="sm:col-span-2"><label className="label">Description</label><textarea name="description" required rows={5} value={form.description} onChange={update} className="input" /></div>
      <div className="sm:col-span-2"><label className="label">Skills (comma separated)</label><input name="skills" value={form.skills} onChange={update} placeholder="React, Node.js" className="input" /></div>
      <div><label className="label">Location</label><input name="location" required value={form.location} onChange={update} className="input" /></div>
      <div>
        <label className="label">Work mode</label>
        <select name="workMode" value={form.workMode} onChange={update} className="input">
          <option value="onsite">Onsite</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option>
        </select>
      </div>
      <div><label className="label">Minimum experience (years)</label><input name="minExp" type="number" min="0" required value={form.minExp} onChange={update} className="input" /></div>
      <div><label className="label">Application deadline</label><input name="deadline" type="date" required value={form.deadline} onChange={update} className="input" /></div>
      <div><label className="label">CTC minimum (LPA)</label><input name="ctcMin" type="number" min="0" step="0.5" required value={form.ctcMin} onChange={update} className="input" /></div>
      <div><label className="label">CTC maximum (LPA)</label><input name="ctcMax" type="number" min="0" step="0.5" required value={form.ctcMax} onChange={update} className="input" /></div>
      <div className="sm:col-span-2"><button disabled={submitting} className="btn-primary disabled:opacity-60">{submitting ? 'Saving...' : id ? 'Save Changes' : 'Create Job'}</button></div>
    </form>
  );
}
