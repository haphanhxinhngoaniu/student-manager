'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FilePlus2,
  FileUp,
  ImagePlus,
  Printer,
  Save,
  Sparkles,
  Trash2,
  UserPlus,
} from 'lucide-react';
import AcademyShell from '@/components/AcademyShell';
import GeminiChatPanel from '@/components/GeminiChatPanel';
import { useAcademyWorkspace } from '@/lib/academy-store';
import { exportElementToA4Pdf } from '@/lib/pdf-export';
import {
  BUILT_IN_TEMPLATES,
  PERFORMANCE_CRITERIA_LABELS,
  TRIAL_LEAD_META,
  buildTrialReportPdfFilename,
  formatTrialReportPlainText,
  type ReportTemplate,
  type TemplateLayoutMode,
  type TrialLeadStatus,
  type TrialReport,
} from '@/lib/trial-report';

type LeftTab = 'info_ai' | 'edit_sections' | 'templates' | 'chat';
type TemplateCategoryTab = 'clean' | 'reference' | 'uploaded';

const ACCENT_SWATCHES = [
  { label: 'Xanh Navy', value: '#1e3a8a' },
  { label: 'Xanh Bạc hà', value: '#0f766e' },
  { label: 'Đỏ Đô', value: '#b91c1c' },
  { label: 'Xanh Biển', value: '#0369a1' },
  { label: 'Cam Ấm', value: '#c2410c' },
  { label: 'Tím Học thuật', value: '#6d28d9' },
  { label: 'Xám Đậm', value: '#334155' },
];

function createBlankTrialReport(
  teacherName: string,
  id = 'trial-draft-default',
  studyDate = '15/11/2026',
  updatedAt = 0
): TrialReport {
  return {
    id,
    classType: 'Lớp 1 kèm 1',
    subjectAndGrade: 'Toán (Lớp 5)',
    studentName: '',
    studentSchool: '',
    parentPhone: '',
    teacherName: teacherName.replace(/^Cô\s+/i, '').trim() || 'Phương Anh',
    studyDate,
    duration: '~60 phút',
    sessionStatus: 'Đã kết thúc',
    leadStatus: 'new_trial',
    topic: '',
    teacherQuickNotes: '',
    targetGoal:
      'Lộ trình cá nhân hóa giúp con vững kiến thức nền và bứt phá điểm số',
    progressSummary:
      'Chưa có nội dung báo cáo. Nhập thông tin buổi học thử bên trái rồi bấm "AI Viết báo cáo buổi học thử".',
    performanceRows: PERFORMANCE_CRITERIA_LABELS.map((criterion) => ({
      criterion,
      assessment: 'Đang chờ tổng hợp đánh giá từ buổi học thử',
    })),
    highlights: '',
    improvements: '',
    roadmapSummary: '',
    roadmapBullets: [],
    nextLessonPlan: '',
    homePracticeBullets: [],
    closingEncouragement: '',
    templateId: 'clean-academic-navy',
    sheetOpacity: 0.99,
    updatedAt,
  };
}

export default function TrialReportsWorkspace() {
  const {
    classes,
    settings,
    trialReports,
    customTemplates,
    saveTrialReport,
    deleteTrialReport,
    addCustomTemplate,
    deleteCustomTemplate,
    enrollTrialStudent,
  } = useAcademyWorkspace();

  const [selectedReportId, setSelectedReportId] = useState<string>(
    () => trialReports[0]?.id ?? 'new'
  );
  const [draftOverride, setDraftOverride] = useState<TrialReport | null>(null);
  const [leftTab, setLeftTab] = useState<LeftTab>('info_ai');
  const [templateTab, setTemplateTab] = useState<TemplateCategoryTab>('clean');
  const [recordingFile, setRecordingFile] = useState<File | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [copiedZalo, setCopiedZalo] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadAccent, setUploadAccent] = useState('#1e3a8a');
  const [enrollClassId, setEnrollClassId] = useState<string>(
    () => classes[0]?.id ?? ''
  );
  const printableRef = useRef<HTMLElement | null>(null);

  const allTemplates = useMemo(
    () => [...customTemplates, ...BUILT_IN_TEMPLATES],
    [customTemplates]
  );

  const selectedStored = useMemo(
    () => trialReports.find((r) => r.id === selectedReportId) ?? trialReports[0] ?? null,
    [trialReports, selectedReportId]
  );

  const draft: TrialReport = useMemo(() => {
    if (draftOverride && draftOverride.id === selectedReportId) {
      return draftOverride;
    }
    if (selectedStored) return selectedStored;
    return createBlankTrialReport(settings.teacherName);
  }, [draftOverride, selectedReportId, selectedStored, settings.teacherName]);

  const activeTemplate: ReportTemplate = useMemo(
    () =>
      allTemplates.find((t) => t.id === draft.templateId) ??
      BUILT_IN_TEMPLATES[0],
    [allTemplates, draft.templateId]
  );

  const activeAccent = draft.accentOverride || activeTemplate.accentColor;

  const updateDraft = (patch: Partial<TrialReport>) => {
    setDraftOverride({
      ...draft,
      ...patch,
    });
  };

  const handleSelectReport = (report: TrialReport) => {
    setSelectedReportId(report.id);
    setDraftOverride(report);
    setAiFeedback(null);
  };

  const handleCreateNewReport = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const timestamp = now.getTime();
    const fresh = createBlankTrialReport(
      settings.teacherName,
      `trial-${timestamp}`,
      `${dd}/${mm}/${yyyy}`,
      timestamp
    );
    setSelectedReportId(fresh.id);
    setDraftOverride(fresh);
    setLeftTab('info_ai');
    setAiFeedback('Đã tạo hồ sơ học sinh học thử mới. Nhập ghi chú để AI viết báo cáo.');
  };

  const handleGenerateAiReport = async () => {
    if (!draft.studentName.trim() || !draft.topic.trim()) {
      setAiFeedback('Vui lòng nhập Tên học sinh và Chủ đề buổi học trước khi tạo.');
      return;
    }

    setAiLoading(true);
    setAiFeedback(null);

    try {
      let res: Response;
      if (recordingFile) {
        const formData = new FormData();
        formData.append('classType', draft.classType);
        formData.append('subjectAndGrade', draft.subjectAndGrade);
        formData.append('studentName', draft.studentName);
        formData.append('studentSchool', draft.studentSchool);
        formData.append('teacherName', draft.teacherName);
        formData.append('studyDate', draft.studyDate);
        formData.append('duration', draft.duration);
        formData.append('topic', draft.topic);
        formData.append('teacherQuickNotes', draft.teacherQuickNotes);
        formData.append('targetGoal', draft.targetGoal);
        formData.append('file', recordingFile);
        res = await fetch('/api/trial-report', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/trial-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classType: draft.classType,
            subjectAndGrade: draft.subjectAndGrade,
            studentName: draft.studentName,
            studentSchool: draft.studentSchool,
            teacherName: draft.teacherName,
            studyDate: draft.studyDate,
            duration: draft.duration,
            topic: draft.topic,
            teacherQuickNotes: draft.teacherQuickNotes,
            targetGoal: draft.targetGoal,
          }),
        });
      }

      if (!res.ok) {
        throw new Error('Không thể tạo báo cáo lúc này.');
      }

      const data = (await res.json()) as Partial<TrialReport> & {
        source?: string;
      };

      const populated: TrialReport = {
        ...draft,
        progressSummary: data.progressSummary ?? draft.progressSummary,
        performanceRows: Array.isArray(data.performanceRows)
          ? data.performanceRows
          : draft.performanceRows,
        highlights: data.highlights ?? draft.highlights,
        improvements: data.improvements ?? draft.improvements,
        roadmapSummary: data.roadmapSummary ?? draft.roadmapSummary,
        roadmapBullets: Array.isArray(data.roadmapBullets)
          ? data.roadmapBullets
          : draft.roadmapBullets,
        nextLessonPlan: data.nextLessonPlan ?? draft.nextLessonPlan,
        homePracticeBullets: Array.isArray(data.homePracticeBullets)
          ? data.homePracticeBullets
          : draft.homePracticeBullets,
        closingEncouragement:
          data.closingEncouragement ?? draft.closingEncouragement,
        updatedAt: Date.now(),
      };

      setDraftOverride(populated);
      saveTrialReport(populated);
      setSelectedReportId(populated.id);
      setAiFeedback(
        data.source === 'gemini'
          ? 'AI Gemini đã hoàn thiện báo cáo buổi học thử chuẩn mẫu và tự động lưu.'
          : 'Đã tự động soạn báo cáo buổi học thử chuẩn mẫu Cô – Con và lưu vào danh sách.'
      );
    } catch {
      setAiFeedback('Có lỗi khi tạo báo cáo, vui lòng thử lại.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveCurrent = () => {
    if (!draft.studentName.trim()) {
      setAiFeedback('Vui lòng nhập tên học sinh trước khi lưu.');
      return;
    }
    const toSave = { ...draft, updatedAt: Date.now() };
    setDraftOverride(toSave);
    saveTrialReport(toSave);
    setSelectedReportId(toSave.id);
    setAiFeedback(`Đã lưu báo cáo buổi học thử của con ${draft.studentName}.`);
  };

  const handleCopyPlainText = async () => {
    const text = formatTrialReportPlainText(draft);
    await navigator.clipboard.writeText(text);
    setCopiedZalo(true);
    setTimeout(() => setCopiedZalo(false), 2000);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleDownloadPdfFile = async () => {
    if (!printableRef.current || exportingPdf) return;
    setExportingPdf(true);
    setAiFeedback(null);
    try {
      const fileName = buildTrialReportPdfFilename(
        draft.studentName,
        draft.studyDate
      );
      const result = await exportElementToA4Pdf(printableRef.current, fileName);
      setAiFeedback(
        `Đã xuất file PDF khổ A4 (${result.pageCount} trang): ${result.fileName}`
      );
    } catch {
      setAiFeedback(
        'Không thể tạo tệp PDF trực tiếp, vui lòng thử bấm "In / Lưu PDF".'
      );
    } finally {
      setExportingPdf(false);
    }
  };

  const handleUploadBrandLogo = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;
      updateDraft({ brandLogoDataUrl: dataUrl });
      setAiFeedback('Đã cập nhật logo thương hiệu lên đầu trang A4.');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadTemplateFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;
      const label =
        uploadName.trim() ||
        file.name.replace(/\.[^.]+$/, '') ||
        'Mẫu thiết kế riêng';
      const newTpl: ReportTemplate = {
        id: `custom-tpl-${Date.now()}`,
        name: label,
        category: 'uploaded',
        accentColor: uploadAccent,
        tableHeaderBg: uploadAccent,
        tableHeaderText: '#ffffff',
        pageBg: '#ffffff',
        borderColor: '#cbd5e1',
        backgroundImage: dataUrl,
        defaultSheetOpacity: 0.99,
        description: 'Bản tham khảo background & design tự tải lên.',
      };
      addCustomTemplate(newTpl);
      updateDraft({
        templateId: newTpl.id,
        sheetOpacity: newTpl.defaultSheetOpacity,
        accentOverride: uploadAccent,
      });
      setUploadName('');
      setTemplateTab('uploaded');
      setAiFeedback(`Đã thêm mẫu "${label}" vào kho template và áp dụng lên trang xem trước.`);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateCriterion = (idx: number, assessment: string) => {
    const nextRows = draft.performanceRows.map((row, i) =>
      i === idx ? { ...row, assessment } : row
    );
    updateDraft({ performanceRows: nextRows });
  };

  const filteredTemplates = useMemo(
    () => allTemplates.filter((t) => t.category === templateTab),
    [allTemplates, templateTab]
  );

  const effectiveEnrollClassId = enrollClassId || classes[0]?.id || '';

  return (
    <AcademyShell
      title="Báo cáo buổi học thử & Xuất PDF"
      subtitle="Học sinh mới chưa đăng ký"
      headerActions={
        <button
          type="button"
          onClick={handleDownloadPdfFile}
          disabled={exportingPdf}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          {exportingPdf ? 'Đang xuất PDF...' : 'Tải file PDF'}
        </button>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Studio Column */}
        <div className="no-print xl:col-span-5 space-y-5">
          {/* Quick Action Strip */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCreateNewReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <FilePlus2 className="w-3.5 h-3.5" />
              Thêm HS học thử
            </button>
            <button
              type="button"
              onClick={handleCopyPlainText}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              {copiedZalo ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  Đã copy Zalo
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy gửi phụ huynh
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              In A4
            </button>
          </div>
          {/* Prospective Student Selector */}
          <section className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2
                className="text-sm font-semibold text-slate-900"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Học sinh mới sau buổi học thử ({trialReports.length})
              </h2>
              <span className="text-xs text-slate-500">Chưa chốt đăng ký chính thức</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-md max-h-52 overflow-y-auto">
              {trialReports.map((item) => {
                const isSelected = item.id === draft.id;
                const meta = TRIAL_LEAD_META[item.leadStatus];
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 text-xs transition-colors ${
                      isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectReport(item)}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="font-semibold text-slate-900 truncate">
                        {item.studentName || 'Học sinh chưa đặt tên'}
                      </p>
                      <p className="text-slate-500 truncate">
                        {item.subjectAndGrade} ·{' '}
                        <span className="font-mono tabular-nums">{item.studyDate}</span> ·{' '}
                        <span className={meta.colorClass}>{meta.label}</span>
                      </p>
                    </button>
                    {trialReports.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          deleteTrialReport(item.id);
                          if (draft.id === item.id) {
                            const fallbackNext = trialReports.find((r) => r.id !== item.id);
                            if (fallbackNext) handleSelectReport(fallbackNext);
                          }
                        }}
                        aria-label={`Xóa báo cáo của ${item.studentName}`}
                        className="p-1.5 text-slate-400 hover:text-rose-700 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Lead Status & Optional Promotion to Official Roster */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="trial-lead-status"
                  className="text-xs font-medium text-slate-600 whitespace-nowrap"
                >
                  Trạng thái theo dõi:
                </label>
                <select
                  id="trial-lead-status"
                  value={draft.leadStatus}
                  onChange={(e) => {
                    const nextStatus = e.target.value as TrialLeadStatus;
                    const nextReport = { ...draft, leadStatus: nextStatus, updatedAt: Date.now() };
                    setDraftOverride(nextReport);
                    saveTrialReport(nextReport);
                  }}
                  className="px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white"
                >
                  <option value="new_trial">Mới học thử</option>
                  <option value="sent_parent">Đã gửi PH</option>
                  <option value="considering">Đang cân nhắc</option>
                  <option value="enrolled">Đã chốt đăng ký</option>
                </select>
              </div>

              {classes.length > 0 && draft.studentName.trim() && (
                <div className="flex items-center gap-1.5">
                  <select
                    aria-label="Chọn lớp chuyển chính thức"
                    value={effectiveEnrollClassId}
                    onChange={(e) => setEnrollClassId(e.target.value)}
                    className="px-2 py-1 text-xs border border-slate-300 rounded-md bg-white max-w-[140px]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      saveTrialReport(draft);
                      enrollTrialStudent(draft.id, effectiveEnrollClassId);
                      setDraftOverride({ ...draft, leadStatus: 'enrolled' });
                      setAiFeedback(
                        `Đã chốt và thêm con ${draft.studentName} vào danh sách lớp chính thức.`
                      );
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 whitespace-nowrap"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Chốt vào lớp
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Main Editor Tabs */}
          <section className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
            <div
              role="tablist"
              aria-label="Chế độ soạn báo cáo học thử"
              className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-md"
            >
              <button
                type="button"
                role="tab"
                aria-selected={leftTab === 'info_ai'}
                onClick={() => setLeftTab('info_ai')}
                className={`px-1.5 py-1.5 text-xs font-medium rounded transition-colors ${
                  leftTab === 'info_ai'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Thông tin
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={leftTab === 'edit_sections'}
                onClick={() => setLeftTab('edit_sections')}
                className={`px-1.5 py-1.5 text-xs font-medium rounded transition-colors ${
                  leftTab === 'edit_sections'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Câu chữ
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={leftTab === 'templates'}
                onClick={() => setLeftTab('templates')}
                className={`px-1.5 py-1.5 text-xs font-medium rounded transition-colors ${
                  leftTab === 'templates'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Template
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={leftTab === 'chat'}
                onClick={() => setLeftTab('chat')}
                className={`px-1.5 py-1.5 text-xs font-medium rounded transition-colors ${
                  leftTab === 'chat'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                4. Chat AI
              </button>
            </div>

            {aiFeedback && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 text-xs text-emerald-800">
                {aiFeedback}
              </div>
            )}

            {/* TAB 1: INFO & AI */}
            {leftTab === 'info_ai' && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="trial-student-name"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Tên học sinh *
                    </label>
                    <input
                      id="trial-student-name"
                      type="text"
                      value={draft.studentName}
                      onChange={(e) => updateDraft({ studentName: e.target.value })}
                      placeholder="VD: Phương Linh"
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="trial-student-school"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Trường / Khu vực
                    </label>
                    <input
                      id="trial-student-school"
                      type="text"
                      value={draft.studentSchool}
                      onChange={(e) => updateDraft({ studentSchool: e.target.value })}
                      placeholder="VD: trường Tiểu học Võ Thị Sáu, Bạch Mai"
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="trial-class-type"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Loại lớp học
                    </label>
                    <input
                      id="trial-class-type"
                      type="text"
                      value={draft.classType}
                      onChange={(e) => updateDraft({ classType: e.target.value })}
                      placeholder="Lớp 1 kèm 1"
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="trial-subject"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Môn &amp; Khối lớp
                    </label>
                    <input
                      id="trial-subject"
                      type="text"
                      value={draft.subjectAndGrade}
                      onChange={(e) => updateDraft({ subjectAndGrade: e.target.value })}
                      placeholder="VD: Toán (Lớp 5)"
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="trial-teacher"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Giáo viên
                    </label>
                    <input
                      id="trial-teacher"
                      type="text"
                      value={draft.teacherName}
                      onChange={(e) => updateDraft({ teacherName: e.target.value })}
                      placeholder="Phương Anh"
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="trial-date"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Ngày học
                    </label>
                    <input
                      id="trial-date"
                      type="text"
                      value={draft.studyDate}
                      onChange={(e) => updateDraft({ studyDate: e.target.value })}
                      placeholder="14/11/2026"
                      className="w-full px-3 py-1.5 text-sm font-mono tabular-nums border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="trial-duration"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Thời lượng buổi học
                    </label>
                    <input
                      id="trial-duration"
                      type="text"
                      value={draft.duration}
                      onChange={(e) => updateDraft({ duration: e.target.value })}
                      placeholder="~60 phút"
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="trial-parent-phone"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      SĐT / Zalo phụ huynh
                    </label>
                    <input
                      id="trial-parent-phone"
                      type="text"
                      value={draft.parentPhone}
                      onChange={(e) => updateDraft({ parentPhone: e.target.value })}
                      placeholder="0916xxxxxx"
                      className="w-full px-3 py-1.5 text-sm font-mono tabular-nums border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="trial-session-status"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Trạng thái buổi học
                    </label>
                    <input
                      id="trial-session-status"
                      type="text"
                      value={draft.sessionStatus}
                      onChange={(e) => updateDraft({ sessionStatus: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="trial-topic"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Chủ đề buổi học *
                  </label>
                  <textarea
                    id="trial-topic"
                    rows={2}
                    value={draft.topic}
                    onChange={(e) => updateDraft({ topic: e.target.value })}
                    placeholder="VD: Ôn tập số thập phân (cộng, trừ, nhân) · Nhân nhẩm với 10, 100, 1000 và 0,1; 0,01; 0,001"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label
                    htmlFor="trial-goal"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Định hướng mục tiêu đề xuất cho phụ huynh
                  </label>
                  <input
                    id="trial-goal"
                    type="text"
                    value={draft.targetGoal}
                    onChange={(e) => updateDraft({ targetGoal: e.target.value })}
                    placeholder="VD: Lộ trình học 1 kèm 1 nâng cao hướng tới mục tiêu thi vào lớp 6 CLC"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label
                    htmlFor="trial-quick-notes"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Ghi chú nhanh sau buổi thử (điểm mạnh, lỗi sai, thái độ tương tác)
                  </label>
                  <textarea
                    id="trial-quick-notes"
                    rows={3}
                    value={draft.teacherQuickNotes}
                    onChange={(e) =>
                      updateDraft({ teacherQuickNotes: e.target.value })
                    }
                    placeholder="VD: Con nắm chắc cộng trừ số thập phân, tự đoán đúng quy tắc nhân với 0,1 trước khi cô dạy. Còn chậm ở phép trừ có nhớ qua 10, hơi rụt rè và hay tắt mic..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                  />
                </div>

                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-md p-3 space-y-1.5">
                  <label
                    htmlFor="trial-audio-upload"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Đính kèm file ghi âm / video buổi học thử (tùy chọn)
                  </label>
                  <input
                    id="trial-audio-upload"
                    type="file"
                    accept=".mp3,.m4a,.wav,.mp4,.webm,audio/*,video/*"
                    onChange={(e) => setRecordingFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-slate-300 file:text-xs file:font-medium file:bg-white file:text-slate-700"
                  />
                  {recordingFile && (
                    <p className="text-xs font-mono text-blue-800 truncate">
                      Đã đính kèm: {recordingFile.name}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveCurrent}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Lưu hồ sơ
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateAiReport}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {aiLoading
                      ? 'AI đang viết báo cáo...'
                      : 'AI Viết báo cáo chuẩn mẫu'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: FINE-GRAINED CONTENT EDITOR */}
            {leftTab === 'edit_sections' && (
              <div className="space-y-4 max-h-[680px] overflow-y-auto pr-1">
                <div>
                  <label
                    htmlFor="edit-progress"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    I. Tiến độ buổi học
                  </label>
                  <textarea
                    id="edit-progress"
                    rows={4}
                    value={draft.progressSummary}
                    onChange={(e) =>
                      updateDraft({ progressSummary: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs leading-relaxed border border-slate-300 rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    II. 7 Tiêu chí hiệu suất buổi học thử
                  </p>
                  {draft.performanceRows.map((row, idx) => (
                    <div key={row.criterion} className="space-y-1">
                      <label className="block text-xs font-medium text-slate-600">
                        {row.criterion}
                      </label>
                      <input
                        type="text"
                        value={row.assessment}
                        onChange={(e) =>
                          handleUpdateCriterion(idx, e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div>
                    <label
                      htmlFor="edit-highlights"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      III.1 Điểm sáng
                    </label>
                    <textarea
                      id="edit-highlights"
                      rows={4}
                      value={draft.highlights}
                      onChange={(e) =>
                        updateDraft({ highlights: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs leading-relaxed border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-improvements"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      III.1 Điểm cần lưu ý
                    </label>
                    <textarea
                      id="edit-improvements"
                      rows={4}
                      value={draft.improvements}
                      onChange={(e) =>
                        updateDraft({ improvements: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs leading-relaxed border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-roadmap-summary"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      III.2 Đánh giá năng lực &amp; Định hướng lộ trình (mỗi dòng 1 ý gạch đầu dòng bên dưới)
                    </label>
                    <input
                      id="edit-roadmap-summary"
                      type="text"
                      value={draft.roadmapSummary}
                      onChange={(e) =>
                        updateDraft({ roadmapSummary: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md mb-1.5"
                    />
                    <textarea
                      aria-label="Các ý định hướng lộ trình"
                      rows={4}
                      value={draft.roadmapBullets.join('\n')}
                      onChange={(e) =>
                        updateDraft({
                          roadmapBullets: e.target.value
                            .split('\n')
                            .filter((line) => line.length > 0),
                        })
                      }
                      className="w-full px-3 py-2 text-xs leading-relaxed border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-next-lesson"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      III.3 Nội dung buổi tới
                    </label>
                    <textarea
                      id="edit-next-lesson"
                      rows={2}
                      value={draft.nextLessonPlan}
                      onChange={(e) =>
                        updateDraft({ nextLessonPlan: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs leading-relaxed border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-home-practice"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      III.3 Dặn dò con rèn luyện tại nhà (mỗi dòng 1 ý)
                    </label>
                    <textarea
                      id="edit-home-practice"
                      rows={3}
                      value={draft.homePracticeBullets.join('\n')}
                      onChange={(e) =>
                        updateDraft({
                          homePracticeBullets: e.target.value
                            .split('\n')
                            .filter((line) => line.length > 0),
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs leading-relaxed border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-closing"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Lời nhắn khích lệ cuối báo cáo
                    </label>
                    <textarea
                      id="edit-closing"
                      rows={2}
                      value={draft.closingEncouragement}
                      onChange={(e) =>
                        updateDraft({ closingEncouragement: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs leading-relaxed border border-slate-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSaveCurrent}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Lưu chỉnh sửa
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: TEMPLATE GALLERY & UPLOAD */}
            {leftTab === 'templates' && (
              <div className="space-y-4">
                {/* Upload Custom Background/Design Reference */}
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-md p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <FileUp className="w-4 h-4 text-blue-700" />
                    <span>Tải lên bản tham khảo Background &amp; Design PDF</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Tải ảnh khung trang trí (PNG/JPG/WebP). Hệ thống đặt ảnh làm khung nền bên ngoài và lồng trang giấy báo cáo tiếng Việt rõ nét ở giữa.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      aria-label="Tên mẫu thiết kế mới"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      placeholder="Đặt tên mẫu (tùy chọn)"
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-600 whitespace-nowrap">Màu nhấn:</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {ACCENT_SWATCHES.map((sw) => (
                          <button
                            key={sw.value}
                            type="button"
                            onClick={() => {
                              setUploadAccent(sw.value);
                              updateDraft({ accentOverride: sw.value });
                            }}
                            aria-label={`Chọn màu ${sw.label}`}
                            style={{ backgroundColor: sw.value }}
                            className={`w-5 h-5 rounded border ${
                              uploadAccent === sw.value
                                ? 'ring-2 ring-offset-1 ring-slate-900 border-white'
                                : 'border-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <input
                    id="upload-template-image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) =>
                      handleUploadTemplateFile(e.target.files?.[0] ?? null)
                    }
                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-slate-300 file:text-xs file:font-medium file:bg-white file:text-slate-700 hover:file:bg-slate-100"
                  />
                </div>

                {/* Branding Design & Logo Controls */}
                <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <ImagePlus className="w-4 h-4 text-blue-700" />
                      <span>Logo thương hiệu &amp; Chân trang A4</span>
                    </div>
                    {draft.brandLogoDataUrl && (
                      <button
                        type="button"
                        onClick={() => updateDraft({ brandLogoDataUrl: undefined })}
                        className="text-xs text-rose-700 hover:underline"
                      >
                        Xóa logo
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      id="upload-brand-logo"
                      type="file"
                      aria-label="Tải lên logo thương hiệu"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={(e) =>
                        handleUploadBrandLogo(e.target.files?.[0] ?? null)
                      }
                      className="block w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-slate-300 file:text-xs file:font-medium file:bg-white file:text-slate-700"
                    />
                    <input
                      type="text"
                      aria-label="Thông tin liên hệ chân trang"
                      value={draft.brandTagline ?? ''}
                      onChange={(e) => updateDraft({ brandTagline: e.target.value })}
                      placeholder="VD: Hotline/Zalo tư vấn: 0912 345 678"
                      className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Inner Paper Opacity & Layout Mode Controls */}
                <div className="border border-slate-200 rounded-md p-3 space-y-3">
                  <div className="space-y-1.5">
                    <span className="block text-xs font-medium text-slate-700">
                      Kiểu trình bày nền trên trang A4
                    </span>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-md">
                      {(
                        [
                          { id: 'framed_paper', label: 'Khung viền' },
                          { id: 'watermark', label: 'Nền mờ chìm' },
                          { id: 'header_band', label: 'Dải đầu trang' },
                        ] as Array<{ id: TemplateLayoutMode; label: string }>
                      ).map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => updateDraft({ layoutMode: mode.id })}
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            (draft.layoutMode ?? 'framed_paper') === mode.id
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600'
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="sheet-opacity-range"
                      className="font-medium text-slate-700"
                    >
                      Độ phủ nền giấy trắng (che chữ mẫu cũ, giữ viền trang trí)
                    </label>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {Math.round(draft.sheetOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    id="sheet-opacity-range"
                    type="range"
                    min={0.8}
                    max={1}
                    step={0.01}
                    value={draft.sheetOpacity}
                    onChange={(e) =>
                      updateDraft({ sheetOpacity: Number(e.target.value) })
                    }
                    className="w-full accent-blue-700"
                  />
                </div>

                {/* Template Category Sub-tabs */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-md">
                  <button
                    type="button"
                    onClick={() => setTemplateTab('clean')}
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      templateTab === 'clean'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Thiết kế sạch (6)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateTab('reference')}
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      templateTab === 'reference'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Kho mẫu sẵn (22)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateTab('uploaded')}
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      templateTab === 'uploaded'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Đã tải lên ({customTemplates.length})
                  </button>
                </div>

                {/* Template Grid */}
                {filteredTemplates.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6 border border-slate-200 rounded-md">
                    Chưa có mẫu tự tải lên. Chọn tệp ảnh thiết kế ở khung phía trên để thêm vào kho riêng của cô.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
                    {filteredTemplates.map((tpl) => {
                      const active = tpl.id === draft.templateId;
                      return (
                        <div
                          key={tpl.id}
                          className={`relative rounded-md border overflow-hidden transition-all ${
                            active
                              ? 'border-blue-700 ring-2 ring-blue-600/30'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              updateDraft({
                                templateId: tpl.id,
                                sheetOpacity: tpl.defaultSheetOpacity,
                                accentOverride: tpl.accentColor,
                              })
                            }
                            className="w-full text-left block"
                          >
                            <div
                              className="aspect-[3/4] w-full relative overflow-hidden flex items-center justify-center p-2"
                              style={{ backgroundColor: tpl.pageBg }}
                            >
                              {tpl.backgroundImage ? (
                                <img
                                  src={tpl.backgroundImage}
                                  alt={tpl.name}
                                  referrerPolicy="no-referrer"
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-white rounded border border-slate-200 p-2 flex flex-col gap-1.5">
                                  <div
                                    className="h-2.5 w-full rounded-xs"
                                    style={{ backgroundColor: tpl.accentColor }}
                                  />
                                  <div className="h-1.5 w-3/4 bg-slate-200 rounded-xs" />
                                  <div className="h-1.5 w-1/2 bg-slate-200 rounded-xs" />
                                  <div
                                    className="mt-1 h-2 w-full rounded-xs opacity-80"
                                    style={{ backgroundColor: tpl.tableHeaderBg }}
                                  />
                                  <div className="flex-1 border border-slate-100 rounded-xs" />
                                </div>
                              )}
                            </div>
                            <div className="px-2 py-1.5 bg-white border-t border-slate-100">
                              <p className="text-[11px] font-medium text-slate-800 truncate">
                                {tpl.name}
                              </p>
                            </div>
                          </button>
                          {tpl.category === 'uploaded' && (
                            <button
                              type="button"
                              onClick={() => deleteCustomTemplate(tpl.id)}
                              aria-label={`Xóa mẫu ${tpl.name}`}
                              className="absolute top-1.5 right-1.5 p-1 bg-white/90 text-slate-600 hover:text-rose-700 rounded border border-slate-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MULTI-TURN GEMINI CHAT ASSISTANT */}
            {leftTab === 'chat' && (
              <GeminiChatPanel
                compact
                contextSummary={`HS thử: ${draft.studentName || 'Chưa đặt tên'} · ${draft.subjectAndGrade} · Chủ đề: ${draft.topic || 'Chưa nhập'}`}
                onApplyReplyToNote={(text) => {
                  updateDraft({
                    teacherQuickNotes: draft.teacherQuickNotes
                      ? `${draft.teacherQuickNotes}\n${text}`
                      : text,
                  });
                  setLeftTab('info_ai');
                  setAiFeedback('Đã chèn gợi ý từ Trợ lý Gemini vào ghi chú buổi học.');
                }}
              />
            )}
          </section>
        </div>

        {/* Right Column: Live A4 Printable PDF Report */}
        <div className="xl:col-span-7">
          <article
            ref={printableRef}
            id="trial-report-printable"
            className="trial-print-sheet relative overflow-hidden rounded-lg border border-slate-200 shadow-xs max-w-[794px] mx-auto min-h-[1123px] flex flex-col"
            style={{
              backgroundColor:
                (draft.layoutMode ?? 'framed_paper') === 'watermark'
                  ? '#ffffff'
                  : activeTemplate.pageBg,
            }}
          >
            {activeTemplate.backgroundImage && (
              <img
                src={activeTemplate.backgroundImage}
                alt={`Khung nền ${activeTemplate.name}`}
                referrerPolicy="no-referrer"
                className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none ${
                  (draft.layoutMode ?? 'framed_paper') === 'watermark'
                    ? 'opacity-15'
                    : 'opacity-100'
                }`}
              />
            )}

            <div
              className="relative z-10 flex-1 flex flex-col justify-between m-4 sm:m-6 p-5 sm:p-8 rounded-lg border space-y-5 text-slate-900 backdrop-blur-[2px]"
              style={{
                backgroundColor:
                  (draft.layoutMode ?? 'framed_paper') === 'watermark'
                    ? 'rgba(255, 255, 255, 0.88)'
                    : `rgba(255, 255, 255, ${draft.sheetOpacity})`,
                borderColor: activeTemplate.borderColor,
              }}
            >
              <div className="space-y-5">
                {/* Optional Top Accent Header Band */}
                {(draft.layoutMode ?? 'framed_paper') === 'header_band' && (
                  <div
                    className="-mx-5 -mt-5 sm:-mx-8 sm:-mt-8 px-6 py-3 rounded-t-lg text-white flex items-center justify-between text-xs font-medium"
                    style={{ backgroundColor: activeAccent }}
                  >
                    <span>{settings.schoolName}</span>
                    <span className="font-mono tabular-nums">{draft.studyDate}</span>
                  </div>
                )}

                {/* Report Title + Optional Branding Logo */}
                <header
                  className="border-b-2 pb-4 flex flex-col items-center text-center gap-1.5"
                  style={{ borderColor: activeAccent }}
                >
                  {draft.brandLogoDataUrl && (
                    <img
                      src={draft.brandLogoDataUrl}
                      alt="Logo thương hiệu"
                      referrerPolicy="no-referrer"
                      className="h-11 w-auto object-contain mb-0.5"
                    />
                  )}
                  <p className="text-xs font-medium tracking-wider uppercase text-slate-500">
                    {settings.schoolName}
                  </p>
                  <h2
                    className="text-xl sm:text-2xl font-bold tracking-tight uppercase"
                    style={{ fontFamily: 'var(--font-display)', color: activeAccent }}
                  >
                    BÁO CÁO BUỔI HỌC THỬ
                  </h2>
                </header>

              {/* Metadata Block */}
              <section className="print-avoid-break bg-slate-50/90 border border-slate-200 rounded-md p-4 space-y-2.5 text-xs sm:text-sm">
                <h3
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: activeAccent }}
                >
                  Thông tin lớp học
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  <p>
                    <span className="text-slate-500">Loại lớp học: </span>
                    <span className="font-medium text-slate-900">{draft.classType}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Môn: </span>
                    <span className="font-medium text-slate-900">{draft.subjectAndGrade}</span>
                  </p>
                  <p className="sm:col-span-2">
                    <span className="text-slate-500">Học sinh: </span>
                    <span className="font-semibold text-slate-900">
                      {draft.studentName || 'Chưa nhập tên'}
                    </span>
                    {draft.studentSchool && (
                      <span className="text-slate-700"> ({draft.studentSchool})</span>
                    )}
                  </p>
                  <p>
                    <span className="text-slate-500">Giáo viên: </span>
                    <span className="font-medium text-slate-900">{draft.teacherName}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Ngày học: </span>
                    <span className="font-mono tabular-nums font-medium text-slate-900">
                      {draft.studyDate}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-500">Thời lượng: </span>
                    <span className="font-medium text-slate-900">{draft.duration}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Trạng thái: </span>
                    <span className="font-medium text-slate-900">{draft.sessionStatus}</span>
                  </p>
                  <p className="sm:col-span-2 pt-1 border-t border-slate-200/80">
                    <span className="text-slate-500">Chủ đề buổi học: </span>
                    <span className="font-semibold text-slate-900">
                      {draft.topic || 'Chưa cập nhật chủ đề'}
                    </span>
                  </p>
                </div>
              </section>

              {/* I. TIẾN ĐỘ BUỔI HỌC */}
              <section className="print-avoid-break space-y-1.5">
                <h3
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-display)', color: activeAccent }}
                >
                  I. TIẾN ĐỘ BUỔI HỌC
                </h3>
                <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-line">
                  {draft.progressSummary}
                </p>
              </section>

              {/* II. HIỆU SUẤT BUỔI HỌC THỬ */}
              <section className="print-avoid-break space-y-2">
                <h3
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-display)', color: activeAccent }}
                >
                  II. HIỆU SUẤT BUỔI HỌC THỬ
                </h3>
                <div className="overflow-hidden border border-slate-300 rounded-md">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr
                        style={{
                          backgroundColor:
                            draft.accentOverride || activeTemplate.tableHeaderBg,
                          color: activeTemplate.tableHeaderText,
                        }}
                      >
                        <th className="py-2 px-3 font-semibold w-[38%] border-r border-white/20">
                          Tiêu chí
                        </th>
                        <th className="py-2 px-3 font-semibold">Đánh giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {draft.performanceRows.map((row, idx) => (
                        <tr
                          key={row.criterion}
                          className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}
                        >
                          <td className="py-2 px-3 font-medium text-slate-900 align-top border-r border-slate-200">
                            {row.criterion}
                          </td>
                          <td className="py-2 px-3 text-slate-800 leading-snug align-top">
                            {row.assessment}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* III. NHẬN XÉT CHI TIẾT */}
              <section className="space-y-4">
                <h3
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-display)', color: activeAccent }}
                >
                  III. NHẬN XÉT CHI TIẾT
                </h3>

                {/* 1. Đánh giá cụ thể */}
                <div className="print-avoid-break space-y-2 text-sm leading-relaxed text-slate-800">
                  <h4 className="font-semibold text-slate-900">1. Đánh giá cụ thể</h4>
                  {draft.highlights && (
                    <p>
                      <span className="font-semibold text-emerald-800">Điểm sáng: </span>
                      {draft.highlights}
                    </p>
                  )}
                  {draft.improvements && (
                    <p>
                      <span className="font-semibold text-amber-800">Điểm cần lưu ý: </span>
                      {draft.improvements}
                    </p>
                  )}
                </div>

                {/* 2. Đánh giá năng lực & Định hướng lộ trình */}
                <div className="print-avoid-break space-y-2 text-sm leading-relaxed text-slate-800">
                  <h4 className="font-semibold text-slate-900">
                    2. Đánh giá năng lực &amp; Định hướng lộ trình
                  </h4>
                  {draft.roadmapSummary && <p>{draft.roadmapSummary}</p>}
                  {draft.roadmapBullets.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1">
                      {draft.roadmapBullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 3. Kế hoạch buổi tới & Dặn dò tự học */}
                <div className="print-avoid-break space-y-2 text-sm leading-relaxed text-slate-800">
                  <h4 className="font-semibold text-slate-900">
                    3. Kế hoạch buổi tới &amp; Dặn dò tự học
                  </h4>
                  {draft.nextLessonPlan && (
                    <p>
                      <span className="font-semibold text-slate-900">Nội dung buổi tới: </span>
                      {draft.nextLessonPlan}
                    </p>
                  )}
                  {draft.homePracticeBullets.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">
                        Dặn dò con rèn luyện tại nhà:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        {draft.homePracticeBullets.map((bullet, idx) => (
                          <li key={idx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {draft.closingEncouragement && (
                    <p
                      className="mt-2 pt-2 border-t border-slate-200 font-medium italic"
                      style={{ color: activeAccent }}
                    >
                      {draft.closingEncouragement}
                    </p>
                  )}
                </div>
              </section>
              </div>

              {/* A4 Branding Footer */}
              <footer className="print-avoid-break pt-4 mt-4 border-t border-slate-200 flex flex-wrap items-end justify-between gap-3 text-xs text-slate-500">
                <div>
                  <p className="font-semibold text-slate-700">
                    {settings.schoolName}
                  </p>
                  <p>
                    {draft.brandTagline?.trim() ||
                      `Tư vấn lộ trình học 1 kèm 1 & nhóm nhỏ · Giáo viên: ${draft.teacherName}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Giáo viên đánh giá</p>
                  <p
                    className="font-semibold text-sm mt-0.5"
                    style={{ color: activeAccent }}
                  >
                    Cô {draft.teacherName}
                  </p>
                </div>
              </footer>
            </div>
          </article>
        </div>
      </div>
    </AcademyShell>
  );
}
