import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { capitalize, formatCtc, formatDate, formatExp } from '../services/format';
import { notify } from '../services/notifications';
import ApplicationModal from '../components/ApplicationModal';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const isCandidate = user?.role === 'candidate';

  const [job, setJob] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [form, setForm] = useState({ resumeId: '', coverNote: '' });

  const closeApplicationModal = useCallback(() => setShowApplicationModal(false), []);

  useEffect(() => {
    api.get(`/jobs/${id}`).then((res) => setJob(res.data)).catch(() => setNotFound(true));
  }, [id]);

  // Candidate-only data: have they applied / saved this job, and which resumes do they have?
  useEffect(() => {
    if (!isCandidate) return;
    Promise.all([api.get('/applications/me'), api.get('/profile/saved'), api.get('/profile/me')]).then(
      ([applications, saved, profile]) => {
        setHasApplied(applications.data.some((a) => a.jobId?._id === id));
        setIsSaved(saved.data.some((j) => j._id === id));
        setResumes(profile.data.profile.resumes);
        setForm((f) => ({ ...f, resumeId: profile.data.profile.resumes.at(-1)?._id || '' }));
      }
    ).catch(() => {});
  }, [isCandidate, id]);

  const toggleSave = async () => {
    try {
      if (isSaved) await api.delete(`/profile/saved/${id}`);
      else await api.post(`/profile/saved/${id}`);
      setIsSaved(!isSaved);
      notify(isSaved ? 'Job removed from saved jobs.' : 'Job saved successfully.', 'success');
    } catch { /* The shared Fetch wrapper displays a clear alert for failed requests. */ }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (hasApplied || applying) return;
    if (!form.resumeId) {
      notify('Please select a resume before applying.', 'warning');
      return;
    }
    setApplying(true);
    try {
      await api.post('/applications', { jobId: id, ...form });
      notify('Application submitted successfully.', 'success');
      setHasApplied(true);
      return true;
    } catch { /* The shared Fetch wrapper displays a clear alert for failed requests. */ }
    finally { setApplying(false); }
    return false;
  };

  if (notFound) return <p className="py-24 text-center text-slate-600">Job not found</p>;
  if (!job) return <p className="py-24 text-center text-slate-500">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="card">
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <p className="mt-1 text-slate-600">{job.company}</p>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Location</dt><dd className="font-medium">{job.location}</dd></div>
          <div><dt className="text-slate-500">Work mode</dt><dd className="font-medium">{capitalize(job.workMode)}</dd></div>
          <div><dt className="text-slate-500">Experience</dt><dd className="font-medium">{formatExp(job.minExp)}</dd></div>
          <div><dt className="text-slate-500">CTC</dt><dd className="font-medium">{formatCtc(job.ctcRange)}</dd></div>
          <div><dt className="text-slate-500">Apply before</dt><dd className="font-medium">{formatDate(job.deadline)}</dd></div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <span key={skill} className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">{skill}</span>
          ))}
        </div>

        <h2 className="mt-6 font-semibold">Description</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{job.description}</p>

        <div className="mt-6 flex gap-3">
          {isCandidate && (hasApplied ? (
            <button className="btn-outline" disabled>Already Applied</button>
          ) : (
          <button
            type="button"
            className="btn-primary"
            aria-haspopup="dialog"
            aria-expanded={showApplicationModal}
            onClick={() => setShowApplicationModal(true)}
          >
            Apply Now
          </button>
          ))}
          {isCandidate && <button className="btn-outline" onClick={toggleSave}>{isSaved ? 'Remove from Saved' : 'Save Job'}</button>}
          {!user && <Link to="/login" className="btn-primary">Login to apply</Link>}
        </div>
      </div>

      {showApplicationModal && (
        <ApplicationModal
          resumes={resumes}
          form={form}
          setForm={setForm}
          applying={applying}
          onSubmit={handleApply}
          onClose={closeApplicationModal}
        />
      )}
    </div>
  );
}
