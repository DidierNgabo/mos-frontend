import { CalendarRange, Users, Package, Activity } from 'lucide-react';

export const metadata = { title: 'Dashboard — MOS' };

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">Welcome to the Medical Outreach Management System.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            label: 'Active Outreaches', 
            value: '—', 
            icon: Activity,
            color: 'from-blue-500/20 to-blue-500/5',
            textColor: 'text-blue-500',
            bg: 'bg-blue-500/10'
          },
          { 
            label: 'Upcoming Bookings', 
            value: '—', 
            icon: CalendarRange,
            color: 'from-emerald-500/20 to-emerald-500/5',
            textColor: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
          },
          { 
            label: 'Total Users',       
            value: '—', 
            icon: Users,
            color: 'from-violet-500/20 to-violet-500/5',
            textColor: 'text-violet-500',
            bg: 'bg-violet-500/10'
          },
          { 
            label: 'Packages',          
            value: '—', 
            icon: Package,
            color: 'from-orange-500/20 to-orange-500/5',
            textColor: 'text-orange-500',
            bg: 'bg-orange-500/10'
          },
        ].map(({ label, value, icon: Icon, color, textColor, bg }) => (
          <div
            key={label}
            className={`relative overflow-hidden rounded-2xl border border-border/50 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className={`p-3 rounded-xl ${bg} ${textColor} shadow-inner`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            
            <div className="relative z-10 mt-4">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <h3 className="text-3xl font-bold mt-1 tracking-tight">{value}</h3>
            </div>
            
            {/* Decorative background icon */}
            <Icon className={`absolute -right-4 -bottom-4 w-24 h-24 ${textColor} opacity-5 group-hover:opacity-10 transition-opacity duration-300 transform group-hover:scale-110`} />
          </div>
        ))}
      </div>

      {/* Placeholder for future charts or lists */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-2xl border border-border/50 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-6 shadow-sm min-h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 opacity-50" />
            Activity overview will appear here
          </p>
        </div>
        <div className="col-span-3 rounded-2xl border border-border/50 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-6 shadow-sm min-h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <CalendarRange className="w-4 h-4 opacity-50" />
            Upcoming schedule will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
