'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen, 
  PenTool, Trophy, BarChart3, Bot, ChevronDown, 
  Settings, LogOut, Bell, ShieldCheck, Image as ImageIcon,
  Share2, MessageSquare
} from 'lucide-react';

const menuItems = [
  {
    title: "I. Tổng quan",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "II. Người dùng",
    icon: Users,
    subItems: [
      { name: "Danh sách tài khoản", path: "/users" },
      { name: "Phân quyền (RBAC)", path: "/users/rbac" },
    ]
  },
  {
    title: "III. Lớp học",
    icon: GraduationCap,
    subItems: [
      { name: "Danh sách lớp học", path: "/classes" },
      { name: "Màn hình nộp bài", path: "/classes/submissions" },
    ]
  },
  {
    title: "IV. Nội dung (CMS)",
    icon: BookOpen,
    subItems: [
      { name: "Danh mục di sản", path: "/cms/categories" },
      { name: "Quản lý Bài học", path: "/cms/lessons" },
      { name: "Quản lý Môn học", path: "/cms/subjects" },
      { name: "Ngân hàng câu hỏi", path: "/cms/quizzes" },
    ]
  },
  {
    title: "V. Luyện tập (LMS)",
    icon: PenTool,
    subItems: [
      { name: "Ngân hàng câu hỏi", path: "/lms/quiz" },
      { name: "Soạn lời giải chi tiết", path: "/lms/explanations" },
      { name: "Quy tắc điểm thưởng", path: "/lms/rules" },
    ]
  },
  {
    title: "VI. Gamification",
    icon: Trophy,
    subItems: [
      { name: "Quản lý Nhiệm vụ", path: "/gamification/missions" },
      { name: "Quản lý Huy hiệu", path: "/gamification/achievements" },
      { name: "Cửa hàng vật phẩm", path: "/gamification/items" },
      { name: "Luật Bảng xếp hạng", path: "/gamification/leaderboard" },
    ]
  },
  {
    title: "VII. Báo cáo",
    icon: BarChart3,
    subItems: [
      { name: "Tiến độ & Radar", path: "/reports/progress" },
      { name: "Gắn kết & Retention", path: "/reports/engagement" },
      { name: "Thống kê bài giảng", path: "/reports/lessons" },
      { name: "Thống kê AI", path: "/reports/ai" },
    ]
  },
  {
    title: "VIII. Cộng đồng & Chia sẻ",
    icon: Share2,
    subItems: [
      { name: "Duyệt Phương pháp dạy", path: "/community/teaching" },
      { name: "Duyệt Cách học hay", path: "/community/learning" },
      { name: "Quản lý Bình luận", path: "/community/comments" },
      { name: "Báo cáo nội dung", path: "/community/reports" },
    ]
  },
  {
    title: "IX. AI & Thông báo",
    icon: Bot,
    subItems: [
      { name: "Kiến thức AI (KB)", path: "/ai/knowledge" },
      { name: "System Prompt", path: "/ai/config" },
      { name: "Trung tâm Thông báo", path: "/notifications" },
      { name: "Log Hội thoại AI", path: "/ai/logs" },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  return (
    <aside className="w-72 bg-[#FFFDF0] text-slate-500 h-screen flex flex-col border-r border-[#FEF9C3] relative z-20">
      <div className="p-8 border-b border-[#FEF9C3]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/10">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tighter">GDDS MASTER</h1>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em]">Authority Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-8 px-6 custom-scrollbar">
        {menuItems.map((item) => (
          <div key={item.title} className="mb-4">
            {item.subItems ? (
              <>
                <button 
                  onClick={() => toggleMenu(item.title)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${
                    openMenus.includes(item.title) ? 'bg-[#FFFBEB] text-emerald-700' : 'hover:bg-[#FFFBEB]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={openMenus.includes(item.title) ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'} />
                    <span className="text-sm font-bold tracking-tight">{item.title}</span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${openMenus.includes(item.title) ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>
                {openMenus.includes(item.title) && (
                  <div className="mt-2 ml-4 pl-4 border-l-2 border-[#FEF9C3] space-y-2 animate-fade-in">
                    {item.subItems.map(sub => (
                      <Link 
                        key={sub.path} 
                        href={sub.path}
                        className={`block px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                          pathname === sub.path 
                            ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
                            : 'text-slate-500 hover:text-emerald-600 hover:bg-[#FFFBEB]'
                        }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link 
                href={item.path!} 
                className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 ${
                  pathname === item.path 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/10' 
                    : 'hover:bg-[#FFFBEB]'
                }`}
              >
                <item.icon size={20} />
                <span className="text-sm font-bold tracking-tight">{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-[#FEF9C3] space-y-3">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 hover:text-emerald-600 hover:bg-[#FFFBEB] rounded-2xl transition-all">
          <Settings size={18} />
          <span>Cài đặt hệ thống</span>
        </Link>
        <button 
          onClick={() => {
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
