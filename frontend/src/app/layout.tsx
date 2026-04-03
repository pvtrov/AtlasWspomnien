import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AITSI",
  description: "Sprint 1 frontend scaffold for the AITSI project.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
