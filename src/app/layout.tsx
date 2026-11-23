import type { Metadata, Viewport } from "next";
import { Suspense, ViewTransition } from "react";
import "@fontsource-variable/bricolage-grotesque/index.css";
import "@fontsource-variable/instrument-sans/wght.css";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/Toaster";
import { ConfirmHost } from "@/components/ui/ConfirmHost";
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
  themeColor: "#170833",
  width: "device-width",
  initialScale: 1,
  // Lets bottom sheets and the toaster pad themselves for the iPhone home indicator.
  viewportFit: "cover",
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
          {/* A short crossfade between pages. Layouts persist, so only "update" fires here. */}
          <ViewTransition update="page" default="none">
            {children}
          </ViewTransition>
        </main>
        <Footer />
        <Toaster />
        <ConfirmHost />
      </body>
    </html>
  );
}
