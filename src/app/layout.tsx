import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chinese Phrase Builder",
  description: "Learn Chinese phrases from English words",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <nav className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              Chinese Phrase Builder
            </Link>
            <Link href="/vocabulary" className="text-gray-600 hover:text-gray-900">
              Vocabulary
            </Link>
            <Link href="/phrases" className="text-gray-600 hover:text-gray-900">
              Saved Phrases
            </Link>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
