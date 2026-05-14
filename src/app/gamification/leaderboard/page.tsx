'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Star, TrendingUp, Filter } from 'lucide-react';

const API_URL = 'http://localhost:3001';

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
      const res = await fetch(`${API_URL}/users/leaderboard?period=${period}`);
      const data = await res.json();
      setLeaderboard(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Bảng xếp hạng Học sinh</h1>
          <p className="text-slate-500 mt-1">Theo dõi tiến độ và xếp hạng của tất cả học sinh.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          {(['WEEK', 'MONTH', 'ALL'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                period === p 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {p === 'WEEK' ? 'Tuần này' : p === 'MONTH' ? 'Tháng này' : 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Hạng</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Học sinh</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cấp độ</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">XP Giai đoạn</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Tổng XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-slate-400">Đang tải dữ liệu...</td>
              </tr>
            ) : leaderboard.length > 0 ? (
              leaderboard.map((user, index) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      {index === 0 && <Trophy className="text-amber-400" size={20} />}
                      {index === 1 && <Medal className="text-slate-400" size={20} />}
                      {index === 2 && <Medal className="text-amber-600" size={20} />}
                      <span className={`text-sm font-black ${index < 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                        #{index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                        {user.avatar ? (
                          <img 
                            src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:3001${user.avatar}`} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-xs font-bold text-slate-400">{user.fullName?.[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.fullName}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Student ID: {user._id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black">
                      Lv.{user.level}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-black text-slate-700">+{user.periodXp.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <span className="text-sm font-medium text-slate-400">{user.totalXp.toLocaleString()} XP</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-slate-400">Chưa có dữ liệu xếp hạng.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
