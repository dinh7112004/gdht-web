'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, Edit2, Trash2, Shield, Award, Star, 
  Search, Filter, Sparkles, X, Check, Image as ImageIcon,
  BookOpen, Users, Zap
} from 'lucide-react';
import api from '@/lib/api';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    level: 1,
    category: 'LEARNING',
    xpRequirement: 0,
    code: ''
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/achievements');
      setAchievements(res.data);
    } catch (e) {
      console.error("Failed to fetch achievements", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (achievement: any = null) => {
    if (achievement) {
      setEditingAchievement(achievement);
      setFormData({
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        level: achievement.level || 1,
        category: achievement.category || 'LEARNING',
        xpRequirement: achievement.xpRequirement || 0,
        code: achievement.code || ''
      });
    } else {
      setEditingAchievement(null);
      setFormData({
        title: '',
        description: '',
        icon: '',
        level: 1,
        category: 'LEARNING',
        xpRequirement: 0,
        code: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAchievement) {
        await api.patch(`/achievements/${editingAchievement._id}`, formData);
      } else {
        await api.post('/achievements', formData);
      }
      fetchAchievements();
      setIsModalOpen(false);
    } catch (e) {
      console.error("Failed to save achievement", e);
      alert("Không thể lưu thành tích. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa thành tích này?')) {
      try {
        await api.delete(`/achievements/${id}`);
        fetchAchievements();
      } catch (e) {
        console.error("Failed to delete achievement", e);
      }
    }
  };

  const filteredAchievements = achievements.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-screen">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-md shadow-emerald-600/10">
                <Award size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quản lý Thành tích</h1>
            </div>
            <p className="text-slate-500 font-medium">Kiến tạo những danh hiệu cao quý cho hành trình học tập.</p>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl transition-all active:scale-95 shadow-md shadow-emerald-600/10 font-bold"
          >
            <Plus size={20} />
            Tạo thành tích mới
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Tìm kiếm thành tích..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
            />
          </div>
          <button className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-600 hover:text-slate-800 transition-colors active:scale-95">
            <Filter size={20} />
          </button>
        </div>

        {/* Grid Section */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAchievements.map((item) => (
              <div key={item._id} className="group bg-slate-50 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all duration-500 border border-slate-100 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center relative ${
                      item.category === 'SPECIAL' ? 'bg-purple-50 border border-purple-100' : 
                      item.category === 'SOCIAL' ? 'bg-blue-50 border border-blue-100' : 'bg-amber-50 border border-amber-100'
                    }`}>
                      {item.icon ? (
                        <img src={item.icon} alt={item.title} className="w-12 h-12 object-contain" />
                      ) : (
                        <Shield size={32} className={item.category === 'SPECIAL' ? 'text-purple-600' : 'text-amber-600'} />
                      )}
                      <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[10px] font-black text-white ${
                        item.category === 'SPECIAL' ? 'bg-purple-600' : 
                        item.category === 'SOCIAL' ? 'bg-blue-600' : 'bg-amber-600'
                      }`}>
                        CẤP {item.level}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="p-3 bg-white text-slate-600 border border-slate-100 hover:bg-emerald-600 hover:text-white rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)}
                        className="p-3 bg-white text-slate-600 border border-slate-100 hover:bg-rose-600 hover:text-white rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-full">
                      {item.category === 'LEARNING' ? <BookOpen size={14} className="text-emerald-600" /> : 
                       item.category === 'SOCIAL' ? <Users size={14} className="text-blue-600" /> : 
                       <Sparkles size={14} className="text-purple-600" />}
                      <span className="text-xs font-black text-slate-600 uppercase tracking-wider">
                        {item.category === 'LEARNING' ? 'Học tập' : item.category === 'SOCIAL' ? 'Cộng đồng' : 'Đặc biệt'}
                      </span>
                    </div>
                    {item.xpRequirement > 0 && (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-full">
                        <Zap size={14} className="text-amber-600" />
                        <span className="text-xs font-black text-amber-600">{item.xpRequirement} XP</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-white rounded-full opacity-50"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-[100] animate-in fade-in duration-300">
          <div className="bg-white border border-slate-100 rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 bg-slate-50 p-3 rounded-2xl text-slate-400 hover:text-slate-800 transition-all border border-slate-100"
            >
              <X size={20} />
            </button>
            <div className="p-6 sm:p-10">
              <div className="mb-10">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                  {editingAchievement ? 'Sửa thành tích' : 'Tạo thành tích mới'}
                </h2>
                <p className="text-slate-500 font-medium mt-1">Điền thông tin chi tiết cho huy hiệu này.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên thành tích</label>
                    <input 
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ví dụ: Thợ săn kiến thức"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã định danh (Code)</label>
                    <input 
                      value={formData.code}
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ví dụ: HUNTER_LEVEL_1"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả nhiệm vụ</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-600 font-medium focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px]"
                    placeholder="Mô tả cách học sinh đạt được huy hiệu này..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Icon URL (Link ảnh)</label>
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        required
                        value={formData.icon}
                        onChange={e => setFormData({...formData, icon: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                      {formData.icon ? <img src={formData.icon} className="w-10 h-10 object-contain" /> : <ImageIcon className="text-slate-300" />}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cấp độ</label>
                    <input 
                      type="number"
                      value={formData.level}
                      onChange={e => setFormData({...formData, level: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Danh mục</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
                    >
                      <option value="LEARNING">Học tập</option>
                      <option value="SOCIAL">Cộng đồng</option>
                      <option value="SPECIAL">Đặc biệt</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Yêu cầu XP</label>
                    <input 
                      type="number"
                      value={formData.xpRequirement}
                      onChange={e => setFormData({...formData, xpRequirement: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-8">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-slate-50 border border-slate-100 text-slate-600 font-bold py-5 rounded-3xl hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-emerald-600 text-white font-bold py-5 rounded-3xl hover:bg-emerald-700 transition-all active:scale-95 shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    {editingAchievement ? 'Cập nhật ngay' : 'Tạo thành tích'}
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
