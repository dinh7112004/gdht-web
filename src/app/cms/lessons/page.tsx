'use client';

import React, { useEffect, useState } from "react";
import { 
  Plus, ImageIcon, Star, Edit3, Trash2,
  CheckCircle2, Clock, BookOpen, Filter, Search,
  Zap, Save, X
} from "lucide-react";
import api from "@/lib/api";

export default function CMSLessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    imageUrl: '',
    content: '',
    xpReward: 100,
    estimatedMinutes: 15,
    difficulty: 'Dễ',
    subject: 'Toán học',
    isPublic: true,
    targetClassIds: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lessonsRes, categoriesRes, classesRes] = await Promise.all([
        api.get("/lessons"),
        api.get("/categories"),
        api.get("/classes/my-classes")
      ]);
      setLessons(lessonsRes.data);
      setCategories(categoriesRes.data);
      setClasses(classesRes.data || []);
      if (categoriesRes.data.length > 0) {
        setFormData(prev => ({ ...prev, category: categoriesRes.data[0].name }));
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Anh có chắc muốn xóa bài học này?")) {
      try {
        await api.delete(`/lessons/${id}`); // Assuming this endpoint exists
        fetchData();
      } catch (error) {
        alert("Lỗi khi xóa bài học");
      }
    }
  };

  const openEditModal = (lesson: any) => {
    setEditingId(lesson._id);
    setFormData({
      title: lesson.title,
      description: lesson.description,
      category: lesson.category,
      imageUrl: lesson.imageUrl || '',
      content: lesson.content || '',
      xpReward: lesson.xpReward,
      estimatedMinutes: lesson.estimatedMinutes,
      difficulty: lesson.difficulty,
      subject: lesson.subject || 'Toán học',
      isPublic: lesson.isPublic ?? true,
      targetClassIds: lesson.targetClassIds || []
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/lessons/${editingId}`, formData);
      } else {
        await api.post("/lessons", formData);
      }
      closeModal();
      fetchData();
    } catch (error) {
      alert("Lỗi khi lưu bài học");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: categories[0]?.name || '',
      imageUrl: '',
      content: '',
      xpReward: 100,
      estimatedMinutes: 15,
      difficulty: 'Dễ',
      subject: 'Toán học',
      isPublic: true,
      targetClassIds: []
    });
  };

  const toggleClassSelection = (classId: string) => {
    setFormData(prev => {
      const exists = prev.targetClassIds.includes(classId);
      if (exists) {
        return { ...prev, targetClassIds: prev.targetClassIds.filter(id => id !== classId) };
      } else {
        return { ...prev, targetClassIds: [...prev.targetClassIds, classId] };
      }
    });
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">QUẢN LÝ BÀI HỌC</h1>
          <p className="text-slate-500 font-medium">Biên tập nội dung kiến thức di sản và toán học cho App.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Thêm bài học mới
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm tiêu đề bài học..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
          />
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none">
            <option>Tất cả chủ đề</option>
            {categories.map(c => <option key={c._id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Lessons Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <th className="px-8 py-5">Bài học</th>
              <th className="px-8 py-5">Danh mục</th>
              <th className="px-8 py-5">Phần thưởng</th>
              <th className="px-8 py-5">Thời gian</th>
              <th className="px-8 py-5">Trạng thái</th>
              <th className="px-8 py-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="p-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></td></tr>
            ) : (
              lessons.map((lesson) => (
                <tr key={lesson._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100">
                        {lesson.imageUrl ? <img src={lesson.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={24} /></div>}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm line-clamp-1">{lesson.title}</p>
                        <p className="text-xs text-slate-400 font-medium line-clamp-1">{lesson.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">
                      {lesson.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5 text-amber-500 font-black text-sm">
                      <Zap size={14} fill="currentColor" /> {lesson.xpReward} XP
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                    {lesson.estimatedMinutes} phút
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase">
                        <CheckCircle2 size={12} /> Đã xuất bản
                      </span>
                      {lesson.isPublic ? (
                        <span className="w-fit px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-lg">Công khai</span>
                      ) : (
                        <span className="w-fit px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded-lg">Riêng tư ({lesson.targetClassIds?.length || 0} lớp)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(lesson)} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(lesson._id)} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900">{editingId ? 'Cập nhật bài học' : 'Thêm bài học mới'}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tiêu đề bài học</label>
                <input 
                  type="text" required value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold text-slate-900"
                  placeholder="Ví dụ: Tính toán trong vườn hoa Diên Hồng"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Chủ đề bài học</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold text-slate-900"
                >
                  {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Độ khó</label>
                <select 
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold text-slate-900"
                >
                  <option>Dễ</option>
                  <option>Trung bình</option>
                  <option>Khó</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Môn học</label>
                <select 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold text-slate-900"
                >
                  <option value="Toán học">Toán học</option>
                  <option value="Ngữ văn">Ngữ văn</option>
                  <option value="Lịch sử">Lịch sử</option>
                  <option value="Địa lý">Địa lý</option>
                  <option value="Khoa học">Khoa học</option>
                  <option value="Ngoại ngữ">Ngoại ngữ</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mô tả bài học (Dành cho danh sách)</label>
                <textarea 
                  required value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-medium text-slate-900 h-20"
                  placeholder="Nhập giới thiệu ngắn gọn..."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nội dung bài học / Cốt truyện (Story)</label>
                <textarea 
                  required value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-medium text-slate-900 h-40"
                  placeholder="Nhập nội dung dẫn dắt học sinh vào bài học..."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Link ảnh minh họa (URL)</label>
                <input 
                  type="text" value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value.replace(/\s/g, '')})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold text-slate-900"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Điểm thưởng (XP)</label>
                <input 
                  type="number" required value={formData.xpReward || 0}
                  onChange={(e) => setFormData({...formData, xpReward: parseInt(e.target.value) || 0})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold text-slate-900"
                />
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl cursor-pointer border border-indigo-100 mb-6">
                  <input 
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-sm font-black text-indigo-900">Công khai toàn trường</span>
                    <span className="text-xs font-medium text-indigo-600/70">Mọi học sinh đều có thể học bài này</span>
                  </div>
                </label>

                {!formData.isPublic && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-end mb-3">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Chọn lớp được phép học ({formData.targetClassIds.length})</label>
                      <button 
                        type="button"
                        onClick={() => {
                          const allIds = classes.map(c => c._id);
                          setFormData({...formData, targetClassIds: formData.targetClassIds.length === classes.length ? [] : allIds});
                        }}
                        className="text-[10px] font-black text-indigo-600 uppercase tracking-tight hover:underline"
                      >
                        {formData.targetClassIds.length === classes.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả lớp'}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-3 bg-slate-50 rounded-[30px] border-2 border-dashed border-slate-200">
                      {classes.map(cls => (
                        <label key={cls._id} className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 ${formData.targetClassIds.includes(cls._id) ? 'bg-white border-indigo-500 shadow-md' : 'bg-white/50 border-transparent opacity-60'}`}>
                          <input 
                            type="checkbox" 
                            className="hidden"
                            checked={formData.targetClassIds.includes(cls._id)}
                            onChange={() => toggleClassSelection(cls._id)}
                          />
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.targetClassIds.includes(cls._id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                            {formData.targetClassIds.includes(cls._id) && <CheckCircle2 size={14} className="text-white" />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-black ${formData.targetClassIds.includes(cls._id) ? 'text-indigo-900' : 'text-slate-400'}`}>{cls.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{cls.studentIds?.length || 0} học sinh</span>
                          </div>
                        </label>
                      ))}
                      {classes.length === 0 && (
                        <div className="col-span-2 py-6 text-center space-y-2">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Bạn chưa có lớp học nào!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Thời gian ước tính (phút)</label>
                <input 
                  type="number" required value={formData.estimatedMinutes || 0}
                  onChange={(e) => setFormData({...formData, estimatedMinutes: parseInt(e.target.value) || 0})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold text-slate-900"
                />
              </div>

              <div className="col-span-2 flex gap-3 pt-6">
                <button type="button" onClick={closeModal} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                  <Save size={18} /> {editingId ? 'Cập nhật bài học' : 'Xuất bản bài học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
