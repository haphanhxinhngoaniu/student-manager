export type AttendanceStatus = 'present' | 'late' | 'excused' | 'absent';
export type HomeworkStatus = 'done' | 'partial' | 'missing';
export type StaffRole = 'teacher' | 'assistant';

export interface ClassRoom {
  id: string;
  name: string;
  subject: string;
  gradeLevel: string;
  schedule: string;
  sessionFee: number;
  teacherName: string;
  assistantName: string;
}

export interface AcademyStudent {
  id: string;
  studentCode: string;
  fullName: string;
  classId: string;
  parentName: string;
  parentPhone: string;
  parentZalo: string;
  status: 'Active' | 'Paused';
}

export interface AttendanceEntry {
  status: AttendanceStatus;
  homeworkStatus: HomeworkStatus;
  note: string;
}

export interface LessonSession {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  topic: string;
  homework: string;
  recordedBy: string;
  recordedByRole: StaffRole;
  entries: Record<string, AttendanceEntry>;
}

export interface AssistantAccount {
  id: string;
  name: string;
  email: string;
  assignedClassIds: string[];
  active: boolean;
}

export interface WorkspaceSettings {
  schoolName: string;
  teacherName: string;
  currentRole: StaffRole;
  currentUserName: string;
  bankBin: string;
  bankShortName: string;
  accountNumber: string;
  accountHolder: string;
  transferTemplate: string;
  assistantInviteCode: string;
  assistants: AssistantAccount[];
}

export const ATTENDANCE_META: Record<
  AttendanceStatus,
  { label: string; symbol: 'V' | 'M' | 'P' | 'K'; colorClass: string }
> = {
  present: {
    label: 'Có mặt',
    symbol: 'V',
    colorClass: 'text-emerald-700 font-medium',
  },
  late: {
    label: 'Đến muộn',
    symbol: 'M',
    colorClass: 'text-amber-700 font-medium',
  },
  excused: {
    label: 'Vắng có phép',
    symbol: 'P',
    colorClass: 'text-slate-600 font-medium',
  },
  absent: {
    label: 'Vắng không phép',
    symbol: 'K',
    colorClass: 'text-rose-700 font-medium',
  },
};

export const HOMEWORK_META: Record<HomeworkStatus, { label: string }> = {
  done: { label: 'Đủ BTVN' },
  partial: { label: 'Thiếu BTVN' },
  missing: { label: 'Chưa làm' },
};

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    id: 'cls-math-9a',
    name: 'Toán Tư Duy 9A',
    subject: 'Toán học',
    gradeLevel: 'Lớp 9',
    schedule: 'Thứ 3 & Thứ 6 · 18:00 - 19:30',
    sessionFee: 180000,
    teacherName: 'Cô Hà Phương Anh',
    assistantName: 'Thầy Minh Đức',
  },
  {
    id: 'cls-cs-10b',
    name: 'Lập Trình Python & Thuật Toán',
    subject: 'Tin học',
    gradeLevel: 'Lớp 10',
    schedule: 'Thứ 4 & Chủ nhật · 19:00 - 20:30',
    sessionFee: 220000,
    teacherName: 'Cô Hà Phương Anh',
    assistantName: 'Cô Thảo Vy',
  },
];

export const INITIAL_ACADEMY_STUDENTS: AcademyStudent[] = [
  {
    id: 'ast-1',
    studentCode: 'HS9A01',
    fullName: 'Nguyễn Minh Anh',
    classId: 'cls-math-9a',
    parentName: 'Chị Nguyễn Lan Hương',
    parentPhone: '0912345678',
    parentZalo: '0912345678',
    status: 'Active',
  },
  {
    id: 'ast-2',
    studentCode: 'HS9A02',
    fullName: 'Trần Quốc Bảo',
    classId: 'cls-math-9a',
    parentName: 'Anh Trần Văn Hùng',
    parentPhone: '0987654321',
    parentZalo: '0987654321',
    status: 'Active',
  },
  {
    id: 'ast-3',
    studentCode: 'HS9A03',
    fullName: 'Lê Hà Phương',
    classId: 'cls-math-9a',
    parentName: 'Chị Lê Thị Mai',
    parentPhone: '0903112233',
    parentZalo: '0903112233',
    status: 'Active',
  },
  {
    id: 'ast-4',
    studentCode: 'HS9A04',
    fullName: 'Phạm Gia Huy',
    classId: 'cls-math-9a',
    parentName: 'Chị Phạm Thu Trang',
    parentPhone: '0938445566',
    parentZalo: '0938445566',
    status: 'Active',
  },
  {
    id: 'ast-5',
    studentCode: 'PY1001',
    fullName: 'Vũ Khánh Linh',
    classId: 'cls-cs-10b',
    parentName: 'Anh Vũ Hoàng Nam',
    parentPhone: '0918223344',
    parentZalo: '0918223344',
    status: 'Active',
  },
  {
    id: 'ast-6',
    studentCode: 'PY1002',
    fullName: 'Hoàng Đức Thịnh',
    classId: 'cls-cs-10b',
    parentName: 'Chị Đặng Thu Hà',
    parentPhone: '0977889900',
    parentZalo: '0977889900',
    status: 'Active',
  },
];

export const INITIAL_SESSIONS: LessonSession[] = [
  {
    id: 'ses-1',
    classId: 'cls-math-9a',
    date: '2026-11-03',
    topic: 'Phương trình bậc hai và định lý Vi-ét',
    homework: 'Làm bài 1–5 trang 42 sách bài tập.',
    recordedBy: 'Cô Hà Phương Anh',
    recordedByRole: 'teacher',
    entries: {
      'ast-1': {
        status: 'present',
        homeworkStatus: 'done',
        note: 'Hôm nay con Minh Anh nắm rất chắc công thức Vi-ét và trình bày bài giải sạch đẹp. Con tiếp tục giữ vững phong độ và thử sức thêm các bài tìm tham số m ở cuối phiếu nhé.',
      },
      'ast-2': {
        status: 'present',
        homeworkStatus: 'partial',
        note: 'Con Quốc Bảo tích cực giơ tay xây dựng bài trên lớp. Phần bài tập về nhà con còn sót hai ý cuối do chưa kịp hoàn thành, con nhớ dành thêm 15 phút buổi tối để ôn lại bước xét dấu delta nhé.',
      },
      'ast-3': {
        status: 'late',
        homeworkStatus: 'done',
        note: 'Hôm nay con Hà Phương vào lớp hơi muộn một chút nhưng đã nhanh chóng bắt nhịp cùng các bạn. Con làm đầy đủ bài về nhà, cô nhắc con chú ý kiểm tra lại dấu khi chuyển vế để bài làm trọn vẹn hơn nhé.',
      },
      'ast-4': {
        status: 'excused',
        homeworkStatus: 'done',
        note: 'Con Gia Huy xin phép nghỉ buổi học hôm nay vì lý do gia đình. Cô đã gửi lại phần ghi chú lý thuyết và phiếu bài tập, con tranh thủ xem lại để buổi tới mình luyện tập cùng cả lớp nhé.',
      },
    },
  },
  {
    id: 'ses-2',
    classId: 'cls-math-9a',
    date: '2026-11-06',
    topic: 'Ứng dụng Vi-ét tìm tham số m và hệ thức đối xứng',
    homework: 'Hoàn thành phiếu luyện tập số 4 (câu 1 đến câu 6).',
    recordedBy: 'Thầy Minh Đức',
    recordedByRole: 'assistant',
    entries: {
      'ast-1': {
        status: 'present',
        homeworkStatus: 'done',
        note: 'Con Minh Anh tiếp tục phát huy sự cẩn thận khi biến đổi các biểu thức đối xứng. Cô và thầy rất khen ngợi tinh thần tự giác hoàn thành bài tập về nhà của con.',
      },
      'ast-2': {
        status: 'present',
        homeworkStatus: 'done',
        note: 'Buổi học hôm nay con Quốc Bảo tiến bộ rõ rệt ở phần tính toán và đã hoàn thành đủ bài tập về nhà. Con nhớ đọc kỹ điều kiện có hai nghiệm phân biệt trước khi áp dụng Vi-ét nhé.',
      },
      'ast-3': {
        status: 'present',
        homeworkStatus: 'partial',
        note: 'Con Hà Phương hôm nay đi học đúng giờ và chú ý nghe giảng hơn rất nhiều. Con cần rà soát lại phần điều kiện delta lớn hơn hoặc bằng 0 và hoàn thiện nốt câu 5, câu 6 ở nhà nhé.',
      },
      'ast-4': {
        status: 'present',
        homeworkStatus: 'done',
        note: 'Con Gia Huy bắt nhịp rất nhanh sau buổi nghỉ trước và hoàn thành tốt các ví dụ trên lớp. Con tiếp tục ôn luyện thêm dạng toán có điều kiện ràng buộc để tự tin hơn nhé.',
      },
    },
  },
  {
    id: 'ses-3',
    classId: 'cls-math-9a',
    date: '2026-11-10',
    topic: 'Hàm số bậc hai y = ax² và tương giao đường thẳng',
    homework: 'Vẽ đồ thị và làm 4 bài tập tương giao.',
    recordedBy: 'Cô Hà Phương Anh',
    recordedByRole: 'teacher',
    entries: {
      'ast-1': {
        status: 'present',
        homeworkStatus: 'done',
        note: 'Con Minh Anh vẽ đồ thị parabol rất chuẩn xác và giải nhanh bài toán tìm giao điểm. Con giữ vững thói quen kiểm tra lại tọa độ giao điểm như hôm nay nhé.',
      },
      'ast-2': {
        status: 'late',
        homeworkStatus: 'done',
        note: 'Con Quốc Bảo vào lớp muộn 10 phút nhưng rất tập trung trong phần luyện tập tương giao. Con nhớ sắp xếp thời gian đến sớm hơn một chút để không bỏ lỡ phần mở đầu bài mới nhé.',
      },
      'ast-3': {
        status: 'absent',
        homeworkStatus: 'missing',
        note: 'Hôm nay con Hà Phương vắng mặt chưa có thông báo trước. Cô gửi lại nội dung bài đồ thị parabol, con nhớ xem kỹ lại phần lập bảng giá trị và hoàn thành bài tập trước buổi sau nhé.',
      },
      'ast-4': {
        status: 'present',
        homeworkStatus: 'done',
        note: 'Con Gia Huy hăng hái lên bảng giải bài tương giao rất tự tin. Cô khen con đã chủ động sửa những lỗi sai nhỏ trong bước lập phương trình hoành độ giao điểm.',
      },
    },
  },
  {
    id: 'ses-4',
    classId: 'cls-math-9a',
    date: '2026-11-14',
    topic: 'Ôn tập tổng hợp chuyên đề Phương trình & Đồ thị',
    homework: 'Làm đề tự luyện số 02 trên hệ thống.',
    recordedBy: 'Cô Hà Phương Anh',
    recordedByRole: 'teacher',
    entries: {
      'ast-1': {
        status: 'present',
        homeworkStatus: 'done',
        note: 'Con Minh Anh hoàn thành xuất sắc các bài ôn tập tổng hợp và hỗ trợ bạn bên cạnh rất nhiệt tình. Con tự tin làm tiếp đề tự luyện số 02 ở nhà nhé.',
      },
      'ast-2': {
        status: 'present',
        homeworkStatus: 'done',
        note: 'Hôm nay con Quốc Bảo giải trọn vẹn cả 4 dạng bài ôn tập và trình bày mạch lạc hơn trước. Con lưu ý đọc kỹ yêu cầu đề ở câu cuối để tránh mất điểm đáng tiếc nhé.',
      },
      'ast-3': {
        status: 'present',
        homeworkStatus: 'done',
        note: 'Cô vui khi thấy con Hà Phương hôm nay đã xem lại bài cũ và hoàn thành đầy đủ bài tập. Con tiếp tục duy trì nhịp độ học tập này trong các buổi tới nhé.',
      },
      'ast-4': {
        status: 'present',
        homeworkStatus: 'partial',
        note: 'Con Gia Huy tham gia thảo luận nhóm sôi nổi và nắm được ý chính của buổi ôn tập. Con nhớ hoàn thiện nốt hai câu cuối của phiếu bài tập trước khi làm đề mới nhé.',
      },
    },
  },
  {
    id: 'ses-5',
    classId: 'cls-cs-10b',
    date: '2026-11-08',
    topic: 'Tìm kiếm nhị phân trên mảng đã sắp xếp',
    homework: 'Hoàn thành 5 bài tập trên link mở.',
    recordedBy: 'Cô Thảo Vy',
    recordedByRole: 'assistant',
    entries: {
      'ast-5': {
        status: 'present',
        homeworkStatus: 'done',
        note: 'Con Khánh Linh hiểu rất nhanh ý tưởng chia đôi khoảng tìm kiếm và viết code chạy đúng ngay lần đầu. Con thử tối ưu thêm trường hợp có nhiều phần tử trùng nhau ở nhà nhé.',
      },
      'ast-6': {
        status: 'present',
        homeworkStatus: 'partial',
        note: 'Con Đức Thịnh tích cực đặt câu hỏi về điều kiện dừng vòng lặp while. Con nhớ kiểm tra lại công thức tính chỉ số giữa và hoàn thiện nốt bài tập về nhà trước buổi học tới nhé.',
      },
    },
  },
];

export const INITIAL_SETTINGS: WorkspaceSettings = {
  schoolName: 'Lớp học Cô Hà Phương Anh',
  teacherName: 'Cô Hà Phương Anh',
  currentRole: 'teacher',
  currentUserName: 'Cô Hà Phương Anh',
  bankBin: '970422',
  bankShortName: 'MB Bank',
  accountNumber: '0368999888',
  accountHolder: 'HA PHUONG ANH',
  transferTemplate: '{CODE} {MONTH} HOC PHI',
  assistantInviteCode: 'TA-2026-HPA',
  assistants: [
    {
      id: 'ta-1',
      name: 'Thầy Minh Đức',
      email: 'duc.trogiang@lopcophuonganh.vn',
      assignedClassIds: ['cls-math-9a'],
      active: true,
    },
    {
      id: 'ta-2',
      name: 'Cô Thảo Vy',
      email: 'vy.trogiang@lopcophuonganh.vn',
      assignedClassIds: ['cls-cs-10b'],
      active: true,
    },
  ],
};

function shortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return fullName.trim();
  return parts.slice(-2).join(' ');
}

/**
 * Generates warm, encouraging pedagogical feedback in Vietnamese ("Cô – Con" voice,
 * 2–3 sentences, ~40–65 words, turning mistakes into gentle reminders without criticism).
 */
export function buildWarmPedagogicalComment(
  fullName: string,
  status: AttendanceStatus,
  homeworkStatus: HomeworkStatus,
  lessonTopic: string
): string {
  const name = shortName(fullName);
  const topic = lessonTopic.trim() || 'bài học hôm nay';

  if (status === 'excused') {
    return `Hôm nay con ${name} xin phép vắng buổi học "${topic}". Cô đã lưu lại nội dung bài giảng và phần bài tập về nhà để con tiện theo dõi. Con tranh thủ xem lại ghi chú ở nhà, có chỗ nào chưa rõ thì nhắn cô hướng dẫn thêm để buổi tới mình bắt nhịp thật tốt nhé.`;
  }

  if (status === 'absent') {
    return `Buổi học "${topic}" hôm nay cô chưa thấy con ${name} vào lớp. Gia đình nhắc con giữ sức khỏe và sắp xếp thời gian xem lại nội dung bài giảng cô đã gửi nhé. Khi con nắm lại các ví dụ cơ bản rồi thì làm thêm vài bài tập nhẹ nhàng để không bị hổng kiến thức ạ.`;
  }

  const arrivalText =
    status === 'late'
      ? `Hôm nay con ${name} vào lớp hơi muộn một chút nhưng đã nhanh chóng ổn định và tập trung cùng cả lớp trong chuyên đề "${topic}". `
      : `Hôm nay con ${name} tham gia buổi học "${topic}" với tinh thần rất tích cực và chăm chú lắng nghe. `;

  if (homeworkStatus === 'done') {
    return `${arrivalText}Cô khen con đã chuẩn bị đầy đủ bài tập về nhà và mạnh dạn trao đổi khi gặp câu hỏi mới. Con tiếp tục giữ thói quen rà soát kỹ từng bước tính toán để bài làm ngày càng chắc chắn hơn nhé.`;
  }

  if (homeworkStatus === 'partial') {
    return `${arrivalText}Con đã nắm được ý chính trên lớp, phần bài tập về nhà còn một vài câu cuối con chưa kịp hoàn thiện. Tối nay con dành thêm chút thời gian làm nốt và kiểm tra lại bước biến đổi để ghi nhớ kiến thức thật vững nhé.`;
  }

  return `${arrivalText}Trên lớp con hiểu bài khá nhanh, tuy nhiên hôm nay con chưa kịp làm phần bài tập về nhà. Con nhớ sắp xếp lịch ôn tập đều đặn mỗi ngày khoảng 20 phút để luyện phản xạ và tự tin hơn ở buổi học tới nhé.`;
}

export function formatShortDayMonth(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  if (!day || !month) return isoDate;
  return `${day}/${month}`;
}

export function formatZaloParentMessage(
  student: AcademyStudent,
  cls: ClassRoom,
  session: LessonSession,
  entry: AttendanceEntry
): string {
  const name = shortName(student.fullName);
  const statusLabel = ATTENDANCE_META[entry.status].label;
  const hwLabel = HOMEWORK_META[entry.homeworkStatus].label;
  const comment =
    entry.note.trim() ||
    buildWarmPedagogicalComment(
      student.fullName,
      entry.status,
      entry.homeworkStatus,
      session.topic
    );

  return [
    `Cô gửi ${student.parentName} thông tin buổi học ngày ${formatShortDayMonth(session.date)} của con ${name} (${cls.name}):`,
    `- Nội dung: ${session.topic}`,
    `- Điểm danh: ${statusLabel} · ${hwLabel}`,
    `- Nhận xét: ${comment}`,
    session.homework ? `- Dặn dò BTVN: ${session.homework}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatZaloClassSummary(
  cls: ClassRoom,
  session: LessonSession,
  students: AcademyStudent[]
): string {
  const classStudents = students.filter((s) => s.classId === cls.id);
  let present = 0;
  let late = 0;
  let excused = 0;
  let absent = 0;

  for (const s of classStudents) {
    const st = session.entries[s.id]?.status ?? 'present';
    if (st === 'present') present += 1;
    else if (st === 'late') late += 1;
    else if (st === 'excused') excused += 1;
    else absent += 1;
  }

  return [
    `[NHẬT KÝ BUỔI HỌC - ${cls.name.toUpperCase()}]`,
    `Ngày: ${formatShortDayMonth(session.date)} · Phụ trách: ${session.recordedBy}`,
    `Nội dung bài học: ${session.topic}`,
    `Sĩ số: Có mặt ${present} · Muộn ${late} · Có phép ${excused} · Không phép ${absent} (Tổng ${classStudents.length})`,
    session.homework ? `Bài tập về nhà: ${session.homework}` : '',
    `Chúc các con ôn bài vui vẻ và hoàn thành tốt bài tập nhé!`,
  ]
    .filter(Boolean)
    .join('\n');
}

export interface StudentMonthlyStats {
  student: AcademyStudent;
  presentCount: number;
  lateCount: number;
  excusedCount: number;
  absentCount: number;
  attendedTotal: number;
  totalSessions: number;
  attendancePercent: number;
  rating: 'Xuất sắc' | 'Tốt' | 'Cần nhắc nhở';
  symbolsByDate: Record<string, 'V' | 'M' | 'P' | 'K'>;
}

export interface SessionBarMetric {
  sessionId: string;
  dateLabel: string;
  topic: string;
  presentAndLate: number;
  total: number;
  ratePercent: number;
}

export function computeMonthlyAnalytics(
  cls: ClassRoom,
  sessions: LessonSession[],
  students: AcademyStudent[],
  monthYYYYMM: string
): {
  monthSessions: LessonSession[];
  sessionBars: SessionBarMetric[];
  studentStats: StudentMonthlyStats[];
} {
  const classStudents = students.filter((s) => s.classId === cls.id);
  const monthSessions = sessions
    .filter((s) => s.classId === cls.id && s.date.startsWith(monthYYYYMM))
    .sort((a, b) => a.date.localeCompare(b.date));

  const sessionBars: SessionBarMetric[] = monthSessions.map((ses) => {
    let attended = 0;
    for (const st of classStudents) {
      const status = ses.entries[st.id]?.status ?? 'present';
      if (status === 'present' || status === 'late') {
        attended += 1;
      }
    }
    const total = classStudents.length;
    const ratePercent = total > 0 ? Math.round((attended / total) * 100) : 0;
    return {
      sessionId: ses.id,
      dateLabel: formatShortDayMonth(ses.date),
      topic: ses.topic,
      presentAndLate: attended,
      total,
      ratePercent,
    };
  });

  const studentStats: StudentMonthlyStats[] = classStudents.map((student) => {
    let presentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;
    let absentCount = 0;
    const symbolsByDate: Record<string, 'V' | 'M' | 'P' | 'K'> = {};

    for (const ses of monthSessions) {
      const status = ses.entries[student.id]?.status ?? 'present';
      symbolsByDate[ses.date] = ATTENDANCE_META[status].symbol;
      if (status === 'present') presentCount += 1;
      else if (status === 'late') lateCount += 1;
      else if (status === 'excused') excusedCount += 1;
      else absentCount += 1;
    }

    const attendedTotal = presentCount + lateCount;
    const totalSessions = monthSessions.length;
    const attendancePercent =
      totalSessions > 0 ? Math.round((attendedTotal / totalSessions) * 100) : 100;

    let rating: 'Xuất sắc' | 'Tốt' | 'Cần nhắc nhở' = 'Tốt';
    if (attendancePercent >= 90 && absentCount === 0) {
      rating = 'Xuất sắc';
    } else if (attendancePercent < 75 || absentCount >= 2) {
      rating = 'Cần nhắc nhở';
    }

    return {
      student,
      presentCount,
      lateCount,
      excusedCount,
      absentCount,
      attendedTotal,
      totalSessions,
      attendancePercent,
      rating,
      symbolsByDate,
    };
  });

  return { monthSessions, sessionBars, studentStats };
}

export function buildMonthlyMatrixExcelRows(
  cls: ClassRoom,
  sessions: LessonSession[],
  students: AcademyStudent[],
  monthYYYYMM: string
): Record<string, string | number>[] {
  const { monthSessions, studentStats } = computeMonthlyAnalytics(
    cls,
    sessions,
    students,
    monthYYYYMM
  );

  return studentStats.map((stat, idx) => {
    const row: Record<string, string | number> = {
      STT: idx + 1,
      'Mã HS': stat.student.studentCode,
      'Họ và tên': stat.student.fullName,
    };

    for (const ses of monthSessions) {
      row[formatShortDayMonth(ses.date)] = stat.symbolsByDate[ses.date] ?? 'V';
    }

    row['Số buổi đi học'] = stat.attendedTotal;
    row['Tỉ lệ chuyên cần (%)'] = stat.attendancePercent;
    row['Xếp loại'] = stat.rating;
    return row;
  });
}

export interface StudentTuitionBill {
  student: AcademyStudent;
  cls: ClassRoom;
  monthYYYYMM: string;
  attendedDates: string[]; // formatted DD/MM
  sessionCount: number;
  unitFee: number;
  totalAmount: number;
  transferPurpose: string;
}

export function computeStudentTuition(
  student: AcademyStudent,
  cls: ClassRoom,
  sessions: LessonSession[],
  monthYYYYMM: string,
  transferTemplate = '{CODE} {MONTH} HOC PHI'
): StudentTuitionBill {
  const attendedDates = sessions
    .filter((ses) => ses.classId === cls.id && ses.date.startsWith(monthYYYYMM))
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((ses) => {
      const status = ses.entries[student.id]?.status;
      return status === 'present' || status === 'late';
    })
    .map((ses) => formatShortDayMonth(ses.date));

  const sessionCount = attendedDates.length;
  const totalAmount = sessionCount * cls.sessionFee;

  const [yr, mo] = monthYYYYMM.split('-');
  const monthTag = mo && yr ? `T${mo}` : monthYYYYMM;
  const transferPurpose = transferTemplate
    .replace('{CODE}', student.studentCode)
    .replace('{NAME}', student.fullName)
    .replace('{MONTH}', monthTag)
    .trim();

  return {
    student,
    cls,
    monthYYYYMM,
    attendedDates,
    sessionCount,
    unitFee: cls.sessionFee,
    totalAmount,
    transferPurpose,
  };
}

export function formatTuitionZaloMessage(
  bill: StudentTuitionBill,
  settings: WorkspaceSettings
): string {
  const datesLine =
    bill.attendedDates.length > 0
      ? bill.attendedDates.map((d) => `Ngày ${d}`).join(', ')
      : 'Chưa phát sinh buổi học';

  const [, mo, ] = bill.monthYYYYMM.split('-');
  const monthDisplay = mo ? `tháng ${Number(mo)}` : bill.monthYYYYMM;

  return [
    `Cô gửi ${bill.student.parentName} thông báo học phí ${monthDisplay} của con ${bill.student.fullName} (${bill.cls.name}):`,
    `- Các buổi con đã học: ${datesLine} (${bill.sessionCount} buổi)`,
    `- Đơn giá: ${new Intl.NumberFormat('vi-VN').format(bill.unitFee)} đ/buổi`,
    `- Tổng học phí: ${new Intl.NumberFormat('vi-VN').format(bill.totalAmount)} đ`,
    `Thông tin chuyển khoản:`,
    `- Ngân hàng: ${settings.bankShortName} · STK: ${settings.accountNumber}`,
    `- Chủ tài khoản: ${settings.accountHolder}`,
    `- Nội dung CK: ${bill.transferPurpose}`,
    `Gia đình có thể quét mã VietQR trên phiếu đính kèm để điền tự động số tiền và nội dung ạ. Cô cảm ơn gia đình!`,
  ].join('\n');
}

export interface AiRecordingAnalysis {
  transcript: string;
  keyTopics: string[];
  homework: string;
  studentComments: Record<string, string>;
}

export function parseTranscriptFallback(
  rawText: string,
  students: AcademyStudent[],
  topicHint: string
): AiRecordingAnalysis {
  const cleaned = rawText.trim();
  const lines = cleaned
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const keyTopics = lines
    .filter(
      (l) =>
        !/^[-•*]\s*(con|em|hs|học sinh)\b/i.test(l) &&
        /kiến thức|trọng tâm|nội dung|chuyên đề|công thức|định lý|bài học/i.test(l)
    )
    .map((l) =>
      l
        .replace(
          /^[-•*]?\s*(chuyên đề trọng tâm hôm nay|kiến thức trọng tâm|nội dung trọng tâm|nội dung|chuyên đề)\s*:\s*/i,
          ''
        )
        .trim()
    )
    .filter(Boolean)
    .slice(0, 4);

  if (keyTopics.length === 0) {
    keyTopics.push(
      topicHint.trim() || 'Ôn tập kiến thức trọng tâm và luyện giải bài tập áp dụng trên lớp'
    );
  }

  const rawHomeworkLine =
    lines.find(
      (l) =>
        !/^[-•*]\s*(con|em|hs|học sinh)\b/i.test(l) &&
        /bài tập|btvn|dặn dò|về nhà|phiếu/i.test(l)
    ) ?? 'Hoàn thành các bài tập luyện tập cuối buổi và xem lại ví dụ mẫu trên lớp.';
  const homeworkLine = rawHomeworkLine
    .replace(/^[-•*]?\s*(dặn dò(\s*btvn)?|btvn|bài tập về nhà)\s*:\s*/i, '')
    .trim();

  const studentComments: Record<string, string> = {};
  for (const st of students) {
    const short = shortName(st.fullName);
    const mentioned = lines.find(
      (l) =>
        l.toLowerCase().includes(st.fullName.toLowerCase()) ||
        l.toLowerCase().includes(short.toLowerCase())
    );
    if (mentioned) {
      studentComments[st.id] = `Trong buổi học "${keyTopics[0]}", ${mentioned.replace(/^[-•*]\s*/, '')}. Con tiếp tục phát huy tinh thần tích cực và ôn tập lại các ví dụ trọng tâm để tự tin hơn ở buổi học tới nhé.`;
    } else {
      studentComments[st.id] = buildWarmPedagogicalComment(
        st.fullName,
        'present',
        'done',
        keyTopics[0]
      );
    }
  }

  return {
    transcript:
      cleaned ||
      `Biên bản buổi học "${keyTopics[0]}": Cả lớp lắng nghe phần giảng lý thuyết trọng tâm, thực hành giải các ví dụ điển hình và ghi chú dặn dò bài tập về nhà.`,
    keyTopics,
    homework: homeworkLine.replace(/^[-•*]\s*/, ''),
    studentComments,
  };
}
