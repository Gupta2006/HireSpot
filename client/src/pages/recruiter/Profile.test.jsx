import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn(), delete: vi.fn(), updateUser: vi.fn() }));
vi.mock('../../services/api', () => ({ default: { get: apiMocks.get, put: apiMocks.put, delete: apiMocks.delete }, uploadWithProgress: vi.fn() }));
vi.mock('../../context/AuthContext', () => ({ useAuth: () => ({ updateUser: apiMocks.updateUser }) }));

import RecruiterProfile from './Profile';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('recruiter profile', () => {
  it('loads and saves company details for the signed-in recruiter', async () => {
    apiMocks.get.mockResolvedValue({ data: { name: 'Recruiter One', email: 'recruiter@example.com', company: 'Example Co', profilePicture: '' } });
    apiMocks.put.mockResolvedValue({ data: { message: 'Company profile saved' } });
    render(<RecruiterProfile />);

    const company = await screen.findByLabelText('Company name');
    fireEvent.change(company, { target: { value: 'Updated Co' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));

    await waitFor(() => expect(apiMocks.put).toHaveBeenCalledWith('/profile/recruiter/me', { name: 'Recruiter One', company: 'Updated Co' }));
    expect(apiMocks.updateUser).toHaveBeenCalledWith({ name: 'Recruiter One', company: 'Updated Co' });
  });

  it('removes the recruiter picture without changing company fields', async () => {
    window.confirm = vi.fn(() => true);
    apiMocks.get.mockResolvedValue({ data: { name: 'Recruiter One', email: 'recruiter@example.com', company: 'Example Co', profilePicture: 'https://res.cloudinary.com/demo/image/upload/profile.png' } });
    apiMocks.delete.mockResolvedValue({ data: { message: 'Profile picture removed' } });
    render(<RecruiterProfile />);

    fireEvent.click(await screen.findByRole('button', { name: 'Remove Photo' }));
    await waitFor(() => expect(apiMocks.delete).toHaveBeenCalledWith('/uploads/profile-picture'));
    expect(screen.getByLabelText('Company name')).toHaveValue('Example Co');
    expect(await screen.findByRole('img', { name: 'Default avatar' })).toBeInTheDocument();
  });
});
