import React from 'react';
import { useUIStore } from '../store/useUIStore';

export const NotificationContainer = () => {
  const notifications = useUIStore((s) => s.notifications || []);

  if (!notifications || notifications.length === 0) return null;

  const notificationStyles = {
    success: 'bg-green-100 border-l-4 border-green-500 text-green-800',
    error: 'bg-red-100 border-l-4 border-red-500 text-red-800',
    warning: 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800',
    info: 'bg-cyan-100 border-l-4 border-cyan-500 text-cyan-800',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'ⓘ',
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded shadow-lg animate-slide-in ${notificationStyles[notification.type]}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold">{icons[notification.type]}</span>
            <span className="flex-1">{notification.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
