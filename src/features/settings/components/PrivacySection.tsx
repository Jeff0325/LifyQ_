import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/** Placeholder per docs/02_Product_Requirements_Document.md §3.8 — real export/delete arrives with Phase 4's backend. */
export function PrivacySection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data &amp; privacy</CardTitle>
      </CardHeader>
      <CardContent className="gap-4 flex flex-col">
        <p className="text-body-sm text-foreground-secondary">
          Everything in LifyQ right now lives only in this browser&apos;s local
          storage — nothing is sent to a server. Clearing your browser data will
          erase it.
        </p>
        <div className="gap-2 flex flex-wrap">
          <Button type="button" variant="secondary" disabled>
            Export my data
          </Button>
          <Button type="button" variant="secondary" disabled>
            Delete my account
          </Button>
        </div>
        <p className="text-caption text-foreground-tertiary">
          These actions will be enabled once LifyQ has a real backend.
        </p>
      </CardContent>
    </Card>
  );
}
