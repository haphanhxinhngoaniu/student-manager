import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_ACADEMY_STUDENTS,
  INITIAL_CLASSES,
  INITIAL_SESSIONS,
  INITIAL_SETTINGS,
  buildMonthlyMatrixExcelRows,
  buildWarmPedagogicalComment,
  computeMonthlyAnalytics,
  computeStudentTuition,
  formatTuitionZaloMessage,
  formatZaloClassSummary,
  parseTranscriptFallback,
} from './academy';
import { buildVietQrPayload, crc16Ccitt } from './vietqr';

test('buildVietQrPayload generates valid EMVCo Napas 24/7 QR string with valid CRC16 checksum', () => {
  const payload = buildVietQrPayload({
    bankBin: '970422',
    accountNumber: '0368999888',
    amount: 720000,
    purpose: 'HS9A01 T11 HOC PHI',
  });

  assert.ok(payload.startsWith('000201'));
  assert.ok(payload.includes('970422'));
  assert.ok(payload.includes('0368999888'));
  assert.ok(payload.includes('5406720000'));
  assert.ok(payload.includes('HS9A01 T11 HOC PHI'));

  // Verify trailing 4-char CRC16 matches payload body up to '6304'
  const bodyWithoutCrc = payload.slice(0, -4);
  const crc = payload.slice(-4);
  assert.equal(crc16Ccitt(bodyWithoutCrc), crc);
});

test('computeStudentTuition calculates actual attended dates and total fee accurately', () => {
  const cls = INITIAL_CLASSES[0]; // Toán 9A, 180,000đ/buổi
  const minhAnh = INITIAL_ACADEMY_STUDENTS[0]; // attended all 4 sessions in 2026-11
  const bill1 = computeStudentTuition(minhAnh, cls, INITIAL_SESSIONS, '2026-11');
  assert.equal(bill1.sessionCount, 4);
  assert.deepEqual(bill1.attendedDates, ['03/11', '06/11', '10/11', '14/11']);
  assert.equal(bill1.totalAmount, 720000);

  const haPhuong = INITIAL_ACADEMY_STUDENTS[2]; // late on 03/11, present 06/11, absent 10/11, present 14/11 -> 3 attended
  const bill3 = computeStudentTuition(haPhuong, cls, INITIAL_SESSIONS, '2026-11');
  assert.equal(bill3.sessionCount, 3);
  assert.deepEqual(bill3.attendedDates, ['03/11', '06/11', '14/11']);
  assert.equal(bill3.totalAmount, 540000);

  const zaloMsg = formatTuitionZaloMessage(bill3, INITIAL_SETTINGS);
  assert.match(zaloMsg, /Ngày 03\/11, Ngày 06\/11, Ngày 14\/11/);
  assert.match(zaloMsg, /540\.000 đ/);
  assert.match(zaloMsg, /0368999888/);
});

test('computeMonthlyAnalytics and buildMonthlyMatrixExcelRows produce V/M/P/K symbols and ratings', () => {
  const cls = INITIAL_CLASSES[0];
  const analytics = computeMonthlyAnalytics(
    cls,
    INITIAL_SESSIONS,
    INITIAL_ACADEMY_STUDENTS,
    '2026-11'
  );
  assert.equal(analytics.monthSessions.length, 4);
  assert.equal(analytics.sessionBars.length, 4);

  const matrix = buildMonthlyMatrixExcelRows(
    cls,
    INITIAL_SESSIONS,
    INITIAL_ACADEMY_STUDENTS,
    '2026-11'
  );
  assert.equal(matrix.length, 4);
  // Ha Phuong: 03/11 = M, 06/11 = V, 10/11 = K, 14/11 = V
  const hpRow = matrix.find((r) => r['Mã HS'] === 'HS9A03');
  assert.ok(hpRow);
  assert.equal(hpRow?.['03/11'], 'M');
  assert.equal(hpRow?.['06/11'], 'V');
  assert.equal(hpRow?.['10/11'], 'K');
  assert.equal(hpRow?.['14/11'], 'V');
});

test('buildWarmPedagogicalComment produces 40-65 word warm Co-Con messages and Zalo summary formats cleanly', () => {
  const comment = buildWarmPedagogicalComment(
    'Trần Quốc Bảo',
    'present',
    'partial',
    'Phương trình bậc hai'
  );
  const wordCount = comment.trim().split(/\s+/).length;
  assert.ok(wordCount >= 35 && wordCount <= 75, `Expected 40-65 words, got ${wordCount}`);
  assert.match(comment, /Cô|con/i);

  const classZalo = formatZaloClassSummary(
    INITIAL_CLASSES[0],
    INITIAL_SESSIONS[0],
    INITIAL_ACADEMY_STUDENTS
  );
  assert.match(classZalo, /TOÁN TƯ DUY 9A/);
  assert.match(classZalo, /Có mặt 2/);
});

test('parseTranscriptFallback extracts key topics, homework, and per-student comments', () => {
  const classStudents = INITIAL_ACADEMY_STUDENTS.filter((s) => s.classId === 'cls-math-9a');
  const analysis = parseTranscriptFallback(
    'Nội dung trọng tâm: Ôn tập định lý Vi-ét và giải hệ thức đối xứng.\n- Minh Anh làm bài rất nhanh.\nBài tập về nhà: Làm câu 1 đến câu 4 phiếu số 5.',
    classStudents,
    'Vi-ét'
  );
  assert.ok(analysis.keyTopics.length >= 1);
  assert.match(analysis.homework, /câu 1 đến câu 4/);
  assert.equal(Object.keys(analysis.studentComments).length, classStudents.length);
  assert.match(analysis.studentComments['ast-1'], /Minh Anh/);
});
