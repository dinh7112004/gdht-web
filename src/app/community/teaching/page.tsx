'use client';

import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, XCircle, Clock, Eye, 
  Search, Filter, ChevronRight, MoreHorizontal,
  MessageSquare, User, Calendar
} from 'lucide-react';
import api from '@/lib/api';

export default function TeachingModerationPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/posts?type=TEACHING_METHOD&status=${activeTab}`);
      setPosts(res.data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/posts/${id}/status`, { status });
      fetchPosts();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Duyệt <span className="text-emerald-600">Phương pháp dạy</span>
          </h1>
          <p className="text-slate-500 font-bold mt-1">Kiểm soát chất lượng nội dung từ Giáo viên & Phụ huynh</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === tab 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'PENDING' ? 'CHỜ DUYỆT' : tab === 'APPROVED' ? 'ĐÃ DUYỆT' : 'ĐÃ TỪ CHỐI'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/30">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm tiêu đề, tác giả..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={18} /> Lọc nâng cao
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-8 py-6">Nội dung bài viết</th>
                <th className="px-8 py-6">Tác giả</th>
                <th className="px-8 py-6">Thời gian</th>
                <th className="px-8 py-6">Chỉ số</th>
                <th className="px-8 py-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">
                    Không có bài viết nào trong danh sách này.
                  </td>
                </tr>
              ) : posts.map((post) => (
                <tr key={post._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 max-w-md">
                    <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{post.title}</h4>
                    <p className="text-slate-500 text-xs mt-1 line-clamp-2">{post.content}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xs">
                        {post.authorName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{post.authorName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Giáo viên</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                      <Calendar size={14} />
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                        <MessageSquare size={14} /> 0
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                        <Eye size={14} /> {post.views}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      {activeTab === 'PENDING' ? (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(post._id, 'REJECTED')}
                            className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <XCircle size={20} />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(post._id, 'APPROVED')}
                            className="p-2.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                          >
                            <CheckCircle size={20} />
                          </button>
                        </>
                      ) : (
                        <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                          <MoreHorizontal size={20} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
