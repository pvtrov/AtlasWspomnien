type PageShellProps = Readonly<{
  children: React.ReactNode;
}>;

export function PageShell({ children }: PageShellProps) {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="brand" aria-label="AITSI project">
          <span className="brand-mark" aria-hidden="true" />
          <span>AITSI Frontend</span>
        </div>
      </header>

      {children}
    </main>
  );
}
