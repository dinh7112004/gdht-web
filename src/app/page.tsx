'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, BookOpen, Trophy, Sparkles,
  Activity, ArrowUpRight, ArrowDownRight,
  Search, Calendar, ChevronRight, Globe, Languages, X, Check, XCircle
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';

import api from "@/lib/api";

// Data types for "not hardcoded" approach
interface DashboardData {
  kpis: {
    title: string;
    value: string;
    change: string;
    isUp: boolean;
    icon?: any; // Will assign icons manually based on title
    color: string;
    target: number;
    progress: number;
  }[];
  growthData: {
    name: string;
    users: number;
    lessons: number;
  }[];
  categoryDistribution: {
    name: string;
    value: number;
    color: string;
    isPrivate?: boolean;
  }[];
  recentPosts: any[];
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7 NGÀY');
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  useEffect(() => {
    // Check auth
    const token = typeof window !== 'undefined' ? localStorage.getItem("userToken") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await api.get(`/stats/dashboard?period=${selectedPeriod}`);
        const dashboardData = response.data;
        
        // Assign icons back as they are lost in JSON serialization
        // Assign icons back safely
        dashboardData.kpis = dashboardData.kpis.map((kpi: any) => {
          const title = kpi.title.toLowerCase();
          if (title.includes("học sinh")) kpi.icon = Users;
          else if (title.includes("hoàn thành")) kpi.icon = Activity;
          else if (title.includes("kinh nghiệm") || title.includes("xp")) kpi.icon = Trophy;
          else if (title.includes("tương tác") || title.includes("ai")) kpi.icon = Sparkles;
          else kpi.icon = Activity; // Default icon to prevent crash
          return kpi;
        });

        setData(dashboardData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, selectedPeriod]);

  const handleUpdateStatus = async (postId: string, status: string) => {
    try {
      await api.patch(`/posts/${postId}/status`, { status });
      setSelectedPost(null);
      // Refresh data
      const response = await api.get(`/stats/dashboard?period=${selectedPeriod}`);
      setData(response.data);
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  if (loading || !data) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#FFFDF0]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        <p className="text-slate-500 font-bold animate-pulse">Đang tải dữ liệu hệ thống...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFDF0] text-slate-900 pb-20">

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedPost(null)} />
          <div className="bg-[#FFFDF0] w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300 border border-[#FEF9C3]">
            <div className="p-8 border-b border-[#FEF9C3] flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Chi tiết bài viết</h3>
              <button onClick={() => setSelectedPost(null)} className="w-10 h-10 rounded-full bg-[#FFFBEB] border border-[#FEF9C3] flex items-center justify-center text-slate-500 hover:bg-[#FFFDF0] transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-10 space-y-8 overflow-y-auto max-h-[70vh]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xl">
                  {selectedPost.authorName?.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900">{selectedPost.authorName}</p>
                  <p className="text-sm font-bold text-slate-400">{new Date(selectedPost.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <div className="ml-auto">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    selectedPost.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 
                    selectedPost.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' : 
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {selectedPost.status === 'APPROVED' ? 'Đã duyệt' : 
                     selectedPost.status === 'REJECTED' ? 'Đã từ chối' : 'Chờ duyệt'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-2xl font-black text-slate-900 leading-tight">{selectedPost.title}</h4>
                <div className="bg-[#FFFBEB] p-8 rounded-3xl border border-[#FEF9C3]">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{selectedPost.content}</p>
                </div>
              </div>
            </div>
            
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
              {selectedPost.status === 'PENDING' ? (
                <>
                  <button 
                    onClick={() => handleUpdateStatus(selectedPost._id, 'REJECTED')}
                    className="px-8 py-4 bg-white text-rose-500 border border-rose-100 rounded-2xl font-black text-sm hover:bg-rose-50 transition-all flex items-center gap-2"
                  >
                    <XCircle size={18} /> TỪ CHỐI
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedPost._id, 'APPROVED')}
                    className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
                  >
                    <Check size={18} /> PHÊ DUYỆT NGAY
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all"
                >
                  ĐÓNG
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Utility Bar */}
      <div className="px-6 md:px-10 py-4 flex justify-between items-center bg-[#FFFDF0]/80 backdrop-blur-sm border-b border-[#FEF9C3] sticky top-0 z-50">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span className="hidden sm:inline">Hệ thống Quản trị Tổng</span>
          <span className="text-slate-200 hidden sm:inline">/</span>
          <span className="text-slate-900">Dashboard</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFFBEB] border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-black text-slate-900 leading-tight">Admin Content</p>
              <p className="text-[10px] font-bold text-emerald-600">Online</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-10 space-y-8 md:space-y-12 animate-fade-in max-w-[1600px] mx-auto">

        {/* Main Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase leading-tight">
              HỆ THỐNG <span className="text-emerald-600">QUẢN TRỊ</span>
            </h1>
            <p className="text-slate-500 font-bold mt-2 md:mt-3 flex items-center gap-2 text-sm md:text-lg">
              <Activity size={18} className="text-emerald-600 animate-pulse" />
              Trung tâm kiểm soát dữ liệu
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-[#FFFBEB] p-2 rounded-[24px] md:rounded-3xl border border-[#FEF9C3] w-full md:w-auto">
            <button className="flex-1 md:flex-none h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-[#FFFDF0] rounded-xl md:rounded-2xl transition-all text-slate-400 hover:text-emerald-600">
              <Search size={20} />
            </button>
            <button className="flex-1 md:flex-none h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-[#FFFDF0] rounded-xl md:rounded-2xl transition-all text-slate-400 hover:text-emerald-600">
              <Calendar size={20} />
            </button>
            <div className="hidden md:block h-8 w-[1px] bg-[#FEF9C3] mx-1" />
            <button 
              onClick={() => router.push("/methods")}
              className="flex-[2] md:flex-none px-4 md:px-8 py-3 md:py-4 bg-emerald-600 text-white rounded-xl md:rounded-[20px] font-black text-[10px] md:text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/10 uppercase tracking-wider"
            >
              PHƯƠNG PHÁP
            </button>
            <button className="flex-[2] md:flex-none px-4 md:px-8 py-3 md:py-4 bg-slate-800 text-white rounded-xl md:rounded-[20px] font-black text-[10px] md:text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10 uppercase tracking-wider">
              BÁO CÁO
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {data.kpis.map((kpi, idx) => (
            <div key={idx} className="group bg-[#FFFBEB] p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-[#FEF9C3] premium-shadow hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6 md:mb-8">
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl transition-transform duration-500 group-hover:scale-110" style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}>
                  <kpi.icon size={24} strokeWidth={2.5} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5 ${kpi.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {kpi.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {kpi.change}
                </div>
              </div>

              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{kpi.title}</p>
              <h3 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">{kpi.value}</h3>

              <div className="mt-8">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-1.5 flex-1 bg-[#FFFDF0] rounded-full overflow-hidden mr-4 border border-[#FEF9C3]">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${kpi.progress || 0}%`, backgroundColor: kpi.color }} />
                  </div>
                  <span className="text-[10px] font-black text-slate-300">Target: {kpi.target}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main Growth Chart */}
          <div className="lg:col-span-2 bg-[#FFFBEB] p-6 md:p-12 rounded-[48px] border border-[#FEF9C3] premium-shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12">
              <div>
                <h3 className="text-xl md:text-3xl font-black text-slate-800 tracking-tighter">Tăng trưởng hệ thống</h3>
                <p className="text-slate-400 text-xs md:text-sm font-bold mt-1">Phân tích người dùng và bài học</p>
              </div>
              <div className="flex bg-[#FFFDF0] p-1 rounded-[16px] md:rounded-[20px] border border-[#FEF9C3] w-full md:w-auto">
                {['7 NGÀY', '30 NGÀY', '1 NĂM'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPeriod(p)}
                    className={`flex-1 md:flex-none px-3 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black transition-all ${p === selectedPeriod ? 'bg-emerald-600 shadow-lg text-white' : 'text-slate-400 hover:text-emerald-600'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[400px] w-full min-h-[400px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={400}>
                <AreaChart data={data.growthData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 800 }}
                    dy={20}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 800 }}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                    contentStyle={{
                      borderRadius: '24px',
                      border: 'none',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      padding: '20px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="lessons" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorLessons)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Community Distribution Card */}
          <div className="bg-slate-800 p-8 md:p-12 rounded-[48px] shadow-2xl shadow-emerald-900/10 text-white relative overflow-hidden flex flex-col">
            <div className="absolute -top-10 -right-10 p-20 opacity-[0.03] rotate-12">
              <BookOpen size={240} />
            </div>

            <h3 className="text-3xl font-black tracking-tighter relative z-10">Nội dung Community</h3>
            <p className="text-slate-500 font-bold mt-1 mb-12 relative z-10">Phân bố bài chia sẻ</p>

            <div className="flex-1 min-h-[250px] relative z-10">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={250}>
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    innerRadius="65%"
                    outerRadius="85%"
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {data.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-4xl font-black tracking-tighter">
                  {data.categoryDistribution.reduce((acc, curr) => acc + curr.value, 0)}
                </span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">BÀI VIẾT</span>
              </div>
            </div>

            <div className="mt-12 space-y-3 relative z-10">
              {data.categoryDistribution.map((cat, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 rounded-3xl bg-white/[0.03] hover:bg-white/[0.08] transition-all border border-white/5 group/item cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs font-black text-slate-400 group-hover/item:text-white transition-colors flex items-center gap-2">
                      {cat.name}
                      {cat.isPrivate && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-[8px] text-rose-500 font-black uppercase tracking-tighter border border-rose-500/20">Riêng tư</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-lg">{cat.value}</span>
                    <ChevronRight size={14} className="text-slate-700 group-hover/item:text-white transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Community Posts Section */}
        <div className="bg-[#FFFBEB] p-6 md:p-12 rounded-[48px] border border-[#FEF9C3] premium-shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter">Bài viết Cộng đồng</h3>
              <p className="text-slate-400 font-bold mt-1">Quản lý và duyệt các chia sẻ mới</p>
            </div>
            <button 
              onClick={() => router.push("/community/learning")}
              className="px-6 py-3 bg-[#FFFDF0] hover:bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs transition-all border border-[#FEF9C3] flex items-center gap-2"
            >
              XEM TẤT CẢ <ChevronRight size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Người gửi</th>
                  <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề</th>
                  <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung</th>
                  <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                  <th className="text-right py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPosts?.length > 0 ? data.recentPosts.map((post: any) => (
                  <tr 
                    key={post._id} 
                    className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                  >
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-sm">
                          {post.authorName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{post.authorName}</p>
                          <p className="text-[10px] font-bold text-slate-400">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <p className="text-sm font-bold text-slate-900 max-w-[200px] truncate">{post.title}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-black uppercase">
                        {post.type === 'LEARNING_TIP' ? 'Cách học' : 'Phương pháp dạy'}
                      </span>
                    </td>
                    <td className="py-6 px-4">
                      <p className="text-xs text-slate-500 max-w-[300px] line-clamp-2">{post.content}</p>
                    </td>
                    <td className="py-6 px-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        post.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 
                        post.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' : 
                        'bg-amber-50 text-amber-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          post.status === 'APPROVED' ? 'bg-emerald-500' : 
                          post.status === 'REJECTED' ? 'bg-rose-500' : 
                          'bg-amber-500'
                        }`} />
                        {post.status === 'APPROVED' ? 'Đã duyệt' : 
                         post.status === 'REJECTED' ? 'Đã từ chối' : 'Chờ duyệt'}
                      </div>
                    </td>
                    <td className="py-6 px-4 text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {post.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={async () => {
                                await handleUpdateStatus(post._id, 'APPROVED');
                              }}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-[10px] hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
                            >
                              DUYỆT
                            </button>
                            <button 
                              onClick={async () => {
                                await handleUpdateStatus(post._id, 'REJECTED');
                              }}
                              className="px-4 py-2 bg-white text-rose-500 border border-rose-100 rounded-xl font-black text-[10px] hover:bg-rose-50 transition-all"
                            >
                              TỪ CHỐI
                            </button>
                          </>
                        )}
                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <p className="text-slate-400 font-bold">Chưa có bài viết nào cần xử lý.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4">
        <button className="w-14 h-14 bg-white shadow-2xl rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-110 transition-all border border-slate-100">
          <Globe size={20} />
        </button>
        <button className="w-14 h-14 bg-white shadow-2xl rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-110 transition-all border border-slate-100">
          <Languages size={20} />
        </button>
      </div>

    </div>
  );
}
