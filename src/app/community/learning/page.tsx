'use client';

import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, XCircle, Clock, Eye, 
  Search, Filter, ChevronRight, MoreHorizontal,
  MessageSquare, User, Calendar, Lightbulb
} from 'lucide-react';
import api from '@/lib/api';

export default function LearningModerationPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/posts?type=LEARNING_TIP&status=${activeTab}`);
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
    <div className="p-10 space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Duyệt <span className="text-blue-600">Cách học hay</span>
          </h1>
          <p className="text-slate-500 font-bold mt-1">Mẹo học tập và kinh nghiệm từ cộng đồng Học sinh</p>
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
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-blue-50/10">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm mẹo học tập..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-4">
             <div className="px-5 py-3 bg-blue-50 text-blue-600 rounded-2xl text-xs font-black flex items-center gap-2">
                <Lightbulb size={16} /> {posts.length} BÀI VIẾT
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-8 py-6">Mẹo học tập</th>
                <th className="px-8 py-6">Học sinh</th>
                <th className="px-8 py-6">Thời gian</th>
                <th className="px-8 py-6">Tương tác</th>
                <th className="px-8 py-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">
                    Không có mẹo học tập nào đang chờ.
                  </td>
                </tr>
              ) : posts.map((post) => (
                <tr key={post._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 max-w-md">
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{post.title}</h4>
                    <div className="flex gap-2 mt-2">
                       {post.tags?.map((tag: string) => (
                         <span key={tag} className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-md">#{tag}</span>
                       ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs border border-blue-100">
                        {post.authorName[0]}
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{post.authorName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-slate-500 text-xs font-bold uppercase">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                        <CheckCircle size={14} className="text-blue-500" /> {post.likes}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                        <MessageSquare size={14} /> 0
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      {activeTab === 'PENDING' ? (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(post._id, 'REJECTED')}
                            className="px-4 py-2 text-rose-500 text-xs font-black hover:bg-rose-50 rounded-xl transition-all"
                          >
                            TỪ CHỐI
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(post._id, 'APPROVED')}
                            className="px-6 py-2 bg-blue-600 text-white text-xs font-black hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                          >
                            DUYỆT
                          </button>
                        </>
                      ) : (
                        <button className="px-4 py-2 text-slate-400 text-xs font-black hover:bg-slate-100 rounded-xl transition-all">
                          CHI TIẾT
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
