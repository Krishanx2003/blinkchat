"use client";

import Sidebar from "./_components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-600 via-pink-500 to-purple-800">
      
      <Sidebar />
      <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
} 