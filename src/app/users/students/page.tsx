'use client';

import React, { useState } from 'react';
import { 
  Search, Filter, MoreVertical, Mail, 
  Phone, MapPin, Calendar, Book, 
  Trophy, Star, Zap, Target,
  ChevronRight, ArrowUpRight, Activity,
  Clock, Shield, Award, GraduationCap
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const mockStudent = {
  name: "Nguyễn Hoàng Nam",
  id: "STU-2024-001",
  grade: "Lớp 11A1",
  email: "nam.nh@student.edu.vn",
  phone: "0912 345 678",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nam",
  joinedDate: "15/01/2024",
  stats: [
    { label: "Kinh nghiệm (XP)", value: "12,450", subValue: "Hạng 5 toàn trường", icon: Trophy, color: "#f59e0b" },
    { label: "Chuỗi ngày học", value: "15 Ngày", subValue: "Kỷ lục: 24 ngày", icon: Zap, color: "#ef4444" },
    { label: "Bài học xong", value: "142", subValue: "85% hoàn thành", icon: Book, color: "#3b82f6" },
    { label: "Thành tựu", value: "24", subValue: "3 Huy hiệu Vàng", icon: Award, color: "#10b981" },
  ],
  skills: [
    { subject: 'Văn học', A: 120, fullMark: 150 },
    { subject: 'Lịch sử', A: 98, fullMark: 150 },
    { subject: 'Địa lý', A: 86, fullMark: 150 },
    { subject: 'Văn hóa', A: 99, fullMark: 150 },
    { subject: 'Nghệ thuật', A: 85, fullMark: 150 },
    { subject: 'Kỹ năng', A: 65, fullMark: 150 },
  ],
  activity: [
    { type: 'lesson', title: 'Hoàn thành bài "Ca dao Việt Nam"', time: '2 giờ trước', xp: '+50 XP' },
    { type: 'quiz', title: 'Đạt điểm tuyệt đối Quiz Lịch sử', time: '5 giờ trước', xp: '+100 XP' },
    { type: 'badge', title: 'Nhận huy hiệu "Chuyên cần"', time: 'Hôm qua', xp: '+200 XP' },
  ]
};

export default function Student360() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      {/* Utility Bar */}
      <div className="px-10 py-4 flex justify-between items-center bg-white/40 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span>Người dùng</span>
          <span className="text-slate-200">/</span>
          <span className="text-slate-900">Chi tiết Học sinh 360</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm học sinh theo ID, Tên..." 
              className="pl-11 pr-6 py-2.5 bg-slate-100/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all w-80"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={18} className="text-slate-500" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[48px] border border-slate-100 premium-shadow flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full border-8 border-white shadow-2xl overflow-hidden mb-6 group-hover:scale-105 transition-all duration-500">
                  <img src={mockStudent.avatar} alt={mockStudent.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-6 right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg animate-bounce">
                  <Shield size={18} />
                </div>
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{mockStudent.name}</h2>
              <p className="text-emerald-500 font-black uppercase tracking-widest text-[10px] mt-1">{mockStudent.id}</p>
              
              <div className="mt-8 w-full space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <GraduationCap size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Cấp lớp</p>
                    <p className="font-black text-slate-900">{mockStudent.grade}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <Mail size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Email</p>
                    <p className="font-bold text-slate-900 text-sm">{mockStudent.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <Calendar size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Ngày tham gia</p>
                    <p className="font-black text-slate-900">{mockStudent.joinedDate}</p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-8 py-5 bg-[#0f172a] text-white rounded-[24px] font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 uppercase tracking-widest">
                GỬI THÔNG BÁO RIÊNG
              </button>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[48px] shadow-2xl shadow-emerald-500/20 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Target size={160} />
              </div>
              <h3 className="text-xl font-black tracking-tighter relative z-10">Tiến độ kỳ học</h3>
              <p className="text-emerald-100 text-xs font-bold relative z-10">Giai đoạn: Giữa học kỳ II</p>
              <div className="mt-8 relative z-10">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-4xl font-black tracking-tighter">72%</span>
                  <span className="text-xs font-bold text-emerald-100">8/12 Modules</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-white rounded-full w-[72%] shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Analytics & Stats */}
          <div className="lg:col-span-3 space-y-10">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockStudent.stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 premium-shadow group hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                    <stat.icon size={24} />
                  </div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">{stat.subValue}</p>
                </div>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
              
              {/* Radar Chart: Learning Profile */}
              <div className="xl:col-span-3 bg-white p-10 rounded-[48px] border border-slate-100 premium-shadow">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Radar Năng lực 360°</h3>
                    <p className="text-slate-400 text-xs font-bold mt-1">Phân tích đa chiều kỹ năng học tập</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-emerald-600 uppercase border border-slate-100">
                    <Activity size={14} />
                    Live Data
                  </div>
                </div>

                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={400}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockStudent.skills}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 800 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                      <Radar
                        name={mockStudent.name}
                        dataKey="A"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="#10b981"
                        fillOpacity={0.15}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activity: Timeline */}
              <div className="xl:col-span-2 bg-[#0f172a] p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute -top-10 -right-10 p-20 opacity-[0.03] rotate-12">
                  <Activity size={240} />
                </div>
                
                <h3 className="text-2xl font-black tracking-tighter relative z-10">Dòng thời gian</h3>
                <p className="text-slate-500 text-xs font-bold mt-1 mb-8 relative z-10">Hoạt động mới nhất</p>

                <div className="space-y-6 relative z-10 flex-1">
                  {mockStudent.activity.map((act, idx) => (
                    <div key={idx} className="flex gap-4 group cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          {act.type === 'lesson' ? <Book size={18} /> : act.type === 'quiz' ? <Zap size={18} /> : <Award size={18} />}
                        </div>
                        {idx !== mockStudent.activity.length - 1 && <div className="w-[2px] h-full bg-white/5 my-2" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">{act.title}</h4>
                          <span className="text-[10px] font-black text-emerald-500">{act.xp}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-2">
                          <Clock size={12} />
                          {act.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white rounded-2xl font-black text-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2 group">
                  XEM TOÀN BỘ NHẬT KÝ
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>

            {/* Achievement Preview */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 premium-shadow">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Huy hiệu đạt được</h3>
                <button className="text-xs font-black text-emerald-500 uppercase tracking-widest hover:underline">Tất cả thành tựu</button>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex-shrink-0 w-24 flex flex-col items-center gap-3">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl ${i % 2 === 0 ? 'bg-amber-400 shadow-amber-500/20' : 'bg-emerald-400 shadow-emerald-500/20'}`}>
                      <Star size={32} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter text-center">Master {i}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
