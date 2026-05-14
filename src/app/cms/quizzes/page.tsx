'use client';

import React, { useEffect, useState } from "react";
import { 
  Plus, Edit3, Trash2, Save, X, 
  HelpCircle, CheckCircle2, ChevronDown, ChevronUp
} from "lucide-react";
import api from "@/lib/api";

export default function CMSQuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    lessonId: '',
    questions: [
      { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' }
    ],
    xpReward: 50
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quizzesRes, lessonsRes] = await Promise.all([
        api.get("/quizzes"),
        api.get("/lessons")
      ]);
      setQuizzes(quizzesRes.data || []);
      setLessons(lessonsRes.data || []);
      
      // Tự động chọn bài học đầu tiên nếu chưa có
      if (lessonsRes.data && lessonsRes.data.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          lessonId: prev.lessonId || lessonsRes.data[0]._id 
        }));
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' }]
    });
  };

  const handleRemoveQuestion = (index: number) => {
    if (formData.questions.length <= 1) return;
    const newQuestions = [...formData.questions];
    newQuestions.splice(index, 1);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Submitting Quiz Data:", formData);
      let response;
      if (editingId) {
        response = await api.put(`/quizzes/${editingId}`, formData);
      } else {
        response = await api.post("/quizzes", formData);
      }
      console.log("Quiz saved successfully:", response.data);
      closeModal();
      fetchData();
    } catch (error: any) {
      console.error("FAILED TO SAVE QUIZ:", error);
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      alert(`Lỗi khi lưu bộ câu hỏi: ${errorMsg}`);
    }
  };

  const openEditModal = (quiz: any) => {
    setEditingId(quiz._id);
    setFormData({
      lessonId: quiz.lessonId?._id || quiz.lessonId || '',
      questions: quiz.questions || [],
      xpReward: Number(quiz.xpReward) || 50
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Anh có chắc muốn xóa bộ câu hỏi này?")) {
      try {
        await api.delete(`/quizzes/${id}`);
        fetchData();
      } catch (error) {
        alert("Lỗi khi xóa");
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      lessonId: lessons[0]?._id || '',
      questions: [{ questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' }],
      xpReward: 50
    });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Quản lý câu hỏi (Quiz)</h1>
          <p className="text-slate-500 font-medium">Thiết lập các thử thách kiến thức cho từng bài học di sản.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus size={20} /> Tạo bộ câu hỏi mới
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="p-20 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div></div>
        ) : quizzes.length === 0 ? (
          <div className="bg-slate-50 rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
             <HelpCircle size={48} className="mx-auto text-slate-300 mb-4" />
             <p className="text-slate-400 font-bold">Chưa có bộ câu hỏi nào được tạo.</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-white rounded-[32px] border border-slate-100 p-6 flex items-center justify-between shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <HelpCircle size={32} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Bài học: {quiz.lessonId?.title || 'Không rõ'}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {quiz.questions.length} câu hỏi
                    </span>
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Thưởng {quiz.xpReward} XP
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(quiz)} className="p-3.5 bg-slate-50 text-slate-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                  <Edit3 size={20} />
                </button>
                <button onClick={() => handleDelete(quiz._id)} className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{editingId ? 'Cập nhật bộ câu hỏi' : 'Tạo bộ câu hỏi mới'}</h3>
              <button onClick={closeModal} className="p-3 hover:bg-slate-100 rounded-full transition-all active:scale-90"><X size={28} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Chọn bài học di sản</label>
                  <select 
                    value={formData.lessonId || ''}
                    onChange={(e) => setFormData({...formData, lessonId: e.target.value})}
                    className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold text-slate-900 transition-all appearance-none"
                  >
                    {lessons.map(l => <option key={l._id} value={l._id}>{l.title}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Điểm thưởng hoàn thành (XP)</label>
                  <input 
                    type="number" 
                    value={formData.xpReward === 0 ? "" : formData.xpReward}
                    onChange={(e) => setFormData({...formData, xpReward: parseInt(e.target.value) || 0})}
                    className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold text-slate-900 transition-all"
                    placeholder="Ví dụ: 100"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-center px-2">
                  <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Danh sách câu hỏi trắc nghiệm</h4>
                  <button 
                    type="button" 
                    onClick={handleAddQuestion} 
                    className="bg-indigo-50 text-indigo-600 px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Plus size={14} /> Thêm câu hỏi
                  </button>
                </div>

                {formData.questions.map((q, qIndex) => (
                  <div key={qIndex} className="p-8 bg-slate-50 rounded-[40px] border-2 border-transparent hover:border-indigo-100 hover:bg-white transition-all space-y-6 relative group/item shadow-sm">
                    <button 
                      type="button" onClick={() => handleRemoveQuestion(qIndex)}
                      className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                    
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">Câu hỏi số {qIndex + 1}</label>
                      <input 
                        type="text" required value={q.questionText || ''}
                        onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-500 outline-none text-sm font-bold text-slate-900 transition-all shadow-sm"
                        placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${q.correctAnswerIndex === oIndex ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
                          <input 
                            type="radio" 
                            name={`correct-${qIndex}`}
                            checked={q.correctAnswerIndex === oIndex}
                            onChange={() => handleQuestionChange(qIndex, 'correctAnswerIndex', oIndex)}
                            className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                          />
                          <input 
                            type="text" required value={opt || ''}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-slate-800"
                            placeholder={`Đáp án ${String.fromCharCode(65 + oIndex)}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Giải thích đáp án (Tùy chọn)</label>
                      <textarea 
                        value={q.explanation || ''}
                        onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                        className="w-full px-6 py-3 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-500 outline-none text-xs font-medium text-slate-500 transition-all h-16"
                        placeholder="Giải thích tại sao đáp án này lại đúng để giúp học sinh hiểu bài hơn..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={closeModal} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-all">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <Save size={20} /> {editingId ? 'Cập nhật nội dung' : 'Xuất bản bộ câu hỏi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
