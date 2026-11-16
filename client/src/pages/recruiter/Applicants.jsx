import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { downloadResume } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { capitalize, formatDate } from '../../services/format';
import { notify } from '../../services/notifications';

// Same rules as the server's state machine (the server enforces them too)
const NEXT_STAGES = {
  applied: ['shortlisted', 'rejected'],
  shortlisted: ['interview', 'rejected'],
  interview: ['offered', 'rejected'],
  offered: [],
  rejected: [],
};

function ApplicantCard({ applicant }) {
  const [stage, setStage] = useState(applicant.stage);
  const [newStage, setNewStage] = useState('');
  const [notes, setNotes] = useState(applicant.recruiterNotes);
  const [noteText, setNoteText] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const { candidateId: candidate, profile } = applicant;

  const changeStage = async () => {
    try {
      await api.patch(`/applications/${applicant._id}/stage`, { stage: newStage });
      setStage(newStage);
      setNewStage('');
      notify('Application stage updated.', 'success');
    } catch { /* The Fetch wrapper already displayed the request error. */ }
  };

  const addNote = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/applications/${applicant._id}/notes`, { text: noteText });
      setNotes(res.data.recruiterNotes);
      setNoteText('');
      notify('Note added.', 'success');
    } catch { /* The Fetch wrapper already displayed the request error. */ }
  };

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{candidate.name}</h2>
          <p className="text-sm text-slate-500">{candidate.email} · Applied {formatDate(applicant.createdAt)}</p>
          {profile?.headline && <p className="mt-1 text-sm text-slate-600">{profile.headline}</p>}
        </div>
        <StatusBadge status={stage} />
      </div>

      <div className="text-sm text-slate-600">
        <p>Experience: {profile?.experienceYears ?? 0} years</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {profile?.skills.map((skill) => (
            <span key={skill} className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">{skill}</span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-outline" onClick={() => downloadResume(applicant.resumeUrl, `${candidate.name}-resume`).catch(() => {})}>
          View Resume
        </button>
        <button className="btn-outline" onClick={() => setShowDetails(!showDetails)}>{showDetails ? 'Hide details' : 'View details'}</button>
        {NEXT_STAGES[stage].length > 0 && (
          <>
            <select value={newStage} onChange={(e) => setNewStage(e.target.value)} className="input w-40">
              <option value="">Move to...</option>
              {NEXT_STAGES[stage].map((s) => <option key={s} value={s}>{capitalize(s)}</option>)}
            </select>
            <button className="btn-primary" disabled={!newStage} onClick={changeStage}>Update</button>
          </>
        )}
      </div>

      {showDetails && (
        <div className="space-y-3 border-t border-slate-100 pt-4 text-sm">
          {applicant.coverNote && <p><span className="font-medium">Cover note:</span> {applicant.coverNote}</p>}
          {profile?.education.map((e, i) => <p key={i}>🎓 {e.degree}, {e.institution} ({e.year})</p>)}
          {profile?.experience.map((e, i) => <p key={i}>💼 {e.position} at {e.company} ({e.duration})</p>)}

          <div>
            <p className="font-medium">Internal notes</p>
            <ul className="mt-1 list-inside list-disc text-slate-600">
              {notes.map((n) => <li key={n._id}>{n.text}</li>)}
            </ul>
            <form onSubmit={addNote} className="mt-2 flex gap-2">
              <input value={noteText} onChange={(e) => setNoteText(e.target.value)} maxLength={500} placeholder="Add a note (only recruiters see this)" className="input" />
              <button className="btn-primary" disabled={!noteText.trim()}>Add</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Applicants() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/jobs/${id}/applicants`).then((res) => setData(res.data)).catch(() => {});
  }, [id]);

  if (!data) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="space-y-4">
      <Link to="/recruiter/jobs" className="text-sm font-medium text-indigo-600">← Back to my jobs</Link>
      <h1 className="text-2xl font-bold">Applicants for {data.job.title}</h1>
      {data.applicants.length === 0 && <p className="text-slate-500">No applications yet.</p>}
      {data.applicants.map((applicant) => <ApplicantCard key={applicant._id} applicant={applicant} />)}
    </div>
  );
}
