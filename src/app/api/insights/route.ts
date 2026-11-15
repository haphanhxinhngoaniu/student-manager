import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { buildLocalCohortInsight, type Student } from '@/lib/students';

export async function POST(req: NextRequest) {
  let students: Student[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body?.students)) {
      students = body.students as Student[];
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      source: 'local',
      summary: buildLocalCohortInsight(students),
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const compactRoster = students.slice(0, 60).map((s) => ({
      code: s.studentCode,
      major: s.major,
      cohort: s.cohort,
      gpa: s.gpa,
      attendance: s.attendanceRate,
      status: s.status,
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: [
        'Provide a concise 3-sentence academic advisor summary of this student roster. Highlight GPA distribution, attendance alerts (<80%), and probation follow-ups in plain professional prose without markdown bullets or headings.',
        JSON.stringify(compactRoster),
      ].join('\n\n'),
    });

    const text = response.text?.trim();
    return NextResponse.json({
      source: 'gemini',
      summary: text || buildLocalCohortInsight(students),
    });
  } catch {
    return NextResponse.json({
      source: 'local',
      summary: buildLocalCohortInsight(students),
    });
  }
}
