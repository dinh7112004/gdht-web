'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Loader2, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      localStorage.setItem('userToken', data.access_token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDF0] relative overflow-hidden font-sans">
      {/* Abstract Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-100/30 rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="max-w-md w-full p-6 z-10 animate-fade-in">
        <div className="bg-[#FFFBEB]/80 backdrop-blur-2xl rounded-[40px] shadow-2xl shadow-emerald-900/5 border border-[#FEF9C3] p-10 md:p-12">
          
          <div className="flex flex-col items-center mb-12">
            <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 mb-6 group hover:scale-110 transition-transform duration-500">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase text-center">
              GDDS <span className="text-emerald-600">MASTER</span>
            </h2>
            <p className="text-slate-500 font-bold text-sm mt-2 text-center uppercase tracking-widest">
              Authority Portal Access
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-[10px] font-black text-center border border-rose-100 animate-shake">
                {error.toUpperCase()}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-12 pr-5 py-5 bg-[#FFFDF0] border border-[#FEF9C3] placeholder-slate-400 text-slate-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all font-bold text-sm"
                  placeholder="EMAIL QUẢN TRỊ"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-12 pr-5 py-5 bg-[#FFFDF0] border border-[#FEF9C3] placeholder-slate-400 text-slate-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all font-bold text-sm"
                  placeholder="MẬT MÃ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center py-5 px-4 bg-emerald-600 text-white text-sm font-black rounded-2xl hover:bg-emerald-700 transition-all duration-300 shadow-xl shadow-emerald-600/10 hover:shadow-emerald-600/30 active:scale-[0.98] disabled:opacity-50 uppercase tracking-wider"
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : (
                  <>
                    XÁC THỰC TRUY CẬP
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Hệ thống quản trị di sản toán học <br />
              Bảo mật bởi GDDS-Shield v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
