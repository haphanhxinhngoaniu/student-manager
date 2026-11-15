import { Suspense } from 'react';
import OpenQuizRunner from '@/components/OpenQuizRunner';

export default function OpenQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <p className="text-sm text-slate-600">Đang mở phiếu bài tập trực tuyến...</p>
        </div>
      }
    >
      <OpenQuizRunner />
    </Suspense>
  );
}
