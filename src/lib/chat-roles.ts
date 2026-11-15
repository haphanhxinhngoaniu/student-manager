export type GeminiChatModelId = 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';

export type ChatRoleId = 'trial_report_coach' | 'parent_advisor' | 'quick_assistant';

export interface ChatRolePreset {
  id: ChatRoleId;
  label: string;
  shortDesc: string;
  recommendedModel: GeminiChatModelId;
  systemInstruction: string;
  starterPrompts: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelUsed?: GeminiChatModelId;
  createdAt: number;
}

export const CHAT_ROLES: ChatRolePreset[] = [
  {
    id: 'trial_report_coach',
    label: 'Chuyên gia viết Báo cáo học thử',
    shortDesc: 'Chuẩn xưng hô Cô – Con, trau chuốt Điểm sáng & Lộ trình 3–5 buổi',
    recommendedModel: 'gemini-4-hydrogen',
    systemInstruction:
      'Bạn là chuyên gia sư phạm Việt Nam hỗ trợ giáo viên soạn và chỉnh sửa "Báo cáo buổi học thử" cho học sinh mới chưa chốt lớp. Luôn viết xưng hô Cô – Con ấm áp, khách quan, biến lỗi sai thành hướng dẫn khắc phục cụ thể, bám sát cấu trúc 3 phần (I. Tiến độ buổi học, II. Hiệu suất 7 tiêu chí, III. Nhận xét chi tiết & Định hướng lộ trình).',
    starterPrompts: [
      'Viết lại phần "Điểm cần lưu ý" thật khéo léo cho học sinh lớp 5 hay tính nhẩm ẩu và rụt rè tắt mic.',
      'Gợi ý lộ trình 4 tuần cho học sinh mất gốc số thập phân chuẩn bị thi cuối kỳ.',
      'Tóm tắt ngắn gọn báo cáo của con Phương Linh để nhắn qua Zalo cho phụ huynh.',
    ],
  },
  {
    id: 'parent_advisor',
    label: 'Cố vấn tư vấn Phụ huynh',
    shortDesc: 'Soạn tin nhắn Zalo giải đáp băn khoăn học phí, lịch học & chốt lớp thử',
    recommendedModel: 'gemini-4-hydrogen',
    systemInstruction:
      'Bạn là cố vấn tuyển sinh và chăm sóc phụ huynh tinh tế của lớp học. Hãy giúp giáo viên trả lời tin nhắn phụ huynh sau buổi học thử sao cho chân thành, chuyên nghiệp, nhấn mạnh sự tiến bộ có thể đo lường sau 3–5 buổi và gợi ý sắp xếp lịch học phù hợp mà không tạo cảm giác chèo kéo.',
    starterPrompts: [
      'Phụ huynh nhắn "để gia đình suy nghĩ thêm" sau buổi học thử, cô nên nhắn lại thế nào cho khéo?',
      'Soạn tin nhắn gửi kèm file PDF Báo cáo buổi học thử qua Zalo cho mẹ bé Phương Linh.',
      'Giải thích giúp phụ huynh vì sao con phù hợp lớp 1 kèm 1 hơn lớp đông.',
    ],
  },
  {
    id: 'quick_assistant',
    label: 'Trợ lý phản hồi nhanh',
    shortDesc: 'Tốc độ cao: soạn dặn dò BTVN, checklist ôn bài và câu khen nhanh',
    recommendedModel: 'gemini-3.1-flash-lite',
    systemInstruction:
      'Bạn là trợ giảng phản hồi siêu nhanh của lớp học. Trả lời ngắn gọn, súc tích, chia gạch đầu dòng rõ ràng bằng tiếng Việt để giáo viên sử dụng ngay trong lúc dạy hoặc cuối giờ.',
    starterPrompts: [
      'Cho cô 3 bài tập tự luyện 10 phút tại nhà phần nhân nhẩm số thập phân lớp 5.',
      'Soạn nhanh lời dặn dò chuẩn bị trước buổi học chính thức đầu tiên.',
      'Viết 2 câu khen khích lệ học sinh vừa tự suy luận đúng công thức mới.',
    ],
  },
];

export function getChatRolePreset(roleId: ChatRoleId): ChatRolePreset {
  return CHAT_ROLES.find((r) => r.id === roleId) ?? CHAT_ROLES[0];
}

export function buildChatFallbackReply(
  userMessage: string,
  roleId: ChatRoleId,
  history: Array<{ role: 'user' | 'model'; text: string }>,
  contextSummary?: string
): string {
  const preset = getChatRolePreset(roleId);
  const turnCount = history.filter((m) => m.role === 'user').length;
  const cleanMsg = userMessage.trim();
  const contextLine = contextSummary?.trim()
    ? `Dựa trên hồ sơ đang mở (${contextSummary.trim()}), `
    : '';

  if (roleId === 'parent_advisor') {
    return `${contextLine}cô có thể phản hồi phụ huynh theo hướng chân thành và đồng hành như sau (lượt trao đổi #${turnCount + 1}):\n\n"Chào gia đình ạ, cô gửi bố mẹ bản PDF Báo cáo buổi học thử hôm nay của con kèm lộ trình gợi ý 3–5 buổi đầu để con khắc phục điểm còn lúng túng. Gia đình cứ trao đổi thêm với con nhé, nếu cần cô tư vấn kỹ hơn về khung giờ hoặc bài tập làm quen trước khi vào lớp chính thức thì bố mẹ cứ nhắn cô ạ!"`;
  }

  if (roleId === 'quick_assistant') {
    return `${contextLine}gợi ý nhanh theo yêu cầu "${cleanMsg.slice(0, 80)}":\n- Ôn 5 phút: Đặt tính thẳng hàng dấu phẩy và kiểm tra lại kết quả ngược.\n- Luyện 10 phút: Thực hành 8–10 phép nhân/chia nhẩm với 10, 100, 0,1 để tăng phản xạ.\n- Tinh thần: Khích lệ con bật mic trao đổi ngay khi có thắc mắc cùng cô.`;
  }

  return `${contextLine}theo vai trò "${preset.label}", đây là đoạn nhận xét gợi ý bám sát yêu cầu "${cleanMsg.slice(0, 90)}":\n\n"Qua buổi học thử hôm nay, cô ghi nhận con có nền tảng tiếp thu nhanh và thái độ học tập rất nghiêm túc. Về kỹ năng thực hành, con chú ý kiểm tra lại các bước tính nhẩm có nhiều chữ số 0 và mạnh dạn bật mic trao đổi cùng cô để đạt hiệu quả tương tác cao nhất. Với lộ trình 3–5 buổi rèn phương pháp, cô tin con sẽ cải thiện tốc độ và sự tự tin rất rõ rệt!"`;
}

export const EMPTY_CHAT_THREADS: Record<ChatRoleId, ChatMessage[]> = {
  trial_report_coach: [],
  parent_advisor: [],
  quick_assistant: [],
};

export function createChatMessage(
  role: 'user' | 'model',
  text: string,
  modelUsed?: GeminiChatModelId
): ChatMessage {
  const now = Date.now();
  const suffix = Math.random().toString(36).slice(2, 7);
  return {
    id: `${role === 'user' ? 'u' : 'm'}-${now}-${suffix}`,
    role,
    text,
    modelUsed,
    createdAt: now,
  };
}

