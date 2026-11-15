'use client';

import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Plus, ShieldCheck } from 'lucide-react';
import AcademyShell from './AcademyShell';
import { useAcademyWorkspace } from '@/lib/academy-store';
import { VIETNAM_BANKS, buildVietQrPayload } from '@/lib/vietqr';
import type { AssistantAccount } from '@/lib/academy';

export default function SettingsWorkspace() {
  const {
    classes,
    settings,
    updateSettings,
    switchRole,
    addAssistant,
    toggleAssistantActive,
  } = useAcademyWorkspace();

  const isTeacher = settings.currentRole === 'teacher';

  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [teacherName, setTeacherName] = useState(settings.teacherName);
  const [bankBin, setBankBin] = useState(settings.bankBin);
  const [accountNumber, setAccountNumber] = useState(settings.accountNumber);
  const [accountHolder, setAccountHolder] = useState(settings.accountHolder);
  const [transferTemplate, setTransferTemplate] = useState(settings.transferTemplate);
  const [previewAmount, setPreviewAmount] = useState('720000');
  const [savedNotice, setSavedNotice] = useState(false);

  const [newTaName, setNewTaName] = useState('');
  const [newTaEmail, setNewTaEmail] = useState('');
  const [newTaClassId, setNewTaClassId] = useState(classes[0]?.id ?? '');

  const [qrUrl, setQrUrl] = useState<string>('');

  const selectedBank = useMemo(
    () => VIETNAM_BANKS.find((b) => b.bin === bankBin) ?? VIETNAM_BANKS[0],
    [bankBin]
  );

  const previewPayload = useMemo(
    () =>
      buildVietQrPayload({
        bankBin: selectedBank.bin,
        accountNumber,
        amount: Number(previewAmount) || 0,
        purpose: transferTemplate
          .replace('{CODE}', 'HS9A01')
          .replace('{MONTH}', 'T11')
          .replace('{NAME}', 'NGUYEN MINH ANH'),
      }),
    [accountNumber, previewAmount, selectedBank.bin, transferTemplate]
  );

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(previewPayload, {
      width: 240,
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
  }, [previewPayload]);

  const handleSaveBankSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      schoolName: schoolName.trim() || settings.schoolName,
      teacherName: teacherName.trim() || settings.teacherName,
      bankBin: selectedBank.bin,
      bankShortName: selectedBank.shortName,
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim().toUpperCase(),
      transferTemplate: transferTemplate.trim() || '{CODE} {MONTH} HOC PHI',
    });
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleAddAssistant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaName.trim() || !newTaEmail.trim()) return;
    const account: AssistantAccount = {
      id: `ta-${Date.now()}`,
      name: newTaName.trim(),
      email: newTaEmail.trim(),
      assignedClassIds: newTaClassId ? [newTaClassId] : [],
      active: true,
    };
    addAssistant(account);
    setNewTaName('');
    setNewTaEmail('');
  };

  return (
    <AcademyShell
      title="Cài đặt Ngân hàng & Phân quyền trợ giảng"
      subtitle="Thiết lập hệ thống"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Bank & VietQR Settings */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2
              className="text-base font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Tài khoản ngân hàng nhận học phí (VietQR Napas 24/7)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hỗ trợ tự động điền STK, số tiền và nội dung chuyển khoản trên mọi ứng dụng
              ngân hàng Việt Nam.
            </p>
          </div>

          {!isTeacher && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              Bạn đang đăng nhập với vai trò Trợ giảng. Chỉ Giáo viên mới có quyền thay đổi
              số tài khoản ngân hàng và quản lý tài khoản trợ giảng.
            </p>
          )}

          <form onSubmit={handleSaveBankSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="setting-school"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Tên trung tâm / Lớp học
                </label>
                <input
                  id="setting-school"
                  type="text"
                  disabled={!isTeacher}
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md disabled:bg-slate-50"
                />
              </div>

              <div>
                <label
                  htmlFor="setting-teacher"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Tên giáo viên chủ nhiệm
                </label>
                <input
                  id="setting-teacher"
                  type="text"
                  disabled={!isTeacher}
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md disabled:bg-slate-50"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="setting-bank"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Ngân hàng thụ hưởng
                </label>
                <select
                  id="setting-bank"
                  disabled={!isTeacher}
                  value={bankBin}
                  onChange={(e) => setBankBin(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md disabled:bg-slate-50"
                >
                  {VIETNAM_BANKS.map((bank) => (
                    <option key={bank.bin} value={bank.bin}>
                      {bank.shortName} — {bank.name} (BIN {bank.bin})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="setting-stk"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Số tài khoản (STK)
                </label>
                <input
                  id="setting-stk"
                  type="text"
                  disabled={!isTeacher}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md disabled:bg-slate-50"
                />
              </div>

              <div>
                <label
                  htmlFor="setting-holder"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Tên chủ tài khoản (không dấu)
                </label>
                <input
                  id="setting-holder"
                  type="text"
                  disabled={!isTeacher}
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full px-3 py-2 text-sm uppercase border border-slate-300 rounded-md disabled:bg-slate-50"
                />
              </div>

              <div>
                <label
                  htmlFor="setting-template"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Mẫu nội dung chuyển khoản
                </label>
                <input
                  id="setting-template"
                  type="text"
                  disabled={!isTeacher}
                  value={transferTemplate}
                  onChange={(e) => setTransferTemplate(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md disabled:bg-slate-50"
                />
              </div>

              <div>
                <label
                  htmlFor="setting-preview-amount"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Số tiền thử xem trước QR (VNĐ)
                </label>
                <input
                  id="setting-preview-amount"
                  type="number"
                  step={10000}
                  value={previewAmount}
                  onChange={(e) => setPreviewAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md"
                />
              </div>
            </div>

            {isTeacher && (
              <div className="flex items-center justify-between pt-2">
                {savedNotice ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                    <Check className="w-4 h-4" />
                    Đã lưu cấu hình ngân hàng
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
                >
                  Lưu cấu hình ngân hàng
                </button>
              </div>
            )}
          </form>
        </section>

        {/* Live VietQR Preview */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 flex flex-col items-center text-center space-y-3">
          <h2
            className="text-base font-semibold text-slate-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Xem trước mã VietQR tức thì
          </h2>
          {qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrUrl}
              alt="Xem trước mã VietQR ngân hàng"
              width={200}
              height={200}
              className="w-48 h-48 p-2 bg-white border border-slate-200 rounded-md"
            />
          ) : (
            <div className="w-48 h-48 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-center text-xs text-slate-400">
              Đang tạo mã VietQR...
            </div>
          )}
          <div className="text-xs text-slate-600 space-y-1 w-full bg-slate-50 border border-slate-200 rounded-md p-3">
            <p className="font-semibold text-slate-900">{selectedBank.shortName}</p>
            <p className="font-mono text-slate-800">STK: {accountNumber || '---'}</p>
            <p className="uppercase text-slate-700">{accountHolder || '---'}</p>
            <p className="font-mono text-blue-800">
              Số tiền: {new Intl.NumberFormat('vi-VN').format(Number(previewAmount) || 0)} đ
            </p>
          </div>
        </section>
      </div>

      {/* Role & TA Permission Management */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <div>
              <h2
                className="text-base font-semibold text-slate-900"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Phân quyền Giáo viên &amp; Trợ giảng (TA)
              </h2>
              <p className="text-xs text-slate-500">
                Mã mời trợ giảng hiện tại:{' '}
                <strong className="font-mono text-slate-800">
                  {settings.assistantInviteCode}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600">Chuyển phiên thao tác:</span>
            <button
              type="button"
              onClick={() => switchRole('teacher', settings.teacherName)}
              className={`px-3 py-1.5 rounded-md font-medium border ${
                settings.currentRole === 'teacher'
                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                  : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              Giáo viên
            </button>
            <button
              type="button"
              onClick={() => switchRole('assistant')}
              className={`px-3 py-1.5 rounded-md font-medium border ${
                settings.currentRole === 'assistant'
                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                  : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              Trợ giảng
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Danh sách tài khoản trợ giảng ({settings.assistants.length})
            </h3>
            {settings.assistants.map((ta) => (
              <div
                key={ta.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{ta.name}</p>
                  <p className="text-xs text-slate-500 truncate">{ta.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => switchRole('assistant', ta.name)}
                    className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-white border border-slate-300 rounded hover:bg-blue-50"
                  >
                    Dùng vai trò này
                  </button>
                  {isTeacher && (
                    <button
                      type="button"
                      onClick={() => toggleAssistantActive(ta.id)}
                      className={`px-2.5 py-1 text-xs font-medium rounded border ${
                        ta.active
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-slate-100 border-slate-300 text-slate-600'
                      }`}
                    >
                      {ta.active ? 'Đang hoạt động' : 'Đã tạm khóa'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isTeacher && (
            <form
              onSubmit={handleAddAssistant}
              className="p-4 border border-slate-200 rounded-md space-y-3 bg-slate-50"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Mời thêm trợ giảng nhập liệu thay
              </h3>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Họ tên trợ giảng
                </label>
                <input
                  type="text"
                  value={newTaName}
                  onChange={(e) => setNewTaName(e.target.value)}
                  placeholder="VD: Cô Ngọc Lan"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email đăng nhập
                </label>
                <input
                  type="email"
                  value={newTaEmail}
                  onChange={(e) => setNewTaEmail(e.target.value)}
                  placeholder="lan.ta@lopcophuonganh.vn"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Lớp phụ trách chính
                </label>
                <select
                  value={newTaClassId}
                  onChange={(e) => setNewTaClassId(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm trợ giảng
              </button>
            </form>
          )}
        </div>
      </section>
    </AcademyShell>
  );
}
