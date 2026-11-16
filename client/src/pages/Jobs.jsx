import { useEffect, useReducer, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import JobCard from '../components/JobCard';
import JobFilters from '../components/JobFilters';
import { useAuth } from '../context/AuthContext';
import { notify } from '../services/notifications';
import Icon from '../components/Icon';

const EMPTY_SAVED_JOB_IDS = new Set();

const buildInitialFilters = (params) => ({
  role: params.get('role') || '',
  location: params.get('location') || '',
  skills: '',
  minExp: '',
  ctc: '',
  workMode: '',
});

function filterReducer(state, action) {
  switch (action.type) {
    case 'update':
      return { ...state, [action.field]: action.value };
    case 'reset':
      return buildInitialFilters(action.params);
    default:
      return state;
  }
}

export default function Jobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams(); // lets the Home page search pre-fill role/location
  const [filters, dispatchFilters] = useReducer(filterReducer, params, buildInitialFilters);
  const [appliedFilters, setAppliedFilters] = useState(filters); // only changes when Search is clicked
  const [page, setPage] = useState(1);
  const [searchRevision, setSearchRevision] = useState(0);
  const [result, setResult] = useState({ jobs: [], total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState({ userId: null, ids: EMPTY_SAVED_JOB_IDS });
  const userId = user?._id ?? user?.id ?? null;
  const savedJobIds = user?.role === 'candidate' && savedJobs.userId === userId
    ? savedJobs.ids
    : EMPTY_SAVED_JOB_IDS;

  useEffect(() => {
    let active = true;
    api
      .get('/jobs', { params: { ...appliedFilters, page } })
      .then((res) => { if (active) setResult(res.data); })
      .catch(() => {})
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [appliedFilters, page, searchRevision]);

  useEffect(() => {
    if (user?.role !== 'candidate') return;

    let active = true;
    api.get('/profile/saved')
      .then((res) => {
        if (active) setSavedJobs({ userId, ids: new Set(res.data.map((job) => job._id)) });
      })
      .catch(() => {});
    return () => { active = false; };
  }, [user?.role, userId]);

  const handleFilterChange = (event) => {
    dispatchFilters({ type: 'update', field: event.target.name, value: event.target.value });
  };

  const handleSearch = () => {
    setIsLoading(true);
    setPage(1);
    setAppliedFilters(filters);
    setSearchRevision((revision) => revision + 1);
  };

  const toggleSavedJob = async (jobId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'candidate') {
      notify('Only candidates can save jobs.', 'warning');
      return;
    }

    const isSaved = savedJobIds.has(jobId);
    try {
      if (isSaved) await api.delete(`/profile/saved/${jobId}`);
      else await api.post(`/profile/saved/${jobId}`);

      setSavedJobs((current) => {
        const next = new Set(current.userId === userId ? current.ids : []);
        if (isSaved) next.delete(jobId);
        else next.add(jobId);
        return { userId, ids: next };
      });
      notify(isSaved ? 'Job removed from saved jobs.' : 'Job saved successfully.', 'success');
    } catch { /* The shared request handler displays errors. */ }
  };

  return (
    <div className="min-h-full bg-[#F7F5F0] py-10 sm:py-12">
      <div className="mx-auto max-w-7xl min-w-0 space-y-8 px-4 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2F6F73]">Explore career opportunities</p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#102638] sm:text-4xl">
            Find Your Next Opportunity
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Discover jobs that match your skills, experience and career goals.
          </p>
        </header>

        <JobFilters filters={filters} setFilters={handleFilterChange} onSearch={handleSearch} isLoading={isLoading} />

        <section className="space-y-5" aria-labelledby="available-opportunities-heading">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <h2 id="available-opportunities-heading" className="text-xl font-bold tracking-tight text-[#102638] sm:text-2xl">
                Available Opportunities
              </h2>
              <p className="text-sm text-slate-600">Explore positions matching your preferences.</p>
            </div>
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-[#17324D] ring-1 ring-slate-200">
              <Icon name="briefcase" className="h-4 w-4 text-[#2F6F73]" />
              {result.total} {result.total === 1 ? 'job' : 'jobs'} found
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center text-sm font-medium text-slate-600" role="status">
              Loading opportunities…
            </div>
          ) : result.jobs.length > 0 ? (
            <div className="grid min-w-0 grid-cols-1 items-stretch gap-5 md:grid-cols-2">
              {result.jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  className="jobs-result-card h-full border-slate-200 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                  isSaved={savedJobIds.has(job._id)}
                  onToggleSave={toggleSavedJob}
                  showCtaArrow
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center sm:py-12">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF3F1] text-[#2F6F73]">
                <Icon name="briefcase" className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-[#17324D]">No matching opportunities yet</h3>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600">
                Try adjusting your search filters to see more available roles.
              </p>
            </div>
          )}

          {result.pages > 1 && (
            <nav className="flex flex-wrap items-center justify-center gap-3 pt-2" aria-label="Job results pages">
              <button className="btn-outline" disabled={isLoading || page === 1} onClick={() => { setIsLoading(true); setPage(page - 1); }}>
                Previous
              </button>
              <span className="text-sm font-medium text-slate-600">
                Page {page} of {result.pages}
              </span>
              <button className="btn-outline" disabled={isLoading || page === result.pages} onClick={() => { setIsLoading(true); setPage(page + 1); }}>
                Next
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
