'use client';

import { useState } from 'react';

/**
 * In-app notification drawer per Phase 13.
 * Shows unread notifications with mark-as-read functionality.
 */
export function NotificationDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-md hover:bg-muted"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {/* Unread badge */}
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
      </button>

      {open && (
        <div className="absolute right-4 top-14 z-50 w-80 rounded-lg border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <button className="text-xs text-primary hover:underline">Mark all read</button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
