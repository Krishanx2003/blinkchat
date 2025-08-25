

import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "./_components/Sidebar"

// Define metadata for the layout (replaces <Head>)
export const metadata = {
  metadataBase: new URL("https://www.tingletalk.com/"), // Replace with your site's URL
  other: {
    "6a97888e-site-verification": "0dae91cd147e2cc60e2c6f7ec3191362",
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Page Content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  )
}