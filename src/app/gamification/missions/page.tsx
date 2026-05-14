'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Target, Calendar, Flame, Star, Gift } from 'lucide-react';

import api from "@/lib/api";

export default function MissionsPage() {
  const [missions, setMissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<any>(null);

  useEffect(() => {
    fetchMissions();
  }, [activeTab]);

  const fetchMissions = async () => {
    try {
      // Mapping tabs to internal types
      const typeMap: any = {
        'Hàng ngày': 'DAILY',
        'Hàng tuần': 'WEEKLY',
        'Sự kiện': 'SPECIAL',
        'Tất cả': ''
      };
      const res = await api.get(`/missions${typeMap[activeTab] ? `?type=${typeMap[activeTab]}` : ''}`);
      setMissions(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      if (editingMission) {
        await api.patch(`/missions/${editingMission._id}`, data);
      } else {
        await api.post('/missions', data);
      }

      fetchMissions();
      setIsModalOpen(false);
      setEditingMission(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa nhiệm vụ này?')) {
      try {
        await api.delete(`/missions/${id}`);
        fetchMissions();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'DAILY': return { bg: 'bg-blue-50', text: 'text-blue-600', label: 'DAILY' };
      case 'WEEKLY': return { bg: 'bg-purple-50', text: 'text-purple-600', label: 'WEEKLY' };
      case 'STREAK': return { bg: 'bg-orange-50', text: 'text-orange-600', label: 'STREAK' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-600', label: 'EVENT' };
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Hệ thống Gamification</h1>
          <p className="text-slate-500 mt-1 font-medium">Quản lý nhiệm vụ, huy hiệu và vật phẩm để thúc đẩy động lực học tập.</p>
        </div>
        <button 
          onClick={() => {
            setEditingMission(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
        >
          <Plus size={20} />
          Tạo nhiệm vụ mới
        </button>
      </div>

      <div className="flex gap-4 mb-10">
        {['Tất cả', 'Hàng ngày', 'Hàng tuần', 'Sự kiện'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === tab 
                ? 'bg-[#0f172a] text-white shadow-xl' 
                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {missions.map((mission) => {
          const style = getTypeStyle(mission.type);
          return (
            <div key={mission._id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all group relative overflow-hidden">
              <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-2xl font-black text-[10px] tracking-widest ${style.bg} ${style.text}`}>
                {style.label}
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${style.bg}`}>
                  {mission.type === 'STREAK' ? <Flame size={24} className={style.text} /> : <Target size={24} className={style.text} />}
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">{mission.title}</h3>
              <p className="text-slate-400 font-medium text-sm mb-8">{mission.description}</p>
              
              <div className="bg-slate-50/80 rounded-2xl p-6 mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Phần thưởng</p>
                <div className="flex items-center gap-4">
                  {mission.xpReward > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star size={16} className="text-emerald-500 fill-emerald-500" />
                      <span className="text-sm font-black text-slate-700">{mission.xpReward} XP</span>
                    </div>
                  )}
                  {mission.gemReward > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-500">💎</span>
                      <span className="text-sm font-black text-slate-700">{mission.gemReward} Gems</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setEditingMission(mission);
                    setIsModalOpen(true);
                  }}
                  className="flex-1 bg-[#0f172a] text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                >
                  Chỉnh sửa
                </button>
                <button 
                  onClick={() => handleDelete(mission._id)}
                  className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-black text-slate-800 mb-8 uppercase tracking-tight">
              {editingMission ? 'Cập nhật nhiệm vụ' : 'Thiết lập nhiệm vụ mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tên nhiệm vụ</label>
                  <input 
                    name="title"
                    defaultValue={editingMission?.title}
                    required
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Ví dụ: Học giả chăm chỉ"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mô tả mục tiêu</label>
                  <input 
                    name="description"
                    defaultValue={editingMission?.description}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Hoàn thành 3 bài học bất kỳ..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Loại nhiệm vụ</label>
                  <select 
                    name="type"
                    defaultValue={editingMission?.type || 'DAILY'}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                  >
                    <option value="DAILY">Hàng ngày (Daily)</option>
                    <option value="WEEKLY">Hàng tuần (Weekly)</option>
                    <option value="STREAK">Chuỗi ngày (Streak)</option>
                    <option value="SPECIAL">Sự kiện (Event)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Điều kiện</label>
                  <select 
                    name="requirementType"
                    defaultValue={editingMission?.requirementType || 'LESSONS_COUNT'}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                  >
                    <option value="LESSONS_COUNT">Số bài học</option>
                    <option value="QUIZ_COUNT">Số câu trả lời đúng</option>
                    <option value="STREAK_COUNT">Số ngày liên tiếp</option>
                    <option value="XP_COUNT">Số XP đạt được</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Giá trị yêu cầu</label>
                  <input 
                    name="requirementValue"
                    type="number"
                    defaultValue={editingMission?.requirementValue || 1}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">XP</label>
                      <input name="xpReward" type="number" defaultValue={editingMission?.xpReward || 0} className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl font-bold" />
                   </div>
                   <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Gems</label>
                      <input name="gemReward" type="number" defaultValue={editingMission?.gemReward || 0} className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl font-bold" />
                   </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-10">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="flex-2 px-10 py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
                >
                  {editingMission ? 'Cập nhật ngay' : 'Kích hoạt nhiệm vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
