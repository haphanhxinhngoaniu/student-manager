export type TrialLeadStatus =
  | 'new_trial'
  | 'sent_parent'
  | 'considering'
  | 'enrolled';

export const TRIAL_LEAD_META: Record<
  TrialLeadStatus,
  { label: string; colorClass: string }
> = {
  new_trial: { label: 'Mới học thử', colorClass: 'text-blue-700 font-medium' },
  sent_parent: { label: 'Đã gửi PH', colorClass: 'text-amber-700 font-medium' },
  considering: { label: 'Đang cân nhắc', colorClass: 'text-slate-700 font-medium' },
  enrolled: { label: 'Đã chốt đăng ký', colorClass: 'text-emerald-700 font-medium' },
};

export interface PerformanceCriterion {
  criterion: string;
  assessment: string;
}

export type TemplateLayoutMode = 'framed_paper' | 'watermark' | 'header_band';

export interface TrialReport {
  id: string;
  classType: string;
  subjectAndGrade: string;
  studentName: string;
  studentSchool: string;
  parentPhone: string;
  teacherName: string;
  studyDate: string; // DD/MM/YYYY
  duration: string;
  sessionStatus: string;
  leadStatus: TrialLeadStatus;
  topic: string;
  teacherQuickNotes: string;
  targetGoal: string;
  progressSummary: string;
  performanceRows: PerformanceCriterion[];
  highlights: string;
  improvements: string;
  roadmapSummary: string;
  roadmapBullets: string[];
  nextLessonPlan: string;
  homePracticeBullets: string[];
  closingEncouragement: string;
  templateId: string;
  sheetOpacity: number; // 0.72 - 1.0
  accentOverride?: string;
  layoutMode?: TemplateLayoutMode;
  brandLogoDataUrl?: string;
  brandTagline?: string;
  updatedAt: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  category: 'clean' | 'reference' | 'uploaded';
  accentColor: string;
  tableHeaderBg: string;
  tableHeaderText: string;
  pageBg: string;
  borderColor: string;
  backgroundImage?: string;
  defaultSheetOpacity: number;
  description: string;
}

export const PERFORMANCE_CRITERIA_LABELS: string[] = [
  '1. Mức độ nắm vững kiến thức',
  '2. Độ chính xác khi làm bài',
  '3. Tốc độ làm bài',
  '4. Mức độ tự làm bài',
  '5. Mức độ tập trung',
  '6. Mức độ tương tác',
  '7. Mức độ tiềm năng',
];

export const CLEAN_DESIGN_TEMPLATES: ReportTemplate[] = [
  {
    id: 'clean-academic-navy',
    name: 'Học thuật Tối giản (Xanh Navy)',
    category: 'clean',
    accentColor: '#1e3a8a',
    tableHeaderBg: '#1e3a8a',
    tableHeaderText: '#ffffff',
    pageBg: '#f8fafc',
    borderColor: '#cbd5e1',
    defaultSheetOpacity: 1,
    description: 'Khung trang trọng, rõ ràng, phù hợp gửi phụ huynh học sinh THCS & Tiểu học.',
  },
  {
    id: 'clean-mint-teal',
    name: 'Bạc hà & Cam Ấm',
    category: 'clean',
    accentColor: '#0f766e',
    tableHeaderBg: '#0d9488',
    tableHeaderText: '#ffffff',
    pageBg: '#ccfbf1',
    borderColor: '#99f6e4',
    defaultSheetOpacity: 0.96,
    description: 'Nền xanh bạc hà dịu mắt kết hợp điểm nhấn bảng nổi bật, tươi sáng.',
  },
  {
    id: 'clean-cream-classic',
    name: 'Bảng Vàng Cổ điển',
    category: 'clean',
    accentColor: '#b91c1c',
    tableHeaderBg: '#15803d',
    tableHeaderText: '#ffffff',
    pageBg: '#fef9c3',
    borderColor: '#fde047',
    defaultSheetOpacity: 0.96,
    description: 'Tông giấy kem ấm áp, thân thiện với phụ huynh khối Tiểu học.',
  },
  {
    id: 'clean-sky-pastel',
    name: 'Bầu trời Pastel Mây nhẹ',
    category: 'clean',
    accentColor: '#0369a1',
    tableHeaderBg: '#0284c7',
    tableHeaderText: '#ffffff',
    pageBg: '#bae6fd',
    borderColor: '#7dd3fc',
    defaultSheetOpacity: 0.95,
    description: 'Khung xanh da trời nhẹ nhàng, tạo cảm giác gần gũi cho buổi học thử.',
  },
  {
    id: 'clean-space-indigo',
    name: 'Khám phá Vũ trụ (Indigo)',
    category: 'clean',
    accentColor: '#1d4ed8',
    tableHeaderBg: '#1e40af',
    tableHeaderText: '#ffffff',
    pageBg: '#1e3a8a',
    borderColor: '#60a5fa',
    defaultSheetOpacity: 0.97,
    description: 'Khung viền xanh thẫm tương phản cao, nổi bật khung giấy báo cáo trắng.',
  },
  {
    id: 'clean-notebook-grid',
    name: 'Giấy Ô Ly Luyện Tập',
    category: 'clean',
    accentColor: '#334155',
    tableHeaderBg: '#334155',
    tableHeaderText: '#ffffff',
    pageBg: '#f1f5f9',
    borderColor: '#94a3b8',
    defaultSheetOpacity: 0.98,
    description: 'Phong cách trang vở sạch sẽ, tối ưu khi in đen trắng hoặc màu.',
  },
];

export const REFERENCE_UPLOADED_TEMPLATES: ReportTemplate[] = [
  {
    id: 'ref-mint-progress',
    name: 'Mẫu 01 · Bạc hà Tiến độ',
    category: 'reference',
    accentColor: '#0f766e',
    tableHeaderBg: '#ea580c',
    tableHeaderText: '#ffffff',
    pageBg: '#ccfbf1',
    borderColor: '#5eead4',
    backgroundImage: '/assets/aistudio/otb-tpl-33283-14d417f3_3081763f.png',
    defaultSheetOpacity: 0.99,
    description: 'Khung nền xanh bạc hà phối bảng tiêu chí cam nổi bật.',
  },
  {
    id: 'ref-cream-activity',
    name: 'Mẫu 02 · Giấy kem Hoạt động',
    category: 'reference',
    accentColor: '#b91c1c',
    tableHeaderBg: '#16a34a',
    tableHeaderText: '#ffffff',
    pageBg: '#fef3c7',
    borderColor: '#f59e0b',
    backgroundImage: '/assets/aistudio/otb-tpl-33453-fb742e65_422f236f.png',
    defaultSheetOpacity: 0.99,
    description: 'Khung bảng kem vàng ấm áp.',
  },
  {
    id: 'ref-sky-kids',
    name: 'Mẫu 03 · Mây xanh & Học sinh',
    category: 'reference',
    accentColor: '#0369a1',
    tableHeaderBg: '#0284c7',
    tableHeaderText: '#ffffff',
    pageBg: '#bae6fd',
    borderColor: '#38bdf8',
    backgroundImage: '/assets/aistudio/Kindergarten-art-lesson-plans-web_5f6c538b.webp',
    defaultSheetOpacity: 0.99,
    description: 'Khung bầu trời xanh nhạt với họa tiết minh họa ở viền.',
  },
  {
    id: 'ref-space-navy',
    name: 'Mẫu 04 · Vũ trụ Xanh Đậm',
    category: 'reference',
    accentColor: '#1e3a8a',
    tableHeaderBg: '#1d4ed8',
    tableHeaderText: '#ffffff',
    pageBg: '#1e3a8a',
    borderColor: '#93c5fd',
    backgroundImage: '/assets/aistudio/283w-iomxTP8k2OY_41ca8886.webp',
    defaultSheetOpacity: 0.99,
    description: 'Viền vũ trụ xanh navy, khung nội dung trắng sắc nét.',
  },
  {
    id: 'ref-olive-rocket',
    name: 'Mẫu 05 · Tên lửa & Sáng tạo',
    category: 'reference',
    accentColor: '#3f6212',
    tableHeaderBg: '#4d7c0f',
    tableHeaderText: '#ffffff',
    pageBg: '#ecfccb',
    borderColor: '#84cc16',
    backgroundImage: '/assets/aistudio/f0d802d56e4acdc23a3754f4dfd8af5d_81aac2ca.jpg',
    defaultSheetOpacity: 0.99,
    description: 'Khung xanh olive với họa tiết bút chì và tên lửa.',
  },
  {
    id: 'ref-pastel-blocks',
    name: 'Mẫu 06 · Khối màu Pastel',
    category: 'reference',
    accentColor: '#4f46e5',
    tableHeaderBg: '#6366f1',
    tableHeaderText: '#ffffff',
    pageBg: '#e0e7ff',
    borderColor: '#a5b4fc',
    backgroundImage: '/assets/aistudio/79759847723abe1a6daf4e68abb772dc_c92e3f54.jpg',
    defaultSheetOpacity: 0.99,
    description: 'Khung viền tím pastel trang nhã cho khối Tiểu học.',
  },
  {
    id: 'ref-minimal-gold',
    name: 'Mẫu 07 · Tối giản Ruy-băng Vàng',
    category: 'reference',
    accentColor: '#1e293b',
    tableHeaderBg: '#ca8a04',
    tableHeaderText: '#ffffff',
    pageBg: '#ffffff',
    borderColor: '#cbd5e1',
    backgroundImage: '/assets/aistudio/images__7__6758051d.jpeg',
    defaultSheetOpacity: 0.99,
    description: 'Nền trắng thanh lịch với điểm nhấn vàng ấm.',
  },
  {
    id: 'ref-navy-gold-assessment',
    name: 'Mẫu 08 · Xanh Đêm & Vàng Nổi Bật',
    category: 'reference',
    accentColor: '#1e3a8a',
    tableHeaderBg: '#ea580c',
    tableHeaderText: '#ffffff',
    pageBg: '#172554',
    borderColor: '#facc15',
    backgroundImage: '/assets/aistudio/otb-tpl-33286-4c7e0a4b_32306e30.png',
    defaultSheetOpacity: 0.99,
    description: 'Nền viền xanh đậm tương phản khung giấy vàng sáng.',
  },
  {
    id: 'ref-beige-reflection',
    name: 'Mẫu 09 · Be Thanh Lịch',
    category: 'reference',
    accentColor: '#44403c',
    tableHeaderBg: '#57534e',
    tableHeaderText: '#ffffff',
    pageBg: '#fafaf9',
    borderColor: '#d6d3d1',
    backgroundImage: '/assets/aistudio/283w-1K-zyjl4Sfc_50d56379.webp',
    defaultSheetOpacity: 0.99,
    description: 'Nền giấy be nhẹ, chữ đậm rõ nét khi in.',
  },
  {
    id: 'ref-coral-tracker',
    name: 'Mẫu 10 · San hô & Bảng Theo Dõi',
    category: 'reference',
    accentColor: '#e11d48',
    tableHeaderBg: '#f43f5e',
    tableHeaderText: '#ffffff',
    pageBg: '#ffe4e6',
    borderColor: '#fda4af',
    backgroundImage: '/assets/aistudio/1131w-uOJ5GnzQ-NY_5ae41f83.webp',
    defaultSheetOpacity: 0.99,
    description: 'Khung hồng san hô tươi tắn cho học sinh tiểu học.',
  },
  {
    id: 'ref-pastel-pink',
    name: 'Mẫu 11 · Hồng Pastel Nhẹ Nhàng',
    category: 'reference',
    accentColor: '#9d174d',
    tableHeaderBg: '#be185d',
    tableHeaderText: '#ffffff',
    pageBg: '#fce7f3',
    borderColor: '#f9a8d4',
    backgroundImage: '/assets/aistudio/14f211fb2b3e96201b891ca2025be936_0b9eda42.jpg',
    defaultSheetOpacity: 0.99,
    description: 'Tông hồng kem dịu dàng, phù hợp học sinh nữ.',
  },
  {
    id: 'ref-ochre-earth',
    name: 'Mẫu 12 · Vàng Đất Ấm Áp',
    category: 'reference',
    accentColor: '#92400e',
    tableHeaderBg: '#b45309',
    tableHeaderText: '#ffffff',
    pageBg: '#fef3c7',
    borderColor: '#d97706',
    backgroundImage: '/assets/aistudio/images__6__a1dd0043.jpeg',
    defaultSheetOpacity: 0.99,
    description: 'Khung nâu vàng đất ấm, phong cách homeschool.',
  },
  {
    id: 'ref-rainbow-sky',
    name: 'Mẫu 13 · Cầu Vồng & Mặt Trời',
    category: 'reference',
    accentColor: '#0284c7',
    tableHeaderBg: '#0ea5e9',
    tableHeaderText: '#ffffff',
    pageBg: '#e0f2fe',
    borderColor: '#7dd3fc',
    backgroundImage: '/assets/aistudio/images__5__916125fa.jpeg',
    defaultSheetOpacity: 0.99,
    description: 'Viền cầu vồng năng lượng tích cực.',
  },
  {
    id: 'ref-confetti-report',
    name: 'Mẫu 14 · Pháo Giấy Tươi Vui',
    category: 'reference',
    accentColor: '#7e22ce',
    tableHeaderBg: '#7c3aed',
    tableHeaderText: '#ffffff',
    pageBg: '#ffffff',
    borderColor: '#c4b5fd',
    backgroundImage: '/assets/aistudio/images__4__4df3d728.jpeg',
    defaultSheetOpacity: 0.99,
    description: 'Viền confetti nhiều màu trên nền trắng sạch.',
  },
  {
    id: 'ref-space-purple',
    name: 'Mẫu 15 · Phi Thuyền & Hành Tinh',
    category: 'reference',
    accentColor: '#4338ca',
    tableHeaderBg: '#d97706',
    tableHeaderText: '#ffffff',
    pageBg: '#fef9c3',
    borderColor: '#818cf8',
    backgroundImage: '/assets/aistudio/images__3__cd6afb13.jpeg',
    defaultSheetOpacity: 0.99,
    description: 'Khung phi thuyền khám phá kiến thức mới.',
  },
  {
    id: 'ref-pastel-art',
    name: 'Mẫu 16 · Học Cụ & Màu Nước',
    category: 'reference',
    accentColor: '#db2777',
    tableHeaderBg: '#d97706',
    tableHeaderText: '#ffffff',
    pageBg: '#ffffff',
    borderColor: '#f472b6',
    backgroundImage: '/assets/aistudio/images__2__0654e7b9.jpeg',
    defaultSheetOpacity: 0.99,
    description: 'Viền dụng cụ học tập sinh động.',
  },
  {
    id: 'ref-amber-terracotta',
    name: 'Mẫu 17 · Cam Đất & Bút Chì',
    category: 'reference',
    accentColor: '#9a3412',
    tableHeaderBg: '#c2410c',
    tableHeaderText: '#ffffff',
    pageBg: '#ffedd5',
    borderColor: '#fb923c',
    backgroundImage: '/assets/aistudio/images__1__e712a417.jpeg',
    defaultSheetOpacity: 0.99,
    description: 'Nền cam ấm phối bảng vàng sạch sẽ.',
  },
  {
    id: 'ref-ocean-wave',
    name: 'Mẫu 18 · Sóng Xanh Học Đường',
    category: 'reference',
    accentColor: '#1e3a8a',
    tableHeaderBg: '#1d4ed8',
    tableHeaderText: '#ffffff',
    pageBg: '#dbeafe',
    borderColor: '#60a5fa',
    backgroundImage: '/assets/aistudio/1131w-btNPtxEqHj8_70f86866.webp',
    defaultSheetOpacity: 0.99,
    description: 'Tông xanh học đường tin cậy.',
  },
  {
    id: 'ref-summer-bee',
    name: 'Mẫu 19 · Chú Ong Chăm Chỉ',
    category: 'reference',
    accentColor: '#1e3a8a',
    tableHeaderBg: '#1e40af',
    tableHeaderText: '#ffffff',
    pageBg: '#ffffff',
    borderColor: '#86efac',
    backgroundImage: '/assets/aistudio/images_1ce50825.jpeg',
    defaultSheetOpacity: 0.94,
    description: 'Nền trắng thanh thoát với viền xanh lá nhẹ.',
  },
  {
    id: 'ref-rocket-cosmos',
    name: 'Mẫu 20 · Tên Lửa Vũ Trụ',
    category: 'reference',
    accentColor: '#1e3a8a',
    tableHeaderBg: '#0f172a',
    tableHeaderText: '#ffffff',
    pageBg: '#1e293b',
    borderColor: '#fde047',
    backgroundImage: '/assets/aistudio/1131w-OMxa-oduqbM_43e64550.webp',
    defaultSheetOpacity: 0.99,
    description: 'Viền vũ trụ rực rỡ bao quanh trang giấy kem.',
  },
  {
    id: 'ref-polka-dots',
    name: 'Mẫu 21 · Chấm Bi Pastel',
    category: 'reference',
    accentColor: '#0369a1',
    tableHeaderBg: '#0284c7',
    tableHeaderText: '#ffffff',
    pageBg: '#e0f2fe',
    borderColor: '#7dd3fc',
    backgroundImage: '/assets/aistudio/566w-rUZlw0yCvdo_869266d1.webp',
    defaultSheetOpacity: 0.95,
    description: 'Nền chấm bi xanh nhẹ tinh tế.',
  },
  {
    id: 'ref-grid-paper',
    name: 'Mẫu 22 · Vở Ô Ly & Bóng Đèn',
    category: 'reference',
    accentColor: '#1e3a8a',
    tableHeaderBg: '#1d4ed8',
    tableHeaderText: '#ffffff',
    pageBg: '#ffffff',
    borderColor: '#93c5fd',
    backgroundImage: '/assets/aistudio/1131w-l7ApndA0lNw_07dfeb1a.webp',
    defaultSheetOpacity: 0.94,
    description: 'Nền giấy kẻ ô ly với họa tiết học tập.',
  },
];

export const BUILT_IN_TEMPLATES: ReportTemplate[] = [
  ...CLEAN_DESIGN_TEMPLATES,
  ...REFERENCE_UPLOADED_TEMPLATES,
];

export const INITIAL_TRIAL_REPORTS: TrialReport[] = [
  {
    id: 'trial-phuong-linh',
    classType: 'Lớp 1 kèm 1',
    subjectAndGrade: 'Toán (Lớp 5)',
    studentName: 'Phương Linh',
    studentSchool: 'trường Tiểu học Võ Thị Sáu, Bạch Mai',
    parentPhone: '0916882244',
    teacherName: 'Phương Anh',
    studyDate: '14/11/2026',
    duration: '~60 phút',
    sessionStatus: 'Đã kết thúc',
    leadStatus: 'sent_parent',
    topic:
      'Ôn tập số thập phân (cộng, trừ, nhân) · Nhân nhẩm với 10, 100, 1000 và 0,1; 0,01; 0,001',
    teacherQuickNotes:
      'Con nắm chắc cộng trừ số thập phân, tự đoán đúng quy tắc nhân với 0,1 trước khi cô giảng. Còn hơi chậm ở phép trừ có nhớ qua 10 và đôi lúc dịch nhầm hàng chữ số 0 khi nhân nhẩm. Tập trung tốt, hơi rụt rè và có lúc tắt mic. Mục tiêu thi vào lớp 6 CLC.',
    targetGoal:
      'Lộ trình học 1 kèm 1 nâng cao hướng tới mục tiêu thi vào lớp 6 các trường chất lượng cao',
    progressSummary:
      'Cô đã ôn nhanh cho con kiến thức cũ qua trắc nghiệm: cộng trừ số thập phân; vận dụng tính diện tích hình chữ nhật. Dạng mới: Nhân nhẩm với 10, 100, 1000 (dấu phẩy lùi sang phải, thêm số 0 cho đủ hàng) và nhân nhẩm với 0,1; 0,01; 0,001 (dấu phẩy lùi sang trái, thêm số 0 phía trước). So sánh nhanh bằng tính chất nhân/chia nhẩm để chuẩn bị cho phép chia nhanh buổi học sau.',
    performanceRows: [
      {
        criterion: '1. Mức độ nắm vững kiến thức',
        assessment:
          'Cộng trừ số thập phân nắm chắc; nhân nhẩm nắm rất nhanh ngay buổi đầu tiếp cận',
      },
      {
        criterion: '2. Độ chính xác khi làm bài',
        assessment:
          'Các phép tính cơ bản đúng; vẫn còn nhầm khi số có nhiều chữ số 0 hoặc phải lùi dấu phẩy xa',
      },
      {
        criterion: '3. Tốc độ làm bài',
        assessment:
          'Nhân nhẩm đạt tốc độ khá; phép nhân dài và phép trừ có nhớ còn tính chậm',
      },
      {
        criterion: '4. Mức độ tự làm bài',
        assessment:
          'Tự làm được đa số bài tập; chỉ cần gợi ý ở phép trừ có nhớ và dạng nhẩm mới',
      },
      {
        criterion: '5. Mức độ tập trung',
        assessment: 'Tập trung tốt, theo sát bài, chép bài đầy đủ khi được yêu cầu',
      },
      {
        criterion: '6. Mức độ tương tác',
        assessment:
          'Trả lời khi được hỏi; hơi rụt rè, thiếu tự tin khi phát biểu; có lúc tắt mic',
      },
      {
        criterion: '7. Mức độ tiềm năng',
        assessment:
          'Tư duy tốt — tự đoán đúng quy tắc nhân với 0,1 trước khi được dạy; rất phù hợp lộ trình nâng cao, hướng thi vào lớp 6 chất lượng cao',
      },
    ],
    highlights:
      'Con có khả năng tiếp thu bài nhanh và tư duy toán học nhạy bén. Dù chưa được học trước trên lớp, con đã tự suy luận đúng quy tắc dịch chuyển dấu phẩy sang trái khi nhân nhẩm số thập phân. Con nắm chắc quy tắc cộng, trừ số thập phân, đặt tính thẳng hàng dấu phẩy và đọc kết quả rõ ràng. Ở phép nhân nhiều chữ số, con thực hiện tốt các bước tính tích riêng khi được gợi ý và tinh ý phát hiện được lỗi đặt tính lệch hàng. Buổi đầu nhưng con học tập trung, ngoan ngoãn và ngày càng tự tin, cởi mở hơn khi được cô khích lệ.',
    improvements:
      'Về kỹ năng tính toán nền tảng, con cần rèn thêm phản xạ trừ có nhớ qua 10 bằng phương pháp tách số để tính nhanh và chắc chắn hơn. Ở phần nhân nhẩm, con chú ý đếm kỹ số chữ số để tránh dịch nhầm hàng khi nhân với số tròn nghìn hoặc số thập phân nhỏ. Khi áp dụng công thức hình học, con nên liên hệ trực tiếp với dữ kiện và tên các cạnh trong đề bài thay vì nhớ máy móc. Bên cạnh đó, con hãy tự tin vào kết quả mình đã tính, mạnh dạn trao đổi và duy trì bật mic xuyên suốt buổi học để tương tác với cô hiệu quả nhất.',
    roadmapSummary:
      'Qua buổi học thử, cô đánh giá con có tố chất tốt, rất phù hợp với lộ trình học 1 kèm 1 nâng cao hướng tới mục tiêu thi vào lớp 6 các trường chất lượng cao:',
    roadmapBullets: [
      'Con có lợi thế khi tiếp thu dạng bài mới nhanh và đang đi trước chương trình trên lớp ở phép chia số thập phân.',
      'Khả năng tự khái quát quy tắc và tư duy logic của con là nền tảng thuận lợi để phát triển các chuyên đề toán tư duy sâu.',
      'Những điểm con còn lúng túng hôm nay (phản xạ tính nhẩm qua 10, kỹ năng đếm dấu phẩy hay tâm lý ngập ngừng) hầu hết là do cách học chứ không phải con hổng kiến thức; và hoàn toàn có thể khắc phục sau 3–5 buổi rèn luyện có phương pháp.',
    ],
    nextLessonPlan:
      'Con sẽ hoàn thiện các dạng chia số thập phân còn lại và học quy tắc chia nhanh cho 10; 100; 1000 cũng như cho 0,1; 0,01; 0,001.',
    homePracticeBullets: [
      'Dành 5–10 phút mỗi ngày luyện 10–15 phép tính nhân nhẩm hai chiều (có thể tự đặt đề và tự tính để rèn phản xạ).',
      'Ôn tập phương pháp tách số ở các phép trừ có nhớ qua 10 để tăng tốc độ tính nháp.',
      'Đọc trước bài phép chia số thập phân trong sách giáo khoa.',
    ],
    closingEncouragement:
      'Cô tin rằng với tư duy sẵn có, chỉ cần con rèn luyện đều đặn và tự tin hơn vào bản thân, con hoàn toàn đủ khả năng chinh phục mục tiêu điểm số đã đặt ra, thậm chí là cả các trường chất lượng cao!',
    templateId: 'clean-academic-navy',
    sheetOpacity: 0.96,
    updatedAt: 1731600000000,
  },
  {
    id: 'trial-minh-khoi',
    classType: 'Lớp nhóm 1 kèm 3',
    subjectAndGrade: 'Toán Tư Duy (Lớp 6)',
    studentName: 'Hoàng Minh Khôi',
    studentSchool: 'trường THCS Cầu Giấy',
    parentPhone: '0984123789',
    teacherName: 'Phương Anh',
    studyDate: '15/11/2026',
    duration: '~60 phút',
    sessionStatus: 'Đã kết thúc',
    leadStatus: 'new_trial',
    topic: 'Ước chung lớn nhất (ƯCLN) & Bài toán chia nhóm ứng dụng thực tế',
    teacherQuickNotes:
      'Con thông minh, bật ý tưởng nhanh nhưng trình bày nháp hơi ẩu, dễ sót bước kết luận cuối bài toán có lời văn.',
    targetGoal:
      'Củng cố nền tảng Đại số 6 vững chắc và rèn kỹ năng trình bày bài tự luận đạt điểm tối đa',
    progressSummary:
      'Cô đã kiểm tra nhanh phản xạ phân tích thừa số nguyên tố của con qua 4 bài khởi động. Sau đó cô hướng dẫn con cách nhận diện từ khóa chia đều trong đề bài thực tế để thiết lập điều kiện tìm ƯCLN và đối chiếu điều kiện chặt chẽ.',
    performanceRows: [
      {
        criterion: '1. Mức độ nắm vững kiến thức',
        assessment: 'Hiểu bản chất phân tích thừa số nguyên tố; nắm được cách lập luận tìm ƯCLN',
      },
      {
        criterion: '2. Độ chính xác khi làm bài',
        assessment: 'Ý tưởng đúng nhưng hay tính nhầm ở bước chia cột dọc hoặc sót điều kiện',
      },
      {
        criterion: '3. Tốc độ làm bài',
        assessment: 'Tốc độ đọc hiểu đề và định hướng cách giải rất nhanh',
      },
      {
        criterion: '4. Mức độ tự làm bài',
        assessment: 'Tự giải quyết tốt 80% bài tập mẫu, chỉ cần nhắc ở bước kiểm tra đáp số',
      },
      {
        criterion: '5. Mức độ tập trung',
        assessment: 'Chăm chú nghe giảng, nhiệt tình theo dõi bảng',
      },
      {
        criterion: '6. Mức độ tương tác',
        assessment: 'Chủ động trao đổi cùng cô, mạnh dạn nêu cách nghĩ riêng',
      },
      {
        criterion: '7. Mức độ tiềm năng',
        assessment: 'Tư duy nhạy, có nền tảng tốt để rèn kỹ năng trình bày đạt điểm 9–10',
      },
    ],
    highlights:
      'Con có tốc độ tư duy nhanh và phản xạ tốt với các bài toán đố thực tế. Khi cô gợi mở hướng phân tích dữ kiện, con nhanh chóng nhận ra mối liên hệ giữa số nhóm chia được và ước chung của các số đã cho. Tinh thần học buổi đầu rất cởi mở, hợp tác.',
    improvements:
      'Con cần viết nháp thành hàng lối rõ ràng hơn, tránh tính nhẩm tắt ở các phép chia nhiều chữ số để hạn chế sai số đáng tiếc. Ở cuối mỗi bài toán có lời văn, con tập thói quen rà lại câu hỏi và ghi đầy đủ đơn vị cũng như câu kết luận.',
    roadmapSummary:
      'Qua buổi học thử, cô nhận thấy con hoàn toàn phù hợp để theo lộ trình rèn tư duy kết hợp chuẩn hóa trình bày:',
    roadmapBullets: [
      'Con không ngại bài khó và tiếp cận nhanh phương pháp lập luận mới.',
      'Chỉ cần điều chỉnh thói quen trình bày từng bước và kiểm tra ngược đáp số trong 3–4 buổi đầu, độ chính xác của con sẽ tăng rõ rệt.',
      'Sau khi vững phần số học, cô sẽ lồng ghép thêm dạng toán nâng cao tìm x và chia hết.',
    ],
    nextLessonPlan:
      'Con sẽ luyện tổng hợp bài toán phân biệt giữa ƯCLN và BCNN qua các đề kiểm tra giữa kỳ trọng tâm.',
    homePracticeBullets: [
      'Hoàn thành 4 bài toán có lời văn trong phiếu ôn tập buổi thử, trình bày đủ 3 bước: gọi ẩn – lập luận – kết luận.',
      'Kiểm tra lại phép chia nhẩm bằng cách nhân ngược trước khi chốt đáp số.',
    ],
    closingEncouragement:
      'Cô rất ấn tượng với sự nhanh nhạy của con hôm nay. Chỉ cần cẩn thận hơn một chút ở khâu trình bày, con chắc chắn sẽ bứt phá điểm số rất nhanh trong kỳ này!',
    templateId: 'clean-mint-teal',
    sheetOpacity: 0.96,
    updatedAt: 1731686400000,
  },
];

export interface TrialReportDraftInput {
  classType: string;
  subjectAndGrade: string;
  studentName: string;
  studentSchool: string;
  teacherName: string;
  studyDate: string;
  duration: string;
  topic: string;
  teacherQuickNotes: string;
  targetGoal: string;
}

export function generateTrialReportFallback(
  input: TrialReportDraftInput
): Pick<
  TrialReport,
  | 'progressSummary'
  | 'performanceRows'
  | 'highlights'
  | 'improvements'
  | 'roadmapSummary'
  | 'roadmapBullets'
  | 'nextLessonPlan'
  | 'homePracticeBullets'
  | 'closingEncouragement'
> {
  const student = input.studentName.trim() || 'con';
  const topic = input.topic.trim() || 'Chuyên đề trọng tâm trong buổi học thử';
  const notes = input.teacherQuickNotes.trim();
  const goal =
    input.targetGoal.trim() ||
    'lộ trình cá nhân hóa giúp con vững nền tảng và bứt phá điểm số';
  const classType = input.classType.trim() || 'Lớp 1 kèm 1';

  const hasFastThinking = /nhanh|tốt|nhạy|thông minh|chắc|hiểu bài/i.test(notes);
  const hasShyNote = /rụt rè|tắt mic|ngập ngừng|nhút nhát|ít nói/i.test(notes);
  const hasCalcSlip = /nhầm|sai|chậm|ẩu|có nhớ|dấu phẩy|quên|sót/i.test(notes);

  const progressSummary = notes
    ? `Cô đã khởi động cùng con bằng phần kiểm tra nhanh kiến thức nền trước khi đi sâu vào chủ đề "${topic}". Trong buổi học, cô hướng dẫn con từng bước nhận diện bản chất dạng bài, luyện thực hành ngay tại lớp và đối chiếu lỗi hay gặp dựa trên ghi nhận thực tế: ${notes.replace(/\.$/, '')}. Cuối buổi, cô giúp con hệ thống lại quy tắc cốt lõi để sẵn sàng cho bước nâng cao ở buổi học tới.`
    : `Cô đã ôn tập nhanh kiến thức nền tảng có liên quan và dẫn dắt con tiếp cận chủ đề "${topic}" thông qua hệ thống ví dụ từ cơ bản đến vận dụng. Con được thực hành giải bài trực tiếp dưới sự hướng dẫn sát sao của cô, rèn cách đọc kỹ dữ kiện và tóm tắt quy tắc ghi nhớ ngay trong buổi học.`;

  const performanceRows: PerformanceCriterion[] = [
    {
      criterion: PERFORMANCE_CRITERIA_LABELS[0],
      assessment: hasFastThinking
        ? `Nắm chắc phần kiến thức nền; tiếp cận dạng mới trong "${topic}" rất nhanh ngay từ ví dụ đầu`
        : `Hiểu được ý chính của bài "${topic}" khi được cô giảng giải từng bước cụ thể`,
    },
    {
      criterion: PERFORMANCE_CRITERIA_LABELS[1],
      assessment: hasCalcSlip
        ? 'Các câu cơ bản làm đúng; đôi chỗ còn nhầm nhẹ ở bước tính nhẩm hoặc biến đổi nhiều bước'
        : 'Đạt độ chính xác khá tốt ở các bài thực hành mẫu và vận dụng cơ bản',
    },
    {
      criterion: PERFORMANCE_CRITERIA_LABELS[2],
      assessment: hasCalcSlip
        ? 'Tốc độ hiểu đề ổn; khâu tính toán chi tiết và trình bày nháp cần rèn thêm để nhanh hơn'
        : 'Tốc độ làm bài ổn định, bắt nhịp tốt với tiến độ giảng bài trên lớp',
    },
    {
      criterion: PERFORMANCE_CRITERIA_LABELS[3],
      assessment:
        'Tự giải quyết được phần lớn bài tập cơ bản; chỉ cần cô gợi mở nhẹ ở ý hỏi nâng cao',
    },
    {
      criterion: PERFORMANCE_CRITERIA_LABELS[4],
      assessment:
        'Tập trung tốt, theo sát mạch bài giảng và ghi chép đầy đủ nội dung trọng tâm',
    },
    {
      criterion: PERFORMANCE_CRITERIA_LABELS[5],
      assessment: hasShyNote
        ? 'Trả lời đúng khi cô gọi; buổi đầu còn hơi rụt rè khi chủ động phát biểu và cần duy trì bật mic'
        : 'Tương tác tích cực, hợp tác cùng cô trong suốt thời lượng buổi học',
    },
    {
      criterion: PERFORMANCE_CRITERIA_LABELS[6],
      assessment: `Tư duy logic tốt — phù hợp với ${goal.toLowerCase()}`,
    },
  ];

  const highlights = `Trong buổi học thử chủ đề "${topic}", con ${student} thể hiện thái độ học tập nghiêm túc, ngoan ngoãn và khả năng tiếp nhận hướng dẫn rất tích cực. ${
    notes
      ? `Cô ghi nhận điểm sáng rõ nét ở con qua buổi học: ${notes.replace(/\.$/, '')}. `
      : 'Con nắm được tinh thần phương pháp học mới, biết lắng nghe gợi ý của cô để tự điều chỉnh lời giải ngay trên lớp. '
  }Buổi đầu làm quen nhưng con theo kịp nhịp giảng, hoàn thành trọn vẹn các ví dụ thực hành và ngày càng cởi mở hơn khi được cô khích lệ.`;

  const improvements = `${
    hasCalcSlip
      ? 'Về kỹ năng thực hành, con cần chú ý rèn thêm thói quen rà soát kỹ từng bước tính nháp và đối chiếu điều kiện đề bài để tránh sai sót đáng tiếc ở các bước chuyển tiếp. '
      : 'Để làm bài chắc chắn hơn nữa, con nên tập thói quen tóm tắt dữ kiện ra nháp trước khi bắt tay vào giải để giữ mạch lập luận thật gọn. '
  }${
    hasShyNote
      ? 'Bên cạnh đó, con hãy mạnh dạn tin tưởng vào đáp số mình vừa tìm ra, chủ động trao đổi ngay với cô và duy trì bật mic xuyên suốt buổi học để tương tác hiệu quả nhất.'
      : 'Con duy trì thói quen tự kiểm tra lại phép tính sau mỗi bài làm hoàn chỉnh để tối ưu độ chính xác khi bước vào bài kiểm tra thật.'
  }`;

  const roadmapSummary = `Qua buổi học thử, cô đánh giá con ${student} có nền tảng nhận thức tốt, rất phù hợp với ${classType.toLowerCase()} theo ${goal}:`;

  const roadmapBullets = [
    `Con tiếp cận nhanh với phương pháp phân tích dạng bài mới trong chuyên đề "${topic}".`,
    'Tư duy trực quan và khả năng sửa lỗi ngay khi được gợi mở là lợi thế giúp con tiến bộ rõ rệt khi học sát 1-1 hoặc nhóm nhỏ.',
    'Những điểm con còn ngập ngừng trong buổi thử chủ yếu đến từ thói quen làm bài và phản xạ nhẩm, hoàn toàn có thể khắc phục vững vàng sau 3–5 buổi rèn luyện đúng phương pháp.',
  ];

  const nextLessonPlan = `Con sẽ củng cố hoàn chỉnh dạng bài "${topic}", thực hành nhóm bài tập phân hóa theo mức độ và mở rộng sang dạng vận dụng kế tiếp trong chương trình ${input.subjectAndGrade || 'chính khóa'}.`;

  const homePracticeBullets = [
    `Dành 10 phút mỗi ngày ôn lại quy tắc trọng tâm của bài "${topic}" và tự làm lại 3–5 ví dụ tiêu biểu trong vở ghi.`,
    'Rèn kỹ năng viết nháp thẳng hàng, kiểm tra ngược kết quả sau khi tính toán xong.',
    'Xem trước nội dung bài kế tiếp trong sách giáo khoa để chủ động hơn khi trao đổi cùng cô.',
  ];

  const closingEncouragement = `Cô tin rằng với tinh thần ham học và nền tảng tư duy sẵn có, chỉ cần con luyện tập đều đặn và tự tin hơn vào bản thân, con ${student} hoàn toàn đủ khả năng bứt phá và đạt kết quả xuất sắc như gia đình kỳ vọng!`;

  return {
    progressSummary,
    performanceRows,
    highlights,
    improvements,
    roadmapSummary,
    roadmapBullets,
    nextLessonPlan,
    homePracticeBullets,
    closingEncouragement,
  };
}

export function formatTrialReportPlainText(report: TrialReport): string {
  const perfLines = report.performanceRows
    .map((row) => `${row.criterion}: ${row.assessment}`)
    .join('\n');
  const roadmapLines = report.roadmapBullets.map((b) => `- ${b}`).join('\n');
  const homeLines = report.homePracticeBullets.map((b) => `- ${b}`).join('\n');

  return [
    'BÁO CÁO BUỔI HỌC THỬ',
    'Thông tin lớp học',
    `Loại lớp học: ${report.classType}`,
    `Môn: ${report.subjectAndGrade}`,
    `Học sinh: ${report.studentName}${report.studentSchool ? ` (${report.studentSchool})` : ''}`,
    `Giáo viên: ${report.teacherName}`,
    `Ngày học: ${report.studyDate}`,
    `Thời lượng: ${report.duration}`,
    `Trạng thái: ${report.sessionStatus}`,
    `Chủ đề buổi học: ${report.topic}`,
    '',
    'I. TIẾN ĐỘ BUỔI HỌC',
    report.progressSummary,
    '',
    'II. HIỆU SUẤT BUỔI HỌC THỬ',
    perfLines,
    '',
    'III. NHẬN XÉT CHI TIẾT',
    '1. Đánh giá cụ thể',
    `Điểm sáng: ${report.highlights}`,
    `Điểm cần lưu ý: ${report.improvements}`,
    '2. Đánh giá năng lực & Định hướng lộ trình',
    report.roadmapSummary,
    roadmapLines,
    '3. Kế hoạch buổi tới & Dặn dò tự học',
    `Nội dung buổi tới: ${report.nextLessonPlan}`,
    'Dặn dò con rèn luyện tại nhà:',
    homeLines,
    report.closingEncouragement,
  ].join('\n');
}

export function buildTrialReportPdfFilename(
  studentName: string,
  studyDate: string
): string {
  const asciiStudent = studentName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const safeDate = studyDate.trim().replace(/[^0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const parts = ['Bao-cao-hoc-thu', asciiStudent || 'Hoc-sinh', safeDate || 'A4'];
  return `${parts.join('-')}.pdf`;
}

export interface A4PaginationPlan {
  pageCount: number;
  scaledHeightMm: number;
  a4WidthMm: number;
  a4HeightMm: number;
}

export function computeA4Pagination(
  imgWidthPx: number,
  imgHeightPx: number
): A4PaginationPlan {
  const a4WidthMm = 210;
  const a4HeightMm = 297;
  if (imgWidthPx <= 0 || imgHeightPx <= 0) {
    return { pageCount: 1, scaledHeightMm: a4HeightMm, a4WidthMm, a4HeightMm };
  }
  const scaledHeightMm = (imgHeightPx * a4WidthMm) / imgWidthPx;
  const pageCount = Math.max(1, Math.ceil((scaledHeightMm - 2) / a4HeightMm));
  return {
    pageCount,
    scaledHeightMm,
    a4WidthMm,
    a4HeightMm,
  };
}

