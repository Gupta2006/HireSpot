import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { notify } from '../../services/notifications';
import JobCard from '../../components/JobCard';

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    api.get('/profile/saved').then((res) => setJobs(res.data)).catch(() => {});
  }, []);

  const remove = async (id) => {
    try {
      await api.delete(`/profile/saved/${id}`);
      setJobs(jobs.filter((job) => job._id !== id));
      notify('Removed from saved jobs.', 'success');
    } catch { /* The Fetch wrapper already displayed the request error. */ }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Saved Jobs</h1>
      {jobs.length === 0 && <p className="text-slate-500">Nothing saved yet. <Link to="/jobs" className="font-medium text-indigo-600">Browse jobs</Link></p>}
      <div className="grid gap-5 md:grid-cols-2">
        {jobs.map((job) => (
          <JobCard key={job._id} job={job}>
            <button className="btn-danger" onClick={() => remove(job._id)}>Remove</button>
          </JobCard>
        ))}
      </div>
    </div>
  );
}
