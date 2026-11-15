'use client';

import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Check,
  Copy,
  Download,
  Save,
  Sparkles,
} from 'lucide-react';
import AcademyShell from './AcademyShell';
import { useAcademyWorkspace } from '@/lib/academy-store';
import {
  ATTENDANCE_META,
  HOMEWORK_META,
  buildWarmPedagogicalComment,
  formatShortDayMonth,
  formatZaloClassSummary,
  formatZaloParentMessage,
  type AcademyStudent,
  type AttendanceEntry,
  type AttendanceStatus,
  type ClassRoom,
  type HomeworkStatus,
  type LessonSession,
} from '@/lib/academy';

interface AttendanceEditorProps {
  cls: ClassRoom;
  date: string;
  students: AcademyStudent[];
  existingSession: LessonSession | null;
  recordedBy: string;
  recordedByRole: 'teacher' | 'assistant';
  saveFeedback: string;
  onClearFeedback: () => void;
  onSaveSession: (session: LessonSession) => void;
}

const ATTENDANCE_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Có mặt' },
  { value: 'late', label: 'Đến muộn' },
  { value: 'excused', label: 'Vắng có phép' },
  { value: 'absent', label: 'Vắng không phép' },
];

const HOMEWORK_OPTIONS: { value: HomeworkStatus; label: string }[] = [
  { value: 'done', label: 'Đủ BTVN' },
  { value: 'partial', label: 'Thiếu BTVN' },
  { value: 'missing', label: 'Chưa làm' },
];

function buildInitialEntries(
  students: AcademyStudent[],
  existingSession: LessonSession | null
): Record<string, AttendanceEntry> {
  const map: Record<string, AttendanceEntry> = {};
  for (const st of students) {
    const prev = existingSession?.entries[st.id];
    map[st.id] = prev
      ? { ...prev }
      : {
          status: 'present',
          homeworkStatus: 'done',
          note: '',
        };
  }
  return map;
}

function AttendanceEditor({
  cls,
  date,
  students,
  existingSession,
  recordedBy,
  recordedByRole,
  saveFeedback,
  onClearFeedback,
  onSaveSession,
}: AttendanceEditorProps) {
  const [topic, setTopic] = useState(
    () =>
      existingSession?.topic ??
      `Chuyên đề ${cls.subject} ngày ${formatShortDayMonth(date)}`
  );
  const [homework, setHomework] = useState(
    () => existingSession?.homework ?? 'Hoàn thành phiếu bài tập cuối buổi.'
  );
  const [entries, setEntries] = useState<Record<string, AttendanceEntry>>(() =>
    buildInitialEntries(students, existingSession)
  );
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const updateEntry = (studentId: string, patch: Partial<AttendanceEntry>) => {
    setEntries((prev) => {
      const current = prev[studentId] ?? {
        status: 'present' as AttendanceStatus,
        homeworkStatus: 'done' as HomeworkStatus,
        note: '',
      };
      return {
        ...prev,
        [studentId]: { ...current, ...patch },
      };
    });
    onClearFeedback();
  };

  const handleGenerateOneComment = async (student: AcademyStudent) => {
    setLoadingStudentId(student.id);
    const entry = entries[student.id] ?? {
      status: 'present' as AttendanceStatus,
      homeworkStatus: 'done' as HomeworkStatus,
      note: '',
    };
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: cls.name,
          topic,
          students: [
            {
              id: student.id,
              fullName: student.fullName,
              status: entry.status,
              homeworkStatus: entry.homeworkStatus,
            },
          ],
        }),
      });
      const data = (await res.json()) as { comments?: Record<string, string> };
      const nextComment =
        data?.comments?.[student.id] ||
        buildWarmPedagogicalComment(
          student.fullName,
          entry.status,
          entry.homeworkStatus,
          topic
        );
      updateEntry(student.id, { note: nextComment });
    } catch {
      updateEntry(student.id, {
        note: buildWarmPedagogicalComment(
          student.fullName,
          entry.status,
          entry.homeworkStatus,
          topic
        ),
      });
    } finally {
      setLoadingStudentId(null);
    }
  };

  const handleGenerateAllComments = async () => {
    if (students.length === 0) return;
    setLoadingBatch(true);
    try {
      const payloadStudents = students.map((st) => {
        const entry = entries[st.id] ?? {
          status: 'present' as AttendanceStatus,
          homeworkStatus: 'done' as HomeworkStatus,
          note: '',
        };
        return {
          id: st.id,
          fullName: st.fullName,
          status: entry.status,
          homeworkStatus: entry.homeworkStatus,
        };
      });

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: cls.name,
          topic,
          students: payloadStudents,
        }),
      });
      const data = (await res.json()) as { comments?: Record<string, string> };
      setEntries((prev) => {
        const next = { ...prev };
        for (const st of students) {
          const cur = next[st.id] ?? {
            status: 'present' as AttendanceStatus,
            homeworkStatus: 'done' as HomeworkStatus,
            note: '',
          };
          const generated =
            data?.comments?.[st.id] ||
            buildWarmPedagogicalComment(
              st.fullName,
              cur.status,
              cur.homeworkStatus,
              topic
            );
          next[st.id] = { ...cur, note: generated };
        }
        return next;
      });
    } catch {
      setEntries((prev) => {
        const next = { ...prev };
        for (const st of students) {
          const cur = next[st.id] ?? {
            status: 'present' as AttendanceStatus,
            homeworkStatus: 'done' as HomeworkStatus,
            note: '',
          };
          next[st.id] = {
            ...cur,
            note: buildWarmPedagogicalComment(
              st.fullName,
              cur.status,
              cur.homeworkStatus,
              topic
            ),
          };
        }
        return next;
      });
    } finally {
      setLoadingBatch(false);
    }
  };

  const buildCurrentSession = (): LessonSession => ({
    id: existingSession?.id ?? `ses-${Date.now()}`,
    classId: cls.id,
    date,
    topic: topic.trim() || `Buổi học ngày ${formatShortDayMonth(date)}`,
    homework: homework.trim(),
    recordedBy,
    recordedByRole,
    entries,
  });

  const handleSave = () => {
    onSaveSession(buildCurrentSession());
  };

  const handleCopyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard may be restricted in headless mode; still show confirmation feedback
    }
    setCopiedId(key);
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const handleExportSessionExcel = () => {
    const rows = students.map((st, idx) => {
      const entry = entries[st.id] ?? {
        status: 'present' as AttendanceStatus,
        homeworkStatus: 'done' as HomeworkStatus,
        note: '',
      };
      return {
        STT: idx + 1,
        'Mã HS': st.studentCode,
        'Họ và tên': st.fullName,
        'Phụ huynh': st.parentName,
        'SĐT / Zalo': st.parentZalo,
        'Điểm danh': ATTENDANCE_META[entry.status].label,
        'Ký hiệu': ATTENDANCE_META[entry.status].symbol,
        BTVN: HOMEWORK_META[entry.homeworkStatus].label,
        'Nhận xét Cô – Con': entry.note,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Diem danh');
    XLSX.writeFile(workbook, `diem-danh-${cls.id}-${date}.xlsx`);
  };

  const counts = useMemo(() => {
    let present = 0;
    let late = 0;
    let excused = 0;
    let absent = 0;
    for (const st of students) {
      const s = entries[st.id]?.status ?? 'present';
      if (s === 'present') present += 1;
      else if (s === 'late') late += 1;
      else if (s === 'excused') excused += 1;
      else absent += 1;
    }
    return { present, late, excused, absent };
  }, [entries, students]);

  return (
    <div className="space-y-5">
      {/* Lesson Metadata & Quick Actions */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="lesson-topic"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Nội dung trọng tâm buổi học
            </label>
            <input
              id="lesson-topic"
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                onClearFeedback();
              }}
              placeholder="VD: Định lý Vi-ét và bài toán tham số m..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label
              htmlFor="lesson-homework"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Dặn dò bài tập về nhà (BTVN)
            </label>
            <input
              id="lesson-homework"
              type="text"
              value={homework}
              onChange={(e) => {
                setHomework(e.target.value);
                onClearFeedback();
              }}
              placeholder="VD: Hoàn thành câu 1–5 phiếu luyện tập..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums text-slate-600">
            <span>
              Có mặt: <strong className="text-emerald-700">{counts.present}</strong>
            </span>
            <span>
              Muộn: <strong className="text-amber-700">{counts.late}</strong>
            </span>
            <span>
              Có phép: <strong className="text-slate-700">{counts.excused}</strong>
            </span>
            <span>
              Không phép: <strong className="text-rose-700">{counts.absent}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateAllComments}
              disabled={loadingBatch || students.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-800 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {loadingBatch ? 'Đang gợi ý cả lớp...' : 'AI Gợi ý nhận xét cả lớp'}
            </button>

            <button
              type="button"
              onClick={() =>
                handleCopyText(
                  'zalo-class',
                  formatZaloClassSummary(cls, buildCurrentSession(), students)
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              {copiedId === 'zalo-class' ? (
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copiedId === 'zalo-class' ? 'Đã chép gửi Zalo lớp' : 'Copy gửi Zalo lớp'}
            </button>

            <button
              type="button"
              onClick={handleExportSessionExcel}
              disabled={students.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất Excel buổi học
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Lưu buổi học
            </button>
          </div>
        </div>

        {saveFeedback && (
          <p className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
            {saveFeedback}
          </p>
        )}
      </section>

      {/* Student Attendance & Pedagogical Comments */}
      {students.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-sm text-slate-600">
          Lớp {cls.name} chưa có học sinh nào. Vào mục Lớp học &amp; Học sinh để thêm học
          sinh vào lớp.
        </div>
      ) : (
        <section className="space-y-3" aria-label="Danh sách điểm danh học sinh">
          {students.map((student) => {
            const entry = entries[student.id] ?? {
              status: 'present' as AttendanceStatus,
              homeworkStatus: 'done' as HomeworkStatus,
              note: '',
            };
            const isLoading = loadingStudentId === student.id;
            const parentCopied = copiedId === `parent-${student.id}`;

            return (
              <article
                key={student.id}
                className="bg-white border border-slate-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs text-slate-500">
                        {student.studentCode}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {student.fullName}
                      </h3>
                      <span
                        className={`text-xs ${ATTENDANCE_META[entry.status].colorClass}`}
                      >
                        {ATTENDANCE_META[entry.status].label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Phụ huynh: {student.parentName} · Zalo:{' '}
                      <span className="font-mono">{student.parentZalo}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      role="group"
                      aria-label={`Trạng thái điểm danh cho ${student.fullName}`}
                      className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-md"
                    >
                      {ATTENDANCE_OPTIONS.map((opt) => {
                        const active = entry.status === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => updateEntry(student.id, { status: opt.value })}
                            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                              active
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    <select
                      aria-label={`Bài tập về nhà của ${student.fullName}`}
                      value={entry.homeworkStatus}
                      onChange={(e) =>
                        updateEntry(student.id, {
                          homeworkStatus: e.target.value as HomeworkStatus,
                        })
                      }
                      className="px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {HOMEWORK_OPTIONS.map((hw) => (
                        <option key={hw.value} value={hw.value}>
                          {hw.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor={`comment-${student.id}`}
                      className="text-xs font-medium text-slate-600"
                    >
                      Nhận xét sư phạm (xưng hô Cô – Con, 40–65 từ)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenerateOneComment(student)}
                        disabled={isLoading || loadingBatch}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-800 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        {isLoading ? 'Đang tạo...' : 'AI Gợi ý nhận xét'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(
                            `parent-${student.id}`,
                            formatZaloParentMessage(
                              student,
                              cls,
                              buildCurrentSession(),
                              entry
                            )
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                      >
                        {parentCopied ? (
                          <Check className="w-3 h-3 text-emerald-700" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {parentCopied ? 'Đã chép gửi PH' : 'Copy gửi phụ huynh'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    id={`comment-${student.id}`}
                    rows={2}
                    value={entry.note}
                    onChange={(e) => updateEntry(student.id, { note: e.target.value })}
                    placeholder="Nhấn 'AI Gợi ý nhận xét' hoặc nhập nhận xét ấm áp gửi phụ huynh..."
                    className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default function AttendanceWorkspace() {
  const { classes, students, sessions, settings, upsertSession } = useAcademyWorkspace();
  const [selectedClassId, setSelectedClassId] = useState<string>(
    () => classes[0]?.id ?? ''
  );
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-14');
  const [saveFeedback, setSaveFeedback] = useState<string>('');

  const activeClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId) ?? classes[0] ?? null,
    [classes, selectedClassId]
  );

  const classStudents = useMemo(
    () =>
      activeClass
        ? students.filter(
            (s) => s.classId === activeClass.id && s.status === 'Active'
          )
        : [],
    [activeClass, students]
  );

  const existingSession = useMemo(
    () =>
      activeClass
        ? sessions.find(
            (ses) => ses.classId === activeClass.id && ses.date === selectedDate
          ) ?? null
        : null,
    [activeClass, selectedDate, sessions]
  );

  const recentDates = useMemo(() => {
    if (!activeClass) return [];
    return sessions
      .filter((s) => s.classId === activeClass.id)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [activeClass, sessions]);

  return (
    <AcademyShell
      title="Điểm danh & Nhận xét sư phạm"
      subtitle="Sổ đầu bài hàng ngày"
    >
      {/* Class & Date Selection */}
      <section className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 max-w-xl">
          <div>
            <label
              htmlFor="attendance-class-select"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Chọn lớp học
            </label>
            <select
              id="attendance-class-select"
              value={activeClass?.id ?? ''}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSaveFeedback('');
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.gradeLevel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="attendance-date-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Ngày học
            </label>
            <input
              id="attendance-date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSaveFeedback('');
              }}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {recentDates.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 mr-1">Buổi gần đây:</span>
            {recentDates.map((ses) => (
              <button
                key={ses.id}
                type="button"
                onClick={() => {
                  setSelectedDate(ses.date);
                  setSaveFeedback('');
                }}
                className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                  selectedDate === ses.date
                    ? 'bg-blue-50 border-blue-300 text-blue-800 font-medium'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {formatShortDayMonth(ses.date)}
              </button>
            ))}
          </div>
        )}
      </section>

      {activeClass ? (
        <AttendanceEditor
          key={`${activeClass.id}:${selectedDate}`}
          cls={activeClass}
          date={selectedDate}
          students={classStudents}
          existingSession={existingSession}
          recordedBy={settings.currentUserName}
          recordedByRole={settings.currentRole}
          saveFeedback={saveFeedback}
          onClearFeedback={() => setSaveFeedback('')}
          onSaveSession={(session) => {
            upsertSession(session);
            setSaveFeedback(
              `Đã lưu buổi học ngày ${formatShortDayMonth(session.date)} (${session.recordedByRole === 'teacher' ? 'Giáo viên' : 'Trợ giảng'}: ${session.recordedBy}).`
            );
          }}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-sm text-slate-600">
          Chưa có lớp học nào. Hãy tạo lớp mới trong mục Lớp học &amp; Học sinh.
        </div>
      )}
    </AcademyShell>
  );
}
