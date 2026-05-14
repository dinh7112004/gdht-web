'use client';

import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, Clock, AlertCircle, Search, 
  Filter, Download, ExternalLink, User, BookOpen 
} from 'lucide-react';
import api from '@/lib/api';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      // Fetch classes to derive recent student activity
      const res = await api.get('/classes');
      
      // Mocking submissions data based on class student activity
      // In a real scenario, this would be a dedicated /submissions endpoint
      const mockSubmissions = res.data.flatMap((cls: any) => 
        (cls.studentIds || []).map((student: any) => ({
          id: `${cls._id}-${student._id}`,
          studentName: student.fullName || "Học sinh ẩn danh",
          className: cls.name,
          lessonTitle: "Toán học và Ca dao", // Placeholder
          submittedAt: new Date().toISOString(),
          status: Math.random() > 0.3 ? 'GRADED' : 'PENDING',
          score: Math.floor(Math.random() * 5) + 6,
          feedback: "Bài làm tốt, cần chú ý hơn phần phân tích."
        }))
      ).slice(0, 15);

      setSubmissions(mockSubmissions);
    } catch (e) {
      console.error("Failed to fetch activity", e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'GRADED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="p-10 bg-[#f8fafc] min-h-screen">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Màn hình nộp bài</h1>
          <p className="text-slate-500 font-bold mt-2">Theo dõi và chấm điểm các bài tập Story Mode & Quiz</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-2 rounded-3xl premium-shadow border border-slate-50 flex items-center px-6 gap-3">
             <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                  </div>
                ))}
             </div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">24 bài nộp mới hôm nay</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Tổng bài nộp', value: '1,248', icon: BookOpen, color: 'text-blue-500' },
          { label: 'Chờ chấm điểm', value: '42', icon: Clock, color: 'text-amber-500' },
          { label: 'Đã hoàn thành', value: '1,196', icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Cần phản hồi', value: '10', icon: AlertCircle, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 premium-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-slate-50 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 premium-shadow overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm tên học sinh, lớp hoặc bài học..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
              <Filter size={20} />
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-emerald-500 transition-all">
              <Download size={18} />
              Xuất báo cáo
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Học sinh</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Lớp học</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Bài học</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black">
                        {sub.studentName[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{sub.studentName}</p>
                        <p className="text-[10px] font-bold text-slate-400">ID: STU-8829</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-black text-slate-600 border border-slate-200">
                      {sub.className}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-700 text-sm">{sub.lessonTitle}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(sub.status)}`}>
                      {sub.status === 'GRADED' ? 'Đã chấm điểm' : 'Đang chờ'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all">
                      <ExternalLink size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-50 flex justify-center">
           <button className="px-8 py-3 bg-slate-50 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all border border-slate-100">
             Xem thêm bài nộp
           </button>
        </div>
      </div>
    </div>
  );
}
