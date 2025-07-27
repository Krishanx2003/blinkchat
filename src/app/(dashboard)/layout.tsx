import { Sidebar } from "./_components/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
      
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto ">
          {children}
        </main>
      </div>
    </div>
  )
}