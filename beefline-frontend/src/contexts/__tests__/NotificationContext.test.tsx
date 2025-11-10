import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotificationProvider, useNotification } from '../NotificationContext';
import { act } from 'react';

// Test component that uses the notification context
const TestComponent = () => {
  const { showNotification, notifications, removeNotification, clearAll } = useNotification();

  return (
    <div>
      <button onClick={() => showNotification('success', 'Success message')}>
        Show Success
      </button>
      <button onClick={() => showNotification('error', 'Error message')}>
        Show Error
      </button>
      <button onClick={() => showNotification('warning', 'Warning message')}>
        Show Warning
      </button>
      <button onClick={() => showNotification('info', 'Info message')}>
        Show Info
      </button>
      <button onClick={() => notifications.length > 0 && removeNotification(notifications[0].id)}>
        Remove First
      </button>
      <button onClick={clearAll}>Clear All</button>
      <div data-testid="notification-count">{notifications.length}</div>
      {notifications.map((n) => (
        <div key={n.id} data-testid={`notification-${n.type}`}>
          {n.message}
        </div>
      ))}
    </div>
  );
};

describe('NotificationContext', () => {
  it('provides notification context to children', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    expect(screen.getByText('Show Success')).toBeInTheDocument();
  });

  it('shows success notification', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    act(() => {
      screen.getByText('Show Success').click();
    });

    expect(screen.getByTestId('notification-success')).toHaveTextContent('Success message');
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
  });

  it('shows error notification', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    act(() => {
      screen.getByText('Show Error').click();
    });

    expect(screen.getByTestId('notification-error')).toHaveTextContent('Error message');
  });

  it('removes notification', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    act(() => {
      screen.getByText('Show Success').click();
    });

    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');

    act(() => {
      screen.getByText('Remove First').click();
    });

    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
  });

  it('clears all notifications', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    act(() => {
      screen.getByText('Show Success').click();
      screen.getByText('Show Error').click();
    });

    expect(screen.getByTestId('notification-count')).toHaveTextContent('2');

    act(() => {
      screen.getByText('Clear All').click();
    });

    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
  });

  it('auto-removes notification after duration', async () => {
    vi.useFakeTimers();

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    act(() => {
      screen.getByText('Show Success').click();
    });

    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');

    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve();
    });

    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');

    vi.useRealTimers();
  });
});
