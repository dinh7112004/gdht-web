'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, Zap, Star, Flame, Trophy, 
  Save, RefreshCw, HelpCircle, ShieldCheck, 
  Sparkles, CheckCircle2, DollarSign, Gift, Heart,
  Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight, Check, Play, Square
} from 'lucide-react';
import api from '@/lib/api';

interface CustomRule {
  id: string;
  name: string;
  description: string;
  rewardType: 'XP' | 'GEMS';
  rewardValue: number;
  isActive: boolean;
  condition: string;
}

export default function RewardRulesPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Rule categories matching the app's gamification config
  const [systemRules, setSystemRules] = useState({
    baseLessonXp: 50,
    baseLessonGems: 10,
    perfectScoreXpBonus: 100,
    perfectScoreGemBonus: 20,
    dailyStreakBaseXp: 15,
    dailyStreakGemBonus: 5,
    streakFreezeGemCost: 150,
    shareMethodXpReward: 75,
    receiveLikeXpReward: 5,
    baseLevelXpThreshold: 1000,
    levelUpMultiplier: 1.2,
  });

  // Dynamic Custom Rules State
  const [customRules, setCustomRules] = useState<CustomRule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CustomRule | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rewardType: 'XP' as 'XP' | 'GEMS',
    rewardValue: 50,
    condition: '',
    isActive: true
  });

  useEffect(() => {
    // Load system rules
    const savedSys = localStorage.getItem('gdds_reward_rules');
    if (savedSys) {
      try { setSystemRules(JSON.parse(savedSys)); } catch (e) {}
    }

    // Load custom rules
    const savedCustom = localStorage.getItem('gdds_custom_reward_rules');
    if (savedCustom) {
      try {
        setCustomRules(JSON.parse(savedCustom));
      } catch (e) {}
    } else {
      // Seed initial custom rules to make screen beautiful
      const initialRules: CustomRule[] = [
        {
          id: 'rule-1',
          name: 'Chào mừng tân thủ',
          description: 'Học sinh đăng ký tài khoản lần đầu trên ứng dụng',
          rewardType: 'GEMS',
          rewardValue: 100,
          isActive: true,
          condition: 'Đăng ký tài khoản mới thành công'
        },
        {
          id: 'rule-2',
          name: 'Vượt ải đêm khuya',
          description: 'Hoàn thành bài tập trắc nghiệm trong khoảng 22:00 - 05:00',
          rewardType: 'XP',
          rewardValue: 30,
          isActive: true,
          condition: 'Thời gian làm bài từ 22:00 đến 05:00 sáng'
        },
        {
          id: 'rule-3',
          name: 'Chiến binh cuối tuần',
          description: 'Hoàn thành từ 3 bài học trở lên vào thứ Bảy và Chủ Nhật',
          rewardType: 'XP',
          rewardValue: 80,
          isActive: false,
          condition: 'Làm tối thiểu 3 bài học vào cuối tuần'
        }
      ];
      setCustomRules(initialRules);
      localStorage.setItem('gdds_custom_reward_rules', JSON.stringify(initialRules));
    }
  }, []);

  const handleSystemChange = (field: keyof typeof systemRules, value: number) => {
    setSystemRules(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSystem = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      localStorage.setItem('gdds_reward_rules', JSON.stringify(systemRules));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert("Lỗi khi lưu quy tắc hệ thống");
    } finally {
      setLoading(false);
    }
  };

  // Custom Rules CRUD Actions
  const handleOpenModal = (rule: CustomRule | null = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        description: rule.description,
        rewardType: rule.rewardType,
        rewardValue: rule.rewardValue,
        condition: rule.condition,
        isActive: rule.isActive
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        description: '',
        rewardType: 'XP',
        rewardValue: 50,
        condition: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedRules = [...customRules];

    if (editingRule) {
      // Edit existing
      updatedRules = updatedRules.map(r => 
        r.id === editingRule.id 
          ? { ...r, ...formData }
          : r
      );
    } else {
      // Add new
      const newRule: CustomRule = {
        id: `rule-${Date.now()}`,
        ...formData
      };
      updatedRules.push(newRule);
    }

    setCustomRules(updatedRules);
    localStorage.setItem('gdds_custom_reward_rules', JSON.stringify(updatedRules));
    setIsModalOpen(false);
    setEditingRule(null);
  };

  const handleDeleteRule = (id: string) => {
    if (window.confirm("Anh có chắc muốn xóa quy tắc điểm thưởng tùy chỉnh này?")) {
      const updatedRules = customRules.filter(r => r.id !== id);
      setCustomRules(updatedRules);
      localStorage.setItem('gdds_custom_reward_rules', JSON.stringify(updatedRules));
    }
  };

  const handleToggleStatus = (id: string) => {
    const updatedRules = customRules.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    );
    setCustomRules(updatedRules);
    localStorage.setItem('gdds_custom_reward_rules', JSON.stringify(updatedRules));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-white min-h-screen animate-fade-in space-y-8 lg:space-y-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
            Quy tắc điểm thưởng
          </h1>
          <p className="text-slate-500 font-bold mt-1">
            Thiết lập các hệ số cộng thưởng cơ bản và tạo thêm các quy tắc tùy chỉnh linh hoạt cho học sinh.
          </p>
        </div>
        <div className="flex gap-3">
          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-3 rounded-2xl text-xs font-black animate-bounce">
              <CheckCircle2 size={16} /> ĐÃ LƯU THÀNH CÔNG
            </div>
          )}
          <button 
            onClick={handleSaveSystem}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-600/10 transition-all flex items-center gap-2.5 active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
            Lưu tham số hệ thống
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: System Parameters Config */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between ml-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">I. Hệ số điểm thưởng mặc định</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Học tập */}
            <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Star size={24} className="fill-emerald-500 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm">Học tập & Trắc nghiệm</h4>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">XP bài học</label>
                  <input 
                    type="number" 
                    value={systemRules.baseLessonXp} 
                    onChange={e => handleSystemChange('baseLessonXp', parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-sm font-black text-slate-700 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Gems bài học</label>
                  <input 
                    type="number" 
                    value={systemRules.baseLessonGems} 
                    onChange={e => handleSystemChange('baseLessonGems', parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-sm font-black text-slate-700 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Thưởng tuyệt đối (XP)</label>
                  <input 
                    type="number" 
                    value={systemRules.perfectScoreXpBonus} 
                    onChange={e => handleSystemChange('perfectScoreXpBonus', parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-sm font-black text-slate-700 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Streak */}
            <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
                  <Flame size={24} className="fill-rose-500 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm">Chuỗi học tập (Streak)</h4>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">XP Streak / Ngày</label>
                  <input 
                    type="number" 
                    value={systemRules.dailyStreakBaseXp} 
                    onChange={e => handleSystemChange('dailyStreakBaseXp', parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-sm font-black text-slate-700 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Gems Streak / Ngày</label>
                  <input 
                    type="number" 
                    value={systemRules.dailyStreakGemBonus} 
                    onChange={e => handleSystemChange('dailyStreakGemBonus', parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-sm font-black text-slate-700 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Giá Streak Freeze (Gems)</label>
                  <input 
                    type="number" 
                    value={systemRules.streakFreezeGemCost} 
                    onChange={e => handleSystemChange('streakFreezeGemCost', parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-sm font-black text-slate-700 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Custom Rules list (Dynamic Add/Edit/Delete) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between ml-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">II. Quy tắc tùy chỉnh</h3>
            <button 
              onClick={() => handleOpenModal(null)}
              className="text-xs font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1 hover:underline"
            >
              <Plus size={14} /> Thêm mới
            </button>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {customRules.map((rule) => (
              <div 
                key={rule.id} 
                className={`p-6 bg-slate-50 rounded-[24px] border transition-all ${
                  rule.isActive ? 'border-slate-100 shadow-sm' : 'border-dashed border-slate-200 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">{rule.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{rule.condition}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(rule)}
                      className="p-2 bg-white text-slate-500 hover:text-emerald-600 rounded-lg border border-slate-100 transition-all"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 bg-white text-slate-500 hover:text-rose-600 rounded-lg border border-slate-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <p className="text-slate-500 text-[11px] font-bold leading-relaxed mb-4">{rule.description}</p>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                    rule.rewardType === 'GEMS' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>
                    +{rule.rewardValue} {rule.rewardType}
                  </span>
                  
                  <button 
                    onClick={() => handleToggleStatus(rule.id)}
                    className="flex items-center gap-1.5"
                  >
                    {rule.isActive ? (
                      <>
                        <span className="text-[9px] font-black text-emerald-600 tracking-widest uppercase">ĐANG BẬT</span>
                        <ToggleRight className="text-emerald-600" size={24} />
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">ĐANG TẮT</span>
                        <ToggleLeft className="text-slate-400" size={24} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Dynamic Rule Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white border border-slate-100 rounded-[40px] p-6 sm:p-10 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-400 hover:text-slate-800 rounded-2xl border border-slate-100 transition-all"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase mb-2">
              {editingRule ? 'Sửa quy tắc điểm thưởng' : 'Thêm quy tắc mới'}
            </h3>
            <p className="text-xs text-slate-500 font-bold mb-8">Tự do cấu hình phần thưởng cho các hành động của học sinh.</p>

            <form onSubmit={handleSaveCustomRule} className="space-y-6">
              
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Tên quy tắc</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Học tập đêm khuya"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Điều kiện kích hoạt</label>
                <input 
                  type="text" 
                  required
                  value={formData.condition}
                  onChange={e => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="Ví dụ: Làm bài tập sau 22:00"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Mô tả hiển thị</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả cụ thể tác dụng để học sinh dễ hiểu..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-600 font-bold focus:ring-2 focus:ring-emerald-500 h-24 resize-none outline-none"
                />
              </div>

              {/* Reward Type and Value */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Loại phần thưởng</label>
                  <select 
                    value={formData.rewardType}
                    onChange={e => setFormData({ ...formData, rewardType: e.target.value as 'XP' | 'GEMS' })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none outline-none"
                  >
                    <option value="XP">Kinh nghiệm (XP)</option>
                    <option value="GEMS">Kim cương (GEMS)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Giá trị thưởng</label>
                  <input 
                    type="number" 
                    required
                    value={formData.rewardValue}
                    onChange={e => setFormData({ ...formData, rewardValue: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} /> {editingRule ? 'Lưu thay đổi' : 'Tạo quy tắc mới'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
