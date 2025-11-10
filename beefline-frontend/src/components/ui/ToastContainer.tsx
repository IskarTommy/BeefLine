import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Toast notification={notification} onClose={removeNotification} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
