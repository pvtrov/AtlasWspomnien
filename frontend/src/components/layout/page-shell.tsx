import Link from "next/link";

type PageShellProps = Readonly<{
  children: React.ReactNode;
}>;

export function PageShell({ children }: PageShellProps) {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="page-header__row">
          <div className="brand" aria-label="Atlas Wspomnień">
            <span className="brand-mark" aria-hidden="true" />
            <span>Atlas Wspomnień</span>
          </div>

          <nav className="top-nav" aria-label="Główna nawigacja">
            <Link href="/">Archiwum</Link>
            <Link href="/photos">Moje zdjęcia</Link>
            <Link href="/admin">Administracja</Link>
            <Link href="/login">Logowanie</Link>
            <Link href="/register">Rejestracja</Link>
          </nav>
        </div>
      </header>

      {children}
    </main>
  );
}
