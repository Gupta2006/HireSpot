import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/DashboardCard';
import { formatDate } from '../../services/format';
import StatusBadge from '../../components/StatusBadge';
import useApplications from '../../hooks/useApplications';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const { applications, isLoading: applicationsLoading, hasError: applicationsError } = useApplications();
  const [savedCount, setSavedCount] = useState(0);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    Promise.all([api.get('/profile/saved'), api.get('/profile/me')]).then(
      ([saved, profile]) => {
        setSavedCount(saved.data.length);
        setCompletion(profile.data.completion);
      }
    ).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard label="Applications" value={applications.length} />
        <DashboardCard label="Saved Jobs" value={savedCount} />
        <DashboardCard label="Interviews" value={applications.filter((a) => a.stage === 'interview').length} />
        <DashboardCard label="Profile Completion" value={`${completion}%`} />
      </div>

      {completion < 100 && (
        <p className="text-sm text-slate-600">
          Your profile is {completion}% complete. <Link to="/candidate/profile" className="font-medium text-indigo-600">Complete it now</Link>
        </p>
      )}

      <div className="card">
        <h2 className="font-semibold">Recent applications</h2>
        {applicationsLoading && <p role="status" className="mt-3 text-sm text-slate-500">Loading applications...</p>}
        {applicationsError && <p role="alert" className="mt-3 text-sm text-red-700">Unable to load applications. Please refresh the page and try again.</p>}
        {!applicationsLoading && !applicationsError && applications.length === 0 && <p className="mt-3 text-sm text-slate-500">You haven't applied to any job yet.</p>}
        <ul className="mt-3 divide-y divide-slate-100">
          {applications.slice(0, 5).map((a) => (
            <li key={a._id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium">{a.jobId.title}</p>
                <p className="text-slate-500">{a.jobId.company} · {formatDate(a.createdAt)}</p>
              </div>
              <StatusBadge status={a.stage} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
