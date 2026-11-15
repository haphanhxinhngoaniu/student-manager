'use client';

import { useMemo, useState } from 'react';
import { Calendar, Search, UserCheck } from 'lucide-react';
import AcademyShell from './AcademyShell';
import { useAcademyWorkspace } from '@/lib/academy-store';
import {
  ATTENDANCE_META,
  HOMEWORK_META,
  formatShortDayMonth,
} from '@/lib/academy';

export default function HistoryWorkspace() {
  const { classes, students, sessions } = useAcademyWorkspace();
  const [classFilter, setClassFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'teacher' | 'assistant'>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  const classMap = useMemo(() => {
    const map = new Map(classes.map((c) => [c.id, c]));
    return map;
  }, [classes]);

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sessions
      .filter((s) => (classFilter === 'all' ? true : s.classId === classFilter))
      .filter((s) => (roleFilter === 'all' ? true : s.recordedByRole === roleFilter))
      .filter((s) => (dateFilter ? s.date === dateFilter : true))
      .filter((s) =>
        q
          ? s.topic.toLowerCase().includes(q) ||
            s.homework.toLowerCase().includes(q) ||
            s.recordedBy.toLowerCase().includes(q)
          : true
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [classFilter, dateFilter, roleFilter, searchQuery, sessions]);

  const activeSession = useMemo(
    () =>
      filteredSessions.find((s) => s.id === selectedSessionId) ??
      filteredSessions[0] ??
      null,
    [filteredSessions, selectedSessionId]
  );

  const sessionStudents = useMemo(() => {
    if (!activeSession) return [];
    return students.filter((st) => st.classId === activeSession.classId);
  }, [activeSession, students]);

  return (
    <AcademyShell
      title="Lịch sử & Nhật ký bài giảng"
      subtitle="Tra cứu theo ngày và lớp"
    >
      {/* Filters */}
      <section className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <label htmlFor="history-search" className="sr-only">
            Tìm theo nội dung bài giảng hoặc người nhập
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="history-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm nội dung, BTVN, người nhập..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          aria-label="Lọc theo lớp"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-md"
        >
          <option value="all">Tất cả lớp học</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Lọc theo người nhập liệu"
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value as 'all' | 'teacher' | 'assistant')
          }
          className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-md"
        >
          <option value="all">Tất cả người nhập liệu</option>
          <option value="teacher">Giáo viên nhập</option>
          <option value="assistant">Trợ giảng nhập</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            aria-label="Lọc theo ngày"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="flex-1 px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-md"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="px-2.5 py-2 text-xs text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Xóa
            </button>
          )}
        </div>
      </section>

      {filteredSessions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-sm text-slate-600">
          Không tìm thấy buổi học nào khớp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Session List */}
          <section
            aria-label="Danh sách buổi học"
            className="lg:col-span-5 space-y-2.5"
          >
            {filteredSessions.map((ses) => {
              const cls = classMap.get(ses.classId);
              const selected = activeSession?.id === ses.id;
              return (
                <button
                  key={ses.id}
                  type="button"
                  onClick={() => setSelectedSessionId(ses.id)}
                  className={`w-full text-left bg-white border rounded-lg p-4 transition-colors space-y-1.5 ${
                    selected
                      ? 'border-blue-500 ring-1 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-mono text-slate-600">
                      <Calendar className="w-3.5 h-3.5" />
                      {ses.date}
                    </span>
                    <span
                      className={
                        ses.recordedByRole === 'teacher'
                          ? 'text-blue-800 font-medium'
                          : 'text-emerald-700 font-medium'
                      }
                    >
                      {ses.recordedByRole === 'teacher' ? 'Giáo viên' : 'Trợ giảng'}:{' '}
                      {ses.recordedBy}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    {cls?.name ?? ses.classId}
                  </p>
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {ses.topic}
                  </h3>
                </button>
              );
            })}
          </section>

          {/* Session Detail */}
          {activeSession && (
            <section className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <div className="border-b border-slate-200 pb-4 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium text-blue-700">
                    {classMap.get(activeSession.classId)?.name} · Ngày{' '}
                    {formatShortDayMonth(activeSession.date)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    Người nhập:{' '}
                    {activeSession.recordedByRole === 'teacher'
                      ? 'Giáo viên'
                      : 'Trợ giảng'}{' '}
                    ({activeSession.recordedBy})
                  </span>
                </div>
                <h2
                  className="text-lg font-semibold text-slate-900"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {activeSession.topic}
                </h2>
                {activeSession.homework && (
                  <p className="text-xs text-slate-600">
                    Dặn dò BTVN: <strong className="text-slate-800">{activeSession.homework}</strong>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {sessionStudents.map((st) => {
                  const entry = activeSession.entries[st.id];
                  const status = entry?.status ?? 'present';
                  const hw = entry?.homeworkStatus ?? 'done';
                  return (
                    <div
                      key={st.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-slate-900">
                          <span className="font-mono text-slate-500 mr-2">
                            {st.studentCode}
                          </span>
                          {st.fullName}
                        </span>
                        <span className="space-x-3">
                          <span className={ATTENDANCE_META[status].colorClass}>
                            {ATTENDANCE_META[status].label}
                          </span>
                          <span className="text-slate-600">
                            {HOMEWORK_META[hw].label}
                          </span>
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-700">
                        {entry?.note || 'Chưa có nhận xét chi tiết.'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </AcademyShell>
  );
}
