'use client';

import React, { useEffect, useState } from "react";
import { 
  BarChart3, TrendingUp, Download, 
  Calendar, Filter, PieChart as PieIcon,
  Activity, Users, BookOpen, Clock
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell
} from 'recharts';
import api from "@/lib/api";

export default function ReportsProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats/reports');
      setData(res.data);
    } catch (e) {
      console.error("Failed to fetch report stats", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const formatXp = (xp: number) => {
    if (xp >= 1000000) return (xp / 1000000).toFixed(1) + 'M';
    if (xp >= 1000) return (xp / 1000).toFixed(1) + 'K';
    return xp.toString();
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Báo cáo & Thống kê</h1>
          <p className="text-slate-500 font-bold mt-1">Phân tích dữ liệu thực tế từ hoạt động của học sinh trên ứng dụng.</p>
        </div>
        <button className="bg-emerald-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
          <Download size={20} /> Xuất PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Analysis */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 premium-shadow">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Biểu đồ Radar Năng lực</h3>
            <p className="text-slate-500 font-bold text-sm">Điểm số trung bình theo từng chuyên mục bài học.</p>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={400}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data?.radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 12, fontWeight: '900'}} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} axisLine={false} tick={false} />
                <Radar name="Học sinh" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Radar name="Mục tiêu" dataKey="B" stroke="#cbd5e1" fill="#cbd5e1" fillOpacity={0.1} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Analytics */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 premium-shadow">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Thời gian học tập</h3>
              <p className="text-slate-500 font-bold text-sm">Tần suất hoàn thành bài học theo khung giờ.</p>
            </div>
            <div className="p-1 bg-slate-50 rounded-2xl flex gap-1">
              <button className="px-4 py-2 bg-white shadow-sm rounded-xl text-xs font-black">24H</button>
              <button className="px-4 py-2 text-slate-400 text-xs font-black">7D</button>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={400}>
              <BarChart data={data?.hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="url(#colorValue)" radius={[15, 15, 0, 0]} />
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-emerald-600 p-10 rounded-[48px] text-white shadow-2xl shadow-emerald-600/30 group hover:-translate-y-2 transition-all duration-500">
          <Activity size={40} className="mb-6 opacity-80" />
          <h4 className="text-lg font-black uppercase tracking-widest mb-1 opacity-80">Retention Rate</h4>
          <p className="text-emerald-100 font-bold text-sm mb-6">Tỷ lệ học tập trong 7 ngày</p>
          <div className="text-5xl font-black">{data?.kpis?.retentionRate?.toFixed(1)}%</div>
        </div>
        
        <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl shadow-slate-900/30 group hover:-translate-y-2 transition-all duration-500">
          <Clock size={40} className="mb-6 text-blue-400 opacity-80" />
          <h4 className="text-lg font-black uppercase tracking-widest mb-1 opacity-80">Học tập TB</h4>
          <p className="text-slate-400 font-bold text-sm mb-6">Số phút học mỗi ngày</p>
          <div className="text-5xl font-black text-blue-400">{data?.kpis?.avgStudyTime} m</div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-100 premium-shadow group hover:-translate-y-2 transition-all duration-500">
          <TrendingUp size={40} className="mb-6 text-emerald-500" />
          <h4 className="text-lg font-black uppercase tracking-widest mb-1 text-slate-400">Tổng XP Hệ thống</h4>
          <p className="text-slate-500 font-bold text-sm mb-6">Điểm số tích lũy toàn sàn</p>
          <div className="flex items-end gap-3">
            <div className="text-5xl font-black text-slate-900">{formatXp(data?.kpis?.totalXp)}</div>
            <div className="text-emerald-500 font-black text-sm mb-2">{data?.kpis?.xpGrowth}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
