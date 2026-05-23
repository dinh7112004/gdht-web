'use client';

import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, Clock, AlertCircle, Search, 
  Filter, Download, ExternalLink, User, BookOpen,
  Award, Zap, X, ChevronRight, Eye, HelpCircle,
  Activity, Check, XCircle, GraduationCap
} from 'lucide-react';
import api from '@/lib/api';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [quizDetails, setQuizDetails] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      // Fetch classes, users, and lessons in parallel
      const [classesRes, usersRes, lessonsRes] = await Promise.all([
        api.get('/classes'),
        api.get('/users'),
        api.get('/lessons')
      ]);

      // Save classes to state
      setClasses(classesRes.data || []);

      // 1. Create a class mapping for student IDs
      const studentClassMap: { [studentId: string]: string } = {};
      classesRes.data.forEach((cls: any) => {
        (cls.studentIds || []).forEach((student: any) => {
          const sId = typeof student === 'string' ? student : student._id;
          if (sId) {
            studentClassMap[sId] = cls.name;
          }
        });
      });

      // 2. Create a lessons mapping for lesson IDs
      const lessonsMap: { [lessonId: string]: { title: string; category: string } } = {};
      lessonsRes.data.forEach((l: any) => {
        lessonsMap[l._id] = {
          title: l.title || "Bài học di sản",
          category: l.category || "Di sản"
        };
      });

      // 3. Extract all completed lessons from students
      const students = usersRes.data.filter((u: any) => u.role === 'STUDENT');
      const allSubmissions: any[] = [];

      students.forEach((student: any) => {
        (student.completedLessons || []).forEach((cl: any) => {
          const lessonInfo = lessonsMap[cl.lessonId] || { title: "Toán học di sản", category: "Di sản" };
          
          allSubmissions.push({
            id: `${student._id}-${cl.lessonId}-${cl.completedAt}`,
            studentName: student.fullName || "Học sinh ẩn danh",
            studentEmail: student.email || "",
            studentId: student._id,
            className: studentClassMap[student._id] || "Chương trình chung",
            lessonId: cl.lessonId,
            lessonTitle: lessonInfo.title,
            category: lessonInfo.category,
            submittedAt: cl.completedAt,
            score: cl.score ?? 0,
            total: cl.total ?? 0,
            xp: cl.xpGained ?? 50,
            answers: cl.answers || []
          });
        });
      });

      // Sort by submittedAt descending
      allSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setSubmissions(allSubmissions);

    } catch (e) {
      console.error("Failed to fetch real submission activity", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (sub: any) => {
    setSelectedSub(sub);
    setQuizDetails(null);
    setQuizLoading(true);
    
    try {
      const res = await api.get(`/quizzes?lessonId=${sub.lessonId}`);
      const quizData = Array.isArray(res.data) ? res.data[0] : res.data;
      setQuizDetails(quizData);
    } catch (err) {
      console.error("Failed to fetch quiz details", err);
    } finally {
      setQuizLoading(false);
    }
  };

  // Dynamic stats calculated based on the selected class
  const classFilteredSubmissions = submissions.filter(s => selectedClass === 'ALL' || s.className === selectedClass);
  
  const totalSubmissions = classFilteredSubmissions.length;
  const perfectScores = classFilteredSubmissions.filter(s => s.score === s.total && s.total > 0).length;
  const activeStudents = new Set(classFilteredSubmissions.map(s => s.studentId)).size;
  const averageScorePercentage = totalSubmissions > 0 
    ? Math.round((classFilteredSubmissions.reduce((acc, curr) => acc + (curr.total > 0 ? (curr.score / curr.total) : 0), 0) / totalSubmissions) * 100)
    : 0;

  // Filtered submissions for the table (incorporates both Class Tab + Search query)
  const filteredSubmissions = classFilteredSubmissions.filter(sub => {
    const query = searchQuery.toLowerCase();
    return (
      sub.studentName.toLowerCase().includes(query) ||
      sub.className.toLowerCase().includes(query) ||
      sub.lessonTitle.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-10 min-h-screen animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 sm:mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
            Kết quả trắc nghiệm
          </h1>
          <p className="text-slate-500 font-bold mt-2">Theo dõi kết quả làm bài trắc nghiệm di sản tự động từ thiết bị di động</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-2 rounded-3xl border border-slate-100 flex items-center px-6 gap-3 shadow-sm">
             <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">
               Kết nối thời gian thực với App di động
             </p>
          </div>
        </div>
      </div>

      {/* Class Selector Tabs Bar */}
      <div className="mb-8">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
          Chọn lớp học để xem chi tiết
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedClass('ALL')}
            className={`px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider border-2 transition-all duration-300 flex items-center gap-2.5 ${
              selectedClass === 'ALL'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/10'
                : 'bg-white border-slate-200/60 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <GraduationCap size={16} />
            <span>Tất cả lớp học</span>
            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${
              selectedClass === 'ALL' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {submissions.length}
            </span>
          </button>

          {classes.map((cls) => {
            const count = submissions.filter(s => s.className === cls.name).length;
            return (
              <button
                key={cls._id}
                onClick={() => setSelectedClass(cls.name)}
                className={`px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider border-2 transition-all duration-300 flex items-center gap-2.5 ${
                  selectedClass === cls.name
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/10'
                    : 'bg-white border-slate-200/60 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <GraduationCap size={16} />
                <span>{cls.name}</span>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${
                  selectedClass === cls.name ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Lượt làm bài của lớp', value: totalSubmissions, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Điểm trung bình lớp', value: `${averageScorePercentage}%`, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
          { label: 'Số bài đạt điểm tối đa', value: perfectScores, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Sĩ số đã hoàn thành', value: activeStudents, icon: User, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} border`}>
                <stat.icon size={22} />
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-800">{loading ? '...' : stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Danh sách bài nộp</h2>
            <p className="text-slate-400 font-semibold text-xs mt-0.5">Quản lý và duyệt các bài thi trắc nghiệm.</p>
          </div>
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Tìm học sinh, bài thi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-sm transition-all"
              />
            </div>
            <button className="p-3 bg-white border border-slate-200/60 rounded-2xl text-slate-400 hover:text-slate-800 transition-all">
              <Filter size={20} />
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10">
              <Download size={18} />
              Xuất báo cáo
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Học sinh</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Lớp học</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Bài trắc nghiệm</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Kết quả</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold animate-pulse">
                    ĐANG TẢI DỮ LIỆU TỪ HỆ THỐNG DI ĐỘNG...
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic">
                    Chưa có lượt nộp bài nào được ghi nhận cho bộ lọc này.
                  </td>
                </tr>
              ) : filteredSubmissions.map((sub) => {
                const scorePercent = sub.total > 0 ? Math.round((sub.score / sub.total) * 100) : 0;
                let badgeStyle = "bg-rose-50 text-rose-600 border-rose-100";
                if (scorePercent >= 80) badgeStyle = "bg-emerald-50 text-emerald-600 border-emerald-100";
                else if (scorePercent >= 50) badgeStyle = "bg-amber-50 text-amber-600 border-amber-100";

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-sm">
                          {sub.studentName[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm">{sub.studentName}</p>
                          <p className="text-[10px] font-bold text-slate-400">{sub.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 border border-slate-100">
                        {sub.className}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-800 text-sm">{sub.lessonTitle}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-xl text-xs font-black border ${badgeStyle} flex items-center gap-1.5`}>
                          {sub.score}/{sub.total} điểm
                        </span>
                        <span className="text-[10px] font-black text-slate-400 flex items-center gap-0.5">
                          <Zap size={10} className="text-amber-500" fill="currentColor" />
                          +{sub.xp} XP
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleOpenDetail(sub)}
                        className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-black uppercase rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center gap-1.5 ml-auto"
                      >
                        <Eye size={12} /> Xem bài
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] border border-slate-200/60 shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            
            {/* Header Panel */}
            <div className="p-10 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
               <div>
                  <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    Bản ghi học tập chi tiết
                  </span>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase mt-3">
                    {selectedSub.studentName}
                  </h3>
                  <p className="text-slate-500 font-bold mt-1 text-xs uppercase tracking-widest">
                    {selectedSub.className} • Bài học: {selectedSub.lessonTitle}
                  </p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="text-right">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Điểm tự động</span>
                     <span className="text-3xl font-black text-emerald-600 tracking-tighter block mt-0.5">
                       {selectedSub.score}/{selectedSub.total}
                     </span>
                  </div>
                  <button 
                    onClick={() => setSelectedSub(null)}
                    className="p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/60 transition-all ml-4"
                  >
                     <X size={20} className="text-slate-400" />
                  </button>
               </div>
            </div>

            {/* Questions list */}
            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar space-y-8 bg-slate-50/30">
               {quizLoading ? (
                 <div className="py-20 text-center space-y-4">
                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang kết xuất bài làm của học sinh...</p>
                 </div>
               ) : !quizDetails || !quizDetails.questions || quizDetails.questions.length === 0 ? (
                 <div className="py-20 text-center space-y-3">
                   <HelpCircle size={48} className="text-slate-300 mx-auto" />
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Không tìm thấy ngân hàng câu hỏi phù hợp</p>
                   <p className="text-xs text-slate-400">Có thể dữ liệu câu hỏi đã bị thay đổi hoặc đã bị xóa khỏi hệ thống CMS.</p>
                 </div>
               ) : (
                 quizDetails.questions.map((q: any, qIdx: number) => {
                   const studentAnsIdx = selectedSub.answers[qIdx];
                   const correctAnsIdx = q.correctAnswerIndex;
                   const isAnswerCorrect = studentAnsIdx === correctAnsIdx;

                   return (
                     <div key={qIdx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                       {/* Correct / Incorrect Ribbon indicator */}
                       <div className={`absolute top-0 left-0 w-2 h-full ${isAnswerCorrect ? 'bg-emerald-500' : studentAnsIdx === undefined ? 'bg-slate-300' : 'bg-rose-500'}`} />
                       
                       <div className="flex justify-between items-start gap-4 mb-5 pl-2">
                          <h4 className="font-black text-slate-800 text-sm leading-relaxed flex-1">
                             <span className="text-emerald-600 font-black mr-2 text-sm">Câu {qIdx + 1}:</span> 
                             {q.questionText}
                          </h4>
                          <span className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
                            isAnswerCorrect 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : studentAnsIdx === undefined 
                                ? 'bg-slate-50 text-slate-500 border border-slate-100' 
                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            {isAnswerCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {isAnswerCorrect ? 'Chính xác' : studentAnsIdx === undefined ? 'Chưa trả lời' : 'Sai'}
                          </span>
                       </div>

                       {/* Options list */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                         {q.options.map((opt: string, optIdx: number) => {
                           const isSelected = studentAnsIdx === optIdx;
                           const isCorrect = optIdx === correctAnsIdx;

                           let optionBorder = "border-slate-100";
                           let optionBg = "bg-white";
                           let badgeBg = "bg-slate-100 text-slate-500";

                           if (isCorrect) {
                             optionBorder = "border-emerald-500";
                             optionBg = "bg-emerald-50 text-emerald-800 font-bold border-2";
                             badgeBg = "bg-emerald-500 text-white";
                           } else if (isSelected) {
                             optionBorder = "border-rose-500";
                             optionBg = "bg-rose-50 text-rose-800 font-bold border-2";
                             badgeBg = "bg-rose-500 text-white";
                           }

                           return (
                             <div 
                               key={optIdx} 
                               className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${optionBorder} ${optionBg}`}
                             >
                               <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${badgeBg}`}>
                                 {String.fromCharCode(65 + optIdx)}
                               </div>
                               <span className="text-xs font-semibold leading-relaxed flex-1">{opt}</span>
                               {isCorrect && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                               {isSelected && !isCorrect && <XCircle size={16} className="text-rose-600 shrink-0" />}
                             </div>
                           );
                         })}
                       </div>

                       {/* Explanation box */}
                       {q.explanation && (
                         <div className={`mt-6 p-4 rounded-2xl border text-xs leading-relaxed flex gap-3 items-start pl-2 ${
                           isAnswerCorrect 
                             ? 'bg-emerald-50/30 text-emerald-700 border-emerald-100/50' 
                             : 'bg-rose-50/30 text-rose-700 border-rose-100/50'
                         }`}>
                           <HelpCircle size={16} className="shrink-0 mt-0.5" />
                           <div>
                             <span className="font-black uppercase tracking-wider block mb-1 text-[9px]">Lời giải chi tiết</span>
                             {q.explanation}
                           </div>
                         </div>
                       )}

                     </div>
                   );
                 })
               )}
            </div>

            {/* Footer Panel */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
               <button 
                 onClick={() => setSelectedSub(null)}
                 className="flex-1 py-4 bg-white border border-slate-200/60 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
               >
                 ĐÓNG CỬA SỔ
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
