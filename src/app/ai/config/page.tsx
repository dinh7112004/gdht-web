'use client';

import React, { useState } from "react";
import { 
  Bot, Sparkles, Send, Bell, 
  MessageSquare, ShieldAlert, History,
  Save, Zap, Terminal, Code
} from "lucide-react";

export default function AIConfigPage() {
  const [systemPrompt, setSystemPrompt] = useState(
    "Bạn là Rồng con di sản, một trợ lý học tập thông minh giúp học sinh tiểu học khám phá vẻ đẹp của toán học thông qua các câu chuyện di sản Việt Nam..."
  );

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI & THÔNG BÁO (CONFIG)</h1>
          <p className="text-slate-500 font-medium">Cấu hình bộ não AI và trung tâm điều phối thông báo đẩy toàn hệ thống.</p>
        </div>
        <button className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2">
          <Save size={20} /> Lưu tất cả cấu hình
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI System Prompt Editor */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Bot className="text-emerald-500" /> System Prompt (Rồng Con AI)
            </h3>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              GPT-4o Model
            </span>
          </div>
          
          <div className="bg-slate-900 rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-2 text-slate-500 mb-4 border-b border-slate-800 pb-2">
              <Terminal size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Editor context</span>
            </div>
            <textarea 
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full h-64 bg-transparent border-none text-slate-300 font-mono text-sm leading-relaxed focus:ring-0 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Max Tokens</p>
              <input type="number" defaultValue={2000} className="bg-transparent border-none font-black text-xl text-slate-900 focus:ring-0 w-full" />
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Temperature</p>
              <input type="number" step="0.1" defaultValue={0.7} className="bg-transparent border-none font-black text-xl text-slate-900 focus:ring-0 w-full" />
            </div>
          </div>
        </div>

        {/* Push Notification Sidebar */}
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-6">
              <Bell className="text-blue-500" /> Thông báo nhanh
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Tiêu đề thông báo</label>
                <input type="text" placeholder="Học bài thôi nào!" className="w-full p-4 bg-slate-50 rounded-2xl border-none text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Nội dung</label>
                <textarea placeholder="Một ngày mới đã bắt đầu, rồng con đang đợi bạn..." className="w-full h-24 p-4 bg-slate-50 rounded-2xl border-none text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Nhóm đối tượng</label>
                <select className="w-full p-4 bg-slate-50 rounded-2xl border-none text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Tất cả học sinh</option>
                  <option>Học sinh đã offline 3 ngày</option>
                  <option>Giáo viên khối 5</option>
                </select>
              </div>
              <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                <Send size={18} /> Gửi ngay lập tức
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 mb-4">Lịch sử gửi thông báo</h4>
            <div className="space-y-3">
              {[
                { title: "Sự kiện Rồng Thiếu Nhi", time: "2 giờ trước" },
                { title: "Bài tập mới tuần 35", time: "Hôm qua" },
              ].map((notif, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="text-xs font-bold text-slate-700 truncate mr-2">{notif.title}</div>
                  <div className="text-[10px] text-slate-400 whitespace-nowrap">{notif.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Logs / Activity */}
      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-8">
          <History className="text-slate-400" /> Log Hội thoại AI (Gần đây)
        </h3>
        <div className="space-y-4">
          {[
            { user: "Minh Học Sinh", query: "Tính diện tích hình chữ nhật trong vườn hoa Diên Hồng?", response: "Để tính diện tích hình chữ nhật, bạn lấy chiều dài nhân chiều rộng...", time: "5 phút trước" },
            { user: "Cô Mai", query: "Tóm tắt kết quả lớp 5A tuần này?", response: "Dựa trên dữ liệu, lớp 5A có 85% học sinh hoàn thành bài tập...", time: "1 giờ trước" },
          ].map((log, idx) => (
            <div key={idx} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black text-slate-900 uppercase">{log.user}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{log.time}</span>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0" />
                  <p className="text-sm text-slate-600 font-medium italic">"{log.query}"</p>
                </div>
                <div className="flex gap-3">
                  <Bot size={24} className="text-emerald-500 flex-shrink-0" />
                  <p className="text-sm text-slate-800 font-bold">{log.response}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
