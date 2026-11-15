import Icon from './Icon';

// Controlled filter form: the parent owns the filter values
export default function JobFilters({ filters, setFilters, onSearch, isLoading = false }) {
  const update = (event) => setFilters(event);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
      className="grid w-full min-w-0 grid-cols-1 gap-x-5 gap-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-6 lg:p-7"
    >
      <div className="min-w-0">
        <label htmlFor="job-role" className="label flex items-center gap-2"><Icon name="briefcase" className="h-4 w-4 text-[#2F6F73]" />Role</label>
        <input id="job-role" name="role" value={filters.role} onChange={update} placeholder="e.g. Developer" className="input h-11 min-w-0 rounded-lg border-slate-300 px-3.5 transition focus:border-[#2F6F73] focus:ring-[#2F6F73]/15" />
      </div>
      <div className="min-w-0">
        <label htmlFor="job-location" className="label flex items-center gap-2"><Icon name="location" className="h-4 w-4 text-[#2F6F73]" />Location</label>
        <input id="job-location" name="location" value={filters.location} onChange={update} placeholder="e.g. Chandigarh" className="input h-11 min-w-0 rounded-lg border-slate-300 px-3.5 transition focus:border-[#2F6F73] focus:ring-[#2F6F73]/15" />
      </div>
      <div className="min-w-0">
        <label htmlFor="job-skills" className="label flex items-center gap-2"><Icon name="document" className="h-4 w-4 text-[#2F6F73]" />Skills (comma separated)</label>
        <input id="job-skills" name="skills" value={filters.skills} onChange={update} placeholder="React, Node.js" className="input h-11 min-w-0 rounded-lg border-slate-300 px-3.5 transition focus:border-[#2F6F73] focus:ring-[#2F6F73]/15" />
      </div>
      <div className="min-w-0">
        <label htmlFor="job-experience" className="label flex items-center gap-2"><Icon name="profile" className="h-4 w-4 text-[#2F6F73]" />My experience</label>
        <select id="job-experience" name="minExp" value={filters.minExp} onChange={update} className="input h-11 min-w-0 rounded-lg border-slate-300 px-3.5 transition focus:border-[#2F6F73] focus:ring-[#2F6F73]/15">
          <option value="">Any</option>
          <option value="0">Fresher</option>
          <option value="1">1 year</option>
          <option value="2">2 years</option>
          <option value="3">3 years</option>
          <option value="5">5+ years</option>
        </select>
      </div>
      <div className="min-w-0">
        <label htmlFor="job-ctc" className="label flex items-center gap-2"><Icon name="chart" className="h-4 w-4 text-[#2F6F73]" />Minimum CTC</label>
        <select id="job-ctc" name="ctc" value={filters.ctc} onChange={update} className="input h-11 min-w-0 rounded-lg border-slate-300 px-3.5 transition focus:border-[#2F6F73] focus:ring-[#2F6F73]/15">
          <option value="">Any</option>
          <option value="3">₹3 LPA+</option>
          <option value="5">₹5 LPA+</option>
          <option value="8">₹8 LPA+</option>
          <option value="12">₹12 LPA+</option>
        </select>
      </div>
      <div className="min-w-0">
        <label htmlFor="job-work-mode" className="label flex items-center gap-2"><Icon name="building" className="h-4 w-4 text-[#2F6F73]" />Work mode</label>
        <select id="job-work-mode" name="workMode" value={filters.workMode} onChange={update} className="input h-11 min-w-0 rounded-lg border-slate-300 px-3.5 transition focus:border-[#2F6F73] focus:ring-[#2F6F73]/15">
          <option value="">Any</option>
          <option value="onsite">Onsite</option>
          <option value="hybrid">Hybrid</option>
          <option value="remote">Remote</option>
        </select>
      </div>
      <div className="flex justify-end border-t border-slate-100 pt-4 sm:col-span-2 lg:col-span-3">
        <button disabled={isLoading} className="btn-primary min-h-11 w-full gap-2 rounded-lg px-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-auto"><Icon name="search" className="h-4 w-4" />{isLoading ? 'Searching…' : 'Search Jobs'} <span aria-hidden="true" className="ml-1 text-[#D6A85F]">→</span></button>
      </div>
    </form>
  );
}
