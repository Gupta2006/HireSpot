import { useEffect, useState } from 'react';
import api, { downloadResume, uploadWithProgress } from '../../services/api';
import { formatDate } from '../../services/format';
import { notify } from '../../services/notifications';
import ProfilePictureCard from '../../components/ProfilePictureCard';

// Editable list of rows (used for both education and experience)
function RowEditor({ title, fields, rows, setRows }) {
  const update = (index, key, value) => setRows(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  const addRow = () => setRows([...rows, Object.fromEntries(fields.map(([key]) => [key, '']))]);

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <button type="button" className="btn-outline" onClick={addRow}>+ Add</button>
      </div>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[repeat(3,1fr)_auto]">
          {fields.map(([key, label]) => (
            <input key={key} placeholder={label} value={row[key] || ''} onChange={(e) => update(index, key, e.target.value)} className="input" />
          ))}
          <button type="button" className="btn-danger" onClick={() => setRows(rows.filter((_, i) => i !== index))}>Remove</button>
        </div>
      ))}
    </div>
  );
}

export default function Profile() {
  const [form, setForm] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [completion, setCompletion] = useState(0);
  const [profilePicture, setProfilePicture] = useState('');
  const [selectedResume, setSelectedResume] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeProgress, setResumeProgress] = useState(0);
  const [pictureProgress, setPictureProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.get('/profile/me').then(({ data }) => {
      const p = data.profile;
      setForm({
        name: data.name,
        email: data.email,
        headline: p.headline,
        skills: p.skills.join(', '),
        experienceYears: p.experienceYears,
        expectedCtc: p.expectedCtc || '',
        education: p.education,
        experience: p.experience,
      });
      setResumes(p.resumes);
      setProfilePicture(p.profilePicture || '');
      setCompletion(data.completion);
    }).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile/me', { ...form, skills: form.skills.split(',') });
      notify('Profile saved successfully.', 'success');
      load();
    } catch { /* The shared Fetch wrapper displays a clear alert for failed requests. */ }
    finally { setSaving(false); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(extension) || file.size > 2 * 1024 * 1024) {
      setSelectedResume('');
      notify('Please upload a PDF, DOC, or DOCX file up to 2 MB.', 'warning');
      e.target.value = '';
      return;
    }
    setSelectedResume(file.name);
    const data = new FormData();
    data.append('resume', file);
    setUploadingResume(true);
    setResumeProgress(0);
    try {
      await uploadWithProgress('/uploads/resume', data, setResumeProgress);
      notify('Resume uploaded successfully.', 'success');
      load();
    } catch { /* The shared Fetch wrapper displays a clear alert for failed requests. */ }
    finally { setUploadingResume(false); setResumeProgress(0); e.target.value = ''; }
  };

  const handlePictureUpload = async (file) => {
    const data = new FormData(); data.append('profilePicture', file);
    setPictureProgress(0);
    try { const { data: result } = await uploadWithProgress('/uploads/profile-picture', data, setPictureProgress); setProfilePicture(result.profilePicture); notify('Profile picture uploaded successfully.', 'success'); return true; }
    catch { return false; }
    finally { setPictureProgress(0); }
  };

  const handlePictureRemove = async () => {
    try { await api.delete('/uploads/profile-picture'); setProfilePicture(''); notify('Profile picture removed successfully.', 'success'); }
    catch { /* The shared Fetch wrapper displays a clear alert for failed requests. */ }
  };

  const [removingResume, setRemovingResume] = useState('');
  const handleResumeRemove = async (resume) => {
    if (!window.confirm(`Remove ${resume.originalName}?`)) return;
    setRemovingResume(resume._id);
    try {
      const { data } = await api.delete(`/files/${resume._id}`);
      setResumes(data.resumes);
      setCompletion(data.completion);
      notify('Resume removed successfully.', 'success');
    } catch { /* The shared Fetch wrapper displays a clear alert for failed requests. */ }
    finally { setRemovingResume(''); }
  };

  if (!form) return <p className="text-slate-500">Loading...</p>;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">{completion}% complete</span>
      </div>

      <div className="card grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><ProfilePictureCard picture={profilePicture} onUpload={handlePictureUpload} onRemove={handlePictureRemove} progress={pictureProgress} /></div>
        <div><label htmlFor="candidate-name" className="label">Name</label><input id="candidate-name" name="name" required value={form.name} onChange={update} className="input" /></div>
        <div><label htmlFor="candidate-email" className="label">Email</label><input id="candidate-email" value={form.email} disabled className="input bg-slate-50" /></div>
        <div className="sm:col-span-2"><label htmlFor="candidate-headline" className="label">Headline</label><input id="candidate-headline" name="headline" value={form.headline} onChange={update} placeholder="e.g. Final-year CS student" className="input" /></div>
        <div className="sm:col-span-2"><label htmlFor="candidate-skills" className="label">Skills (comma separated)</label><input id="candidate-skills" name="skills" value={form.skills} onChange={update} placeholder="React, Node.js, JavaScript" className="input" /></div>
        <div><label htmlFor="candidate-experience-years" className="label">Years of experience</label><input id="candidate-experience-years" name="experienceYears" type="number" min="0" value={form.experienceYears} onChange={update} className="input" /></div>
        <div><label htmlFor="candidate-expected-ctc" className="label">Expected CTC (LPA)</label><input id="candidate-expected-ctc" name="expectedCtc" type="number" min="0" value={form.expectedCtc} onChange={update} className="input" /></div>
      </div>

      <RowEditor title="Education" rows={form.education} setRows={(rows) => setForm({ ...form, education: rows })}
        fields={[['degree', 'Degree'], ['institution', 'Institution'], ['year', 'Year']]} />
      <RowEditor title="Experience" rows={form.experience} setRows={(rows) => setForm({ ...form, experience: rows })}
        fields={[['company', 'Company'], ['position', 'Position'], ['duration', 'Duration']]} />

      <div className="card space-y-3">
        <h2 className="font-semibold">Resume</h2>
        <p className="text-sm text-slate-500">PDF, DOC or DOCX, up to 2 MB.</p>
        <ul className="divide-y divide-slate-100 text-sm">
          {resumes.map((r) => (
            <li key={r._id} className="flex items-center justify-between py-2">
              <span>{r.originalName} <span className="text-slate-400">· {formatDate(r.uploadedAt)}</span></span>
              <div className="flex gap-2"><button type="button" className="btn-outline" onClick={() => downloadResume(`/api/files/${r._id}`, r.originalName)}>View</button><button type="button" className="btn-danger" onClick={() => handleResumeRemove(r)} disabled={removingResume === r._id}>{removingResume === r._id ? 'Removing...' : 'Remove Resume'}</button></div>
            </li>
          ))}
        </ul>
        <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-5">
          <input id="resume-upload" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleUpload} disabled={uploadingResume} className="peer sr-only" />
          <div className="flex flex-col items-center gap-3 text-center">
            <span aria-hidden="true" className="text-3xl">📄</span>
            <div>
              <p className="font-medium text-slate-800">Upload your resume</p>
              <p className="mt-1 text-sm text-slate-500">PDF, DOC or DOCX · Max 2 MB</p>
            </div>
            <label htmlFor="resume-upload" className="btn-outline cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500">
              {uploadingResume ? 'Uploading...' : 'Choose Resume'}
            </label>
            <p aria-live="polite" className="max-w-full break-all text-sm text-slate-600">
              {uploadingResume ? `Uploading ${selectedResume} (${resumeProgress}%)` : selectedResume ? `Selected: ${selectedResume}` : 'No resume selected'}
            </p>
            {uploadingResume && <progress className="h-2 w-full accent-teal-700" max="100" value={resumeProgress} aria-label={`Resume upload ${resumeProgress}%`} />}
          </div>
        </div>
      </div>

      <button disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Saving...' : 'Save Profile'}</button>
    </form>
  );
}
