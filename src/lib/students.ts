export type StudentStatus = 'Active' | 'Probation' | 'Graduated' | 'Leave';

export type SortField = 'studentCode' | 'fullName' | 'gpa' | 'attendanceRate';
export type SortDirection = 'asc' | 'desc';

export interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  cohort: string;
  major: string;
  gpa: number;
  attendanceRate: number;
  status: StudentStatus;
  notes: string;
  updatedAt: string;
}

export interface StudentFormInput {
  studentCode: string;
  fullName: string;
  email: string;
  cohort: string;
  major: string;
  gpa: string | number;
  attendanceRate: string | number;
  status: StudentStatus;
  notes: string;
}

export interface ValidationErrors {
  studentCode?: string;
  fullName?: string;
  email?: string;
  cohort?: string;
  major?: string;
  gpa?: string;
  attendanceRate?: string;
}

export interface StudentFilterOptions {
  query: string;
  status: 'All' | StudentStatus;
  cohort: string;
  sortField: SortField;
  sortDirection: SortDirection;
}

export interface RosterSummary {
  total: number;
  activeCount: number;
  probationCount: number;
  averageGpa: number;
  averageAttendance: number;
}

export interface ImportedRowResult {
  rowIndex: number;
  student: Student | null;
  error?: string;
}

export const STUDENT_STATUSES: StudentStatus[] = [
  'Active',
  'Probation',
  'Graduated',
  'Leave',
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu-1001',
    studentCode: 'SE202401',
    fullName: 'Nguyen Minh Anh',
    email: 'anh.nm202401@campus.edu',
    cohort: '2024',
    major: 'Computer Science',
    gpa: 3.84,
    attendanceRate: 96,
    status: 'Active',
    notes: 'Capstone lead for distributed systems lab.',
    updatedAt: '2026-10-18',
  },
  {
    id: 'stu-1002',
    studentCode: 'SE202402',
    fullName: 'Tran Quoc Bao',
    email: 'bao.tq202402@campus.edu',
    cohort: '2024',
    major: 'Data Engineering',
    gpa: 3.42,
    attendanceRate: 91,
    status: 'Active',
    notes: 'Completed SQL analytics internship.',
    updatedAt: '2026-10-17',
  },
  {
    id: 'stu-1003',
    studentCode: 'SE202403',
    fullName: 'Le Ha Phuong',
    email: 'phuong.lh202403@campus.edu',
    cohort: '2024',
    major: 'Computer Science',
    gpa: 2.18,
    attendanceRate: 72,
    status: 'Probation',
    notes: 'Midterm advisor check-in scheduled for Tuesday.',
    updatedAt: '2026-10-15',
  },
  {
    id: 'stu-1004',
    studentCode: 'DS202501',
    fullName: 'Pham Gia Huy',
    email: 'huy.pg202501@campus.edu',
    cohort: '2025',
    major: 'Applied Mathematics',
    gpa: 3.91,
    attendanceRate: 98,
    status: 'Active',
    notes: 'Honors seminar presenter.',
    updatedAt: '2026-10-19',
  },
  {
    id: 'stu-1005',
    studentCode: 'ID202308',
    fullName: 'Vu Khanh Linh',
    email: 'linh.vk202308@campus.edu',
    cohort: '2023',
    major: 'Industrial Design',
    gpa: 3.67,
    attendanceRate: 94,
    status: 'Graduated',
    notes: 'Senior exhibition portfolio archived.',
    updatedAt: '2026-09-30',
  },
  {
    id: 'stu-1006',
    studentCode: 'DS202504',
    fullName: 'Hoang Duc Thinh',
    email: 'thinh.hd202504@campus.edu',
    cohort: '2025',
    major: 'Data Engineering',
    gpa: 2.85,
    attendanceRate: 79,
    status: 'Leave',
    notes: 'Approved medical deferral for Fall term.',
    updatedAt: '2026-10-10',
  },
  {
    id: 'stu-1007',
    studentCode: 'SE202312',
    fullName: 'Doan Thu Trang',
    email: 'trang.dt202312@campus.edu',
    cohort: '2023',
    major: 'Computer Science',
    gpa: 3.55,
    attendanceRate: 89,
    status: 'Active',
    notes: 'Peer tutor for Algorithms I.',
    updatedAt: '2026-10-16',
  },
  {
    id: 'stu-1008',
    studentCode: 'AM202509',
    fullName: 'Bui Tuan Kiet',
    email: 'kiet.bt202509@campus.edu',
    cohort: '2025',
    major: 'Applied Mathematics',
    gpa: 1.94,
    attendanceRate: 68,
    status: 'Probation',
    notes: 'Requires lab attendance recovery plan.',
    updatedAt: '2026-10-14',
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStudentInput(
  input: StudentFormInput,
  existingStudents: Student[],
  editingId?: string
): { valid: boolean; errors: ValidationErrors; parsed?: Omit<Student, 'id' | 'updatedAt'> } {
  const errors: ValidationErrors = {};

  const studentCode = input.studentCode.trim().toUpperCase();
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const cohort = input.cohort.trim();
  const major = input.major.trim();
  const notes = input.notes.trim();

  if (!studentCode) {
    errors.studentCode = 'Student ID code is required.';
  } else if (studentCode.length < 3 || studentCode.length > 20) {
    errors.studentCode = 'Student ID code must be 3 to 20 characters.';
  } else {
    const duplicate = existingStudents.find(
      (s) => s.studentCode.toUpperCase() === studentCode && s.id !== editingId
    );
    if (duplicate) {
      errors.studentCode = `Student ID "${studentCode}" already exists.`;
    }
  }

  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }

  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!cohort) {
    errors.cohort = 'Cohort year is required.';
  }

  if (!major) {
    errors.major = 'Major is required.';
  }

  const gpaNum = typeof input.gpa === 'number' ? input.gpa : Number(String(input.gpa).trim());
  if (String(input.gpa).trim() === '' || Number.isNaN(gpaNum)) {
    errors.gpa = 'GPA must be a number between 0.00 and 4.00.';
  } else if (gpaNum < 0 || gpaNum > 4) {
    errors.gpa = 'GPA must be between 0.00 and 4.00.';
  }

  const attendanceNum =
    typeof input.attendanceRate === 'number'
      ? input.attendanceRate
      : Number(String(input.attendanceRate).trim());
  if (String(input.attendanceRate).trim() === '' || Number.isNaN(attendanceNum)) {
    errors.attendanceRate = 'Attendance must be between 0 and 100.';
  } else if (attendanceNum < 0 || attendanceNum > 100) {
    errors.attendanceRate = 'Attendance must be between 0% and 100%.';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    parsed: {
      studentCode,
      fullName,
      email,
      cohort,
      major,
      gpa: Math.round(gpaNum * 100) / 100,
      attendanceRate: Math.round(attendanceNum),
      status: STUDENT_STATUSES.includes(input.status) ? input.status : 'Active',
      notes,
    },
  };
}

export function filterAndSortStudents(
  students: Student[],
  options: StudentFilterOptions
): Student[] {
  const q = options.query.trim().toLowerCase();

  const filtered = students.filter((student) => {
    if (options.status !== 'All' && student.status !== options.status) {
      return false;
    }
    if (options.cohort !== 'All' && student.cohort !== options.cohort) {
      return false;
    }
    if (q) {
      const haystack = `${student.studentCode} ${student.fullName} ${student.email} ${student.major}`.toLowerCase();
      if (!haystack.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (options.sortField) {
      case 'studentCode':
        cmp = a.studentCode.localeCompare(b.studentCode);
        break;
      case 'fullName':
        cmp = a.fullName.localeCompare(b.fullName);
        break;
      case 'gpa':
        cmp = a.gpa - b.gpa;
        break;
      case 'attendanceRate':
        cmp = a.attendanceRate - b.attendanceRate;
        break;
    }
    return options.sortDirection === 'asc' ? cmp : -cmp;
  });

  return sorted;
}

export function computeRosterSummary(students: Student[]): RosterSummary {
  if (students.length === 0) {
    return {
      total: 0,
      activeCount: 0,
      probationCount: 0,
      averageGpa: 0,
      averageAttendance: 0,
    };
  }

  let activeCount = 0;
  let probationCount = 0;
  let gpaSum = 0;
  let attendanceSum = 0;

  for (const s of students) {
    if (s.status === 'Active') activeCount += 1;
    if (s.status === 'Probation') probationCount += 1;
    gpaSum += s.gpa;
    attendanceSum += s.attendanceRate;
  }

  return {
    total: students.length,
    activeCount,
    probationCount,
    averageGpa: Math.round((gpaSum / students.length) * 100) / 100,
    averageAttendance: Math.round((attendanceSum / students.length) * 10) / 10,
  };
}

export function getUniqueCohorts(students: Student[]): string[] {
  const set = new Set<string>();
  for (const s of students) {
    if (s.cohort.trim()) set.add(s.cohort.trim());
  }
  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

export function formatStudentQrPayload(student: Student): string {
  return JSON.stringify({
    type: 'student-checkin',
    code: student.studentCode,
    name: student.fullName,
    cohort: student.cohort,
    major: student.major,
    status: student.status,
  });
}

export interface SpreadsheetExportRow {
  'Student Code': string;
  'Full Name': string;
  Email: string;
  Cohort: string;
  Major: string;
  GPA: number;
  'Attendance (%)': number;
  Status: StudentStatus;
  Notes: string;
}

export function toSpreadsheetRows(students: Student[]): SpreadsheetExportRow[] {
  return students.map((s) => ({
    'Student Code': s.studentCode,
    'Full Name': s.fullName,
    Email: s.email,
    Cohort: s.cohort,
    Major: s.major,
    GPA: s.gpa,
    'Attendance (%)': s.attendanceRate,
    Status: s.status,
    Notes: s.notes,
  }));
}

function readCell(row: Record<string, unknown>, keys: string[]): string {
  const lowerMap = new Map<string, unknown>();
  for (const [k, v] of Object.entries(row)) {
    lowerMap.set(k.trim().toLowerCase(), v);
  }
  for (const key of keys) {
    const val = lowerMap.get(key.toLowerCase());
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim();
    }
  }
  return '';
}

function normalizeStatus(raw: string): StudentStatus {
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'probation') return 'Probation';
  if (normalized === 'graduated') return 'Graduated';
  if (normalized === 'leave' || normalized === 'on leave') return 'Leave';
  return 'Active';
}

export function parseImportedRows(
  rows: Record<string, unknown>[],
  existingStudents: Student[]
): ImportedRowResult[] {
  const seenInBatch: Student[] = [...existingStudents];
  const today = new Date().toISOString().slice(0, 10);

  return rows.map((row, idx) => {
    const studentCode = readCell(row, ['Student Code', 'Code', 'Student ID', 'ID', 'studentCode']);
    const fullName = readCell(row, ['Full Name', 'Name', 'Student Name', 'fullName']);
    const email = readCell(row, ['Email', 'E-mail', 'email']);
    const cohort = readCell(row, ['Cohort', 'Batch', 'Year', 'cohort']) || '2025';
    const major = readCell(row, ['Major', 'Program', 'Department', 'major']) || 'General Studies';
    const gpaRaw = readCell(row, ['GPA', 'Grade', 'gpa']) || '0';
    const attendanceRaw =
      readCell(row, ['Attendance (%)', 'Attendance', 'attendanceRate', 'Attendance Rate']) || '100';
    const statusRaw = readCell(row, ['Status', 'status']) || 'Active';
    const notes = readCell(row, ['Notes', 'Note', 'Remarks', 'notes']);

    const validation = validateStudentInput(
      {
        studentCode,
        fullName,
        email,
        cohort,
        major,
        gpa: gpaRaw,
        attendanceRate: attendanceRaw.replace('%', ''),
        status: normalizeStatus(statusRaw),
        notes,
      },
      seenInBatch
    );

    if (!validation.valid || !validation.parsed) {
      const firstError = Object.values(validation.errors)[0] || 'Invalid row data.';
      return {
        rowIndex: idx + 1,
        student: null,
        error: firstError,
      };
    }

    const created: Student = {
      id: `stu-imp-${Date.now()}-${idx}`,
      ...validation.parsed,
      updatedAt: today,
    };
    seenInBatch.push(created);

    return {
      rowIndex: idx + 1,
      student: created,
    };
  });
}

export function buildLocalCohortInsight(students: Student[]): string {
  const summary = computeRosterSummary(students);
  if (summary.total === 0) {
    return 'No student records are currently loaded. Add a student or import an Excel sheet to view cohort analytics.';
  }

  const probationStudents = students.filter((s) => s.status === 'Probation');
  const lowAttendance = students.filter((s) => s.attendanceRate < 80);
  const topGpa = [...students].sort((a, b) => b.gpa - a.gpa)[0];

  const lines = [
    `Roster covers ${summary.total} students (${summary.activeCount} Active) with a mean GPA of ${summary.averageGpa.toFixed(2)} and ${summary.averageAttendance.toFixed(1)}% attendance.`,
    topGpa
      ? `Top academic standing: ${topGpa.fullName} (${topGpa.studentCode}, ${topGpa.major}) at ${topGpa.gpa.toFixed(2)} GPA.`
      : '',
    probationStudents.length > 0
      ? `Advisor follow-up recommended for ${probationStudents.length} student(s) on Probation: ${probationStudents.map((s) => s.fullName).join(', ')}.`
      : 'No students are currently flagged on academic probation.',
    lowAttendance.length > 0
      ? `${lowAttendance.length} student(s) have attendance below 80% and may benefit from QR check-in reminders.`
      : 'All students meet the 80%+ attendance threshold.',
  ].filter(Boolean);

  return lines.join(' ');
}
