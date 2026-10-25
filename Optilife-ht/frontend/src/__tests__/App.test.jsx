import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ThemeProvider } from '../context/ThemeContext.jsx';

function renderAt(path) {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

describe('App routing', () => {
  afterEach(cleanup);

  it('shows the login form at /login for a logged-out user', () => {
    renderAt('/login');
    expect(screen.getByRole('heading', { name: 'Habit Tracker' })).toBeTruthy();
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeTruthy();
  });

  it('sends a logged-out user from a protected page to login', () => {
    renderAt('/routines');
    expect(screen.getByRole('button', { name: 'Log in' })).toBeTruthy();
  });
});
