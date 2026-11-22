import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/DashboardCard';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeJobs: 0, applications: 0, shortlisted: 0, interviews: 0 });

  useEffect(() => {
    api.get('/jobs/mine/stats').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <div className="flex gap-2">
          <Link to="/recruiter/profile" className="btn-outline">Company profile</Link>
          <Link to="/recruiter/jobs/create" className="btn-primary">Post a Job</Link>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard label="Active Jobs" value={stats.activeJobs} />
        <DashboardCard label="Applications" value={stats.applications} />
        <DashboardCard label="Shortlisted" value={stats.shortlisted} />
        <DashboardCard label="Interviews" value={stats.interviews} />
      </div>
    </div>
  );
}
