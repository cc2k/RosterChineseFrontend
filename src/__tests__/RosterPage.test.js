
import { render, screen, waitFor } from '@testing-library/react';
import RosterPage from '../pages/RosterPage';
import { AuthProvider } from '../context/AuthContext';
import { UserSettingsProvider } from '../context/UserSettingsContext';
import { ToastProvider } from '../components/ToastContext';
import { MemoryRouter } from 'react-router';

// Ensure API_URL is defined for fetch mocks
process.env.REACT_APP_API_URL = '';

describe('RosterPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url && url.includes('/api/users')) {
        return Promise.resolve({ json: () => Promise.resolve([{ user_id: 1, username: 'test', datesWorking: [], datesFree: [] }]) });
      }
      if (url && url.includes('/api/shift_assignments')) {
        return Promise.resolve({ json: () => Promise.resolve([]) });
      }
      if (url && url.includes('/api/user_unavailability')) {
        return Promise.resolve({ json: () => Promise.resolve([]) });
      }
      if (url && url.includes('/api/roles')) {
        return Promise.resolve({ json: () => Promise.resolve([{ role_id: 1, role_name: 'admin' }]) });
      }
      if (url && url.includes('/api/free_shifts')) {
        return Promise.resolve({ json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    });
  });
  afterEach(() => {
    global.fetch.mockRestore();
  });

  it('shows loading spinner initially and then renders roster data', async () => {
    // Ensure localStorage is set for a logged-in user
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify({ username: 'test', roles: ['admin'] }));
    localStorage.setItem('roles', JSON.stringify(['admin']));
    render(
      <MemoryRouter>
        <ToastProvider>
          <AuthProvider>
            <UserSettingsProvider>
              <RosterPage />
            </UserSettingsProvider>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );
  // Wait for loaded content only
  await screen.findByText(/Roster Page/i);
  });

  it('shows loading spinner while fetching', () => {
    global.fetch = jest.fn(() => new Promise(() => {})); // never resolves
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify({ username: 'test', roles: ['admin'] }));
    localStorage.setItem('roles', JSON.stringify(['admin']));
    render(
      <MemoryRouter>
        <ToastProvider>
          <AuthProvider>
            <UserSettingsProvider>
              <RosterPage />
            </UserSettingsProvider>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/loading roster data/i)).toBeInTheDocument();
    global.fetch.mockRestore();
  });
});

