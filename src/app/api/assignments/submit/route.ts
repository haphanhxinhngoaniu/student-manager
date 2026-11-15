import { NextRequest, NextResponse } from 'next/server';
import type { SubmissionResult } from '@/lib/assignments';

const globalForSubmissions = globalThis as unknown as {
  __assignmentSubmissions?: Map<string, SubmissionResult[]>;
};

function getStore(): Map<string, SubmissionResult[]> {
  if (!globalForSubmissions.__assignmentSubmissions) {
    globalForSubmissions.__assignmentSubmissions = new Map();
  }
  return globalForSubmissions.__assignmentSubmissions;
}

export async function GET(req: NextRequest) {
  const assignmentId = req.nextUrl.searchParams.get('assignmentId');
  const store = getStore();

  if (assignmentId) {
    return NextResponse.json({
      submissions: store.get(assignmentId) ?? [],
    });
  }

  const all: SubmissionResult[] = [];
  for (const list of store.values()) {
    all.push(...list);
  }
  all.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  return NextResponse.json({ submissions: all });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { submission?: SubmissionResult };
    const sub = body?.submission;
    if (!sub || !sub.assignmentId || !sub.studentName) {
      return NextResponse.json(
        { error: 'Invalid submission payload.' },
        { status: 400 }
      );
    }

    const store = getStore();
    const current = store.get(sub.assignmentId) ?? [];
    const next = [sub, ...current].slice(0, 200);
    store.set(sub.assignmentId, next);

    return NextResponse.json({ saved: true, submission: sub });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
}
