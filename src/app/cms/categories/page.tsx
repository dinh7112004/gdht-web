'use client';

import React, { useEffect, useState } from "react";
import { 
  Plus, ImageIcon, Star, Edit3, Trash2,
  CheckCircle2, XCircle, AlertCircle
} from "lucide-react";
import api from "@/lib/api";

export default function CMSCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    imageUrl: '', 
    isFeatured: false,
    isPublic: true,
    subject: 'Toán học',
    targetClassIds: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, classRes] = await Promise.all([
        api.get("/categories"),
        api.get("/classes") // Lấy tất cả các lớp để gán chủ đề
      ]);
      setCategories(catRes.data);
      setClasses(classRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const handleToggleFeatured = async (cat: any) => {
    try {
      await api.put(`/categories/${cat._id}`, { isFeatured: !cat.isFeatured });
      fetchCategories();
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái nổi bật");
    }
  };

  const openEditModal = (cat: any) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name,
      description: cat.description,
      imageUrl: cat.imageUrl || '',
      isFeatured: cat.isFeatured,
      isPublic: cat.isPublic ?? true,
      subject: cat.subject || 'Toán học',
      targetClassIds: cat.targetClassIds || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Anh có chắc chắn muốn xóa chủ đề này không? Hành động này không thể hoàn tác.")) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (error) {
        alert("Lỗi khi xóa chủ đề");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData);
      } else {
        await api.post("/categories", formData);
      }
      closeModal();
      fetchCategories();
    } catch (error) {
      alert("Lỗi khi lưu chủ đề");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', description: '', imageUrl: '', isFeatured: false, isPublic: true, subject: 'Toán học', targetClassIds: [] });
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">QUẢN LÝ CHỦ ĐỀ NỔI BẬT</h1>
          <p className="text-slate-500 font-medium">Đồng bộ các danh mục di sản lên màn hình chính của App Mobile.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Thêm chủ đề mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading ? (
          <div className="col-span-full p-20 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div></div>
        ) : (
          categories.map((cat) => (
            <div key={cat._id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
              <div className="h-48 w-full bg-slate-100 relative">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon size={48} />
                  </div>
                )}
                <button 
                  onClick={() => handleToggleFeatured(cat)}
                  className={`absolute top-4 right-4 p-2 rounded-xl border transition-all ${
                    cat.isFeatured 
                    ? "bg-amber-500 text-white border-amber-400 shadow-lg" 
                    : "bg-white/80 text-slate-400 border-white/50 backdrop-blur-md"
                  }`}
                >
                  <Star size={20} fill={cat.isFeatured ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-black text-slate-900 mb-1">{cat.name}</h3>
                <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2 h-8">{cat.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {cat.isPublic ? (
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg">Công khai</span>
                  ) : (
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg">Riêng tư ({cat.targetClassIds?.length || 0} lớp)</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    {cat.isFeatured ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 uppercase tracking-widest">
                        <CheckCircle2 size={12} /> Nổi bật
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <XCircle size={12} /> Thường
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => openEditModal(cat)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat._id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-slate-900 mb-6">{editingId ? 'Cập nhật chủ đề' : 'Thêm chủ đề mới'}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tên chủ đề</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300"
                    placeholder="Ví dụ: Lễ hội truyền thống"
                  />
                </div>
                <div className="col-span-2">
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
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mô tả ngắn</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-medium text-slate-900 placeholder:text-slate-300 h-24"
                  placeholder="Nhập mô tả về chủ đề này..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl cursor-pointer border border-indigo-100">
                    <input 
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                      className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="block text-sm font-black text-indigo-900">Công khai toàn trường</span>
                      <span className="text-xs font-medium text-indigo-600/70">Mọi học sinh đều có thể xem chủ đề này</span>
                    </div>
                  </label>
                </div>

                {!formData.isPublic && (
                  <div className="col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-end mb-3">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Chọn lớp được phép xem ({formData.targetClassIds.length})</label>
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
                        <div className="col-span-2 py-10 text-center space-y-2">
                          <AlertCircle className="mx-auto text-slate-300" size={32} />
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Bạn chưa có lớp học nào để gán bài!</p>
                          <a href="/cms/classes" className="inline-block text-[10px] font-black text-indigo-600 underline">Tạo lớp ngay</a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Link ảnh (URL)</label>
                <input 
                  type="text" 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value.replace(/\s/g, '')})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest">Hủy</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20">
                  {editingId ? 'Cập nhật' : 'Lưu chủ đề'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
