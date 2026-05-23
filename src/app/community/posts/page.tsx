'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle, XCircle, Trash2, Eye,
  Search, MessageSquare, Heart, Calendar,
  BookOpen, Lightbulb, Users, ChevronDown, X,
} from 'lucide-react';
import api from '@/lib/api';

const TYPE_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  TEACHING_METHOD: {
    label: 'Phương pháp dạy',
    color: 'bg-blue-50 text-blue-600',
    icon: <BookOpen size={12} />,
  },
  LEARNING_TIP: {
    label: 'Cách học hay',
    color: 'bg-purple-50 text-purple-600',
    icon: <Lightbulb size={12} />,
  },
  DISCUSSION: {
    label: 'Thảo luận',
    color: 'bg-amber-50 text-amber-600',
    icon: <Users size={12} />,
  },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-50 text-yellow-600' },
  APPROVED: { label: 'Đã duyệt', color: 'bg-emerald-50 text-emerald-600' },
  REJECTED: { label: 'Từ chối', color: 'bg-rose-50 text-rose-600' },
};

interface LikeUser {
  _id: string;
  name: string;
  avatar?: string;
}

interface Comment {
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  authorName: string;
  type: string;
  status: string;
  tags: string[];
  likes: LikeUser[];
  comments: Comment[];
  views: number;
  createdAt: string;
}

type DetailTab = 'likes' | 'comments';

export default function PostsManagementPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [detailPost, setDetailPost] = useState<Post | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('likes');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        if (statusFilter !== 'ALL') params.status = statusFilter;
        if (typeFilter !== 'ALL') params.type = typeFilter;
        const res = await api.get('/posts', { params });
        if (!cancelled) setPosts(res.data as Post[]);
      } catch (err) {
        console.error('Failed to fetch posts', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [statusFilter, typeFilter, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/posts/${id}/status`, { status });
      refresh();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/posts/${id}`);
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  const openDetail = (post: Post, tab: DetailTab) => {
    setDetailPost(post);
    setDetailTab(tab);
  };

  const filtered = posts.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.authorName?.toLowerCase().includes(q) ||
      p.content?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Quản lý <span className="text-emerald-600">Bài viết</span>
          </h1>
          <p className="text-slate-500 font-bold mt-1">
            Toàn bộ bài viết cộng đồng — duyệt, từ chối hoặc xoá
          </p>
        </div>

        {/* Status tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                statusFilter === s
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {s === 'ALL' ? 'TẤT CẢ' : s === 'PENDING' ? 'CHỜ DUYỆT' : s === 'APPROVED' ? 'ĐÃ DUYỆT' : 'TỪ CHỐI'}
            </button>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-100 flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center bg-slate-50/30">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tiêu đề, tác giả, nội dung..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Type filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="ALL">Tất cả loại</option>
              <option value="TEACHING_METHOD">Phương pháp dạy</option>
              <option value="LEARNING_TIP">Cách học hay</option>
              <option value="DISCUSSION">Thảo luận</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-auto">
            {filtered.length} bài viết
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-8 py-6">Bài viết</th>
                <th className="px-8 py-6">Tác giả</th>
                <th className="px-8 py-6">Loại</th>
                <th className="px-8 py-6">Trạng thái</th>
                <th className="px-8 py-6">Chỉ số</th>
                <th className="px-8 py-6">Ngày đăng</th>
                <th className="px-8 py-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-slate-400 font-bold">
                    Không có bài viết nào.
                  </td>
                </tr>
              ) : (
                filtered.map((post) => {
                  const typeInfo = TYPE_LABELS[post.type] ?? { label: post.type, color: 'bg-slate-50 text-slate-500', icon: null };
                  const statusInfo = STATUS_LABELS[post.status] ?? { label: post.status, color: 'bg-slate-50 text-slate-500' };
                  return (
                    <tr key={post._id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Title + content */}
                      <td className="px-8 py-6 max-w-xs">
                        <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                          {post.title}
                        </h4>
                        <p className="text-slate-400 text-xs mt-1 line-clamp-2">{post.content}</p>
                        {post.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Author */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xs shrink-0">
                            {post.authorName?.[0] ?? '?'}
                          </div>
                          <span className="font-bold text-slate-800 text-sm">{post.authorName}</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black ${typeInfo.color}`}>
                          {typeInfo.icon}
                          {typeInfo.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[11px] font-black ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Metrics — clickable */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openDetail(post, 'likes')}
                            className="flex items-center gap-1 text-slate-400 text-xs font-bold hover:text-rose-500 transition-colors"
                            title="Xem ai đã thích"
                          >
                            <Heart size={13} /> {post.likes?.length ?? 0}
                          </button>
                          <button
                            onClick={() => openDetail(post, 'comments')}
                            className="flex items-center gap-1 text-slate-400 text-xs font-bold hover:text-blue-500 transition-colors"
                            title="Xem bình luận"
                          >
                            <MessageSquare size={13} /> {post.comments?.length ?? 0}
                          </button>
                          <span className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                            <Eye size={13} /> {post.views ?? 0}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                          <Calendar size={13} />
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {post.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(post._id, 'REJECTED')}
                                title="Từ chối"
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                              >
                                <XCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(post._id, 'APPROVED')}
                                title="Duyệt"
                                className="p-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl transition-all shadow-md shadow-emerald-500/20"
                              >
                                <CheckCircle size={18} />
                              </button>
                            </>
                          )}
                          {post.status === 'APPROVED' && (
                            <button
                              onClick={() => handleUpdateStatus(post._id, 'REJECTED')}
                              title="Thu hồi duyệt"
                              className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                          {post.status === 'REJECTED' && (
                            <button
                              onClick={() => handleUpdateStatus(post._id, 'APPROVED')}
                              title="Duyệt lại"
                              className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmDelete(post._id)}
                            title="Xoá"
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal — likes & comments */}
      {detailPost && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 line-clamp-1">{detailPost.title}</h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">bởi {detailPost.authorName}</p>
              </div>
              <button
                onClick={() => setDetailPost(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 shrink-0 ml-4"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-6">
              <button
                onClick={() => setDetailTab('likes')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition-all ${
                  detailTab === 'likes'
                    ? 'border-rose-400 text-rose-500'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Heart size={14} /> Lượt thích ({detailPost.likes?.length ?? 0})
              </button>
              <button
                onClick={() => setDetailTab('comments')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition-all ${
                  detailTab === 'comments'
                    ? 'border-blue-400 text-blue-500'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <MessageSquare size={14} /> Bình luận ({detailPost.comments?.length ?? 0})
              </button>
              <span className="flex items-center gap-1.5 px-4 py-3 text-xs font-black text-slate-300 ml-auto">
                <Eye size={14} /> {detailPost.views ?? 0} lượt xem
              </span>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {detailTab === 'likes' && (
                detailPost.likes?.length === 0 ? (
                  <p className="text-center text-slate-400 font-bold py-8">Chưa có ai thích bài viết này.</p>
                ) : (
                  detailPost.likes?.map((user) => (
                    <div key={user._id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 font-black text-xs shrink-0">
                        {user.name?.[0] ?? '?'}
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{user.name}</span>
                      <Heart size={13} className="text-rose-400 ml-auto" />
                    </div>
                  ))
                )
              )}

              {detailTab === 'comments' && (
                detailPost.comments?.length === 0 ? (
                  <p className="text-center text-slate-400 font-bold py-8">Chưa có bình luận nào.</p>
                ) : (
                  detailPost.comments?.map((comment, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 font-black text-[10px] shrink-0">
                            {comment.authorName?.[0] ?? '?'}
                          </div>
                          <span className="font-black text-slate-800 text-xs">{comment.authorName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm pl-9">{comment.content}</p>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-black text-slate-900 mb-2">Xác nhận xoá</h3>
            <p className="text-slate-500 text-sm mb-6">
              Bài viết sẽ bị xoá vĩnh viễn và không thể khôi phục.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Huỷ
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-3 rounded-2xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
              >
                Xoá bài viết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}