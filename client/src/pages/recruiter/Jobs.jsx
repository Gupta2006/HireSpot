import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../services/format';
import { notify } from '../../services/notifications';

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);

  const load = () => api.get('/jobs/mine').then((res) => setJobs(res.data)).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const closeJob = async (id) => {
    try {
      await api.patch(`/jobs/${id}/close`);
      notify('Job closed successfully.', 'success');
      load();
    } catch { /* The shared Fetch wrapper displays a clear alert for failed requests. */ }
  };

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try { await api.delete(`/jobs/${id}`); notify('Job deleted successfully.', 'success'); load(); }
    catch { /* The shared Fetch wrapper displays a clear alert for failed requests. */ }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Jobs</h1>
        <Link to="/recruiter/jobs/create" className="btn-primary">Post a Job</Link>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr><th className="p-4">Job title</th><th className="p-4">Status</th><th className="p-4">Created</th><th className="p-4">Applicants</th><th className="p-4">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <tr key={job._id}>
                <td className="p-4 font-medium">{job.title}</td>
                <td className="p-4"><StatusBadge status={job.status} /></td>
                <td className="p-4">{formatDate(job.createdAt)}</td>
                <td className="p-4"><Link to={`/recruiter/jobs/${job._id}/applicants`} className="font-medium text-indigo-600">View Applicants ({job.applicants})</Link></td>
                <td className="flex gap-2 p-4">
                  <Link to={`/recruiter/jobs/${job._id}/edit`} className="btn-outline">Edit</Link>
                  {job.status !== 'closed' && <button className="btn-danger" onClick={() => closeJob(job._id)}>Close</button>}
                  <button className="btn-danger" onClick={() => deleteJob(job._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {jobs.length === 0 && <p className="p-4 text-slate-500">You haven't posted any job yet.</p>}
      </div>
    </div>
  );
}
