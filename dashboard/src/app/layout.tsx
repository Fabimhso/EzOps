import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EzOps Dashboard",
  description: "DevOps Simplified",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} bg-[#030712] font-sans text-gray-100 antialiased min-h-screen flex`}
      >
        <Sidebar />
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
          <Topbar />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
