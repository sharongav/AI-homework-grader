'use client';

/**
 * Tenant Explorer per Phase 11d.
 * Tree view: Platform → University → School → Course → Assignment → Submission → Grade.
 */
export default function TenantExplorerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tenant Explorer</h1>
      <p className="text-muted-foreground">
        Browse any tenant&apos;s data in read-only mode. Click a node to see it as the user at that scope would.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg border p-4 md:col-span-1">
          <h2 className="font-semibold mb-3">Universities</h2>
          <p className="text-sm text-muted-foreground">No universities loaded. Connect a database to browse tenants.</p>
          {/* TODO: Phase 11d — tree view with expandable nodes */}
        </div>

        <div className="rounded-lg border p-4 md:col-span-2">
          <h2 className="font-semibold mb-3">Detail View</h2>
          <p className="text-sm text-muted-foreground">Select a node from the tree to view details.</p>
        </div>
      </div>
    </div>
  );
}
