'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Send, CheckCheck, Clock, Users,
  ChevronDown, Megaphone, CheckCircle2,
  Inbox, RefreshCw,
} from 'lucide-react';
import api from '@/lib/api';

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  general:    { label: 'Chung',      color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  assignment: { label: 'Bài tập',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  class:      { label: 'Lớp học',   color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Compose form
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number } | null>(null);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [notifRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ]);
      setNotifications(notifRes.data);
      setUnreadCount(countRes.data.count);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => fetchNotifications(), 0);
    return () => clearTimeout(id);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleSend = async () => {
    if (!title.trim()) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await api.post<{ sent: number }>('/notifications/push', {
        title: title.trim(),
        body: body.trim(),
        target,
        type: 'general',
      });
      setSendSuccess(true);
      setSendResult(res.data);
      setTitle('');
      setBody('');
      setTimeout(() => {
        setSendSuccess(false);
        setSendResult(null);
        void fetchNotifications(true);
      }, 3000);
    } catch {
      setSendSuccess(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Bell size={16} className="text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Trung tâm Thông báo</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-[11px] font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 ml-10">
            Quản lý và gửi thông báo đẩy đến người dùng trong hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700 transition-all"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Làm mới
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition-all"
            >
              <CheckCheck size={13} />
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Notification List ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Inbox size={15} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-800">Thông báo của tôi</h3>
            </div>
            <span className="text-[11px] text-slate-400">{notifications.length} thông báo</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Bell size={20} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-400">Chưa có thông báo nào</p>
              <p className="text-xs text-slate-300 mt-1">Thông báo mới sẽ xuất hiện ở đây</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.map(n => {
                const typeInfo = TYPE_LABELS[n.type] ?? TYPE_LABELS.general;
                return (
                  <div
                    key={n._id}
                    className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => !n.isRead && markRead(n._id)}
                  >
                    <div className="mt-1.5 shrink-0">
                      {n.isRead ? (
                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`text-sm font-medium truncate ${n.isRead ? 'text-slate-500' : 'text-slate-800'}`}>
                          {n.title}
                        </p>
                        <span
                          className="shrink-0 text-[10px] px-1.5 py-0.5 rounded font-semibold"
                          style={{ background: typeInfo.bg, color: typeInfo.color }}
                        >
                          {typeInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{n.body}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={10} className="text-slate-300" />
                        <span className="text-[10px] text-slate-400">{timeAgo(n.createdAt)}</span>
                      </div>
                    </div>

                    {!n.isRead && (
                      <button
                        onClick={e => { e.stopPropagation(); markRead(n._id); }}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-slate-100"
                        title="Đánh dấu đã đọc"
                      >
                        <CheckCircle2 size={14} className="text-slate-400" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Compose Panel ── */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
            <Megaphone size={15} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-slate-800">Gửi thông báo mới</h3>
          </div>

          <div className="p-5 flex-1 space-y-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Tiêu đề *
              </label>
              <input
                type="text"
                placeholder="Học bài thôi nào!"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-300 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Nội dung
              </label>
              <textarea
                placeholder="Một ngày mới đã bắt đầu, rồng con đang đợi bạn..."
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-300 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Nhóm đối tượng
              </label>
              <div className="relative">
                <select
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                >
                  <option value="all">Tất cả người dùng</option>
                  <option value="students">Tất cả học sinh</option>
                  <option value="teachers">Giáo viên</option>
                  <option value="inactive">Học sinh offline 3 ngày</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
              <Users size={13} className="text-blue-400 shrink-0" />
              <p className="text-[11px] text-blue-600">
                {target === 'all' ? 'Gửi đến tất cả học sinh và giáo viên' :
                 target === 'students' ? 'Gửi đến tất cả học sinh đang hoạt động' :
                 target === 'inactive' ? 'Gửi đến học sinh chưa đăng nhập 3 ngày' :
                 'Gửi đến tất cả giáo viên'}
              </p>
            </div>

            <button
              onClick={handleSend}
              disabled={sending || !title.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: sendSuccess
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                boxShadow: sendSuccess
                  ? '0 4px 14px rgba(16,185,129,0.3)'
                  : '0 4px 14px rgba(59,130,246,0.25)',
              }}
            >
              {sendSuccess ? (
                <><CheckCircle2 size={15} /> Đã gửi đến {sendResult?.sent ?? 0} người!</>
              ) : sending ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang gửi...</>
              ) : (
                <><Send size={15} /> Gửi ngay lập tức</>
              )}
            </button>
          </div>

          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-slate-800">{notifications.length}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Tổng thông báo</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">{unreadCount}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Chưa đọc</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
