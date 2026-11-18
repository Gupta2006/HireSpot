import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn(), delete: vi.fn(), upload: vi.fn(), download: vi.fn() }));
vi.mock('../../services/api', () => ({
  default: { get: apiMocks.get, put: apiMocks.put, delete: apiMocks.delete },
  uploadWithProgress: apiMocks.upload,
  downloadResume: apiMocks.download,
}));

import CandidateProfile from './Profile';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('candidate profile', () => {
  it('loads and saves controlled profile fields', async () => {
    apiMocks.get.mockResolvedValue({ data: {
      name: 'Candidate One', email: 'candidate@example.com', completion: 20,
      profile: { headline: '', skills: [], experienceYears: 0, expectedCtc: '', education: [], experience: [], resumes: [] },
    } });
    apiMocks.put.mockResolvedValue({ data: { completion: 40 } });
    render(<CandidateProfile />);

    expect(await screen.findByRole('heading', { name: 'My Profile' })).toBeInTheDocument();
    const name = screen.getByLabelText('Name');
    fireEvent.change(name, { target: { value: 'Candidate Updated' } });
    expect(name).toHaveValue('Candidate Updated');
    fireEvent.click(screen.getByRole('button', { name: 'Save Profile' }));

    await waitFor(() => expect(apiMocks.put).toHaveBeenCalledWith('/profile/me', expect.objectContaining({ name: 'Candidate Updated' })));
  });

  it('shows resume upload progress while the upload is running', async () => {
    apiMocks.get.mockResolvedValue({ data: {
      name: 'Candidate One', email: 'candidate@example.com', completion: 20,
      profile: { headline: '', skills: [], experienceYears: 0, expectedCtc: '', education: [], experience: [], resumes: [] },
    } });
    let finishUpload;
    apiMocks.upload.mockImplementation((_path, _body, onProgress) => {
      onProgress(45);
      return new Promise(resolve => { finishUpload = resolve; });
    });
    const { container } = render(<CandidateProfile />);
    await screen.findByRole('heading', { name: 'My Profile' });

    const file = new File(['%PDF-1.4 test'], 'resume.pdf', { type: 'application/pdf' });
    fireEvent.change(container.querySelector('#resume-upload'), { target: { files: [file] } });
    expect(await screen.findByRole('progressbar', { name: 'Resume upload 45%' })).toBeInTheDocument();
    expect(apiMocks.upload).toHaveBeenCalledOnce();
    finishUpload({ data: { resumes: [] } });
    expect(await screen.findByText('Selected: resume.pdf')).toBeInTheDocument();
  });

  it('removes a resume after confirmation and refreshes the list', async () => {
    window.confirm = vi.fn(() => true);
    const resume = { _id: 'resume-1', originalName: 'cv.pdf', uploadedAt: '2026-01-01' };
    apiMocks.get.mockResolvedValue({ data: {
      name: 'Candidate One', email: 'candidate@example.com', completion: 40,
      profile: { headline: 'Engineer', skills: ['React'], experienceYears: 0, expectedCtc: '', education: [], experience: [], resumes: [resume] },
    } });
    apiMocks.delete.mockResolvedValue({ data: { resumes: [], completion: 20 } });
    render(<CandidateProfile />);

    fireEvent.click(await screen.findByRole('button', { name: 'Remove Resume' }));
    await waitFor(() => expect(apiMocks.delete).toHaveBeenCalledWith('/files/resume-1'));
    expect(window.confirm).toHaveBeenCalled();
    expect(await screen.findByText('No resume selected')).toBeInTheDocument();
    expect(screen.queryByText('cv.pdf')).not.toBeInTheDocument();
  });
});
