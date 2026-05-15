'use client';

import React, { useEffect, useState } from "react";
import { 
  Plus, Edit3, Trash2, BookOpen, Save, X
} from "lucide-react";
import api from "@/lib/api";

export default function CMSSubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '',
    order: 0
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/subjects");
      setSubjects(res.data);
    } catch (error) {
      console.error("Failed to fetch subjects", error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (sub: any) => {
    setEditingId(sub._id);
    setFormData({
      name: sub.name,
      description: sub.description || '',
      order: sub.order || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa môn học này không?")) {
      try {
        await api.delete(`/subjects/${id}`);
        fetchSubjects();
      } catch (error) {
        alert("Lỗi khi xóa môn học");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/subjects/${editingId}`, formData);
      } else {
        await api.post("/subjects", formData);
      }
      closeModal();
      fetchSubjects();
    } catch (error) {
      alert("Lỗi khi lưu môn học (Môn học có thể đã tồn tại)");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', description: '', order: 0 });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Quản lý Môn học</h1>
          <p className="text-slate-500 font-medium">Danh sách các môn học hiển thị trên toàn hệ thống (Web & Mobile).</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Thêm môn học mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full p-20 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
        ) : (
          subjects.map((sub) => (
            <div key={sub._id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <BookOpen size={24} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditModal(sub)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => handleDelete(sub._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">{sub.name}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Thứ tự: {sub.order}</p>
              <p className="text-sm text-slate-500 font-medium line-clamp-2">{sub.description || "Không có mô tả"}</p>
            </div>
          ))
        )}
        {subjects.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest">Chưa có môn học nào được tạo.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingId ? 'Cập nhật môn học' : 'Thêm môn học mới'}</h3>
              <button onClick={closeModal} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900 transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Tên môn học</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300"
                  placeholder="Ví dụ: Kỹ năng sống"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Thứ tự hiển thị</label>
                <input 
                  type="number" 
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Mô tả (Tùy chọn)</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-medium text-slate-900 h-24"
                  placeholder="Nhập mô tả về môn học này..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest">Hủy</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                  <Save size={18} /> {editingId ? 'Cập nhật' : 'Lưu môn học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
