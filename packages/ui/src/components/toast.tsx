'use client';

import * as React from 'react';
import { cn } from '../utils';

interface ToastProps {
  message: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  onClose: () => void;
}

export function Toast({ message, variant = 'default', onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md border px-4 py-3 shadow-lg',
        {
          'bg-background': variant === 'default',
          'border-green-500 bg-green-50 text-green-800': variant === 'success',
          'border-red-500 bg-red-50 text-red-800': variant === 'error',
          'border-yellow-500 bg-yellow-50 text-yellow-800': variant === 'warning',
        },
      )}
    >
      <p className="text-sm">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-sm font-medium hover:opacity-70"
      >
        ✕
      </button>
    </div>
  );
}
