import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

const auth = vi.hoisted(() => ({ login: vi.fn(), register: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }));

import Login from './Login';
import Register from './Register';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function LocationValue() {
  const location = useLocation();
  return <p data-testid="location-value">{location.pathname}:{location.state?.email || ''}</p>;
}

describe('login and registration forms', () => {
  it('submits controlled login fields and routes by the returned role', async () => {
    auth.login.mockResolvedValue({ role: 'recruiter' });
    render(
      <MemoryRouter initialEntries={['/login']}>
        <LocationValue />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/recruiter" element={<p>Recruiter dashboard</p>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => expect(auth.login).toHaveBeenCalledWith('person@example.com', 'secret123'));
    expect(await screen.findByText('Recruiter dashboard')).toBeInTheDocument();
  });

  it('conditionally asks recruiters for a company and returns to login after registration', async () => {
    auth.register.mockResolvedValue({ id: 'new-user' });
    render(
      <MemoryRouter initialEntries={[{ pathname: '/register', state: { role: 'recruiter' } }]}>
        <LocationValue />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<p>Login with registered email</p>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Company name')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Recruiter One' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'recruiter@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByLabelText('Company name'), { target: { value: 'Example Co' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => expect(auth.register).toHaveBeenCalledWith(expect.objectContaining({
      role: 'recruiter', company: 'Example Co', email: 'recruiter@example.com',
    })));
    expect(await screen.findByText('Login with registered email')).toBeInTheDocument();
    expect(screen.getByTestId('location-value')).toHaveTextContent('/login:recruiter@example.com');
  });
});
