import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COGNITIVE_LEVEL_META,
  QUESTION_BANK,
  allocatePointsForQuestions,
  decodeAssignmentToken,
  encodeAssignmentToken,
  gradeAssignment,
  selectQuestionsForLesson,
  type Assignment,
  type BankQuestion,
} from './assignments';

test('selectQuestionsForLesson returns 5 or 6 items ordered NB -> TH -> VDT -> VDC and matches lesson topic', () => {
  const sqlItems = selectQuestionsForLesson(QUESTION_BANK, {
    lessonContent: 'Hôm nay học câu lệnh SQL SELECT, WHERE, HAVING, GROUP BY và LEFT JOIN',
    questionCount: 6,
  });

  assert.equal(sqlItems.length, 6);
  // Check strict ordering NB -> TH -> VDT -> VDC
  for (let i = 1; i < sqlItems.length; i += 1) {
    const prevOrder = COGNITIVE_LEVEL_META[sqlItems[i - 1].question.level].order;
    const currOrder = COGNITIVE_LEVEL_META[sqlItems[i].question.level].order;
    assert.ok(prevOrder <= currOrder, 'Questions must follow NB -> TH -> VDT -> VDC order');
  }
  assert.ok(sqlItems.every((item) => item.question.subject === 'Cơ sở dữ liệu SQL'));

  const fiveItems = selectQuestionsForLesson(QUESTION_BANK, {
    lessonContent: 'Tìm kiếm nhị phân trên mảng đã sắp xếp và Big-O',
    questionCount: 5,
  });
  assert.equal(fiveItems.length, 5);
  assert.ok(fiveItems.every((item) => item.question.subject === 'Lập trình & CTDL'));
});

test('allocatePointsForQuestions divides 10 points cleanly with 20/30/40/10 level ratio', () => {
  for (const count of [5, 6] as const) {
    const items = selectQuestionsForLesson(QUESTION_BANK, {
      lessonContent: 'Đạo hàm và tìm cực trị hàm số bậc ba trên đoạn',
      questionCount: count,
    });
    const total = items.reduce((acc, item) => acc + item.points, 0);
    assert.equal(Math.round(total * 100) / 100, 10);

    const byLevel = new Map<string, number>();
    for (const item of items) {
      byLevel.set(item.question.level, (byLevel.get(item.question.level) ?? 0) + item.points);
    }
    assert.equal(byLevel.get('nhan_biet'), 2);
    assert.equal(byLevel.get('thong_hieu'), 3);
    assert.equal(byLevel.get('van_dung_thap'), 4);
    assert.equal(byLevel.get('van_dung_cao'), 1);
  }
});

test('gradeAssignment auto-grades answers accurately and provides solution for every item', () => {
  const items = allocatePointsForQuestions(QUESTION_BANK.slice(0, 5));
  const assignment: Assignment = {
    id: 'asg-test-1',
    title: 'Kiểm tra Tìm kiếm nhị phân',
    subject: 'Lập trình & CTDL',
    lessonContent: 'Tìm kiếm nhị phân',
    questionCount: 5,
    items,
    totalPoints: 10,
    createdAt: '2026-11-15',
  };

  // All correct -> 10.0
  const allCorrectAnswers: Record<string, number> = {};
  for (const item of items) {
    allCorrectAnswers[item.question.id] = item.question.correctIndex;
  }
  const perfect = gradeAssignment(assignment, allCorrectAnswers, {
    studentName: 'Nguyen Minh Anh',
    studentCode: 'SE202401',
  });
  assert.equal(perfect.totalScore, 10);
  assert.equal(perfect.correctCount, 5);
  assert.ok(perfect.itemResults.every((r) => r.isCorrect && r.solution.length > 10));

  // Partial: wrong on first item
  const partialAnswers = { ...allCorrectAnswers };
  partialAnswers[items[0].question.id] = (items[0].question.correctIndex + 1) % 4;
  const partial = gradeAssignment(assignment, partialAnswers, {
    studentName: 'Tran Quoc Bao',
  });
  assert.equal(partial.totalScore, 10 - items[0].points);
  assert.equal(partial.correctCount, 4);
  assert.equal(partial.itemResults[0].isCorrect, false);
  assert.ok(partial.itemResults[0].solution.length > 10);
});

test('encodeAssignmentToken and decodeAssignmentToken roundtrip Unicode and custom questions', () => {
  const customQuestion: BankQuestion = {
    id: 'custom-q-1',
    subject: 'Lập trình & CTDL',
    topic: 'Đệ quy',
    keywords: ['đệ quy'],
    level: 'van_dung_cao',
    prompt: 'Điều kiện dừng của hàm đệ quy tính giai thừa là gì?',
    options: ['n <= 1', 'n > 10', 'n < 0', 'Không cần điều kiện dừng'],
    correctIndex: 0,
    solution: 'Với giai thừa, 0! = 1 và 1! = 1 nên điều kiện cơ sở dừng là n <= 1.',
    isCustom: true,
  };

  const baseItems = selectQuestionsForLesson(QUESTION_BANK, {
    lessonContent: 'Tìm kiếm nhị phân',
    questionCount: 5,
  });
  const replaced = [...baseItems.slice(0, 4), { question: customQuestion, points: 1 }];

  const assignment: Assignment = {
    id: 'asg-unicode',
    title: 'Bài tập Tiếng Việt có dấu & Đệ quy',
    subject: 'Lập trình & CTDL',
    lessonContent: 'Ôn tập tìm kiếm nhị phân và đệ quy',
    questionCount: 5,
    items: replaced,
    totalPoints: 10,
    createdAt: '2026-11-15',
  };

  const token = encodeAssignmentToken(assignment);
  const decoded = decodeAssignmentToken(token);
  assert.ok(decoded);
  assert.equal(decoded?.title, assignment.title);
  assert.equal(decoded?.items.length, 5);
  assert.equal(decoded?.items[4].question.prompt, customQuestion.prompt);
});
