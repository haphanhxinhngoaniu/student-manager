'use client';

import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Printer } from 'lucide-react';
import AcademyShell from './AcademyShell';
import { useAcademyWorkspace } from '@/lib/academy-store';
import {
  computeStudentTuition,
  formatTuitionZaloMessage,
  type StudentTuitionBill,
  type WorkspaceSettings,
} from '@/lib/academy';
import { buildVietQrPayload, formatVnd } from '@/lib/vietqr';

function TuitionReceiptCard({
  bill,
  settings,
}: {
  bill: StudentTuitionBill;
  settings: WorkspaceSettings;
}) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const payload = useMemo(
    () =>
      buildVietQrPayload({
        bankBin: settings.bankBin,
        accountNumber: settings.accountNumber,
        amount: bill.totalAmount,
        purpose: bill.transferPurpose,
      }),
    [
      bill.totalAmount,
      bill.transferPurpose,
      settings.accountNumber,
      settings.bankBin,
    ]
  );

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(payload, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (!cancelled) {
          setQrUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrUrl('');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [payload]);

  const handleCopyZalo = async () => {
    const text = formatTuitionZaloMessage(bill, settings);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard may be restricted in headless mode
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const datesDisplay =
    bill.attendedDates.length > 0
      ? bill.attendedDates.map((d) => `Ngày ${d}`).join(', ')
      : 'Chưa phát sinh buổi học trong tháng';

  return (
    <article className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row justify-between gap-5 break-inside-avoid">
      <div className="flex-1 space-y-3 min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <p className="text-xs font-mono text-slate-500">
              {bill.student.studentCode} · {bill.cls.name}
            </p>
            <h2
              className="text-base font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Phiếu học phí: {bill.student.fullName}
            </h2>
          </div>
          <span className="text-lg font-bold font-mono tabular-nums text-blue-800">
            {formatVnd(bill.totalAmount)}
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <dt className="text-slate-500">Phụ huynh</dt>
            <dd className="font-medium text-slate-800">
              {bill.student.parentName} ({bill.student.parentZalo})
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Số buổi thực học × Đơn giá</dt>
            <dd className="font-mono tabular-nums font-medium text-slate-900">
              {bill.sessionCount} buổi × {formatVnd(bill.unitFee)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Chi tiết các ngày học trong tháng</dt>
            <dd className="font-medium text-slate-800 mt-0.5">{datesDisplay}</dd>
          </div>
          <div className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded p-2.5 space-y-0.5">
            <p className="text-slate-600">
              Ngân hàng: <strong className="text-slate-900">{settings.bankShortName}</strong> ·
              STK: <strong className="font-mono text-slate-900">{settings.accountNumber}</strong>
            </p>
            <p className="text-slate-600">
              Chủ TK: <strong className="text-slate-900">{settings.accountHolder}</strong> ·
              Nội dung CK:{' '}
              <strong className="font-mono text-blue-800">{bill.transferPurpose}</strong>
            </p>
          </div>
        </dl>

        <div className="no-print flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopyZalo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-700" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? 'Đã chép tin nhắn Zalo' : 'Copy tin nhắn Zalo'}
          </button>
        </div>
      </div>

      {/* VietQR Napas 24/7 Block */}
      <div className="w-full sm:w-44 shrink-0 flex flex-col items-center justify-center border border-slate-200 rounded-md p-3 bg-slate-50">
        {qrUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrUrl}
            alt={`Mã VietQR học phí ${bill.student.fullName}`}
            width={152}
            height={152}
            className="w-36 h-36 bg-white p-1.5 rounded border border-slate-200"
          />
        ) : (
          <div className="w-36 h-36 flex items-center justify-center bg-white border border-slate-200 rounded text-xs text-slate-400">
            Đang tạo QR...
          </div>
        )}
        <p className="mt-2 text-[11px] font-medium text-slate-700 text-center">
          VietQR Napas 24/7
        </p>
        <p className="text-[10px] font-mono text-slate-500 text-center truncate w-full">
          {settings.bankShortName}
        </p>
      </div>
    </article>
  );
}

export default function TuitionWorkspace() {
  const { classes, students, sessions, settings } = useAcademyWorkspace();
  const [selectedClassId, setSelectedClassId] = useState<string>(
    () => classes[0]?.id ?? ''
  );
  const [monthYYYYMM, setMonthYYYYMM] = useState<string>('2026-11');

  const activeClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId) ?? classes[0] ?? null,
    [classes, selectedClassId]
  );

  const bills = useMemo(() => {
    if (!activeClass) return [];
    const classStudents = students.filter((s) => s.classId === activeClass.id);
    return classStudents.map((st) =>
      computeStudentTuition(
        st,
        activeClass,
        sessions,
        monthYYYYMM,
        settings.transferTemplate
      )
    );
  }, [activeClass, monthYYYYMM, sessions, settings.transferTemplate, students]);

  const totalRevenue = useMemo(
    () => bills.reduce((sum, b) => sum + b.totalAmount, 0),
    [bills]
  );

  const headerActions = (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
    >
      <Printer className="w-3.5 h-3.5" />
      In phiếu thu học phí
    </button>
  );

  return (
    <AcademyShell
      title="Phiếu học phí & Mã VietQR Napas 24/7"
      subtitle="Quyết toán học phí tháng"
      headerActions={headerActions}
    >
      {/* Controls */}
      <section className="no-print bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label
            htmlFor="tuition-class"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Chọn lớp học
          </label>
          <select
            id="tuition-class"
            value={activeClass?.id ?? ''}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({formatVnd(c.sessionFee)}/buổi)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="tuition-month"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Kỳ học phí (Tháng)
          </label>
          <input
            id="tuition-month"
            type="month"
            value={monthYYYYMM}
            onChange={(e) => setMonthYYYYMM(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-md"
          />
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-md px-3.5 py-2">
          <p className="text-xs text-slate-500">Tổng dự thu lớp tháng {monthYYYYMM}</p>
          <p className="text-lg font-bold font-mono tabular-nums text-slate-900">
            {formatVnd(totalRevenue)}
          </p>
        </div>
      </section>

      {bills.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-sm text-slate-600">
          Lớp chưa có học sinh để tạo phiếu thu học phí.
        </div>
      ) : (
        <section aria-label="Danh sách phiếu học phí" className="grid grid-cols-1 gap-4">
          {bills.map((bill) => (
            <TuitionReceiptCard key={bill.student.id} bill={bill} settings={settings} />
          ))}
        </section>
      )}
    </AcademyShell>
  );
}
