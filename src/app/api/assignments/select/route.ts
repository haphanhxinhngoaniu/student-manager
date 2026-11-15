import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  QUESTION_BANK,
  selectQuestionsForLesson,
  type BankQuestion,
} from '@/lib/assignments';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      lessonContent?: string;
      subject?: string;
      questionCount?: 5 | 6;
      customBank?: BankQuestion[];
    };

    const lessonContent = (body?.lessonContent ?? '').trim();
    const subject = body?.subject ?? 'All';
    const questionCount: 5 | 6 = body?.questionCount === 5 ? 5 : 6;
    const fullBank = [
      ...QUESTION_BANK,
      ...(Array.isArray(body?.customBank) ? body.customBank : []),
    ];

    if (!lessonContent) {
      return NextResponse.json(
        { error: 'Vui lòng nhập nội dung đã học trong buổi.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const items = selectQuestionsForLesson(fullBank, {
        lessonContent,
        subject,
        questionCount,
      });
      return NextResponse.json({ source: 'local', items });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const catalog = fullBank.map((q) => ({
        id: q.id,
        subject: q.subject,
        topic: q.topic,
        level: q.level,
        prompt: q.prompt,
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: [
          `Select up to ${questionCount} question IDs from the catalog that best match this lesson content and subject filter (${subject}).`,
          `Requirements: follow cognitive levels nhan_biet (20%), thong_hieu (30%), van_dung_thap (40%), van_dung_cao (10%).`,
          `Return ONLY a JSON array of question ID strings, e.g. ["id1","id2"].`,
          `Lesson content: ${lessonContent}`,
          `Catalog: ${JSON.stringify(catalog)}`,
        ].join('\n\n'),
      });

      const raw = response.text?.trim() ?? '';
      const match = raw.match(/\[[\s\S]*\]/);
      const preferredIds = match ? (JSON.parse(match[0]) as string[]) : [];

      const items = selectQuestionsForLesson(fullBank, {
        lessonContent,
        subject,
        questionCount,
        preferredIds,
      });
      return NextResponse.json({ source: 'gemini', items });
    } catch {
      const items = selectQuestionsForLesson(fullBank, {
        lessonContent,
        subject,
        questionCount,
      });
      return NextResponse.json({ source: 'local', items });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request.' }, { status: 400 });
  }
}
