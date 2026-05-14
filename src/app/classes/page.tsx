'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, Search, Plus, Filter, MoreHorizontal, 
  ChevronRight, Calendar, BookOpen, GraduationCap,
  X, Check, AlertCircle, Edit3, Trash2
} from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showMenuId, setShowMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (e) {
      console.error("Failed to fetch classes", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/users/teachers');
      setTeachers(res.data);
    } catch (e) {
      console.error("Failed to fetch teachers", e);
    }
  };

  const openEditModal = (cls: any) => {
    setEditingId(cls._id);
    setIsModalOpen(true);
    setShowMenuId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lớp học này?")) {
      try {
        await api.delete(`/classes/${id}`);
        fetchClasses();
      } catch (error) {
        alert("Lỗi khi xóa lớp học");
      }
    }
    setShowMenuId(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      code: formData.get('code'),
      teacherId: formData.get('teacherId'),
    };

    try {
      if (editingId) {
        await api.put(`/classes/${editingId}`, data);
      } else {
        await api.post('/classes', data);
      }
      await fetchClasses();
      setIsModalOpen(false);
      setEditingId(null);
    } catch (e) {
      console.error("Failed to save class", e);
      alert("Lỗi khi lưu lớp học. Vui lòng kiểm tra lại dữ liệu.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.teacherId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentEditClass = classes.find(c => c._id === editingId);

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen" onClick={() => setShowMenuId(null)}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Quản lý Lớp học</h1>
          <p className="text-slate-500 font-bold mt-1">Tổng cộng {classes.length} lớp học đang hoạt động</p>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={22} />
          Tạo lớp học mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[32px] border border-slate-100 premium-shadow mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo tên lớp, mã lớp hoặc giáo viên..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all border border-slate-100">
          <Filter size={18} />
          Bộ lọc
        </button>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
          {filteredClasses.map((cls) => (
            <div key={cls._id} className="bg-white rounded-[40px] border border-slate-100 premium-shadow overflow-hidden group hover:-translate-y-2 transition-all duration-500 relative">
              {/* Card Header/Banner */}
              <div className="h-32 bg-gradient-to-br from-emerald-400 to-teal-500 p-6 relative">
                 <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 text-white font-black text-xs">
                   {cls.code}
                 </div>
                 <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-emerald-500 absolute -bottom-8 left-8 border-4 border-white transition-transform group-hover:scale-110">
                    <GraduationCap size={32} />
                 </div>
              </div>

              <div className="p-8 pt-12">
                <div className="flex justify-between items-start mb-2 relative">
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-500 transition-colors">{cls.name}</h3>
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenuId(showMenuId === cls._id ? null : cls._id);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {showMenuId === cls._id && (
                      <div className="absolute right-0 top-10 w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-10 overflow-hidden">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEditModal(cls); }}
                          className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors flex gap-2 items-center"
                        >
                          <Edit3 size={16} /> Sửa lớp
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(cls._id); }}
                          className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors flex gap-2 items-center"
                        >
                          <Trash2 size={16} /> Xóa lớp
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-slate-400 font-bold text-sm mb-6 flex items-center gap-2">
                  <Users size={16} />
                  GV: {cls.teacherId?.fullName || "Chưa xác định"}
                </p>

                {/* Progress Bar */}
                <div className="space-y-2 mb-8">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                    <span>Tiến độ chương trình</span>
                    <span className="text-emerald-500">{cls.progress || 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000" 
                      style={{ width: `${cls.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 group-hover:bg-white transition-colors">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Học sinh</p>
                    <p className="text-lg font-black text-slate-900">{cls.studentIds?.length || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 group-hover:bg-white transition-colors">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Bài giảng</p>
                    <p className="text-lg font-black text-slate-900">{cls.assignedLessons?.length || 0}</p>
                  </div>
                </div>

                <button 
                  onClick={() => router.push(`/classes/${cls._id}`)}
                  className="w-full py-4 bg-slate-900 text-white rounded-[24px] font-black flex items-center justify-center gap-2 group-hover:bg-emerald-500 transition-all shadow-lg hover:shadow-emerald-500/20"
                >
                  Chi tiết lớp học
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-fade-in" onClick={() => { setIsModalOpen(false); setEditingId(null); }}>
          <div className="bg-white w-full max-w-lg rounded-[48px] premium-shadow overflow-hidden relative animate-slide-up" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => { setIsModalOpen(false); setEditingId(null); }}
              className="absolute top-8 right-8 p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
            >
              <X size={24} />
            </button>

            <div className="p-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[20px] flex items-center justify-center">
                  <Plus size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{editingId ? 'Cập nhật lớp học' : 'Tạo lớp học mới'}</h2>
                  <p className="text-slate-400 font-bold text-sm">Thiết lập thông tin cơ bản cho lớp học di sản.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Tên lớp học</label>
                  <input 
                    name="name"
                    required
                    defaultValue={currentEditClass?.name}
                    placeholder="Ví dụ: Di sản văn hóa 11A"
                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-[24px] font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Mã định danh (Code)</label>
                  <input 
                    name="code"
                    required
                    defaultValue={currentEditClass?.code}
                    placeholder="Ví dụ: DSVH-11A"
                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-[24px] font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Giáo viên phụ trách</label>
                  <select 
                    name="teacherId"
                    required
                    defaultValue={currentEditClass?.teacherId?._id || currentEditClass?.teacherId}
                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-[24px] font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none"
                  >
                    <option value="">Chọn giáo viên...</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-6">
                  <button 
                    disabled={submitting}
                    className="w-full py-5 bg-[#0f172a] text-white rounded-[24px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-900/20 disabled:opacity-50"
                  >
                    {submitting ? 'Đang xử lý...' : (editingId ? 'Cập nhật lớp học' : 'Kích hoạt lớp học')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
