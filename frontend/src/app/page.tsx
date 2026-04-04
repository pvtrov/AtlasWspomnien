import { AuthStatusCard } from "@/components/auth/auth-status-card";
import { PageShell } from "@/components/layout/page-shell";
import { BackendStatusCard } from "@/components/status/backend-status-card";
import { getApiBaseUrl } from "@/lib/config";

export default function HomePage() {
  const apiBaseUrl = getApiBaseUrl();

  return (
    <PageShell>
      <section className="hero">
        <p className="eyebrow">Sprint 3</p>
        <h1>Creator photo flow is ready for the first usable pass.</h1>
        <p className="lede">
          The application now combines the original backend status checks, the
          Sprint 2 creator authentication flow, and the first Sprint 3 creator
          photo management workspace for upload, detail, edit, and delete.
        </p>
      </section>

      <section className="status-grid" aria-label="Application status overview">
        <article className="status-card">
          <h2>Application</h2>
          <p className="status-value">Online</p>
          <p>
            The root layout, shared styles, auth state foundation, and creator
            photo workspace are configured.
          </p>
        </article>

        <article className="status-card">
          <h2>API Configuration</h2>
          <p className="status-value">{apiBaseUrl}</p>
          <p>
            The frontend now has a single place to resolve the backend base URL.
          </p>
        </article>

        <article className="status-card">
          <h2>Creator workspace</h2>
          <p className="status-value">/photos</p>
          <p>
            Open the first Sprint 3 creator photo area to upload archive
            materials and manage creator-owned photo metadata.
          </p>
        </article>

        <BackendStatusCard />
        <AuthStatusCard />
      </section>
    </PageShell>
  );
}
