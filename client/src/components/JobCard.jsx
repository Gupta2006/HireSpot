import { Link } from 'react-router-dom';
import { capitalize, formatCtc, formatDate, formatExp } from '../services/format';
import Icon from './Icon';

// children = optional extra buttons (e.g. Remove on the Saved Jobs page)
export default function JobCard({ job, children, className = '', isSaved, onToggleSave, showCtaArrow = false }) {
  return (
    <div className={`card flex h-full flex-col ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-xl font-bold leading-snug tracking-tight text-[#102638]">{job.title}</h3>
        {onToggleSave && (
          <button
            type="button"
            onClick={() => onToggleSave(job._id)}
            aria-label={isSaved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
            aria-pressed={Boolean(isSaved)}
            className={`job-bookmark shrink-0 rounded-full bg-amber-50 p-2 text-[#D6A85F] transition-colors hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6F73] ${isSaved ? 'text-amber-600' : ''}`}
          >
          <Icon name="bookmark" className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
      <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700"><Icon name="building" className="h-4 w-4 shrink-0 text-[#2F6F73]" />{job.company}</p>
      <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-slate-600">
        <Icon name="location" className="h-4 w-4 shrink-0 text-[#2F6F73]" />
        {job.location} • {capitalize(job.workMode)}
      </p>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p className="flex items-center gap-2"><Icon name="briefcase" className="h-4 w-4 shrink-0 text-[#2F6F73]" />Experience: {formatExp(job.minExp)}</p>
        <p className="flex items-center gap-2"><Icon name="document" className="h-4 w-4 shrink-0 text-[#2F6F73]" />CTC: {formatCtc(job.ctcRange)}</p>
        {job.deadline && <p className="flex items-center gap-2"><Icon name="calendar" className="h-4 w-4 shrink-0 text-[#2F6F73]" />Apply by: {formatDate(job.deadline)}</p>}
      </div>

      {job.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <span key={skill} className="job-skill rounded-md bg-[#EAF3F1] px-2.5 py-1.5 text-xs font-semibold text-[#2F6F73]">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className={`mt-auto flex flex-wrap gap-2 pt-5 ${showCtaArrow ? 'jobs-card-actions' : ''}`}>
        <Link to={`/jobs/${job._id}`} className={`btn-primary rounded-lg ${showCtaArrow ? 'jobs-view-button' : ''}`}>
          View Job
          {showCtaArrow && <span aria-hidden="true" className="text-[#D6A85F]">→</span>}
        </Link>
        {onToggleSave && !showCtaArrow && (
          <button
            type="button"
            onClick={() => onToggleSave(job._id)}
            aria-label={isSaved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
            aria-pressed={Boolean(isSaved)}
            className="btn-outline"
          >
            <Icon name="bookmark" className="h-4 w-4" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
