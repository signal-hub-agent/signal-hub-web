import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Signal Hub | Mantle Ecosystem",
  description: "Web3 On-chain Data & AI Signal Advisor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50/50 min-h-screen`}>
        <Providers>
          <Navbar />
          {/* 主体内容区 */}
          <main className="py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}