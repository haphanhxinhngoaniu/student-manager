'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Download, X } from 'lucide-react';
import { formatStudentQrPayload, type Student } from '@/lib/students';

interface QrPassModalProps {
  student: Student | null;
  onClose: () => void;
}

export default function QrPassModal({ student, onClose }: QrPassModalProps) {
  const [qrState, setQrState] = useState<{ studentId: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!student) return;
    let active = true;
    const targetId = student.id;
    const payload = formatStudentQrPayload(student);
    QRCode.toDataURL(payload, {
      width: 240,
      margin: 2,
      color: { dark: '#0F172A', light: '#FFFFFF' },
    })
      .then((url) => {
        if (active) setQrState({ studentId: targetId, url });
      })
      .catch(() => {
        if (active) setQrState(null);
      });

    return () => {
      active = false;
    };
  }, [student]);

  const qrUrl = student && qrState?.studentId === student.id ? qrState.url : '';

  useEffect(() => {
    if (!student) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [student, onClose]);

  if (!student) return null;

  const payload = formatStudentQrPayload(student);

  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2
            id="qr-modal-title"
            className="text-lg font-semibold text-slate-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Student Check-In QR Pass
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close QR pass dialog"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-900">{student.fullName}</p>
            <p className="text-xs text-slate-600 font-mono tabular-nums">
              {student.studentCode} · Cohort {student.cohort} · {student.major}
            </p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            {qrUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={qrUrl}
                alt={`QR check-in code for ${student.fullName}`}
                width={220}
                height={220}
                className="w-52 h-52 block"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-500 bg-slate-50 rounded">
                Generating QR code...
              </div>
            )}
          </div>

          <div className="w-full text-left bg-slate-50 border border-slate-200 rounded-md p-3">
            <p className="text-xs font-medium text-slate-600 mb-1">Encoded Payload</p>
            <code className="block text-xs font-mono text-slate-800 break-all">{payload}</code>
          </div>

          <div className="w-full flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCopyPayload}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Payload'}
            </button>
            {qrUrl && (
              <a
                href={qrUrl}
                download={`${student.studentCode}-qr-pass.png`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
