import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  PERFORMANCE_CRITERIA_LABELS,
  generateTrialReportFallback,
  type TrialReportDraftInput,
} from '@/lib/trial-report';

export async function POST(req: NextRequest) {
  let input: TrialReportDraftInput = {
    classType: 'Lớp 1 kèm 1',
    subjectAndGrade: 'Toán (Lớp 5)',
    studentName: '',
    studentSchool: '',
    teacherName: 'Phương Anh',
    studyDate: '15/11/2026',
    duration: '~60 phút',
    topic: '',
    teacherQuickNotes: '',
    targetGoal: '',
  };
  let mediaBase64: string | null = null;
  let mediaMimeType: string | null = null;
  let mediaFileName = '';

  const contentType = req.headers.get('content-type') || '';
  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      input = {
        classType: String(formData.get('classType') || 'Lớp 1 kèm 1'),
        subjectAndGrade: String(formData.get('subjectAndGrade') || 'Toán (Lớp 5)'),
        studentName: String(formData.get('studentName') || ''),
        studentSchool: String(formData.get('studentSchool') || ''),
        teacherName: String(formData.get('teacherName') || 'Phương Anh'),
        studyDate: String(formData.get('studyDate') || ''),
        duration: String(formData.get('duration') || '~60 phút'),
        topic: String(formData.get('topic') || ''),
        teacherQuickNotes: String(formData.get('teacherQuickNotes') || ''),
        targetGoal: String(formData.get('targetGoal') || ''),
      };
      const fileEntry = formData.get('file');
      if (fileEntry instanceof File && fileEntry.size > 0) {
        mediaFileName = fileEntry.name;
        mediaMimeType = fileEntry.type || 'audio/mpeg';
        if (fileEntry.size <= 10 * 1024 * 1024) {
          const buf = await fileEntry.arrayBuffer();
          mediaBase64 = Buffer.from(buf).toString('base64');
        }
      }
    } else {
      const body = (await req.json()) as Partial<TrialReportDraftInput>;
      input = {
        classType: typeof body.classType === 'string' ? body.classType : 'Lớp 1 kèm 1',
        subjectAndGrade:
          typeof body.subjectAndGrade === 'string' ? body.subjectAndGrade : 'Toán (Lớp 5)',
        studentName: typeof body.studentName === 'string' ? body.studentName : '',
        studentSchool: typeof body.studentSchool === 'string' ? body.studentSchool : '',
        teacherName: typeof body.teacherName === 'string' ? body.teacherName : 'Phương Anh',
        studyDate: typeof body.studyDate === 'string' ? body.studyDate : '',
        duration: typeof body.duration === 'string' ? body.duration : '~60 phút',
        topic: typeof body.topic === 'string' ? body.topic : '',
        teacherQuickNotes:
          typeof body.teacherQuickNotes === 'string' ? body.teacherQuickNotes : '',
        targetGoal: typeof body.targetGoal === 'string' ? body.targetGoal : '',
      };
    }
  } catch {
    return NextResponse.json(
      { error: 'Dữ liệu đầu vào không hợp lệ.' },
      { status: 400 }
    );
  }

  const fallback = generateTrialReportFallback(input);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ source: 'local', ...fallback });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = [
      `Bạn là giáo viên sư phạm giàu kinh nghiệm đang viết BÁO CÁO BUỔI HỌC THỬ gửi phụ huynh học sinh mới (chưa đăng ký học chính thức).`,
      `Hãy viết chuẩn giọng văn "Cô – Con" ấm áp, tinh tế, chuyên nghiệp, tôn trọng phụ huynh, biến lỗi sai thành hướng khắc phục rõ ràng (không chê bai nặng nề, giúp phụ huynh thấy rõ giá trị của lộ trình học cùng cô).`,
      `Thông tin buổi học thử:`,
      `- Loại lớp học: ${input.classType}`,
      `- Môn: ${input.subjectAndGrade}`,
      `- Học sinh: ${input.studentName}${input.studentSchool ? ` (${input.studentSchool})` : ''}`,
      `- Giáo viên: ${input.teacherName}`,
      `- Chủ đề buổi học: ${input.topic}`,
      `- Mục tiêu / Định hướng mong muốn: ${input.targetGoal || 'Phát triển tư duy và củng cố kiến thức vững chắc'}`,
      input.teacherQuickNotes
        ? `- Ghi chú thực tế của giáo viên / trợ giảng:\n${input.teacherQuickNotes}`
        : '',
      mediaFileName ? `- Tệp ghi âm/video đính kèm: ${mediaFileName}` : '',
      `Yêu cầu đầu ra JSON đúng cấu trúc 3 phần chuẩn form mẫu:`,
      `1. progressSummary (Mục I. TIẾN ĐỘ BUỔI HỌC): 3-4 câu nêu rõ cô đã ôn gì, dạy kiến thức mới gì, kết nối với buổi sau thế nào.`,
      `2. performanceAssessments (Mục II. HIỆU SUẤT BUỔI HỌC THỬ): mảng ĐÚNG 7 câu đánh giá ngắn gọn, súc tích tương ứng lần lượt với 7 tiêu chí: ${PERFORMANCE_CRITERIA_LABELS.join(' | ')}.`,
      `3. highlights (Mục III.1 - Điểm sáng): 1 đoạn văn (khoảng 75-110 từ) khen cụ thể tư duy, kỹ năng làm bài, thái độ tập trung và tiến bộ ngay trong buổi.`,
      `4. improvements (Mục III.1 - Điểm cần lưu ý): 1 đoạn văn (khoảng 75-110 từ) chỉ ra lỗi sai kỹ thuật, phản xạ tính toán hoặc thói quen tương tác (như bật mic, tự tin phát biểu) một cách xây dựng.`,
      `5. roadmapSummary (Mục III.2 - Câu dẫn đánh giá năng lực & định hướng): 1 câu nhận định tố chất và sự phù hợp với lộ trình đề xuất.`,
      `6. roadmapBullets (Mục III.2): 3 gạch đầu dòng đánh giá lợi thế, tiềm năng và thời gian khắc phục (VD: 3-5 buổi rèn có phương pháp).`,
      `7. nextLessonPlan (Mục III.3 - Nội dung buổi tới): 1-2 câu nêu rõ nội dung sẽ dạy ở buổi tiếp theo.`,
      `8. homePracticeBullets (Mục III.3 - Dặn dò con rèn luyện tại nhà): 3 gạch đầu dòng hướng dẫn cụ thể 5-10 phút tự luyện tại nhà.`,
      `9. closingEncouragement (Câu chốt): 1 câu khích lệ chân thành gửi con và phụ huynh.`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const contents =
      mediaBase64 && mediaMimeType
        ? [
            {
              inlineData: {
                mimeType: mediaMimeType,
                data: mediaBase64,
              },
            },
            prompt,
          ]
        : prompt;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            progressSummary: { type: Type.STRING },
            performanceAssessments: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            highlights: { type: Type.STRING },
            improvements: { type: Type.STRING },
            roadmapSummary: { type: Type.STRING },
            roadmapBullets: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            nextLessonPlan: { type: Type.STRING },
            homePracticeBullets: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            closingEncouragement: { type: Type.STRING },
          },
          required: [
            'progressSummary',
            'performanceAssessments',
            'highlights',
            'improvements',
            'roadmapSummary',
            'roadmapBullets',
            'nextLessonPlan',
            'homePracticeBullets',
            'closingEncouragement',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}') as {
      progressSummary?: string;
      performanceAssessments?: string[];
      highlights?: string;
      improvements?: string;
      roadmapSummary?: string;
      roadmapBullets?: string[];
      nextLessonPlan?: string;
      homePracticeBullets?: string[];
      closingEncouragement?: string;
    };

    const performanceRows = PERFORMANCE_CRITERIA_LABELS.map((criterion, idx) => ({
      criterion,
      assessment:
        parsed.performanceAssessments?.[idx]?.trim() ||
        fallback.performanceRows[idx].assessment,
    }));

    return NextResponse.json({
      source: 'gemini',
      progressSummary: parsed.progressSummary?.trim() || fallback.progressSummary,
      performanceRows,
      highlights: parsed.highlights?.trim() || fallback.highlights,
      improvements: parsed.improvements?.trim() || fallback.improvements,
      roadmapSummary: parsed.roadmapSummary?.trim() || fallback.roadmapSummary,
      roadmapBullets:
        Array.isArray(parsed.roadmapBullets) && parsed.roadmapBullets.length > 0
          ? parsed.roadmapBullets.map((b) => b.trim()).filter(Boolean)
          : fallback.roadmapBullets,
      nextLessonPlan: parsed.nextLessonPlan?.trim() || fallback.nextLessonPlan,
      homePracticeBullets:
        Array.isArray(parsed.homePracticeBullets) &&
        parsed.homePracticeBullets.length > 0
          ? parsed.homePracticeBullets.map((b) => b.trim()).filter(Boolean)
          : fallback.homePracticeBullets,
      closingEncouragement:
        parsed.closingEncouragement?.trim() || fallback.closingEncouragement,
    });
  } catch {
    return NextResponse.json({ source: 'local', ...fallback });
  }
}
