'use client';

import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Menu, X, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Authentication Check
    const checkAuth = () => {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setIsAuthenticated(false);
        if (pathname !== '/login') {
          router.push('/login');
        }
      } else {
        setIsAuthenticated(true);
        if (pathname === '/login') {
          router.push('/');
        }
      }
    };

    checkAuth();
    
    // Optional: Add event listener for storage changes (to handle logout in other tabs)
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [pathname, router]);

  // Loading State
  if (isAuthenticated === null && pathname !== '/login') {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0f172a] text-white">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Initializing Secure Session...</p>
          </div>
        </body>
      </html>
    );
  }

  // Login Page Layout
  if (pathname === '/login') {
    return (
      <html lang="en">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    );
  }

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

