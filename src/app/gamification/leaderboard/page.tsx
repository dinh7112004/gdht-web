'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Star, TrendingUp, Filter } from 'lucide-react';
import api from '@/lib/api';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [period, setPeriod] = useState<'WEEK' | 'MONTH' | 'ALL'>('WEEK');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/leaderboard?period=${period}`);
      setLeaderboard(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Bảng xếp hạng Học sinh</h1>
          <p className="text-slate-500 mt-1 font-medium">Theo dõi tiến độ và xếp hạng của tất cả học sinh.</p>
        </div>
        
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          {(['WEEK', 'MONTH', 'ALL'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                period === p 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-855'
              }`}
            >
              {p === 'WEEK' ? 'Tuần này' : p === 'MONTH' ? 'Tháng này' : 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-white/30 border-b border-slate-100">
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Hạng</th>
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Học sinh</th>
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Cấp độ</th>
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">XP Giai đoạn</th>
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Tổng XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold animate-pulse">Đang tải dữ liệu xếp hạng di sản...</td>
              </tr>
            ) : leaderboard.length > 0 ? (
              leaderboard.map((user, index) => (
                <tr key={user._id} className="hover:bg-white/55 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      {index === 0 && <Trophy className="text-amber-400" size={20} />}
                      {index === 1 && <Medal className="text-slate-400" size={20} />}
                      {index === 2 && <Medal className="text-amber-600" size={20} />}
                      <span className={`text-sm font-black ${index < 3 ? 'text-slate-800' : 'text-slate-400'}`}>
                        #{index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 overflow-hidden">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-xs font-bold text-slate-400">{user.fullName?.[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.fullName}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Student ID: {user._id?.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black border border-emerald-100">
                      Lv.{user.level}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-black text-slate-700">+{user.periodXp.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-sm font-bold text-slate-400">{user.totalXp.toLocaleString()} XP</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic">Chưa có dữ liệu xếp hạng học sinh di sản.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
