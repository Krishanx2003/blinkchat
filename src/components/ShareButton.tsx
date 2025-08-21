"use client";

import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText("https://tinkletalk.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        onClick={handleCopyLink}
        className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300"
      >
        {copied ? "✅ Link Copied!" : "🔗 Share TinkleTalk"}
      </button>
    </div>
  );
}
