'use client';

import React, { useEffect, useState } from "react";
import { 
  Plus, Edit3, Trash2, Save, X, 
  HelpCircle, CheckCircle2, Search, Filter,
  Shield, Award, BookOpen, Clock, Activity, Zap, Check, XCircle
} from "lucide-react";
import api from "@/lib/api";

export default function CMSQuizzesPage() {
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null); // holds the question item being edited
  
  // Stats states
  const [stats, setStats] = useState({
    totalQuestions: 0,
    averageAccuracy: '0%',
    totalXpAwarded: '0',
    totalSubmissions: 0
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

  // Form State - hỗ trợ nhiều câu hỏi cùng lúc
  const emptyQuestion = () => ({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: '',
  });

  const [formData, setFormData] = useState({
    lessonId: '',
    xpReward: 50,
    questionsList: [emptyQuestion()],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quizzesRes, lessonsRes, usersRes] = await Promise.all([
        api.get("/quizzes"),
        api.get("/lessons"),
        api.get("/users")
      ]);

      const fetchedQuizzes = quizzesRes.data || [];
      const fetchedLessons = lessonsRes.data || [];
      const fetchedUsers = usersRes.data || [];
      
      setQuizzes(fetchedQuizzes);
      setLessons(fetchedLessons);

      // Create dynamic mapping of student submissions per lesson
      const students = fetchedUsers.filter((u: any) => u.role === 'STUDENT');
      const lessonSubmissionsMap: { [lessonId: string]: any[] } = {};
      
      let totalXp = 0;
      let totalSubmissionsCount = 0;

      students.forEach((student: any) => {
        (student.completedLessons || []).forEach((cl: any) => {
          totalSubmissionsCount++;
          totalXp += cl.xpGained || 50;

          if (!lessonSubmissionsMap[cl.lessonId]) {
            lessonSubmissionsMap[cl.lessonId] = [];
          }
          lessonSubmissionsMap[cl.lessonId].push(cl);
        });
      });

      // Flatten quizzes -> questions list
      const flattenedQuestions: any[] = [];
      let totalAttemptsCombined = 0;
      let totalCorrectCombined = 0;

      fetchedQuizzes.forEach((quiz: any) => {
        const lessonId = quiz.lessonId?._id || quiz.lessonId;
        const lesson = fetchedLessons.find((l: any) => l._id === lessonId) || {};
        const submissions = lessonSubmissionsMap[lessonId] || [];

        (quiz.questions || []).forEach((q: any, qIdx: number) => {
          let correctCount = 0;
          let attemptCount = 0;

          submissions.forEach((sub: any) => {
            const studentAns = sub.answers?.[qIdx];
            if (studentAns !== undefined) {
              attemptCount++;
              if (studentAns === q.correctAnswerIndex) {
                correctCount++;
              }
            }
          });

          const finalAttempts = attemptCount;
          const finalAccuracy = attemptCount > 0
            ? Math.round((correctCount / attemptCount) * 100)
            : 0;

          totalAttemptsCombined += finalAttempts;
          totalCorrectCombined += correctCount;

          flattenedQuestions.push({
            id: `${quiz._id}-${qIdx}`,
            quizId: quiz._id,
            questionText: q.questionText,
            options: q.options || ['', '', '', ''],
            correctAnswerIndex: q.correctAnswerIndex ?? 0,
            explanation: q.explanation || "",
            lessonId: lessonId,
            lessonTitle: lesson.title || "Bài học di sản",
            categoryName: lesson.category || "Di sản",
            difficulty: lesson.difficulty || "Dễ",
            xp: quiz.xpReward || 50,
            accuracy: finalAccuracy,
            attempts: finalAttempts,
            originalIndex: qIdx,
            quizDoc: quiz
          });
        });
      });

      setQuestionsList(flattenedQuestions);

      // Compute statistics from real data only
      const avgAccuracy = totalAttemptsCombined > 0
        ? `${(totalCorrectCombined / totalAttemptsCombined * 100).toFixed(1)}%`
        : '—';

      const formattedXp = totalXp >= 1000
        ? `${(totalXp / 1000).toFixed(1)}k`
        : totalXp.toString();

      setStats({
        totalQuestions: flattenedQuestions.length,
        averageAccuracy: avgAccuracy,
        totalXpAwarded: formattedXp,
        totalSubmissions: totalSubmissionsCount
      });

      // Default the lesson ID in form if available
      if (fetchedLessons.length > 0) {
        setFormData(prev => ({
          ...prev,
          lessonId: prev.lessonId || fetchedLessons[0]._id
        }));
      }

    } catch (error) {
      console.error("Failed to fetch quizzes data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    const updated = [...formData.questionsList];
    updated[qIdx] = { ...updated[qIdx], options: updated[qIdx].options.map((o: string, i: number) => i === optIdx ? value : o) };
    setFormData({ ...formData, questionsList: updated });
  };

  const handleQuestionChange = (qIdx: number, field: string, value: any) => {
    const updated = [...formData.questionsList];
    updated[qIdx] = { ...updated[qIdx], [field]: value };
    setFormData({ ...formData, questionsList: updated });
  };

  const addNewQuestion = () => {
    setFormData({ ...formData, questionsList: [...formData.questionsList, emptyQuestion()] });
  };

  const removeQuestion = (qIdx: number) => {
    if (formData.questionsList.length === 1) return;
    setFormData({ ...formData, questionsList: formData.questionsList.filter((_: any, i: number) => i !== qIdx) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // EDIT MODE: cập nhật toàn bộ câu hỏi của quiz
        const quizDoc = editingItem.quizDoc;
        const updatedQuestions = formData.questionsList.map((q: any) => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex,
          explanation: q.explanation,
        }));
        await api.put(`/quizzes/${quizDoc._id}`, {
          lessonId: formData.lessonId,
          questions: updatedQuestions,
          xpReward: formData.xpReward,
        });
      } else {
        // ADD MODE: thêm nhiều câu hỏi vào quiz của bài học
        const existingQuiz = quizzes.find((q: any) => {
          const lId = q.lessonId?._id || q.lessonId;
          return lId === formData.lessonId;
        });
        const newQuestions = formData.questionsList.map((q: any) => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex,
          explanation: q.explanation,
        }));
        if (existingQuiz) {
          const updatedQuestions = [...(existingQuiz.questions || []), ...newQuestions];
          await api.put(`/quizzes/${existingQuiz._id}`, {
            lessonId: formData.lessonId,
            questions: updatedQuestions,
            xpReward: formData.xpReward,
          });
        } else {
          await api.post("/quizzes", {
            lessonId: formData.lessonId,
            questions: newQuestions,
            xpReward: formData.xpReward,
          });
        }
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      console.error("Failed to save quiz question", error);
      alert("Lỗi khi lưu câu hỏi: " + (error.response?.data?.message || error.message));
    }
  };

  const openEditModal = (item: any) => {
    const quizDoc = item.quizDoc;
    setEditingItem({ ...item, quizDoc });
    setFormData({
      lessonId: item.lessonId || '',
      xpReward: item.xp,
      questionsList: (quizDoc.questions || []).map((q: any) => ({
        questionText: q.questionText,
        options: [...(q.options || ['', '', '', ''])],
        correctAnswerIndex: q.correctAnswerIndex ?? 0,
        explanation: q.explanation || '',
      })),
    });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (window.confirm("Anh có chắc muốn xóa câu hỏi này khỏi ngân hàng câu hỏi?")) {
      try {
        const quizDoc = item.quizDoc;
        const updatedQuestions = quizDoc.questions.filter((_: any, idx: number) => idx !== item.originalIndex);

        if (updatedQuestions.length === 0) {
          // If no questions left, delete the quiz entirely
          await api.delete(`/quizzes/${quizDoc._id}`);
        } else {
          // Otherwise, update the questions array
          await api.put(`/quizzes/${quizDoc._id}`, {
            lessonId: quizDoc.lessonId?._id || quizDoc.lessonId,
            questions: updatedQuestions,
            xpReward: quizDoc.xpReward
          });
        }
        fetchData();
      } catch (error) {
        alert("Lỗi khi xóa câu hỏi");
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      lessonId: lessons[0]?._id || '',
      xpReward: 50,
      questionsList: [emptyQuestion()],
    });
  };

  // Filter questions based on search query and difficulty filter
  const filteredQuestions = questionsList.filter(q => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesDifficulty = difficultyFilter === 'ALL' || q.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 sm:mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
            Ngân hàng câu hỏi
          </h1>
          <p className="text-slate-500 font-bold mt-1">
            Quản lý kho câu hỏi toán học gắn với ngữ cảnh di sản văn hóa.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#059669] hover:bg-[#047857] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-[#059669]/10 transition-all flex items-center gap-2 active:scale-95 w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus size={20} /> Thêm câu hỏi mới
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Tổng câu hỏi', value: stats.totalQuestions, icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50/50 border-emerald-100/50' },
          { label: 'Độ chính xác TB', value: stats.averageAccuracy, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/50 border-emerald-100/50' },
          { label: 'XP đã phát', value: stats.totalXpAwarded, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50/50 border-amber-100/50' },
          { label: 'Số bài nộp', value: stats.totalSubmissions.toLocaleString('vi-VN'), icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50/50 border-emerald-100/50' },
        ].map((card, idx) => (
          <div key={idx} className="bg-slate-50 p-7 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
            <div className={`p-4 rounded-2xl ${card.bg} ${card.color} border`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{loading ? '...' : card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-50 p-4 rounded-[32px] border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm câu hỏi hoặc từ khóa..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white outline-none text-sm font-semibold transition-all text-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-500 outline-none cursor-pointer hover:bg-slate-50"
          >
            <option value="ALL">Lọc độ khó (Tất cả)</option>
            <option value="Dễ">Dễ</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Khó">Khó</option>
          </select>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-slate-50 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="bg-white/30">
              <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Câu hỏi</th>
              <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Chủ đề</th>
              <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Độ khó</th>
              <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Thống kê</th>
              <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest">
                  ĐANG KẾT NỐI KHO CÂU HỎI DI SẢN...
                </td>
              </tr>
            ) : filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic">
                  Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              filteredQuestions.map((q) => {
                let diffBadge = "text-emerald-600 bg-emerald-50 border border-emerald-100";
                if (q.difficulty === 'Khó') diffBadge = "text-rose-600 bg-rose-50 border border-rose-100";
                else if (q.difficulty === 'Trung bình') diffBadge = "text-amber-600 bg-amber-50 border border-amber-100";

                return (
                  <tr key={q.id} className="hover:bg-white/55 transition-colors group">
                    <td className="px-8 py-6 max-w-md">
                      <p className="font-black text-slate-800 text-sm leading-relaxed">{q.questionText}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Bài học: {q.lessonTitle}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3.5 py-1.5 bg-white text-emerald-600 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider">
                        {q.categoryName}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${diffBadge}`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-4 text-[10px]">
                        <div>
                          <span className="text-slate-400 font-bold block uppercase tracking-wider">Đúng</span>
                          <span className="font-black text-slate-700 text-xs block mt-0.5">{q.accuracy}%</span>
                        </div>
                        <div className="border-l border-slate-100 pl-4">
                          <span className="text-slate-400 font-bold block uppercase tracking-wider">Lượt làm</span>
                          <span className="font-black text-slate-700 text-xs block mt-0.5">{q.attempts}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(q)} 
                          className="p-2.5 bg-white text-slate-600 border border-slate-100 rounded-xl hover:bg-[#059669] hover:text-white transition-all shadow-sm"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(q)} 
                          className="p-2.5 bg-white text-slate-400 border border-slate-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Question Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-slate-100 rounded-[40px] p-10 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                {editingItem ? 'Cập nhật câu hỏi' : 'Thêm câu hỏi mới'}
              </h3>
              <button 
                onClick={closeModal} 
                className="p-2 hover:bg-slate-50 rounded-full transition-all"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Select Lesson */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Chọn bài học di sản liên kết
                </label>
                <select
                  value={formData.lessonId}
                  onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold text-slate-700 cursor-pointer"
                  required
                >
                  <option value="">-- Chọn bài học di sản --</option>
                  {lessons.map(l => (
                    <option key={l._id} value={l._id}>
                      {l.title} ({l.difficulty})
                    </option>
                  ))}
                </select>
              </div>

              {/* XP reward */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  XP thưởng cho bài trắc nghiệm này
                </label>
                <input
                  type="number"
                  value={formData.xpReward}
                  onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 50 })}
                  className="w-48 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold text-slate-700"
                  required
                />
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Danh sách câu hỏi ({formData.questionsList.length} câu)
                  </label>
                  {(
                    <button
                      type="button"
                      onClick={addNewQuestion}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black hover:bg-emerald-100 transition-all"
                    >
                      <Plus size={14} /> Thêm câu hỏi
                    </button>
                  )}
                </div>

                {formData.questionsList.map((q: any, qIdx: number) => (
                  <div key={qIdx} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                        Câu hỏi {qIdx + 1}
                      </span>
                      {formData.questionsList.length > 1 && (
                        <button type="button" onClick={() => removeQuestion(qIdx)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {/* Question Text */}
                    <input
                      type="text"
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                      placeholder="Nội dung câu hỏi trắc nghiệm..."
                      className="w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-100 outline-none text-sm font-bold text-slate-700"
                      required
                    />

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt: string, idx: number) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                            q.correctAnswerIndex === idx
                              ? 'bg-emerald-50 border-emerald-500'
                              : 'bg-white border-transparent border border-slate-100'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correctAnswer-${qIdx}`}
                            checked={q.correctAnswerIndex === idx}
                            onChange={() => handleQuestionChange(qIdx, 'correctAnswerIndex', idx)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, idx, e.target.value)}
                            placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                            className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-800"
                            required
                          />
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    <textarea
                      value={q.explanation}
                      onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                      placeholder="Lời giải chi tiết (không bắt buộc)..."
                      className="w-full px-5 py-3 rounded-2xl bg-white border border-slate-100 outline-none text-sm text-slate-600 h-20"
                    />
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-4 bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-[#059669] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#059669]/10 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Save size={18} /> {editingItem ? `Lưu ${formData.questionsList.length} câu hỏi` : `Xuất bản ${formData.questionsList.length} câu hỏi`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
