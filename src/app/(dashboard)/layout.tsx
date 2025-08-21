"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "./_components/Sidebar";
import Head from "next/head";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Head>
        <meta
          name="6a97888e-site-verification"
          content="0dae91cd147e2cc60e2c6f7ec3191362"
        />
      </Head>

      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="flex h-screen bg-gray-50">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Page Content */}
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </ThemeProvider>
    </>
  );
}
