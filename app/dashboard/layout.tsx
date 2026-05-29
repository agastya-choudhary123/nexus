import { auth } from '@/auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect('/sign-in');
  }

  return <DashboardShell session={session}>{children}</DashboardShell>;
}
