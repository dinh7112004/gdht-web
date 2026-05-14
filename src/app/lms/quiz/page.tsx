'use client';

import React, { useEffect, useState } from "react";
import { 
  PenTool, Plus, Search, Filter, 
  MoreVertical, Edit2, Trash2, CheckCircle2,
  HelpCircle, BarChart, Book, ArrowRight,
  Sparkles, ShieldQuestion
} from "lucide-react";
import api from "@/lib/api";

export default function LMSQuizBankPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/quizzes"); // Assuming this endpoint exists or will be created
      setQuizzes(res.data);
    } catch (error) {
      console.error("Failed to fetch quizzes", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">NGÂN HÀNG CÂU HỎI (LMS)</h1>
          <p className="text-slate-500 font-medium">Quản lý kho câu hỏi toán học gắn với ngữ cảnh di sản văn hóa.</p>
        </div>
        <button className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2">
          <Plus size={20} /> Thêm câu hỏi mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <ShieldQuestion size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Tổng câu hỏi</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">456</h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <CheckCircle2 size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Độ chính xác TB</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">72.4%</h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 text-amber-600 mb-2">
            <Sparkles size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">XP đã phát</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">12.5k</h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 text-purple-600 mb-2">
            <Book size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Số bài nộp</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">3,120</h3>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm câu hỏi hoặc từ khóa..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
          />
        </div>
        <button className="px-6 py-3 bg-slate-50 text-slate-500 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Filter size={16} /> Lọc độ khó
        </button>
      </div>

      {/* Quiz List */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <th className="px-8 py-5">Câu hỏi</th>
              <th className="px-8 py-5">Chủ đề</th>
              <th className="px-8 py-5">Độ khó</th>
              <th className="px-8 py-5">Thống kê</th>
              <th className="px-8 py-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { text: "Câu ca dao gợi ý phép tính nào?", category: "Ca dao", difficulty: "Dễ", solved: 1240, rate: "92%" },
              { text: "Tính khoảng cách từ thành Thăng Long...", category: "Danh nhân", difficulty: "Trung bình", solved: 850, rate: "65%" },
              { text: "Tỷ lệ vàng trong kiến trúc đình làng...", category: "Lễ hội", difficulty: "Khó", solved: 320, rate: "42%" },
            ].map((q, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6 max-w-md">
                  <p className="font-bold text-slate-900 text-sm line-clamp-2">{q.text}</p>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">
                    {q.category}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className={`text-xs font-bold ${
                    q.difficulty === 'Khó' ? 'text-red-500' : 
                    q.difficulty === 'Dễ' ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    {q.difficulty}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Đúng</p>
                      <p className="text-xs font-black text-slate-700">{q.rate}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Lượt làm</p>
                      <p className="text-xs font-black text-slate-700">{q.solved}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                      <Edit2 size={18} />
                    </button>
                    <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
