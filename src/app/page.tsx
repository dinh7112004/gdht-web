'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Trophy, Sparkles,
  Activity, ArrowUpRight, ArrowDownRight,
  ChevronRight, X, Check, XCircle,
  TrendingUp, Clock,
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, PieChart, Pie,
} from 'recharts';
import api from "@/lib/api";

interface KPI {
  title: string;
  value: string;
  change: string;
  isUp: boolean;
  icon?: React.ElementType;
  color: string;
  target: number;
  progress: number;
}

interface GrowthPoint {
  name: string;
  users: number;
  lessons: number;
}

interface CategoryItem {
  name: string;
  value: number;
  color: string;
  isPrivate?: boolean;
}

interface Post {
  _id: string;
  authorName: string;
  title: string;
  content: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface DashboardData {
  kpis: KPI[];
  growthData: GrowthPoint[];
  categoryDistribution: CategoryItem[];
  recentPosts: Post[];
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ kpi }: { kpi: KPI }) {
  const Icon = kpi.icon ?? Activity;
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 transition-all duration-200 bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md"
      style={{ transition: 'all 0.2s ease' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${kpi.color}18`, color: kpi.color }}
        >
          <Icon size={17} strokeWidth={2} />
        </div>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
          style={
            kpi.isUp
              ? { background: 'rgba(16,185,129,0.1)', color: '#34d399' }
              : { background: 'rgba(239,68,68,0.1)', color: '#f87171' }
          }
        >
          {kpi.isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {kpi.change}
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold tracking-tight text-slate-800">
          {kpi.value}
        </p>
        <p className="text-xs mt-0.5 text-slate-400">
          {kpi.title}
        </p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] text-slate-300">Tiến độ</span>
          <span className="text-[10px] font-medium text-slate-400">{kpi.progress ?? 0}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${kpi.progress ?? 0}%`, background: kpi.color }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Post['status'] }) {
  const map = {
    APPROVED: { label: 'Đã duyệt', bg: 'rgba(16,185,129,0.1)', color: '#34d399', dot: '#10b981' },
    REJECTED: { label: 'Từ chối', bg: 'rgba(239,68,68,0.1)', color: '#f87171', dot: '#ef4444' },
    PENDING:  { label: 'Chờ duyệt', bg: 'rgba(245,158,11,0.1)', color: '#fbbf24', dot: '#f59e0b' },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────
interface TooltipPayloadItem {
  dataKey: string;
  color: string;
  value: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2.5 rounded-xl text-xs bg-white border border-slate-200"
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
    >
      <p className="font-semibold mb-1.5 text-slate-500">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.dataKey === 'users' ? 'Người dùng' : 'Bài học'}:</span>
          <span className="font-semibold text-slate-700">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7 NGÀY');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const fetchData = async (period: string) => {
    try {
      const response = await api.get(`/stats/dashboard?period=${period}`);
      const d: DashboardData = response.data;
      d.kpis = d.kpis.map((kpi) => {
        const t = kpi.title.toLowerCase();
        if (t.includes("học sinh")) kpi.icon = Users;
        else if (t.includes("hoàn thành")) kpi.icon = Activity;
        else if (t.includes("kinh nghiệm") || t.includes("xp")) kpi.icon = Trophy;
        else if (t.includes("tương tác") || t.includes("ai")) kpi.icon = Sparkles;
        else kpi.icon = TrendingUp;
        return kpi;
      });
      setData(d);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("userToken") : null;
    if (!token) { router.push("/login"); return; }
    // Defer to avoid synchronous setState-in-effect lint warning
    const id = setTimeout(() => fetchData(selectedPeriod), 0);
    return () => clearTimeout(id);
  }, [router, selectedPeriod]);

  const handleUpdateStatus = async (postId: string, status: string) => {
    try {
      await api.patch(`/posts/${postId}/status`, { status });
      setSelectedPost(null);
      fetchData(selectedPeriod);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // ── Loading skeleton ──
  if (loading || !data) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin" />
          <p className="text-xs font-medium tracking-widest uppercase text-slate-400">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  const totalPosts = data.categoryDistribution.reduce((a, c) => a + c.value, 0);

  return (
    <div className="min-h-screen pb-16 animate-fade-in bg-slate-50 text-slate-900">
      {/* ── Post Detail Modal ── */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedPost(null)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl overflow-hidden bg-white border border-slate-200"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Chi tiết bài viết</h3>
              <button
                onClick={() => setSelectedPost(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  {selectedPost.authorName?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{selectedPost.authorName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={11} className="text-slate-400" />
                    <p className="text-[11px] text-slate-400">
                      {new Date(selectedPost.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="ml-auto shrink-0">
                  <StatusBadge status={selectedPost.status} />
                </div>
              </div>

              <div>
                <h4 className="text-base font-semibold mb-3 text-slate-800">{selectedPost.title}</h4>
                <div className="p-4 rounded-xl text-sm leading-relaxed bg-slate-50 border border-slate-100 text-slate-600">
                  {selectedPost.content}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
              {selectedPost.status === 'PENDING' ? (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedPost._id, 'REJECTED')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      color: '#f87171',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.14)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                  >
                    <XCircle size={13} /> Từ chối
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedPost._id, 'APPROVED')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 16px rgba(16,185,129,0.35)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.25)')}
                  >
                    <Check size={13} /> Phê duyệt
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all"
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-6 lg:p-8 space-y-6">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Dashboard</h1>
            <p className="text-sm mt-0.5 text-slate-400">Tổng quan hệ thống giáo dục di sản</p>
          </div>

          {/* Period selector */}
          <div className="flex items-center p-1 rounded-lg gap-0.5 bg-white border border-slate-200">
            {['7 NGÀY', '30 NGÀY', '1 NĂM'].map(p => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className="px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-150"
                style={
                  p === selectedPeriod
                    ? { background: '#10b981', color: 'white' }
                    : { color: '#94a3b8' }
                }
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {data.kpis.map((kpi, i) => (
            <StatCard key={i} kpi={kpi} />
          ))}
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Growth chart */}
          <div className="lg:col-span-2 rounded-xl p-5 bg-white border border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Tăng trưởng hệ thống</h3>
                <p className="text-xs mt-0.5 text-slate-400">Người dùng và bài học theo thời gian</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-400">Người dùng</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#6366f1' }} />
                  <span className="text-[11px] text-slate-400">Bài học</span>
                </div>
              </div>
            </div>

            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.growthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gLessons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#gUsers)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="lessons"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#gLessons)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Community distribution */}
          <div className="rounded-xl p-5 flex flex-col bg-white border border-slate-100">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Nội dung cộng đồng</h3>
              <p className="text-xs mt-0.5 text-slate-400">Phân bố bài chia sẻ</p>
            </div>

            <div className="relative flex-1 min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {data.categoryDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-overlay)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-800">{totalPosts}</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Bài viết</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {data.categoryDistribution.map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                    <span className="text-xs text-slate-600">
                      {cat.name}
                    </span>
                    {cat.isPrivate && (
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          color: '#f87171',
                          border: '1px solid rgba(239,68,68,0.15)',
                        }}
                      >
                        Riêng tư
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Posts Table ── */}
        <div className="rounded-xl overflow-hidden bg-white border border-slate-100">
          {/* Table header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Bài viết cộng đồng</h3>
              <p className="text-xs mt-0.5 text-slate-400">Quản lý và duyệt các chia sẻ mới</p>
            </div>
            <button
              onClick={() => router.push("/community/learning")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700 transition-all"
            >
              Xem tất cả <ChevronRight size={13} />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Người gửi', 'Tiêu đề', 'Nội dung', 'Trạng thái', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentPosts?.length > 0 ? (
                  data.recentPosts.map(post => (
                    <tr
                      key={post._id}
                      className="cursor-pointer transition-colors border-b border-slate-50 hover:bg-slate-50"
                      onClick={() => setSelectedPost(post)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                          >
                            {post.authorName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-800">{post.authorName}</p>
                            <p className="text-[10px] mt-0.5 text-slate-400">
                              {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="text-xs font-medium max-w-[180px] truncate text-slate-800">
                          {post.title}
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          {post.type === 'LEARNING_TIP' ? 'Cách học' : 'Phương pháp dạy'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="text-xs max-w-[260px] line-clamp-2 text-slate-400">
                          {post.content}
                        </p>
                      </td>

                      <td className="px-5 py-3.5">
                        <StatusBadge status={post.status} />
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                          {post.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(post._id, 'APPROVED')}
                                className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                                style={{
                                  background: 'rgba(16,185,129,0.1)',
                                  color: '#34d399',
                                  border: '1px solid rgba(16,185,129,0.2)',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.18)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.1)')}
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(post._id, 'REJECTED')}
                                className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                                style={{
                                  background: 'rgba(239,68,68,0.08)',
                                  color: '#f87171',
                                  border: '1px solid rgba(239,68,68,0.15)',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.14)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                          <ChevronRight size={14} className="text-slate-300" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-400">
                      Chưa có bài viết nào cần xử lý.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
