import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getSiteTitle } from "@/lib/env";

export const metadata: Metadata = {
  title: getSiteTitle(),
  description: "A digital songbook for medicine music ceremonies.",
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icons/icon-180.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Sacred Fire',
  },
};

import { Suspense } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import MobileBottomNav from "@/components/common/MobileBottomNav";
import QueryProvider from "@/components/providers/QueryProvider";
import { SidebarProvider } from "@/context/SidebarContext";
import { UserPreferencesProvider } from "@/context/UserPreferencesContext";
import EnvironmentBanner from "@/components/common/EnvironmentBanner";
import ServiceWorkerRegistrar from "@/components/providers/ServiceWorkerRegistrar";
import SidebarOverlay from "@/components/common/SidebarOverlay";
import GlobalSearchModal from "@/components/common/GlobalSearchModal";
import ThemedToaster from "@/components/providers/ThemedToaster";

// Inline script to prevent flash of wrong theme on load.
// Reads the user's preference from localStorage and applies the dark class
// before the first paint, so there's no visible flash.
const themeScript = `
(function(){
  try {
    var p = JSON.parse(localStorage.getItem('sacred-fire-songs-preferences') || '{}');
    var t = p.theme || 'dark';
    var d = t === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : t === 'dark';
    if (d) document.documentElement.classList.add('dark');
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', d ? '#1a0505' : '#ffffff');
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1a0505" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <ServiceWorkerRegistrar />
        <EnvironmentBanner />
        <UserPreferencesProvider>
          <SidebarProvider>
            <QueryProvider>
              <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-red-500/30 overflow-x-clip">
                {/* Top navigation bar (full width, like Immich) */}
                <Suspense>
                  <Header />
                </Suspense>

                {/* Grid: sidebar + main content */}
                <div className="relative grid grid-cols-[0_1fr] lg:grid-cols-[16rem_1fr] lg:h-[calc(100dvh-var(--navbar-height))]">
                  <Sidebar />

                  {/* Mobile overlay when sidebar is open */}
                  <SidebarOverlay />

                  <main className="relative min-w-0 overflow-y-visible lg:overflow-y-auto pb-16 lg:pb-0 col-start-2">
                    {children}
                  </main>
                </div>

                {/* Global search modal (non-/songs pages) */}
                <Suspense>
                  <GlobalSearchModal />
                </Suspense>

                {/* Mobile bottom navigation */}
                <MobileBottomNav />
              </div>
            </QueryProvider>
          </SidebarProvider>
          <ThemedToaster />
          <SpeedInsights />
        </UserPreferencesProvider>
      </body>
    </html>
  );
}
