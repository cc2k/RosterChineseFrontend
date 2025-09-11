import React from 'react';
import { render, screen } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';
import { MemoryRouter } from 'react-router';
import AdminRoute from '../components/AdminRoute';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../components/ToastContext';

global.TextEncoder = TextEncoder
// @ts-expect-error
global.TextDecoder = TextDecoder

function renderWithProviders(ui, { isLoggedIn = true, roles = ['admin'] } = {}) {
    // Mock AuthContext value
      const mockUser = { username: 'test', roles };
  localStorage.setItem('isLoggedIn', isLoggedIn ? 'true' : 'false');
  localStorage.setItem('user', JSON.stringify(mockUser));
  localStorage.setItem('roles', JSON.stringify(roles));
  return render(
    <ToastProvider>
      <AuthProvider>
        <MemoryRouter>
          {ui}
        </MemoryRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

describe('AdminRoute', () => {
  it('renders children for admin users', () => {
    renderWithProviders(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>,
      { isLoggedIn: true, roles: ['admin'] }
    );
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('shows access denied for non-admin users', () => {
    renderWithProviders(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>,
      { isLoggedIn: true, roles: ['user'] }
    );
  expect(screen.getByText('Access denied. Admins only.')).toBeInTheDocument();
  });
});
