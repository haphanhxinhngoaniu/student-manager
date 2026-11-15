'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, FileAudio, Sparkles } from 'lucide-react';
import AcademyShell from './AcademyShell';
import { useAcademyWorkspace } from '@/lib/academy-store';
import {
  formatShortDayMonth,
  type AiRecordingAnalysis,
  type AttendanceEntry,
} from '@/lib/academy';

const SAMPLE_TA_TRANSCRIPT = `Chuyên đề trọng tâm hôm nay: Phương trình bậc hai chứa tham số m và hệ thức Vi-ét nâng cao.
Kiến thức trọng tâm: Điều kiện để phương trình có hai nghiệm phân biệt delta > 0 và cách biến đổi biểu thức đối xứng x1^2 + x2^2.
Dặn dò BTVN: Hoàn thành 5 bài tập tự luận trong phiếu số 05 và chuẩn bị kiểm tra 15 phút đầu giờ buổi tới.
- Con Nguyễn Minh Anh làm bài rất nhanh, trình bày sạch sẽ, hỗ trợ bạn giải câu cuối.
- Con Trần Quốc Bảo nắm chắc công thức delta, cần rà soát kỹ dấu ngoặc khi thay hệ số.
- Con Lê Hà Phương hôm nay rất chăm chú nghe giảng và chủ động hỏi lại chỗ chưa rõ.
- Con Phạm Gia Huy phát biểu sôi nổi, nhớ hoàn thành đủ bài tập về nhà trước thứ Sáu nhé.`;

export default function AiRecorderWorkspace() {
  const { classes, students, settings, upsertSession } = useAcademyWorkspace();
  const [selectedClassId, setSelectedClassId] = useState<string>(
    () => classes[0]?.id ?? ''
  );
  const [targetDate, setTargetDate] = useState<string>('2026-11-17');
  const [topicHint, setTopicHint] = useState<string>(
    'Phương trình bậc hai chứa tham số m & Hệ thức Vi-ét'
  );
  const [rawTranscript, setRawTranscript] = useState<string>(SAMPLE_TA_TRANSCRIPT);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AiRecordingAnalysis | null>(null);
  const [syncedMessage, setSyncedMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const activeClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId) ?? classes[0] ?? null,
    [classes, selectedClassId]
  );

  const classStudents = useMemo(
    () =>
      activeClass
        ? students.filter((s) => s.classId === activeClass.id && s.status === 'Active')
        : [],
    [activeClass, students]
  );

  const handleAnalyze = async () => {
    if (!activeClass) return;
    if (!rawTranscript.trim() && !selectedFile) {
      setErrorMessage('Vui lòng tải lên tệp ghi âm/video hoặc dán biên bản buổi học.');
      return;
    }

    setErrorMessage('');
    setSyncedMessage('');
    setAnalyzing(true);

    try {
      let res: Response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('transcript', rawTranscript);
        formData.append('topicHint', topicHint);
        formData.append('className', activeClass.name);
        formData.append('students', JSON.stringify(classStudents));
        res = await fetch('/api/ai-recorder', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/ai-recorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: rawTranscript,
            topicHint,
            className: activeClass.name,
            students: classStudents,
          }),
        });
      }

      if (!res.ok) {
        throw new Error('Request failed');
      }

      const data = (await res.json()) as AiRecordingAnalysis;
      setAnalysis({
        transcript: data.transcript || rawTranscript,
        keyTopics: Array.isArray(data.keyTopics) ? data.keyTopics : [],
        homework: data.homework || '',
        studentComments: data.studentComments || {},
      });
    } catch {
      setErrorMessage('Không thể phân tích nội dung lúc này. Vui lòng thử lại.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSyncToAttendance = () => {
    if (!activeClass || !analysis) return;

    const entries: Record<string, AttendanceEntry> = {};
    for (const st of classStudents) {
      entries[st.id] = {
        status: 'present',
        homeworkStatus: 'done',
        note: analysis.studentComments[st.id] || '',
      };
    }

    upsertSession({
      id: `ses-ai-${Date.now()}`,
      classId: activeClass.id,
      date: targetDate,
      topic: analysis.keyTopics[0] || topicHint || activeClass.name,
      homework: analysis.homework,
      recordedBy: settings.currentUserName,
      recordedByRole: settings.currentRole,
      entries,
    });

    setSyncedMessage(
      `Đã đồng bộ kiến thức trọng tâm, dặn dò BTVN và ${classStudents.length} nhận xét học sinh vào Điểm danh ngày ${formatShortDayMonth(targetDate)}.`
    );
  };

  return (
    <AcademyShell
      title="AI Phân tích buổi học từ ghi âm / video"
      subtitle="Transcript & Tự động nhận xét"
    >
      {/* Setup & Input Panel */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="recorder-class"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Lớp học mục tiêu
            </label>
            <select
              id="recorder-class"
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
              htmlFor="recorder-date"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Ngày đồng bộ điểm danh
            </label>
            <input
              id="recorder-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-md"
            />
          </div>

          <div>
            <label
              htmlFor="recorder-topic"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Chủ đề gợi ý
            </label>
            <input
              id="recorder-topic"
              type="text"
              value={topicHint}
              onChange={(e) => setTopicHint(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 flex flex-col justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <FileAudio className="w-4 h-4 text-blue-700" />
                <span>Tải file ghi âm / video</span>
              </div>
              <p className="text-xs text-slate-600">
                Hỗ trợ .mp3, .m4a, .wav, .mp4, .webm (tối đa 10MB gửi AI trực tiếp).
              </p>
            </div>
            <label className="block">
              <span className="sr-only">Chọn tệp ghi âm hoặc video</span>
              <input
                type="file"
                accept=".mp3,.m4a,.wav,.mp4,.webm,audio/*,video/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-slate-300 file:text-xs file:font-medium file:bg-white file:text-slate-700 hover:file:bg-slate-100"
              />
            </label>
            {selectedFile && (
              <p className="text-xs font-mono text-blue-800 truncate">
                Đã chọn: {selectedFile.name}
              </p>
            )}
          </div>

          <div className="lg:col-span-8 space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="recorder-transcript"
                className="text-xs font-medium text-slate-700"
              >
                Hoặc dán biên bản ghi chép / transcript của trợ giảng
              </label>
              <button
                type="button"
                onClick={() => setRawTranscript(SAMPLE_TA_TRANSCRIPT)}
                className="text-xs text-blue-700 hover:text-blue-900 font-medium"
              >
                Dùng biên bản mẫu
              </button>
            </div>
            <textarea
              id="recorder-transcript"
              rows={5}
              value={rawTranscript}
              onChange={(e) => setRawTranscript(e.target.value)}
              placeholder="Dán nội dung buổi học, ghi chú của trợ giảng về từng học sinh và bài tập dặn dò..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded px-3 py-2">
            {errorMessage}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing || !activeClass}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {analyzing ? 'Đang phân tích buổi học...' : 'Phân tích buổi học bằng AI'}
          </button>
        </div>
      </section>

      {/* AI Output & Sync Preview */}
      {analysis && (
        <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2
                className="text-base font-semibold text-slate-900"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Kết quả bóc tách kiến thức &amp; Nhận xét từng học sinh
              </h2>
              <p className="text-xs text-slate-500">
                Kiểm tra lại nội dung và bấm đồng bộ để lưu thẳng vào mục Điểm danh ngày{' '}
                <span className="font-mono">{formatShortDayMonth(targetDate)}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleSyncToAttendance}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-700 rounded-md hover:bg-emerald-800 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Đồng bộ vào Điểm danh
            </button>
          </div>

          {syncedMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-800">
              <span>{syncedMessage}</span>
              <Link
                href="/attendance"
                className="inline-flex items-center gap-1 font-semibold text-emerald-900 underline"
              >
                Mở trang Điểm danh
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Kiến thức trọng tâm &amp; Dặn dò
              </h3>
              <ul className="list-disc pl-4 space-y-1 text-sm text-slate-800">
                {analysis.keyTopics.map((topic, idx) => (
                  <li key={idx}>{topic}</li>
                ))}
              </ul>
              <div className="pt-2 border-t border-slate-200">
                <label
                  htmlFor="ai-homework-edit"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  Dặn dò BTVN
                </label>
                <textarea
                  id="ai-homework-edit"
                  rows={2}
                  value={analysis.homework}
                  onChange={(e) =>
                    setAnalysis((prev) =>
                      prev ? { ...prev, homework: e.target.value } : prev
                    )
                  }
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Transcript buổi học
              </h3>
              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                {analysis.transcript}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Nhận xét tự động theo từng học sinh ({classStudents.length})
            </h3>
            {classStudents.map((st) => (
              <div
                key={st.id}
                className="border border-slate-200 rounded-md p-3.5 space-y-1.5"
              >
                <p className="text-xs font-semibold text-slate-900">
                  <span className="font-mono text-slate-500 mr-2">{st.studentCode}</span>
                  {st.fullName}
                </p>
                <textarea
                  rows={2}
                  value={analysis.studentComments[st.id] ?? ''}
                  onChange={(e) =>
                    setAnalysis((prev) =>
                      prev
                        ? {
                            ...prev,
                            studentComments: {
                              ...prev.studentComments,
                              [st.id]: e.target.value,
                            },
                          }
                        : prev
                    )
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </AcademyShell>
  );
}
