import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ShareButton from "@/components/ShareButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ Optimized Metadata
export const metadata: Metadata = {
  title: "TinkleTalk - Anonymous Chatting, FWB, Fun & Play Chats",
  description:
    "Join TinkleTalk for anonymous chatting, fun conversations, FWB connections, and playful chats. Meet new people worldwide and connect instantly!",
  keywords: [
    "anonymous chat",
    "TinkleTalk",
    "FWB chatting",
    "fun chat rooms",
    "random chat",
    "online flirting",
    "friends with benefits",
    "play chat",
  ],
  authors: [{ name: "TinkleTalk Team" }],
  creator: "TinkleTalk",
  openGraph: {
    title: "TinkleTalk - Anonymous Chatting & Fun Conversations",
    description:
      "Connect anonymously with people worldwide. Join fun chat rooms, FWB conversations, and playful chats.",
    url: "https://tinkletalk.com",
    siteName: "TinkleTalk",
    images: [
      {
        url: "https://tinkletalk.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TinkleTalk - Anonymous Chat Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TinkleTalk - Anonymous Chatting Platform",
    description:
      "Meet new people, chat anonymously, and explore playful conversations on TinkleTalk.",
    images: ["https://tinkletalk.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://tinkletalk.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Site Verification Meta Tag */}
        <meta
          name="6a97888e-site-verification"
          content="0dae91cd147e2cc60e2c6f7ec3191362"
        />

        {/* ✅ Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "TinkleTalk",
              url: "https://tinkletalk.com",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://tinkletalk.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        {/* ✅ Floating Copy Link Button */}
        {/* <ShareButton /> */}

        {/* ✅ Main Content */}
        {children}
      </body>
    </html>
  );
}
