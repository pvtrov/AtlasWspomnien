import type { Metadata } from "next";
import Script from "next/script";

import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlas Wspomnień",
  description: "Społeczne archiwum zdjęć historycznych z mapą, wyszukiwaniem i wspólną warstwą odkrywania miejsc.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pl" data-theme="light" suppressHydrationWarning>
      <body>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = window.localStorage.getItem("aitsi.theme");
                if (theme === "light" || theme === "dark" || theme === "contrast") {
                  document.documentElement.dataset.theme = theme;
                }
              } catch (error) {}
            `,
          }}
        />
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
