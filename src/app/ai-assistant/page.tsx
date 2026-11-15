'use client';

import AcademyShell from '@/components/AcademyShell';
import GeminiChatPanel from '@/components/GeminiChatPanel';
import { useAcademyWorkspace } from '@/lib/academy-store';

export default function AiAssistantPage() {
  const { classes, trialReports } = useAcademyWorkspace();
  const latestTrial = trialReports[0];
  const contextSummary = latestTrial
    ? `Lớp hệ thống: ${classes.map((c) => c.name).join(', ')} | HS học thử gần nhất: ${latestTrial.studentName} (${latestTrial.subjectAndGrade}) - Chủ đề: ${latestTrial.topic}`
    : `Lớp hệ thống: ${classes.map((c) => c.name).join(', ')}`;

  return (
    <AcademyShell
      title="Trợ lý Sư phạm AI"
      subtitle="Hội thoại đa lượt Gemini"
    >
      <div className="max-w-4xl mx-auto space-y-4">
        <GeminiChatPanel contextSummary={contextSummary} />
      </div>
    </AcademyShell>
  );
}
