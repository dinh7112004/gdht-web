'use client';

import React, { useEffect, useState } from 'react';
import { 
  Shield, ShieldCheck, ShieldAlert, User, 
  Search, Filter, Save, X, Plus, Trash2,
  ChevronRight, MoreVertical, Lock, Key
} from 'lucide-react';
import api from '@/lib/api';

const AVAILABLE_PERMISSIONS = [
  'MANAGE_USERS',
  'MANAGE_CONTENT',
  'MODERATE_COMMUNITY',
  'VIEW_REPORTS',
  'MANAGE_CLASSES',
  'MANAGE_GAMIFICATION',
  'ACCESS_AI_CONFIG'
];

export default function RBACPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, data: any) => {
    try {
      await api.patch(`/users/${userId}`, data);
      fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update user', error);
    }
  };

  const togglePermission = (perm: string) => {
    const currentPerms = selectedUser.permissions || [];
    const newPerms = currentPerms.includes(perm)
      ? currentPerms.filter((p: string) => p !== perm)
      : [...currentPerms, perm];
    
    setSelectedUser({ ...selectedUser, permissions: newPerms });
  };

  return (
    <div className="p-10 space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Quản trị <span className="text-indigo-600">Phân quyền (RBAC)</span>
          </h1>
          <p className="text-slate-500 font-bold mt-1">Thiết lập vai trò và quyền hạn chi tiết cho từng tài khoản</p>
        </div>
        
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="text-indigo-600" size={20} />
              <span className="text-sm font-black text-indigo-900 uppercase tracking-widest">Hệ thống Bảo mật v2.0</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm tài khoản..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-8 py-6">Người dùng</th>
                <th className="px-8 py-6">Vai trò</th>
                <th className="px-8 py-6">Quyền hạn động</th>
                <th className="px-8 py-6">Trạng thái</th>
                <th className="px-8 py-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center animate-pulse font-bold text-slate-400">ĐANG TẢI DỮ LIỆU...</td></tr>
              ) : users.map((user) => (
                <tr key={user._id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs uppercase">
                        {user.fullName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{user.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' :
                      user.role === 'TEACHER' ? 'bg-emerald-100 text-emerald-600' :
                      user.role === 'PARENT' ? 'bg-amber-100 text-amber-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                       {user.permissions?.length > 0 ? (
                         user.permissions.slice(0, 2).map((p: string) => (
                           <span key={p} className="px-2 py-0.5 bg-slate-100 text-[8px] font-black text-slate-500 rounded uppercase">{p}</span>
                         ))
                       ) : (
                         <span className="text-[10px] text-slate-300 italic">Mặc định theo vai trò</span>
                       )}
                       {user.permissions?.length > 2 && <span className="text-[8px] font-black text-slate-400">+{user.permissions.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500" />
                       <span className="text-xs font-bold text-slate-600">Hoạt động</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                      className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/10"
                    >
                      THIẾT LẬP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Permissions Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-100 bg-indigo-50/30">
               <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-500/10">
                     <Shield className="text-indigo-600" size={32} />
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all">
                     <X size={24} className="text-slate-400" />
                  </button>
               </div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Thiết lập quyền hạn</h3>
               <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">{selectedUser.fullName} • {selectedUser.email}</p>
            </div>

            <div className="p-10 space-y-10">
               {/* Role Selection */}
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">1. Vai trò chính (Role)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {['STUDENT', 'TEACHER', 'PARENT', 'ADMIN'].map(role => (
                       <button
                         key={role}
                         onClick={() => setSelectedUser({ ...selectedUser, role })}
                         className={`px-4 py-3 rounded-2xl text-[10px] font-black transition-all border-2 ${
                           selectedUser.role === role 
                             ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                             : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'
                         }`}
                       >
                         {role}
                       </button>
                     ))}
                  </div>
               </div>

               {/* Dynamic Permissions */}
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">2. Quyền hạn mở rộng (Dynamic Permissions)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {AVAILABLE_PERMISSIONS.map(perm => (
                       <button
                         key={perm}
                         onClick={() => togglePermission(perm)}
                         className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all ${
                           (selectedUser.permissions || []).includes(perm)
                             ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                             : 'bg-white border-slate-100 text-slate-500 opacity-60 hover:opacity-100 hover:border-slate-200'
                         }`}
                       >
                         <span className="text-[10px] font-black uppercase tracking-wider">{perm.replace(/_/g, ' ')}</span>
                         {(selectedUser.permissions || []).includes(perm) ? <ShieldCheck size={18} /> : <Lock size={16} className="text-slate-300" />}
                       </button>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
               <button 
                 onClick={() => setIsModalOpen(false)}
                 className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-100 transition-all"
               >
                 HỦY BỎ
               </button>
               <button 
                 onClick={() => handleUpdateUser(selectedUser._id, { role: selectedUser.role, permissions: selectedUser.permissions })}
                 className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
               >
                 <Save size={18} /> LƯU THIẾT LẬP
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
