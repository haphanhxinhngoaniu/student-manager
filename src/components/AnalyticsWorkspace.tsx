'use client';

import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';
import AcademyShell from './AcademyShell';
import { useAcademyWorkspace } from '@/lib/academy-store';
import {
  buildMonthlyMatrixExcelRows,
  computeMonthlyAnalytics,
  formatShortDayMonth,
} from '@/lib/academy';

export default function AnalyticsWorkspace() {
  const { classes, students, sessions } = useAcademyWorkspace();
  const [selectedClassId, setSelectedClassId] = useState<string>(
    () => classes[0]?.id ?? ''
  );
  const [monthYYYYMM, setMonthYYYYMM] = useState<string>('2026-11');

  const activeClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId) ?? classes[0] ?? null,
    [classes, selectedClassId]
  );

  const analytics = useMemo(() => {
    if (!activeClass) {
      return { monthSessions: [], sessionBars: [], studentStats: [] };
    }
    return computeMonthlyAnalytics(activeClass, sessions, students, monthYYYYMM);
  }, [activeClass, monthYYYYMM, sessions, students]);

  const meanAttendancePercent = useMemo(() => {
    if (analytics.studentStats.length === 0) return 0;
    const sum = analytics.studentStats.reduce((acc, s) => acc + s.attendancePercent, 0);
    return Math.round(sum / analytics.studentStats.length);
  }, [analytics.studentStats]);

  const handleExportMatrixExcel = () => {
    if (!activeClass) return;
    const rows = buildMonthlyMatrixExcelRows(
      activeClass,
      sessions,
      students,
      monthYYYYMM
    );
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ma tran diem danh');
    XLSX.writeFile(workbook, `ma-tran-chuyen-can-${activeClass.id}-${monthYYYYMM}.xlsx`);
  };

  const headerActions = (
    <button
      type="button"
      onClick={handleExportMatrixExcel}
      disabled={!activeClass || analytics.studentStats.length === 0}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50 transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      Xuất Ma trận Excel (V/M/P/K)
    </button>
  );

  return (
    <AcademyShell
      title="Thống kê chuyên cần & Biểu đồ"
      subtitle="Báo cáo tháng & Ma trận"
      headerActions={headerActions}
    >
      {/* Controls */}
      <section className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label
            htmlFor="analytics-class"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Lớp học
          </label>
          <select
            id="analytics-class"
            value={activeClass?.id ?? ''}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="analytics-month"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Tháng thống kê
          </label>
          <input
            id="analytics-month"
            type="month"
            value={monthYYYYMM}
            onChange={(e) => setMonthYYYYMM(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-md"
          />
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-md px-3.5 py-2">
          <p className="text-xs text-slate-500">Số buổi trong tháng</p>
          <p className="text-lg font-semibold font-mono tabular-nums text-slate-900">
            {analytics.monthSessions.length} buổi
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-md px-3.5 py-2">
          <p className="text-xs text-slate-500">Chuyên cần trung bình</p>
          <p className="text-lg font-semibold font-mono tabular-nums text-blue-700">
            {meanAttendancePercent}%
          </p>
        </div>
      </section>

      {/* Per-session Bar Chart */}
      <section
        aria-label="Biểu đồ sĩ số đi học từng buổi"
        className="bg-white border border-slate-200 rounded-lg p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2
              className="text-base font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Biểu đồ sĩ số đi học từng buổi
            </h2>
            <p className="text-xs text-slate-500">
              Tính trên học sinh Có mặt (V) và Đến muộn (M)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
            <span>V: Có mặt</span>
            <span>M: Muộn</span>
            <span>P: Có phép</span>
            <span>K: Không phép</span>
          </div>
        </div>

        {analytics.sessionBars.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">
            Chưa có dữ liệu buổi học trong tháng {monthYYYYMM}.
          </p>
        ) : (
          <div className="space-y-3">
            {analytics.sessionBars.map((bar) => (
              <div key={bar.sessionId} className="space-y-1">
                <div className="flex items-center justify-between text-xs gap-3">
                  <span className="font-medium text-slate-800 truncate">
                    <span className="font-mono text-slate-500 mr-2">
                      {bar.dateLabel}
                    </span>
                    {bar.topic}
                  </span>
                  <span className="font-mono tabular-nums text-slate-700 shrink-0">
                    {bar.presentAndLate}/{bar.total} ({bar.ratePercent}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-700 transition-all"
                    style={{ width: `${bar.ratePercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Monthly Matrix Table */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
            Ma trận chuyên cần tháng {monthYYYYMM}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                <th className="py-2.5 px-4 whitespace-nowrap">Mã HS</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Học sinh</th>
                {analytics.monthSessions.map((ses) => (
                  <th
                    key={ses.id}
                    className="py-2.5 px-3 text-center font-mono whitespace-nowrap"
                  >
                    {formatShortDayMonth(ses.date)}
                  </th>
                ))}
                <th className="py-2.5 px-4 text-right whitespace-nowrap">
                  Số buổi học
                </th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap">Tỉ lệ</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Xếp loại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {analytics.studentStats.map((stat) => (
                <tr key={stat.student.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                    {stat.student.studentCode}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                    {stat.student.fullName}
                  </td>
                  {analytics.monthSessions.map((ses) => {
                    const sym = stat.symbolsByDate[ses.date] ?? 'V';
                    const color =
                      sym === 'V'
                        ? 'text-emerald-700'
                        : sym === 'M'
                          ? 'text-amber-700'
                          : sym === 'P'
                            ? 'text-slate-600'
                            : 'text-rose-700';
                    return (
                      <td
                        key={ses.id}
                        className={`py-2.5 px-3 text-center font-mono font-semibold ${color}`}
                      >
                        {sym}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-900 whitespace-nowrap">
                    {stat.attendedTotal}/{stat.totalSessions}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-900 whitespace-nowrap">
                    {stat.attendancePercent}%
                  </td>
                  <td className="py-2.5 px-4 text-xs whitespace-nowrap">
                    <span
                      className={
                        stat.rating === 'Xuất sắc'
                          ? 'text-emerald-700 font-semibold'
                          : stat.rating === 'Tốt'
                            ? 'text-blue-700 font-medium'
                            : 'text-rose-700 font-semibold'
                      }
                    >
                      {stat.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AcademyShell>
  );
}
