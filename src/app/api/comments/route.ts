import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildWarmPedagogicalComment,
  type AttendanceStatus,
  type HomeworkStatus,
} from '@/lib/academy';

interface CommentRequestStudent {
  id: string;
  fullName: string;
  status: AttendanceStatus;
  homeworkStatus: HomeworkStatus;
}

export async function POST(req: NextRequest) {
  let topic = '';
  let className = '';
  let students: CommentRequestStudent[] = [];

  try {
    const body = await req.json();
    topic = typeof body?.topic === 'string' ? body.topic : '';
    className = typeof body?.className === 'string' ? body.className : '';
    if (Array.isArray(body?.students)) {
      students = body.students as CommentRequestStudent[];
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request.' }, { status: 400 });
  }

  if (students.length === 0) {
    return NextResponse.json({ source: 'local', comments: {} });
  }

  const buildFallbackMap = () => {
    const map: Record<string, string> = {};
    for (const s of students) {
      map[s.id] = buildWarmPedagogicalComment(
        s.fullName,
        s.status,
        s.homeworkStatus,
        topic
      );
    }
    return map;
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      source: 'local',
      comments: buildFallbackMap(),
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = [
      `Bạn là giáo viên viết nhận xét gửi phụ huynh theo xưng hô "Cô – Con" ấm áp, khích lệ, không dùng từ chê bai nặng nề, khéo léo biến lỗi sai hoặc phần chưa hoàn thành thành lời dặn dò nhẹ nhàng.`,
      `Mỗi nhận xét phải có độ dài 2–3 câu (khoảng 40–65 từ), viết tự nhiên bằng tiếng Việt chuẩn mực.`,
      `Lớp học: ${className || 'Lớp chuyên đề'}.`,
      `Nội dung buổi học: ${topic || 'Ôn tập kiến thức trọng tâm'}.`,
      `Danh sách học sinh cần nhận xét:`,
      JSON.stringify(
        students.map((s) => ({
          id: s.id,
          fullName: s.fullName,
          attendance: s.status,
          homework: s.homeworkStatus,
        }))
      ),
    ].join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
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
          required: ['items'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}') as {
      items?: Array<{ id?: string; comment?: string }>;
    };

    const comments = buildFallbackMap();
    if (Array.isArray(parsed.items)) {
      for (const item of parsed.items) {
        if (item.id && item.comment && item.comment.trim().length > 15) {
          comments[item.id] = item.comment.trim();
        }
      }
    }

    return NextResponse.json({ source: 'gemini', comments });
  } catch {
    return NextResponse.json({
      source: 'local',
      comments: buildFallbackMap(),
    });
  }
}
