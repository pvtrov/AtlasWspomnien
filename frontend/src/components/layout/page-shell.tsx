import Link from "next/link";

type PageShellProps = Readonly<{
  children: React.ReactNode;
}>;

export function PageShell({ children }: PageShellProps) {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="page-header__row">
          <div className="brand" aria-label="AITSI project">
            <span className="brand-mark" aria-hidden="true" />
            <span>AITSI Frontend</span>
          </div>

          <nav className="top-nav" aria-label="Primary">
            <Link href="/">Home</Link>
            <Link href="/photos">My photos</Link>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </nav>
        </div>
      </header>

      {children}
    </main>
  );
}
