import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

function TestComponent() {
  const { isLoggedIn, user, roles, login, logout } = useAuth();
  return (
    <div>
      <div>Logged in: {isLoggedIn ? 'yes' : 'no'}</div>
      <div>User: {user ? user.username : 'none'}</div>
      <div>Roles: {roles.join(', ')}</div>
      <button onClick={() => login({ username: 'test', roles: ['admin'] })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  it('provides login and logout functionality', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    // Initially logged out
    expect(screen.getByText(/Logged in: no/)).toBeInTheDocument();
    expect(screen.getByText(/User: none/)).toBeInTheDocument();
    // Login
    act(() => {
      screen.getByText('Login').click();
    });
    expect(screen.getByText(/Logged in: yes/)).toBeInTheDocument();
    expect(screen.getByText(/User: test/)).toBeInTheDocument();
    expect(screen.getByText(/Roles: admin/)).toBeInTheDocument();
    // Logout
    act(() => {
      screen.getByText('Logout').click();
    });
    expect(screen.getByText(/Logged in: no/)).toBeInTheDocument();
    expect(screen.getByText(/User: none/)).toBeInTheDocument();
    expect(screen.getByText(/Roles:/)).toBeInTheDocument();
  });
});
