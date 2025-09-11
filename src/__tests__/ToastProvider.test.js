import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../components/ToastContext';

function TestComponent() {
  const toast = useToast();
  return (
    <button onClick={() => toast.showToast('Hello Toast!')}>Show Toast</button>
  );
}

describe('ToastProvider', () => {
  it('shows a toast message when showToast is called', () => {
    jest.useFakeTimers();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    // Click the button to show the toast
    act(() => {
      screen.getByText('Show Toast').click();
    });
    expect(screen.getByText('Hello Toast!')).toBeInTheDocument();
    // Advance timers to hide the toast
    act(() => {
      jest.runAllTimers();
    });
    expect(screen.queryByText('Hello Toast!')).not.toBeInTheDocument();
    jest.useRealTimers();
  });
});
