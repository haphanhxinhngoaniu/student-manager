'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, UserCheck } from 'lucide-react';
import { formatStudentQrPayload, type Student } from '@/lib/students';

interface AttendanceQrViewProps {
  students: Student[];
  onAdjustAttendance: (id: string, delta: number) => void;
  onOpenQrModal: (student: Student) => void;
}

export default function AttendanceQrView({
  students,
  onAdjustAttendance,
  onOpenQrModal,
}: AttendanceQrViewProps) {
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    const generateAll = async () => {
      const entries = await Promise.all(
        students.map(async (s) => {
          try {
            const url = await QRCode.toDataURL(formatStudentQrPayload(s), {
              width: 112,
              margin: 1,
              color: { dark: '#0F172A', light: '#FFFFFF' },
            });
            return [s.id, url] as const;
          } catch {
            return [s.id, ''] as const;
          }
        })
      );
      if (active) {
        setQrMap(Object.fromEntries(entries));
      }
    };
    generateAll();
    return () => {
      active = false;
    };
  }, [students]);

  if (students.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
        <p className="text-sm text-slate-600">
          No students in the roster yet. Add students to generate attendance QR passes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2
            className="text-base font-semibold text-slate-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            QR Check-In Directory
          </h2>
          <p className="text-sm text-slate-600">
            Scan student passes at classroom kiosks or log quick attendance updates.
          </p>
        </div>
        <span className="text-xs font-mono tabular-nums text-slate-500">
          {students.length} active pass(es)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {students.map((student) => {
          const qrSrc = qrMap[student.id];
          return (
            <article
              key={student.id}
              className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-4"
            >
              <div className="w-24 h-24 shrink-0 rounded bg-white flex items-center justify-center overflow-hidden">
                {qrSrc ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrSrc}
                    alt={`QR pass for ${student.fullName}`}
                    width={96}
                    height={96}
                    className="w-24 h-24 block"
                  />
                ) : (
                  <QrCode className="w-6 h-6 text-slate-300" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-sm font-semibold text-slate-900 truncate">{student.fullName}</p>
                <p className="text-xs text-slate-600 font-mono tabular-nums truncate">
                  {student.studentCode} · {student.cohort}
                </p>
                <p className="text-xs text-slate-600 font-mono tabular-nums">
                  Attendance: <span className="font-semibold text-slate-900">{student.attendanceRate}%</span>
                </p>

                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onAdjustAttendance(student.id, 1)}
                    aria-label={`Log check-in for ${student.fullName}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-colors whitespace-nowrap"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Check In (+1%)
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenQrModal(student)}
                    aria-label={`Expand QR pass for ${student.fullName}`}
                    className="px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors whitespace-nowrap"
                  >
                    Expand
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
