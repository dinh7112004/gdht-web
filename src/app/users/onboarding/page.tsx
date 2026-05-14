'use client';

import React, { useState } from 'react';
import {
  Play, Plus, GripVertical, Settings,
  Eye, Trash2, Smartphone, Monitor,
  Info, CheckCircle2, Layout, Sparkles,
  ArrowRight, Image as ImageIcon, AlertCircle
} from 'lucide-react';

const initialSteps = [
  {
    id: 1,
    title: "Chào mừng đến với Heritage Math",
    description: "Giới thiệu tổng quan về nền tảng học tập di sản văn hóa.",
    type: "STUDENT",
    media: "intro_video.mp4",
    status: "ACTIVE",
    order: 1
  },
  {
    id: 2,
    title: "Khám phá bản đồ Di sản",
    description: "Hướng dẫn cách sử dụng bản đồ 3D để tìm kiếm bài học.",
    type: "STUDENT",
    media: "map_tutorial.jpg",
    status: "ACTIVE",
    order: 2
  },
  {
    id: 3,
    title: "Hệ thống Gamification",
    description: "Giải thích về cách kiếm XP, Gems và đổi quà.",
    type: "STUDENT",
    media: "rewards_info.png",
    status: "DRAFT",
    order: 3
  },
  {
    id: 4,
    title: "Công cụ cho Giáo viên",
    description: "Hướng dẫn các tính năng dành riêng cho người hướng dẫn.",
    type: "TEACHER",
    media: "teacher_tools.mp4",
    status: "ACTIVE",
    order: 1
  }
];

export default function OnboardingPage() {
  const [steps, setSteps] = useState(initialSteps);
  const [selectedType, setSelectedType] = useState('STUDENT');

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      {/* Page Header */}
      <div className="px-10 py-4 flex justify-between items-center bg-white/40 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span>Người dùng</span>
          <span className="text-slate-200">/</span>
          <span className="text-slate-900">Quản lý Onboarding</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
            <Plus size={16} /> Thêm bước mới
          </button>
        </div>
      </div>

      <div className="p-10 max-w-[1400px] mx-auto animate-fade-in">

        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Thiết lập Onboarding</h1>
          <p className="text-slate-500 font-bold mt-2">Quản lý luồng trải nghiệm đầu tiên của người dùng khi tham gia ứng dụng.</p>
        </div>

        {/* User Type Selector */}
        <div className="flex bg-white p-2 rounded-3xl premium-shadow border border-slate-50 w-fit mb-10">
          {['STUDENT', 'TEACHER'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-8 py-3 rounded-2xl text-xs font-black transition-all ${selectedType === type
                  ? 'bg-[#0f172a] text-white shadow-xl'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              DÀNH CHO {type === 'STUDENT' ? 'HỌC SINH' : 'GIÁO VIÊN'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">

          {/* Draggable Steps List */}
          <div className="xl:col-span-2 space-y-4">
            {steps.filter(s => s.type === selectedType).sort((a, b) => a.order - b.order).map((step, idx) => (
              <div key={step.id} className="group bg-white p-6 rounded-[32px] border border-slate-100 premium-shadow hover:shadow-2xl hover:shadow-emerald-500/5 transition-all flex items-center gap-6">
                <div className="cursor-grab active:cursor-grabbing text-slate-200 hover:text-slate-400 transition-colors">
                  <GripVertical size={24} />
                </div>

                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-black text-lg">
                  {idx + 1}
                </div>

                <div className="flex-1">
                  <h3 className="font-black text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1 line-clamp-1">{step.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${step.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {step.status === 'ACTIVE' ? 'Đang chạy' : 'Bản nháp'}
                  </span>

                  <div className="h-8 w-[1px] bg-slate-100 mx-2" />

                  <button className="p-3 bg-slate-50 text-slate-400 hover:text-emerald-500 rounded-xl transition-all">
                    <Eye size={18} />
                  </button>
                  <button className="p-3 bg-slate-50 text-slate-400 hover:text-emerald-500 rounded-xl transition-all">
                    <Settings size={18} />
                  </button>
                  <button className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            <button className="w-full py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all group">
              <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-black uppercase tracking-widest">Thêm màn hình giới thiệu</span>
            </button>
          </div>

          {/* Device Preview Panel */}
          <div className="xl:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white p-8 rounded-[48px] border border-slate-100 premium-shadow">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter">Xem trước (Preview)</h3>
                  <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
                    <button className="p-2 bg-white shadow-sm rounded-lg text-slate-900"><Smartphone size={16} /></button>
                    <button className="p-2 text-slate-400 hover:text-slate-600"><Monitor size={16} /></button>
                  </div>
                </div>

                {/* Simulated Phone Screen */}
                <div className="relative mx-auto w-[280px] h-[580px] bg-[#0f172a] rounded-[40px] border-8 border-slate-900 shadow-2xl overflow-hidden group">
                  <div className="absolute top-0 w-full h-6 flex justify-center items-center">
                    <div className="w-16 h-4 bg-slate-900 rounded-b-xl" />
                  </div>

                  <div className="p-8 h-full flex flex-col">
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <div className="w-full aspect-square bg-slate-800 rounded-3xl mb-8 flex items-center justify-center overflow-hidden">
                        <ImageIcon size={48} className="text-slate-700 animate-pulse" />
                      </div>
                      <h4 className="text-xl font-black text-white leading-tight mb-3">Chào mừng bạn đến với Heritage Math!</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">Khám phá hành trình di sản đầy thú vị ngay hôm nay.</p>
                    </div>

                    <div className="space-y-4 mb-4">
                      <div className="flex justify-center gap-1.5">
                        <div className="w-8 h-1.5 bg-emerald-500 rounded-full" />
                        <div className="w-2 h-1.5 bg-slate-700 rounded-full" />
                        <div className="w-2 h-1.5 bg-slate-700 rounded-full" />
                      </div>
                      <button className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                        Bắt đầu ngay <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <AlertCircle size={20} className="text-amber-500 shrink-0" />
                  <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                    Mọi thay đổi về thứ tự hoặc nội dung sẽ được áp dụng ngay lập tức cho người dùng mới đăng ký lần đầu.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
