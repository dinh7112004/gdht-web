'use client';

import React, { useState } from 'react';
import { 
  Users, CheckCircle, XCircle, Clock, 
  FileText, ShieldCheck, Mail, Phone,
  Search, Filter, ChevronRight, Eye,
  Download, AlertCircle, Activity
} from 'lucide-react';

const pendingTeachers = [
  {
    id: "TEA-2024-001",
    name: "Trần Thị Minh",
    subject: "Ngữ văn",
    email: "minh.tt@gmail.com",
    experience: "5 năm",
    status: "PENDING",
    submittedAt: "10/05/2024",
    documents: ["CV_TranThiMinh.pdf", "BangDaiHoc.jpg"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Minh"
  },
  {
    id: "TEA-2024-002",
    name: "Lê Văn Tùng",
    subject: "Lịch sử",
    email: "tung.lv@hotmail.com",
    experience: "3 năm",
    status: "PENDING",
    submittedAt: "11/05/2024",
    documents: ["CV_LeVanTung.pdf"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tung"
  },
  {
    id: "TEA-2024-003",
    name: "Nguyễn Bích Ngọc",
    subject: "Văn hóa Việt Nam",
    email: "ngoc.nb@gmail.com",
    experience: "8 năm",
    status: "REVIEWING",
    submittedAt: "09/05/2024",
    documents: ["CV_Ngoc.pdf", "Certificate_VN.pdf"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ngoc"
  }
];

export default function TeacherApprovalPage() {
  const [teachers, setTeachers] = useState(pendingTeachers);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      {/* Page Header */}
      <div className="px-10 py-4 flex justify-between items-center bg-white/40 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span>Người dùng</span>
          <span className="text-slate-200">/</span>
          <span className="text-slate-900">Duyệt hồ sơ Giáo viên</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm theo tên, email..." 
              className="pl-11 pr-6 py-2 bg-slate-100/50 border-none rounded-xl text-xs font-bold w-64"
            />
          </div>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
            Lịch sử duyệt
          </button>
        </div>
      </div>

      <div className="p-10 max-w-[1600px] mx-auto animate-fade-in">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main List Table */}
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Duyệt hồ sơ giáo viên</h1>
                <p className="text-slate-500 font-bold mt-1">Đang có {teachers.length} hồ sơ chờ xử lý</p>
              </div>
              <div className="flex gap-2">
                <button className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                  <Filter size={18} className="text-slate-500" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 premium-shadow overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                    <th className="px-8 py-6">Ứng viên</th>
                    <th className="px-8 py-6">Chuyên môn</th>
                    <th className="px-8 py-6">Kinh nghiệm</th>
                    <th className="px-8 py-6">Ngày gửi</th>
                    <th className="px-8 py-6">Trạng thái</th>
                    <th className="px-8 py-6 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {teachers.map((teacher) => (
                    <tr 
                      key={teacher.id} 
                      onClick={() => setSelectedTeacher(teacher)}
                      className={`hover:bg-slate-50/50 transition-all cursor-pointer group ${selectedTeacher?.id === teacher.id ? 'bg-emerald-50/30' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                            <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm">{teacher.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{teacher.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          {teacher.subject}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-bold text-sm text-slate-600">{teacher.experience}</td>
                      <td className="px-8 py-6 text-xs font-bold text-slate-400">{teacher.submittedAt}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          {teacher.status === 'PENDING' ? (
                            <Clock size={14} className="text-amber-500" />
                          ) : (
                            <Activity size={14} className="text-blue-500 animate-pulse" />
                          )}
                          <span className={`text-[10px] font-black uppercase tracking-widest ${teacher.status === 'PENDING' ? 'text-amber-600' : 'text-blue-600'}`}>
                            {teacher.status === 'PENDING' ? 'Chờ duyệt' : 'Đang xem xét'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <ChevronRight size={18} className={`inline transition-transform ${selectedTeacher?.id === teacher.id ? 'translate-x-2 text-emerald-500' : 'text-slate-300'}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Panel: Detail Review */}
          <div className="lg:w-96 space-y-8">
            {selectedTeacher ? (
              <div className="bg-white p-8 rounded-[48px] border border-slate-100 premium-shadow sticky top-28 animate-slide-up">
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter">Chi tiết hồ sơ</h3>
                  <button onClick={() => setSelectedTeacher(null)} className="text-slate-300 hover:text-slate-900"><XCircle size={24} /></button>
                </div>

                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-24 h-24 rounded-[32px] overflow-hidden mb-4 border-4 border-slate-50 shadow-lg">
                    <img src={selectedTeacher.avatar} alt={selectedTeacher.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight">{selectedTeacher.name}</h4>
                  <p className="text-emerald-500 font-bold text-xs uppercase tracking-widest mt-1">{selectedTeacher.id}</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chuyên môn</p>
                    <p className="font-bold text-slate-900">{selectedTeacher.subject}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kinh nghiệm</p>
                    <p className="font-bold text-slate-900">{selectedTeacher.experience} giảng dạy</p>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FileText size={14} /> Hồ sơ đính kèm ({selectedTeacher.documents.length})
                    </p>
                    <div className="space-y-2">
                      {selectedTeacher.documents.map((doc: string) => (
                        <div key={doc} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl group hover:border-emerald-500 transition-all cursor-pointer">
                          <span className="text-[10px] font-bold text-slate-600 truncate max-w-[180px]">{doc}</span>
                          <Download size={14} className="text-slate-400 group-hover:text-emerald-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-10">
                  <button className="flex flex-col items-center justify-center p-4 bg-rose-50 text-rose-600 rounded-[24px] hover:bg-rose-100 transition-all border border-rose-100 group">
                    <XCircle size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Từ chối</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 bg-emerald-500 text-white rounded-[24px] hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 group">
                    <CheckCircle size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Phê duyệt</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-10 rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center h-[600px] sticky top-28">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 mb-6 shadow-sm">
                  <ShieldCheck size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-400 tracking-tight">Chưa chọn hồ sơ</h3>
                <p className="text-slate-300 text-xs font-bold mt-2 leading-relaxed">Vui lòng chọn một giáo viên từ danh sách bên trái để xem chi tiết hồ sơ và duyệt.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
