"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { useTheme, type ThemeName } from "@/components/layout/theme-provider";

type PageShellProps = Readonly<{
  children: React.ReactNode;
}>;

export function PageShell({ children }: PageShellProps) {
  const { currentUser, logout, status } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const isAuthenticated = status === "authenticated" && currentUser !== null;

  function getLinkAriaCurrent(href: string): "page" | undefined {
    if (href === "/") {
      return pathname === "/" ? "page" : undefined;
    }

    return pathname.startsWith(href) ? "page" : undefined;
  }

  function handleThemeChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    setTheme(event.target.value as ThemeName);
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Przejdź do głównej treści
      </a>

      <header className="page-header">
        <div className="page-shell page-shell--header">
          <div className="page-header__row">
            <Link href="/" className="brand" aria-label="Atlas Wspomnień, strona główna">
              <span className="brand-mark" aria-hidden="true" />
              <span>Atlas Wspomnień</span>
            </Link>

            <nav className="top-nav" aria-label="Główna nawigacja">
              <Link href="/" aria-current={getLinkAriaCurrent("/")}>
                Archiwum
              </Link>
              <Link href="/photos" aria-current={getLinkAriaCurrent("/photos")}>
                Moje zdjęcia
              </Link>
              <Link href="/admin" aria-current={getLinkAriaCurrent("/admin")}>
                Administracja
              </Link>
              {isAuthenticated ? (
                <button
                  type="button"
                  className="top-nav__button"
                  onClick={logout}
                  aria-label={`Wyloguj się z konta ${currentUser.username}`}
                >
                  Wyloguj się
                </button>
              ) : (
                <>
                  <Link href="/login" aria-current={getLinkAriaCurrent("/login")}>
                    Logowanie
                  </Link>
                  <Link href="/register" aria-current={getLinkAriaCurrent("/register")}>
                    Rejestracja
                  </Link>
                </>
              )}
            </nav>

            <div className="theme-switcher">
              <label htmlFor="theme-switcher">Motyw</label>
              <select
                id="theme-switcher"
                name="theme"
                value={theme}
                onChange={handleThemeChange}
                aria-label="Wybierz motyw interfejsu"
              >
                <option value="light">Jasny</option>
                <option value="dark">Ciemny</option>
                <option value="contrast">Wysoki kontrast</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="page-shell page-shell--main" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
