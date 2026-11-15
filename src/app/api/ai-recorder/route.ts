import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  parseTranscriptFallback,
  type AcademyStudent,
} from '@/lib/academy';

export async function POST(req: NextRequest) {
  let rawTranscript = '';
  let topicHint = '';
  let className = '';
  let students: AcademyStudent[] = [];
  let mediaBase64: string | null = null;
  let mediaMimeType: string | null = null;
  let mediaFileName = '';

  const contentType = req.headers.get('content-type') || '';

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      rawTranscript = String(formData.get('transcript') || '');
      topicHint = String(formData.get('topicHint') || '');
      className = String(formData.get('className') || '');
      const studentsJson = String(formData.get('students') || '[]');
      const parsedStudents = JSON.parse(studentsJson);
      if (Array.isArray(parsedStudents)) {
        students = parsedStudents as AcademyStudent[];
      }

      const fileEntry = formData.get('file');
      if (fileEntry instanceof File && fileEntry.size > 0) {
        mediaFileName = fileEntry.name;
        mediaMimeType = fileEntry.type || 'audio/mpeg';
        if (fileEntry.size <= 10 * 1024 * 1024) {
          const arrayBuf = await fileEntry.arrayBuffer();
          mediaBase64 = Buffer.from(arrayBuf).toString('base64');
        }
      }
    } else {
      const body = await req.json();
      rawTranscript = typeof body?.transcript === 'string' ? body.transcript : '';
      topicHint = typeof body?.topicHint === 'string' ? body.topicHint : '';
      className = typeof body?.className === 'string' ? body.className : '';
      if (Array.isArray(body?.students)) {
        students = body.students as AcademyStudent[];
      }
    }
  } catch {
    return NextResponse.json({ error: 'Dữ liệu đầu vào không hợp lệ.' }, { status: 400 });
  }

  const effectiveHint =
    topicHint.trim() ||
    (mediaFileName ? `Nội dung buổi học từ file ${mediaFileName}` : '');

  const fallback = parseTranscriptFallback(rawTranscript, students, effectiveHint);
  if (!rawTranscript.trim() && mediaFileName) {
    fallback.transcript = `[Bản chép tóm tắt từ tệp ${mediaFileName}] ${fallback.transcript}`;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      source: 'local',
      ...fallback,
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const instruction = [
      `Bạn là trợ lý sư phạm của lớp "${className || 'Lớp học'}".`,
      `Hãy phân tích nội dung buổi học (từ audio/video hoặc ghi chú trợ giảng) và trích xuất:`,
      `1. transcript: Bản ghi chép mạch lạc bằng tiếng Việt.`,
      `2. keyTopics: 2–4 gạch đầu dòng kiến thức trọng tâm.`,
      `3. homework: Bài tập về nhà và dặn dò rõ ràng.`,
      `4. studentComments: Danh sách nhận xét từng học sinh theo xưng hô "Cô – Con" ấm áp, khích lệ (40–65 từ mỗi học sinh, không chê bai).`,
      effectiveHint ? `Gợi ý chủ đề: ${effectiveHint}` : '',
      rawTranscript.trim() ? `Ghi chú / Transcript thô:\n${rawTranscript}` : '',
      `Danh sách học sinh:\n${JSON.stringify(
        students.map((s) => ({ id: s.id, fullName: s.fullName, code: s.studentCode }))
      )}`,
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
            instruction,
          ]
        : instruction;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcript: { type: Type.STRING },
            keyTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            homework: { type: Type.STRING },
            studentComments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  comment: { type: Type.STRING },
                },
                required: ['id', 'comment'],
              },
            },
          },
          required: ['transcript', 'keyTopics', 'homework', 'studentComments'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}') as {
      transcript?: string;
      keyTopics?: string[];
      homework?: string;
      studentComments?: Array<{ id?: string; comment?: string }>;
    };

    const mergedComments = { ...fallback.studentComments };
    if (Array.isArray(parsed.studentComments)) {
      for (const item of parsed.studentComments) {
        if (item.id && item.comment && item.comment.trim().length > 12) {
          mergedComments[item.id] = item.comment.trim();
        }
      }
    }

    return NextResponse.json({
      source: 'gemini',
      transcript: parsed.transcript?.trim() || fallback.transcript,
      keyTopics:
        Array.isArray(parsed.keyTopics) && parsed.keyTopics.length > 0
          ? parsed.keyTopics
          : fallback.keyTopics,
      homework: parsed.homework?.trim() || fallback.homework,
      studentComments: mergedComments,
    });
  } catch {
    return NextResponse.json({
      source: 'local',
      ...fallback,
    });
  }
}
