import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "@fontsource-variable/bodoni-moda/opsz.css";
import "@fontsource-variable/bodoni-moda/opsz-italic.css";
import "@fontsource-variable/instrument-sans/wght.css";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.founder.name }],
  creator: site.founder.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name}: ${site.tagline}`,
    description: site.description,
    url: "/",
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.tagline, creator: "@heyshambhavi" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1e0a23",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col antialiased">
        <a href="#main" className="sr-only-focusable fixed left-3 top-3 z-50 rounded-full bg-saffron px-4 py-2 font-semibold text-plum-deep">
          Skip to content
        </a>
        <Suspense fallback={<Header pathname="" />}>
          <Header />
        </Suspense>
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
