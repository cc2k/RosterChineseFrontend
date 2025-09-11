import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FeedbackPage from '../pages/FeedbackPage';
import { TextEncoder, TextDecoder } from 'util';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../components/ToastContext';

global.TextEncoder = TextEncoder
// @ts-expect-error
global.TextDecoder = TextDecoder

// Mock fetch for feedback submission
beforeEach(() => {
  global.fetch = jest.fn((url, opts) => {
    if (url.includes('/api/feedback')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    }
    return Promise.resolve({ json: () => Promise.resolve([]) });
  });
  // Mock localStorage for AuthProvider
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('user', JSON.stringify({ username: 'test', firstname: 'Test', surname: 'User', roles: ['admin'] }));
  localStorage.setItem('roles', JSON.stringify(['admin']));
});
afterEach(() => {
  global.fetch.mockRestore();
});

describe('FeedbackPage', () => {
  it('submits feedback and shows toast', async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <AuthProvider>
            <FeedbackPage />
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/Subject/i), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test feedback description' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    // Toast is rendered outside the form, so use findByText
    expect(await screen.findByText(/Feedback submitted!/i)).toBeInTheDocument();
  });

  it('shows error if required fields are missing', async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <AuthProvider>
            <FeedbackPage />
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );
    // Clear name and ensure anonymous is unchecked
    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), { target: { value: '' } });
    const anonCheckbox = screen.getByLabelText(/Submit as Anonymous/i);
    if (anonCheckbox.checked) {
      fireEvent.click(anonCheckbox); // uncheck if checked
    }
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(await screen.findByText(/Please enter your name or check Anonymous/i)).toBeInTheDocument();
  });
});
