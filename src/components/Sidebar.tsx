'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  Trophy, BarChart3, Bot, ChevronDown,
  Settings, LogOut, ShieldCheck, Share2, Zap,
} from 'lucide-react';

const menuItems = [
  {
    title: "Tổng quan",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Người dùng",
    icon: Users,
    subItems: [
      { name: "Danh sách tài khoản", path: "/users" },
    ]
  },
  {
    title: "Lớp học",
    icon: GraduationCap,
    subItems: [
      { name: "Danh sách lớp học", path: "/classes" },
      { name: "Màn hình nộp bài", path: "/classes/submissions" },
    ]
  },
  {
    title: "Nội dung (CMS)",
    icon: BookOpen,
    subItems: [
      { name: "Danh mục di sản", path: "/cms/categories" },
      { name: "Quản lý Môn học", path: "/cms/subjects" },
      { name: "Quản lý Bài học", path: "/cms/lessons" },
      { name: "Ngân hàng câu hỏi", path: "/cms/quizzes" },
      { name: "Quy tắc điểm thưởng", path: "/cms/rules" },
    ]
  },
  {
    title: "Gamification",
    icon: Trophy,
    subItems: [
      { name: "Quản lý Nhiệm vụ", path: "/gamification/missions" },
      { name: "Quản lý Huy hiệu", path: "/gamification/achievements" },
      { name: "Cửa hàng vật phẩm", path: "/gamification/items" },
      { name: "Bảng xếp hạng", path: "/gamification/leaderboard" },
    ]
  },
  {
    title: "Báo cáo",
    icon: BarChart3,
    subItems: [
      { name: "Thống kê bài giảng", path: "/reports/progress" },
    ]
  },
  {
    title: "Cộng đồng",
    icon: Share2,
    subItems: [
      { name: "Phương pháp dạy", path: "/community/teaching" },
      { name: "Cách học hay", path: "/community/learning" },
      { name: "Quản lý Bài viết", path: "/community/posts" },
      { name: "Báo cáo nội dung", path: "/community/reports" },
    ]
  },
  {
    title: "AI & Thông báo",
    icon: Bot,
    subItems: [
      { name: "Chat AI (Gemini)", path: "/ai/config" },
      { name: "Chat với người dùng", path: "/ai/chat" },
      { name: "Trung tâm Thông báo", path: "/notifications" },
    ]
  }
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(() => {
    // Auto-open the active group on mount
    return menuItems
      .filter(item => 'subItems' in item && item.subItems?.some(sub => pathname.startsWith(sub.path)))
      .map(item => item.title);
  });

  const toggleMenu = (title: string) => {
    setOpenMenus(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const isActiveGroup = (item: typeof menuItems[0]) => {
    if ('path' in item && item.path) return pathname === item.path;
    if ('subItems' in item && item.subItems) {
      return item.subItems.some(sub => pathname === sub.path || pathname.startsWith(sub.path + '/'));
    }
    return false;
  };

  return (
    <aside
      className="flex flex-col shrink-0 h-screen transition-all duration-300"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-3 px-5 shrink-0"
        style={{
          height: 'var(--header-height)',
          borderBottom: '1px solid var(--sidebar-border)',
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 0 16px rgba(16,185,129,0.35)',
          }}
        >
          <ShieldCheck size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="text-base font-black tracking-tight leading-none" style={{ color: 'var(--sidebar-text-primary)' }}>GDDS Master</p>
          <p className="text-[11px] mt-1.5 font-bold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
            Admin Portal
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-3 custom-scrollbar" style={{ padding: '12px 8px' }}>
        {menuItems.map((item) => {
          const active = isActiveGroup(item);
          const isOpen = openMenus.includes(item.title);

          return (
            <div key={item.title} className="mb-0.5">
              {'subItems' in item && item.subItems ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group"
                    style={{
                      color: active || isOpen ? 'var(--sidebar-text-primary)' : 'var(--sidebar-text-secondary)',
                      background: active || isOpen ? 'var(--sidebar-bg-hover)' : 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (!active && !isOpen) {
                        (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-bg-hover)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text-primary)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active && !isOpen) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text-secondary)';
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        size={18}
                        strokeWidth={active || isOpen ? 2.5 : 2}
                        style={{ color: active || isOpen ? 'var(--accent)' : 'inherit' }}
                      />
                      <span className="text-sm font-semibold">{item.title}</span>
                    </div>
                    <ChevronDown
                      size={14}
                      className="transition-transform duration-200"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: isOpen ? 'var(--accent)' : 'var(--sidebar-text-muted)',
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-0.5 mb-1" style={{ paddingLeft: '24px' }}>
                      <div style={{ borderLeft: '1px solid var(--sidebar-border)', paddingLeft: '12px' }}>
                        {item.subItems.map(sub => {
                          const subActive = pathname === sub.path || pathname.startsWith(sub.path + '/');
                          return (
                            <Link
                              key={sub.path}
                              href={sub.path}
                              onClick={onNavigate}
                              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-150 my-0.5"
                              style={{
                                color: subActive ? 'var(--accent)' : 'var(--sidebar-text-secondary)',
                                background: subActive ? 'var(--sidebar-bg-active)' : 'transparent',
                                fontWeight: subActive ? 600 : 400,
                              }}
                              onMouseEnter={e => {
                                if (!subActive) {
                                  (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text-primary)';
                                  (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-bg-hover)';
                                }
                              }}
                              onMouseLeave={e => {
                                if (!subActive) {
                                  (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text-secondary)';
                                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                                }
                              }}
                            >
                              {subActive && (
                                <div
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}
                                />
                              )}
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={(item as { path: string }).path}
                  onClick={onNavigate}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
                  style={{
                    color: active ? 'white' : 'var(--sidebar-text-secondary)',
                    background: active ? 'var(--accent)' : 'transparent',
                    boxShadow: active ? '0 4px 14px rgba(16,185,129,0.3)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-bg-hover)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text-primary)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text-secondary)';
                    }
                  }}
                >
                  <item.icon
                    size={18}
                    strokeWidth={active ? 2.5 : 2}
                    style={{ color: active ? 'white' : 'inherit' }}
                  />
                  <span>{item.title}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Upgrade Banner ── */}
      <div className="mx-3 mb-3 p-3 rounded-xl relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(99,102,241,0.04) 100%)',
        border: '1px solid rgba(16,185,129,0.2)',
      }}>
        <div className="flex items-center gap-2 mb-1.5">
          <Zap size={14} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--sidebar-text-primary)' }}>Hệ thống v4.0</span>
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--sidebar-text-secondary)' }}>
          Tất cả tính năng đang hoạt động bình thường.
        </p>
      </div>

      {/* ── Footer ── */}
      <div
        className="px-2 py-3 shrink-0"
        style={{ borderTop: '1px solid var(--sidebar-border)' }}
      >
        <Link
          href="/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
          style={{ color: 'var(--sidebar-text-secondary)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text-primary)';
            (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-bg-hover)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text-secondary)';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <Settings size={16} strokeWidth={2} />
          <span className="font-medium">Cài đặt hệ thống</span>
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
          style={{ color: 'var(--danger)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <LogOut size={14} strokeWidth={2} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}