'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Plus, Search, Filter, 
  Edit2, Trash2, Diamond, Zap, 
  Sparkles, Package, Check, X,
  Image as ImageIcon
} from 'lucide-react';
import api from '@/lib/api';

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'BOOST',
    imageUrl: '',
    price: 0,
    currency: 'GEMS',
    color: '#3b82f6',
    isAvailable: true,
    code: ''
  });

  const supportedFunctions = [
    { code: '', label: 'Không có (Vật phẩm trang trí/thông thường)' },
    { code: 'RENAME_CARD', label: 'Thẻ đổi tên' },
    { code: 'STREAK_FREEZE', label: 'Đóng băng chuỗi ngày (Streak Freeze)' },
    { code: 'DOUBLE_XP', label: 'Nhân đôi XP trong 30 phút' },
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/items/admin');
      setItems(res.data);
    } catch (e) {
      console.error("Failed to fetch items", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        category: item.category,
        imageUrl: item.imageUrl,
        price: item.price,
        currency: item.currency || 'GEMS',
        color: item.color || '#3b82f6',
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
        code: item.code || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        category: 'BOOST',
        imageUrl: '',
        price: 0,
        currency: 'GEMS',
        color: '#3b82f6',
        isAvailable: true,
        code: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/items/${editingItem._id}`, formData);
      } else {
        await api.post('/items', formData);
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (e) {
      console.error("Failed to save item", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa vật phẩm này?')) {
      try {
        await api.delete(`/items/${id}`);
        fetchItems();
      } catch (e) {
        console.error("Failed to delete item", e);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-10 animate-fade-in bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Quản lý Vật phẩm</h1>
          <p className="text-slate-500 font-bold mt-2">Thiết lập các vật phẩm bổ trợ, trang trí và avatar cho cửa hàng trên App.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 text-white px-8 py-4 rounded-[24px] font-black shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 transition-all flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus size={20} /> THÊM VẬT PHẨM MỚI
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item._id} className="bg-slate-50 rounded-[40px] border border-slate-100 p-8 shadow-sm group relative overflow-hidden transition-all hover:-translate-y-2">
              <div 
                className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl pointer-events-none"
                style={{ backgroundColor: item.color || '#3b82f6' }}
              />
              
              <div className="flex justify-between items-start mb-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  item.category === 'BOOST' ? 'bg-blue-50 text-blue-600' :
                  item.category === 'DECORATION' ? 'bg-purple-50 text-purple-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  {item.category === 'DECORATION' ? 'KHUNG ẢNH' : item.category}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleOpenModal(item)} className="p-2 bg-white text-slate-600 border border-slate-100 hover:bg-emerald-600 hover:text-white rounded-xl transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="p-2 bg-white text-slate-600 border border-slate-100 hover:bg-rose-600 hover:text-white rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center mb-8">
                <div 
                  className="w-32 h-32 rounded-[32px] flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 border border-slate-100"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-contain drop-shadow-md" />
                  ) : (
                    <Package size={48} style={{ color: item.color || '#3b82f6' }} />
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-800 text-center leading-tight mb-2">{item.name}</h3>
                <p className="text-slate-400 font-bold text-xs text-center line-clamp-2 h-8">{item.description}</p>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {item.currency === 'GEMS' ? <Diamond size={18} className="text-purple-500" /> : <Zap size={18} className="text-amber-500" />}
                  <span className="text-xl font-black text-slate-800">{item.price.toLocaleString()}</span>
                </div>
                <span className={`text-[10px] font-black ${item.isAvailable ? 'text-emerald-600' : 'text-slate-455'}`}>
                  {item.isAvailable ? 'ĐANG BÁN' : 'TẠM NGƯNG'}
                </span>
              </div>
            </div>
          ))}
          {items.length === 0 && (
             <div className="col-span-full py-20 text-center bg-slate-50 rounded-[48px] border border-dashed border-slate-100">
                <Package size={64} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">Chưa có vật phẩm nào được tạo.</p>
             </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[48px] border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-400 hover:text-slate-800 rounded-2xl border border-slate-100 transition-all"
            >
              <X size={20} />
            </button>
            <div className="p-6 sm:p-10">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
                  {editingItem ? 'Cập nhật vật phẩm' : 'Tạo vật phẩm mới'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên vật phẩm</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ví dụ: Mũ Rồng Xanh"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Danh mục</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer appearance-none"
                    >
                      <option value="BOOST">Vật phẩm bổ trợ (Boost)</option>
                      <option value="DECORATION">Trang trí (Khung ảnh)</option>
                      <option value="AVATAR">Ảnh đại diện (Avatar)</option>
                      <option value="FUNCTION">Chức năng hệ thống</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chức năng hệ thống (Nếu có)</label>
                    <select 
                      value={formData.code}
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer appearance-none"
                    >
                      {supportedFunctions.map(fn => (
                        <option key={fn.code} value={fn.code}>{fn.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả ngắn</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-600 font-bold focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                    placeholder="Công dụng của vật phẩm này..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Giá bán</label>
                    <input 
                      type="number" 
                      required
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Loại tiền tệ</label>
                    <div className="flex gap-4">
                      {['GEMS', 'XP'].map(cur => (
                        <button
                          key={cur}
                          type="button"
                          onClick={() => setFormData({...formData, currency: cur})}
                          className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all border ${
                            formData.currency === cur ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-white'
                          }`}
                        >
                          {cur}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link ảnh (URL)</label>
                    <input 
                      type="text" 
                      value={formData.imageUrl}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Màu chủ đạo (Hex)</label>
                    <input 
                      type="text" 
                      value={formData.color}
                      onChange={e => setFormData({...formData, color: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 py-2">
                   <input 
                     type="checkbox" 
                     id="isAvailable"
                     checked={formData.isAvailable}
                     onChange={e => setFormData({...formData, isAvailable: e.target.checked})}
                     className="w-6 h-6 rounded-lg text-emerald-600 focus:ring-emerald-500 border-slate-200"
                   />
                   <label htmlFor="isAvailable" className="text-sm font-bold text-slate-600">Đang mở bán công khai</label>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-4 rounded-[20px] font-black text-slate-400 hover:text-slate-800 transition-all"
                  >
                    HỦY BỎ
                  </button>
                  <button 
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 rounded-[20px] font-black shadow-md shadow-emerald-600/10 active:scale-95 transition-all"
                  >
                    {editingItem ? 'CẬP NHẬT' : 'TẠO NGAY'}
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
