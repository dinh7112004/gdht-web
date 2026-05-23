'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 50);
    const token = localStorage.getItem('userToken');
    if (token) router.push('/');
    return () => clearTimeout(id);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;
      localStorage.setItem('userToken', data.access_token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <style>{`
        /* ── Keyframes ── */
        @keyframes drift1 {
          0%   { transform: translate(0,   0)   scale(1);    }
          33%  { transform: translate(40px,-30px) scale(1.08); }
          66%  { transform: translate(-20px,20px) scale(0.96); }
          100% { transform: translate(0,   0)   scale(1);    }
        }
        @keyframes drift2 {
          0%   { transform: translate(0,  0)    scale(1);    }
          40%  { transform: translate(-50px,35px) scale(1.1); }
          70%  { transform: translate(25px,-15px) scale(0.94); }
          100% { transform: translate(0,  0)    scale(1);    }
        }
        @keyframes drift3 {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(30px,40px) scale(1.06); }
          100% { transform: translate(0,0) scale(1); }
        }
        @keyframes mesh1 {
          0%,100% { transform: translate(0,0)      scale(1);    }
          30%      { transform: translate(60px,-40px) scale(1.12); }
          60%      { transform: translate(-30px,50px) scale(0.93); }
        }
        @keyframes mesh2 {
          0%,100% { transform: translate(0,0)       scale(1);    }
          40%      { transform: translate(-70px,30px) scale(1.15); }
          75%      { transform: translate(40px,-55px) scale(0.9);  }
        }
        @keyframes mesh3 {
          0%,100% { transform: translate(0,0)      scale(1);   }
          50%      { transform: translate(50px,60px) scale(1.1); }
        }
        @keyframes mesh4 {
          0%,100% { transform: translate(0,0)        scale(1);    }
          35%      { transform: translate(-40px,-60px) scale(1.08); }
          70%      { transform: translate(60px,20px)  scale(0.95); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes spinRing {
          to { transform: rotate(360deg); }
        }
        @keyframes spinRingRev {
          to { transform: rotate(-360deg); }
        }
        @keyframes floatLogo {
          0%,100% { transform: translateY(0px);  }
          50%      { transform: translateY(-5px); }
        }
        @keyframes shimmerBar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%);  }
        }
        @keyframes pulse-btn {
          0%,100% { box-shadow: 0 4px 20px rgba(16,185,129,0.4), 0 0 0 0 rgba(16,185,129,0); }
          50%      { box-shadow: 0 8px 32px rgba(16,185,129,0.55), 0 0 0 8px rgba(16,185,129,0.08); }
        }
        @keyframes scanline {
          0%   { top: -2px; }
          100% { top: 100%;  }
        }

        /* ── Background ── */
        .login-bg {
          background: #f8fffe;
        }

        /* ── Mesh blobs ── */
        .mesh {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          will-change: transform;
        }
        .mesh-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle at 40% 40%, rgba(16,185,129,0.28) 0%, rgba(52,211,153,0.12) 45%, transparent 70%);
          filter: blur(55px);
          top: -180px; left: -180px;
          animation: mesh1 20s ease-in-out infinite;
        }
        .mesh-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle at 60% 60%, rgba(5,150,105,0.22) 0%, rgba(16,185,129,0.08) 50%, transparent 70%);
          filter: blur(65px);
          bottom: -150px; right: -150px;
          animation: mesh2 25s ease-in-out infinite;
        }
        .mesh-3 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(110,231,183,0.2) 0%, rgba(52,211,153,0.06) 55%, transparent 75%);
          filter: blur(50px);
          top: 35%; left: 50%;
          animation: mesh3 17s ease-in-out infinite;
        }
        .mesh-4 {
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(167,243,208,0.3) 0%, transparent 70%);
          filter: blur(40px);
          top: 10%; right: 12%;
          animation: mesh4 13s ease-in-out infinite;
        }

        /* ── Grid dots ── */
        .dot-grid {
          position: absolute; inset: 0;
          pointer-events: none;
          background-image: radial-gradient(circle, rgba(16,185,129,0.12) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        /* ── Card ── */
        .login-card {
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(16,185,129,0.18);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.9) inset,
            0 0 0 1px rgba(16,185,129,0.06),
            0 20px 60px rgba(5,150,105,0.12),
            0 4px 16px rgba(0,0,0,0.06);
          position: relative;
          overflow: hidden;
        }

        /* ── Logo ring ── */
        .ring-a {
          position: absolute; inset: -8px;
          border-radius: 50%;
          border: 1.5px solid rgba(16,185,129,0.3);
          animation: spinRing 8s linear infinite;
        }
        .ring-b {
          position: absolute; inset: -2px;
          border-radius: 50%;
          border: 1px dashed rgba(52,211,153,0.25);
          animation: spinRingRev 6s linear infinite;
        }
        .logo-core {
          animation: floatLogo 3.5s ease-in-out infinite;
        }

        /* ── Input ── */
        .field-wrap {
          position: relative;
          border-radius: 12px;
          background: rgba(255,255,255,0.9);
          border: 1.5px solid #e2e8f0;
          transition: border-color 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }
        .field-wrap:focus-within {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        /* shimmer on focus */
        .field-wrap:focus-within::before {
          content:'';
          position:absolute;
          top:0;left:0;right:0;
          height:2px;
          background: linear-gradient(90deg, transparent, #10b981, #34d399, #10b981, transparent);
          animation: shimmerBar 1.4s ease forwards;
        }
        .field-input {
          width: 100%;
          padding: 11px 14px 11px 38px;
          font-size: 13.5px;
          background: transparent;
          border: none;
          outline: none;
          color: #0f172a;
        }
        .field-input::placeholder { color: #94a3b8; }

        /* ── Button ── */
        .btn-login {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.04em;
          border-radius: 14px;
          padding: 13px;
          width: 100%;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          animation: pulse-btn 2.8s ease-in-out infinite;
          transition: transform 0.16s, filter 0.16s;
        }
        .btn-login:hover:not(:disabled) {
          filter: brightness(1.08);
          transform: translateY(-2px);
        }
        .btn-login:active:not(:disabled) { transform: translateY(0); }
        .btn-login:disabled { opacity: 0.55; cursor: not-allowed; animation: none; }
        /* sheen sweep on hover */
        .btn-login::after {
          content:'';
          position:absolute;
          top:0; left:-60%;
          width:40%; height:100%;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%);
          transition: left 0.5s;
        }
        .btn-login:hover::after { left: 120%; }

        /* ── Fade-up stagger ── */
        .fu   { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) both; }
        .fu-1 { animation: fadeUp 0.55s 0.08s cubic-bezier(.22,1,.36,1) both; }
        .fu-2 { animation: fadeUp 0.55s 0.16s cubic-bezier(.22,1,.36,1) both; }
        .fu-3 { animation: fadeUp 0.55s 0.24s cubic-bezier(.22,1,.36,1) both; }
        .fu-4 { animation: fadeUp 0.55s 0.34s cubic-bezier(.22,1,.36,1) both; }
        .fu-5 { animation: fadeUp 0.55s 0.44s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div className="login-bg min-h-screen flex items-center justify-center relative overflow-hidden">

        {/* Mesh blobs */}
        <div className="mesh mesh-1" />
        <div className="mesh mesh-2" />
        <div className="mesh mesh-3" />
        <div className="mesh mesh-4" />

        {/* Dot grid */}
        <div className="dot-grid" />

        {/* Card */}
        <div className="login-card relative z-10 w-full max-w-sm mx-4 rounded-3xl p-8">

          {/* Top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '60%', height: '2px',
            background: 'linear-gradient(90deg, transparent, #10b981, #34d399, #10b981, transparent)',
          }} />

          {/* Logo */}
          <div className="fu flex flex-col items-center mb-7">
            <div style={{ position: 'relative', width: 72, height: 72, marginBottom: 16 }}>
              <div className="ring-a" />
              <div className="ring-b" />
              <div className="logo-core" style={{
                position: 'absolute', inset: 6,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 6px 24px rgba(16,185,129,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShieldCheck size={26} color="#fff" strokeWidth={2} />
              </div>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              GDDS Master
            </h1>
            <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 4, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>
              Cổng quản trị giáo dục
            </p>

            {/* Divider */}
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #e2e8f0)' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', opacity: 0.5 }} />
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #e2e8f0, transparent)' }} />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {error && (
              <div className="fu" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 10, fontSize: 12.5,
                background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#dc2626',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Email */}
            <div className="fu-1">
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Email
              </label>
              <div className="field-wrap">
                <div style={{ position: 'absolute', insetBlock: 0, left: 0, display: 'flex', alignItems: 'center', paddingLeft: 12, color: '#94a3b8', pointerEvents: 'none' }}>
                  <Mail size={14} />
                </div>
                <input type="email" required autoComplete="email"
                  placeholder="admin@gdds.edu.vn"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="field-input" />
              </div>
            </div>

            {/* Password */}
            <div className="fu-2">
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Mật khẩu
              </label>
              <div className="field-wrap">
                <div style={{ position: 'absolute', insetBlock: 0, left: 0, display: 'flex', alignItems: 'center', paddingLeft: 12, color: '#94a3b8', pointerEvents: 'none' }}>
                  <Lock size={14} />
                </div>
                <input type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="field-input" style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', insetBlock: 0, right: 0, display: 'flex', alignItems: 'center', paddingRight: 12, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#10b981')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="fu-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: '#10b981', width: 14, height: 14 }} />
                <span style={{ fontSize: 12, color: '#64748b' }}>Ghi nhớ đăng nhập</span>
              </label>
              <button type="button"
                style={{ fontSize: 12, color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit */}
            <div className="fu-4" style={{ marginTop: 4 }}>
              <button type="submit" disabled={loading} className="btn-login"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading
                  ? <Loader2 size={16} className="animate-spin" />
                  : <><span>Đăng nhập</span><ArrowRight size={15} strokeWidth={2.5} /></>}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="fu-5" style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(16,185,129,0.35)' }} />
            <p style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.06em' }}>
              GDDS Master Authority System · v4.0
            </p>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(16,185,129,0.35)' }} />
          </div>
        </div>
      </div>
    </>
  );
}
