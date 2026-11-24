import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useState } from 'react';
import ApplicationModal from './ApplicationModal';

afterEach(cleanup);

function ModalHarness({ resumes }) {
  const [form, setForm] = useState({ resumeId: resumes[0]?._id || '', coverNote: '' });
  return <ApplicationModal resumes={resumes} form={form} setForm={setForm} applying={false} onSubmit={() => false} onClose={() => {}} />;
}

describe('ApplicationModal', () => {
  it('explains how to add a resume when the candidate has none', () => {
    render(<MemoryRouter><ModalHarness resumes={[]} /></MemoryRouter>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/You have no resume yet/i)).toBeInTheDocument();
  });

  it('keeps the selected resume and cover note controlled', () => {
    render(<MemoryRouter><ModalHarness resumes={[
      { _id: 'resume-1', originalName: 'first.pdf' },
      { _id: 'resume-2', originalName: 'second.pdf' },
    ]} /></MemoryRouter>);

    const resume = screen.getByLabelText('Resume');
    fireEvent.change(resume, { target: { value: 'resume-2' } });
    expect(resume).toHaveValue('resume-2');
    const note = screen.getByLabelText('Cover note');
    fireEvent.change(note, { target: { value: 'Interested in the role.' } });
    expect(note).toHaveValue('Interested in the role.');
  });
});
