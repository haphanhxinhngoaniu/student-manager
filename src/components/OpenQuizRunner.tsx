'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import {
  COGNITIVE_LEVELS,
  COGNITIVE_LEVEL_META,
  QUESTION_BANK,
  decodeAssignmentToken,
  gradeAssignment,
  selectQuestionsForLesson,
  type Assignment,
  type BankQuestion,
  type SubmissionResult,
} from '@/lib/assignments';

const ASSIGNMENTS_STORAGE_KEY = 'student-manager:assignments:v1';
const SUBMISSIONS_STORAGE_KEY = 'student-manager:submissions:v1';
const CUSTOM_BANK_STORAGE_KEY = 'student-manager:question-bank:v1';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export default function OpenQuizRunner() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('d') ?? '';
  const idParam = searchParams.get('id') ?? '';

  const [studentName, setStudentName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [nameError, setNameError] = useState('');
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [submittedResult, setSubmittedResult] = useState<SubmissionResult | null>(null);
  const [savedServerStatus, setSavedServerStatus] = useState<'idle' | 'saved' | 'local'>('idle');

  const [storedState, setStoredState] = useState<{
    loaded: boolean;
    localAssignment: Assignment | null;
  }>({ loaded: false, localAssignment: null });

  useEffect(() => {
    let localAssignment: Assignment | null = null;
    try {
      const rawBank = window.localStorage.getItem(CUSTOM_BANK_STORAGE_KEY);
      const customBank: BankQuestion[] = rawBank ? JSON.parse(rawBank) : [];
      if (tokenParam) {
        localAssignment = decodeAssignmentToken(tokenParam, customBank);
      }
      if (!localAssignment && idParam) {
        const rawList = window.localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
        const list: Assignment[] = rawList ? JSON.parse(rawList) : [];
        localAssignment = list.find((a) => a.id === idParam) ?? null;
      }
    } catch {
      localAssignment = null;
    }

    const timer = window.setTimeout(() => {
      setStoredState({ loaded: true, localAssignment });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [tokenParam, idParam]);

  const assignment: Assignment | null = useMemo(() => {
    if (storedState.localAssignment) return storedState.localAssignment;
    if (tokenParam) {
      return decodeAssignmentToken(tokenParam);
    }
    if (!idParam && !tokenParam) {
      // Demo open assignment if user visits /quiz directly
      const items = selectQuestionsForLesson(QUESTION_BANK, {
        lessonContent:
          'Tìm kiếm nhị phân trên mảng đã sắp xếp tăng dần và độ phức tạp thuật toán',
        questionCount: 5,
      });
      return {
        id: 'demo-open-quiz',
        title: 'Bài tập mẫu: Tìm kiếm nhị phân & Độ phức tạp',
        subject: 'Lập trình & CTDL',
        lessonContent:
          'Tìm kiếm nhị phân trên mảng đã sắp xếp tăng dần và đánh giá độ phức tạp O(log n).',
        questionCount: 5,
        items,
        totalPoints: 10,
        createdAt: '2026-11-15',
      };
    }
    return null;
  }, [storedState.localAssignment, tokenParam, idParam]);

  const answeredCount = useMemo(() => {
    if (!assignment) return 0;
    return assignment.items.filter(
      (item) => answers[item.question.id] !== undefined && answers[item.question.id] !== null
    ).length;
  }, [assignment, answers]);

  const levelSummary = useMemo(() => {
    if (!assignment) return [];
    return COGNITIVE_LEVELS.map((lvl) => {
      const matched = assignment.items.filter((i) => i.question.level === lvl);
      const pts = matched.reduce((acc, i) => acc + i.points, 0);
      return {
        level: lvl,
        meta: COGNITIVE_LEVEL_META[lvl],
        count: matched.length,
        points: Math.round(pts * 100) / 100,
      };
    }).filter((entry) => entry.count > 0);
  }, [assignment]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submittedResult) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment) return;

    if (!studentName.trim()) {
      setNameError('Vui lòng nhập họ và tên học sinh trước khi nộp bài.');
      return;
    }
    setNameError('');

    const result = gradeAssignment(assignment, answers, {
      studentName,
      studentCode,
    });
    setSubmittedResult(result);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const raw = window.localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      const existing: SubmissionResult[] = raw ? JSON.parse(raw) : [];
      window.localStorage.setItem(
        SUBMISSIONS_STORAGE_KEY,
        JSON.stringify([result, ...existing].slice(0, 200))
      );
    } catch {
      // Ignore storage errors
    }

    try {
      const res = await fetch('/api/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission: result }),
      });
      setSavedServerStatus(res.ok ? 'saved' : 'local');
    } catch {
      setSavedServerStatus('local');
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmittedResult(null);
    setSavedServerStatus('idle');
  };

  if (!assignment && storedState.loaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-6 text-center space-y-4">
          <h1
            className="text-lg font-semibold text-slate-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Không tìm thấy đường dẫn bài tập
          </h1>
          <p className="text-sm text-slate-600">
            Liên kết bài tập không hợp lệ hoặc đã bị thay đổi. Vui lòng kiểm tra lại link từ giáo
            viên.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại Student Manager
          </Link>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-sm text-slate-600">Đang tải bài tập...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen className="w-5 h-5 text-blue-700 shrink-0" />
            <span
              className="text-base font-bold text-slate-900 truncate"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Phiếu Bài Tập Trực Tuyến
            </span>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Trang quản lý
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Assignment Overview Card */}
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <div className="space-y-1.5">
            <p className="text-xs text-slate-500 font-medium">
              {assignment.subject} · {assignment.items.length} câu hỏi · Tổng điểm{' '}
              <span className="font-mono tabular-nums text-slate-900">
                {assignment.totalPoints.toFixed(1)}
              </span>
            </p>
            <h1
              className="text-xl sm:text-2xl font-bold text-slate-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {assignment.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Nội dung buổi học: {assignment.lessonContent}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200">
            {levelSummary.map((entry) => (
              <div key={entry.level} className="bg-slate-50 border border-slate-200 rounded-md p-3">
                <p className="text-xs font-medium text-slate-600">{entry.meta.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {entry.count} câu · {entry.points.toFixed(1)}đ
                </p>
                <p className="text-xs text-slate-500 font-mono tabular-nums">
                  Tỉ lệ {entry.meta.targetPercent}%
                </p>
              </div>
            ))}
          </div>
        </section>

        {submittedResult ? (
          /* ================= AUTO-GRADED RESULT & SOLUTIONS ================= */
          <div className="space-y-6">
            <section
              aria-label="Kết quả chấm tự động"
              className="bg-white border border-slate-200 rounded-lg p-6 space-y-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                    <ClipboardCheck className="w-4 h-4" />
                    Đã chấm tự động
                  </p>
                  <h2
                    className="mt-1 text-xl font-bold text-slate-900"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Kết quả của {submittedResult.studentName}
                    {submittedResult.studentCode ? ` (${submittedResult.studentCode})` : ''}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {savedServerStatus === 'saved'
                      ? 'Điểm và bài làm đã được ghi nhận vào bảng kết quả.'
                      : 'Điểm và lời giải chi tiết đã hiển thị bên dưới.'}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs font-medium text-slate-500">Tổng điểm đạt được</p>
                  <p
                    data-testid="quiz-final-score"
                    className="text-3xl font-bold text-blue-700 font-mono tabular-nums"
                  >
                    {submittedResult.totalScore.toFixed(2)} / {submittedResult.maxScore.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-600 font-mono tabular-nums">
                    Đúng {submittedResult.correctCount} / {submittedResult.totalQuestions} câu
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200">
                {submittedResult.levelBreakdown.map((lvl) => (
                  <div
                    key={lvl.level}
                    className="bg-slate-50 border border-slate-200 rounded-md p-3"
                  >
                    <p className="text-xs font-medium text-slate-600">{lvl.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 font-mono tabular-nums">
                      {lvl.earnedPoints.toFixed(2)} / {lvl.maxPoints.toFixed(2)}đ
                    </p>
                    <p className="text-xs text-slate-500 font-mono tabular-nums">
                      {lvl.correctCount}/{lvl.totalCount} câu đúng
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Làm lại bài tập
                </button>
              </div>
            </section>

            <section aria-label="Chi tiết đáp án và lời giải" className="space-y-4">
              <h3
                className="text-base font-semibold text-slate-900"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Đáp án & Lời giải chi tiết từng câu
              </h3>

              {submittedResult.itemResults.map((item, idx) => {
                const levelMeta = COGNITIVE_LEVEL_META[item.level];
                return (
                  <article
                    key={item.questionId}
                    className="bg-white border border-slate-200 rounded-lg p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-slate-600 font-medium">
                        Câu {idx + 1} · {levelMeta.label} ·{' '}
                        <span className="font-mono tabular-nums">
                          {item.earnedPoints.toFixed(2)} / {item.maxPoints.toFixed(2)} điểm
                        </span>
                      </p>
                      {item.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                          Chính xác
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                          <XCircle className="w-4 h-4" />
                          Chưa đúng
                        </span>
                      )}
                    </div>

                    <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                      {item.prompt}
                    </p>

                    <div className="space-y-2">
                      {item.options.map((opt, optIdx) => {
                        const isChosen = item.selectedIndex === optIdx;
                        const isAnswer = item.correctIndex === optIdx;
                        let styleClass = 'border-slate-200 bg-white text-slate-700';
                        if (isAnswer) {
                          styleClass = 'border-emerald-300 bg-emerald-50 text-emerald-950 font-medium';
                        } else if (isChosen && !isAnswer) {
                          styleClass = 'border-rose-300 bg-rose-50 text-rose-900';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`px-3.5 py-2.5 text-sm border rounded-md flex items-start justify-between gap-3 ${styleClass}`}
                          >
                            <span>
                              <strong className="font-mono mr-2">{OPTION_LETTERS[optIdx]}.</strong>
                              {opt}
                            </span>
                            {isAnswer && (
                              <span className="text-xs font-medium text-emerald-700 shrink-0">
                                Đáp án đúng
                              </span>
                            )}
                            {isChosen && !isAnswer && (
                              <span className="text-xs font-medium text-rose-700 shrink-0">
                                Bạn đã chọn
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-1">
                      <p className="text-xs font-semibold text-slate-800">Lời giải chi tiết</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{item.solution}</p>
                    </div>
                  </article>
                );
              })}
            </section>
          </div>
        ) : (
          /* ================= QUIZ FORM ================= */
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <h2
                className="text-base font-semibold text-slate-900"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Thông tin học sinh làm bài
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="quiz-student-name"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Họ và tên học sinh *
                  </label>
                  <input
                    id="quiz-student-name"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Minh Anh"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                  {nameError && (
                    <p className="mt-1 text-xs text-rose-600" role="alert">
                      {nameError}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="quiz-student-code"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Mã học sinh (không bắt buộc)
                  </label>
                  <input
                    id="quiz-student-code"
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="Ví dụ: SE202401"
                    className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>
            </section>

            <section aria-label="Danh sách câu hỏi" className="space-y-4">
              {assignment.items.map((item, idx) => {
                const levelMeta = COGNITIVE_LEVEL_META[item.question.level];
                const selectedIdx = answers[item.question.id] ?? null;

                return (
                  <fieldset
                    key={item.question.id}
                    className="bg-white border border-slate-200 rounded-lg p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <legend className="text-xs font-semibold text-blue-800">
                        Câu {idx + 1} · {levelMeta.label}
                      </legend>
                      <span className="text-xs font-mono tabular-nums text-slate-600">
                        {item.points.toFixed(2)} điểm
                      </span>
                    </div>

                    <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                      {item.question.prompt}
                    </p>

                    <div className="space-y-2">
                      {item.question.options.map((opt, optIdx) => {
                        const checked = selectedIdx === optIdx;
                        const inputId = `${item.question.id}-opt-${optIdx}`;
                        return (
                          <label
                            key={optIdx}
                            htmlFor={inputId}
                            className={`flex items-start gap-3 px-3.5 py-2.5 border rounded-md text-sm cursor-pointer transition-colors ${
                              checked
                                ? 'border-blue-600 bg-blue-50 text-slate-900 font-medium'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              id={inputId}
                              type="radio"
                              name={`question-${item.question.id}`}
                              checked={checked}
                              onChange={() => handleSelectOption(item.question.id, optIdx)}
                              className="mt-0.5 accent-blue-700"
                            />
                            <span>
                              <strong className="font-mono mr-2">{OPTION_LETTERS[optIdx]}.</strong>
                              {opt}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}
            </section>

            <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-slate-600 font-mono tabular-nums">
                Đã chọn đáp án: {answeredCount} / {assignment.items.length} câu
              </p>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors whitespace-nowrap"
              >
                Nộp bài & Chấm tự động
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
