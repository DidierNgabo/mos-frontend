'use client';

import { useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  ArrowRightLeft,
  FlaskConical,
  UserCheck,
  Activity,
  Stethoscope,
  Clock,
  AlertTriangle,
  Package,
  PackageX,
  ClipboardList,
  UserPlus,
  ListOrdered,
  Pill,
  ShieldAlert,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { fetchAdminStats, fetchMyStats } from '@/app/store/stats';
import { DoctorStats, ClerkStats, PharmacistStats } from '@/app/store/stats/stats.types';

const BRAND_GREEN = '#1D9E75';
const BRAND_BLUE = '#185FA5';
const GENDER_COLORS: Record<string, string> = {
  MALE: BRAND_BLUE,
  FEMALE: BRAND_GREEN,
  OTHER: '#888780',
};

const PHQ9_ORDER = ['NONE', 'MILD', 'MODERATE', 'MOD_SEVERE', 'SEVERE'];
const GAD7_ORDER = ['MINIMAL', 'MILD', 'MODERATE', 'SEVERE'];
const SEVERITY_COLORS: Record<string, string> = {
  NONE: '#86efac',
  MINIMAL: '#86efac',
  MILD: '#fbbf24',
  MODERATE: '#f97316',
  MOD_SEVERE: '#ef4444',
  SEVERE: '#7f1d1d',
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  textColor,
  bg,
  isLoading,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  textColor: string;
  bg: string;
  isLoading: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative z-10 flex items-center justify-between">
        <div className={`p-3 rounded-xl ${bg} ${textColor} shadow-inner`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="relative z-10 mt-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {isLoading ? (
          <div className="h-9 w-16 mt-1 rounded-lg bg-muted animate-pulse" />
        ) : (
          <h3 className="text-3xl font-bold mt-1 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
        )}
      </div>
      <Icon className={`absolute -right-4 -bottom-4 w-24 h-24 ${textColor} opacity-5 group-hover:opacity-10 transition-opacity duration-300 transform group-hover:scale-110`} />
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-6 shadow-sm">
      <p className="text-sm font-semibold text-foreground mb-4">{title}</p>
      {children}
    </div>
  );
}

function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-lg bg-muted animate-pulse"
      style={{ height }}
    />
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboardView() {
  const { adminStats, isLoading } = useAppSelector((s) => s.stats);

  const genderData = (adminStats?.genderBreakdown ?? []).map((g) => ({
    name: g.gender,
    value: g.count,
  }));

  const topDiagnosesData = (adminStats?.topDiagnoses ?? []).map((d) => ({
    name: d.diagnosis.length > 20 ? d.diagnosis.slice(0, 20) + '…' : d.diagnosis,
    count: d.count,
  }));

  const phq9Data = PHQ9_ORDER.map((sev) => {
    const entry = adminStats?.phq9Distribution?.find((d) => d.severity === sev);
    return { name: sev.replace('_', ' '), count: entry?.count ?? 0 };
  });

  const gad7Data = GAD7_ORDER.map((sev) => {
    const entry = adminStats?.gad7Distribution?.find((d) => d.severity === sev);
    return { name: sev, count: entry?.count ?? 0 };
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Patients Today" value={adminStats?.totalPatientsToday ?? 0} icon={UserCheck} color="from-emerald-500/20 to-emerald-500/5" textColor="text-emerald-600" bg="bg-emerald-500/10" isLoading={isLoading} />
        <StatCard label="Total Patients" value={adminStats?.totalPatientsOutreach ?? 0} icon={Users} color="from-blue-500/20 to-blue-500/5" textColor="text-blue-600" bg="bg-blue-500/10" isLoading={isLoading} />
        <StatCard label="Transfers" value={adminStats?.transfersCount ?? 0} icon={ArrowRightLeft} color="from-violet-500/20 to-violet-500/5" textColor="text-violet-600" bg="bg-violet-500/10" isLoading={isLoading} />
        <StatCard label="Abnormal Labs" value={adminStats?.abnormalLabsCount ?? 0} icon={FlaskConical} color="from-rose-500/20 to-rose-500/5" textColor="text-rose-600" bg="bg-rose-500/10" isLoading={isLoading} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <ChartCard title="Top Diagnoses">
            {isLoading ? <ChartSkeleton /> : topDiagnosesData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4 opacity-50" />No diagnosis data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topDiagnosesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill={BRAND_GREEN} radius={[4, 4, 0, 0]} name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="col-span-3">
          <ChartCard title="Gender Breakdown">
            {isLoading ? <ChartSkeleton /> : genderData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No patient data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" nameKey="name">
                    {genderData.map((entry, i) => (
                      <Cell key={i} fill={GENDER_COLORS[entry.name] ?? '#888780'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Patients']} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <ChartCard title="PHQ-9 Severity Distribution">
            {isLoading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={phq9Data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Patients" radius={[4, 4, 0, 0]}>
                    {phq9Data.map((entry, i) => (
                      <Cell key={i} fill={SEVERITY_COLORS[PHQ9_ORDER[i]] ?? BRAND_GREEN} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="col-span-3">
          <ChartCard title="GAD-7 Severity Distribution">
            {isLoading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={gad7Data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Patients" radius={[4, 4, 0, 0]}>
                    {gad7Data.map((entry, i) => (
                      <Cell key={i} fill={SEVERITY_COLORS[GAD7_ORDER[i]] ?? BRAND_GREEN} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

// ─── Doctor Dashboard ─────────────────────────────────────────────────────────

function DoctorDashboardView({ stats, isLoading }: { stats: DoctorStats | null; isLoading: boolean }) {
  const topDiagnosesData = (stats?.myTopDiagnoses ?? []).map((d) => ({
    name: d.diagnosis.length > 22 ? d.diagnosis.slice(0, 22) + '…' : d.diagnosis,
    count: d.count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Consultations Today" value={stats?.consultationsDoneToday ?? 0} icon={Stethoscope} color="from-emerald-500/20 to-emerald-500/5" textColor="text-emerald-600" bg="bg-emerald-500/10" isLoading={isLoading} />
        <StatCard label="Total Consultations" value={stats?.consultationsDoneOutreach ?? 0} icon={Users} color="from-blue-500/20 to-blue-500/5" textColor="text-blue-600" bg="bg-blue-500/10" isLoading={isLoading} />
        <StatCard label="Queue → Observation (min)" value={stats?.avgQueueToObservationMinutes ?? 0} icon={Clock} color="from-amber-500/20 to-amber-500/5" textColor="text-amber-600" bg="bg-amber-500/10" isLoading={isLoading} />
        <StatCard label="Follow-ups" value={stats?.followUpsRecommended ?? 0} icon={ClipboardList} color="from-violet-500/20 to-violet-500/5" textColor="text-violet-600" bg="bg-violet-500/10" isLoading={isLoading} />
        <StatCard label="Transfers Initiated" value={stats?.transfersInitiated ?? 0} icon={ArrowRightLeft} color="from-rose-500/20 to-rose-500/5" textColor="text-rose-600" bg="bg-rose-500/10" isLoading={isLoading} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <ChartCard title="My Top Diagnoses">
            {isLoading ? <ChartSkeleton /> : topDiagnosesData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4 opacity-50" />No consultations yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topDiagnosesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill={BRAND_BLUE} radius={[4, 4, 0, 0]} name="Cases" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="col-span-3">
          <ChartCard title="Forms Completed This Outreach">
            {isLoading ? <ChartSkeleton height={220} /> : (
              <div className="grid grid-cols-1 gap-4 mt-2">
                {[
                  { label: 'PHQ-9 Screenings', value: stats?.formsCompleted.phq9 ?? 0, color: 'bg-emerald-500' },
                  { label: 'GAD-7 Screenings', value: stats?.formsCompleted.gad7 ?? 0, color: 'bg-blue-500' },
                  { label: 'Lab Results', value: stats?.formsCompleted.labs ?? 0, color: 'bg-violet-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-2xl font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <StatCard label="Active Queue (Outreach)" value={stats?.activeQueuePatientsOutreach ?? 0} icon={ListOrdered} color="from-cyan-500/20 to-cyan-500/5" textColor="text-cyan-600" bg="bg-cyan-500/10" isLoading={isLoading} />
        <StatCard label="Abnormal Vitals Flagged" value={stats?.abnormalVitalsFlagged ?? 0} icon={AlertTriangle} color="from-orange-500/20 to-orange-500/5" textColor="text-orange-600" bg="bg-orange-500/10" isLoading={isLoading} />
      </div>
    </div>
  );
}

// ─── Clerk Dashboard ──────────────────────────────────────────────────────────

function ClerkDashboardView({ stats, isLoading }: { stats: ClerkStats | null; isLoading: boolean }) {
  const genderData = (stats?.genderBreakdown ?? []).map((g) => ({ name: g.gender, value: g.count }));
  const ageData = (stats?.ageGroups ?? []).map((a) => ({ name: a.ageGroup, count: a.count }));
  const hourData = stats?.patientRegistrationsPerHour ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Patients Registered Today" value={stats?.patientsRegisteredToday ?? 0} icon={UserPlus} color="from-emerald-500/20 to-emerald-500/5" textColor="text-emerald-600" bg="bg-emerald-500/10" isLoading={isLoading} />
        <StatCard label="Patients Registered" value={stats?.patientsRegisteredInPeriod ?? 0} icon={Users} color="from-blue-500/20 to-blue-500/5" textColor="text-blue-600" bg="bg-blue-500/10" isLoading={isLoading} />
        <StatCard label="Enqueued" value={stats?.enqueuedCount ?? 0} icon={ListOrdered} color="from-violet-500/20 to-violet-500/5" textColor="text-violet-600" bg="bg-violet-500/10" isLoading={isLoading} />
        <StatCard label="Pending Enqueue" value={stats?.pendingEnqueue ?? 0} icon={ClipboardList} color="from-amber-500/20 to-amber-500/5" textColor="text-amber-600" bg="bg-amber-500/10" isLoading={isLoading} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <ChartCard title="Registrations Per Hour (Today)">
            {isLoading ? <ChartSkeleton /> : hourData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No registrations today yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={hourData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke={BRAND_GREEN} fill="#E1F5EE" name="Registrations" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="col-span-3">
          <ChartCard title="Gender Breakdown">
            {isLoading ? <ChartSkeleton /> : genderData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No patient data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" nameKey="name">
                    {genderData.map((entry, i) => (
                      <Cell key={i} fill={GENDER_COLORS[entry.name] ?? '#888780'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Patients']} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <ChartCard title="Age Group Breakdown">
            {isLoading ? <ChartSkeleton /> : ageData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ageData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill={BRAND_BLUE} radius={[4, 4, 0, 0]} name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="col-span-3">
          <ChartCard title="Queue Priority Breakdown">
            {isLoading ? <ChartSkeleton height={200} /> : (
              <div className="grid grid-cols-1 gap-4 mt-2">
                {[
                  { label: 'Normal', value: stats?.priorityAssignments.normal ?? 0, color: 'bg-emerald-500', text: 'text-emerald-600' },
                  { label: 'Urgent', value: stats?.priorityAssignments.urgent ?? 0, color: 'bg-amber-500', text: 'text-amber-600' },
                  { label: 'Emergency', value: stats?.priorityAssignments.emergency ?? 0, color: 'bg-rose-500', text: 'text-rose-600' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className={`text-2xl font-bold ${item.text}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

// ─── Pharmacist Dashboard ─────────────────────────────────────────────────────

function PharmacistDashboardView({ stats, isLoading }: { stats: PharmacistStats | null; isLoading: boolean }) {
  const topMedsData = (stats?.topDispensedMedications ?? []).map((m) => ({
    name: m.medicationName.length > 18 ? m.medicationName.slice(0, 18) + '…' : m.medicationName,
    count: m.totalDispensed,
  }));
  const consumptionData = stats?.stockConsumptionByDay ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Units Dispensed Today" value={stats?.unitsDispensedToday ?? 0} icon={Pill} color="from-emerald-500/20 to-emerald-500/5" textColor="text-emerald-600" bg="bg-emerald-500/10" isLoading={isLoading} />
        <StatCard label="Patients Served" value={stats?.uniquePatientsServed ?? 0} icon={Users} color="from-blue-500/20 to-blue-500/5" textColor="text-blue-600" bg="bg-blue-500/10" isLoading={isLoading} />
        <StatCard label="Low Stock Items" value={stats?.lowStockItems.length ?? 0} icon={Package} color="from-amber-500/20 to-amber-500/5" textColor="text-amber-600" bg="bg-amber-500/10" isLoading={isLoading} />
        <StatCard label="Out of Stock" value={stats?.outOfStockItems.length ?? 0} icon={PackageX} color="from-rose-500/20 to-rose-500/5" textColor="text-rose-600" bg="bg-rose-500/10" isLoading={isLoading} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <ChartCard title="Top Dispensed Medications">
            {isLoading ? <ChartSkeleton /> : topMedsData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No dispensing data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topMedsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill={BRAND_GREEN} radius={[4, 4, 0, 0]} name="Units" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="col-span-3">
          <ChartCard title="Stock Consumption (Last 7 Days)">
            {isLoading ? <ChartSkeleton /> : consumptionData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={consumptionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="totalDispensed" stroke={BRAND_BLUE} fill="#E8F0FB" name="Units" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Low stock alerts */}
      {!isLoading && (stats?.lowStockItems.length ?? 0) > 0 && (
        <ChartCard title="Low Stock Alerts">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats!.lowStockItems.map((item) => {
              const pct = Math.round((item.quantityInStock / item.threshold) * 100);
              const urgency = item.quantityInStock <= item.threshold * 0.3
                ? 'border-rose-200 bg-rose-50 dark:bg-rose-950/20'
                : 'border-amber-200 bg-amber-50 dark:bg-amber-950/20';
              return (
                <div key={item.medicationName} className={`rounded-xl border p-4 ${urgency}`}>
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{item.medicationName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.quantityInStock} remaining · threshold {item.threshold} · {pct}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      )}
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const activeOutreach = useAppSelector((s) => s.outreachContext.activeOutreach);
  const { myStats, isLoading } = useAppSelector((s) => s.stats);

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') ?? false;
  const isDoctor = user?.roles?.includes('DOCTOR') ?? false;
  const isDataClerk = user?.roles?.includes('DATA_CLERK') ?? false;
  const isPharmacist = user?.roles?.includes('PHARMACIST') ?? false;

  useEffect(() => {
    if (!activeOutreach?.id) return;
    if (isSuperAdmin) {
      dispatch(fetchAdminStats(activeOutreach.id));
    } else if (isDoctor || isDataClerk || isPharmacist) {
      dispatch(fetchMyStats(activeOutreach.id));
    }
  }, [dispatch, isSuperAdmin, isDoctor, isDataClerk, isPharmacist, activeOutreach?.id]);

  if (!activeOutreach) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground mt-1">Select an outreach to view statistics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground mt-1">
            {activeOutreach.name} &mdash; {activeOutreach.location}
          </p>
        </div>
      </div>

      {isSuperAdmin && <AdminDashboardView />}
      {isDoctor && <DoctorDashboardView stats={myStats as import('@/app/store/stats/stats.types').DoctorStats | null} isLoading={isLoading} />}
      {isDataClerk && <ClerkDashboardView stats={myStats as import('@/app/store/stats/stats.types').ClerkStats | null} isLoading={isLoading} />}
      {isPharmacist && <PharmacistDashboardView stats={myStats as import('@/app/store/stats/stats.types').PharmacistStats | null} isLoading={isLoading} />}
    </div>
  );
}
