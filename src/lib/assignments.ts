export type CognitiveLevel =
  | 'nhan_biet'
  | 'thong_hieu'
  | 'van_dung_thap'
  | 'van_dung_cao';

export interface CognitiveLevelMeta {
  key: CognitiveLevel;
  label: string;
  shortLabel: string;
  targetPercent: number;
  order: number;
}

export const COGNITIVE_LEVELS: CognitiveLevel[] = [
  'nhan_biet',
  'thong_hieu',
  'van_dung_thap',
  'van_dung_cao',
];

export const COGNITIVE_LEVEL_META: Record<CognitiveLevel, CognitiveLevelMeta> = {
  nhan_biet: {
    key: 'nhan_biet',
    label: 'Nhận biết',
    shortLabel: 'NB',
    targetPercent: 20,
    order: 1,
  },
  thong_hieu: {
    key: 'thong_hieu',
    label: 'Thông hiểu',
    shortLabel: 'TH',
    targetPercent: 30,
    order: 2,
  },
  van_dung_thap: {
    key: 'van_dung_thap',
    label: 'Vận dụng thấp',
    shortLabel: 'VDT',
    targetPercent: 40,
    order: 3,
  },
  van_dung_cao: {
    key: 'van_dung_cao',
    label: 'Vận dụng cao',
    shortLabel: 'VDC',
    targetPercent: 10,
    order: 4,
  },
};

export interface BankQuestion {
  id: string;
  subject: string;
  topic: string;
  keywords: string[];
  level: CognitiveLevel;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  solution: string;
  isCustom?: boolean;
}

export interface AssignmentItem {
  question: BankQuestion;
  points: number;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  lessonContent: string;
  questionCount: 5 | 6;
  items: AssignmentItem[];
  totalPoints: number;
  createdAt: string;
}

export interface LevelScoreBreakdown {
  level: CognitiveLevel;
  label: string;
  targetPercent: number;
  earnedPoints: number;
  maxPoints: number;
  correctCount: number;
  totalCount: number;
}

export interface GradedItemResult {
  questionId: string;
  level: CognitiveLevel;
  prompt: string;
  options: [string, string, string, string];
  selectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
  earnedPoints: number;
  maxPoints: number;
  solution: string;
}

export interface SubmissionResult {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentName: string;
  studentCode: string;
  submittedAt: string;
  totalScore: number;
  maxScore: number;
  correctCount: number;
  totalQuestions: number;
  levelBreakdown: LevelScoreBreakdown[];
  itemResults: GradedItemResult[];
}

export const LESSON_PRESETS = [
  {
    label: 'Lập trình: Tìm kiếm nhị phân & Mảng',
    subject: 'Lập trình & CTDL',
    title: 'Bài tập Tìm kiếm nhị phân & Độ phức tạp thuật toán',
    lessonContent:
      'Hôm nay lớp đã học cấu trúc mảng một chiều, thuật toán tìm kiếm tuần tự, tìm kiếm nhị phân trên mảng đã sắp xếp tăng dần và cách đánh giá độ phức tạp thời gian O(1), O(n), O(log n).',
  },
  {
    label: 'SQL: Truy vấn SELECT, JOIN & GROUP BY',
    subject: 'Cơ sở dữ liệu SQL',
    title: 'Bài tập Truy vấn tổng hợp & Kết nối bảng SQL',
    lessonContent:
      'Buổi học tập trung vào câu lệnh SELECT, lọc dữ liệu với WHERE và HAVING, gom nhóm GROUP BY, các hàm tổng hợp COUNT/AVG/SUM và kết nối nhiều bảng bằng INNER JOIN, LEFT JOIN.',
  },
  {
    label: 'Giải tích: Đạo hàm & Cực trị hàm số',
    subject: 'Giải tích & Xác suất',
    title: 'Bài tập Ứng dụng đạo hàm tìm cực trị và đơn điệu',
    lessonContent:
      'Học sinh đã ôn lại quy tắc tính đạo hàm, xét dấu đạo hàm bậc nhất để tìm khoảng đồng biến nghịch biến, điểm cực đại, cực tiểu và giá trị lớn nhất, nhỏ nhất trên đoạn [a; b].',
  },
];

export const QUESTION_BANK: BankQuestion[] = [
  // ========================
  // 1. LẬP TRÌNH & CTDL
  // ========================
  {
    id: 'cs-nb-1',
    subject: 'Lập trình & CTDL',
    topic: 'Tìm kiếm nhị phân & Mảng',
    keywords: ['tìm kiếm nhị phân', 'binary search', 'mảng', 'sắp xếp', 'điều kiện'],
    level: 'nhan_biet',
    prompt:
      'Điều kiện bắt buộc để áp dụng thuật toán tìm kiếm nhị phân (Binary Search) trên một mảng là gì?',
    options: [
      'Mảng phải có số lượng phần tử là số chẵn',
      'Mảng phải được sắp xếp theo thứ tự (tăng dần hoặc giảm dần)',
      'Mảng không được chứa các phần tử trùng lặp',
      'Mảng phải lưu trữ các số nguyên dương',
    ],
    correctIndex: 1,
    solution:
      'Tìm kiếm nhị phân liên tục chia đôi không gian tìm kiếm dựa vào việc so sánh phần tử ở giữa với giá trị cần tìm, nên mảng bắt buộc phải được sắp xếp theo một thứ tự xác định (tăng dần hoặc giảm dần).',
  },
  {
    id: 'cs-nb-2',
    subject: 'Lập trình & CTDL',
    topic: 'Độ phức tạp thuật toán',
    keywords: ['độ phức tạp', 'big-o', 'mảng', 'truy cập', 'o(1)'],
    level: 'nhan_biet',
    prompt:
      'Độ phức tạp thời gian để truy cập trực tiếp một phần tử bất kỳ qua chỉ số arr[i] trong mảng một chiều là bao nhiêu?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correctIndex: 0,
    solution:
      'Mảng được cấp phát liên tiếp trong bộ nhớ nên địa chỉ phần tử thứ i được tính trực tiếp bằng phép cộng địa chỉ gốc + i * kích_thước_phần_tử, mất thời gian hằng số O(1).',
  },
  {
    id: 'cs-th-1',
    subject: 'Lập trình & CTDL',
    topic: 'Tìm kiếm nhị phân & Mảng',
    keywords: ['tìm kiếm nhị phân', 'o(log n)', 'số bước', 'tối đa', 'mảng'],
    level: 'thong_hieu',
    prompt:
      'Khi tìm kiếm nhị phân trên mảng đã sắp xếp gồm 64 phần tử, số lần so sánh với phần tử giữa tối đa trong trường hợp xấu nhất là xấp xỉ bao nhiêu?',
    options: ['6 đến 7 lần', '32 lần', '64 lần', '16 lần'],
    correctIndex: 0,
    solution:
      'Sau mỗi bước so sánh, kích thước vùng tìm kiếm giảm đi một nửa: 64 -> 32 -> 16 -> 8 -> 4 -> 2 -> 1. Vì log2(64) = 6, số bước kiểm tra tối đa là 6–7 bước (⌊log2(n)⌋ + 1).',
  },
  {
    id: 'cs-th-2',
    subject: 'Lập trình & CTDL',
    topic: 'Tìm kiếm tuần tự & Nhị phân',
    keywords: ['tìm kiếm tuần tự', 'tìm kiếm nhị phân', 'o(n)', 'o(log n)', 'so sánh'],
    level: 'thong_hieu',
    prompt:
      'Vì sao với một mảng chưa sắp xếp và chỉ cần tìm kiếm đúng 1 lần duy nhất, người ta thường dùng tìm kiếm tuần tự thay vì sắp xếp rồi tìm kiếm nhị phân?',
    options: [
      'Vì tìm kiếm tuần tự luôn có độ phức tạp O(1)',
      'Vì chi phí sắp xếp mảng đã tốn O(n log n), lớn hơn O(n) của tìm kiếm tuần tự',
      'Vì tìm kiếm nhị phân không hoạt động với kiểu số thực',
      'Vì tìm kiếm tuần tự dùng ít bộ nhớ hơn O(1) so với O(n) của tìm kiếm nhị phân lặp',
    ],
    correctIndex: 1,
    solution:
      'Tìm kiếm tuần tự chỉ tốn O(n) nếu chạy 1 lần. Nếu sắp xếp trước (O(n log n)) rồi mới tìm kiếm nhị phân (O(log n)), tổng chi phí là O(n log n), chậm hơn O(n).',
  },
  {
    id: 'cs-vdt-1',
    subject: 'Lập trình & CTDL',
    topic: 'Tìm kiếm nhị phân & Mảng',
    keywords: ['tìm kiếm nhị phân', 'mid', 'mảng', 'giá trị', 'lập trình'],
    level: 'van_dung_thap',
    prompt:
      'Cho mảng đã sắp xếp A = [3, 7, 12, 18, 25, 31, 40] (chỉ số từ 0 đến 6). Dùng tìm kiếm nhị phân với mid = Math.floor((left + right) / 2) để tìm x = 25. Giá trị A[mid] ở bước đầu tiên và bước thứ hai lần lượt là bao nhiêu?',
    options: [
      'Bước 1: 18, Bước 2: 31',
      'Bước 1: 18, Bước 2: 25',
      'Bước 1: 25, Bước 2: 31',
      'Bước 1: 12, Bước 2: 25',
    ],
    correctIndex: 0,
    solution:
      'Bước 1: left = 0, right = 6 => mid = 3 => A[3] = 18. Vì 18 < 25 nên cập nhật left = 4. Bước 2: left = 4, right = 6 => mid = Math.floor((4+6)/2) = 5 => A[5] = 31. (Bước 3: right = 4, mid = 4 => A[4] = 25).',
  },
  {
    id: 'cs-vdt-2',
    subject: 'Lập trình & CTDL',
    topic: 'Tìm kiếm nhị phân & Mảng',
    keywords: ['tìm kiếm nhị phân', 'tràn số', 'mid', 'left', 'right', 'mảng'],
    level: 'van_dung_thap',
    prompt:
      'Trong cài đặt tìm kiếm nhị phân bằng C++/Java với mảng rất lớn, biểu thức nào tính chỉ số giữa `mid` an toàn nhất để tránh lỗi tràn số nguyên (integer overflow)?',
    options: [
      'mid = (left + right) / 2',
      'mid = left + (right - left) / 2',
      'mid = (left * right) / 2',
      'mid = right - (left + right) / 2',
    ],
    correctIndex: 1,
    solution:
      'Khi left và right đều lớn (gần INT_MAX), phép cộng (left + right) có thể gây tràn số thành số âm. Viết left + (right - left) / 2 cho kết quả tương đương về mặt toán học nhưng hiệu (right - left) luôn nằm trong phạm vi hợp lệ.',
  },
  {
    id: 'cs-vdt-3',
    subject: 'Lập trình & CTDL',
    topic: 'Độ phức tạp thuật toán',
    keywords: ['vòng lặp', 'độ phức tạp', 'o(n)', 'o(log n)', 'n log n'],
    level: 'van_dung_thap',
    prompt:
      'Một vòng lặp ngoài chạy từ i = 1 đến n, bên trong là một vòng lặp chia đôi biến j (j = n; j > 0; j = j / 2). Độ phức tạp thời gian của đoạn mã này là gì?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'],
    correctIndex: 2,
    solution:
      'Vòng lặp ngoài thực hiện n lần. Với mỗi lần lặp ngoài, vòng lặp trong chia đôi j cho tới khi về 0 nên chạy O(log n) bước. Tổng số phép tính tỉ lệ với n * log(n) => O(n log n).',
  },
  {
    id: 'cs-vdc-1',
    subject: 'Lập trình & CTDL',
    topic: 'Tìm kiếm nhị phân nâng cao',
    keywords: ['tìm kiếm nhị phân', 'trùng lặp', 'vị trí đầu tiên', 'lower_bound', 'mảng'],
    level: 'van_dung_cao',
    prompt:
      'Cho mảng đã sắp xếp có phần tử trùng lặp A = [2, 4, 4, 4, 4, 7, 9]. Để tìm CHỈ SỐ ĐẦU TIÊN của x = 4 bằng tìm kiếm nhị phân, khi gặp A[mid] == 4 ta cần xử lý tiếp thế nào?',
    options: [
      'Trả về ngay chỉ số mid vì đã tìm thấy giá trị 4',
      'Lưu ans = mid rồi tiếp tục thu hẹp sang trái (right = mid - 1) để kiểm tra xem còn số 4 nào đứng trước không',
      'Lưu ans = mid rồi dịch sang phải (left = mid + 1)',
      'Giảm mid đi 1 đơn vị cho tới khi A[mid] != 4 (có thể tốn O(n))',
    ],
    correctIndex: 1,
    solution:
      'Nếu trả về ngay mid thì có thể rơi vào giữa cụm số 4; nếu lặp lùi từng bước thì trường hợp toàn số 4 sẽ thoái hóa thành O(n). Đúng chuẩn là lưu ứng viên ans = mid và gán right = mid - 1 để tìm tiếp ở nửa trái, giữ nguyên độ phức tạp O(log n).',
  },
  {
    id: 'cs-vdc-2',
    subject: 'Lập trình & CTDL',
    topic: 'Tìm kiếm nhị phân trên đáp án',
    keywords: ['tìm kiếm nhị phân', 'binary search on answer', 'tối ưu', 'độ phức tạp'],
    level: 'van_dung_cao',
    prompt:
      'Cần chia N = 10^5 gói hàng có khối lượng tối đa 10^4 cho K xe sao cho tải trọng lớn nhất của 1 xe là nhỏ nhất. Hướng giải tối ưu có độ phức tạp O(N log(Tổng khối lượng)) là gì?',
    options: [
      'Thử mọi cách chia bằng quay lui',
      'Tìm kiếm nhị phân trên giá trị tải trọng M trong [max(w), sum(w)] kết hợp hàm kiểm tra tham lam O(N)',
      'Sắp xếp giảm dần rồi chia đều vòng tròn cho K xe',
      'Dùng tìm kiếm tuần tự giá trị M từ 1 đến sum(w)',
    ],
    correctIndex: 1,
    solution:
      'Tính chất đơn điệu: nếu tải trọng M chia được cho <= K xe thì mọi M\' > M cũng chia được. Do đó áp dụng Tìm kiếm nhị phân trên đáp án M trong [max(w), sum(w)], mỗi bước kiểm tra tham lam mất O(N), tổng độ phức tạp là O(N log(sum)).',
  },

  // ========================
  // 2. CƠ SỞ DỮ LIỆU SQL
  // ========================
  {
    id: 'sql-nb-1',
    subject: 'Cơ sở dữ liệu SQL',
    topic: 'Truy vấn cơ bản SELECT',
    keywords: ['sql', 'select', 'where', 'lọc', 'dữ liệu'],
    level: 'nhan_biet',
    prompt: 'Trong SQL, mệnh đề nào dùng để lọc các bản ghi thỏa mãn điều kiện trước khi gom nhóm?',
    options: ['ORDER BY', 'WHERE', 'GROUP BY', 'LIMIT'],
    correctIndex: 1,
    solution:
      'Mệnh đề WHERE dùng để lọc từng dòng dữ liệu thỏa mãn điều kiện ngay từ bảng nguồn, thực thi trước bước GROUP BY.',
  },
  {
    id: 'sql-nb-2',
    subject: 'Cơ sở dữ liệu SQL',
    topic: 'Kết nối bảng JOIN',
    keywords: ['sql', 'join', 'inner join', 'left join', 'bảng'],
    level: 'nhan_biet',
    prompt:
      'Loại kết nối bảng nào trong SQL giữ lại TẤT CẢ các dòng của bảng bên trái, ngay cả khi không có bản ghi khớp ở bảng bên phải?',
    options: ['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'RIGHT JOIN'],
    correctIndex: 1,
    solution:
      'LEFT JOIN (hay LEFT OUTER JOIN) trả về toàn bộ dòng của bảng bên trái; với những dòng không tìm thấy bản ghi khớp ở bảng phải, các cột của bảng phải sẽ mang giá trị NULL.',
  },
  {
    id: 'sql-th-1',
    subject: 'Cơ sở dữ liệu SQL',
    topic: 'WHERE và HAVING',
    keywords: ['sql', 'where', 'having', 'group by', 'count', 'hàm tổng hợp'],
    level: 'thong_hieu',
    prompt: 'Sự khác biệt cốt lõi giữa WHERE và HAVING trong một câu truy vấn SQL là gì?',
    options: [
      'WHERE lọc các dòng riêng lẻ trước khi gom nhóm, còn HAVING lọc các nhóm sau khi GROUP BY',
      'HAVING nhanh hơn WHERE trong mọi trường hợp',
      'WHERE dùng cho kiểu số còn HAVING dùng cho kiểu chuỗi',
      'HAVING bắt buộc phải đứng trước FROM',
    ],
    correctIndex: 0,
    solution:
      'Thứ tự thực thi logic SQL: FROM -> WHERE (lọc dòng) -> GROUP BY (gom nhóm) -> HAVING (lọc nhóm theo các hàm tổng hợp như COUNT, SUM, AVG) -> SELECT -> ORDER BY.',
  },
  {
    id: 'sql-th-2',
    subject: 'Cơ sở dữ liệu SQL',
    topic: 'Hàm tổng hợp COUNT',
    keywords: ['sql', 'count', 'null', 'group by', 'tổng hợp'],
    level: 'thong_hieu',
    prompt: 'Sự khác nhau giữa COUNT(*) và COUNT(email) khi cột email có chứa giá trị NULL là gì?',
    options: [
      'Không có sự khác nhau, cả hai luôn trả về cùng một số',
      'COUNT(*) đếm tất cả các dòng (kể cả dòng có email là NULL), còn COUNT(email) bỏ qua các giá trị NULL',
      'COUNT(email) đếm cả NULL, còn COUNT(*) bỏ qua NULL',
      'COUNT(email) gây lỗi cú pháp nếu cột có NULL',
    ],
    correctIndex: 1,
    solution:
      'Trong chuẩn SQL, COUNT(*) đếm tổng số bản ghi trong tập kết quả (bao gồm dòng chứa NULL), trong khi COUNT(tên_cột) chỉ đếm những dòng mà tên_cột KHÁC NULL.',
  },
  {
    id: 'sql-vdt-1',
    subject: 'Cơ sở dữ liệu SQL',
    topic: 'GROUP BY & HAVING',
    keywords: ['sql', 'group by', 'having', 'count', 'select', 'sinh viên'],
    level: 'van_dung_thap',
    prompt:
      'Cho bảng Enrollments(student_id, course_id). Câu lệnh nào liệt kê đúng mã các sinh viên đăng ký từ 3 môn học khác nhau trở lên?',
    options: [
      'SELECT student_id FROM Enrollments WHERE COUNT(DISTINCT course_id) >= 3 GROUP BY student_id;',
      'SELECT student_id FROM Enrollments GROUP BY student_id HAVING COUNT(DISTINCT course_id) >= 3;',
      'SELECT student_id FROM Enrollments GROUP BY course_id HAVING COUNT(*) >= 3;',
      'SELECT DISTINCT student_id FROM Enrollments WHERE course_id >= 3;',
    ],
    correctIndex: 1,
    solution:
      'Không thể dùng hàm tổng hợp COUNT trong WHERE. Ta cần gom nhóm theo student_id bằng GROUP BY student_id, sau đó dùng HAVING COUNT(DISTINCT course_id) >= 3 để lọc những sinh viên học >= 3 môn phân biệt.',
  },
  {
    id: 'sql-vdt-2',
    subject: 'Cơ sở dữ liệu SQL',
    topic: 'LEFT JOIN & NULL',
    keywords: ['sql', 'left join', 'where', 'null', 'chưa có'],
    level: 'van_dung_thap',
    prompt:
      'Cho bảng Students(id, name) và Submissions(id, student_id). Để tìm các sinh viên CHƯA NỘP BÀI nào, cách viết nào sau đây chính xác?',
    options: [
      'SELECT s.name FROM Students s INNER JOIN Submissions sub ON s.id = sub.student_id WHERE sub.id IS NULL;',
      'SELECT s.name FROM Students s LEFT JOIN Submissions sub ON s.id = sub.student_id WHERE sub.id IS NULL;',
      'SELECT s.name FROM Students s LEFT JOIN Submissions sub ON s.id = sub.student_id WHERE s.id IS NULL;',
      'SELECT s.name FROM Students s RIGHT JOIN Submissions sub ON s.id = sub.student_id;',
    ],
    correctIndex: 1,
    solution:
      'Dùng LEFT JOIN để giữ toàn bộ sinh viên bên bảng Students; những sinh viên chưa có bài nộp khớp sẽ có sub.id mang giá trị NULL, nên điều kiện WHERE sub.id IS NULL sẽ lọc chính xác tập này.',
  },
  {
    id: 'sql-vdt-3',
    subject: 'Cơ sở dữ liệu SQL',
    topic: 'AVG & ORDER BY',
    keywords: ['sql', 'avg', 'group by', 'order by', 'select'],
    level: 'van_dung_thap',
    prompt:
      'Cho bảng Scores(major, gpa). Để tính GPA trung bình từng ngành và xếp ngành có GPA trung bình cao nhất lên đầu, câu truy vấn chuẩn là gì?',
    options: [
      'SELECT major, AVG(gpa) AS avg_gpa FROM Scores GROUP BY major ORDER BY avg_gpa DESC;',
      'SELECT major, AVG(gpa) FROM Scores ORDER BY major DESC;',
      'SELECT major, SUM(gpa) FROM Scores GROUP BY gpa ORDER BY major ASC;',
      'SELECT major, AVG(gpa) FROM Scores HAVING AVG(gpa) DESC;',
    ],
    correctIndex: 0,
    solution:
      'Cần GROUP BY major để tính AVG(gpa) theo từng ngành, đặt bí danh avg_gpa rồi sắp xếp giảm dần với ORDER BY avg_gpa DESC.',
  },
  {
    id: 'sql-vdc-1',
    subject: 'Cơ sở dữ liệu SQL',
    topic: 'Bẫy điều kiện WHERE trên LEFT JOIN',
    keywords: ['sql', 'left join', 'where', 'on', 'lọc', 'null'],
    level: 'van_dung_cao',
    prompt:
      'Khi viết: SELECT s.name, sub.score FROM Students s LEFT JOIN Submissions sub ON s.id = sub.student_id WHERE sub.term = "Fall2026". Điều gì bất ngờ xảy ra với sinh viên chưa nộp bài?',
    options: [
      'Vẫn hiển thị với sub.score = NULL',
      'Bị loại bỏ khỏi kết quả giống như INNER JOIN, vì ở WHERE giá trị sub.term là NULL không thỏa mãn = "Fall2026"',
      'Hệ thống tự động gán sub.term = "Fall2026"',
      'Câu lệnh báo lỗi biên dịch SQL',
    ],
    correctIndex: 1,
    solution:
      'Đây là lỗi kinh điển với LEFT JOIN: điều kiện lọc bảng phải đặt ở WHERE sẽ loại bỏ các dòng có sub.* = NULL, biến LEFT JOIN thành INNER JOIN. Để giữ sinh viên chưa nộp bài trong kỳ Fall2026, phải chuyển điều kiện sub.term = "Fall2026" lên mệnh đề ON.',
  },
  {
    id: 'sql-vdc-2',
    subject: 'Cơ sở dữ liệu SQL',
    topic: 'Top-N theo nhóm',
    keywords: ['sql', 'group by', 'join', 'top', 'cao nhất', 'truy vấn'],
    level: 'van_dung_cao',
    prompt:
      'Để tìm sinh viên có GPA cao nhất của MỖI ngành (bao gồm cả trường hợp đồng hạng nhất) chỉ bằng JOIN và GROUP BY chuẩn SQL, giải pháp nào đúng?',
    options: [
      'SELECT major, MAX(gpa), full_name FROM Students GROUP BY major;',
      'Tìm (major, MAX(gpa)) trong subquery/CTE rồi INNER JOIN ngược lại bảng Students theo cả major và gpa = max_gpa',
      'Dùng SELECT major, full_name FROM Students ORDER BY gpa DESC LIMIT 1;',
      'Dùng HAVING gpa = MAX(gpa) không cần subquery',
    ],
    correctIndex: 1,
    solution:
      'GROUP BY major không thể chọn trực tiếp full_name tương ứng với MAX(gpa) một cách hợp lệ. Ta tạo bảng tạm/CTE chứa (major, MAX(gpa) AS max_gpa) rồi INNER JOIN lại với Students trên (s.major = m.major AND s.gpa = m.max_gpa) để lấy đủ mọi sinh viên đạt điểm cao nhất từng ngành.',
  },

  // ========================
  // 3. GIẢI TÍCH & XÁC SUẤT
  // ========================
  {
    id: 'math-nb-1',
    subject: 'Giải tích & Xác suất',
    topic: 'Đạo hàm & Đơn điệu',
    keywords: ['đạo hàm', 'đồng biến', 'cực trị', 'hàm số'],
    level: 'nhan_biet',
    prompt:
      'Cho hàm số y = f(x) có đạo hàm trên khoảng (a; b). Nếu f\'(x) > 0 với mọi x ∈ (a; b) thì hàm số có tính chất nào trên khoảng đó?',
    options: [
      'Nghịch biến trên (a; b)',
      'Đồng biến trên (a; b)',
      'Không đổi (hàm hằng) trên (a; b)',
      'Đạt cực tiểu tại mọi điểm thuộc (a; b)',
    ],
    correctIndex: 1,
    solution:
      'Theo định lý về tính đơn điệu của hàm số, nếu f\'(x) > 0 với mọi x thuộc (a; b) thì hàm số f(x) đồng biến (tăng) trên (a; b).',
  },
  {
    id: 'math-nb-2',
    subject: 'Giải tích & Xác suất',
    topic: 'Quy tắc tính đạo hàm',
    keywords: ['đạo hàm', 'đa thức', 'công thức', 'lũy thừa'],
    level: 'nhan_biet',
    prompt: 'Đạo hàm của hàm số f(x) = x^3 - 4x + 5 là biểu thức nào sau đây?',
    options: ['3x^2 - 4', '3x^2 - 4x', 'x^2 - 4', '3x^3 - 4'],
    correctIndex: 0,
    solution:
      'Áp dụng công thức (x^n)\' = n.x^(n-1) và đạo hàm của hằng số bằng 0: f\'(x) = 3x^2 - 4.',
  },
  {
    id: 'math-th-1',
    subject: 'Giải tích & Xác suất',
    topic: 'Điều kiện cực trị',
    keywords: ['đạo hàm', 'cực trị', 'cực đại', 'cực tiểu', 'đổi dấu'],
    level: 'thong_hieu',
    prompt:
      'Tại điểm x0, điều kiện đủ để hàm số liên tục y = f(x) đạt CỰC ĐẠI tại x0 là gì?',
    options: [
      'f\'(x0) = 0 là đủ, không cần xét dấu',
      'f\'(x) đổi dấu từ dương (+) sang âm (-) khi đi qua x0',
      'f\'(x) đổi dấu từ âm (-) sang dương (+) khi đi qua x0',
      'f\'\'(x0) > 0',
    ],
    correctIndex: 1,
    solution:
      'Hàm số đi lên (f\' > 0) rồi đi xuống (f\' < 0) khi đi qua x0 sẽ tạo đỉnh cực đại. Nếu đổi dấu từ âm sang dương thì là cực tiểu; nếu không đổi dấu (như y = x^3 tại 0) thì không có cực trị.',
  },
  {
    id: 'math-th-2',
    subject: 'Giải tích & Xác suất',
    topic: 'Giá trị lớn nhất trên đoạn',
    keywords: ['đạo hàm', 'giá trị lớn nhất', 'nhỏ nhất', 'đoạn', 'cực trị'],
    level: 'thong_hieu',
    prompt:
      'Để tìm giá trị lớn nhất của hàm số liên tục f(x) trên đoạn đóng [a; b], ngoài các điểm làm f\'(x) = 0 (hoặc không xác định) thuộc (a; b), ta cần tính thêm giá trị tại đâu?',
    options: [
      'Chỉ cần tính tại trung điểm (a + b) / 2',
      'Tại hai đầu mút x = a và x = b',
      'Tại điểm f\'\'(x) = 0',
      'Không cần tính thêm điểm nào khác',
    ],
    correctIndex: 1,
    solution:
      'Giá trị lớn nhất/nhỏ nhất của hàm liên tục trên đoạn [a; b] có thể đạt tại các điểm dừng bên trong (a; b) hoặc ngay tại hai đầu mút a, b.',
  },
  {
    id: 'math-vdt-1',
    subject: 'Giải tích & Xác suất',
    topic: 'Tìm cực trị hàm bậc ba',
    keywords: ['đạo hàm', 'cực đại', 'cực tiểu', 'hàm số', 'xét dấu'],
    level: 'van_dung_thap',
    prompt: 'Cho hàm số y = x^3 - 3x + 2. Điểm cực tiểu của hàm số này là điểm nào?',
    options: ['x = -1', 'x = 1', 'x = 0', 'x = 2'],
    correctIndex: 1,
    solution:
      'Ta có y\' = 3x^2 - 3 = 0 <=> x = -1 hoặc x = 1. Xét dấu y\': trên (-1; 1) thì y\' < 0, trên (1; +∞) thì y\' > 0. Khi qua x = 1, y\' đổi dấu từ âm sang dương nên x = 1 là điểm cực tiểu (y_CT = 0).',
  },
  {
    id: 'math-vdt-2',
    subject: 'Giải tích & Xác suất',
    topic: 'GTLN - GTNN trên đoạn',
    keywords: ['đạo hàm', 'giá trị lớn nhất', 'đoạn', 'cực trị'],
    level: 'van_dung_thap',
    prompt: 'Giá trị lớn nhất của hàm số f(x) = -x^2 + 4x + 1 trên đoạn [0; 3] bằng bao nhiêu?',
    options: ['1', '4', '5', '6'],
    correctIndex: 2,
    solution:
      'f\'(x) = -2x + 4 = 0 <=> x = 2 ∈ [0; 3]. Tính các giá trị: f(0) = 1, f(2) = -4 + 8 + 1 = 5, f(3) = -9 + 12 + 1 = 4. Vậy max trên [0; 3] là 5.',
  },
  {
    id: 'math-vdt-3',
    subject: 'Giải tích & Xác suất',
    topic: 'Xét khoảng đồng biến',
    keywords: ['đạo hàm', 'đồng biến', 'nghịch biến', 'xét dấu'],
    level: 'van_dung_thap',
    prompt: 'Hàm số y = (1/3)x^3 - 2x^2 + 3x + 1 nghịch biến trên khoảng nào sau đây?',
    options: ['(-∞; 1)', '(1; 3)', '(3; +∞)', '(-∞; 3)'],
    correctIndex: 1,
    solution:
      'y\' = x^2 - 4x + 3. Giải y\' = 0 được x = 1 hoặc x = 3. Hệ số a = 1 > 0 nên y\' < 0 trong khoảng hai nghiệm (1; 3), tức hàm số nghịch biến trên (1; 3).',
  },
  {
    id: 'math-vdc-1',
    subject: 'Giải tích & Xác suất',
    topic: 'Tham số m & Đơn điệu',
    keywords: ['đạo hàm', 'tham số', 'đồng biến', 'cực trị', 'hàm số'],
    level: 'van_dung_cao',
    prompt:
      'Tìm tất cả các giá trị thực của tham số m để hàm số y = x^3 - 3mx^2 + 3(m^2 - 1)x + 2 đạt CỰC ĐẠI tại x = 1.',
    options: ['m = 0', 'm = 2', 'm = 0 hoặc m = 2', 'm = 1'],
    correctIndex: 1,
    solution:
      'Ta có y\' = 3x^2 - 6mx + 3(m^2 - 1) và y\'\' = 6x - 6m. Để x = 1 là cực đại: y\'(1) = 0 <=> 3 - 6m + 3m^2 - 3 = 0 <=> 3m(m - 2) = 0 <=> m = 0 hoặc m = 2. Thử lại với y\'\'(1) = 6 - 6m: tại m = 0 thì y\'\'(1) = 6 > 0 (cực tiểu, loại); tại m = 2 thì y\'\'(1) = -6 < 0 (cực đại, nhận m = 2).',
  },
  {
    id: 'math-vdc-2',
    subject: 'Giải tích & Xác suất',
    topic: 'Tối ưu thực tế bằng đạo hàm',
    keywords: ['đạo hàm', 'cực trị', 'tối ưu', 'giá trị lớn nhất'],
    level: 'van_dung_cao',
    prompt:
      'Một tấm nhôm hình vuông cạnh 12 cm được cắt 4 hình vuông cạnh x ở 4 góc rồi gập lên thành hộp không nắp. Giá trị x (cm) để thể tích hộp lớn nhất là bao nhiêu?',
    options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'],
    correctIndex: 1,
    solution:
      'Đáy hộp có cạnh (12 - 2x) và chiều cao x (điều kiện 0 < x < 6). Thể tích V(x) = x(12 - 2x)^2 = 4x^3 - 48x^2 + 144x. V\'(x) = 12x^2 - 96x + 144 = 12(x - 2)(x - 6) = 0 => x = 2 ∈ (0; 6). Qua x = 2, V\' đổi dấu dương sang âm nên V đạt max tại x = 2 cm.',
  },
];

const LEVEL_WEIGHT_RATIOS: Record<CognitiveLevel, number> = {
  nhan_biet: 0.2,
  thong_hieu: 0.3,
  van_dung_thap: 0.4,
  van_dung_cao: 0.1,
};

const LEVEL_COUNTS_BY_SIZE: Record<5 | 6, Record<CognitiveLevel, number>> = {
  5: {
    nhan_biet: 1,
    thong_hieu: 1,
    van_dung_thap: 2,
    van_dung_cao: 1,
  },
  6: {
    nhan_biet: 1,
    thong_hieu: 2,
    van_dung_thap: 2,
    van_dung_cao: 1,
  },
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Allocates exactly 10.00 points across items following the 20/30/40/10 target
 * ratio per cognitive level, ordered NB -> TH -> VDT -> VDC.
 */
export function allocatePointsForQuestions(questions: BankQuestion[]): AssignmentItem[] {
  const ordered = [...questions].sort(
    (a, b) => COGNITIVE_LEVEL_META[a.level].order - COGNITIVE_LEVEL_META[b.level].order
  );

  if (ordered.length === 0) return [];

  const presentLevels = COGNITIVE_LEVELS.filter((lvl) =>
    ordered.some((q) => q.level === lvl)
  );
  const totalTargetRatio = presentLevels.reduce(
    (sum, lvl) => sum + LEVEL_WEIGHT_RATIOS[lvl],
    0
  );

  const countByLevel: Record<CognitiveLevel, number> = {
    nhan_biet: 0,
    thong_hieu: 0,
    van_dung_thap: 0,
    van_dung_cao: 0,
  };
  for (const q of ordered) {
    countByLevel[q.level] += 1;
  }

  const rawPoints = ordered.map((q) => {
    const levelBudget =
      totalTargetRatio > 0
        ? (LEVEL_WEIGHT_RATIOS[q.level] / totalTargetRatio) * 10
        : 10 / ordered.length;
    const perQuestion = levelBudget / countByLevel[q.level];
    return Math.round(perQuestion * 4) / 4; // 0.25 step precision
  });

  const sumSoFar = rawPoints.reduce((acc, v) => acc + v, 0);
  const diff = round2(10 - sumSoFar);
  if (diff !== 0 && rawPoints.length > 0) {
    rawPoints[rawPoints.length - 1] = round2(
      Math.max(0.25, rawPoints[rawPoints.length - 1] + diff)
    );
  }

  return ordered.map((question, idx) => ({
    question,
    points: rawPoints[idx],
  }));
}

function normalizeVietnamese(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

export function scoreQuestionRelevance(
  question: BankQuestion,
  lessonContent: string,
  subjectFilter?: string
): number {
  const normalizedLesson = normalizeVietnamese(lessonContent);
  let score = 0;

  if (subjectFilter && subjectFilter !== 'All' && question.subject === subjectFilter) {
    score += 50;
  }

  const topicNorm = normalizeVietnamese(question.topic);
  if (normalizedLesson.includes(topicNorm)) {
    score += 30;
  }

  for (const kw of question.keywords) {
    const kwNorm = normalizeVietnamese(kw);
    if (kwNorm && normalizedLesson.includes(kwNorm)) {
      score += 15;
    }
  }

  const promptWords = normalizeVietnamese(question.prompt)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4);
  for (const w of promptWords) {
    if (normalizedLesson.includes(w)) {
      score += 2;
    }
  }

  return score;
}

export function selectQuestionsForLesson(
  bank: BankQuestion[],
  options: {
    lessonContent: string;
    subject?: string;
    questionCount: 5 | 6;
    preferredIds?: string[];
  }
): AssignmentItem[] {
  const counts = LEVEL_COUNTS_BY_SIZE[options.questionCount];
  const preferredSet = new Set(options.preferredIds ?? []);

  const ranked = [...bank]
    .map((q) => ({
      question: q,
      relevance:
        scoreQuestionRelevance(q, options.lessonContent, options.subject) +
        (preferredSet.has(q.id) ? 100 : 0),
    }))
    .sort((a, b) => b.relevance - a.relevance);

  const selected: BankQuestion[] = [];
  const usedIds = new Set<string>();

  for (const level of COGNITIVE_LEVELS) {
    const needed = counts[level];
    const candidates = ranked.filter(
      (item) => item.question.level === level && !usedIds.has(item.question.id)
    );
    for (const candidate of candidates.slice(0, needed)) {
      selected.push(candidate.question);
      usedIds.add(candidate.question.id);
    }
  }

  // Fallback if a custom bank is missing a particular level
  if (selected.length < options.questionCount) {
    for (const candidate of ranked) {
      if (selected.length >= options.questionCount) break;
      if (!usedIds.has(candidate.question.id)) {
        selected.push(candidate.question);
        usedIds.add(candidate.question.id);
      }
    }
  }

  return allocatePointsForQuestions(selected);
}

export function gradeAssignment(
  assignment: Assignment,
  answers: Record<string, number | null>,
  studentMeta: { studentName: string; studentCode?: string }
): SubmissionResult {
  const levelMap = new Map<CognitiveLevel, LevelScoreBreakdown>();
  for (const level of COGNITIVE_LEVELS) {
    const meta = COGNITIVE_LEVEL_META[level];
    levelMap.set(level, {
      level,
      label: meta.label,
      targetPercent: meta.targetPercent,
      earnedPoints: 0,
      maxPoints: 0,
      correctCount: 0,
      totalCount: 0,
    });
  }

  let totalScore = 0;
  let correctCount = 0;

  const itemResults: GradedItemResult[] = assignment.items.map((item) => {
    const selected = answers[item.question.id] ?? null;
    const isCorrect = selected !== null && selected === item.question.correctIndex;
    const earned = isCorrect ? item.points : 0;

    totalScore += earned;
    if (isCorrect) correctCount += 1;

    const bucket = levelMap.get(item.question.level)!;
    bucket.maxPoints = round2(bucket.maxPoints + item.points);
    bucket.earnedPoints = round2(bucket.earnedPoints + earned);
    bucket.totalCount += 1;
    if (isCorrect) bucket.correctCount += 1;

    return {
      questionId: item.question.id,
      level: item.question.level,
      prompt: item.question.prompt,
      options: item.question.options,
      selectedIndex: selected,
      correctIndex: item.question.correctIndex,
      isCorrect,
      earnedPoints: earned,
      maxPoints: item.points,
      solution: item.question.solution,
    };
  });

  const levelBreakdown = COGNITIVE_LEVELS.map((lvl) => levelMap.get(lvl)!).filter(
    (b) => b.totalCount > 0
  );

  return {
    id: `sub-${Date.now()}`,
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    studentName: studentMeta.studentName.trim(),
    studentCode: (studentMeta.studentCode ?? '').trim().toUpperCase(),
    submittedAt: new Date().toISOString(),
    totalScore: round2(totalScore),
    maxScore: round2(assignment.totalPoints),
    correctCount,
    totalQuestions: assignment.items.length,
    levelBreakdown,
    itemResults,
  };
}

interface CompactTokenItem {
  id: string;
  p: number;
  c?: BankQuestion;
}

interface CompactAssignmentToken {
  id: string;
  t: string;
  s: string;
  l: string;
  n: 5 | 6;
  ca: string;
  i: CompactTokenItem[];
}

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 =
    typeof btoa === 'function'
      ? btoa(binary)
      : Buffer.from(bytes).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(token: string): string {
  let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  if (typeof atob === 'function') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

export function encodeAssignmentToken(assignment: Assignment): string {
  const bankIds = new Set(QUESTION_BANK.map((q) => q.id));
  const payload: CompactAssignmentToken = {
    id: assignment.id,
    t: assignment.title,
    s: assignment.subject,
    l: assignment.lessonContent,
    n: assignment.questionCount,
    ca: assignment.createdAt,
    i: assignment.items.map((item) =>
      bankIds.has(item.question.id)
        ? { id: item.question.id, p: item.points }
        : { id: item.question.id, p: item.points, c: item.question }
    ),
  };
  return toBase64Url(JSON.stringify(payload));
}

export function decodeAssignmentToken(
  token: string,
  extraQuestions: BankQuestion[] = []
): Assignment | null {
  try {
    const json = fromBase64Url(token.trim());
    const parsed = JSON.parse(json) as CompactAssignmentToken;
    if (!parsed || !Array.isArray(parsed.i) || parsed.i.length === 0) {
      return null;
    }

    const lookup = new Map<string, BankQuestion>();
    for (const q of QUESTION_BANK) lookup.set(q.id, q);
    for (const q of extraQuestions) lookup.set(q.id, q);

    const items: AssignmentItem[] = [];
    for (const entry of parsed.i) {
      const q = entry.c ?? lookup.get(entry.id);
      if (!q) return null;
      items.push({ question: q, points: entry.p });
    }

    const totalPoints = round2(items.reduce((acc, item) => acc + item.points, 0));

    return {
      id: parsed.id,
      title: parsed.t,
      subject: parsed.s,
      lessonContent: parsed.l,
      questionCount: parsed.n === 5 ? 5 : 6,
      items,
      totalPoints,
      createdAt: parsed.ca,
    };
  } catch {
    return null;
  }
}

export function toQuizPlatformRows(assignment: Assignment) {
  return assignment.items.map((item, idx) => ({
    'STT': idx + 1,
    'Mức độ': COGNITIVE_LEVEL_META[item.question.level].label,
    'Điểm': item.points,
    'Question Text': item.question.prompt,
    'Question Type': 'Multiple Choice',
    'Option 1': item.question.options[0],
    'Option 2': item.question.options[1],
    'Option 3': item.question.options[2],
    'Option 4': item.question.options[3],
    'Correct Answer': item.question.correctIndex + 1,
    'Lời giải chi tiết': item.question.solution,
  }));
}

export function getBankSubjects(bank: BankQuestion[] = QUESTION_BANK): string[] {
  return Array.from(new Set(bank.map((q) => q.subject)));
}
