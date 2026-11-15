'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import * as XLSX from 'xlsx';
import {
  BookPlus,
  Check,
  Copy,
  Download,
  ExternalLink,
  ListChecks,
  QrCode,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  COGNITIVE_LEVELS,
  COGNITIVE_LEVEL_META,
  LESSON_PRESETS,
  QUESTION_BANK,
  allocatePointsForQuestions,
  encodeAssignmentToken,
  getBankSubjects,
  selectQuestionsForLesson,
  toQuizPlatformRows,
  type Assignment,
  type AssignmentItem,
  type BankQuestion,
  type CognitiveLevel,
  type SubmissionResult,
} from '@/lib/assignments';

type AssignmentSubTab = 'builder' | 'published' | 'bank';

const ASSIGNMENTS_KEY = 'student-manager:assignments:v1';
const ASSIGNMENTS_EVENT = 'student-manager-assignments-change';
const CUSTOM_BANK_KEY = 'student-manager:question-bank:v1';
const CUSTOM_BANK_EVENT = 'student-manager-bank-change';
const SUBMISSIONS_KEY = 'student-manager:submissions:v1';

const EMPTY_ASSIGNMENTS: Assignment[] = [];
const EMPTY_BANK: BankQuestion[] = [];

let cachedAssignRaw: string | null = null;
let cachedAssignList: Assignment[] = EMPTY_ASSIGNMENTS;

function subscribeAssignments(cb: () => void) {
  window.addEventListener('storage', cb);
  window.addEventListener(ASSIGNMENTS_EVENT, cb);
  return () => {
    window.removeEventListener('storage', cb);
    window.removeEventListener(ASSIGNMENTS_EVENT, cb);
  };
}

function getAssignmentsSnapshot(): Assignment[] {
  try {
    const raw = window.localStorage.getItem(ASSIGNMENTS_KEY);
    if (raw === null) {
      cachedAssignRaw = null;
      cachedAssignList = EMPTY_ASSIGNMENTS;
      return cachedAssignList;
    }
    if (raw !== cachedAssignRaw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cachedAssignRaw = raw;
        cachedAssignList = parsed as Assignment[];
      }
    }
  } catch {
    return cachedAssignList;
  }
  return cachedAssignList;
}

function getServerAssignmentsSnapshot(): Assignment[] {
  return EMPTY_ASSIGNMENTS;
}

let cachedBankRaw: string | null = null;
let cachedCustomBank: BankQuestion[] = EMPTY_BANK;

function subscribeCustomBank(cb: () => void) {
  window.addEventListener('storage', cb);
  window.addEventListener(CUSTOM_BANK_EVENT, cb);
  return () => {
    window.removeEventListener('storage', cb);
    window.removeEventListener(CUSTOM_BANK_EVENT, cb);
  };
}

function getCustomBankSnapshot(): BankQuestion[] {
  try {
    const raw = window.localStorage.getItem(CUSTOM_BANK_KEY);
    if (raw === null) {
      cachedBankRaw = null;
      cachedCustomBank = EMPTY_BANK;
      return cachedCustomBank;
    }
    if (raw !== cachedBankRaw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cachedBankRaw = raw;
        cachedCustomBank = parsed as BankQuestion[];
      }
    }
  } catch {
    return cachedCustomBank;
  }
  return cachedCustomBank;
}

function getServerCustomBankSnapshot(): BankQuestion[] {
  return EMPTY_BANK;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export default function AssignmentCenterView() {
  const publishedAssignments = useSyncExternalStore(
    subscribeAssignments,
    getAssignmentsSnapshot,
    getServerAssignmentsSnapshot
  );
  const customQuestions = useSyncExternalStore(
    subscribeCustomBank,
    getCustomBankSnapshot,
    getServerCustomBankSnapshot
  );

  const fullBank = useMemo(
    () => [...customQuestions, ...QUESTION_BANK],
    [customQuestions]
  );
  const subjects = useMemo(() => getBankSubjects(fullBank), [fullBank]);

  const [subTab, setSubTab] = useState<AssignmentSubTab>('builder');

  // Builder state
  const [title, setTitle] = useState(LESSON_PRESETS[0].title);
  const [subject, setSubject] = useState<string>(LESSON_PRESETS[0].subject);
  const [lessonContent, setLessonContent] = useState(LESSON_PRESETS[0].lessonContent);
  const [questionCount, setQuestionCount] = useState<5 | 6>(6);
  const [selectedItems, setSelectedItems] = useState<AssignmentItem[]>(() =>
    selectQuestionsForLesson(QUESTION_BANK, {
      lessonContent: LESSON_PRESETS[0].lessonContent,
      subject: LESSON_PRESETS[0].subject,
      questionCount: 6,
    })
  );
  const [selecting, setSelecting] = useState(false);
  const [builderError, setBuilderError] = useState('');
  const [latestPublished, setLatestPublished] = useState<Assignment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<{ id: string; url: string } | null>(null);

  // Submissions state (merged from API + localStorage)
  const [submissions, setSubmissions] = useState<SubmissionResult[]>([]);

  // Bank filter & custom question form state
  const [bankSubjectFilter, setBankSubjectFilter] = useState<string>('All');
  const [bankLevelFilter, setBankLevelFilter] = useState<'All' | CognitiveLevel>('All');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQPrompt, setNewQPrompt] = useState('');
  const [newQSubject, setNewQSubject] = useState('Lập trình & CTDL');
  const [newQTopic, setNewQTopic] = useState('');
  const [newQLevel, setNewQLevel] = useState<CognitiveLevel>('nhan_biet');
  const [newQOptions, setNewQOptions] = useState<[string, string, string, string]>([
    '',
    '',
    '',
    '',
  ]);
  const [newQCorrect, setNewQCorrect] = useState<number>(0);
  const [newQSolution, setNewQSolution] = useState('');
  const [newQError, setNewQError] = useState('');

  const saveAssignments = useCallback((updater: (prev: Assignment[]) => Assignment[]) => {
    const next = updater(getAssignmentsSnapshot());
    try {
      const serialized = JSON.stringify(next);
      window.localStorage.setItem(ASSIGNMENTS_KEY, serialized);
      cachedAssignRaw = serialized;
      cachedAssignList = next;
      window.dispatchEvent(new Event(ASSIGNMENTS_EVENT));
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const saveCustomBank = useCallback((updater: (prev: BankQuestion[]) => BankQuestion[]) => {
    const next = updater(getCustomBankSnapshot());
    try {
      const serialized = JSON.stringify(next);
      window.localStorage.setItem(CUSTOM_BANK_KEY, serialized);
      cachedBankRaw = serialized;
      cachedCustomBank = next;
      window.dispatchEvent(new Event(CUSTOM_BANK_EVENT));
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const loadSubmissions = useCallback(async () => {
    let localSubs: SubmissionResult[] = [];
    try {
      const raw = window.localStorage.getItem(SUBMISSIONS_KEY);
      localSubs = raw ? (JSON.parse(raw) as SubmissionResult[]) : [];
    } catch {
      localSubs = [];
    }

    try {
      const res = await fetch('/api/assignments/submit');
      if (res.ok) {
        const data = (await res.json()) as { submissions?: SubmissionResult[] };
        const serverSubs = Array.isArray(data.submissions) ? data.submissions : [];
        const mergedMap = new Map<string, SubmissionResult>();
        for (const s of [...serverSubs, ...localSubs]) {
          mergedMap.set(s.id, s);
        }
        const merged = Array.from(mergedMap.values()).sort((a, b) =>
          b.submittedAt.localeCompare(a.submittedAt)
        );
        setSubmissions(merged);
        return;
      }
    } catch {
      // Ignore network errors and use local submissions
    }
    setSubmissions(localSubs);
  }, []);

  useEffect(() => {
    if (subTab === 'published') {
      const timer = window.setTimeout(() => {
        void loadSubmissions();
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [subTab, loadSubmissions]);

  const buildOpenPath = (assignment: Assignment) => {
    const token = encodeAssignmentToken(assignment);
    return `/quiz?d=${token}`;
  };

  const buildOpenFullUrl = (assignment: Assignment) => {
    const path = buildOpenPath(assignment);
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  const handleApplyPreset = (preset: (typeof LESSON_PRESETS)[number]) => {
    setTitle(preset.title);
    setSubject(preset.subject);
    setLessonContent(preset.lessonContent);
    setBuilderError('');
    const items = selectQuestionsForLesson(fullBank, {
      lessonContent: preset.lessonContent,
      subject: preset.subject,
      questionCount,
    });
    setSelectedItems(items);
  };

  const handleSelectFromBank = async (countOverride?: 5 | 6) => {
    const count = countOverride ?? questionCount;
    if (!lessonContent.trim()) {
      setBuilderError('Vui lòng nhập nội dung đã học trong buổi để chọn lọc câu hỏi.');
      return;
    }
    setBuilderError('');
    setSelecting(true);

    try {
      const res = await fetch('/api/assignments/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonContent,
          subject,
          questionCount: count,
          customBank: customQuestions,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { items?: AssignmentItem[] };
        if (Array.isArray(data.items) && data.items.length > 0) {
          setSelectedItems(data.items);
          return;
        }
      }
    } catch {
      // Fall back to local selection
    } finally {
      setSelecting(false);
    }

    const fallbackItems = selectQuestionsForLesson(fullBank, {
      lessonContent,
      subject,
      questionCount: count,
    });
    setSelectedItems(fallbackItems);
  };

  const handleQuestionCountChange = (count: 5 | 6) => {
    setQuestionCount(count);
    if (lessonContent.trim()) {
      const items = selectQuestionsForLesson(fullBank, {
        lessonContent,
        subject,
        questionCount: count,
      });
      setSelectedItems(items);
    }
  };

  const handleSwapQuestion = (slotIndex: number) => {
    const current = selectedItems[slotIndex];
    if (!current) return;

    const currentIds = new Set(selectedItems.map((i) => i.question.id));
    const sameLevelCandidates = fullBank.filter(
      (q) => q.level === current.question.level && !currentIds.has(q.id)
    );
    const sameSubjectFirst = sameLevelCandidates.filter((q) =>
      subject === 'All' ? true : q.subject === subject
    );
    const pool = sameSubjectFirst.length > 0 ? sameSubjectFirst : sameLevelCandidates;
    if (pool.length === 0) return;

    const replacement = pool[0];
    const nextQuestions = selectedItems.map((item, idx) =>
      idx === slotIndex ? replacement : item.question
    );
    setSelectedItems(allocatePointsForQuestions(nextQuestions));
  };

  const handlePublishAssignment = async () => {
    if (!title.trim()) {
      setBuilderError('Vui lòng nhập tiêu đề bài tập.');
      return;
    }
    if (!lessonContent.trim()) {
      setBuilderError('Vui lòng nhập nội dung buổi học.');
      return;
    }
    if (selectedItems.length < 5) {
      setBuilderError('Cần chọn ít nhất 5 câu hỏi trước khi xuất bản.');
      return;
    }
    setBuilderError('');

    const totalPoints = Math.round(
      selectedItems.reduce((acc, i) => acc + i.points, 0) * 100
    ) / 100;

    const created: Assignment = {
      id: `asg-${Date.now()}`,
      title: title.trim(),
      subject: subject === 'All' ? 'Tổng hợp' : subject,
      lessonContent: lessonContent.trim(),
      questionCount,
      items: selectedItems,
      totalPoints,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    saveAssignments((prev) => [created, ...prev]);
    setLatestPublished(created);

    try {
      const url = buildOpenFullUrl(created);
      const qr = await QRCode.toDataURL(url, {
        width: 180,
        margin: 1,
        color: { dark: '#0F172A', light: '#FFFFFF' },
      });
      setQrPreview({ id: created.id, url: qr });
    } catch {
      setQrPreview(null);
    }
  };

  const handleCopyOpenLink = async (assignment: Assignment) => {
    const url = buildOpenFullUrl(assignment);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(assignment.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  };

  const handleShowQrForAssignment = async (assignment: Assignment) => {
    try {
      const url = buildOpenFullUrl(assignment);
      const qr = await QRCode.toDataURL(url, {
        width: 180,
        margin: 1,
        color: { dark: '#0F172A', light: '#FFFFFF' },
      });
      setQrPreview({ id: assignment.id, url: qr });
    } catch {
      setQrPreview(null);
    }
  };

  const handleExportQuizPlatformExcel = (assignment: Assignment) => {
    const rows = toQuizPlatformRows(assignment);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'QuizQuestions');
    XLSX.writeFile(workbook, `${assignment.id}-quiz-export.xlsx`);
  };

  const handleDeleteAssignment = (id: string) => {
    saveAssignments((prev) => prev.filter((a) => a.id !== id));
    if (latestPublished?.id === id) setLatestPublished(null);
  };

  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQPrompt.trim() || newQOptions.some((o) => !o.trim()) || !newQSolution.trim()) {
      setNewQError('Vui lòng nhập đầy đủ đề bài, cả 4 đáp án A/B/C/D và lời giải chi tiết.');
      return;
    }
    setNewQError('');

    const created: BankQuestion = {
      id: `custom-${Date.now()}`,
      subject: newQSubject.trim() || 'Tổng hợp',
      topic: newQTopic.trim() || 'Kiến thức buổi học',
      keywords: [newQTopic.trim().toLowerCase(), newQSubject.trim().toLowerCase()].filter(Boolean),
      level: newQLevel,
      prompt: newQPrompt.trim(),
      options: [
        newQOptions[0].trim(),
        newQOptions[1].trim(),
        newQOptions[2].trim(),
        newQOptions[3].trim(),
      ],
      correctIndex: newQCorrect,
      solution: newQSolution.trim(),
      isCustom: true,
    };

    saveCustomBank((prev) => [created, ...prev]);
    setNewQPrompt('');
    setNewQTopic('');
    setNewQOptions(['', '', '', '']);
    setNewQCorrect(0);
    setNewQSolution('');
    setShowAddQuestion(false);
  };

  const levelBreakdown = useMemo(() => {
    return COGNITIVE_LEVELS.map((lvl) => {
      const matched = selectedItems.filter((i) => i.question.level === lvl);
      const points = Math.round(matched.reduce((acc, i) => acc + i.points, 0) * 100) / 100;
      return {
        level: lvl,
        meta: COGNITIVE_LEVEL_META[lvl],
        count: matched.length,
        points,
      };
    });
  }, [selectedItems]);

  const filteredBank = useMemo(() => {
    return fullBank.filter((q) => {
      if (bankSubjectFilter !== 'All' && q.subject !== bankSubjectFilter) return false;
      if (bankLevelFilter !== 'All' && q.level !== bankLevelFilter) return false;
      return true;
    });
  }, [fullBank, bankSubjectFilter, bankLevelFilter]);

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Phân hệ giao bài tập"
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-md"
        >
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'builder'}
            onClick={() => setSubTab('builder')}
            className={`px-3.5 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              subTab === 'builder'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tạo & Giao bài tập
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'published'}
            onClick={() => setSubTab('published')}
            className={`px-3.5 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              subTab === 'published'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Link đã giao & Điểm ({publishedAssignments.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'bank'}
            onClick={() => setSubTab('bank')}
            className={`px-3.5 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              subTab === 'bank'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kho bài tập ({fullBank.length})
          </button>
        </div>

        <p className="text-xs text-slate-500 font-mono tabular-nums">
          Ma trận chuẩn: NB 20% · TH 30% · VDT 40% · VDC 10% (Tổng 10.0đ)
        </p>
      </div>

      {subTab === 'builder' && (
        <div className="space-y-6">
          {/* Lesson Input & Controls */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2
                  className="text-base font-semibold text-slate-900"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Soạn bài tập bám sát nội dung buổi học
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Nhập kiến thức đã dạy trong buổi; hệ thống tự động chọn lọc 5–6 câu theo đúng thứ
                  tự Nhận biết → Thông hiểu → Vận dụng thấp → Vận dụng cao (20/30/40/10).
                </p>
              </div>
            </div>

            {/* Quick Lesson Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Mẫu buổi học:</span>
              {LESSON_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label
                  htmlFor="assignment-title"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Tiêu đề phiếu bài tập
                </label>
                <input
                  id="assignment-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Bài tập về nhà buổi 5 - Tìm kiếm nhị phân"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="assignment-subject"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Môn học / Chủ đề kho
                </label>
                <select
                  id="assignment-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="All">Tất cả môn học</option>
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="lesson-content"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Nội dung đã học trong buổi
              </label>
              <textarea
                id="lesson-content"
                rows={3}
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                placeholder="Mô tả nội dung, khái niệm, dạng bài đã học trong buổi để chọn lọc câu hỏi phù hợp..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            {builderError && (
              <p className="text-xs text-rose-600" role="alert">
                {builderError}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-700">Số lượng bài:</span>
                <div
                  role="group"
                  aria-label="Chọn số lượng câu hỏi"
                  className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-md"
                >
                  {([5, 6] as const).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleQuestionCountChange(count)}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        questionCount === count
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {count} câu
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => void handleSelectFromBank()}
                  disabled={selecting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                  {selecting ? 'Đang chọn lọc...' : 'Chọn lọc câu hỏi bám sát buổi học'}
                </button>
                <button
                  type="button"
                  onClick={() => void handlePublishAssignment()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  Tạo Link Mở Giao Bài
                </button>
              </div>
            </div>
          </section>

          {/* Latest Published Open Link Box */}
          {latestPublished && (
            <section
              aria-label="Liên kết mở vừa tạo"
              className="bg-white border border-blue-200 rounded-lg p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-blue-800">
                    Link mở đã sẵn sàng — Học sinh không cần đăng nhập vẫn làm bài và xem lời giải
                    ngay
                  </p>
                  <h3 className="text-sm font-semibold text-slate-900">{latestPublished.title}</h3>
                  <p className="text-xs font-mono text-slate-600 break-all">
                    {buildOpenFullUrl(latestPublished)}
                  </p>
                </div>

                {qrPreview && qrPreview.id === latestPublished.id && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrPreview.url}
                    alt={`QR mở bài tập ${latestPublished.title}`}
                    width={112}
                    height={112}
                    className="w-24 h-24 shrink-0 border border-slate-200 rounded bg-white"
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => void handleCopyOpenLink(latestPublished)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors whitespace-nowrap"
                >
                  {copiedId === latestPublished.id ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedId === latestPublished.id ? 'Đã sao chép Link' : 'Sao chép Link Mở'}
                </button>

                <Link
                  href={buildOpenPath(latestPublished)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Mở & Làm thử bài tập
                </Link>

                <button
                  type="button"
                  onClick={() => handleExportQuizPlatformExcel(latestPublished)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  Xuất Quizizz / Excel (.xlsx)
                </button>
              </div>
            </section>
          )}

          {/* Matrix Summary Strip (20 / 30 / 40 / 10 = 10.0 pts) */}
          <section
            aria-label="Phân bổ ma trận 20/30/40/10"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {levelBreakdown.map((entry) => (
              <div
                key={entry.level}
                className="bg-white border border-slate-200 rounded-lg p-4 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-slate-600">{entry.meta.label}</p>
                  <span className="text-xs font-mono tabular-nums text-slate-500">
                    {entry.meta.targetPercent}%
                  </span>
                </div>
                <p className="text-lg font-semibold text-slate-900 font-mono tabular-nums">
                  {entry.points.toFixed(2)}đ
                </p>
                <p className="text-xs text-slate-500 font-mono tabular-nums">
                  {entry.count} câu hỏi
                </p>
              </div>
            ))}
          </section>

          {/* Selected Questions List (Ordered NB -> TH -> VDT -> VDC) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h3
                className="text-sm font-semibold text-slate-900"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Danh sách câu hỏi đã chọn ({selectedItems.length} câu · Tổng{' '}
                <span className="font-mono tabular-nums">
                  {selectedItems.reduce((acc, i) => acc + i.points, 0).toFixed(2)}
                </span>{' '}
                điểm)
              </h3>
            </div>

            {selectedItems.map((item, idx) => {
              const meta = COGNITIVE_LEVEL_META[item.question.level];
              return (
                <article
                  key={item.question.id}
                  className="bg-white border border-slate-200 rounded-lg p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-blue-800">
                      Câu {idx + 1} · {meta.label} ({meta.targetPercent}%) ·{' '}
                      <span className="font-mono tabular-nums text-slate-800">
                        {item.points.toFixed(2)} điểm
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSwapQuestion(idx)}
                      aria-label={`Đổi câu hỏi số ${idx + 1}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Đổi câu cùng mức
                    </button>
                  </div>

                  <p className="text-sm font-medium text-slate-900 leading-relaxed">
                    {item.question.prompt}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.question.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === item.question.correctIndex;
                      return (
                        <div
                          key={optIdx}
                          className={`px-3 py-2 text-xs rounded border ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <strong className="font-mono mr-1.5">{OPTION_LETTERS[optIdx]}.</strong>
                          {opt}
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    <span className="font-semibold text-slate-800">Lời giải: </span>
                    {item.question.solution}
                  </p>
                </article>
              );
            })}
          </section>
        </div>
      )}

      {subTab === 'published' && (
        <div className="space-y-6">
          {/* Published Assignments */}
          <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2
                className="text-sm font-semibold text-slate-900"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Danh sách Link bài tập đã giao
              </h2>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {publishedAssignments.length} phiếu bài tập
              </span>
            </div>

            {publishedAssignments.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <p className="text-sm text-slate-600">
                  Chưa có bài tập nào được tạo link giao. Hãy chọn lọc câu hỏi và nhấn &ldquo;Tạo
                  Link Mở Giao Bài&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => setSubTab('builder')}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800"
                >
                  Soạn bài tập ngay
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {publishedAssignments.map((asg) => (
                  <div
                    key={asg.id}
                    className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{asg.title}</p>
                      <p className="text-xs text-slate-600">
                        {asg.subject} · {asg.items.length} câu ·{' '}
                        <span className="font-mono tabular-nums">{asg.totalPoints.toFixed(1)}đ</span>{' '}
                        · Ngày tạo {asg.createdAt}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{asg.lessonContent}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => void handleCopyOpenLink(asg)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 rounded hover:bg-blue-800 transition-colors whitespace-nowrap"
                      >
                        {copiedId === asg.id ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedId === asg.id ? 'Đã chép' : 'Copy Link'}
                      </button>

                      <Link
                        href={buildOpenPath(asg)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors whitespace-nowrap"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Mở bài làm
                      </Link>

                      <button
                        type="button"
                        onClick={() => void handleShowQrForAssignment(asg)}
                        aria-label={`Tạo mã QR cho ${asg.title}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors whitespace-nowrap"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        QR
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExportQuizPlatformExcel(asg)}
                        aria-label={`Xuất Excel cho ${asg.title}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Excel
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAssignment(asg.id)}
                        aria-label={`Xóa bài tập ${asg.title}`}
                        className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {qrPreview && (
            <section className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrPreview.url}
                alt="QR code truy cập bài tập"
                width={120}
                height={120}
                className="w-28 h-28 border border-slate-200 rounded"
              />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">Mã QR truy cập bài tập</p>
                <p className="text-xs text-slate-600">
                  Học sinh dùng camera điện thoại quét mã QR để mở link làm bài và xem lời giải tức
                  thì.
                </p>
              </div>
            </section>
          )}

          {/* Auto-graded Student Submissions Table */}
          <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-blue-700" />
                <h2
                  className="text-sm font-semibold text-slate-900"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Kết quả nộp bài & Chấm tự động
                </h2>
              </div>
              <button
                type="button"
                onClick={() => void loadSubmissions()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Làm mới
              </button>
            </div>

            {submissions.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">
                Chưa có học sinh nào nộp bài qua link mở.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                      <th className="py-2.5 px-4">Học sinh</th>
                      <th className="py-2.5 px-4">Bài tập</th>
                      <th className="py-2.5 px-4 text-right">Số câu đúng</th>
                      <th className="py-2.5 px-4 text-right">Điểm (/10)</th>
                      <th className="py-2.5 px-4">Thời gian nộp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4">
                          <div className="font-medium text-slate-900">{sub.studentName}</div>
                          {sub.studentCode && (
                            <div className="text-xs font-mono text-slate-500">
                              {sub.studentCode}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-slate-700">{sub.assignmentTitle}</td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                          {sub.correctCount} / {sub.totalQuestions}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-blue-700">
                          {sub.totalScore.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-xs text-slate-500">
                          {sub.submittedAt.slice(0, 16).replace('T', ' ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {subTab === 'bank' && (
        <div className="space-y-4">
          <section className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label htmlFor="bank-subject-filter" className="sr-only">
                  Lọc theo môn
                </label>
                <select
                  id="bank-subject-filter"
                  value={bankSubjectFilter}
                  onChange={(e) => setBankSubjectFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-md text-slate-700"
                >
                  <option value="All">Tất cả môn ({fullBank.length})</option>
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="bank-level-filter" className="sr-only">
                  Lọc theo mức độ
                </label>
                <select
                  id="bank-level-filter"
                  value={bankLevelFilter}
                  onChange={(e) =>
                    setBankLevelFilter(e.target.value as 'All' | CognitiveLevel)
                  }
                  className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-md text-slate-700"
                >
                  <option value="All">Mọi mức độ</option>
                  {COGNITIVE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {COGNITIVE_LEVEL_META[lvl].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddQuestion((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors whitespace-nowrap"
            >
              <BookPlus className="w-4 h-4" />
              {showAddQuestion ? 'Đóng biểu mẫu' : 'Thêm câu hỏi vào kho'}
            </button>
          </section>

          {showAddQuestion && (
            <form
              onSubmit={handleAddCustomQuestion}
              className="bg-white border border-slate-200 rounded-lg p-5 space-y-4"
            >
              <h3 className="text-sm font-semibold text-slate-900">
                Bổ sung câu hỏi mới vào kho bài tập
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="new-q-subject"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Môn học
                  </label>
                  <input
                    id="new-q-subject"
                    type="text"
                    value={newQSubject}
                    onChange={(e) => setNewQSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-q-topic"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Chủ đề buổi học
                  </label>
                  <input
                    id="new-q-topic"
                    type="text"
                    value={newQTopic}
                    onChange={(e) => setNewQTopic(e.target.value)}
                    placeholder="Ví dụ: Đệ quy"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-q-level"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Mức độ nhận thức
                  </label>
                  <select
                    id="new-q-level"
                    value={newQLevel}
                    onChange={(e) => setNewQLevel(e.target.value as CognitiveLevel)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                  >
                    {COGNITIVE_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {COGNITIVE_LEVEL_META[lvl].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="new-q-prompt"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Nội dung câu hỏi
                </label>
                <textarea
                  id="new-q-prompt"
                  rows={2}
                  value={newQPrompt}
                  onChange={(e) => setNewQPrompt(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OPTION_LETTERS.map((letter, idx) => (
                  <div key={letter}>
                    <label
                      htmlFor={`new-q-opt-${idx}`}
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Đáp án {letter}
                    </label>
                    <input
                      id={`new-q-opt-${idx}`}
                      type="text"
                      value={newQOptions[idx]}
                      onChange={(e) => {
                        const next = [...newQOptions] as [string, string, string, string];
                        next[idx] = e.target.value;
                        setNewQOptions(next);
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="new-q-correct"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Đáp án đúng
                  </label>
                  <select
                    id="new-q-correct"
                    value={newQCorrect}
                    onChange={(e) => setNewQCorrect(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                  >
                    {OPTION_LETTERS.map((letter, idx) => (
                      <option key={letter} value={idx}>
                        Đáp án {letter}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="new-q-solution"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Lời giải chi tiết
                  </label>
                  <input
                    id="new-q-solution"
                    type="text"
                    value={newQSolution}
                    onChange={(e) => setNewQSolution(e.target.value)}
                    placeholder="Giải thích cách làm để hiển thị cho học sinh sau khi nộp bài..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              {newQError && (
                <p className="text-xs text-rose-600" role="alert">
                  {newQError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800"
                >
                  Lưu vào kho bài tập
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {filteredBank.map((q) => (
              <article
                key={q.id}
                className="bg-white border border-slate-200 rounded-lg p-4 space-y-2"
              >
                <p className="text-xs text-slate-500 font-medium">
                  {q.subject} · {q.topic} ·{' '}
                  <span className="text-blue-800 font-semibold">
                    {COGNITIVE_LEVEL_META[q.level].label}
                  </span>
                  {q.isCustom ? ' · Tự thêm' : ''}
                </p>
                <p className="text-sm font-medium text-slate-900">{q.prompt}</p>
                <p className="text-xs text-emerald-700">
                  Đáp án đúng: {OPTION_LETTERS[q.correctIndex]}. {q.options[q.correctIndex]}
                </p>
                <p className="text-xs text-slate-600">Lời giải: {q.solution}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
