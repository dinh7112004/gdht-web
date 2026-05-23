'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Trophy,
  Zap,
  BookOpen,
  Award,
  Mail,
  Calendar,
  GraduationCap,
  ChevronRight,
  Search,
  Filter,
  Bell,
  Share2,
  Languages,
  Activity,
  User as UserIcon,
  ShieldCheck,
  Send,
  X,
  CheckCircle2,
} from 'lucide-react';
import { 
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import api from '@/lib/api';

export default function Student360Detail() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<any>(null);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyBody, setNotifyBody] = useState('');
  const [notifySending, setNotifySending] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);

  const handleSendNotify = async () => {
    if (!notifyTitle.trim()) return;
    setNotifySending(true);
    try {
      await api.post('/notifications/push', {
        title: notifyTitle.trim(),
        body: notifyBody.trim(),
        target: id,
        type: 'general',
      });
      setNotifySuccess(true);
      setTimeout(() => {
        setNotifySuccess(false);
        setNotifyOpen(false);
        setNotifyTitle('');
        setNotifyBody('');
      }, 2000);
    } catch {
      alert('Gửi thông báo thất bại');
    } finally {
      setNotifySending(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const res = await api.get(`/users/360/${id}`);
        setData(res.data);
      } catch (error) {
        console.error('Error fetching student 360 data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Không tìm thấy dữ liệu học sinh</h1>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">Quay lại</button>
      </div>
    );
  }

  const { user, stats, radarData, activities } = data;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans selection:bg-blue-100">
      {/* Header / Nav */}
      <header className="px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Người dùng</span>
          <ChevronRight size={14} />
          <span className="font-semibold text-slate-700">Chi tiết Học sinh 360</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Tìm học sinh theo ID, Tên..."
              className="pl-12 pr-6 py-2.5 bg-white border-none rounded-2xl w-80 text-sm premium-shadow focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
          </div>
          
          <button className="p-2.5 bg-white rounded-xl premium-shadow hover:bg-slate-50 transition-colors">
            <Filter size={20} className="text-slate-600" />
          </button>
        </div>
      </header>

      <main className="px-8 pb-12 grid grid-cols-12 gap-8">
        {/* Left Sidebar - Profile Card */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 premium-shadow border border-white/50 relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 -z-10 group-hover:scale-110 transition-transform duration-700" />
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8 relative">
              <div className="relative p-1 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6 group-hover:rotate-3 transition-transform flex items-center justify-center w-32 h-32">
                <img 
                  src={user.equippedItems?.avatarId?.imageUrl 
                    ? (user.equippedItems.avatarId.imageUrl.startsWith('http') ? user.equippedItems.avatarId.imageUrl : `http://localhost:3000${user.equippedItems.avatarId.imageUrl}`) 
                    : (user.avatar 
                        ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:3000${user.avatar}`)
                        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`)} 
                  alt={user.fullName}
                  className={`${user.equippedItems?.frameId ? 'w-24 h-24' : 'w-32 h-32'} rounded-full object-cover border-4 border-white premium-shadow transition-all`}
                />
                
                {user.equippedItems?.frameId && (
                  <img 
                    src={user.equippedItems.frameId.imageUrl.startsWith('http') ? user.equippedItems.frameId.imageUrl : `http://localhost:3000${user.equippedItems.frameId.imageUrl}`}
                    alt="Frame"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none scale-110"
                  />
                )}

                <div className="absolute bottom-1 right-1 w-8 h-8 bg-[#10b981] rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg z-10">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-center mb-1 tracking-tight leading-tight">{user.fullName}</h2>
              <span className="text-[#10b981] font-bold text-sm tracking-widest uppercase">{`STU-${user._id.slice(-6).toUpperCase()}`}</span>
            </div>

            {/* Info List */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-blue-100 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm border border-slate-50">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cấp lớp</p>
                  <p className="font-bold text-slate-700">{user.className || "Chưa vào lớp học"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-blue-100 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-purple-500 shadow-sm border border-slate-50">
                  <Mail size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email</p>
                  <p className="font-bold text-slate-700 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-blue-100 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm border border-slate-50">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ngày tham gia</p>
                  <p className="font-bold text-slate-700">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setNotifyOpen(true)}
              className="w-full mt-8 py-4 bg-[#1e293b] text-white font-bold rounded-2xl premium-shadow hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Bell size={18} />
              GỬI THÔNG BÁO RIÊNG
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard 
              icon={<Trophy size={24} />} 
              label="Kinh nghiệm (XP)" 
              value={user.xp.toLocaleString()} 
              subValue="Hạng 5 toàn trường" 
              color="text-amber-500" 
              bg="bg-amber-50"
            />
            <StatCard 
              icon={<Zap size={24} />} 
              label="Chuỗi ngày học" 
              value={`${user.streak} Ngày`} 
              subValue={`Kỷ lục: ${user.streak + 9} ngày`} 
              color="text-rose-500" 
              bg="bg-rose-50"
            />
            <StatCard 
              icon={<BookOpen size={24} />} 
              label="Bài học xong" 
              value={stats.totalLessons.toString()} 
              subValue={`${stats.completionRate}% hoàn thành`} 
              color="text-blue-500" 
              bg="bg-blue-50"
            />
            <StatCard 
              icon={<Award size={24} />} 
              label="Thành tựu" 
              value={stats.totalAchievements.toString()} 
              subValue="3 Huy hiệu Vàng" 
              color="text-emerald-500" 
              bg="bg-emerald-50"
            />
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Radar Chart Section */}
            <div className="col-span-12 xl:col-span-8">
              <div className="bg-white rounded-[2.5rem] p-10 premium-shadow border border-white/50 h-full relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Radar Năng lực 360°</h3>
                    <p className="text-slate-400 font-medium">Phân tích đa chiều kỹ năng học tập</p>
                  </div>
                  <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 border border-emerald-100">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    LIVE DATA
                  </div>
                </div>

                <div className="h-[400px] w-full flex items-center justify-center relative">
                  {mounted && (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={radarData.map((d: any) => ({ ...d, value: 1 }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={(entry: any) => 40 + (entry.A * 100 / 100)}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="subject"
                          animationBegin={0}
                          animationDuration={1500}
                          stroke="none"
                          label={({ name, payload }) => `${name}: ${payload.A}%`}
                        >
                          {radarData.map((entry: any, index: number) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'][index % 6]}
                              fillOpacity={0.8}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: any, name: any, props: any) => [`${props.payload.A}%`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-4xl font-black text-slate-800 tracking-tighter">
                      {Math.round(radarData.reduce((acc: number, curr: any) => acc + curr.A, 0) / (radarData.length || 1))}%
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Năng lực TB</span>
                  </div>
                </div>

                {/* Insights Section */}
                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Điểm mạnh (Thế mạnh)</p>
                    <div className="flex flex-wrap gap-2">
                      {stats.strengths && stats.strengths.length > 0 ? (
                        stats.strengths.map((s: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100 flex items-center gap-1.5">
                            <Zap size={10} className="fill-emerald-500" />
                            {s}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 font-medium italic">Chưa xác định thế mạnh nổi bật</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Cần cải thiện (Điểm yếu)</p>
                    <div className="flex flex-wrap gap-2">
                      {stats.weaknesses && stats.weaknesses.length > 0 ? (
                        stats.weaknesses.map((w: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-full border border-rose-100 flex items-center gap-1.5">
                            <Activity size={10} />
                            {w}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 font-medium italic">Chưa phát hiện lỗ hổng kiến thức lớn</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="col-span-12 xl:col-span-4">
              <div className="bg-[#0f172a] rounded-[2.5rem] p-10 premium-shadow h-full relative overflow-hidden text-white group">
                {/* Background Decor */}
                <div className="absolute top-1/2 right-0 w-full h-full opacity-10 pointer-events-none -translate-y-1/2">
                   <Activity size={300} className="text-blue-500" />
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-1 tracking-tight">Dòng thời gian</h3>
                  <p className="text-slate-400 font-medium text-sm mb-6">Hoạt động mới nhất</p>

                  <div className="space-y-6 relative z-10 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                    {activities.map((activity: any, idx: number) => (
                      <div key={idx} className="flex gap-4 group/item">
                        <div className="flex flex-col items-center">
                          <div className={`w-9 h-9 rounded-xl ${activity.type === 'ACHIEVEMENT' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'} flex items-center justify-center border border-white/5 group-hover/item:scale-110 transition-transform`}>
                            {activity.type === 'ACHIEVEMENT' ? <Award size={18} /> : <BookOpen size={18} />}
                          </div>
                          {idx < activities.length - 1 && (
                            <div className="w-[1px] h-8 bg-gradient-to-b from-slate-700 to-transparent mt-2" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-xs truncate group-hover/item:text-blue-400 transition-colors">{activity.title}</h4>
                            <span className="text-[9px] font-black text-emerald-400 whitespace-nowrap">+{activity.xp} XP</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{activity.description}</p>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-600 font-bold mt-1.5">
                            <Calendar size={10} />
                            {new Date(activity.date).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl border border-white/5 transition-all text-xs flex items-center justify-center gap-2 group/btn">
                    XEM TOÀN BỘ NHẬT KÝ
                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="bg-white rounded-[2.5rem] p-10 premium-shadow border border-white/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Huy hiệu đạt được</h3>
              <button className="text-xs font-black text-blue-500 uppercase tracking-widest hover:underline transition-all">Tất cả thành tựu</button>
            </div>
            
            {data.achievements && data.achievements.length > 0 ? (
              <div className="flex gap-8 overflow-x-auto pb-4 custom-scrollbar">
                {data.achievements.map((item: any, idx: number) => {
                  const achievement = item.achievementId;
                  const isPopulated = achievement && typeof achievement === 'object';
                  return (
                    <div key={idx} className="flex-shrink-0 flex flex-col items-center gap-3 group/badge cursor-pointer">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center border-4 border-white shadow-xl group-hover/badge:scale-110 group-hover/badge:rotate-6 transition-all duration-500">
                          <img 
                            src={isPopulated ? (achievement.icon || 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png') : 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png'} 
                            alt={isPopulated ? achievement.title : 'Badge'} 
                            className="w-14 h-14 object-contain"
                          />
                        </div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#1e293b] rounded-full border-4 border-white flex items-center justify-center text-white text-[10px] font-black">
                          {item.level || 1}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black text-slate-700 leading-tight">
                          {isPopulated ? achievement.title : `Huy hiệu ${idx + 1}`}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                          {new Date(item.earnedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <Award size={32} />
                </div>
                <p className="text-slate-400 font-bold">Chưa có huy hiệu nào được mở khóa</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Actions */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        <button className="p-4 bg-white rounded-full premium-shadow hover:scale-110 transition-all text-slate-600 hover:text-blue-500">
          <Share2 size={24} />
        </button>
        <button className="p-4 bg-[#1e293b] rounded-full shadow-2xl hover:scale-110 transition-all text-white">
          <Languages size={24} />
        </button>
      </div>

      {/* Notify Modal */}
      {notifyOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setNotifyOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden border border-slate-200/60">
            <div className="p-5 sm:p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Gửi thông báo riêng</h3>
                <p className="text-xs text-slate-400 mt-1">Đến: <span className="font-bold text-slate-600">{data?.user?.fullName}</span></p>
              </div>
              <button onClick={() => setNotifyOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 sm:p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu đề *</label>
                <input
                  type="text"
                  placeholder="Nhập tiêu đề thông báo..."
                  value={notifyTitle}
                  onChange={e => setNotifyTitle(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-amber-400 outline-none text-sm font-medium text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nội dung</label>
                <textarea
                  placeholder="Nhập nội dung thông báo..."
                  value={notifyBody}
                  onChange={e => setNotifyBody(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-amber-400 outline-none text-sm font-medium text-slate-700 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNotifyOpen(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSendNotify}
                  disabled={!notifyTitle.trim() || notifySending}
                  className="flex-[2] py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{
                    background: notifySuccess ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#f59e0b,#d97706)',
                    boxShadow: notifySuccess ? '0 4px 14px rgba(16,185,129,.3)' : '0 4px 14px rgba(245,158,11,.3)',
                  }}
                >
                  {notifySuccess ? (
                    <><CheckCircle2 size={16} /> Đã gửi!</>
                  ) : notifySending ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang gửi...</>
                  ) : (
                    <><Send size={16} /> Gửi thông báo</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subValue, color, bg }: any) {
  return (
    <div className="bg-white rounded-[2rem] p-6 premium-shadow border border-white/50 hover:scale-[1.03] transition-all duration-300 group cursor-default">
      <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight mb-1">{value}</p>
        <p className="text-xs font-bold text-slate-400">{subValue}</p>
      </div>
    </div>
  );
}
