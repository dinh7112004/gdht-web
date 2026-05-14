'use client';

import { useState } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Menu, X } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden bg-[#FFFDF0]">
          {/* Sidebar Overlay for Mobile */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden transition-all duration-300"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`
            fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <Sidebar />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden w-full">
            {/* Mobile Header */}
            <header className="lg:hidden flex items-center justify-between p-4 bg-[#FFFDF0] border-b border-[#FEF9C3] z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Menu size={20} />
                </div>
                <h1 className="text-lg font-black text-slate-800 tracking-tighter">GDDS</h1>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 bg-[#FFFBEB] rounded-xl border border-[#FEF9C3] text-emerald-600"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#FFFDF0]">
              <div className="max-w-[1600px] mx-auto w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
