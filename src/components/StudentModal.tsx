'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  STUDENT_STATUSES,
  validateStudentInput,
  type Student,
  type StudentFormInput,
  type StudentStatus,
  type ValidationErrors,
} from '@/lib/students';

interface StudentModalProps {
  isOpen: boolean;
  editingStudent: Student | null;
  existingStudents: Student[];
  onClose: () => void;
  onSave: (parsed: Omit<Student, 'id' | 'updatedAt'>, editingId?: string) => void;
}

const EMPTY_FORM: StudentFormInput = {
  studentCode: '',
  fullName: '',
  email: '',
  cohort: '2026',
  major: 'Computer Science',
  gpa: '3.50',
  attendanceRate: '95',
  status: 'Active',
  notes: '',
};

export default function StudentModal({
  isOpen,
  editingStudent,
  existingStudents,
  onClose,
  onSave,
}: StudentModalProps) {
  const [form, setForm] = useState<StudentFormInput>(() =>
    editingStudent
      ? {
          studentCode: editingStudent.studentCode,
          fullName: editingStudent.fullName,
          email: editingStudent.email,
          cohort: editingStudent.cohort,
          major: editingStudent.major,
          gpa: editingStudent.gpa.toFixed(2),
          attendanceRate: String(editingStudent.attendanceRate),
          status: editingStudent.status,
          notes: editingStudent.notes,
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateStudentInput(form, existingStudents, editingStudent?.id);
    if (!result.valid || !result.parsed) {
      setErrors(result.errors);
      return;
    }
    onSave(result.parsed, editingStudent?.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-modal-title"
    >
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2
            id="student-modal-title"
            className="text-lg font-semibold text-slate-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {editingStudent ? `Edit ${editingStudent.fullName}` : 'Add Student Record'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close student form"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="studentCode" className="block text-xs font-medium text-slate-700 mb-1">
                Student ID Code
              </label>
              <input
                id="studentCode"
                name="studentCode"
                type="text"
                value={form.studentCode}
                onChange={(e) => setForm((prev) => ({ ...prev, studentCode: e.target.value }))}
                placeholder="e.g. SE202601"
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              {errors.studentCode && (
                <p className="mt-1 text-xs text-rose-600" role="alert">
                  {errors.studentCode}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="cohort" className="block text-xs font-medium text-slate-700 mb-1">
                Cohort Year
              </label>
              <input
                id="cohort"
                name="cohort"
                type="text"
                value={form.cohort}
                onChange={(e) => setForm((prev) => ({ ...prev, cohort: e.target.value }))}
                placeholder="e.g. 2026"
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              {errors.cohort && (
                <p className="mt-1 text-xs text-rose-600" role="alert">
                  {errors.cohort}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="fullName" className="block text-xs font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              placeholder="e.g. Nguyen Minh Anh"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-rose-600" role="alert">
                {errors.fullName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-700 mb-1">
                Academic Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="name@campus.edu"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="major" className="block text-xs font-medium text-slate-700 mb-1">
                Major / Program
              </label>
              <input
                id="major"
                name="major"
                type="text"
                value={form.major}
                onChange={(e) => setForm((prev) => ({ ...prev, major: e.target.value }))}
                placeholder="e.g. Computer Science"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              {errors.major && (
                <p className="mt-1 text-xs text-rose-600" role="alert">
                  {errors.major}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="gpa" className="block text-xs font-medium text-slate-700 mb-1">
                GPA (0.00–4.00)
              </label>
              <input
                id="gpa"
                name="gpa"
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={form.gpa}
                onChange={(e) => setForm((prev) => ({ ...prev, gpa: e.target.value }))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              {errors.gpa && (
                <p className="mt-1 text-xs text-rose-600" role="alert">
                  {errors.gpa}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="attendanceRate"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Attendance (%)
              </label>
              <input
                id="attendanceRate"
                name="attendanceRate"
                type="number"
                step="1"
                min="0"
                max="100"
                value={form.attendanceRate}
                onChange={(e) => setForm((prev) => ({ ...prev, attendanceRate: e.target.value }))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              {errors.attendanceRate && (
                <p className="mt-1 text-xs text-rose-600" role="alert">
                  {errors.attendanceRate}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="block text-xs font-medium text-slate-700 mb-1">
                Standing
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value as StudentStatus }))
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                {STUDENT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-xs font-medium text-slate-700 mb-1">
              Advisor Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional academic advising notes..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors whitespace-nowrap"
            >
              {editingStudent ? 'Save Changes' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
