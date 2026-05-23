'use client';

import React, { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, BookOpen, Save, X, GraduationCap } from "lucide-react";
import api from "@/lib/api";

export default function CMSSubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', order: 0 });

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/subjects");
      setSubjects(res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const openEditModal = (sub: any) => {
    setEditingId(sub._id);
    setFormData({ name: sub.name, order: sub.order || 0 });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Xóa môn học này?")) return;
    try { await api.delete(`/subjects/${id}`); fetchSubjects(); }
    catch { alert("Lỗi khi xóa môn học"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/subjects/${editingId}`, formData);
      else await api.post("/subjects", formData);
      closeModal(); fetchSubjects();
    } catch { alert("Lỗi khi lưu (môn học có thể đã tồn tại)"); }
  };

  const closeModal = () => {
    setShowModal(false); setEditingId(null);
    setFormData({ name: '', order: 0 });
  };

  const ACCENT_COLORS = [
    { bg: 'rgba(16,185,129,0.08)', icon: '#10b981', border: 'rgba(16,185,129,0.15)' },
    { bg: 'rgba(99,102,241,0.08)',  icon: '#6366f1', border: 'rgba(99,102,241,0.15)' },
    { bg: 'rgba(245,158,11,0.08)',  icon: '#f59e0b', border: 'rgba(245,158,11,0.15)' },
    { bg: 'rgba(239,68,68,0.08)',   icon: '#ef4444', border: 'rgba(239,68,68,0.15)' },
    { bg: 'rgba(14,165,233,0.08)',  icon: '#0ea5e9', border: 'rgba(14,165,233,0.15)' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ minHeight: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Quản lý Môn học
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
            Danh sách các môn học hiển thị trên toàn hệ thống
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 12,
            background: 'var(--accent)', color: '#fff',
            fontWeight: 700, fontSize: 13.5, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
            transition: 'filter 0.15s, transform 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ''; (e.currentTarget as HTMLElement).style.transform = ''; }}
        >
          <Plus size={16} strokeWidth={2.5} /> Thêm môn học
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--accent-dim)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : subjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <GraduationCap size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600 }}>Chưa có môn học nào</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {subjects.map((sub, i) => {
            const col = ACCENT_COLORS[i % ACCENT_COLORS.length];
            return (
              <div key={sub._id}
                style={{
                  background: 'var(--bg-surface)', borderRadius: 16,
                  border: '1px solid var(--border-subtle)',
                  padding: '20px', position: 'relative',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ''; (e.currentTarget as HTMLElement).style.transform = ''; }}
              >
                {/* Action buttons */}
                <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 4 }}>
                  <button onClick={() => openEditModal(sub)}
                    style={{ padding: '5px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', transition: 'background 0.15s, color 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-dim)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(sub._id)}
                    style={{ padding: '5px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', transition: 'background 0.15s, color 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, marginBottom: 14,
                  background: col.bg, border: `1px solid ${col.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <BookOpen size={20} color={col.icon} strokeWidth={2} />
                </div>

                {/* Name */}
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {sub.name}
                </div>

                {/* Order badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 10px', borderRadius: 20,
                  background: col.bg, border: `1px solid ${col.border}`,
                  fontSize: 11, fontWeight: 600, color: col.icon,
                }}>
                  #{sub.order}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: 'var(--bg-surface)', borderRadius: 20, width: '100%', maxWidth: 420,
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
          }}>
            {/* Modal header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 24px 0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={18} color="var(--accent)" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {editingId ? 'Cập nhật môn học' : 'Thêm môn học mới'}
                </h3>
              </div>
              <button onClick={closeModal}
                style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border-subtle)', margin: '16px 0' }} />

            <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Tên môn học */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Tên môn học
                </label>
                <input
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Toán học, Ngữ văn..."
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                    background: 'var(--bg-elevated)', border: '1.5px solid var(--border-default)',
                    color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Thứ tự */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                    background: 'var(--bg-elevated)', border: '1.5px solid var(--border-default)',
                    color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={closeModal}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid var(--border-default)',
                    background: 'transparent', color: 'var(--text-secondary)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  Hủy
                </button>
                <button type="submit"
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                    background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                    transition: 'filter 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1.08)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = ''}>
                  <Save size={15} /> {editingId ? 'Cập nhật' : 'Lưu môn học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
