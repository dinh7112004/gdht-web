'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Loader2, Mail, Lock, Sparkles, Globe, Shield } from 'lucide-react';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if already logged in
    const token = localStorage.getItem('userToken');
    if (token) {
      router.push('/');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      localStorage.setItem('userToken', data.access_token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Trigger a refresh or navigation
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Thông tin đăng nhập không chính xác');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* Premium Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 animate-bounce delay-100 opacity-20">
          <Sparkles className="text-emerald-400" size={40} />
        </div>
        <div className="absolute bottom-1/4 right-1/4 animate-bounce delay-300 opacity-20">
          <Globe className="text-blue-400" size={40} />
        </div>
      </div>

      <div className="max-w-xl w-full p-6 z-10">
        <div className="bg-white/5 backdrop-blur-3xl rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 p-10 md:p-16 relative overflow-hidden group">
          {/* Internal Glow Effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700" />
          
          <div className="relative flex flex-col items-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[32px] flex items-center justify-center text-white shadow-[0_20px_40px_-8px_rgba(16,185,129,0.4)] mb-8 transform group-hover:rotate-6 transition-transform duration-500">
              <Shield size={48} strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase text-center mb-2">
              GDDS <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">MASTER</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-white/10" />
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">
                Secure Administrator Node
              </p>
              <div className="h-px w-8 bg-white/10" />
            </div>
          </div>
          
          <form className="space-y-6 relative" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-500/10 text-rose-400 p-4 rounded-2xl text-xs font-black text-center border border-rose-500/20 animate-shake backdrop-blur-md">
                {error.toUpperCase()}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-emerald-400 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-14 pr-6 py-6 bg-white/5 border border-white/10 placeholder-slate-500 text-white rounded-[24px] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 focus:bg-white/10 transition-all font-bold text-base"
                  placeholder="admin@gdds.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-emerald-400 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-14 pr-6 py-6 bg-white/5 border border-white/10 placeholder-slate-500 text-white rounded-[24px] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 focus:bg-white/10 transition-all font-bold text-base"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-4">
              <button
                type="submit"
                disabled={loading}
                className="group/btn relative w-full flex items-center justify-center py-6 px-4 bg-emerald-500 text-[#0f172a] text-base font-black rounded-[24px] hover:bg-emerald-400 transition-all duration-300 shadow-[0_20px_40px_-8px_rgba(16,185,129,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.5)] active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <span className="flex items-center gap-3">
                    XÁC THỰC DANH TÍNH
                    <ArrowRight className="group-hover/btn:translate-x-2 transition-transform duration-300" size={20} />
                  </span>
                )}
              </button>
              
              <div className="flex justify-between items-center px-4">
                <label className="flex items-center gap-2 cursor-pointer group/check">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-emerald-500 transition-all" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase group-hover/check:text-slate-300 transition-colors">Ghi nhớ phiên đăng nhập</span>
                </label>
                <button type="button" className="text-[10px] text-slate-500 font-bold uppercase hover:text-emerald-400 transition-colors">Quên mật mã?</button>
              </div>
            </div>
          </form>

          <div className="mt-16 text-center border-t border-white/5 pt-8">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] leading-relaxed opacity-50 group-hover:opacity-100 transition-opacity">
              GDDS MASTER AUTHORITY SYSTEM v4.0 <br />
              <span className="text-emerald-500/50 mt-1 block tracking-normal italic text-[9px]">Encrypted end-to-end management node</span>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-10 right-10 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-[10px] text-emerald-500 font-black tracking-widest">SYSTEM ONLINE</span>
      </div>
    </div>
  );
}

