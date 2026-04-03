import { PageShell } from "@/components/layout/page-shell";
import { getApiBaseUrl } from "@/lib/config";
import { getBackendStatusPlaceholder } from "@/services/api-client";

export default async function HomePage() {
  const apiBaseUrl = getApiBaseUrl();
  const backendStatus = await getBackendStatusPlaceholder();

  return (
    <PageShell>
      <section className="hero">
        <p className="eyebrow">Sprint 1</p>
        <h1>Frontend scaffold is ready.</h1>
        <p className="lede">
          This page confirms the Next.js application is running and the base
          frontend structure is in place for future feature work.
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

        <article className="status-card">
          <h2>Backend Service Layer</h2>
          <p className="status-value">{backendStatus.label}</p>
          <p>{backendStatus.message}</p>
        </article>
      </section>
    </PageShell>
  );
}
