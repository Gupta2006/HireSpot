import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({ post: vi.fn(), cancel: vi.fn() }));
vi.mock('../services/api', () => ({
  default: { post: apiMocks.post },
  cancelAuthenticatedRequests: apiMocks.cancel,
}));

import { AuthProvider, useAuth } from './AuthContext';

function AuthStatus() {
  const { user, login, logout, updateUser } = useAuth();
  return (
    <div>
      <p>{user ? `${user.name}:${user.role}` : 'Signed out'}</p>
      <button onClick={() => login('person@example.com', 'secret123')}>Sign in</button>
      <button onClick={() => updateUser({ name: 'Updated Name' })}>Update user</button>
      <button onClick={logout}>Sign out</button>
    </div>
  );
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

describe('AuthContext', () => {
  it('stores a login token and user, updates the user, then clears the session on logout', async () => {
    apiMocks.post.mockResolvedValue({ data: {
      token: 'test-jwt', user: { id: 'user-1', name: 'Recruiter', role: 'recruiter', profilePicture: 'https://example.test/recruiter.png' },
    } });
    render(<AuthProvider><AuthStatus /></AuthProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Recruiter:recruiter')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBe('test-jwt');
    expect(JSON.parse(localStorage.getItem('user')).id).toBe('user-1');
    expect(JSON.parse(localStorage.getItem('user')).profilePicture).toBe('https://example.test/recruiter.png');

    fireEvent.click(screen.getByRole('button', { name: 'Update user' }));
    await waitFor(() => expect(screen.getByText('Updated Name:recruiter')).toBeInTheDocument());
    expect(JSON.parse(localStorage.getItem('user')).name).toBe('Updated Name');

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(screen.getByText('Signed out')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
    expect(apiMocks.cancel).toHaveBeenCalledOnce();
  });
});
