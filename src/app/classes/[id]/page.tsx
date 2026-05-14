'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, BookOpen, GraduationCap, Clock, Award, X } from 'lucide-react';
import api from '@/lib/api';

export default function ClassDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchClassDetails();
    }
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/classes/${id}`);
      setClassData(res.data);
    } catch (e) {
      console.error("Failed to fetch class details", e);
    } finally {
      setLoading(false);
    }
  };

  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);

  useEffect(() => {
    if (showAddTeacherModal) {
      fetchAllTeachers();
    }
  }, [showAddTeacherModal]);

  const fetchAllTeachers = async () => {
    try {
      const res = await api.get('/users/teachers');
      setAllTeachers(res.data);
    } catch (e) {
      console.error("Failed to fetch teachers", e);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa học sinh này khỏi lớp?")) {
      try {
        await api.post(`/classes/${id}/students/remove`, { studentId });
        fetchClassDetails();
      } catch (error) {
        alert("Lỗi khi xóa học sinh");
      }
    }
  };

  const handleRemoveCoTeacher = async (teacherId: string) => {
    if (window.confirm("Xóa giáo viên này khỏi lớp?")) {
      try {
        await api.post(`/classes/${id}/co-teachers/remove`, { teacherId });
        fetchClassDetails();
      } catch (error) {
        alert("Lỗi khi xóa giáo viên");
      }
    }
  };

  const handleAddCoTeacher = async (teacherId: string) => {
    try {
      await api.post(`/classes/${id}/co-teachers`, { teacherId });
      setShowAddTeacherModal(false);
      fetchClassDetails();
    } catch (error) {
      alert("Lỗi khi thêm giáo viên");
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#f8fafc] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-8 bg-[#f8fafc] min-h-screen">
        <div className="text-center py-20">
          <h2 className="text-2xl font-black text-slate-800">Không tìm thấy lớp học</h2>
          <button onClick={() => router.push('/classes')} className="mt-4 text-emerald-600 font-bold hover:underline">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/classes')}
          className="p-3 bg-white text-slate-500 hover:text-slate-900 rounded-2xl premium-shadow transition-all hover:scale-105"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Chi tiết Lớp: {classData.name}</h1>
          <p className="text-slate-500 font-bold mt-1 flex items-center gap-2">
            Mã lớp: <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{classData.code}</span>
            • GV: {classData.teacherId?.fullName || "Chưa xác định"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats */}
        <div className="space-y-8 lg:col-span-1">
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 premium-shadow">
            <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-widest">Tổng quan</h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                  <span>Tiến độ chương trình</span>
                  <span className="text-emerald-500">{classData.progress || 0}%</span>
                </div>
                <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                    style={{ width: `${classData.progress || 0}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-4 rounded-3xl">
                  <GraduationCap className="text-emerald-500 mb-2" size={24} />
                  <p className="text-2xl font-black text-emerald-700">{classData.studentIds?.length || 0}</p>
                  <p className="text-[10px] font-black text-emerald-600/70 uppercase">Học sinh</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-3xl">
                  <BookOpen className="text-indigo-500 mb-2" size={24} />
                  <p className="text-2xl font-black text-indigo-700">{classData.assignedLessons?.length || 0}</p>
                  <p className="text-[10px] font-black text-indigo-600/70 uppercase">Bài giảng</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Lists */}
        <div className="lg:col-span-2 space-y-8">
          {/* Students List */}
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 premium-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Danh sách Học sinh</h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">{classData.studentIds?.length || 0}</span>
            </div>

            {classData.studentIds && classData.studentIds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classData.studentIds.map((student: any) => (
                  <div key={student._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{student.fullName}</p>
                        <p className="text-xs text-slate-400">{student.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(student._id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa khỏi lớp"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <Users className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-sm font-bold text-slate-400">Chưa có học sinh nào tham gia lớp này</p>
                <p className="text-xs text-slate-400 mt-1">Cung cấp mã lớp <span className="font-bold text-slate-700">{classData.code}</span> cho học sinh để tham gia</p>
              </div>
            )}
          </div>

          {/* Co-Teachers List */}
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 premium-shadow">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Giáo viên bộ môn</h3>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">{classData.coTeacherIds?.length || 0}</span>
              </div>
              <button 
                onClick={() => setShowAddTeacherModal(true)}
                className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-100 transition-colors"
              >
                <Users size={20} />
              </button>
            </div>

            {classData.coTeacherIds && classData.coTeacherIds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classData.coTeacherIds.map((teacher: any) => (
                  <div key={teacher._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
                        {teacher.fullName ? teacher.fullName.charAt(0).toUpperCase() : 'T'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{teacher.fullName}</p>
                        <p className="text-[10px] uppercase font-black text-emerald-500">Giáo viên bộ môn</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCoTeacher(teacher._id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm font-bold text-slate-400">Chưa có GV bộ môn tham gia</p>
              </div>
            )}
          </div>

          {/* Lessons List */}
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 premium-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Bài giảng của lớp</h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">{classData.assignedLessons?.length || 0}</span>
            </div>

            {classData.assignedLessons && classData.assignedLessons.length > 0 ? (
              <div className="space-y-4">
                {classData.assignedLessons.map((lesson: any) => (
                  <div key={lesson._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center border border-slate-100">
                        {lesson.imageUrl ? <img src={lesson.imageUrl} className="w-full h-full object-cover" /> : <BookOpen size={20} className="text-emerald-500" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{lesson.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">{lesson.category}</span>
                          <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><Clock size={10} /> {lesson.estimatedMinutes} phút</span>
                          <span className="text-[10px] font-black uppercase text-amber-500 flex items-center gap-1"><Award size={10} /> {lesson.xpReward} XP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <BookOpen className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-sm font-bold text-slate-400">Chưa có bài giảng nào</p>
                <p className="text-xs text-slate-400 mt-1">Hãy vào phần CMS Bài học để gán bài cho lớp này</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add Teacher Modal */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-8 premium-shadow animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase">Thêm Giáo viên</h3>
              <button onClick={() => setShowAddTeacherModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
              {allTeachers.filter(t => !classData.coTeacherIds?.some((ct: any) => ct._id === t._id) && t._id !== classData.teacherId?._id).length > 0 ? (
                allTeachers
                  .filter(t => !classData.coTeacherIds?.some((ct: any) => ct._id === t._id) && t._id !== classData.teacherId?._id)
                  .map((teacher: any) => (
                    <div key={teacher._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                          {teacher.fullName ? teacher.fullName.charAt(0).toUpperCase() : 'T'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{teacher.fullName}</p>
                          <p className="text-xs text-slate-400">{teacher.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddCoTeacher(teacher._id)}
                        className="px-4 py-2 bg-emerald-500 text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-colors"
                      >
                        THÊM
                      </button>
                    </div>
                  ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-400 font-bold">Không còn giáo viên nào để thêm</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
