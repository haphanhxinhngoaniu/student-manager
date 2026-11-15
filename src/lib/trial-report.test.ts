import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  BUILT_IN_TEMPLATES,
  INITIAL_TRIAL_REPORTS,
  PERFORMANCE_CRITERIA_LABELS,
  buildTrialReportPdfFilename,
  computeA4Pagination,
  formatTrialReportPlainText,
  generateTrialReportFallback,
} from './trial-report';
import { CHAT_ROLES, buildChatFallbackReply } from './chat-roles';

test('generateTrialReportFallback builds all 3 sections and 7 criteria matching trial form', () => {
  const generated = generateTrialReportFallback({
    classType: 'Lớp 1 kèm 1',
    subjectAndGrade: 'Toán (Lớp 5)',
    studentName: 'Phương Linh',
    studentSchool: 'Tiểu học Võ Thị Sáu',
    teacherName: 'Phương Anh',
    studyDate: '14/11/2026',
    duration: '~60 phút',
    topic: 'Nhân nhẩm số thập phân với 10, 100, 1000 và 0,1; 0,01',
    teacherQuickNotes:
      'Tiếp thu nhanh, tự đoán đúng quy tắc nhân 0,1; còn nhầm dịch dấu phẩy và hơi rụt rè, tắt mic.',
    targetGoal: 'Thi vào lớp 6 chất lượng cao',
  });

  assert.equal(generated.performanceRows.length, 7);
  PERFORMANCE_CRITERIA_LABELS.forEach((label, idx) => {
    assert.equal(generated.performanceRows[idx].criterion, label);
    assert.ok(generated.performanceRows[idx].assessment.length > 12);
  });
  assert.ok(generated.progressSummary.includes('Nhân nhẩm số thập phân'));
  assert.ok(generated.highlights.includes('Phương Linh'));
  assert.ok(generated.improvements.includes('bật mic'));
  assert.ok(generated.roadmapBullets.length >= 3);
  assert.ok(generated.homePracticeBullets.length >= 2);
  assert.ok(generated.closingEncouragement.includes('Phương Linh'));
});

test('formatTrialReportPlainText formats complete report structure cleanly', () => {
  const text = formatTrialReportPlainText(INITIAL_TRIAL_REPORTS[0]);
  assert.ok(text.includes('BÁO CÁO BUỔI HỌC THỬ'));
  assert.ok(text.includes('I. TIẾN ĐỘ BUỔI HỌC'));
  assert.ok(text.includes('II. HIỆU SUẤT BUỔI HỌC THỬ'));
  assert.ok(text.includes('III. NHẬN XÉT CHI TIẾT'));
  assert.ok(text.includes('1. Đánh giá cụ thể'));
  assert.ok(text.includes('2. Đánh giá năng lực & Định hướng lộ trình'));
  assert.ok(text.includes('3. Kế hoạch buổi tới & Dặn dò tự học'));
  assert.ok(text.includes('Phương Linh'));
});

test('all reference template asset files exist in public directory', () => {
  const refTemplates = BUILT_IN_TEMPLATES.filter((t) => t.category === 'reference');
  assert.equal(refTemplates.length, 22);
  for (const tpl of refTemplates) {
    assert.ok(tpl.backgroundImage, `Missing backgroundImage on ${tpl.id}`);
    const diskPath = path.join(process.cwd(), 'public', tpl.backgroundImage);
    assert.ok(
      fs.existsSync(diskPath),
      `Expected template asset to exist at ${diskPath}`
    );
  }
});

test('buildTrialReportPdfFilename and computeA4Pagination produce clean A4 output metrics', () => {
  assert.equal(
    buildTrialReportPdfFilename('Phương Linh', '14/11/2026'),
    'Bao-cao-hoc-thu-Phuong-Linh-14-11-2026.pdf'
  );
  const singlePage = computeA4Pagination(1588, 2246);
  assert.equal(singlePage.pageCount, 1);
  assert.equal(singlePage.a4WidthMm, 210);
  const multiPage = computeA4Pagination(1588, 3000);
  assert.equal(multiPage.pageCount, 2);
});

test('CHAT_ROLES and buildChatFallbackReply maintain multi-turn role behavior', () => {
  assert.equal(CHAT_ROLES.length, 3);
  const reply = buildChatFallbackReply(
    'Nhận xét bé Phương Linh',
    'parent_advisor',
    [{ role: 'user', text: 'Chào trợ lý' }],
    'HS: Phương Linh'
  );
  assert.ok(reply.includes('Phương Linh'));
  assert.ok(reply.includes('PDF'));
});
