import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

export default function ApplicationModal({ resumes, form, setForm, applying, onSubmit, onClose }) {
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const closeTimer = useRef(null);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    closeTimer.current = window.setTimeout(onClose, 180);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
      }
    };
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.clearTimeout(closeTimer.current);
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [requestClose]);

  const trapTab = (event) => {
    if (event.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll('button:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]');
    if (!focusable?.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (await onSubmit(event)) requestClose();
  };

  return createPortal(
    <div
      className={`application-modal-overlay fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px] sm:p-6 ${closing ? 'application-modal-overlay-exit' : 'application-modal-overlay-enter'}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-modal-title"
        onKeyDown={trapTab}
        className={`card relative max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto p-5 shadow-xl sm:p-7 ${closing ? 'application-modal-dialog-exit' : 'application-modal-dialog-enter'}`}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={requestClose}
          aria-label="Close application dialog"
          className="absolute right-4 top-4 rounded-md p-2 text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          ×
        </button>

        <form onSubmit={submit} className="space-y-4 pr-7 sm:pr-8">
          <h2 id="application-modal-title" className="text-xl font-bold text-indigo-800">Apply for this job</h2>
          {resumes.length === 0 ? (
            <p className="text-sm text-slate-600">
              You have no resume yet. <Link to="/candidate/profile" className="font-medium text-indigo-600">Upload one in your profile</Link> first.
            </p>
          ) : (
            <>
              <div>
                <label htmlFor="application-resume" className="label">Resume</label>
                <select
                  id="application-resume"
                  required
                  value={form.resumeId}
                  onChange={(event) => setForm((current) => ({ ...current, resumeId: event.target.value }))}
                  className="input"
                >
                  {resumes.map((resume) => <option key={resume._id} value={resume._id}>{resume.originalName}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="application-cover-note" className="label">Cover note</label>
                <textarea
                  id="application-cover-note"
                  rows={4}
                  maxLength={1000}
                  value={form.coverNote}
                  onChange={(event) => setForm((current) => ({ ...current, coverNote: event.target.value }))}
                  className="input"
                />
              </div>
              <button disabled={applying} className="btn-primary disabled:opacity-60">
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>,
    document.body
  );
}
