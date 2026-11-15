import { NextRequest, NextResponse } from 'next/server';
import {
  INITIAL_ACADEMY_STUDENTS,
  INITIAL_CLASSES,
  INITIAL_SESSIONS,
  INITIAL_SETTINGS,
  type AcademyStudent,
  type ClassRoom,
  type LessonSession,
  type WorkspaceSettings,
} from '@/lib/academy';

import {
  INITIAL_TRIAL_REPORTS,
  type ReportTemplate,
  type TrialReport,
} from '@/lib/trial-report';

export interface ServerWorkspaceState {
  classes: ClassRoom[];
  students: AcademyStudent[];
  sessions: LessonSession[];
  settings: WorkspaceSettings;
  trialReports: TrialReport[];
  customTemplates: ReportTemplate[];
  updatedAt: number;
}

const globalForWorkspace = globalThis as typeof globalThis & {
  __academyWorkspace?: ServerWorkspaceState;
};

function getOrInitWorkspace(): ServerWorkspaceState {
  if (!globalForWorkspace.__academyWorkspace) {
    globalForWorkspace.__academyWorkspace = {
      classes: INITIAL_CLASSES,
      students: INITIAL_ACADEMY_STUDENTS,
      sessions: INITIAL_SESSIONS,
      settings: INITIAL_SETTINGS,
      trialReports: INITIAL_TRIAL_REPORTS,
      customTemplates: [],
      updatedAt: 0,
    };
  }
  return globalForWorkspace.__academyWorkspace;
}

export async function GET() {
  return NextResponse.json(getOrInitWorkspace());
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<ServerWorkspaceState>;
    const current = getOrInitWorkspace();

    const nextState: ServerWorkspaceState = {
      classes: Array.isArray(body.classes) ? body.classes : current.classes,
      students: Array.isArray(body.students) ? body.students : current.students,
      sessions: Array.isArray(body.sessions) ? body.sessions : current.sessions,
      settings:
        body.settings && typeof body.settings === 'object'
          ? { ...current.settings, ...body.settings }
          : current.settings,
      trialReports: Array.isArray(body.trialReports)
        ? body.trialReports
        : current.trialReports,
      customTemplates: Array.isArray(body.customTemplates)
        ? body.customTemplates
        : current.customTemplates,
      updatedAt:
        typeof body.updatedAt === 'number' && body.updatedAt > current.updatedAt
          ? body.updatedAt
          : Date.now(),
    };

    globalForWorkspace.__academyWorkspace = nextState;
    return NextResponse.json(nextState);
  } catch {
    return NextResponse.json({ error: 'Dữ liệu đồng bộ không hợp lệ.' }, { status: 400 });
  }
}
