import { useEffect, useState } from 'react';
import api from '../../services/api';
import Icon from '../../components/Icon';
import { useAuth } from '../../context/AuthContext';
import { uploadWithProgress } from '../../services/api';

function useLoad(path, params) {
  const paramsKey = JSON.stringify(params || {});
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let current = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await api.get(path, { params: JSON.parse(paramsKey) });
        if (current) setData(result.data);
      } catch (e) {
        if (current) setError(e.response?.data?.message || 'Unable to load this information.');
      } finally {
        if (current) setLoading(false);
      }
    };
    load();
    return () => { current = false; };
  }, [path, paramsKey, revision]);
  return { data, error, loading, refresh: () => setRevision(value => value + 1) };
}

const fmt = value => value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const titleCase = value => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase());

function Page({ title, subtitle, eyebrow, children }) {
  return <section className="admin-page space-y-6">
    <header className="admin-page-heading">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2F6F73]">{eyebrow || 'HireSpot administration'}</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#17324D] sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p>}
    </header>
    {children}
  </section>;
}

function Feedback({ loading, error, onRetry }) {
  if (loading) return <div className="admin-feedback" role="status"><span className="admin-spinner" /> Loading information…</div>;
  if (error) return <div className="admin-feedback admin-error" role="alert"><span>{error}</span>{onRetry && <button className="admin-text-button" onClick={onRetry}>Try again</button>}</div>;
  return null;
}

function EmptyState({ title, message }) {
  return <div className="admin-empty"><span className="admin-empty-mark"><Icon name="document" className="h-6 w-6" /></span><h3>{title}</h3><p>{message}</p></div>;
}

function StatCard({ label, value, icon, note }) {
  return <article className="admin-stat-card">
    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-600">{label}</p><p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-[#17324D]">{value ?? 0}</p></div>
      <span className="admin-stat-icon"><Icon name={icon} className="h-5 w-5" /></span></div>
    {note && <p className="mt-3 text-xs text-slate-500">{note}</p>}
  </article>;
}

function Table({ headers, children, minWidth = '720px' }) {
  return <div className="admin-table-wrap"><table className="admin-table" style={{ minWidth }}><thead><tr>{headers.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function Badge({ children, tone = 'neutral' }) { return <span className={`admin-badge admin-badge-${tone}`}>{children}</span>; }
function roleTone(role) { return role === 'admin' ? 'gold' : role === 'recruiter' ? 'teal' : 'blue'; }
function statusTone(status) { return ({ approved: 'green', active: 'green', pending: 'gold', rejected: 'red', closed: 'neutral', inactive: 'neutral' })[String(status).toLowerCase()] || 'neutral'; }

function Panel({ title, action, children, className = '' }) {
  return <section className={`admin-panel ${className}`}><div className="admin-panel-heading"><h2>{title}</h2>{action}</div>{children}</section>;
}

export function AdminDashboard() {
  const { data, error, loading, refresh } = useLoad('/admin/dashboard');
  return <Page title="Overview" subtitle="A current snapshot of people, job posts, and applications across HireSpot.">
    <Feedback loading={loading} error={error} onRetry={refresh} />
    {data && <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total users" value={data.users.total} icon="users" note="All registered accounts" />
        <StatCard label="Candidates" value={data.users.candidates} icon="profile" note="Candidate accounts" />
        <StatCard label="Recruiters" value={data.users.recruiters} icon="briefcase" note="Recruiter accounts" />
        <StatCard label="Total job posts" value={data.jobs.total} icon="document" note="Across every status" />
        <StatCard label="Active jobs" value={data.jobs.approved} icon="checkCircle" note="Approved and published" />
        <StatCard label="Applications" value={data.applications.total} icon="chart" note="Applications received" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Hiring pipeline" className="h-full">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {['applied', 'shortlisted', 'interview', 'offered', 'rejected'].map(stage => <div key={stage} className="admin-pipeline-item"><span>{titleCase(stage)}</span><strong>{data.applications[stage] || 0}</strong></div>)}
          </div>
        </Panel>
        <Panel title="Job post status" action={<span className="text-xs text-slate-500">{data.jobs.total} total</span>}>
          <div className="space-y-4">
            {['pending', 'approved', 'rejected', 'closed'].map(status => {
              const count = data.jobs[status] || 0;
              const percentage = data.jobs.total ? Math.round((count / data.jobs.total) * 100) : 0;
              return <div key={status}>
                <div className="mb-1.5 flex justify-between text-sm"><span className="text-slate-600">{titleCase(status)}</span><strong className="font-semibold text-[#17324D]">{count}</strong></div>
                <div className="admin-progress-track"><div className={`admin-progress-fill progress-${status}`} style={{ width: `${percentage}%` }} /></div>
              </div>;
            })}
          </div>
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Recently registered">
          {data.recentUsers.length ? <div className="divide-y divide-slate-100">{data.recentUsers.map(user => <div className="admin-list-row" key={user.id}>
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div>
            <div className="flex shrink-0 items-center gap-3"><Badge tone={roleTone(user.role)}>{titleCase(user.role)}</Badge><span className="hidden text-xs text-slate-500 sm:block">{fmt(user.createdAt)}</span></div>
          </div>)}</div> : <EmptyState title="No registered users" message="New account registrations will appear here." />}
        </Panel>
        <Panel title="Recently posted jobs">
          {data.recentJobs.length ? <div className="divide-y divide-slate-100">{data.recentJobs.map(job => <div className="admin-list-row" key={job._id}>
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{job.title}</p><p className="truncate text-xs text-slate-500">{job.company} · {job.recruiter?.name || 'Unknown recruiter'}</p></div>
            <div className="flex shrink-0 flex-col items-end gap-1"><Badge tone={statusTone(job.status)}>{titleCase(job.status)}</Badge><span className="text-xs text-slate-500">{fmt(job.createdAt)}</span></div>
          </div>)}</div> : <EmptyState title="No job posts yet" message="Recruiter job posts will appear here." />}
        </Panel>
      </div>
    </>}
  </Page>;
}

export function AdminProfile() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [pictureFile, setPictureFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [removePicture, setRemovePicture] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let current = true;
    api.get('/admin/profile/me')
      .then(result => {
        if (!current) return;
        setProfile(result.data);
        setName(result.data.name || '');
      })
      .catch(e => { if (current) setError(e.response?.data?.message || 'Unable to load your admin profile.'); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, []);
  useEffect(() => {
    if (!preview) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const beginEdit = () => {
    setName(profile.name || '');
    setPictureFile(null);
    setPreview('');
    setRemovePicture(false);
    setError('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setName(profile.name || '');
    setPictureFile(null);
    setPreview('');
    setRemovePicture(false);
    setProgress(0);
    setError('');
    setEditing(false);
  };

  const selectPicture = event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(extension) || !['image/jpeg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError('Choose a JPG or PNG image up to 2 MB.');
      return;
    }
    setError('');
    setRemovePicture(false);
    setPictureFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const saveProfile = async event => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      setError('Enter a name between 1 and 100 characters.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let profilePicture = profile.profilePicture || '';
      if (removePicture && profilePicture) {
        await api.delete('/uploads/profile-picture');
        profilePicture = '';
      }
      if (pictureFile) {
        const body = new FormData();
        body.append('profilePicture', pictureFile);
        const result = await uploadWithProgress('/uploads/profile-picture', body, setProgress);
        profilePicture = result.data.profilePicture;
      }
      const result = await api.put('/admin/profile/me', { name: trimmedName });
      const updatedProfile = { ...result.data, profilePicture };
      setProfile(updatedProfile);
      updateUser({ name: updatedProfile.name, profilePicture: updatedProfile.profilePicture });
      setPictureFile(null);
      setPreview('');
      setRemovePicture(false);
      setProgress(0);
      setEditing(false);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to save profile changes. Please try again.');
      try {
        const latest = (await api.get('/admin/profile/me')).data;
        setProfile(latest);
        updateUser({ name: latest.name, profilePicture: latest.profilePicture || '' });
      } catch { /* Keep the form available if the profile refresh also fails. */ }
    } finally { setSaving(false); }
  };

  const displayedPicture = preview || (removePicture ? '' : profile?.profilePicture || '');
  const initials = (profile?.name || name || 'Admin').trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  const [failedPicture, setFailedPicture] = useState('');
  const showPicture = displayedPicture && failedPicture !== displayedPicture;

  return <Page title="Admin Profile" subtitle="Manage the name and profile picture shown across your admin workspace." eyebrow="Account settings">
    <Feedback loading={loading} error={error && !profile ? error : ''} />
    {profile && <form className="admin-profile-card" onSubmit={saveProfile}>
      <div className="admin-profile-card-heading">
        <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2F6F73]">Your account</p><h2>Profile details</h2></div>
        {!editing && <button type="button" className="admin-profile-edit" onClick={beginEdit}>Edit Profile</button>}
      </div>
      <div className="admin-profile-main">
        <div className="admin-profile-photo-wrap">
          <div className="admin-profile-avatar">
            {showPicture ? <img src={displayedPicture} alt="Admin profile preview" onError={() => setFailedPicture(displayedPicture)} /> : <span>{initials}</span>}
          </div>
          <span className="admin-profile-role">Administrator</span>
        </div>
        <div className="admin-profile-fields">
          <label className="admin-profile-field"><span>Admin name</span>{editing
            ? <input className="input" maxLength={100} value={name} onChange={event => setName(event.target.value)} aria-label="Admin name" />
            : <strong>{profile.name}</strong>}</label>
          <label className="admin-profile-field"><span>Email address</span><input className="input bg-slate-50" value={profile.email} readOnly aria-label="Admin email" /></label>
          <div className="admin-profile-field"><span>Role</span><strong>Administrator</strong></div>
        </div>
      </div>
      {editing && <div className="admin-profile-editor">
        <div className="admin-profile-upload-row">
          <div className="min-w-0"><p className="text-sm font-semibold text-[#17324D]">Profile picture</p><p className="mt-1 text-xs text-slate-500">JPG or PNG, up to 2 MB. Preview before saving.</p></div>
          <div className="flex flex-wrap gap-2">
            <label className="btn-outline cursor-pointer">{pictureFile ? 'Choose another' : 'Choose photo'}<input className="sr-only" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={selectPicture} disabled={saving} /></label>
            {(profile.profilePicture || pictureFile) && <button type="button" className="btn-danger" onClick={() => { if (pictureFile) { setPictureFile(null); setPreview(''); setRemovePicture(false); } else setRemovePicture(value => !value); }} disabled={saving}>{pictureFile ? 'Discard photo' : removePicture ? 'Undo removal' : 'Remove photo'}</button>}
          </div>
        </div>
        {progress > 0 && saving && <div className="mt-4"><progress className="block h-2 w-full accent-teal-700" max="100" value={progress} aria-label={`Profile picture upload ${progress}%`} /><p className="mt-1 text-xs text-slate-500">Uploading {progress}%</p></div>}
        {error && <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
        <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" className="btn-outline" onClick={cancelEdit} disabled={saving}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </div>}
    </form>}
    {profile && !editing && error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
  </Page>;
}

export function AdminUsers() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [selected, setSelected] = useState(null);
  const { data, error, loading, refresh } = useLoad('/admin/users', { search, role });
  const inspect = async id => {
    try { setSelected((await api.get(`/admin/users/${id}`)).data); }
    catch (e) { window.alert(e.response?.data?.message || 'Unable to load user.'); }
  };
  const toggle = async user => {
    const action = user.active ? 'deactivate' : 'activate';
    if (!window.confirm(`${action} ${user.name}'s account?`)) return;
    try {
      await api.patch(`/admin/users/${user.id}/status`, { active: !user.active });
      refresh();
      if (selected?.id === user.id) inspect(user.id);
    } catch (e) { window.alert(e.response?.data?.message || 'Unable to update account.'); }
  };
  return <Page title="User management" subtitle="Search accounts, review registration details, and manage access." eyebrow="People">
    <div className="admin-toolbar">
      <label className="admin-search"><Icon name="search" className="h-4 w-4" /><input aria-label="Search users" placeholder="Search name or email" value={search} onChange={e => setSearch(e.target.value)} /></label>
      <label className="admin-filter"><span>Role</span><select aria-label="Filter by role" value={role} onChange={e => setRole(e.target.value)}><option value="">All roles</option><option value="candidate">Candidate</option><option value="recruiter">Recruiter</option><option value="admin">Admin</option></select></label>
      {data && <span className="admin-result-count">{data.length} {data.length === 1 ? 'account' : 'accounts'}</span>}
    </div>
    <Feedback loading={loading} error={error} onRetry={refresh} />
    {data && (data.length ? <Table headers={['User', 'Role', 'Registered', 'Status', 'Actions']} minWidth="760px">
      {data.map(user => <tr key={user.id}>
        <td><div className="font-semibold text-slate-800">{user.name}</div><div className="mt-0.5 text-xs text-slate-500">{user.email}</div></td>
        <td><Badge tone={roleTone(user.role)}>{titleCase(user.role)}</Badge></td>
        <td className="whitespace-nowrap">{fmt(user.createdAt)}</td>
        <td><Badge tone={user.active ? 'green' : 'neutral'}>{user.active ? 'Active' : 'Inactive'}</Badge></td>
        <td><div className="flex items-center gap-3"><button className="admin-text-button" onClick={() => inspect(user.id)}>Details</button>{user.role !== 'admin' && <button className={user.active ? 'admin-danger-button' : 'admin-text-button'} onClick={() => toggle(user)}>{user.active ? 'Deactivate' : 'Activate'}</button>}</div></td>
      </tr>)}
    </Table> : !loading && <EmptyState title="No accounts match" message="Try a different name, email, or role filter." />)}
    {selected && <Panel title="Account details" action={<button className="admin-text-button" onClick={() => setSelected(null)}>Close</button>}>
      <div className="grid gap-4 text-sm sm:grid-cols-2">
        <div><p className="admin-detail-label">Name</p><p className="admin-detail-value">{selected.name}</p></div>
        <div><p className="admin-detail-label">Email</p><p className="admin-detail-value break-all">{selected.email}</p></div>
        <div><p className="admin-detail-label">Role and status</p><div className="mt-1 flex gap-2"><Badge tone={roleTone(selected.role)}>{titleCase(selected.role)}</Badge><Badge tone={selected.active ? 'green' : 'neutral'}>{selected.active ? 'Active' : 'Inactive'}</Badge></div></div>
        <div><p className="admin-detail-label">Registered</p><p className="admin-detail-value">{fmt(selected.createdAt)}</p></div>
        {selected.company && <div><p className="admin-detail-label">Company</p><p className="admin-detail-value">{selected.company}</p></div>}
        {selected.profile && <div className="sm:col-span-2"><p className="admin-detail-label">Candidate profile</p><p className="admin-detail-value">{selected.profile.headline || 'No headline'} · {selected.profile.skills?.join(', ') || 'No skills listed'} · {selected.profile.experienceYears ?? 0} years experience</p></div>}
      </div>
    </Panel>}
  </Page>;
}

function DistributionPanel({ title, values }) {
  const rows = Object.entries(values || {});
  const max = Math.max(1, ...rows.map(([, value]) => value));
  return <Panel title={title}>{rows.length ? <div className="space-y-4">{rows.map(([key, value]) => <div key={key}>
    <div className="mb-1.5 flex justify-between text-sm"><span className="capitalize text-slate-600">{titleCase(key)}</span><strong className="text-[#17324D]">{value}</strong></div>
    <div className="admin-progress-track"><div className="admin-progress-fill progress-approved" style={{ width: `${Math.max(value ? 4 : 0, Math.round(value / max * 100))}%` }} /></div>
  </div>)}</div> : <EmptyState title="No data available" message="This breakdown will appear when records are available." />}</Panel>;
}

export function AdminJobs() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const { data, error, loading, refresh } = useLoad('/admin/jobs', { search, status });
  const act = async (job, action) => {
    let body;
    if (action === 'reject') {
      const reason = window.prompt('Reason for rejection:');
      if (!reason?.trim()) return;
      body = { reason };
    } else if (!window.confirm(`${action} “${job.title}”?`)) return;
    try { await api.patch(`/admin/jobs/${job._id}/${action}`, body || {}); refresh(); setSelected(null); }
    catch (e) { window.alert(e.response?.data?.message || 'Unable to update job.'); }
  };
  return <Page title="Job management" subtitle="Review job posts, see application volume, and manage publication status." eyebrow="Marketplace">
    <div className="admin-toolbar">
      <label className="admin-search"><Icon name="search" className="h-4 w-4" /><input aria-label="Search jobs" placeholder="Search title, company, recruiter" value={search} onChange={e => setSearch(e.target.value)} /></label>
      <label className="admin-filter"><span>Status</span><select aria-label="Filter by status" value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{['pending', 'approved', 'rejected', 'closed'].map(value => <option key={value} value={value}>{titleCase(value)}</option>)}</select></label>
      {data && <span className="admin-result-count">{data.length} {data.length === 1 ? 'job' : 'jobs'}</span>}
    </div>
    <Feedback loading={loading} error={error} onRetry={refresh} />
    {data && (data.length ? <Table headers={['Job post', 'Location', 'Recruiter / company', 'Applications', 'Status', 'Actions']} minWidth="1000px">
      {data.map(job => <tr key={job._id}>
        <td><div className="font-semibold text-slate-800">{job.title}</div><div className="mt-0.5 text-xs text-slate-500">Posted {fmt(job.createdAt)}</div></td>
        <td>{job.location || '—'}</td>
        <td><div className="font-medium text-slate-700">{job.recruiter?.name || 'Unknown'}</div><div className="mt-0.5 text-xs text-slate-500">{job.company}</div></td>
        <td className="font-semibold tabular-nums text-[#17324D]">{job.applications ?? 0}</td>
        <td><Badge tone={statusTone(job.status)}>{titleCase(job.status)}</Badge></td>
        <td><div className="flex items-center gap-3"><button className="admin-text-button" onClick={() => setSelected(job)}>Details</button>{job.status === 'pending' && <><button className="admin-text-button" onClick={() => act(job, 'approve')}>Approve</button><button className="admin-danger-button" onClick={() => act(job, 'reject')}>Reject</button></>}{['approved', 'pending'].includes(job.status) && <button className="admin-danger-button" onClick={() => act(job, 'close')}>Close</button>}</div></td>
      </tr>)}
    </Table> : !loading && <EmptyState title="No jobs match" message="Try another search or status filter." />)}
    {selected && <Panel title="Job details" action={<button className="admin-text-button" onClick={() => setSelected(null)}>Close</button>}>
      <div className="grid gap-4 text-sm sm:grid-cols-2">
        <div><p className="admin-detail-label">Job title</p><p className="admin-detail-value">{selected.title}</p></div>
        <div><p className="admin-detail-label">Company and recruiter</p><p className="admin-detail-value">{selected.company} · {selected.recruiter?.name || 'Unknown'} ({selected.recruiter?.email || '—'})</p></div>
        <div><p className="admin-detail-label">Location and work mode</p><p className="admin-detail-value">{selected.location} · {titleCase(selected.workMode)}</p></div>
        <div><p className="admin-detail-label">Status and applications</p><p className="admin-detail-value"><Badge tone={statusTone(selected.status)}>{titleCase(selected.status)}</Badge><span className="ml-2">{selected.applications ?? 0} applications</span></p></div>
        <div><p className="admin-detail-label">Experience and CTC</p><p className="admin-detail-value">{selected.minExp} years · {selected.ctcRange?.min}–{selected.ctcRange?.max}</p></div>
        <div><p className="admin-detail-label">Deadline</p><p className="admin-detail-value">{fmt(selected.deadline)}</p></div>
        <div className="sm:col-span-2"><p className="admin-detail-label">Description</p><p className="admin-detail-value whitespace-pre-wrap">{selected.description}</p></div>
        {selected.skills?.length > 0 && <div className="sm:col-span-2"><p className="admin-detail-label">Skills</p><p className="admin-detail-value">{selected.skills.join(', ')}</p></div>}
        {selected.rejectionReason && <div className="sm:col-span-2"><p className="admin-detail-label">Rejection reason</p><p className="admin-detail-value text-red-700">{selected.rejectionReason}</p></div>}
      </div>
    </Panel>}
  </Page>;
}

function MonthlyRegistrations({ registrations }) {
  const monthly = [...(Array.isArray(registrations) ? registrations : [])]
    .filter(([month, count]) => /^\d{4}-\d{2}$/.test(month) && Number.isFinite(count) && count >= 0)
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB));
  const highestCount = Math.max(0, ...monthly.map(([, count]) => count));

  return <Panel title="Registrations by month" action={<span className="text-xs text-slate-500">Candidate and recruiter accounts</span>}>
    {monthly.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{monthly.map(([month, count]) => {
      const width = highestCount ? (count / highestCount) * 100 : 0;
      return <div className="admin-month-card" key={month}>
        <div className="mb-2 flex items-baseline justify-between gap-2"><time className="font-medium text-slate-600" dateTime={month}>{month}</time><strong className="text-[#17324D]">{count}</strong></div>
        <div className="admin-progress-track" role="progressbar" aria-label={`${month} registrations`} aria-valuemin={0} aria-valuemax={highestCount} aria-valuenow={count}>
          <div className="admin-progress-fill progress-approved" style={{ width: `${width}%` }} />
        </div>
      </div>;
    })}</div> : <EmptyState title="No registrations yet" message="Monthly counts will appear here after candidates or recruiters register." />}
  </Panel>;
}

export function AdminAnalytics() {
  const { data, error, loading, refresh } = useLoad('/admin/analytics');
  return <Page title="Analytics" subtitle="Simple summaries calculated from persisted account, job, and application records." eyebrow="Platform insights">
    <Feedback loading={loading} error={error} onRetry={refresh} />
    {data && <>
      <div className="grid gap-5 lg:grid-cols-3"><DistributionPanel title="Users by role" values={data.userRoles} /><DistributionPanel title="Jobs by status" values={data.jobsByStatus} /><DistributionPanel title="Applications by stage" values={data.applicationsByStage} /></div>
      <MonthlyRegistrations registrations={data.registrationsByMonth} />
      <Panel title="Recent job and application activity" action={<span className="text-xs text-slate-500">Latest records</span>}>
        {data.activity.length ? <div className="divide-y divide-slate-100">{data.activity.map((item, index) => <div className="admin-activity-row" key={`${item.type}-${item.date}-${index}`}>
          <span className={`admin-activity-icon ${item.type === 'application' ? 'activity-teal' : 'activity-gold'}`}><Icon name={item.type === 'application' ? 'profile' : 'briefcase'} className="h-4 w-4" /></span>
          <div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-800">{item.label}</p><p className="truncate text-xs text-slate-500">{item.detail}</p></div><time className="shrink-0 text-xs text-slate-500">{fmt(item.date)}</time>
        </div>)}</div> : <EmptyState title="No recent activity" message="Job posts and applications will appear here." />}
      </Panel>
    </>}
  </Page>;
}
