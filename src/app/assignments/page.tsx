'use client';

import AcademyShell from '@/components/AcademyShell';
import AssignmentCenterView from '@/components/AssignmentCenterView';

export default function AssignmentsPage() {
  return (
    <AcademyShell
      title="Giao bài tập tự động & Link mở"
      subtitle="Kho đề 20/30/40/10"
    >
      <AssignmentCenterView />
    </AcademyShell>
  );
}
