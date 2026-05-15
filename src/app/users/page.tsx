'use client';

import React, { useEffect, useState } from "react";
import { 
  Users, Search, Filter, MoreVertical, 
  UserPlus, Shield, UserCheck, UserX,
  Mail, Phone, Calendar, ArrowRight,
  X, Edit2, Trash2, CheckCircle2, Lock
} from "lucide-react";
import api, { resolveImageUrl } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function UsersManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "STUDENT"
  });

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let endpoint = "/users";
      if (filter === "STUDENT") endpoint = "/users/students";
      else if (filter === "TEACHER") endpoint = "/users/teachers";
      
      const res = await api.get(endpoint); 
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (error) {
      alert("Xóa thất bại");
    }
  };

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        password: "", // Don't show password
        role: user.role || "STUDENT"
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: "STUDENT"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update
        const updateData: any = { ...formData };
        if (!updateData.password) delete updateData.password;
        const res = await api.patch(`/users/${editingUser._id}`, updateData);
        setUsers(users.map(u => u._id === editingUser._id ? res.data : u));
      } else {
        // Create
        const res = await api.post("/users", formData);
        setUsers([res.data, ...users]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(u => {
    const matchesRole = filter === "ALL" || u.role === filter;
    const matchesSearch = (u.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  }) : [];

  return (
    <div className="p-4 md:p-8 space-y-8 bg-[#FFFDF0] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">QUẢN LÝ NGƯỜI DÙNG</h1>
          <p className="text-slate-500 font-medium">Quản lý vòng đời tài khoản giáo dục di sản.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
        >
          <UserPlus size={20} /> Tạo tài khoản mới
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#FFFBEB] p-4 rounded-[32px] border border-[#FEF9C3] shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#FFFDF0] border border-[#FEF9C3] rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium text-slate-700"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["ALL", "STUDENT", "TEACHER", "ADMIN"].map((role) => (
            <button 
              key={role}
              onClick={() => setFilter(role)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filter === role 
                ? "bg-emerald-600 text-white border-emerald-600 shadow-lg" 
                : "bg-[#FFFDF0] text-slate-500 border-[#FEF9C3] hover:bg-[#FFFBEB]"
              }`}
            >
              {role === "ALL" ? "Tất cả" : role === "STUDENT" ? "Học sinh" : role === "TEACHER" ? "Giáo viên" : "Quản trị"}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="bg-[#FFFBEB] rounded-[40px] border border-[#FEF9C3] shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
        {loading ? (
          <div className="p-20 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div></div>
        ) : (
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-[#FFFDF0]/50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-[#FEF9C3]">
                <th className="px-8 py-5">Người dùng</th>
                <th className="px-8 py-5">Liên hệ</th>
                <th className="px-8 py-5">Vai trò</th>
                <th className="px-8 py-5">Thống kê học tập</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FEF9C3]">
              {filteredUsers.map((user) => (
                <tr 
                  key={user._id} 
                  onClick={() => user.role === 'STUDENT' && router.push(`/users/students/${user._id}`)}
                  className={`hover:bg-slate-50/50 transition-colors group ${user.role === 'STUDENT' ? 'cursor-pointer' : ''}`}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFFDF0] flex items-center justify-center text-emerald-600 border border-[#FEF9C3] overflow-hidden shadow-sm">
                        {user.avatar ? (
                          <img 
                            src={resolveImageUrl(user.avatar)} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <Users size={24} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{user.fullName}</p>
                        <p className="text-xs text-slate-400 font-medium tracking-tight">ID: {user._id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Mail size={12} className="text-slate-400" /> {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Phone size={12} /> {user.phone || "Chưa cập nhật"}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' :
                      user.role === 'TEACHER' ? 'bg-blue-50 text-blue-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {user.role === 'STUDENT' ? (
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Lv.</p>
                          <p className="text-xs font-black text-slate-700">{user.level || 1}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">XP</p>
                          <p className="text-xs font-black text-slate-700">{user.xp || 0}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300">N/A</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-xs font-bold text-slate-700">Hoạt động</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(user); }}
                        className="p-2 bg-white text-blue-500 border border-blue-100 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(user._id, e)}
                        className="p-2 bg-white text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-medium">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-[#FFFDF0] w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300 border border-[#FEF9C3]">
            <div className="p-8 border-b border-[#FEF9C3] flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {editingUser ? "CẬP NHẬT TÀI KHOẢN" : "TẠO TÀI KHOẢN MỚI"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-[#FFFBEB] border border-[#FEF9C3] flex items-center justify-center text-slate-500 hover:bg-[#FFFDF0] transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-12 pr-4 py-4 bg-[#FFFBEB] border border-[#FEF9C3] rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="example@gmail.com"
                    className="w-full pl-12 pr-4 py-4 bg-[#FFFBEB] border border-[#FEF9C3] rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Mật khẩu {editingUser && "(Để trống nếu không đổi)"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="password" 
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-[#FFFBEB] border border-[#FEF9C3] rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Vai trò</label>
                <div className="grid grid-cols-3 gap-3">
                  {["STUDENT", "TEACHER", "ADMIN"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({...formData, role})}
                      className={`py-3 rounded-2xl text-[10px] font-black transition-all border ${
                        formData.role === role 
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20" 
                        : "bg-white text-slate-400 border-slate-100 hover:border-emerald-200"
                      }`}
                    >
                      {role === "STUDENT" ? "HỌC SINH" : role === "TEACHER" ? "GIÁO VIÊN" : "QUẢN TRỊ"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                >
                  HỦY BỎ
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> {editingUser ? "LƯU THAY ĐỔI" : "TẠO TÀI KHOẢN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

