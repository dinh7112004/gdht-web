'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Sparkles, Zap } from 'lucide-react';

interface GeminiMsg {
  role: 'user' | 'model';
  text: string;
  ts: Date;
}

const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1/models';
const SYSTEM_CTX = 'Bạn là trợ lý quản trị thông minh của hệ thống giáo dục GDDS Master. Hỗ trợ admin quản lý lớp học, học sinh, giáo viên, nội dung và gamification. Trả lời bằng tiếng Việt, ngắn gọn, chuyên nghiệp.';
const HISTORY_KEY = 'gdds_ai_chat_history';
const MAX_STORED = 100;

const QUICK = [
  'Tóm tắt hoạt động hệ thống hôm nay',
  'Gợi ý cải thiện tỷ lệ hoàn thành bài học',
  'Phân tích điểm mạnh của gamification',
  'Cách tăng tương tác học sinh',
];

function fmt(d: Date | string): string {
  return new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function AIConfigPage() {
  const [msgs, setMsgs] = useState<GeminiMsg[]>(() => {
    if (typeof window === 'undefined') return [{ role: 'model', text: 'Xin chào! Tôi là trợ lý AI của GDDS Master. Tôi có thể giúp bạn quản lý hệ thống, phân tích dữ liệu học sinh, hoặc trả lời bất kỳ câu hỏi nào. Bạn cần hỗ trợ gì?', ts: new Date() }];
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { role: 'user' | 'model'; text: string; ts: string }[];
        if (parsed.length > 0) return parsed.map(m => ({ ...m, ts: new Date(m.ts) }));
      }
    } catch { /* ignore */ }
    return [{ role: 'model', text: 'Xin chào! Tôi là trợ lý AI của GDDS Master. Tôi có thể giúp bạn quản lý hệ thống, phân tích dữ liệu học sinh, hoặc trả lời bất kỳ câu hỏi nào. Bạn cần hỗ trợ gì?', ts: new Date() }];
  });
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(msgs.slice(-MAX_STORED))); } catch { /* ignore */ }
  }, [msgs]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setMsgs(p => [...p, { role: 'user', text, ts: new Date() }]);
    setBusy(true);

    const body = JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_CTX }] },
        { role: 'model', parts: [{ text: 'Tôi hiểu. Tôi sẽ hỗ trợ bạn quản lý hệ thống GDDS Master.' }] },
        ...msgs.slice(1).map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text }] },
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    });

    try {
      let reply: string | null = null;
      for (const model of GEMINI_MODELS) {
        const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_KEY}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
        });
        const data = await res.json();
        if (data?.error?.code === 429) continue;
        if (data?.error) { reply = `Lỗi: ${data.error.message ?? 'Không xác định'}`; break; }
        const candidate = data?.candidates?.[0];
        reply = candidate?.content?.parts?.[0]?.text ?? null;
        if (reply && candidate?.finishReason === 'MAX_TOKENS') reply += '\n\n_(Phản hồi bị cắt ngắn. Hỏi tiếp để xem thêm.)_';
        if (reply) break;
      }
      if (!reply) reply = '⚠️ Hạn mức API miễn phí đã hết cho hôm nay. Vui lòng thử lại vào ngày mai.';
      setMsgs(p => [...p, { role: 'model', text: reply!, ts: new Date() }]);
    } catch (err) {
      console.error('Gemini error:', err);
      setMsgs(p => [...p, { role: 'model', text: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại.', ts: new Date() }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] overflow-hidden" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-slate-100 shrink-0">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 14px rgba(16,185,129,.25)' }}>
          <Sparkles size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800 leading-tight">Trợ lý AI Gemini</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-400 font-medium">Gemini 2.5 / 2.0 Flash · Sẵn sàng</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
          style={{ background: '#ecfdf5', color: '#059669' }}>
          <Zap size={11} /> GDDS AI
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" style={{ scrollbarWidth: 'thin' }}>
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'model' && (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 2px 8px rgba(16,185,129,.2)' }}>
                <Sparkles size={14} className="text-white" />
              </div>
            )}
            <div className={`max-w-[72%] flex flex-col gap-1.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                style={m.role === 'user'
                  ? { background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', borderBottomRightRadius: 6, boxShadow: '0 2px 12px rgba(16,185,129,.2)' }
                  : { background: 'white', color: '#1e293b', border: '1px solid #e2e8f0', borderBottomLeftRadius: 6, boxShadow: '0 1px 6px rgba(0,0,0,.06)' }
                }>
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 px-1">{fmt(m.ts)}</span>
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                <User size={14} className="text-slate-500" />
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-slate-100 flex items-center gap-2"
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,.06)' }}>
              {[0, 150, 300].map(d => (
                <div key={d} className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      {msgs.length <= 1 && (
        <div className="px-6 pb-4 flex flex-wrap gap-2">
          {QUICK.map(q => (
            <button key={q} onClick={() => setInput(q)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
              style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-5 py-4 bg-white border-t border-slate-100 shrink-0">
        <div className="flex items-end gap-3 p-1 rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-50 transition-all">
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder="Hỏi AI về hệ thống, học sinh, báo cáo..."
            rows={1} disabled={busy}
            className="flex-1 px-3 py-2 text-sm bg-transparent text-slate-800 placeholder-slate-400 outline-none resize-none disabled:opacity-50"
            style={{ maxHeight: 120 }} />
          <button onClick={() => void send()} disabled={!input.trim() || busy}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-30 shrink-0 mb-1 mr-1"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 12px rgba(16,185,129,.3)' }}>
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-slate-300 mt-2 ml-1">Powered by Google Gemini · Enter để gửi · Shift+Enter xuống dòng</p>
      </div>
    </div>
  );
}
