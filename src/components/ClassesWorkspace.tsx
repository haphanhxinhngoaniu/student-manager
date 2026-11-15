'use client';

import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import AcademyShell from './AcademyShell';
import { useAcademyWorkspace } from '@/lib/academy-store';
import { formatVnd } from '@/lib/vietqr';
import type { AcademyStudent, ClassRoom } from '@/lib/academy';

export default function ClassesWorkspace() {
  const {
    classes,
    students,
    settings,
    saveClass,
    deleteClass,
    saveAcademyStudent,
    deleteAcademyStudent,
  } = useAcademyWorkspace();

  const isTeacher = settings.currentRole === 'teacher';
  const [selectedClassId, setSelectedClassId] = useState<string>(
    () => classes[0]?.id ?? 'all'
  );

  // Class form modal state
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [className, setClassName] = useState('');
  const [classSubject, setClassSubject] = useState('Toán học');
  const [classGrade, setClassGrade] = useState('Lớp 9');
  const [classSchedule, setClassSchedule] = useState('Thứ 3 & Thứ 6 · 18:00 - 19:30');
  const [classFee, setClassFee] = useState('180000');
  const [classTeacher, setClassTeacher] = useState(settings.teacherName);
  const [classAssistant, setClassAssistant] = useState('Thầy Minh Đức');
  const [classError, setClassError] = useState('');

  // Student form modal state
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<AcademyStudent | null>(null);
  const [stCode, setStCode] = useState('');
  const [stName, setStName] = useState('');
  const [stClassId, setStClassId] = useState(classes[0]?.id ?? '');
  const [stParentName, setStParentName] = useState('');
  const [stPhone, setStPhone] = useState('');
  const [stZalo, setStZalo] = useState('');
  const [stStatus, setStStatus] = useState<'Active' | 'Paused'>('Active');
  const [stError, setStError] = useState('');

  const openCreateClass = () => {
    setEditingClass(null);
    setClassName('');
    setClassSubject('Toán học');
    setClassGrade('Lớp 9');
    setClassSchedule('Thứ 2 & Thứ 5 · 18:00 - 19:30');
    setClassFee('180000');
    setClassTeacher(settings.teacherName);
    setClassAssistant(settings.assistants[0]?.name ?? 'Thầy Minh Đức');
    setClassError('');
    setClassModalOpen(true);
  };

  const openEditClass = (cls: ClassRoom) => {
    setEditingClass(cls);
    setClassName(cls.name);
    setClassSubject(cls.subject);
    setClassGrade(cls.gradeLevel);
    setClassSchedule(cls.schedule);
    setClassFee(String(cls.sessionFee));
    setClassTeacher(cls.teacherName);
    setClassAssistant(cls.assistantName);
    setClassError('');
    setClassModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    const fee = Number(classFee);
    if (!className.trim() || !classSubject.trim() || Number.isNaN(fee) || fee < 0) {
      setClassError('Vui lòng nhập đầy đủ tên lớp, môn học và đơn giá học phí hợp lệ.');
      return;
    }
    const payload: ClassRoom = {
      id: editingClass?.id ?? `cls-${Date.now()}`,
      name: className.trim(),
      subject: classSubject.trim(),
      gradeLevel: classGrade.trim() || 'THCS',
      schedule: classSchedule.trim() || 'Chưa xếp lịch',
      sessionFee: Math.round(fee),
      teacherName: classTeacher.trim() || settings.teacherName,
      assistantName: classAssistant.trim() || 'Chưa phân công',
    };
    saveClass(payload);
    setSelectedClassId(payload.id);
    setClassModalOpen(false);
  };

  const openCreateStudent = () => {
    const defaultClass =
      selectedClassId !== 'all' ? selectedClassId : classes[0]?.id ?? '';
    setEditingStudent(null);
    setStCode(`HS${String(students.length + 1).padStart(3, '0')}`);
    setStName('');
    setStClassId(defaultClass);
    setStParentName('');
    setStPhone('');
    setStZalo('');
    setStStatus('Active');
    setStError('');
    setStudentModalOpen(true);
  };

  const openEditStudent = (st: AcademyStudent) => {
    setEditingStudent(st);
    setStCode(st.studentCode);
    setStName(st.fullName);
    setStClassId(st.classId);
    setStParentName(st.parentName);
    setStPhone(st.parentPhone);
    setStZalo(st.parentZalo);
    setStStatus(st.status);
    setStError('');
    setStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stCode.trim() || !stName.trim() || !stClassId) {
      setStError('Vui lòng nhập mã học sinh, họ tên và chọn lớp học.');
      return;
    }
    const payload: AcademyStudent = {
      id: editingStudent?.id ?? `ast-${Date.now()}`,
      studentCode: stCode.trim().toUpperCase(),
      fullName: stName.trim(),
      classId: stClassId,
      parentName: stParentName.trim() || 'Phụ huynh',
      parentPhone: stPhone.trim() || '0900000000',
      parentZalo: stZalo.trim() || stPhone.trim() || '0900000000',
      status: stStatus,
    };
    saveAcademyStudent(payload);
    setStudentModalOpen(false);
  };

  const visibleStudents = useMemo(() => {
    if (selectedClassId === 'all') return students;
    return students.filter((s) => s.classId === selectedClassId);
  }, [selectedClassId, students]);

  const classMap = useMemo(() => {
    const map = new Map<string, ClassRoom>();
    for (const c of classes) map.set(c.id, c);
    return map;
  }, [classes]);

  const headerActions = (
    <>
      {isTeacher && (
        <button
          type="button"
          onClick={openCreateClass}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm lớp học
        </button>
      )}
      <button
        type="button"
        onClick={openCreateStudent}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Thêm học sinh
      </button>
    </>
  );

  return (
    <AcademyShell
      title="Lớp học & Học sinh"
      subtitle="Quản lý danh sách lớp"
      headerActions={headerActions}
    >
      {!isTeacher && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3.5 py-2.5">
          Đang ở vai trò Trợ giảng: Bạn có thể thêm/cập nhật thông tin học sinh và SĐT Zalo phụ huynh. Chức năng tạo/xóa lớp và chỉnh học phí chỉ dành cho Giáo viên.
        </p>
      )}

      {/* Classes Cards */}
      <section aria-label="Danh sách lớp học" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const count = students.filter((s) => s.classId === cls.id).length;
          const active = selectedClassId === cls.id;
          return (
            <article
              key={cls.id}
              className={`bg-white border rounded-lg p-4 space-y-3 transition-colors ${
                active ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-blue-700">
                    {cls.subject} · {cls.gradeLevel}
                  </p>
                  <h2
                    className="text-base font-semibold text-slate-900 mt-0.5"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {cls.name}
                  </h2>
                </div>
                {isTeacher && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditClass(cls)}
                      aria-label={`Chỉnh sửa lớp ${cls.name}`}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteClass(cls.id)}
                      aria-label={`Xóa lớp ${cls.name}`}
                      className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>Lịch học: {cls.schedule}</p>
                <p>
                  Giáo viên: <strong className="text-slate-800">{cls.teacherName}</strong> ·
                  Trợ giảng: <strong className="text-slate-800">{cls.assistantName}</strong>
                </p>
                <p className="font-mono tabular-nums">
                  Học phí: <strong className="text-slate-900">{formatVnd(cls.sessionFee)}</strong> / buổi
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono tabular-nums text-slate-600">
                  <Users className="w-3.5 h-3.5" />
                  {count} học sinh
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedClassId(active ? 'all' : cls.id)
                  }
                  className="text-xs font-medium text-blue-700 hover:text-blue-900"
                >
                  {active ? 'Xem tất cả lớp' : 'Lọc danh sách lớp'}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* Students Table */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Danh sách học sinh ({visibleStudents.length})
          </h2>
          <select
            aria-label="Lọc học sinh theo lớp"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
          >
            <option value="all">Tất cả lớp ({students.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                <th className="py-2.5 px-4 whitespace-nowrap">Mã HS</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Họ và tên</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Lớp học</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Phụ huynh</th>
                <th className="py-2.5 px-4 whitespace-nowrap">SĐT / Zalo PH</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Trạng thái</th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {visibleStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                    {st.studentCode}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                    {st.fullName}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {classMap.get(st.classId)?.name ?? 'Chưa phân lớp'}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {st.parentName}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                    {st.parentZalo}
                  </td>
                  <td className="py-2.5 px-4 text-xs whitespace-nowrap">
                    <span
                      className={
                        st.status === 'Active'
                          ? 'text-emerald-700 font-medium'
                          : 'text-amber-700 font-medium'
                      }
                    >
                      {st.status === 'Active' ? 'Đang học' : 'Tạm nghỉ'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditStudent(st)}
                        aria-label={`Sửa thông tin ${st.fullName}`}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAcademyStudent(st.id)}
                        aria-label={`Xóa ${st.fullName}`}
                        className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Class Modal */}
      {classModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Thông tin lớp học"
        >
          <form
            onSubmit={handleSaveClass}
            className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-5 space-y-4"
          >
            <h2 className="text-base font-semibold text-slate-900">
              {editingClass ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tên lớp học
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="VD: Toán Nâng Cao 8B"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Môn học
                </label>
                <input
                  type="text"
                  value={classSubject}
                  onChange={(e) => setClassSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Khối lớp
                </label>
                <input
                  type="text"
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Học phí / buổi (VNĐ)
                </label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={classFee}
                  onChange={(e) => setClassFee(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Lịch học
                </label>
                <input
                  type="text"
                  value={classSchedule}
                  onChange={(e) => setClassSchedule(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Giáo viên phụ trách
                </label>
                <input
                  type="text"
                  value={classTeacher}
                  onChange={(e) => setClassTeacher(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Trợ giảng
                </label>
                <input
                  type="text"
                  value={classAssistant}
                  onChange={(e) => setClassAssistant(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
            </div>

            {classError && <p className="text-xs text-rose-700">{classError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClassModalOpen(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800"
              >
                Lưu lớp học
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student Modal */}
      {studentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Thông tin học sinh"
        >
          <form
            onSubmit={handleSaveStudent}
            className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-5 space-y-4"
          >
            <h2 className="text-base font-semibold text-slate-900">
              {editingStudent ? 'Cập nhật học sinh' : 'Thêm học sinh vào lớp'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mã học sinh
                </label>
                <input
                  type="text"
                  value={stCode}
                  onChange={(e) => setStCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={stName}
                  onChange={(e) => setStName(e.target.value)}
                  placeholder="VD: Đỗ Minh Khôi"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Lớp học
                </label>
                <select
                  value={stClassId}
                  onChange={(e) => setStClassId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={stStatus}
                  onChange={(e) => setStStatus(e.target.value as 'Active' | 'Paused')}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                >
                  <option value="Active">Đang học</option>
                  <option value="Paused">Tạm nghỉ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tên phụ huynh
                </label>
                <input
                  type="text"
                  value={stParentName}
                  onChange={(e) => setStParentName(e.target.value)}
                  placeholder="VD: Chị Nguyễn Lan"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  SĐT / Zalo phụ huynh
                </label>
                <input
                  type="text"
                  value={stZalo}
                  onChange={(e) => {
                    setStZalo(e.target.value);
                    setStPhone(e.target.value);
                  }}
                  placeholder="0912345678"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md"
                />
              </div>
            </div>

            {stError && <p className="text-xs text-rose-700">{stError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStudentModalOpen(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800"
              >
                Lưu học sinh
              </button>
            </div>
          </form>
        </div>
      )}
    </AcademyShell>
  );
}
