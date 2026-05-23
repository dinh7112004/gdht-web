'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronRight, Search, CheckCheck } from 'lucide-react';
import api from '@/lib/api';

const BREADCRUMB_MAP: Record<string, string> = {
  '/': 'Tổng quan',
  '/users': 'Danh sách tài khoản',
  '/users/students': 'Học sinh',
  '/classes': 'Danh sách lớp học',
  '/classes/submissions': 'Màn hình nộp bài',
  '/cms/categories': 'Danh mục di sản',
  '/cms/subjects': 'Quản lý Môn học',
  '/cms/lessons': 'Quản lý Bài học',
  '/cms/quizzes': 'Ngân hàng câu hỏi',
  '/cms/rules': 'Quy tắc điểm thưởng',
  '/gamification/missions': 'Quản lý Nhiệm vụ',
  '/gamification/achievements': 'Quản lý Huy hiệu',
  '/gamification/items': 'Cửa hàng vật phẩm',
  '/gamification/leaderboard': 'Bảng xếp hạng',
  '/reports/progress': 'Thống kê tiến độ',
  '/community/teaching': 'Phương pháp dạy',
  '/community/learning': 'Cách học hay',
  '/community/posts': 'Quản lý Bài viết',
  '/community/reports': 'Báo cáo nội dung',
  '/ai/config': 'Chat AI (Gemini)',
  '/ai/chat': 'Chat với người dùng',
  '/notifications': 'Trung tâm Thông báo',
  '/settings': 'Cài đặt hệ thống',
};

const SECTION_MAP: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Người dùng',
  '/classes': 'Lớp học',
  '/cms': 'Nội dung',
  '/gamification': 'Gamification',
  '/reports': 'Báo cáo',
  '/community': 'Cộng đồng',
  '/ai': 'AI',
  '/notifications': 'Hệ thống',
  '/settings': 'Cài đặt',
};

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(s: string): string {
  const m = Math.floor((Date.now() - new Date(s).getTime()) / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function getSection(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  const prefix = '/' + pathname.split('/')[1];
  return SECTION_MAP[prefix] ?? 'Hệ thống';
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user] = useState<{ name: string; initial: string }>(() => {
    if (typeof window === 'undefined') return { name: 'Admin', initial: 'A' };
    try {
      const raw = localStorage.getItem('userData');
      if (raw) {
        const data = JSON.parse(raw);
        const name = data?.fullName ?? data?.name ?? data?.username ?? 'Admin';
        return { name, initial: name.charAt(0).toUpperCase() };
      }
    } catch { /* ignore */ }
    return { name: 'Admin', initial: 'A' };
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [notifRes, countRes] = await Promise.all([
          api.get<Notification[]>('/notifications'),
          api.get<{ count: number }>('/notifications/unread-count'),
        ]);
        setNotifications(Array.isArray(notifRes.data) ? notifRes.data.slice(0, 10) : []);
        setUnreadCount(countRes.data?.count ?? 0);
      } catch { /* ignore */ }
    };
    void load();
    const interval = setInterval(() => void load(), 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(p => p.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(p => p.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(p => Math.max(0, p - 1));
    } catch { /* ignore */ }
  };

  const section = getSection(pathname);
  const page = BREADCRUMB_MAP[pathname] ?? pathname.split('/').pop() ?? 'Trang';
  const isRoot = pathname === '/';

  return (
    <header
      className="flex items-center justify-between px-6 shrink-0 transition-all duration-300"
      style={{
        height: 'var(--header-height)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5 min-w-0">
        {!isRoot && (
          <>
            <span className="text-xs font-medium text-slate-400">{section}</span>
            <ChevronRight size={12} className="text-slate-300 shrink-0" />
          </>
        )}
        <span className="text-sm font-semibold text-slate-800 truncate">
          {isRoot ? 'Dashboard' : page}
        </span>
      </div>

      {/* ── Right Controls ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search */}
        <button
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 transition-all duration-150 hover:bg-slate-50 hover:text-slate-600"
          style={{ border: '1px solid var(--border-default)' }}
        >
          <Search size={12} />
          <span>Tìm kiếm...</span>
          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-400" style={{ background: 'var(--bg-base)' }}>
            ⌘K
          </span>
        </button>

        {/* Notification */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(p => !p)}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-slate-50 hover:text-slate-600"
          >
            <Bell size={15} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                style={{ background: '#10b981' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell size={13} className="text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Thông báo</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-bold">{unreadCount}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-emerald-600 font-semibold hover:underline flex items-center gap-1">
                      <CheckCheck size={10} /> Đọc tất cả
                    </button>
                  )}
                  <button onClick={() => { setOpen(false); router.push('/notifications'); }}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold hover:underline">
                    Xem tất cả
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Bell size={24} className="text-slate-200 mb-2" />
                    <p className="text-xs text-slate-400">Chưa có thông báo nào</p>
                  </div>
                ) : notifications.map(n => (
                  <button key={n._id} onClick={() => { if (!n.isRead) void markRead(n._id); }}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-emerald-50/40' : ''}`}>
                    <div className="mt-1 shrink-0">
                      {n.isRead
                        ? <div className="w-2 h-2 rounded-full bg-slate-200" />
                        : <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${n.isRead ? 'text-slate-500' : 'text-slate-800'}`}>{n.title}</p>
                      {n.body && <p className="text-[10px] text-slate-400 truncate mt-0.5">{n.body}</p>}
                      <p className="text-[10px] text-slate-300 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-4 mx-1 bg-slate-200" />

        {/* User */}
        <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all duration-150 hover:bg-slate-50">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 0 10px rgba(16,185,129,0.2)' }}>
            {user.initial}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-700 leading-tight">{user.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-[10px] font-medium text-slate-400">Online</p>
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
