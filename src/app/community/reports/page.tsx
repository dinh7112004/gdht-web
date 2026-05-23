'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle, Trash2, Search, ChevronDown,
  Calendar, Flag, X, AlertTriangle, Ban, Info,
  MessageSquare, Zap, Clock, ShieldCheck,
} from 'lucide-react';
import api from '@/lib/api';

const REASON_LABELS: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  SPAM: {
    label: 'Spam',
    color: 'text-orange-600',
    bg: 'bg-orange-50 border border-orange-100',
    icon: <Zap size={11} />,
  },
  INAPPROPRIATE: {
    label: 'Không phù hợp',
    color: 'text-rose-600',
    bg: 'bg-rose-50 border border-rose-100',
    icon: <Ban size={11} />,
  },
  MISINFORMATION: {
    label: 'Thông tin sai',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border border-amber-100',
    icon: <AlertTriangle size={11} />,
  },
  HARASSMENT: {
    label: 'Quấy rối',
    color: 'text-red-600',
    bg: 'bg-red-50 border border-red-100',
    icon: <MessageSquare size={11} />,
  },
  OTHER: {
    label: 'Khác',
    color: 'text-slate-500',
    bg: 'bg-slate-100 border border-slate-200',
    icon: <Info size={11} />,
  },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING: {
    label: 'Chờ xử lý',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border border-amber-200',
    dot: 'bg-amber-400',
  },
  RESOLVED: {
    label: 'Đã xử lý',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border border-emerald-200',
    dot: 'bg-emerald-400',
  },
  DISMISSED: {
    label: 'Bỏ qua',
    color: 'text-slate-500',
    bg: 'bg-slate-100 border border-slate-200',
    dot: 'bg-slate-400',
  },
};

interface ContentReport {
  _id: string;
  postId: string;
  postTitle: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function ContentReportsPage() {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reasonFilter, setReasonFilter] = useState('ALL');
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [detailReport, setDetailReport] = useState<ContentReport | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        if (statusFilter !== 'ALL') params.status = statusFilter;
        if (reasonFilter !== 'ALL') params.reason = reasonFilter;
        const res = await api.get('/content-reports', { params });
        if (!cancelled) setReports(res.data as ContentReport[]);
      } catch (err) {
        console.error('Failed to fetch reports', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [statusFilter, reasonFilter, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/content-reports/${id}/status`, { status });
      refresh();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/content-reports/${id}`);
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      console.error('Failed to delete report', err);
    }
  };

  const filtered = reports.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.postTitle?.toLowerCase().includes(q) ||
      r.reporterName?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q)
    );
  });

  const pendingCount = reports.filter((r) => r.status === 'PENDING').length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;
  const dismissedCount = reports.filter((r) => r.status === 'DISMISSED').length;

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Báo cáo <span className="text-rose-500">Nội dung</span>
          </h1>
          <p className="text-slate-500 font-bold mt-1">
            Xử lý các báo cáo vi phạm từ cộng đồng
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-black rounded-lg">
                {pendingCount} chờ xử lý
              </span>
            )}
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          {(['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                statusFilter === s
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {s === 'ALL' ? 'TẤT CẢ' : s === 'PENDING' ? 'CHỜ XỬ LÝ' : s === 'RESOLVED' ? 'ĐÃ XỬ LÝ' : 'BỎ QUA'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Chờ xử lý</span>
            <div className="w-9 h-9 bg-amber-50 rounded-2xl flex items-center justify-center">
              <Clock size={16} className="text-amber-500" />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-900">{pendingCount}</p>
          <p className="text-xs text-amber-600 font-bold mt-1">Cần xem xét</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Đã xử lý</span>
            <div className="w-9 h-9 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={16} className="text-emerald-500" />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-900">{resolvedCount}</p>
          <p className="text-xs text-emerald-600 font-bold mt-1">Hoàn thành</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Bỏ qua</span>
            <div className="w-9 h-9 bg-slate-100 rounded-2xl flex items-center justify-center">
              <X size={16} className="text-slate-400" />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-900">{dismissedCount}</p>
          <p className="text-xs text-slate-400 font-bold mt-1">Không vi phạm</p>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-8 border-b border-slate-100 flex flex-wrap gap-4 items-center bg-slate-50/30">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm bài viết, người báo cáo, mô tả..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="ALL">Tất cả lý do</option>
              <option value="SPAM">Spam</option>
              <option value="INAPPROPRIATE">Không phù hợp</option>
              <option value="MISINFORMATION">Thông tin sai</option>
              <option value="HARASSMENT">Quấy rối</option>
              <option value="OTHER">Khác</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-auto">
            {filtered.length} báo cáo
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-8 py-6">Bài viết bị báo cáo</th>
                <th className="px-8 py-6">Người báo cáo</th>
                <th className="px-8 py-6">Lý do</th>
                <th className="px-8 py-6">Trạng thái</th>
                <th className="px-8 py-6">Ngày báo cáo</th>
                <th className="px-8 py-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-rose-400 border-t-transparent" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Flag size={32} className="opacity-30" />
                      <p className="font-bold">Không có báo cáo nào.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((report) => {
                  const reasonInfo = REASON_LABELS[report.reason] ?? {
                    label: report.reason,
                    color: 'text-slate-500',
                    bg: 'bg-slate-100 border border-slate-200',
                    icon: null,
                  };
                  const statusInfo = STATUS_CONFIG[report.status] ?? {
                    label: report.status,
                    color: 'text-slate-500',
                    bg: 'bg-slate-100 border border-slate-200',
                    dot: 'bg-slate-400',
                  };
                  return (
                    <tr
                      key={report._id}
                      className={`hover:bg-slate-50/50 transition-colors group ${
                        report.status === 'PENDING' ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Post title */}
                      <td className="px-8 py-6 max-w-xs">
                        <button
                          onClick={() => setDetailReport(report)}
                          className="text-left group/title"
                        >
                          <h4 className="font-bold text-slate-900 group-hover/title:text-rose-500 transition-colors line-clamp-1">
                            {report.postTitle || '(Bài viết đã bị xoá)'}
                          </h4>
                          {report.description && (
                            <p className="text-slate-400 text-xs mt-1 line-clamp-1 italic">
                              &ldquo;{report.description}&rdquo;
                            </p>
                          )}
                        </button>
                      </td>

                      {/* Reporter */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 font-black text-xs shrink-0">
                            {report.reporterName?.[0] ?? '?'}
                          </div>
                          <span className="font-bold text-slate-800 text-sm">{report.reporterName}</span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black ${reasonInfo.bg} ${reasonInfo.color}`}>
                          {reasonInfo.icon}
                          {reasonInfo.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black ${statusInfo.bg} ${statusInfo.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                          <Calendar size={13} />
                          {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {report.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(report._id, 'DISMISSED')}
                                title="Bỏ qua"
                                className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                              >
                                <X size={16} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(report._id, 'RESOLVED')}
                                title="Đánh dấu đã xử lý"
                                className="p-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl transition-all shadow-md shadow-emerald-500/20"
                              >
                                <CheckCircle size={16} />
                              </button>
                            </>
                          )}
                          {report.status !== 'PENDING' && (
                            <button
                              onClick={() => handleUpdateStatus(report._id, 'PENDING')}
                              title="Đặt lại thành chờ xử lý"
                              className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                            >
                              <Flag size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmDelete(report._id)}
                            title="Xoá báo cáo"
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
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

      {/* Detail modal */}
      {detailReport && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setDetailReport(null)}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-start justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900">Chi tiết báo cáo</h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  {new Date(detailReport.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <button
                onClick={() => setDetailReport(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bài viết bị báo cáo</p>
                <p className="font-bold text-slate-900">{detailReport.postTitle || '(Bài viết đã bị xoá)'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Người báo cáo</p>
                  <p className="font-bold text-slate-800">{detailReport.reporterName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lý do</p>
                  {(() => {
                    const r = REASON_LABELS[detailReport.reason];
                    return r ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black ${r.bg} ${r.color}`}>
                        {r.icon}
                        {r.label}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-600">{detailReport.reason}</span>
                    );
                  })()}
                </div>
              </div>

              {detailReport.description && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mô tả thêm</p>
                  <p className="text-slate-600 text-sm bg-slate-50 rounded-2xl p-4 leading-relaxed">
                    {detailReport.description}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                {(() => {
                  const s = STATUS_CONFIG[detailReport.status];
                  return s ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black ${s.bg} ${s.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-600">{detailReport.status}</span>
                  );
                })()}
              </div>
            </div>

            {detailReport.status === 'PENDING' && (
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={() => {
                    handleUpdateStatus(detailReport._id, 'DISMISSED');
                    setDetailReport(null);
                  }}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Bỏ qua
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(detailReport._id, 'RESOLVED');
                    setDetailReport(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                  Đánh dấu đã xử lý
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}
        >
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-black text-slate-900 mb-2">Xoá báo cáo</h3>
            <p className="text-slate-500 text-sm mb-6">
              Báo cáo sẽ bị xoá vĩnh viễn. Thao tác này không thể hoàn tác.
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
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}