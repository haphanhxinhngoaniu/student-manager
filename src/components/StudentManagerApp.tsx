'use client';

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import * as XLSX from 'xlsx';
import {
  ArrowUpDown,
  ClipboardList,
  Download,
  FileSpreadsheet,
  Pencil,
  Plus,
  QrCode,
  RotateCcw,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import AcademyShell from './AcademyShell';
import AssignmentCenterView from './AssignmentCenterView';
import AttendanceQrView from './AttendanceQrView';
import ImportExportView from './ImportExportView';
import QrPassModal from './QrPassModal';
import StudentModal from './StudentModal';
import {
  INITIAL_STUDENTS,
  STUDENT_STATUSES,
  computeRosterSummary,
  filterAndSortStudents,
  getUniqueCohorts,
  toSpreadsheetRows,
  type SortDirection,
  type SortField,
  type Student,
  type StudentStatus,
} from '@/lib/students';

type ActiveSection = 'roster' | 'assignments' | 'qr' | 'import-export';

const STORAGE_KEY = 'student-manager:roster:v1';
const STORAGE_EVENT = 'student-manager-roster-change';

let cachedRawStorage: string | null = null;
let cachedStudentsSnapshot: Student[] = INITIAL_STUDENTS;

function subscribeToRoster(callback: () => void) {
  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener(STORAGE_EVENT, handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(STORAGE_EVENT, handler);
  };
}

function getRosterSnapshot(): Student[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      cachedRawStorage = null;
      cachedStudentsSnapshot = INITIAL_STUDENTS;
      return cachedStudentsSnapshot;
    }
    if (raw !== cachedRawStorage) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cachedRawStorage = raw;
        cachedStudentsSnapshot = parsed as Student[];
      }
    }
  } catch {
    return INITIAL_STUDENTS;
  }
  return cachedStudentsSnapshot;
}

function getServerRosterSnapshot(): Student[] {
  return INITIAL_STUDENTS;
}

const STATUS_TEXT_CLASS: Record<StudentStatus, string> = {
  Active: 'text-emerald-700 font-medium',
  Probation: 'text-amber-700 font-medium',
  Graduated: 'text-slate-700 font-medium',
  Leave: 'text-rose-700 font-medium',
};

export default function StudentManagerApp() {
  const students = useSyncExternalStore(
    subscribeToRoster,
    getRosterSnapshot,
    getServerRosterSnapshot
  );

  const updateStudents = useCallback((updater: (prev: Student[]) => Student[]) => {
    const next = updater(getRosterSnapshot());
    try {
      const serialized = JSON.stringify(next);
      window.localStorage.setItem(STORAGE_KEY, serialized);
      cachedRawStorage = serialized;
      cachedStudentsSnapshot = next;
      window.dispatchEvent(new Event(STORAGE_EVENT));
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const [activeSection, setActiveSection] = useState<ActiveSection>('roster');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | StudentStatus>('All');
  const [cohortFilter, setCohortFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('studentCode');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [qrStudent, setQrStudent] = useState<Student | null>(null);

  const [insightText, setInsightText] = useState<string>('');
  const [insightLoading, setInsightLoading] = useState(false);

  const cohorts = useMemo(() => getUniqueCohorts(students), [students]);

  const filteredStudents = useMemo(
    () =>
      filterAndSortStudents(students, {
        query: searchQuery,
        status: statusFilter,
        cohort: cohortFilter,
        sortField,
        sortDirection,
      }),
    [students, searchQuery, statusFilter, cohortFilter, sortField, sortDirection]
  );

  const summary = useMemo(() => computeRosterSummary(students), [students]);

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setModalOpen(true);
  };

  const handleSaveStudent = (
    parsed: Omit<Student, 'id' | 'updatedAt'>,
    editingId?: string
  ) => {
    const today = new Date().toISOString().slice(0, 10);
    if (editingId) {
      updateStudents((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...parsed, updatedAt: today } : s))
      );
    } else {
      const newStudent: Student = {
        id: `stu-${Date.now()}`,
        ...parsed,
        updatedAt: today,
      };
      updateStudents((prev) => [newStudent, ...prev]);
    }
    setModalOpen(false);
    setEditingStudent(null);
  };

  const handleDeleteStudent = (id: string) => {
    updateStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAdjustAttendance = (id: string, delta: number) => {
    const today = new Date().toISOString().slice(0, 10);
    updateStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              attendanceRate: Math.max(0, Math.min(100, s.attendanceRate + delta)),
              updatedAt: today,
            }
          : s
      )
    );
  };

  const handleImportStudents = (imported: Student[]) => {
    updateStudents((prev) => [...imported, ...prev]);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCohortFilter('All');
    setSortField('studentCode');
    setSortDirection('asc');
  };

  const handleRestoreSampleRoster = () => {
    updateStudents(() => INITIAL_STUDENTS);
    handleResetFilters();
  };

  const handleQuickExport = () => {
    const rows = toSpreadsheetRows(filteredStudents);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'student-roster.xlsx');
  };

  const handleGenerateInsight = async () => {
    setInsightLoading(true);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students }),
      });
      const data = await res.json();
      if (typeof data?.summary === 'string') {
        setInsightText(data.summary);
      }
    } catch {
      setInsightText('Unable to generate cohort summary right now.');
    } finally {
      setInsightLoading(false);
    }
  };

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'gpa' || field === 'attendanceRate' ? 'desc' : 'asc');
    }
  };

  const sectionLabel =
    activeSection === 'roster'
      ? 'Hồ sơ học sinh (Roster)'
      : activeSection === 'assignments'
        ? 'Giao bài tập'
        : activeSection === 'qr'
          ? 'Điểm danh mã QR'
          : 'Nhập / Xuất Excel';

  const sectionTabs: { id: ActiveSection; label: string; icon: typeof Users }[] = [
    { id: 'roster', label: 'Student Roster', icon: Users },
    { id: 'qr', label: 'Attendance & QR', icon: QrCode },
    { id: 'import-export', label: 'Import / Export', icon: FileSpreadsheet },
    { id: 'assignments', label: 'Giao bài tập nhanh', icon: ClipboardList },
  ];

  const headerActions = (
    <>
      <button
        type="button"
        onClick={handleQuickExport}
        disabled={filteredStudents.length === 0}
        className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        Export Excel
      </button>
      <button
        type="button"
        onClick={handleOpenCreate}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
      >
        <Plus className="w-4 h-4" />
        Add Student
      </button>
    </>
  );

  return (
    <AcademyShell
      title={sectionLabel}
      subtitle="Hồ sơ học vụ"
      headerActions={headerActions}
    >
      <div
        role="tablist"
        aria-label="Hồ sơ học sinh views"
        className="inline-flex flex-wrap items-center gap-1 p-1 bg-white border border-slate-200 rounded-md"
      >
        {sectionTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveSection(tab.id)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                active
                  ? 'bg-blue-50 text-blue-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4-Column Summary KPI Strip (shown on student management sections) */}
      {activeSection !== 'assignments' && (
            <section
              aria-label="Roster summary metrics"
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-xs font-medium text-slate-500">Total Enrolled</p>
              <p
                data-testid="kpi-total"
                className="mt-1.5 text-2xl font-semibold text-slate-900 font-mono tabular-nums"
              >
                {summary.total}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {summary.probationCount} probation alert(s)
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-xs font-medium text-slate-500">Active Standing</p>
              <p className="mt-1.5 text-2xl font-semibold text-slate-900 font-mono tabular-nums">
                {summary.activeCount}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {summary.total > 0
                  ? `${Math.round((summary.activeCount / summary.total) * 100)}% of roster`
                  : '0% of roster'}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-xs font-medium text-slate-500">Mean GPA</p>
              <p className="mt-1.5 text-2xl font-semibold text-slate-900 font-mono tabular-nums">
                {summary.averageGpa.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-slate-500">4.00 grading scale</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-xs font-medium text-slate-500">Mean Attendance</p>
              <p className="mt-1.5 text-2xl font-semibold text-slate-900 font-mono tabular-nums">
                {summary.averageAttendance.toFixed(1)}%
              </p>
              <p className="mt-1 text-xs text-slate-500">Term check-in average</p>
            </div>
          </section>
          )}

          {activeSection === 'roster' && (
            <>
              {/* Filter & Search Toolbar */}
              <section
                aria-label="Roster filters"
                className="bg-white border border-slate-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <label htmlFor="roster-search" className="sr-only">
                      Search students by name, code, email, or major
                    </label>
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="roster-search"
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, code, email, or major..."
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div>
                      <label htmlFor="cohort-filter" className="sr-only">
                        Filter by cohort
                      </label>
                      <select
                        id="cohort-filter"
                        value={cohortFilter}
                        onChange={(e) => setCohortFilter(e.target.value)}
                        className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="All">All Cohorts</option>
                        {cohorts.map((c) => (
                          <option key={c} value={c}>
                            Cohort {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateInsight}
                      disabled={insightLoading}
                      className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                      {insightLoading ? 'Analyzing...' : 'Cohort Summary'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div
                    role="group"
                    aria-label="Filter by student standing"
                    className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-md"
                  >
                    {(['All', ...STUDENT_STATUSES] as const).map((status) => {
                      const active = statusFilter === status;
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setStatusFilter(status)}
                          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                            active
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-xs text-slate-500 font-mono tabular-nums">
                    Showing {filteredStudents.length} of {students.length}
                  </p>
                </div>

                {insightText && (
                  <div
                    role="region"
                    aria-label="Cohort advisor summary"
                    className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-md flex items-start justify-between gap-3"
                  >
                    <p className="text-xs leading-relaxed text-slate-700">{insightText}</p>
                    <button
                      type="button"
                      onClick={() => setInsightText('')}
                      aria-label="Dismiss cohort summary"
                      className="p-1 text-slate-400 hover:text-slate-700 rounded shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </section>

              {/* High-Density Student Data Table */}
              {students.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-4">
                  <h2 className="text-base font-semibold text-slate-900">
                    No student records found
                  </h2>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Add your first student manually, import an Excel workbook, or restore the
                    sample academic roster.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleOpenCreate}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
                    >
                      Add First Student
                    </button>
                    <button
                      type="button"
                      onClick={handleRestoreSampleRoster}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restore Sample Roster
                    </button>
                  </div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-3">
                  <h2 className="text-sm font-semibold text-slate-900">
                    No students match the current filters
                  </h2>
                  <p className="text-xs text-slate-600">
                    Try adjusting the search query, standing tab, or cohort filter.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                          <th className="py-2.5 px-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleSortToggle('studentCode')}
                              className="inline-flex items-center gap-1 hover:text-slate-900"
                            >
                              ID Code
                              <ArrowUpDown className="w-3 h-3" />
                            </button>
                          </th>
                          <th className="py-2.5 px-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleSortToggle('fullName')}
                              className="inline-flex items-center gap-1 hover:text-slate-900"
                            >
                              Student
                              <ArrowUpDown className="w-3 h-3" />
                            </button>
                          </th>
                          <th className="py-2.5 px-4 whitespace-nowrap">Program & Cohort</th>
                          <th className="py-2.5 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleSortToggle('gpa')}
                              className="inline-flex items-center gap-1 hover:text-slate-900 ml-auto"
                            >
                              GPA
                              <ArrowUpDown className="w-3 h-3" />
                            </button>
                          </th>
                          <th className="py-2.5 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleSortToggle('attendanceRate')}
                              className="inline-flex items-center gap-1 hover:text-slate-900 ml-auto"
                            >
                              Attendance
                              <ArrowUpDown className="w-3 h-3" />
                            </button>
                          </th>
                          <th className="py-2.5 px-4 whitespace-nowrap">Standing</th>
                          <th className="py-2.5 px-4 text-right whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-sm">
                        {filteredStudents.map((student) => (
                          <tr
                            key={student.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-2.5 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                              {student.studentCode}
                            </td>
                            <td className="py-2.5 px-4 min-w-[200px]">
                              <div className="font-medium text-slate-900">{student.fullName}</div>
                              <div className="text-xs text-slate-500">{student.email}</div>
                            </td>
                            <td className="py-2.5 px-4 text-slate-700 whitespace-nowrap">
                              <span>{student.major}</span>
                              <span className="text-slate-300 mx-1.5" aria-hidden="true">
                                ·
                              </span>
                              <span className="text-xs font-mono text-slate-500 tabular-nums">
                                {student.cohort}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-900 whitespace-nowrap">
                              {student.gpa.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                              <span
                                className={
                                  student.attendanceRate < 80
                                    ? 'text-amber-700 font-medium'
                                    : 'text-slate-900'
                                }
                              >
                                {student.attendanceRate}%
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-xs whitespace-nowrap">
                              <span className={STATUS_TEXT_CLASS[student.status]}>
                                {student.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => setQrStudent(student)}
                                  aria-label={`Show QR pass for ${student.fullName}`}
                                  title="QR Check-In Pass"
                                  className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <QrCode className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(student)}
                                  aria-label={`Edit ${student.fullName}`}
                                  title="Edit student"
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStudent(student.id)}
                                  aria-label={`Delete ${student.fullName}`}
                                  title="Delete student"
                                  className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}

          {activeSection === 'assignments' && <AssignmentCenterView />}

          {activeSection === 'qr' && (
            <AttendanceQrView
              students={students}
              onAdjustAttendance={handleAdjustAttendance}
              onOpenQrModal={setQrStudent}
            />
          )}

          {activeSection === 'import-export' && (
            <ImportExportView
              students={students}
              onImportStudents={handleImportStudents}
            />
          )}

      {modalOpen && (
        <StudentModal
          key={editingStudent?.id ?? 'new'}
          isOpen={modalOpen}
          editingStudent={editingStudent}
          existingStudents={students}
          onClose={() => {
            setModalOpen(false);
            setEditingStudent(null);
          }}
          onSave={handleSaveStudent}
        />
      )}

      <QrPassModal student={qrStudent} onClose={() => setQrStudent(null)} />
    </AcademyShell>
  );
}
