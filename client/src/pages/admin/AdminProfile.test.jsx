import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  uploadWithProgress: vi.fn(),
  updateUser: vi.fn(),
}));
vi.mock('../../services/api', () => ({
  default: { get: mocks.get, put: mocks.put, delete: mocks.delete },
  uploadWithProgress: mocks.uploadWithProgress,
}));
vi.mock('../../context/AuthContext', () => ({ useAuth: () => ({ updateUser: mocks.updateUser }) }));

import { AdminProfile } from './AdminPages';

const savedProfile = {
  id: 'admin-1',
  name: 'HireSpot Admin',
  email: 'admin@example.test',
  role: 'admin',
  profilePicture: 'https://cloudinary.test/admin.png',
};

function choosePhoto() {
  const file = new File(['image-bytes'], 'new-admin.png', { type: 'image/png' });
  fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } });
  return file;
}

beforeEach(() => {
  mocks.get.mockResolvedValue({ data: savedProfile });
  mocks.put.mockResolvedValue({ data: savedProfile });
  mocks.delete.mockResolvedValue({ data: { message: 'Profile picture removed' } });
  mocks.uploadWithProgress.mockResolvedValue({ data: { profilePicture: 'https://cloudinary.test/new-admin.png' } });
  vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:admin-preview'), revokeObjectURL: vi.fn() });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('AdminProfile', () => {
  it('loads the persisted admin identity and keeps email and role read-only', async () => {
    render(<AdminProfile />);

    expect(await screen.findByText('HireSpot Admin')).toBeInTheDocument();
    expect(screen.getByDisplayValue('admin@example.test')).toHaveAttribute('readonly');
    expect(screen.getAllByText('Administrator')).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'Admin profile preview' })).toHaveAttribute('src', savedProfile.profilePicture);
  });

  it('saves the edited name and synchronizes the authenticated header identity', async () => {
    mocks.put.mockResolvedValue({ data: { ...savedProfile, name: 'Updated Admin' } });
    render(<AdminProfile />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit Profile' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Admin name' }), { target: { value: 'Updated Admin' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(mocks.put).toHaveBeenCalledWith('/admin/profile/me', { name: 'Updated Admin' }));
    expect(mocks.updateUser).toHaveBeenCalledWith({ name: 'Updated Admin', profilePicture: savedProfile.profilePicture });
    expect(await screen.findByText('Updated Admin')).toBeInTheDocument();
  });

  it('previews a replacement picture and uploads it to the existing Cloudinary endpoint on save', async () => {
    render(<AdminProfile />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit Profile' }));
    const file = choosePhoto();
    expect(screen.getByRole('img', { name: 'Admin profile preview' })).toHaveAttribute('src', 'blob:admin-preview');
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(mocks.uploadWithProgress).toHaveBeenCalledOnce());
    expect(mocks.uploadWithProgress.mock.calls[0][0]).toBe('/uploads/profile-picture');
    expect(mocks.uploadWithProgress.mock.calls[0][1].get('profilePicture')).toBe(file);
    expect(mocks.delete).not.toHaveBeenCalled();
    await waitFor(() => expect(mocks.updateUser).toHaveBeenCalledWith({ name: savedProfile.name, profilePicture: 'https://cloudinary.test/new-admin.png' }));
  });

  it('removes the saved picture on save and updates the header fallback identity', async () => {
    mocks.put.mockResolvedValue({ data: { ...savedProfile, profilePicture: '' } });
    render(<AdminProfile />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit Profile' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove photo' }));
    expect(screen.queryByRole('img', { name: 'Admin profile preview' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(mocks.delete).toHaveBeenCalledWith('/uploads/profile-picture'));
    expect(mocks.uploadWithProgress).not.toHaveBeenCalled();
    await waitFor(() => expect(mocks.updateUser).toHaveBeenCalledWith({ name: savedProfile.name, profilePicture: '' }));
  });
});
