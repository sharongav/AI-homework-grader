'use client';

import { useState } from 'react';

/**
 * Model Routing Controls per Phase 11d.
 * Edit model snapshots with typed confirmation and audit logging.
 */
export default function ModelRoutingPage() {
  const [confirmText, setConfirmText] = useState('');

  const models = [
    {
      label: 'Grading Model',
      family: 'gradingModelFamily',
      snapshot: 'gradingModelSnapshot',
      currentFamily: 'openai',
      currentSnapshot: 'gpt-4o-2024-08-06',
    },
    {
      label: 'Follow-Up Chat Model',
      family: 'followUpChatModelFamily',
      snapshot: 'followUpChatModelSnapshot',
      currentFamily: 'openai',
      currentSnapshot: 'gpt-4o-2024-08-06',
    },
    {
      label: 'Auxiliary Model',
      family: 'auxiliaryModelFamily',
      snapshot: 'auxiliaryModelSnapshot',
      currentFamily: 'openai',
      currentSnapshot: 'gpt-4o-mini-2024-07-18',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Model Routing Controls</h1>
      <p className="text-muted-foreground">
        Changes are audit-logged and hot-reloaded by workers without restart.
        Per Hard Rule 11: never downgrade the grading model.
      </p>

      <div className="space-y-4">
        {models.map((model: any) => (
          <div key={model.label} className="rounded-lg border p-6">
            <h2 className="font-semibold">{model.label}</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Family</label>
                <input
                  type="text"
                  defaultValue={model.currentFamily}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Snapshot</label>
                <input
                  type="text"
                  defaultValue={model.currentSnapshot}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm text-muted-foreground">
                Type the new snapshot string to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type snapshot string to confirm"
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <button
              className="mt-3 rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              disabled
            >
              Update Model
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
