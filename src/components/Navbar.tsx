import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-black">
      <div className="flex items-center space-x-2">
        <span className="font-bold text-xl tracking-tight">BlinkChat</span>
      </div>
      <div className="flex items-center space-x-6">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/chat" className="hover:underline">Chat</Link>
        <Link href="/blog" className="hover:underline">Blog</Link>
        <Link href="/profile" className="hover:underline">Profile</Link>
      </div>
    </nav>
  );
} 