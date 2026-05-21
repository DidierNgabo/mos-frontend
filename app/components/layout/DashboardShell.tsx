/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { AuthSource } from '@/app/source';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { logoutUser } from '@/app/store/auth';
import {
  setActiveOutreach,
  clearOutreachContext,
} from '@/app/store/outreach-context';
import { fetchOutreaches } from '@/app/store/outreaches';
import { useIdleTimer } from 'react-idle-timer';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  CalendarRange,
  LogOut,
  Menu,
  X,
  Bell,
  UserRound,
  Building2,
  ShieldCheck,
  HeartPulse,
  ChevronDown,
  Check,
  Pill,
  ListOrdered,
  UsersRound,
  FileText,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { RoleGuard } from '@/app/components/auth/RoleGuard';
import { RoleType } from '@/app/utils/roleUtils';
import { useRole } from '@/app/hooks/useRole';

const navItems: {
  href: string;
  label: string;
  icon: any;
  allowedRoles?: RoleType[];
}[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    href: '/service-queue',
    label: 'Service Queue',
    icon: ListOrdered,
    allowedRoles: [
      'SUPER_ADMIN',
      'OUTREACH_ADMIN',
      'DATA_CLERK',
      'NURSE',
      'DOCTOR',
      'PHARMACIST',
    ],
  },
  {
    href: '/outreaches',
    label: 'Outreaches',
    icon: CalendarRange,
    allowedRoles: ['SUPER_ADMIN', 'OUTREACH_ADMIN'],
  },
  {
    href: '/patients',
    label: 'Patients',
    icon: UserRound,
    allowedRoles: ['SUPER_ADMIN', 'OUTREACH_ADMIN', 'DATA_CLERK'],
  },
  {
    href: '/stations',
    label: 'Stations',
    icon: Building2,
    allowedRoles: ['SUPER_ADMIN', 'OUTREACH_ADMIN'],
  },
  {
    href: '/teams',
    label: 'Teams',
    icon: UsersRound,
    allowedRoles: ['SUPER_ADMIN', 'OUTREACH_ADMIN', 'NURSE', 'DOCTOR', 'DATA_CLERK', 'PHARMACIST'],
  },
  {
    href: '/vital-signs',
    label: 'Vital Signs',
    icon: HeartPulse,
    allowedRoles: [
      'NURSE',
      'DOCTOR',
      'PHARMACIST',
      'OUTREACH_ADMIN',
      'SUPER_ADMIN',
    ],
  },
  {
    href: '/pharmacy',
    label: 'Pharmacy',
    icon: Pill,
    allowedRoles: [
      'PHARMACIST',
      'SUPER_ADMIN',
      'OUTREACH_ADMIN',
      'NURSE',
      'DOCTOR',
    ],
  },
  {
    href: '/users',
    label: 'Users',
    icon: Users,
    allowedRoles: ['SUPER_ADMIN', 'OUTREACH_ADMIN'],
  },
  {
    href: '/roles',
    label: 'Roles',
    icon: ShieldCheck,
    allowedRoles: ['SUPER_ADMIN', 'OUTREACH_ADMIN'],
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'OUTREACH_ADMIN'],
  },
];

function OutreachSelector() {
  const dispatch = useAppDispatch();
  const { activeOutreach, availableOutreaches } = useAppSelector(
    (s) => s.outreachContext,
  );
  const { list: allOutreaches, isLoadingOutreaches } = useAppSelector(
    (s) => s.outreaches,
  );
  const { user } = useAppSelector((s) => s.auth);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isAdmin = user?.roles?.some((r) =>
    ['SUPER_ADMIN', 'OUTREACH_ADMIN'].includes(r),
  );
  const options = isAdmin ? allOutreaches : availableOutreaches;
  const label =
    activeOutreach?.name ?? (isAdmin ? 'All Outreaches' : 'No Outreach');

  useEffect(() => {
    if (isAdmin && allOutreaches.length === 0 && !isLoadingOutreaches) {
      dispatch(fetchOutreaches({ limit: 100 }));
    }
  }, [isAdmin, allOutreaches.length, isLoadingOutreaches, dispatch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (
    o: { id: string; name: string; location: string; status: string } | null,
  ) => {
    dispatch(setActiveOutreach(o));
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <CalendarRange className="w-4 h-4 text-primary shrink-0" />
        <span className="text-sm font-semibold text-primary max-w-[180px] truncate">
          {label}
        </span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-primary transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-border bg-white dark:bg-black shadow-xl z-50 overflow-hidden">
          <div className="px-3 pt-3 pb-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isAdmin ? 'Switch Outreach' : 'Your Outreaches'}
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {isAdmin && (
              <button
                onClick={() => handleSelect(null)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
              >
                <div
                  className={cn(
                    'h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center shrink-0',
                    !activeOutreach && 'bg-primary',
                  )}
                >
                  {!activeOutreach && (
                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                  )}
                </div>
                <span className="text-sm font-medium">All Outreaches</span>
              </button>
            )}
            {options.map((o) => {
              const active = o.id === activeOutreach?.id;
              return (
                <button
                  key={o.id}
                  onClick={() => handleSelect(o)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
                >
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center shrink-0',
                      active && 'bg-primary',
                    )}
                  >
                    {active && (
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">
                      {o.name}
                    </p>
                    {o.location && (
                      <p className="text-xs text-muted-foreground truncate">
                        {o.location}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
            {options.length === 0 && (
              <p className="px-3 py-3 text-sm text-muted-foreground text-center">
                {isLoadingOutreaches ? 'Loading…' : 'No outreaches found.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useRole();
  const { isAuthenticated, user: authUser } = useAppSelector((s) => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (authUser?.mustChangePassword) {
      router.replace('/change-password');
    }
  }, [isAuthenticated, authUser?.mustChangePassword, router]);

  const handleSignOut = async () => {
    dispatch(clearOutreachContext());
    await dispatch(logoutUser());
    await AuthSource.logout();
    router.push('/login');
  };

  useIdleTimer({
    timeout: 30 * 60 * 1000, // 30 minutes
    onIdle: async () => {
      dispatch(clearOutreachContext());
      await dispatch(logoutUser());
      await AuthSource.logout();
      router.push('/login?reason=idle');
    },
    throttle: 500,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Decorative background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-white/60 dark:bg-black/40 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 px-6 shrink-0">
          <img
            src="/logo-full2.png"
            alt="Outreach Medical"
            style={{ height: 48, width: 'auto' }}
            className="object-contain"
          />
          <button
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Separator className="opacity-50 mx-4 w-auto" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Overview
          </div>
          {navItems.map(({ href, label, icon: Icon, allowedRoles }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);

            const LinkItem = (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-transform duration-200',
                    active ? 'scale-110' : 'group-hover:scale-110',
                  )}
                />
                {label}
              </Link>
            );

            if (allowedRoles) {
              return (
                <RoleGuard key={href} allowedRoles={allowedRoles}>
                  {LinkItem}
                </RoleGuard>
              );
            }

            return LinkItem;
          })}
        </nav>

        {/* User Profile & Sign out */}
        <div className="p-4 mt-auto">
          <div className="glass rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-secondary to-primary/30 flex items-center justify-center text-primary font-bold shadow-inner">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">
                  {user ? `${user.firstName} ${user.lastName}` : 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.roles?.[0] || 'Member'}
                </p>
              </div>
            </div>
            <Separator className="opacity-50" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        {/* Topbar */}
        <header className="flex h-20 items-center gap-4 border-b border-border/50 bg-white/40 dark:bg-black/20 backdrop-blur-md px-6 shrink-0 sticky top-0 z-20">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <OutreachSelector />

          <div className="flex-1 md:hidden" />

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
            </Button>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
