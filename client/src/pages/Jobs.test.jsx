import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));
vi.mock('../services/api', () => ({ default: { get: mockGet } }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: null }) }));

import Jobs from './Jobs';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('Jobs search', () => {
  it('loads query parameters, submits filters, and renders returned jobs', async () => {
    mockGet.mockResolvedValue({ data: { jobs: [], total: 0, pages: 0 } });
    render(
      <MemoryRouter initialEntries={['/jobs?role=Engineer']}>
        <Routes><Route path="/jobs" element={<Jobs />} /></Routes>
      </MemoryRouter>
    );

    const role = screen.getByLabelText('Role');
    expect(role).toHaveValue('Engineer');
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith('/jobs', expect.objectContaining({ params: expect.objectContaining({ role: 'Engineer' }) })));

    fireEvent.change(screen.getByLabelText('Location'), { target: { name: 'location', value: 'Pune' } });
    mockGet.mockResolvedValueOnce({ data: { jobs: [{
      _id: 'job-1', title: 'Frontend Engineer', company: 'HireSpot', location: 'Pune', workMode: 'hybrid',
      minExp: 1, ctcRange: { min: 500000, max: 1000000 }, deadline: '2099-12-31', skills: ['React'],
    }], total: 1, pages: 1 } });
    fireEvent.click(screen.getByRole('button', { name: /search jobs/i }));

    await waitFor(() => expect(mockGet).toHaveBeenLastCalledWith('/jobs', expect.objectContaining({
      params: expect.objectContaining({ role: 'Engineer', location: 'Pune', page: 1 }),
    })));
    expect(await screen.findByText('Frontend Engineer')).toBeInTheDocument();
  });
});
