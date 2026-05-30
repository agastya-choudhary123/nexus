'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';
import { handleSignOut } from '@/lib/auth/actions';

export function DashboardShell({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard/chat', label: 'Chat', icon: '💬' },
    { href: '/dashboard/registry', label: 'Registry', icon: '🔌' },
    { href: '/dashboard/permissions', label: 'Permissions', icon: '🔒' },
    { href: '/dashboard/logs', label: 'Logs', icon: '📋' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Nexus</h1>
          <p className="text-sm text-slate-500">Agentic Control Plane</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="border-t border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-3">
            <div className="font-semibold text-slate-900">{session?.user?.name}</div>
            <div className="text-xs">{session?.user?.email}</div>
          </div>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="w-full text-sm bg-slate-100 text-slate-700 py-1 px-3 rounded transition-colors hover:bg-slate-200"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Nav */}
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
            </h2>
            <div className="text-sm text-slate-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
