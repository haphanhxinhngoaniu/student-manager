'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileCheck2,
  FileText,
  GraduationCap,
  History,
  Menu,
  MessageSquareText,
  Mic,
  QrCode,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useAcademyWorkspace } from '@/lib/academy-store';

export interface AcademyShellProps {
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
  children: ReactNode;
}

const NAV_ITEMS = [
  { href: '/attendance', label: 'Điểm danh & Nhận xét', icon: ClipboardCheck },
  { href: '/trial-reports', label: 'Báo cáo học thử', icon: FileText },
  { href: '/classes', label: 'Lớp học & Học sinh', icon: BookOpen },
  { href: '/history', label: 'Lịch sử bài giảng', icon: History },
  { href: '/analytics', label: 'Thống kê & Ma trận', icon: BarChart3 },
  { href: '/tuition', label: 'Học phí & VietQR', icon: QrCode },
  { href: '/ai-recorder', label: 'AI Ghi âm buổi học', icon: Mic },
  { href: '/ai-assistant', label: 'Trợ lý Chat AI', icon: MessageSquareText },
  { href: '/assignments', label: 'Giao bài tập', icon: FileCheck2 },
  { href: '/', label: 'Hồ sơ & Điểm danh QR', icon: Users },
  { href: '/settings', label: 'Cài đặt & Trợ giảng', icon: Settings },
];

export default function AcademyShell({
  title,
  subtitle = 'Quản lý giảng dạy',
  headerActions,
  children,
}: AcademyShellProps) {
  const pathname = usePathname();
  const { settings, switchRole } = useAcademyWorkspace();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderNavLinks = (isMobile = false) =>
    NAV_ITEMS.map((item) => {
      const Icon = item.icon;
      const active =
        item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={isMobile ? () => setMobileOpen(false) : undefined}
          aria-current={active ? 'page' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            active
              ? 'bg-blue-50 text-blue-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span>{item.label}</span>
        </Link>
      );
    });

  const renderRolePanel = () => (
    <div className="mx-3 mt-3 mb-14 pt-3 border-t border-slate-200 px-2 space-y-2.5">
      <div className="text-xs">
        <p className="text-slate-500">Đang thao tác với vai trò</p>
        <p className="mt-0.5 font-semibold text-slate-900 truncate">
          {settings.currentUserName}
        </p>
        <p className="text-slate-600">
          {settings.currentRole === 'teacher'
            ? 'Giáo viên (Toàn quyền)'
            : 'Trợ giảng (Nhập liệu)'}
        </p>
      </div>
      <div
        role="group"
        aria-label="Chuyển đổi vai trò thao tác"
        className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-md"
      >
        <button
          type="button"
          onClick={() => switchRole('teacher')}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            settings.currentRole === 'teacher'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Giáo viên
        </button>
        <button
          type="button"
          onClick={() => switchRole('assistant')}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            settings.currentRole === 'assistant'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Trợ giảng
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden lg:flex lg:w-64 lg:flex-col lg:shrink-0 bg-white border-r border-slate-200">
        <div className="h-16 px-5 flex items-center gap-2.5 border-b border-slate-200">
          <GraduationCap className="w-5 h-5 text-blue-700 shrink-0" />
          <span
            className="text-base font-bold tracking-tight text-slate-900 truncate"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {settings.schoolName || 'Student Manager'}
          </span>
        </div>

        <nav aria-label="Primary navigation" className="p-3 space-y-1">
          {renderNavLinks(false)}
        </nav>

        {renderRolePanel()}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="no-print fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-full bg-white border-r border-slate-200 flex flex-col z-50 overflow-y-auto">
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <GraduationCap className="w-5 h-5 text-blue-700 shrink-0" />
                <span
                  className="text-sm font-bold text-slate-900 truncate"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {settings.schoolName || 'Student Manager'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Đóng menu điều hướng"
                className="p-2 text-slate-500 hover:text-slate-900 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="p-3 space-y-1">
              {renderNavLinks(true)}
            </nav>

            {renderRolePanel()}
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="no-print h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu điều hướng"
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-500 hidden sm:inline whitespace-nowrap">
                {subtitle}
              </span>
              <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <h1
                className="text-base font-semibold text-slate-900 truncate"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {title}
              </h1>
            </div>
          </div>

          {headerActions && (
            <div className="flex items-center gap-2 shrink-0">{headerActions}</div>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
