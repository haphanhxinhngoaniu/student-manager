import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_STUDENTS,
  buildLocalCohortInsight,
  computeRosterSummary,
  filterAndSortStudents,
  formatStudentQrPayload,
  getUniqueCohorts,
  parseImportedRows,
  toSpreadsheetRows,
  validateStudentInput,
} from './students';

test('computeRosterSummary calculates counts and averages accurately', () => {
  const summary = computeRosterSummary(INITIAL_STUDENTS);
  assert.equal(summary.total, 8);
  assert.equal(summary.activeCount, 4);
  assert.equal(summary.probationCount, 2);
  assert.ok(summary.averageGpa > 3.1 && summary.averageGpa < 3.3);
  assert.ok(summary.averageAttendance > 85 && summary.averageAttendance < 87);
});

test('computeRosterSummary handles empty roster', () => {
  const summary = computeRosterSummary([]);
  assert.deepEqual(summary, {
    total: 0,
    activeCount: 0,
    probationCount: 0,
    averageGpa: 0,
    averageAttendance: 0,
  });
});

test('filterAndSortStudents filters by query, status, and cohort and sorts descending by GPA', () => {
  const filtered = filterAndSortStudents(INITIAL_STUDENTS, {
    query: 'computer science',
    status: 'Active',
    cohort: 'All',
    sortField: 'gpa',
    sortDirection: 'desc',
  });
  assert.equal(filtered.length, 2);
  assert.equal(filtered[0].studentCode, 'SE202401');
  assert.equal(filtered[1].studentCode, 'SE202312');
});

test('validateStudentInput rejects empty fields, bad ranges, and duplicate codes', () => {
  const emptyResult = validateStudentInput(
    {
      studentCode: '',
      fullName: '',
      email: 'invalid-email',
      cohort: '',
      major: '',
      gpa: 4.5,
      attendanceRate: 120,
      status: 'Active',
      notes: '',
    },
    INITIAL_STUDENTS
  );
  assert.equal(emptyResult.valid, false);
  assert.ok(emptyResult.errors.studentCode);
  assert.ok(emptyResult.errors.fullName);
  assert.ok(emptyResult.errors.email);
  assert.ok(emptyResult.errors.gpa);
  assert.ok(emptyResult.errors.attendanceRate);

  const dupResult = validateStudentInput(
    {
      studentCode: 'se202401',
      fullName: 'Duplicate User',
      email: 'dup@campus.edu',
      cohort: '2026',
      major: 'Computer Science',
      gpa: 3.5,
      attendanceRate: 90,
      status: 'Active',
      notes: '',
    },
    INITIAL_STUDENTS
  );
  assert.equal(dupResult.valid, false);
  assert.match(dupResult.errors.studentCode ?? '', /already exists/);
});

test('validateStudentInput allows editing existing student without self-duplicate conflict', () => {
  const editResult = validateStudentInput(
    {
      studentCode: 'SE202401',
      fullName: 'Nguyen Minh Anh',
      email: 'anh.nm202401@campus.edu',
      cohort: '2024',
      major: 'Computer Science',
      gpa: 3.9,
      attendanceRate: 97,
      status: 'Active',
      notes: 'Updated note',
    },
    INITIAL_STUDENTS,
    'stu-1001'
  );
  assert.equal(editResult.valid, true);
  assert.equal(editResult.parsed?.gpa, 3.9);
});

test('toSpreadsheetRows and parseImportedRows roundtrip valid records and flag invalid rows', () => {
  const exported = toSpreadsheetRows([INITIAL_STUDENTS[0]]);
  assert.equal(exported[0]['Student Code'], 'SE202401');

  const parsed = parseImportedRows(
    [
      {
        'Student Code': 'CS202601',
        'Full Name': 'Vo Minh Tri',
        Email: 'tri.vm202601@campus.edu',
        Cohort: '2026',
        Major: 'Computer Science',
        GPA: 3.65,
        'Attendance (%)': 95,
        Status: 'Active',
        Notes: 'Imported student',
      },
      {
        'Student Code': 'SE202401',
        'Full Name': 'Already Exists',
        Email: 'exists@campus.edu',
        Cohort: '2024',
        Major: 'Computer Science',
        GPA: 3.0,
        'Attendance (%)': 90,
        Status: 'Active',
      },
    ],
    INITIAL_STUDENTS
  );

  assert.equal(parsed.length, 2);
  assert.ok(parsed[0].student);
  assert.equal(parsed[0].student?.studentCode, 'CS202601');
  assert.equal(parsed[1].student, null);
  assert.match(parsed[1].error ?? '', /already exists/);
});

test('formatStudentQrPayload and getUniqueCohorts produce expected values', () => {
  const payload = JSON.parse(formatStudentQrPayload(INITIAL_STUDENTS[0]));
  assert.equal(payload.type, 'student-checkin');
  assert.equal(payload.code, 'SE202401');
  assert.deepEqual(getUniqueCohorts(INITIAL_STUDENTS), ['2025', '2024', '2023']);
  assert.match(buildLocalCohortInsight(INITIAL_STUDENTS), /8 students/);
});
