'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Send, Search, Check, CheckCheck, Clock, RefreshCw, User, Circle } from 'lucide-react';
import api from '@/lib/api';

interface Conversation {
  userId: string;
  fullName?: string;
  name?: string;
  role: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

interface ChatMessage {
  _id: string;
  senderId: string | { _id: string; fullName?: string };
  receiverId: string | { _id: string };
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Contact {
  _id: string;
  fullName?: string;
  role: string;
  avatar?: string;
}

interface ClassGroup {
  _id: string;
  name: string;
  code: string;
  color?: string;
  teacher?: { _id: string; fullName?: string };
  students: { _id: string; fullName?: string }[];
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  STUDENT: { label: 'Học sinh', color: '#10b981' },
  TEACHER: { label: 'Giáo viên', color: '#6366f1' },
  ADMIN:   { label: 'Admin',    color: '#f59e0b' },
};

function timeAgo(s: string): string {
  const m = Math.floor((Date.now() - new Date(s).getTime()) / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function fmt(d: string): string {
  return new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function getSenderId(m: ChatMessage): string {
  if (typeof m.senderId === 'object') return m.senderId._id;
  return m.senderId;
}

export default function ChatPage() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'conversations' | 'contacts'>('conversations');
  const endRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const myId: string = (() => {
    if (typeof window === 'undefined') return '';
    try {
      const d = JSON.parse(localStorage.getItem('userData') ?? '{}') as { _id?: string; id?: string };
      return d._id || d.id || '';
    } catch { return ''; }
  })();

  const loadConvs = useCallback(async () => {
    try {
      const r = await api.get('/chat/conversations');
      const normalized = (Array.isArray(r.data) ? r.data : []).map((c: Record<string, unknown>) => ({
        userId: c.userId as string,
        fullName: (c.fullName ?? c.name ?? 'Người dùng') as string,
        role: (c.role ?? 'STUDENT') as string,
        avatar: c.avatar as string | undefined,
        lastMessage: c.lastMessage as string | undefined,
        lastMessageAt: (c.lastMessageAt ?? c.lastMessageTime) as string | undefined,
        unreadCount: (c.unreadCount ?? 0) as number,
      }));
      setConvs(normalized);
    } catch { /* ignore */ }
  }, []);

  const loadContacts = useCallback(async () => {
    try {
      const classRes = await api.get('/classes');
      const classes = (Array.isArray(classRes.data) ? classRes.data : []).map((cls: Record<string, unknown>) => ({
        _id: cls._id as string,
        name: cls.name as string,
        code: cls.code as string,
        color: (cls.color as string) ?? '#6366f1',
        teacher: cls.teacherId ? {
          _id: typeof cls.teacherId === 'object' ? (cls.teacherId as Record<string, unknown>)._id as string : cls.teacherId as string,
          fullName: typeof cls.teacherId === 'object' ? (cls.teacherId as Record<string, unknown>).fullName as string : undefined,
        } : undefined,
        students: (Array.isArray(cls.studentIds) ? cls.studentIds : []).map((s: unknown) => ({
          _id: typeof s === 'object' ? (s as Record<string, unknown>)._id as string : s as string,
          fullName: typeof s === 'object' ? (s as Record<string, unknown>).fullName as string : undefined,
        })),
      }));
      setClassGroups(classes);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadConvs(), loadContacts()]);
      setLoading(false);
    };
    void init();
  }, [loadConvs, loadContacts]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const openConv = async (userId: string, info: Conversation) => {
    setSelected(info);
    setMsgLoading(true);
    if (pollRef.current) clearInterval(pollRef.current);
    try {
      const r = await api.get<ChatMessage[]>(`/chat/messages/${userId}`);
      setMsgs(r.data ?? []);
      await api.put(`/chat/read/${userId}`);
      setConvs(p => p.map(c => c.userId === userId ? { ...c, unreadCount: 0 } : c));
    } catch { /* ignore */ }
    setMsgLoading(false);
    // Poll every 3s for new messages
    pollRef.current = setInterval(async () => {
      try {
        const r = await api.get<ChatMessage[]>(`/chat/messages/${userId}`);
        setMsgs(r.data ?? []);
      } catch { /* ignore */ }
    }, 3000);
  };

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const openContact = (c: Contact) => {
    const conv: Conversation = {
      userId: c._id,
      fullName: c.fullName ?? 'Người dùng',
      role: c.role,
      unreadCount: 0,
    };
    void openConv(c._id, conv);
    setTab('conversations');
  };

  const send = async () => {
    if (!text.trim() || !selected || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);
    try {
      const r = await api.post<ChatMessage>('/chat/send', { receiverId: selected.userId, content });
      setMsgs(p => p.some(m => m._id === r.data._id) ? p : [...p, r.data]);
      void loadConvs();
    } catch { setText(content); }
    setSending(false);
  };

  const filtConvs = convs.filter(c =>
    (c.fullName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 shrink-0">
        <h1 className="text-lg font-bold text-slate-800">Chat với người dùng</h1>
        <p className="text-xs text-slate-400 mt-0.5">Admin có thể nhắn tin trực tiếp với học sinh và giáo viên</p>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-slate-100 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-300 outline-none focus:border-emerald-300 transition-all" />
            </div>
          </div>

          <div className="flex border-b border-slate-100">
            {(['conversations', 'contacts'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-[11px] font-semibold transition-all"
                style={{ color: tab === t ? '#10b981' : '#94a3b8', borderBottom: tab === t ? '2px solid #10b981' : '2px solid transparent' }}>
                {t === 'conversations' ? 'Hội thoại' : 'Danh bạ'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-4 h-4 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : tab === 'conversations' ? (
              filtConvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-3">
                  <MessageSquare size={20} className="text-slate-200 mb-1.5" />
                  <p className="text-[11px] text-slate-400">Chưa có hội thoại</p>
                </div>
              ) : filtConvs.map(conv => {
                const ri = ROLE_LABELS[conv.role] ?? ROLE_LABELS.STUDENT;
                const sel = selected?.userId === conv.userId;
                return (
                  <button key={conv.userId} onClick={() => openConv(conv.userId, conv)}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-slate-50 border-b border-slate-50"
                    style={{ background: sel ? '#f0fdf4' : 'transparent' }}>
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: `linear-gradient(135deg,${ri.color},${ri.color}cc)` }}>
                        {(conv.fullName || '?').charAt(0).toUpperCase()}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-semibold truncate ${sel ? 'text-emerald-700' : 'text-slate-800'}`}>{conv.fullName}</p>
                        {conv.lastMessageAt && <span className="text-[9px] text-slate-400 shrink-0 ml-1">{timeAgo(conv.lastMessageAt)}</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-semibold" style={{ color: ri.color }}>{ri.label}</span>
                        {conv.lastMessage && <span className="text-[9px] text-slate-400 truncate">· {conv.lastMessage}</span>}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              classGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-3">
                  <User size={20} className="text-slate-200 mb-1.5" />
                  <p className="text-[11px] text-slate-400">Không có lớp học nào</p>
                </div>
              ) : classGroups.map(cls => {
                const members: { _id: string; fullName?: string; role: string }[] = [
                  ...(cls.teacher ? [{ ...cls.teacher, role: 'TEACHER' }] : []),
                  ...cls.students.map(s => ({ ...s, role: 'STUDENT' })),
                ].filter(m => !search || (m.fullName ?? '').toLowerCase().includes(search.toLowerCase()));
                if (members.length === 0) return null;
                return (
                  <div key={cls._id}>
                    {/* Class header */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cls.color ?? '#6366f1' }} />
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider truncate">{cls.name}</span>
                      <span className="text-[9px] text-slate-400 shrink-0">{cls.code}</span>
                      <span className="ml-auto text-[9px] text-slate-400">{members.length} người</span>
                    </div>
                    {members.map(m => {
                      const ri = ROLE_LABELS[m.role] ?? ROLE_LABELS.STUDENT;
                      return (
                        <button key={m._id} onClick={() => openContact({ _id: m._id, fullName: m.fullName, role: m.role })}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-50">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ background: `linear-gradient(135deg,${ri.color},${ri.color}cc)` }}>
                            {(m.fullName || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">{m.fullName ?? 'Người dùng'}</p>
                            <span className="text-[9px] font-semibold" style={{ color: ri.color }}>{ri.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-slate-100">
            <button onClick={() => { void loadConvs(); void loadContacts(); }}
              className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-600 transition-colors">
              <RefreshCw size={10} /> Làm mới
            </button>
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          {selected ? (
            <>
              <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-slate-100 shrink-0">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: `linear-gradient(135deg,${ROLE_LABELS[selected.role]?.color ?? '#10b981'},${ROLE_LABELS[selected.role]?.color ?? '#10b981'}bb)` }}>
                  {(selected.fullName || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{selected.fullName}</p>
                  <div className="flex items-center gap-1.5">
                    <Circle size={7} className="text-emerald-400 fill-emerald-400" />
                    <span className="text-[11px] text-slate-400">{ROLE_LABELS[selected.role]?.label ?? selected.role}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4" style={{ scrollbarWidth: 'thin' }}>
                {msgLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-slate-200 border-t-emerald-400 rounded-full animate-spin" />
                  </div>
                ) : msgs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <MessageSquare size={24} className="text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">Bắt đầu cuộc trò chuyện</p>
                  </div>
                ) : msgs.map((m, idx) => {
                  const isMe = getSenderId(m) === myId;
                  const showTime = idx === 0 || new Date(m.createdAt).getTime() - new Date(msgs[idx - 1].createdAt).getTime() > 300000;
                  return (
                    <div key={m._id}>
                      {showTime && (
                        <div className="flex items-center justify-center my-3">
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-medium">{fmt(m.createdAt)}</span>
                        </div>
                      )}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[68%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                          style={isMe
                            ? { background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', borderBottomRightRadius: 6, boxShadow: '0 2px 12px rgba(16,185,129,.2)' }
                            : { background: 'white', color: '#1e293b', border: '1px solid #e2e8f0', borderBottomLeftRadius: 6, boxShadow: '0 1px 6px rgba(0,0,0,.06)' }
                          }>
                          {m.content}
                          <div className={`flex items-center gap-1 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[9px] opacity-60">{fmt(m.createdAt)}</span>
                            {isMe && (m.isRead ? <CheckCheck size={10} className="opacity-70" /> : <Check size={10} className="opacity-50" />)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              <div className="px-5 py-4 bg-white border-t border-slate-100 shrink-0">
                <div className="flex items-end gap-3 p-1 rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-50 transition-all">
                  <textarea value={text} onChange={e => setText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
                    placeholder="Nhập tin nhắn..." rows={1}
                    className="flex-1 px-3 py-2 text-sm bg-transparent text-slate-800 placeholder-slate-400 outline-none resize-none"
                    style={{ maxHeight: 120 }} />
                  <button onClick={() => void send()} disabled={!text.trim() || sending}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-30 shrink-0 mb-1 mr-1"
                    style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 12px rgba(16,185,129,.3)' }}>
                    {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-300 mt-2 ml-1">Enter để gửi · Shift+Enter xuống dòng</p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)' }}>
                <MessageSquare size={28} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-1">Chọn một hội thoại</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">Chọn người dùng từ danh sách bên trái hoặc vào tab Danh bạ để bắt đầu nhắn tin.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Clock size={12} /><span>Tin nhắn được lưu trữ an toàn</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
