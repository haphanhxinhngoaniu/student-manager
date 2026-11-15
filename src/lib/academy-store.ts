'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  INITIAL_ACADEMY_STUDENTS,
  INITIAL_CLASSES,
  INITIAL_SESSIONS,
  INITIAL_SETTINGS,
  type AcademyStudent,
  type AssistantAccount,
  type ClassRoom,
  type LessonSession,
  type StaffRole,
  type WorkspaceSettings,
} from './academy';

import {
  INITIAL_TRIAL_REPORTS,
  type ReportTemplate,
  type TrialReport,
} from './trial-report';

export interface WorkspaceState {
  classes: ClassRoom[];
  students: AcademyStudent[];
  sessions: LessonSession[];
  settings: WorkspaceSettings;
  trialReports: TrialReport[];
  customTemplates: ReportTemplate[];
  updatedAt: number;
}

const STORAGE_KEY = 'student-manager:academy-workspace:v1';
const STORAGE_EVENT = 'academy-workspace-change';

const DEFAULT_WORKSPACE: WorkspaceState = {
  classes: INITIAL_CLASSES,
  students: INITIAL_ACADEMY_STUDENTS,
  sessions: INITIAL_SESSIONS,
  settings: INITIAL_SETTINGS,
  trialReports: INITIAL_TRIAL_REPORTS,
  customTemplates: [],
  updatedAt: 0,
};

let cachedRaw: string | null = null;
let cachedSnapshot: WorkspaceState = DEFAULT_WORKSPACE;
let hasHydratedFromServer = false;

function subscribeWorkspace(callback: () => void) {
  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener(STORAGE_EVENT, handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(STORAGE_EVENT, handler);
  };
}

export function getWorkspaceSnapshot(): WorkspaceState {
  if (typeof window === 'undefined') {
    return DEFAULT_WORKSPACE;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      cachedRaw = null;
      cachedSnapshot = DEFAULT_WORKSPACE;
      return cachedSnapshot;
    }
    if (raw !== cachedRaw) {
      const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
      if (parsed && Array.isArray(parsed.classes) && Array.isArray(parsed.students)) {
        cachedRaw = raw;
        cachedSnapshot = {
          classes: parsed.classes,
          students: parsed.students,
          sessions: Array.isArray(parsed.sessions) ? parsed.sessions : INITIAL_SESSIONS,
          settings: parsed.settings
            ? { ...INITIAL_SETTINGS, ...parsed.settings }
            : INITIAL_SETTINGS,
          trialReports: Array.isArray(parsed.trialReports)
            ? parsed.trialReports
            : INITIAL_TRIAL_REPORTS,
          customTemplates: Array.isArray(parsed.customTemplates)
            ? parsed.customTemplates
            : [],
          updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0,
        };
      }
    }
  } catch {
    return DEFAULT_WORKSPACE;
  }
  return cachedSnapshot;
}

function getServerWorkspaceSnapshot(): WorkspaceState {
  return DEFAULT_WORKSPACE;
}

function persistWorkspace(next: WorkspaceState, syncRemote = true) {
  try {
    const serialized = JSON.stringify(next);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    cachedRaw = serialized;
    cachedSnapshot = next;
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {
    // Ignore storage quota errors
  }

  if (syncRemote) {
    void fetch('/api/workspace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    }).catch(() => {
      // Offline / transient network errors are non-blocking
    });
  }
}

export function useAcademyWorkspace() {
  const state = useSyncExternalStore(
    subscribeWorkspace,
    getWorkspaceSnapshot,
    getServerWorkspaceSnapshot
  );

  useEffect(() => {
    if (hasHydratedFromServer) return;
    hasHydratedFromServer = true;

    let cancelled = false;
    void fetch('/api/workspace')
      .then((res) => (res.ok ? res.json() : null))
      .then((remote: Partial<WorkspaceState> | null) => {
        if (cancelled || !remote || typeof remote.updatedAt !== 'number') return;
        const local = getWorkspaceSnapshot();
        if (remote.updatedAt > local.updatedAt && Array.isArray(remote.classes)) {
          persistWorkspace(
            {
              classes: remote.classes,
              students: Array.isArray(remote.students)
                ? remote.students
                : local.students,
              sessions: Array.isArray(remote.sessions)
                ? remote.sessions
                : local.sessions,
              settings: remote.settings
                ? { ...INITIAL_SETTINGS, ...remote.settings }
                : local.settings,
              trialReports: Array.isArray(remote.trialReports)
                ? remote.trialReports
                : local.trialReports,
              customTemplates: Array.isArray(remote.customTemplates)
                ? remote.customTemplates
                : local.customTemplates,
              updatedAt: remote.updatedAt,
            },
            false
          );
        }
      })
      .catch(() => {
        // Ignore server hydrate failure
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateWorkspace = useCallback(
    (updater: (prev: WorkspaceState) => WorkspaceState) => {
      const current = getWorkspaceSnapshot();
      const updated = {
        ...updater(current),
        updatedAt: Date.now(),
      };
      persistWorkspace(updated, true);
    },
    []
  );

  const upsertSession = useCallback(
    (session: LessonSession) => {
      updateWorkspace((prev) => {
        const idx = prev.sessions.findIndex(
          (s) =>
            s.id === session.id ||
            (s.classId === session.classId && s.date === session.date)
        );
        const nextSessions = [...prev.sessions];
        if (idx >= 0) {
          nextSessions[idx] = { ...session, id: prev.sessions[idx].id };
        } else {
          nextSessions.unshift(session);
        }
        return { ...prev, sessions: nextSessions };
      });
    },
    [updateWorkspace]
  );

  const saveClass = useCallback(
    (cls: ClassRoom) => {
      updateWorkspace((prev) => {
        const exists = prev.classes.some((c) => c.id === cls.id);
        const nextClasses = exists
          ? prev.classes.map((c) => (c.id === cls.id ? cls : c))
          : [cls, ...prev.classes];
        return { ...prev, classes: nextClasses };
      });
    },
    [updateWorkspace]
  );

  const deleteClass = useCallback(
    (classId: string) => {
      updateWorkspace((prev) => ({
        ...prev,
        classes: prev.classes.filter((c) => c.id !== classId),
      }));
    },
    [updateWorkspace]
  );

  const saveAcademyStudent = useCallback(
    (student: AcademyStudent) => {
      updateWorkspace((prev) => {
        const exists = prev.students.some((s) => s.id === student.id);
        const nextStudents = exists
          ? prev.students.map((s) => (s.id === student.id ? student : s))
          : [student, ...prev.students];
        return { ...prev, students: nextStudents };
      });
    },
    [updateWorkspace]
  );

  const deleteAcademyStudent = useCallback(
    (studentId: string) => {
      updateWorkspace((prev) => ({
        ...prev,
        students: prev.students.filter((s) => s.id !== studentId),
      }));
    },
    [updateWorkspace]
  );

  const updateSettings = useCallback(
    (patch: Partial<WorkspaceSettings>) => {
      updateWorkspace((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...patch },
      }));
    },
    [updateWorkspace]
  );

  const switchRole = useCallback(
    (role: StaffRole, userName?: string) => {
      updateWorkspace((prev) => {
        const defaultName =
          role === 'teacher'
            ? prev.settings.teacherName
            : prev.settings.assistants.find((a) => a.active)?.name || 'Trợ giảng';
        return {
          ...prev,
          settings: {
            ...prev.settings,
            currentRole: role,
            currentUserName: userName ?? defaultName,
          },
        };
      });
    },
    [updateWorkspace]
  );

  const addAssistant = useCallback(
    (assistant: AssistantAccount) => {
      updateWorkspace((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          assistants: [assistant, ...prev.settings.assistants],
        },
      }));
    },
    [updateWorkspace]
  );

  const toggleAssistantActive = useCallback(
    (assistantId: string) => {
      updateWorkspace((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          assistants: prev.settings.assistants.map((a) =>
            a.id === assistantId ? { ...a, active: !a.active } : a
          ),
        },
      }));
    },
    [updateWorkspace]
  );

  const saveTrialReport = useCallback(
    (report: TrialReport) => {
      updateWorkspace((prev) => {
        const exists = prev.trialReports.some((r) => r.id === report.id);
        const nextReports = exists
          ? prev.trialReports.map((r) => (r.id === report.id ? report : r))
          : [report, ...prev.trialReports];
        return { ...prev, trialReports: nextReports };
      });
    },
    [updateWorkspace]
  );

  const deleteTrialReport = useCallback(
    (reportId: string) => {
      updateWorkspace((prev) => ({
        ...prev,
        trialReports: prev.trialReports.filter((r) => r.id !== reportId),
      }));
    },
    [updateWorkspace]
  );

  const addCustomTemplate = useCallback(
    (tpl: ReportTemplate) => {
      updateWorkspace((prev) => ({
        ...prev,
        customTemplates: [tpl, ...prev.customTemplates],
      }));
    },
    [updateWorkspace]
  );

  const deleteCustomTemplate = useCallback(
    (templateId: string) => {
      updateWorkspace((prev) => ({
        ...prev,
        customTemplates: prev.customTemplates.filter((t) => t.id !== templateId),
      }));
    },
    [updateWorkspace]
  );

  const enrollTrialStudent = useCallback(
    (reportId: string, targetClassId: string) => {
      updateWorkspace((prev) => {
        const target = prev.trialReports.find((r) => r.id === reportId);
        if (!target) return prev;
        const alreadyExists = prev.students.some(
          (s) =>
            s.classId === targetClassId &&
            s.fullName.trim().toLowerCase() === target.studentName.trim().toLowerCase()
        );
        const codeNum = String(prev.students.length + 1).padStart(2, '0');
        const nextStudents = alreadyExists
          ? prev.students
          : [
              {
                id: `ast-trial-${Date.now()}`,
                studentCode: `HS${codeNum}`,
                fullName: target.studentName,
                classId: targetClassId,
                parentName: `Phụ huynh con ${target.studentName}`,
                parentPhone: target.parentPhone || 'Đang cập nhật',
                parentZalo: target.parentPhone || 'Đang cập nhật',
                status: 'Active' as const,
              },
              ...prev.students,
            ];
        return {
          ...prev,
          students: nextStudents,
          trialReports: prev.trialReports.map((r) =>
            r.id === reportId
              ? { ...r, leadStatus: 'enrolled' as const, updatedAt: Date.now() }
              : r
          ),
        };
      });
    },
    [updateWorkspace]
  );

  return {
    ...state,
    updateWorkspace,
    upsertSession,
    saveClass,
    deleteClass,
    saveAcademyStudent,
    deleteAcademyStudent,
    updateSettings,
    switchRole,
    addAssistant,
    toggleAssistantActive,
    saveTrialReport,
    deleteTrialReport,
    addCustomTemplate,
    deleteCustomTemplate,
    enrollTrialStudent,
  };
}
