import { PageShell } from "@/components/layout/page-shell";
import { BackendStatusCard } from "@/components/status/backend-status-card";
import { getApiBaseUrl } from "@/lib/config";

export default function HomePage() {
  const apiBaseUrl = getApiBaseUrl();

  return (
    <PageShell>
      <section className="hero">
        <p className="eyebrow">Sprint 1</p>
        <h1>Frontend and backend connectivity is in progress.</h1>
        <p className="lede">
          This page confirms the Next.js application is running and performs a
          simple browser-side backend health check for the Sprint 1 foundation.
        </p>
      </section>

      <section className="status-grid" aria-label="Application status overview">
        <article className="status-card">
          <h2>Application</h2>
          <p className="status-value">Online</p>
          <p>The root layout, shared styles, and initial page are configured.</p>
        </article>

        <article className="status-card">
          <h2>API Configuration</h2>
          <p className="status-value">{apiBaseUrl}</p>
          <p>
            The frontend now has a single place to resolve the backend base URL.
          </p>
        </article>

        <BackendStatusCard />
      </section>
    </PageShell>
  );
}
