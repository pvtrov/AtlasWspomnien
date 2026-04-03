import { AuthStatusCard } from "@/components/auth/auth-status-card";
import { PageShell } from "@/components/layout/page-shell";
import { BackendStatusCard } from "@/components/status/backend-status-card";
import { getApiBaseUrl } from "@/lib/config";

export default function HomePage() {
  const apiBaseUrl = getApiBaseUrl();

  return (
    <PageShell>
      <section className="hero">
        <p className="eyebrow">Sprint 2</p>
        <h1>Frontend authentication foundation is connected.</h1>
        <p className="lede">
          This page now combines the original frontend-backend health check with
          the first minimal authentication flow for creator registration, login,
          and authenticated session restoration.
        </p>
      </section>

      <section className="status-grid" aria-label="Application status overview">
        <article className="status-card">
          <h2>Application</h2>
          <p className="status-value">Online</p>
          <p>
            The root layout, shared styles, and Sprint 2 auth state foundation
            are configured.
          </p>
        </article>

        <article className="status-card">
          <h2>API Configuration</h2>
          <p className="status-value">{apiBaseUrl}</p>
          <p>
            The frontend now has a single place to resolve the backend base URL.
          </p>
        </article>

        <BackendStatusCard />
        <AuthStatusCard />
      </section>
    </PageShell>
  );
}
