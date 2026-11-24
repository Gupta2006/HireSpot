import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../services/format';
import useApplications from '../../hooks/useApplications';

export default function Applications() {
  const { applications, isLoading, hasError } = useApplications();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Applications</h1>
      {isLoading ? <p role="status" className="text-slate-500">Loading applications...</p> : hasError ? (
        <p role="alert" className="text-red-700">Unable to load applications. Please refresh the page and try again.</p>
      ) : applications.length === 0 ? (
        <p className="text-slate-500">No applications yet. <Link to="/jobs" className="font-medium text-indigo-600">Browse jobs</Link></p>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr><th className="p-4">Job</th><th className="p-4">Company</th><th className="p-4">Applied on</th><th className="p-4">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((a) => (
                <tr key={a._id}>
                  <td className="p-4 font-medium"><Link to={`/jobs/${a.jobId._id}`} className="hover:text-indigo-600">{a.jobId.title}</Link></td>
                  <td className="p-4">{a.jobId.company}</td>
                  <td className="p-4">{formatDate(a.createdAt)}</td>
                  <td className="p-4"><StatusBadge status={a.stage} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
