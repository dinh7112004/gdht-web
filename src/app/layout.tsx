'use client';

import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Menu, X, ShieldCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  '/': 'Tổng quan',
  '/users': 'Người dùng',
  '/classes': 'Lớp học',
  '/classes/submissions': 'Nộp bài',
  '/cms/categories': 'Danh mục',
  '/cms/subjects': 'Môn học',
  '/cms/lessons': 'Bài học',
  '/cms/quizzes': 'Câu hỏi',
  '/cms/rules': 'Quy tắc',
  '/gamification/missions': 'Nhiệm vụ',
  '/gamification/achievements': 'Huy hiệu',
  '/gamification/items': 'Cửa hàng',
  '/gamification/leaderboard': 'Xếp hạng',
  '/reports/progress': 'Báo cáo',
  '/community/teaching': 'Phương pháp dạy',
  '/community/learning': 'Cách học hay',
  '/community/posts': 'Bài viết',
  '/community/reports': 'Báo cáo',
  '/ai/config': 'Chat AI',
  '/ai/chat': 'Chat',
  '/notifications': 'Thông báo',
  '/settings': 'Cài đặt',
};

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const currentPageTitle = PAGE_TITLES[pathname] ?? 'GDDS Master';
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
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

    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [pathname, router]);

  // Loading state
  if (isAuthenticated === null && pathname !== '/login') {
    return (
      <html lang="vi" className={inter.variable}>
        <body className={inter.className}>
          <div
            className="h-screen w-full flex flex-col items-center justify-center gap-6"
            style={{ background: 'var(--bg-base)' }}
          >
            {/* Logo mark */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 0 32px rgba(16,185,129,0.3)',
              }}
            >
              <ShieldCheck size={28} className="text-white" strokeWidth={2.5} />
            </div>

            {/* Spinner */}
            <div className="relative w-8 h-8">
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
                style={{ borderTopColor: 'var(--accent)' }}
              />
              <div
                className="absolute inset-1 rounded-full border border-transparent"
                style={{ borderTopColor: 'rgba(16,185,129,0.3)' }}
              />
            </div>

            <p
              className="text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              Đang xác thực phiên...
            </p>
          </div>
        </body>
      </html>
    );
  }

  // Login page — no shell
  if (pathname === '/login') {
    return (
      <html lang="vi" className={inter.variable}>
        <body className={inter.className} style={{ margin: 0 }}>{children}</body>
      </html>
    );
  }

  return (
    <html lang="vi" className={inter.variable}>
      <body className={inter.className} style={{ background: 'var(--bg-base)', margin: 0 }}>
        <div
          className="flex h-screen overflow-hidden"
          style={{ background: 'var(--bg-base)' }}
        >
          {/* Mobile overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 z-30 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div
            className={`
              fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
              lg:relative lg:translate-x-0
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
          >
            <Sidebar onNavigate={closeSidebar} />
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Mobile top bar */}
            <div
              className="lg:hidden flex items-center justify-between px-4 shrink-0"
              style={{
                height: 'var(--header-height)',
                background: 'var(--bg-surface)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 0 12px rgba(16,185,129,0.35)',
                  }}
                >
                  <ShieldCheck size={14} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {currentPageTitle}
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                }}
              >
                {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>

            {/* Desktop header */}
            <div className="hidden lg:block shrink-0">
              <Header />
            </div>

            {/* Page content */}
            <main
              className="flex-1 overflow-y-auto custom-scrollbar"
              style={{ background: 'var(--bg-base)' }}
            >
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