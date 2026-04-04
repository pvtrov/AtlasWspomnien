import { PageShell } from "@/components/layout/page-shell";
import { SharedPhotosPanel } from "@/components/photos/shared-photos-panel";

export default function HomePage() {
  return (
    <PageShell>
      <SharedPhotosPanel />
    </PageShell>
  );
}
