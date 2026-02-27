import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";

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
  icons: {
    icon: "/favicon.svg",
  },
};

import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import QueryProvider from "@/components/providers/QueryProvider";
import { SidebarProvider } from "@/context/SidebarContext";
import { UserPreferencesProvider } from "@/context/UserPreferencesContext";
import EnvironmentBanner from "@/components/common/EnvironmentBanner";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <EnvironmentBanner />
        <UserPreferencesProvider>
          <SidebarProvider>
            <QueryProvider>
              <div className="min-h-screen bg-black text-gray-100 font-sans flex flex-col lg:flex-row selection:bg-red-500/30">

                {/* Sidebar (Responsive Mini/Full) */}
                <Sidebar />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-gray-950 relative">
                  {/* Global Header */}
                  <Header />

                  {/* Page Content */}
                  {children}
                </div>
              </div>
            </QueryProvider>
          </SidebarProvider>
          <Toaster
            position="top-center"
            theme="dark"
            icons={{
              success: null,
              error: null,
              loading: <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />,
            }}
            toastOptions={{
              unstyled: true,
              classNames: {
                toast: "bg-[#141b24] border border-emerald-500/30 p-4 rounded-xl text-emerald-400 text-[15px] font-medium text-center shadow-inner min-w-[300px] flex justify-center items-center mb-2",
                title: "text-emerald-400",
                success: "border-emerald-500/30",
                error: "bg-[#1a1010] border-red-500/30 text-red-400",
              }
            }}
          />
          <SpeedInsights />
        </UserPreferencesProvider>
      </body>
    </html>
  );
}
