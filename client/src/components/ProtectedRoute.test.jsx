import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const { mockUser } = vi.hoisted(() => ({ mockUser: { current: null } }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: mockUser.current }) }));

import ProtectedRoute from './ProtectedRoute';

afterEach(() => {
  cleanup();
  mockUser.current = null;
});

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/candidate']}>
      <Routes>
        <Route path="/candidate" element={<ProtectedRoute role="candidate"><p>Candidate area</p></ProtectedRoute>} />
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('shows the requested role area to a matching user', () => {
    mockUser.current = { role: 'candidate' };
    renderRoute();
    expect(screen.getByText('Candidate area')).toBeInTheDocument();
  });

  it('redirects anonymous users to login', () => {
    renderRoute();
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('denies a user with the wrong role', () => {
    mockUser.current = { role: 'recruiter' };
    renderRoute();
    expect(screen.getByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
  });
});
